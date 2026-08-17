// Log file helpers: complete-line splitting (a watch event can fire
// mid-write, so partial trailing lines are buffered), file reading, and
// board-name utilities. Used by server and scripts.
import fs from 'node:fs'
import path from 'node:path'
import { parseLogLine } from './ops.mjs'

export const BOARD_EXT = '.board.jsonl'
export const DEFAULT_FOLDER = 'default'

// Boards live one folder deep: boards/<folder>/<name>.board.jsonl.
// A board is identified everywhere by its id, "<folder>/<name>".
export function boardsDir(root) {
  return path.join(root, 'boards')
}

export function parseBoardId(id) {
  const parts = String(id || '').split('/').filter(Boolean)
  if (parts.length >= 2) return { folder: parts[0], name: parts.slice(1).join('-') }
  return { folder: null, name: parts[0] || '' }
}

export function boardId(folder, name) {
  return `${folder}/${name}`
}

export function boardPath(root, id) {
  const { folder, name } = parseBoardId(id)
  return folder
    ? path.join(boardsDir(root), folder, `${name}${BOARD_EXT}`)
    : path.join(boardsDir(root), `${name}${BOARD_EXT}`)
}

export function listFolders(root) {
  const dir = boardsDir(root)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
    .map((e) => e.name)
    .sort()
}

/** All boards as { id, folder, name }, folder-major then name. */
export function listBoards(root) {
  const dir = boardsDir(root)
  if (!fs.existsSync(dir)) return []
  const out = []
  // Loose boards at the root are still readable (pre-folder layout).
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith(BOARD_EXT)) {
      const name = f.slice(0, -BOARD_EXT.length)
      out.push({ id: name, folder: null, name })
    }
  }
  for (const folder of listFolders(root)) {
    for (const f of fs.readdirSync(path.join(dir, folder))) {
      if (!f.endsWith(BOARD_EXT)) continue
      const name = f.slice(0, -BOARD_EXT.length)
      out.push({ id: boardId(folder, name), folder, name })
    }
  }
  return out.sort((a, b) =>
    (a.folder || '').localeCompare(b.folder || '') || a.name.localeCompare(b.name))
}

/**
 * Accepts "folder/name" or a bare "name". A bare name resolves only if it is
 * unique across folders; otherwise the caller gets the candidate list so it
 * can print a useful error instead of guessing.
 */
export function resolveBoardId(root, input) {
  const boards = listBoards(root)
  const { folder, name } = parseBoardId(input)
  if (folder) {
    const hit = boards.find((b) => b.folder === folder && b.name === name)
    return { id: hit?.id || null, matches: hit ? [hit] : [] }
  }
  const matches = boards.filter((b) => b.name === name)
  return { id: matches.length === 1 ? matches[0].id : null, matches }
}

export function getActiveBoard(root) {
  const p = path.join(boardsDir(root), '.active')
  try {
    const id = fs.readFileSync(p, 'utf8').trim()
    return id || null
  } catch {
    return null
  }
}

export function getActiveFolder(root) {
  const active = getActiveBoard(root)
  if (active) {
    const { folder } = parseBoardId(active)
    if (folder) return folder
  }
  const p = path.join(boardsDir(root), '.folder')
  try {
    const f = fs.readFileSync(p, 'utf8').trim()
    return f || null
  } catch {
    return null
  }
}

export function setActiveBoard(root, id) {
  fs.mkdirSync(boardsDir(root), { recursive: true })
  fs.writeFileSync(path.join(boardsDir(root), '.active'), id, 'utf8')
  const { folder } = parseBoardId(id)
  if (folder) fs.writeFileSync(path.join(boardsDir(root), '.folder'), folder, 'utf8')
}

/** Set the working folder without pointing at a specific board. */
export function setActiveFolder(root, folder) {
  fs.mkdirSync(path.join(boardsDir(root), folder), { recursive: true })
  fs.writeFileSync(path.join(boardsDir(root), '.folder'), folder, 'utf8')
}

/**
 * Split a text chunk into complete newline-terminated lines plus the
 * partial remainder. `carry` is the unconsumed tail from the previous chunk.
 */
export function splitCompleteLines(carry, chunk) {
  const text = carry + chunk
  const lines = []
  let start = 0
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '\n') {
      const line = text.slice(start, i).replace(/\r$/, '')
      if (line.trim()) lines.push(line)
      start = i + 1
    }
  }
  return { lines, rest: text.slice(start) }
}

/**
 * Read and parse a full board log file. Returns { entries, errors, lastBatchId }.
 * Only complete newline-terminated lines are consumed; a trailing partial
 * line (mid-write) is ignored. Unknown versions / bad lines produce errors
 * with line numbers rather than throwing.
 */
export function readBoardLog(file) {
  let text = ''
  try {
    text = fs.readFileSync(file, 'utf8')
  } catch {
    return { entries: [], errors: [`board file not found: ${file}`], lastBatchId: 0, exists: false }
  }
  // splitCompleteLines only returns newline-terminated lines; a trailing
  // partial line (mid-write) stays in `rest` and is ignored here.
  const { lines: complete } = splitCompleteLines('', text)
  const entries = []
  const errors = []
  let lastBatchId = 0
  complete.forEach((line, i) => {
    try {
      const entry = parseLogLine(line, i + 1)
      entries.push(entry)
      if (entry.data.batchId > lastBatchId) lastBatchId = entry.data.batchId
    } catch (e) {
      errors.push(e.message)
    }
  })
  return { entries, errors, lastBatchId, exists: true }
}
