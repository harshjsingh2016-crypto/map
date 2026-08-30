// Map server: watches boards/*.board.jsonl and pushes batches to the React
// client over SSE. Handles truncation (undo) via reset events, board
// list/active-pointer changes, and Windows-reliable append detection.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import chokidar from 'chokidar'
import {
  splitCompleteLines, listBoards, getActiveBoard, getActiveFolder,
  boardsDir, boardPath, BOARD_EXT,
} from '../shared/log.mjs'
import { parseLogLine } from '../shared/ops.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BOARDS = boardsDir(ROOT)
// Dedicated var: PORT is often set by dev harnesses for the web port, and
// the API server must not collide with Vite.
const PORT = process.env.MAP_SERVER_PORT || 5175
// Heartbeat interval; the client's stall watchdog is a small multiple of this.
const PING_MS = 4000

fs.mkdirSync(BOARDS, { recursive: true })

// ---------------------------------------------------------------------------
// Per-board incremental log reader with truncation detection.
// ---------------------------------------------------------------------------
class BoardReader {
  constructor(file) {
    this.file = file
    this.offset = 0        // bytes consumed
    this.carry = ''        // partial trailing line buffer
    this.lineNo = 0        // complete lines consumed (for error messages)
    this.lastBatchId = 0
    this.entries = []      // parsed entries (batches + snapshots) in order
    this.errors = []       // parse errors, with line numbers
  }

  /** Read from current offset. Returns { newEntries, reset } */
  consume() {
    let stat
    try {
      stat = fs.statSync(this.file)
    } catch {
      return { newEntries: [], reset: false, missing: true }
    }
    let reset = false
    if (stat.size < this.offset) {
      // File shrank — undo/rewrite. Full re-read.
      this.offset = 0
      this.carry = ''
      this.lineNo = 0
      this.lastBatchId = 0
      this.entries = []
      this.errors = []
      reset = true
    }
    if (stat.size === this.offset) return { newEntries: [], reset }

    const fd = fs.openSync(this.file, 'r')
    let chunk
    try {
      const buf = Buffer.alloc(stat.size - this.offset)
      fs.readSync(fd, buf, 0, buf.length, this.offset)
      chunk = buf.toString('utf8')
    } finally {
      fs.closeSync(fd)
    }
    this.offset = stat.size

    const { lines, rest } = splitCompleteLines(this.carry, chunk)
    this.carry = rest
    const newEntries = []
    for (const line of lines) {
      this.lineNo++
      try {
        const entry = parseLogLine(line, this.lineNo)
        // batchId regression without size shrink = rewrite we missed → reset
        if (entry.data.batchId <= this.lastBatchId && this.lastBatchId > 0 && entry.type === 'batch') {
          return this.reread()
        }
        this.lastBatchId = Math.max(this.lastBatchId, entry.data.batchId)
        this.entries.push(entry)
        newEntries.push(entry)
      } catch (e) {
        this.errors.push(e.message)
        newEntries.push({ type: 'error', message: e.message })
      }
    }
    return { newEntries, reset }
  }

  reread() {
    this.offset = 0
    this.carry = ''
    this.lineNo = 0
    this.lastBatchId = 0
    this.entries = []
    this.errors = []
    const { newEntries } = this.consume()
    return { newEntries, reset: true }
  }
}

const readers = new Map() // board name -> BoardReader

function readerFor(id) {
  if (!readers.has(id)) {
    const r = new BoardReader(boardPath(ROOT, id))
    r.consume() // initial full read
    readers.set(id, r)
  }
  return readers.get(id)
}

/** Map a watched file path to its board id ("<folder>/<name>"). */
function idForFile(file) {
  const rel = path.relative(BOARDS, file).split(path.sep)
  const base = rel.pop()
  if (!base.endsWith(BOARD_EXT)) return null
  const name = base.slice(0, -BOARD_EXT.length)
  return rel.length ? `${rel.join('/')}/${name}` : name
}

// ---------------------------------------------------------------------------
// SSE clients
// ---------------------------------------------------------------------------
let clients = [] // { res, board }

function sendEvent(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}

function broadcast(event, data, boardFilter) {
  let sent = 0
  for (const c of clients) {
    if (boardFilter && c.board !== boardFilter) continue
    sendEvent(c.res, event, data)
    sent++
  }
  return sent
}

function boardsPayload() {
  return {
    boards: listBoards(ROOT),          // [{ id, folder, name }]
    active: getActiveBoard(ROOT),      // "<folder>/<name>"
    folder: getActiveFolder(ROOT),     // working folder
  }
}

// ---------------------------------------------------------------------------
// Watcher — Windows-tuned: polling fallback keeps append detection reliable;
// low awaitWriteFinish threshold keeps latency inside the speed goal.
// ---------------------------------------------------------------------------
const watcher = chokidar.watch(BOARDS, {
  usePolling: process.platform === 'win32' || process.env.MAP_POLL === '1',
  interval: 80,
  awaitWriteFinish: { stabilityThreshold: 60, pollInterval: 20 },
  ignoreInitial: true,
})

function handleFileEvent(file) {
  const base = path.basename(file)
  if (base === '.active' || base === '.folder') {
    broadcast('boards', boardsPayload())
    return
  }
  const id = idForFile(file)
  if (!id) return
  const reader = readerFor(id)
  const { newEntries, reset } = reader.consume()
  if (reset) {
    broadcast('reset', { board: id }, id)
    broadcast('init', { board: id, entries: reader.entries, errors: reader.errors }, id)
    return
  }
  for (const entry of newEntries) {
    if (entry.type === 'error') broadcast('logerror', { board: id, message: entry.message }, id)
    else broadcast(entry.type === 'snapshot' ? 'snapshot' : 'batch', { board: id, entry }, id)
  }
}

watcher
  .on('add', (f) => { handleFileEvent(f); if (f.endsWith(BOARD_EXT)) broadcast('boards', boardsPayload()) })
  .on('change', handleFileEvent)
  .on('addDir', () => broadcast('boards', boardsPayload()))
  .on('unlinkDir', () => broadcast('boards', boardsPayload()))
  .on('unlink', (f) => {
    const id = idForFile(f)
    if (id) {
      readers.delete(id)
      broadcast('boards', boardsPayload())
    }
  })

// ---------------------------------------------------------------------------
// HTTP API
// ---------------------------------------------------------------------------
const app = express()
app.use(express.json({ limit: '8kb' }))

app.get('/api/boards', (req, res) => {
  res.json(boardsPayload())
})

// Camera control, deliberately NOT an op. The board log is append-only
// content: a view command written there would replay on every load and
// permanently pollute the board's history. This is ephemeral — fanned out to
// whoever is watching that board right now, and remembered nowhere.
const VIEW_ACTIONS = new Set(['latest', 'back', 'forward', 'fit', 'focus'])
let viewSeq = 0

app.post('/api/view', (req, res) => {
  const board = String(req.body?.board || '')
  const action = String(req.body?.action || '')
  const target = req.body?.target == null ? null : String(req.body.target)
  const count = Number.isInteger(req.body?.count) ? req.body.count : 1
  if (!board) return res.status(400).json({ error: 'board is required' })
  if (!VIEW_ACTIONS.has(action)) {
    return res.status(400).json({ error: `unknown view action "${action}" — expected one of ${[...VIEW_ACTIONS].join(', ')}` })
  }
  if (action === 'focus' && !target) {
    return res.status(400).json({ error: 'focus needs a target widget or node id' })
  }
  if (count < 1 || count > 100) return res.status(400).json({ error: 'count must be between 1 and 100' })
  const delivered = broadcast('view', { board, action, target, count, seq: ++viewSeq }, board)
  res.json({ ok: true, delivered })
})

app.get('/api/events', (req, res) => {
  const board = String(req.query.board || '')
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  })
  const client = { res, board }
  clients.push(client)

  sendEvent(res, 'boards', boardsPayload())
  if (board) {
    const reader = readerFor(board)
    // Client may reconnect after server restart/sleep — always send a full
    // init so it never resumes blind.
    sendEvent(res, 'init', { board, entries: reader.entries, errors: reader.errors })
  }

  // A named event, not a `:` comment — EventSource exposes events to the page
  // but silently swallows comments, and the client needs to see the heartbeat
  // to detect a stalled stream (a dead upstream behind a proxy that holds the
  // socket open looks identical to an idle one otherwise).
  const ping = setInterval(() => sendEvent(res, 'ping', { t: Date.now() }), PING_MS)
  req.on('close', () => {
    clearInterval(ping)
    clients = clients.filter((c) => c !== client)
  })
})

// Serve the built app if dist/ exists (production mode).
const dist = path.join(ROOT, 'dist')
if (fs.existsSync(dist)) {
  app.use(express.static(dist))
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')))
}

app.listen(PORT, () => {
  console.log(`[map] server on http://localhost:${PORT} — watching ${BOARDS}`)
})
