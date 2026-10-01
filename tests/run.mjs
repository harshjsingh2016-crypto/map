#!/usr/bin/env node
// Verification suite: validation/atomicity, reducer behavior, log-format
// handling, and the markdown-export golden file. Pure Node, no deps.
//   node tests/run.mjs [--update-golden]
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { opSchema, parseLogLine, LOG_VERSION } from '../shared/ops.mjs'
import { createEmptyBoard, applyOp, materialize, OpError } from '../shared/reduce.mjs'
import { readBoardLog, boardPath, splitCompleteLines, getActiveBoard, setActiveBoard } from '../shared/log.mjs'
import { toMarkdown, summarize } from '../shared/summary.mjs'
import { listAllBoards, resolveBoard, assertWritable } from '../shared/mounts.mjs'

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

// ---------------------------------------------------------------------------
// CLI tests run against a throwaway root (--root), never the real boards/.
// The layout: a "home" with a projects.json that mounts two fake projects.
// ---------------------------------------------------------------------------
const SANDBOX = fs.mkdtempSync(path.join(os.tmpdir(), 'map-test-'))
const HOME = path.join(SANDBOX, 'home')
const P1 = path.join(SANDBOX, 'p1')
const P2 = path.join(SANDBOX, 'p2')
for (const d of [HOME, P1, P2]) fs.mkdirSync(path.join(d, 'boards'), { recursive: true })
const cliEnv = { ...process.env }
delete cliEnv.MAP_ROOT
/** Run a script; returns { ok, out } instead of throwing on a non-zero exit. */
function cli(script, ...args) {
  try {
    const out = execFileSync('node', [path.join(ROOT, 'scripts', script), ...args],
      { cwd: ROOT, env: cliEnv, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    return { ok: true, out }
  } catch (e) {
    return { ok: false, out: `${e.stdout || ''}${e.stderr || ''}` }
  }
}
const W = JSON.stringify([{ op: 'widget_create', id: 'w', type: 'flowchart', title: 'W' }])

console.log('\n--- CLI: atomicity (throwaway root) ---')
check('rejected batch appends nothing', () => {
  assert(cli('boards.mjs', '--root', HOME, 'create', 'test-atomicity', '--folder', 'qa').ok, 'create failed')
  const bp = boardPath(HOME, 'qa/test-atomicity')
  assert(cli('apply-ops.mjs', '--root', HOME, '--board', 'qa/test-atomicity', W).ok, 'first batch failed')
  const sizeBefore = fs.statSync(bp).size
  const bad = cli('apply-ops.mjs', '--root', HOME, '--board', 'qa/test-atomicity', JSON.stringify([
    { op: 'node_add', widgetId: 'w', id: 'good', label: 'Valid' },
    { op: 'edge_add', widgetId: 'w', source: 'good', target: 'missing' },
  ]))
  assert(!bad.ok, 'invalid batch should exit non-zero')
  assert(fs.statSync(bp).size === sizeBefore, 'file must be unchanged after a rejected batch')
  const { state } = materialize(readBoardLog(bp).entries, { strict: false })
  assert(!state.widgets.w.nodes.good, 'the valid first op must not have been applied')
})

console.log('\n--- --root and mounted projects ---')
check('--root writes the project and leaves this repo\'s .active alone', () => {
  const mapActive = path.join(ROOT, 'boards', '.active')
  const before = fs.existsSync(mapActive) ? fs.readFileSync(mapActive) : null
  // --root ahead of the positionals: it must not be read as the subcommand or the JSON.
  assert(cli('boards.mjs', '--root', P1, 'create', 'plan', '--folder', 'p1').ok, 'create in project failed')
  const r = cli('apply-ops.mjs', '--root', P1, '--board', 'p1/plan', W)
  assert(r.ok, `apply in project failed: ${r.out}`)
  assert(readBoardLog(boardPath(P1, 'p1/plan')).entries.length === 1, 'batch should land in the project')
  assert(getActiveBoard(P1) === 'p1/plan', 'the project\'s own .active should move')
  const after = fs.existsSync(mapActive) ? fs.readFileSync(mapActive) : null
  assert(before === null ? after === null : before.equals(after), 'this repo\'s .active must be untouched')
  assert(cli('boards.mjs', '--root', P1, 'list').out.includes('plan'), 'list --root should show the project board')
})

check('a mounted board resolves in place and is read-only from the home root', () => {
  fs.writeFileSync(path.join(HOME, 'projects.json'), JSON.stringify({ version: 1, projects: [
    { alias: 'p1', path: P1, folders: ['p1'] },
    { alias: 'gone', path: path.join(SANDBOX, 'nowhere'), folders: ['gone'] },
  ] }))
  const loc = resolveBoard(HOME, 'p1/plan')
  assert(loc.mounted && loc.alias === 'p1', 'p1/plan should resolve as mounted')
  assert(loc.path === boardPath(P1, 'p1/plan'), 'path should point into the project')
  assert(resolveBoard(HOME, 'plan').id === 'p1/plan', 'a bare unique name should resolve across mounts')
  let msg = ''
  try { assertWritable(HOME, 'p1/plan') } catch (e) { msg = e.message }
  assert(msg.includes('--root'), `guard should name --root, got "${msg}"`)
  const size = fs.statSync(loc.path).size
  for (const args of [
    ['apply-ops.mjs', '--root', HOME, '--board', 'p1/plan', W],
    ['undo.mjs', '--root', HOME, '--board', 'p1/plan'],
    ['boards.mjs', '--root', HOME, 'create', 'x', '--folder', 'p1'],
    ['boards.mjs', '--root', HOME, 'folder', 'p1'],
    ['boards.mjs', '--root', HOME, 'use', 'p1/plan'],
    ['boards.mjs', '--root', HOME, 'folder', 'gone'],
  ]) {
    const r = cli(...args)
    assert(!r.ok && r.out.includes('mounted project'), `${args[0]} ${args.slice(3).join(' ')} should be refused, got: ${r.out}`)
  }
  assert(fs.statSync(loc.path).size === size, 'the mounted board must be unchanged')
  assert(!fs.existsSync(path.join(HOME, 'boards', 'p1')), 'no shadow folder may be created in the home root')
  assert(cli('outline.mjs', '--root', HOME, '--board', 'p1/plan').ok, 'reading a mounted board should work')
})

check('a project missing on this machine is reported, not fatal', () => {
  const { boards, missing } = listAllBoards(HOME)
  assert(missing.includes('gone'), 'missing project should be listed')
  assert(boards.some((b) => b.id === 'p1/plan' && b.source === 'p1' && b.readonly), 'present mount still listed')
  const r = cli('projects.mjs', '--root', HOME, 'status')
  assert(r.ok && /gone: missing/.test(r.out), `status should print missing, got: ${r.out}`)
})

check('a folder claimed twice goes to the first owner and is reported', () => {
  for (const [dir, tag] of [[P1, 'one'], [P2, 'two']]) {
    assert(cli('boards.mjs', '--root', dir, 'create', tag, '--folder', 'dup').ok, 'create dup failed')
  }
  fs.writeFileSync(path.join(HOME, 'projects.json'), JSON.stringify({ version: 1, projects: [
    { alias: 'p1', path: P1, folders: ['p1'] },
    { alias: 'p2', path: P2, folders: [] },
  ] }))
  const { boards, errors } = listAllBoards(HOME)
  assert(errors.length === 1 && errors[0].includes('p1') && errors[0].includes('p2'), `want one clash naming both, got ${JSON.stringify(errors)}`)
  const dup = boards.filter((b) => b.folder === 'dup')
  assert(dup.length === 1 && dup[0].source === 'p1', 'dup boards should come from the first project only')
})

check('an id cannot step outside boards/', () => {
  assert(resolveBoard(HOME, '../x').path === null, '"../x" must not resolve to a path')
  assert(resolveBoard(HOME, 'qa/..').path === null, '"qa/.." must not resolve to a path')
})

check('wiki check --root: own ids pass, foreign ids warn, links may not leave the wiki', () => {
  const wiki = path.join(P1, 'wiki')
  fs.mkdirSync(wiki, { recursive: true })
  const page = (boards, body) => `---\nboards: [${boards}]\nupdated: 2026-01-01\n---\n\n# Title\n\n${body}\n`
  fs.writeFileSync(path.join(wiki, 'index.md'), '# Index\n\n- [A](a.md)\n- [B](b.md)\n')
  fs.writeFileSync(path.join(wiki, 'a.md'), page('p1/plan', 'See [B](b.md).'))
  fs.writeFileSync(path.join(wiki, 'b.md'), page('solutions/elsewhere', 'Text.'))
  const ok = cli('wiki.mjs', '--root', P1, 'check')
  assert(ok.ok, `check should pass: ${ok.out}`)
  assert(ok.out.includes('"solutions/elsewhere" not on this machine'), 'a foreign board id should warn')
  assert(!ok.out.includes('"p1/plan"'), 'the project\'s own id should not warn')
  fs.mkdirSync(path.join(P2, 'wiki'), { recursive: true })
  fs.writeFileSync(path.join(P2, 'wiki', 'far.md'), '# Far\n')
  fs.writeFileSync(path.join(wiki, 'a.md'), page('p1/plan', 'See [far](../../p2/wiki/far.md).'))
  const bad = cli('wiki.mjs', '--root', P1, 'check')
  assert(!bad.ok && bad.out.includes('link leaves the wiki'), `cross-repo link should be an error: ${bad.out}`)
})

check('sync refuses a root that is not the top of its own repo', () => {
  const r = cli('sync.mjs', '--root', P1, 'status')
  assert(!r.ok && r.out.includes('not the top of a git repo'), `expected a refusal, got: ${r.out}`)
})

fs.rmSync(SANDBOX, { recursive: true, force: true })

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

console.log('\n--- wiki ---')
check('wiki check passes (links, index, frontmatter)', () => {
  if (!fs.existsSync(path.join(ROOT, 'wiki'))) return // no wiki yet
  execFileSync('node', [path.join('scripts', 'wiki.mjs'), 'check'], { cwd: ROOT, stdio: 'pipe' })
})

console.log(results.join('\n'))
console.log(`\n${pass} passed, ${fail} failed\n`)
process.exit(fail ? 1 : 0)
