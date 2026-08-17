#!/usr/bin/env node
// Watcher stress test: fire N rapid appends and confirm every batch reaches
// an SSE client exactly once, in order. Also exercises undo -> reset.
//   node scripts/stress-watch.mjs [--count 20]
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import { boardPath } from '../shared/log.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BOARD = 'qa/stress-test'
const i = process.argv.indexOf('--count')
const COUNT = i > -1 ? parseInt(process.argv[i + 1], 10) : 20
const API = process.env.MAP_API || 'http://localhost:5175'

const sh = (args) => execFileSync('node', args, { cwd: ROOT, encoding: 'utf8' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Fresh board
try { fs.unlinkSync(boardPath(ROOT, BOARD)) } catch { /* absent */ }
sh([path.join('scripts', 'boards.mjs'), 'create', 'stress-test', '--folder', 'qa'])
sh([path.join('scripts', 'apply-ops.mjs'), '--board', BOARD,
  JSON.stringify([{ op: 'widget_create', id: 'w', type: 'flowchart', title: 'Stress' }])])

// Subscribe via raw SSE over fetch.
const received = []
let resetCount = 0
const ac = new AbortController()
const res = await fetch(`${API}/api/events?board=${BOARD}`, { signal: ac.signal })
const reader = res.body.getReader()
const dec = new TextDecoder()
let buf = ''
;(async () => {
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += dec.decode(value, { stream: true })
      let idx
      while ((idx = buf.indexOf('\n\n')) !== -1) {
        const raw = buf.slice(0, idx)
        buf = buf.slice(idx + 2)
        const ev = /^event: (.+)$/m.exec(raw)?.[1]
        const data = /^data: (.+)$/m.exec(raw)?.[1]
        if (ev === 'batch') received.push(JSON.parse(data).entry.data.batchId)
        if (ev === 'reset') resetCount++
      }
    }
  } catch { /* aborted */ }
})()

await sleep(600) // let init settle

console.log(`firing ${COUNT} rapid appends...`)
for (let n = 0; n < COUNT; n++) {
  sh([path.join('scripts', 'apply-ops.mjs'), '--board', BOARD,
    JSON.stringify([{ op: 'node_add', widgetId: 'w', id: `n${n}`, label: `Node ${n}` }])])
}

// Wait for delivery to settle.
let stable = 0, last = -1
for (let t = 0; t < 60; t++) {
  await sleep(250)
  if (received.length === last) { if (++stable >= 3) break } else { stable = 0; last = received.length }
}

const expected = Array.from({ length: COUNT }, (_, n) => n + 2) // batch 1 = widget_create
const inOrder = received.every((v, idx) => idx === 0 || v > received[idx - 1])
const dupes = received.length !== new Set(received).size
const missing = expected.filter((e) => !received.includes(e))

console.log(`received ${received.length}/${COUNT} batches`)
console.log(`  in order:    ${inOrder ? 'PASS' : 'FAIL'}`)
console.log(`  no dupes:    ${!dupes ? 'PASS' : 'FAIL'}`)
console.log(`  none missing:${missing.length === 0 ? ' PASS' : ` FAIL (${missing.join(',')})`}`)

// --- undo -> truncation -> reset event ---
const before = resetCount
sh([path.join('scripts', 'undo.mjs'), '--board', BOARD, '--count', '5'])
for (let t = 0; t < 40 && resetCount === before; t++) await sleep(250)
console.log(`  undo->reset: ${resetCount > before ? 'PASS' : 'FAIL (no reset event)'}`)

ac.abort()
const ok = inOrder && !dupes && missing.length === 0 && resetCount > before
console.log(ok ? '\nALL PASS' : '\nFAILURES PRESENT')
process.exit(ok ? 0 : 1)
