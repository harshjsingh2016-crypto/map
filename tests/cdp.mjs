// Minimal Chrome DevTools Protocol driver (no dependencies).
// Node 24 ships a global WebSocket, so this needs nothing installed.
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
]

export async function launch({ width = 1800, height = 1150 } = {}) {
  const bin = CHROME_PATHS.find((p) => fs.existsSync(p))
  if (!bin) throw new Error('no Chrome/Edge found')
  const port = 9300 + Math.floor(Math.random() * 600)
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'mapcdp-'))
  const proc = spawn(bin, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars',
    '--no-first-run', '--no-default-browser-check',
    `--user-data-dir=${profile}`, `--remote-debugging-port=${port}`,
    `--window-size=${width},${height}`, 'about:blank',
  ], { stdio: 'ignore' })

  let targets = null
  for (let i = 0; i < 60 && !targets; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/json/list`)
      if (r.ok) targets = await r.json()
    } catch { await sleep(250) }
  }
  if (!targets) throw new Error('devtools endpoint never came up')

  const page = targets.find((t) => t.type === 'page')
  const ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej) })

  let msgId = 0
  const rpc = (method, params = {}) => {
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

  await rpc('Page.enable')
  await rpc('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false })

  return {
    rpc,
    async goto(url, waitMs = 4000) {
      await rpc('Page.navigate', { url })
      await sleep(waitMs)
    },
    async eval(expression) {
      const r = await rpc('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'eval failed')
      return r.result.value
    },
    async screenshot(out) {
      const s = await rpc('Page.captureScreenshot', { format: 'png' })
      fs.writeFileSync(out, Buffer.from(s.data, 'base64'))
    },
    close() {
      try { ws.close() } catch { /* ignore */ }
      proc.kill()
      try { fs.rmSync(profile, { recursive: true, force: true }) } catch { /* ignore */ }
    },
  }
}
