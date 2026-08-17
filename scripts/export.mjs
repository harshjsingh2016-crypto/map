#!/usr/bin/env node
// Export a board as a shareable, zoomable vector PDF.
//   node scripts/export.mjs                          # the active board
//   node scripts/export.mjs --board <folder/name>
//   node scripts/export.mjs --board <name> --theme light   # print-friendly
//   node scripts/export.mjs --all                    # every board
//
// Output lands in pdfs/<folder>/<name>.pdf.
//
// The board is printed at zoom 1 (natural size) and the PDF page is sized to
// the content's real bounding box. Two reasons: nothing is downscaled, so text
// and 2px borders stay exact; and React Flow's SVG edge labels carry an
// absolute font-size that does not survive a scaled print pass — at zoom 1
// there is no scale for it to survive.
//
// Needs the dev server running (npm run dev).
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { getActiveBoard, listBoards, resolveBoardId, parseBoardId } from '../shared/log.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const arg = (name, def) => {
  const i = argv.indexOf(`--${name}`)
  return i > -1 ? argv[i + 1] : def
}
const has = (name) => argv.includes(`--${name}`)

const URL_BASE = arg('url', 'http://localhost:5173')
const THEME = arg('theme', null)          // force 'light' for paper-friendly output
const PAD = parseInt(arg('pad', '48'), 10)
const WAIT = parseInt(arg('wait', '4000'), 10)
// resolve, not join: an absolute --outdir should be honoured as given.
const OUT_DIR = path.resolve(ROOT, arg('outdir', 'pdfs'))

const die = (msg) => { console.error(`ERROR: ${msg}`); process.exit(1) }

// PDF pages top out at 200in a side; the board would have to be enormous to
// hit this, but a silently clipped export is worse than a clear failure.
const MAX_IN = 200

let targets = []
if (has('all')) {
  targets = listBoards(ROOT).map((b) => b.id)
  if (!targets.length) die('no boards found')
} else {
  const input = arg('board', null)
  let id = null
  if (input) {
    const { id: hit, matches } = resolveBoardId(ROOT, input)
    if (!hit && matches.length > 1) {
      die(`"${input}" is ambiguous — ${matches.map((m) => m.id).join(', ')}`)
    }
    if (!hit) die(`board not found: ${input}`)
    id = hit
  } else {
    id = getActiveBoard(ROOT)
  }
  if (!id) die('no active board — pass --board <folder/name>')
  targets = [id]
}

const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((p) => fs.existsSync(p))
if (!CHROME) die('no Chrome/Edge found')

// Fail fast with a clear message rather than exporting a blank page.
try {
  const r = await fetch(URL_BASE, { method: 'GET' })
  if (!r.ok) throw new Error(String(r.status))
} catch {
  die(`dev server not reachable at ${URL_BASE} — start it with: npm run dev`)
}

const PORT = 9300 + Math.floor(Math.random() * 400)
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'mapexport-'))
const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars',
  '--no-first-run', '--no-default-browser-check',
  `--user-data-dir=${profile}`, `--remote-debugging-port=${PORT}`,
  '--window-size=1600,1000', 'about:blank',
], { stdio: 'ignore' })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getJSON(url) {
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(url); if (r.ok) return await r.json() } catch { /* not up */ }
    await sleep(250)
  }
  throw new Error('chrome devtools endpoint never came up')
}

let msgId = 0
function rpc(ws, method, params = {}) {
  const id = ++msgId
  return new Promise((resolve, reject) => {
    const onMsg = (ev) => {
      const m = JSON.parse(ev.data)
      if (m.id !== id) return
      ws.removeEventListener('message', onMsg)
      m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result)
    }
    ws.addEventListener('message', onMsg)
    ws.send(JSON.stringify({ id, method, params }))
  })
}

async function evaluate(ws, expression) {
  const r = await rpc(ws, 'Runtime.evaluate', {
    expression, returnByValue: true, awaitPromise: true,
  })
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'eval failed')
  return r.result.value
}

/** Strip app chrome, pin the viewport at zoom 1, report the page size needed. */
const PREPARE = (pad) => `(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms))
  for (let i = 0; i < 60 && !window.__mapExport; i++) await sleep(250)
  if (!window.__mapExport) return { error: 'export handle never appeared' }
  const { rf } = window.__mapExport

  for (let i = 0; i < 60 && !rf.getNodes().length; i++) await sleep(250)
  const nodes = rf.getNodes()
  if (!nodes.length) return { error: 'board has no content' }

  // Screen-only chrome has no place in an export. The app shell keeps its
  // height:100% flex layout — the emulated viewport is resized to the page
  // instead, so the canvas still has a height to fill.
  for (const sel of ['.topbar', '.banner', '.react-flow__controls',
                     '.react-flow__minimap', '.react-flow__attribution']) {
    document.querySelectorAll(sel).forEach(el => el.remove())
  }

  // Only top-level nodes (widget frames and cards) carry board coordinates;
  // children are positioned relative to their parent, so including them would
  // skew the box. A frame already spans everything inside it.
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const n of nodes) {
    if (n.parentId) continue
    const w = n.measured?.width ?? n.width ?? 0
    const h = n.measured?.height ?? n.height ?? 0
    minX = Math.min(minX, n.position.x)
    minY = Math.min(minY, n.position.y)
    maxX = Math.max(maxX, n.position.x + w)
    maxY = Math.max(maxY, n.position.y + h)
  }
  if (!isFinite(minX)) return { error: 'could not measure board bounds' }

  const pad = ${pad}
  const width = Math.ceil(maxX - minX + pad * 2)
  const height = Math.ceil(maxY - minY + pad * 2)
  rf.setViewport({ x: pad - minX, y: pad - minY, zoom: 1 })
  return { width, height, x: minX, y: minY, nodes: nodes.length }
})()`

function outPathFor(id) {
  const { folder, name } = parseBoardId(id)
  const dir = folder ? path.join(OUT_DIR, folder) : OUT_DIR
  fs.mkdirSync(dir, { recursive: true })
  return path.join(dir, `${name}.pdf`)
}

try {
  const list = await getJSON(`http://127.0.0.1:${PORT}/json/list`)
  const page = list.find((t) => t.type === 'page')
  const ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((r, j) => { ws.addEventListener('open', r); ws.addEventListener('error', j) })
  await rpc(ws, 'Page.enable')

  for (const id of targets) {
    await rpc(ws, 'Emulation.setDeviceMetricsOverride', {
      width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false,
    })
    const url = `${URL_BASE}/?board=${encodeURIComponent(id)}` +
      (THEME ? `&theme=${encodeURIComponent(THEME)}` : '')
    await rpc(ws, 'Page.navigate', { url })
    await sleep(WAIT)

    const prep = await evaluate(ws, PREPARE(PAD))
    if (!prep || prep.error) { console.error(`SKIPPED ${id}: ${prep?.error || 'prepare failed'}`); continue }

    const wIn = prep.width / 96
    const hIn = prep.height / 96
    if (wIn > MAX_IN || hIn > MAX_IN) {
      console.error(`SKIPPED ${id}: board is ${wIn.toFixed(0)}x${hIn.toFixed(0)}in, over the ${MAX_IN}in PDF page limit`)
      continue
    }

    // Re-size the window to the content so nothing lazily unmounts off-screen,
    // then let React Flow re-measure at the new size before printing.
    await rpc(ws, 'Emulation.setDeviceMetricsOverride', {
      width: prep.width, height: prep.height, deviceScaleFactor: 1, mobile: false,
    })
    await sleep(900)
    // Resizing the window re-runs React Flow's fit logic; restore the pinned
    // viewport so the content sits exactly inside the padding.
    await evaluate(ws, `window.__mapExport.rf.setViewport(${JSON.stringify({
      x: PAD - prep.x, y: PAD - prep.y, zoom: 1,
    })}), true`)
    await sleep(400)

    const pdf = await rpc(ws, 'Page.printToPDF', {
      printBackground: true,
      paperWidth: wIn,
      paperHeight: hIn,
      marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
      preferCSSPageSize: false,
    })

    const out = outPathFor(id)
    fs.writeFileSync(out, Buffer.from(pdf.data, 'base64'))
    const kb = Math.round(fs.statSync(out).size / 1024)
    console.log(`${id} -> ${path.relative(ROOT, out)}  (${prep.width}x${prep.height}px, ${kb} KB, ${prep.nodes} nodes)`)
  }

  ws.close()
} finally {
  chrome.kill()
  try { fs.rmSync(profile, { recursive: true, force: true }) } catch { /* best effort */ }
}
