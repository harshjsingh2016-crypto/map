#!/usr/bin/env node
// Live browser checks against the running dev server: layout stability,
// stagger timing, camera policy, error states, dark theme, board switching.
// Requires `npm run dev` to be running.
//   node tests/live.mjs [--url http://localhost:5173] [--keep-shots dir]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { launch, sleep } from './cdp.mjs'
import { boardPath } from '../shared/log.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const arg = (n, d) => { const i = argv.indexOf(`--${n}`); return i > -1 ? argv[i + 1] : d }
const URL_ = arg('url', 'http://localhost:5173')
const SHOTS = arg('keep-shots', null)

const BOARD = 'qa/live-test'
const sh = (args) => execFileSync('node', args, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' })
const apply = (ops) => sh([path.join('scripts', 'apply-ops.mjs'), '--board', BOARD, JSON.stringify(ops)])

let pass = 0, fail = 0
const out = []
const ok = (name, cond, detail = '') => {
  if (cond) { pass++; out.push(`  PASS  ${name}`) }
  else { fail++; out.push(`  FAIL  ${name}${detail ? `\n          ${detail}` : ''}`) }
}

// --- fresh board with a flowchart to grow -----------------------------------
try { fs.unlinkSync(boardPath(ROOT, BOARD)) } catch { /* absent */ }
sh([path.join('scripts', 'boards.mjs'), 'create', 'live-test', '--folder', 'qa'])
apply([
  { op: 'board_set_title', title: 'Live Test' },
  { op: 'widget_create', id: 'w', type: 'flowchart', title: 'Growing flow' },
  { op: 'node_add', widgetId: 'w', id: 'a', label: 'Step A', shape: 'start' },
  { op: 'node_add', widgetId: 'w', id: 'b', label: 'Step B' },
  { op: 'node_add', widgetId: 'w', id: 'c', label: 'Step C' },
  { op: 'edge_add', widgetId: 'w', source: 'a', target: 'b' },
  { op: 'edge_add', widgetId: 'w', source: 'b', target: 'c' },
])

const b = await launch()
try {
  await b.goto(`${URL_}`, 4500)

  // The app follows boards/.active, which apply-ops just set to live-test.
  const title = await b.eval(`document.querySelector('.board-title').textContent`)
  ok('board loads and follows the active pointer', title === 'Live Test', `got "${title}"`)

  const baseline = await b.eval(`JSON.stringify({
    edges: document.querySelectorAll('.react-flow__edge').length,
    pos: Object.fromEntries([...document.querySelectorAll('.react-flow__node')].map(n=>[n.dataset.id,n.style.transform])),
  })`)
  const base = JSON.parse(baseline)
  ok('edges render in a real browser', base.edges === 2, `got ${base.edges}`)

  // --- layout stability: append nodes one at a time -------------------------
  const drift = []
  for (const [id, label, from] of [['d', 'Step D', 'c'], ['e', 'Step E', 'd'], ['f', 'Step F', 'e']]) {
    const before = JSON.parse(await b.eval(`JSON.stringify(Object.fromEntries([...document.querySelectorAll('.react-flow__node')].map(n=>[n.dataset.id,n.style.transform])))`))
    apply([
      { op: 'node_add', widgetId: 'w', id, label },
      { op: 'edge_add', widgetId: 'w', source: from, target: id },
    ])
    await sleep(1400)
    const after = JSON.parse(await b.eval(`JSON.stringify(Object.fromEntries([...document.querySelectorAll('.react-flow__node')].map(n=>[n.dataset.id,n.style.transform])))`))
    const moved = Object.keys(before).filter((k) => after[k] && after[k] !== before[k])
    drift.push({ added: id, movedExisting: moved.length, total: Object.keys(before).length })
  }
  // Appending to the end of a chain must not disturb the nodes above it.
  const worst = Math.max(...drift.map((d) => d.movedExisting))
  ok('appending nodes does not move existing ones', worst === 0, JSON.stringify(drift))

  // 1 widget frame + the original 3 nodes + the 3 just appended.
  const grew = await b.eval(`document.querySelectorAll('.react-flow__node').length`)
  ok('new nodes actually appeared', grew === 7, `node count ${grew}`)

  ok('position transitions are animated', await b.eval(
    `getComputedStyle(document.querySelector('.react-flow__node')).transitionProperty.includes('transform')`),
    'expected a transform transition on nodes')

  // --- stagger timing: a 40-op batch --------------------------------------
  await b.eval(`window.__seen=[]; window.__t0=performance.now();
    (function(){ const t=document.querySelector('.react-flow__viewport');
      new MutationObserver(()=>{window.__seen.push(performance.now()-window.__t0)}).observe(t,{childList:true,subtree:true}); })(); true`)
  const big = [{ op: 'widget_create', id: 'big', type: 'mindmap', title: 'Big batch' },
    { op: 'node_add', widgetId: 'big', id: 'root', label: 'Root' }]
  for (let i = 0; i < 38; i++) big.push({ op: 'node_add', widgetId: 'big', id: `n${i}`, label: `Item ${i}`, parentId: 'root' })
  apply(big)
  await sleep(3200)
  const stagger = JSON.parse(await b.eval(`JSON.stringify({
    ticks: window.__seen.length,
    first: window.__seen[0]||null,
    last: window.__seen[window.__seen.length-1]||null,
    nodes: document.querySelectorAll('.react-flow__node').length,
  })`))
  ok('40-op batch renders progressively (multiple paint steps)', stagger.ticks > 5, JSON.stringify(stagger))
  ok('40-op batch completes well under ~2.5s', stagger.last !== null && stagger.last < 2500, `last mutation at ${stagger.last}ms`)
  ok('all 39 mindmap nodes present after the batch', stagger.nodes >= 45, `got ${stagger.nodes}`)

  // --- camera policy --------------------------------------------------------
  // Real (trusted) input events — React Flow pans via d3-zoom, which ignores
  // synthetic MouseEvents dispatched from page script.
  const drag = async (x, y, type, buttons = 1) =>
    b.rpc('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons, clickCount: 1 })
  await drag(600, 400, 'mousePressed')
  for (const [x, y] of [[580, 385], [555, 370], [520, 340]]) await drag(x, y, 'mouseMoved')
  await drag(520, 340, 'mouseReleased', 0)
  await sleep(300)
  const vpBefore = await b.eval(`document.querySelector('.react-flow__viewport').style.transform`)
  apply([{ op: 'node_add', widgetId: 'w', id: 'late', label: 'Arrived after user panned' }])
  await sleep(1600)
  const vpAfter = await b.eval(`document.querySelector('.react-flow__viewport').style.transform`)
  ok('camera does not move within the user-interaction window', vpBefore === vpAfter,
    `before ${vpBefore} / after ${vpAfter}`)

  // --- dark theme + board background ---------------------------------------
  apply([{ op: 'board_set_style', theme: 'dark', background: '#141a24' }])
  await sleep(1500)
  const dark = JSON.parse(await b.eval(`JSON.stringify({
    appDark: document.querySelector('.app').className.includes('theme-dark'),
    bg: getComputedStyle(document.querySelector('.canvas-wrap')).backgroundColor,
  })`))
  ok('dark theme applies to the shell', dark.appDark, JSON.stringify(dark))
  ok('custom board background applies', dark.bg === 'rgb(20, 26, 36)', dark.bg)
  if (SHOTS) await b.screenshot(path.join(SHOTS, 'live-dark.png'))
  apply([{ op: 'board_set_style', theme: 'light', background: '#f7f8fa' }])
  await sleep(1200)

  // --- undo -> client reset and replay -------------------------------------
  const beforeUndo = await b.eval(`document.querySelectorAll('.react-flow__node').length`)
  sh([path.join('scripts', 'undo.mjs'), '--board', BOARD, '--count', '3'])
  await sleep(2200)
  const afterUndo = await b.eval(`document.querySelectorAll('.react-flow__node').length`)
  ok('undo triggers a client reset and replay', afterUndo < beforeUndo, `${beforeUndo} -> ${afterUndo}`)

  // --- corrupted line surfaces an error banner ------------------------------
  fs.appendFileSync(boardPath(ROOT, BOARD), '{"v":1,"ts":1,"batchId":999,"ops":[{"op":"nonsense"}]}\n')
  await sleep(2000)
  const banner = await b.eval(`document.querySelector('.banner.error')?.textContent || ''`)
  ok('corrupted log line surfaces an error banner naming the line', banner.includes('line'), `banner: "${banner}"`)

  // --- empty board state ----------------------------------------------------
  sh([path.join('scripts', 'boards.mjs'), 'create', 'live-empty', '--folder', 'qa'])
  await sleep(2000)
  const emptyText = await b.eval(`document.querySelector('.overlay-card')?.innerText || ''`)
  ok('empty board renders an explicit empty state', emptyText.includes('Empty board'), `overlay: "${emptyText}"`)

  // --- board switcher lists both boards -------------------------------------
  const opts = await b.eval(`JSON.stringify([...document.querySelectorAll('.topbar select option')].map(o=>o.value))`)
  const list = JSON.parse(opts)
  ok('board switcher lists multiple boards', list.includes(BOARD) && list.includes('qa/live-empty'), opts)

  if (SHOTS) await b.screenshot(path.join(SHOTS, 'live-final.png'))
} finally {
  b.close()
  try { fs.unlinkSync(boardPath(ROOT, BOARD)) } catch { /* ignore */ }
  try { fs.unlinkSync(boardPath(ROOT, 'qa/live-empty')) } catch { /* ignore */ }
}

console.log(out.join('\n'))
console.log(`\n${pass} passed, ${fail} failed\n`)
process.exit(fail ? 1 : 0)
