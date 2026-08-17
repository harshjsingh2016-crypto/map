#!/usr/bin/env node
// Verifies the client survives an API-server restart: it shows a
// reconnecting banner, then replays to the correct state (never resumes blind).
// Manages its own server process, so run this with ONLY vite running
// (npx vite), not the combined `npm run dev`.
//   node tests/reconnect.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn, execFileSync } from 'node:child_process'
import { launch, sleep } from './cdp.mjs'
import { boardPath } from '../shared/log.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BOARD = 'qa/reconnect-test'
const URL_ = process.env.MAP_URL || 'http://localhost:5173'

const sh = (args) => execFileSync('node', args, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' })
const apply = (ops) => sh([path.join('scripts', 'apply-ops.mjs'), '--board', BOARD, JSON.stringify(ops)])

let pass = 0, fail = 0
const out = []
const ok = (n, c, d = '') => { c ? (pass++, out.push(`  PASS  ${n}`)) : (fail++, out.push(`  FAIL  ${n}${d ? `\n          ${d}` : ''}`)) }

function startServer() {
  const p = spawn('node', [path.join('server', 'index.mjs')], { cwd: ROOT, stdio: 'ignore' })
  return p
}
async function waitForApi(up = true) {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch('http://localhost:5175/api/boards')
      if (up && r.ok) return true
    } catch { if (!up) return true }
    await sleep(250)
  }
  return false
}

try { fs.unlinkSync(boardPath(ROOT, BOARD)) } catch { /* absent */ }
sh([path.join('scripts', 'boards.mjs'), 'create', 'reconnect-test', '--folder', 'qa'])
apply([
  { op: 'board_set_title', title: 'Reconnect Test' },
  { op: 'widget_create', id: 'w', type: 'flowchart', title: 'Flow' },
  { op: 'node_add', widgetId: 'w', id: 'a', label: 'Before restart' },
])

let server = startServer()
await waitForApi(true)

const b = await launch()
try {
  await b.goto(URL_, 4500)
  const initial = await b.eval(`document.querySelectorAll('.react-flow__node').length`)
  ok('board loaded before restart', initial === 2, `nodes ${initial}`)

  // --- kill the API server ---------------------------------------------------
  server.kill()
  await waitForApi(false)
  await sleep(16000) // past the client's stall watchdog
  const banner = await b.eval(`document.querySelector('.banner.warn')?.textContent || ''`)
  ok('server-down shows a reconnecting banner', banner.includes('reconnect'), `banner: "${banner}"`)

  // --- content added while the client was disconnected -----------------------
  apply([{ op: 'node_add', widgetId: 'w', id: 'b', label: 'Added while offline' }])

  // --- restart ---------------------------------------------------------------
  server = startServer()
  await waitForApi(true)
  await sleep(6000) // EventSource backoff + init replay

  const after = JSON.parse(await b.eval(`JSON.stringify({
    nodes: document.querySelectorAll('.react-flow__node').length,
    labels: [...document.querySelectorAll('.flow-label')].map(e=>e.textContent),
    banner: document.querySelector('.banner.warn')?.textContent || '',
    dot: document.querySelector('.conn-dot').className,
  })`))
  ok('client reconnects and clears the banner', after.banner === '', `banner: "${after.banner}"`)
  ok('replays to the correct state, including offline changes',
    after.labels.includes('Before restart') && after.labels.includes('Added while offline'),
    JSON.stringify(after.labels))
  ok('connection indicator returns to ready', after.dot.includes('ready'), after.dot)
} finally {
  b.close()
  server.kill()
  try { fs.unlinkSync(boardPath(ROOT, BOARD)) } catch { /* ignore */ }
}

console.log(out.join('\n'))
console.log(`\n${pass} passed, ${fail} failed\n`)
process.exit(fail ? 1 : 0)
