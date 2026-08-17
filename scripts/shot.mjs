#!/usr/bin/env node
// Screenshot + DOM-probe the running board in a real (headless) browser.
// The in-editor preview pane never composites, so ResizeObserver-driven
// measurement (React Flow) can't be verified there — this can.
//   node scripts/shot.mjs [--url http://localhost:5173] [--out shot.png]
//                         [--wait 3500] [--eval "expr"] [--width 1800] [--height 1150]
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const argv = process.argv.slice(2)
const arg = (name, def) => {
  const i = argv.indexOf(`--${name}`)
  return i > -1 ? argv[i + 1] : def
}

const URL_ = arg('url', 'http://localhost:5173')
const OUT = arg('out', 'shot.png')
const WAIT = parseInt(arg('wait', '3500'), 10)
const WIDTH = parseInt(arg('width', '1800'), 10)
const HEIGHT = parseInt(arg('height', '1150'), 10)
const EVAL = arg('eval', null)
const PORT = 9222 + Math.floor(Math.random() * 400)

const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].find((p) => fs.existsSync(p))
if (!CHROME) { console.error('no Chrome/Edge found'); process.exit(1) }

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'mapshot-'))
const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--no-first-run',
  '--no-default-browser-check',
  `--user-data-dir=${profile}`,
  `--remote-debugging-port=${PORT}`,
  `--window-size=${WIDTH},${HEIGHT}`,
  'about:blank',
], { stdio: 'ignore' })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getJSON(url) {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(url)
      if (r.ok) return await r.json()
    } catch { /* not up yet */ }
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

try {
  const targets = await getJSON(`http://127.0.0.1:${PORT}/json/list`)
  const page = targets.find((t) => t.type === 'page')
  const ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((r, j) => { ws.addEventListener('open', r); ws.addEventListener('error', j) })

  await rpc(ws, 'Page.enable')
  await rpc(ws, 'Emulation.setDeviceMetricsOverride', {
    width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false,
  })
  await rpc(ws, 'Page.navigate', { url: URL_ })
  await sleep(WAIT)

  if (EVAL) {
    const r = await rpc(ws, 'Runtime.evaluate', {
      expression: EVAL, returnByValue: true, awaitPromise: true,
    })
    console.log(typeof r.result.value === 'string' ? r.result.value : JSON.stringify(r.result.value))
  }

  const shot = await rpc(ws, 'Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  fs.writeFileSync(OUT, Buffer.from(shot.data, 'base64'))
  console.log(`wrote ${OUT}`)
  ws.close()
} finally {
  chrome.kill()
  try { fs.rmSync(profile, { recursive: true, force: true }) } catch { /* best effort */ }
}
