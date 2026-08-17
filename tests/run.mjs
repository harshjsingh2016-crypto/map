#!/usr/bin/env node
// Verification suite: validation/atomicity, reducer behavior, log-format
// handling, and the markdown-export golden file. Pure Node, no deps.
//   node tests/run.mjs [--update-golden]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { opSchema, parseLogLine, LOG_VERSION } from '../shared/ops.mjs'
import { createEmptyBoard, applyOp, materialize, OpError } from '../shared/reduce.mjs'
import { readBoardLog, boardPath, splitCompleteLines, getActiveBoard, setActiveBoard } from '../shared/log.mjs'
import { toMarkdown, summarize } from '../shared/summary.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const UPDATE = process.argv.includes('--update-golden')

let pass = 0, fail = 0
const results = []
function check(name, fn) {
  try {
    fn()
    pass++; results.push(`  PASS  ${name}`)
  } catch (e) {
    fail++; results.push(`  FAIL  ${name}\n          ${e.message}`)
  }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed') }
function throwsWith(fn, substr) {
  try { fn() } catch (e) {
    assert(e instanceof OpError, `expected OpError, got ${e.constructor.name}: ${e.message}`)
    assert(e.message.includes(substr), `expected message containing "${substr}", got "${e.message}"`)
    return
  }
  throw new Error(`expected a rejection containing "${substr}", but nothing was thrown`)
}

// Board fixture helper
function board(...ops) {
  const s = createEmptyBoard()
  for (const op of ops) applyOp(s, op, { strict: true })
  return s
}
const FLOW = { op: 'widget_create', id: 'w', type: 'flowchart', title: 'W' }
const MIND = { op: 'widget_create', id: 'm', type: 'mindmap', title: 'M' }
const TABLE = { op: 'widget_create', id: 't', type: 'table', title: 'T' }

console.log('\n--- shape validation (zod) ---')
check('rejects unknown op', () => assert(!opSchema.safeParse({ op: 'nope' }).success))
check('rejects unknown field (strict)', () =>
  assert(!opSchema.safeParse({ op: 'board_set_title', title: 'x', extra: 1 }).success))
check('rejects bad color token', () =>
  assert(!opSchema.safeParse({ op: 'board_set_style', background: 'ultraviolet' }).success))
check('accepts hex color', () =>
  assert(opSchema.safeParse({ op: 'board_set_style', background: '#1e3a5f' }).success))
check('rejects invalid quadrant cell', () =>
  assert(!opSchema.safeParse({ op: 'node_add', widgetId: 'q', id: 'a', label: 'A', cell: 'middle' }).success))

console.log('\n--- referential validation ---')
check('duplicate widget id', () =>
  throwsWith(() => board(FLOW, FLOW), 'already exists'))
check('op on missing widget', () =>
  throwsWith(() => board({ op: 'node_add', widgetId: 'ghost', id: 'a', label: 'A' }), 'does not exist'))
check('duplicate node id', () =>
  throwsWith(() => board(FLOW,
    { op: 'node_add', widgetId: 'w', id: 'a', label: 'A' },
    { op: 'node_add', widgetId: 'w', id: 'a', label: 'A again' }), 'already exists'))
check('edge to nonexistent node names the V1 limitation', () =>
  throwsWith(() => board(FLOW,
    { op: 'node_add', widgetId: 'w', id: 'a', label: 'A' },
    { op: 'edge_add', widgetId: 'w', source: 'a', target: 'nope' }), 'known V1 limitation'))
check('table op on flowchart', () =>
  throwsWith(() => board(FLOW, { op: 'row_add', widgetId: 'w', id: 'r', cells: {} }), 'not a table'))
check('row before columns', () =>
  throwsWith(() => board(TABLE, { op: 'row_add', widgetId: 't', id: 'r', cells: {} }), 'no columns yet'))
check('cell for unknown column', () =>
  throwsWith(() => board(TABLE,
    { op: 'table_set_columns', widgetId: 't', columns: [{ id: 'c1', label: 'C1' }] },
    { op: 'row_add', widgetId: 't', id: 'r', cells: { nope: 'x' } }), 'is not a column'))
check('node referencing undeclared group', () =>
  throwsWith(() => board(FLOW,
    { op: 'node_add', widgetId: 'w', id: 'a', label: 'A', groupId: 'g' }), 'create it first'))
check('group on non-flowchart', () =>
  throwsWith(() => board(MIND, { op: 'group_add', widgetId: 'm', id: 'g', label: 'G' }), 'only supported on flowcharts'))
check('mindmap edge_add redirects to parentId', () =>
  throwsWith(() => board(MIND,
    { op: 'node_add', widgetId: 'm', id: 'a', label: 'A' },
    { op: 'node_add', widgetId: 'm', id: 'b', label: 'B' },
    { op: 'edge_add', widgetId: 'm', source: 'a', target: 'b' }), 'derived from parentId'))
check('reparent cycle rejected', () =>
  throwsWith(() => board(MIND,
    { op: 'node_add', widgetId: 'm', id: 'a', label: 'A' },
    { op: 'node_add', widgetId: 'm', id: 'b', label: 'B', parentId: 'a' },
    { op: 'node_update', widgetId: 'm', id: 'a', parentId: 'b' }), 'cycle'))
check('quadrant item requires a cell', () =>
  throwsWith(() => board({ op: 'widget_create', id: 'q', type: 'quadrant', title: 'Q' },
    { op: 'node_add', widgetId: 'q', id: 'a', label: 'A' }), 'need a cell'))
check('accept on a non-suggestion', () =>
  throwsWith(() => board(FLOW,
    { op: 'node_add', widgetId: 'w', id: 'a', label: 'A' },
    { op: 'suggestion_accept', widgetId: 'w', id: 'a' }), 'is not a suggestion'))
check('node_move to incompatible type', () =>
  throwsWith(() => board(FLOW, { op: 'widget_create', id: 'n', type: 'note', title: 'N' },
    { op: 'node_add', widgetId: 'w', id: 'a', label: 'A' },
    { op: 'node_move', id: 'a', fromWidgetId: 'w', toWidgetId: 'n' }), 'cannot hold nodes'))

console.log('\n--- reducer behavior ---')
check('suggestion_accept with label override', () => {
  const s = board(FLOW,
    { op: 'node_add', widgetId: 'w', id: 'a', label: 'Original', kind: 'suggestion' },
    { op: 'suggestion_accept', widgetId: 'w', id: 'a', label: 'Edited' })
  assert(s.widgets.w.nodes.a.kind === 'user', 'kind should flip to user')
  assert(s.widgets.w.nodes.a.label === 'Edited', 'label should be overridden')
})
check('suggestion_reject removes the element', () => {
  const s = board(FLOW,
    { op: 'node_add', widgetId: 'w', id: 'a', label: 'A', kind: 'suggestion' },
    { op: 'suggestion_reject', widgetId: 'w', id: 'a' })
  assert(!s.widgets.w.nodes.a, 'node should be gone')
  assert(!s.widgets.w.nodeOrder.includes('a'), 'nodeOrder should be cleaned')
})
check('mindmap node_remove takes the subtree', () => {
  const s = board(MIND,
    { op: 'node_add', widgetId: 'm', id: 'a', label: 'A' },
    { op: 'node_add', widgetId: 'm', id: 'b', label: 'B', parentId: 'a' },
    { op: 'node_add', widgetId: 'm', id: 'c', label: 'C', parentId: 'b' },
    { op: 'node_remove', widgetId: 'm', id: 'a' })
  assert(s.widgets.m.nodeOrder.length === 0, `expected empty, got ${s.widgets.m.nodeOrder}`)
})
check('reparent keeps the subtree attached', () => {
  const s = board(MIND,
    { op: 'node_add', widgetId: 'm', id: 'root', label: 'R' },
    { op: 'node_add', widgetId: 'm', id: 'a', label: 'A', parentId: 'root' },
    { op: 'node_add', widgetId: 'm', id: 'b', label: 'B', parentId: 'root' },
    { op: 'node_add', widgetId: 'm', id: 'child', label: 'C', parentId: 'a' },
    { op: 'node_update', widgetId: 'm', id: 'a', parentId: 'b' })
  assert(s.widgets.m.nodes.a.parentId === 'b', 'a should move under b')
  assert(s.widgets.m.nodes.child.parentId === 'a', 'child should still hang off a')
})
check('node_remove clears attached edges', () => {
  const s = board(FLOW,
    { op: 'node_add', widgetId: 'w', id: 'a', label: 'A' },
    { op: 'node_add', widgetId: 'w', id: 'b', label: 'B' },
    { op: 'edge_add', widgetId: 'w', source: 'a', target: 'b' },
    { op: 'node_remove', widgetId: 'w', id: 'b' })
  assert(s.widgets.w.edgeOrder.length === 0, 'dangling edge should be removed')
})
check('node_move warns about dropped edges', () => {
  const s = board(FLOW, MIND,
    { op: 'node_add', widgetId: 'w', id: 'a', label: 'A' },
    { op: 'node_add', widgetId: 'w', id: 'b', label: 'B' },
    { op: 'edge_add', widgetId: 'w', source: 'a', target: 'b' })
  const warnings = applyOp(s, { op: 'node_move', id: 'b', fromWidgetId: 'w', toWidgetId: 'm' }, { strict: true })
  assert(warnings.some((x) => x.includes('dropped edge')), `expected a dropped-edge warning, got ${JSON.stringify(warnings)}`)
  assert(s.widgets.m.nodes.b, 'node should land in the target widget')
})
check('style updates merge rather than replace', () => {
  const s = board(FLOW,
    { op: 'node_add', widgetId: 'w', id: 'a', label: 'A', style: { fill: 'blue' } },
    { op: 'node_update', widgetId: 'w', id: 'a', style: { border: 'red' } })
  assert(s.widgets.w.nodes.a.style.fill === 'blue' && s.widgets.w.nodes.a.style.border === 'red',
    `merge failed: ${JSON.stringify(s.widgets.w.nodes.a.style)}`)
})
check('null clears an optional field', () => {
  const s = board(FLOW,
    { op: 'node_add', widgetId: 'w', id: 'a', label: 'A', detail: 'x' },
    { op: 'node_update', widgetId: 'w', id: 'a', detail: null })
  assert(!('detail' in s.widgets.w.nodes.a), 'detail should be cleared')
})
check('flag / unflag round trip', () => {
  const s = board(FLOW,
    { op: 'node_add', widgetId: 'w', id: 'a', label: 'A' },
    { op: 'node_flag', widgetId: 'w', id: 'a', question: 'Sure?' })
  assert(s.widgets.w.nodes.a.flag.question === 'Sure?')
  applyOp(s, { op: 'node_unflag', widgetId: 'w', id: 'a' }, { strict: true })
  assert(!s.widgets.w.nodes.a.flag, 'flag should be gone')
})
check('summary counts suggestions and flags', () => {
  const s = board(FLOW,
    { op: 'node_add', widgetId: 'w', id: 'a', label: 'A' },
    { op: 'node_add', widgetId: 'w', id: 'b', label: 'B', kind: 'suggestion' },
    { op: 'node_flag', widgetId: 'w', id: 'a', question: 'Q?' })
  const out = summarize(s, 'demo')
  assert(out.includes('1 pending suggestion') && out.includes('1 open flag'), out)
})

console.log('\n--- log format ---')
check('rejects unknown version', () =>
  assert.call(null, (() => {
    try { parseLogLine(JSON.stringify({ v: 99, ts: 1, batchId: 1, ops: [] }), 1); return false }
    catch (e) { return e.message.includes('unknown log version') }
  })(), 'should reject v99 with a clear message'))
check('parse error names the line number', () => {
  try { parseLogLine('{not json', 7); throw new Error('should have thrown') }
  catch (e) { assert(e.message.startsWith('line 7:'), e.message) }
})
check('partial trailing line is buffered, not consumed', () => {
  const { lines, rest } = splitCompleteLines('', '{"a":1}\n{"b":2}\n{"partial"')
  assert(lines.length === 2, `expected 2 complete lines, got ${lines.length}`)
  assert(rest === '{"partial"', `expected the partial tail to carry over, got ${JSON.stringify(rest)}`)
})
check('carry from a previous chunk completes a line', () => {
  const { lines, rest } = splitCompleteLines('{"par', 'tial":1}\n')
  assert(lines.length === 1 && lines[0] === '{"partial":1}', JSON.stringify(lines))
  assert(rest === '')
})
check('snapshot line is accepted and readers skip to it', () => {
  const snap = { v: LOG_VERSION, type: 'snapshot', ts: 1, batchId: 5, state: { ...createEmptyBoard(), title: 'FromSnapshot' } }
  const batch = { v: LOG_VERSION, ts: 2, batchId: 6, ops: [{ op: 'board_set_title', title: 'AfterSnapshot' }] }
  const entries = [
    { type: 'batch', data: { v: 1, ts: 0, batchId: 1, ops: [{ op: 'board_set_title', title: 'Ignored' }] } },
    parseLogLine(JSON.stringify(snap), 1),
    parseLogLine(JSON.stringify(batch), 2),
  ]
  const { state } = materialize(entries, { strict: false })
  assert(state.title === 'AfterSnapshot', `got "${state.title}"`)
})
check('tolerant materialize skips bad ops instead of throwing', () => {
  const entries = [{
    type: 'batch',
    data: { v: 1, ts: 0, batchId: 1, ops: [
      { op: 'widget_create', id: 'w', type: 'flowchart', title: 'W' },
      { op: 'node_add', widgetId: 'ghost', id: 'x', label: 'X' },
      { op: 'node_add', widgetId: 'w', id: 'ok', label: 'OK' },
    ] },
  }]
  const { state, warnings } = materialize(entries, { strict: false })
  assert(state.widgets.w.nodes.ok, 'valid ops after a bad one should still apply')
  assert(warnings.some((w) => w.includes('skipped bad op')), 'should warn about the skipped op')
})

console.log('\n--- CLI: atomicity on a real board ---')
const TMP = 'qa/test-atomicity'
check('rejected batch appends nothing', () => {
  // apply-ops sets the active pointer as a side effect; put it back so the
  // suite doesn't leave the app pointed at a board it is about to delete.
  const activeBefore = getActiveBoard(ROOT)
  const bp = boardPath(ROOT, TMP)
  try { fs.unlinkSync(bp) } catch { /* absent */ }
  execFileSync('node', [path.join('scripts', 'boards.mjs'), 'create', 'test-atomicity', '--folder', 'qa'], { cwd: ROOT })
  execFileSync('node', [path.join('scripts', 'apply-ops.mjs'), '--board', TMP,
    JSON.stringify([{ op: 'widget_create', id: 'w', type: 'flowchart', title: 'W' }])], { cwd: ROOT })
  const sizeBefore = fs.statSync(bp).size
  let rejected = false
  try {
    execFileSync('node', [path.join('scripts', 'apply-ops.mjs'), '--board', TMP,
      JSON.stringify([
        { op: 'node_add', widgetId: 'w', id: 'good', label: 'Valid' },
        { op: 'edge_add', widgetId: 'w', source: 'good', target: 'missing' },
      ])], { cwd: ROOT, stdio: 'pipe' })
  } catch { rejected = true }
  assert(rejected, 'invalid batch should exit non-zero')
  assert(fs.statSync(bp).size === sizeBefore, 'file must be unchanged after a rejected batch')
  const { state } = materialize(readBoardLog(bp).entries, { strict: false })
  assert(!state.widgets.w.nodes.good, 'the valid first op must not have been applied')
  fs.unlinkSync(bp)
  if (activeBefore) setActiveBoard(ROOT, activeBefore)
})

console.log('\n--- markdown export golden ---')
check('logistics-escalations markdown matches golden', () => {
  const bp = boardPath(ROOT, 'test/logistics-escalations')
  // Boards are gitignored, so a fresh clone has no demo board. Replay it,
  // leaving the active board where the user had it.
  if (!fs.existsSync(bp)) {
    const activeBefore = getActiveBoard(ROOT)
    execFileSync('node', [path.join('scripts', 'demo-logistics.mjs'), '--delay', '0'],
      { cwd: ROOT, stdio: 'ignore' })
    if (activeBefore) setActiveBoard(ROOT, activeBefore)
  }
  const { state } = materialize(readBoardLog(bp).entries, { strict: false })
  const md = toMarkdown(state, 'logistics-escalations')
  const golden = path.join(ROOT, 'tests', 'logistics-escalations.expected.md')
  if (UPDATE) { fs.writeFileSync(golden, md, 'utf8'); return }
  const want = fs.readFileSync(golden, 'utf8')
  if (md !== want) {
    const a = md.split('\n'), b = want.split('\n')
    const i = a.findIndex((l, idx) => l !== b[idx])
    throw new Error(`differs at line ${i + 1}:\n            got:  ${JSON.stringify(a[i])}\n            want: ${JSON.stringify(b[i])}`)
  }
  assert(md.includes('> [question]'), 'flags should render as [question]')
  assert(md.includes('[suggestion]'), 'suggestions should be marked')
})

console.log(results.join('\n'))
console.log(`\n${pass} passed, ${fail} failed\n`)
process.exit(fail ? 1 : 0)
