#!/usr/bin/env node
// Replays the "SQL and Data fundamentals" lecture example: an incrementally
// growing mindmap, a comparison table, a schema, branch collapse, reparenting.
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
// Pinned to the "test" folder so a fresh clone replays deterministically
// rather than into whatever folder is currently active.
const FOLDER = 'test'
const NAME = 'sql-fundamentals'
const BOARD = `${FOLDER}/${NAME}`
const delayArg = process.argv.indexOf('--delay')
const DELAY = delayArg > -1 ? parseInt(process.argv[delayArg + 1], 10) : 800

const sh = (args) => execFileSync('node', args, { cwd: ROOT, encoding: 'utf8' })
function apply(label, ops) {
  process.stdout.write(`\n> ${label}\n`)
  process.stdout.write(sh([path.join('scripts', 'apply-ops.mjs'), '--board', BOARD, JSON.stringify(ops)]))
}
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)

try { sh([path.join('scripts', 'boards.mjs'), 'create', NAME, '--folder', FOLDER]) } catch { /* exists */ }

apply('Turn 1 - "Concept: Tables and Joins"', [
  { op: 'board_set_title', title: 'SQL and Data Fundamentals' },
  { op: 'widget_create', id: 'mm', type: 'mindmap', title: 'SQL concepts' },
  { op: 'node_add', widgetId: 'mm', id: 'sql', label: 'SQL' },
  { op: 'node_add', widgetId: 'mm', id: 'tables', label: 'Tables', parentId: 'sql' },
  { op: 'node_add', widgetId: 'mm', id: 'rows', label: 'Rows = records', parentId: 'tables' },
  { op: 'node_add', widgetId: 'mm', id: 'cols', label: 'Columns = fields', parentId: 'tables' },
  { op: 'node_add', widgetId: 'mm', id: 'joins', label: 'Joins', parentId: 'sql' },
  { op: 'node_add', widgetId: 'mm', id: 'inner', label: 'Inner join', parentId: 'joins' },
  { op: 'node_add', widgetId: 'mm', id: 'left', label: 'Left join', parentId: 'joins' },
  { op: 'node_add', widgetId: 'mm', id: 'right', label: 'Right join', parentId: 'joins' },
  { op: 'node_add', widgetId: 'mm', id: 'full', label: 'Full outer join', parentId: 'joins' },
])
sleep(DELAY)

apply('Turn 2 - "Group by"', [
  { op: 'node_add', widgetId: 'mm', id: 'agg', label: 'Aggregation', parentId: 'sql' },
  { op: 'node_add', widgetId: 'mm', id: 'gb', label: 'GROUP BY', parentId: 'agg' },
  { op: 'node_add', widgetId: 'mm', id: 'count', label: 'COUNT', parentId: 'gb' },
  { op: 'node_add', widgetId: 'mm', id: 'sum', label: 'SUM / AVG', parentId: 'gb' },
  { op: 'node_add', widgetId: 'mm', id: 'having', label: 'HAVING filters groups', parentId: 'gb' },
  { op: 'node_add', widgetId: 'mm', id: 'window', label: 'Window functions', parentId: 'agg', kind: 'suggestion' },
  { op: 'node_flag', widgetId: 'mm', id: 'having', question: 'Do you know when HAVING runs vs WHERE? Order matters for performance.' },
])
sleep(DELAY)

apply('Turn 3 - "Inner Join vs Left Join" -> comparison table', [
  { op: 'widget_create', id: 'cmp', type: 'table', title: 'Inner join vs Left join' },
  {
    op: 'table_set_columns', widgetId: 'cmp',
    columns: [
      { id: 'aspect', label: 'Aspect' },
      { id: 'inner', label: 'Inner join' },
      { id: 'left', label: 'Left join' },
    ],
  },
  { op: 'row_add', widgetId: 'cmp', id: 'r1', cells: { aspect: 'Rows returned', inner: 'Only matches in both', left: 'All left rows + matches' } },
  { op: 'row_add', widgetId: 'cmp', id: 'r2', cells: { aspect: 'Unmatched right', inner: 'Dropped', left: 'NULL columns' } },
  { op: 'row_add', widgetId: 'cmp', id: 'r3', cells: { aspect: 'Use when', inner: 'Need both sides present', left: 'Keep everything on the left' } },
  { op: 'row_add', widgetId: 'cmp', id: 'r4', kind: 'suggestion', cells: { aspect: 'Common bug', inner: 'Silently loses rows', left: 'WHERE on right table turns it into an inner join' } },
])
sleep(DELAY)

apply('Turn 4 - "Group by can help in creating BI views, e.g. ..."', [
  { op: 'widget_create', id: 'ex', type: 'note', title: 'Example: BI view from GROUP BY' },
  {
    op: 'note_set_content', widgetId: 'ex',
    markdown: '**Daily revenue by region**\n\n```\nSELECT region,\n       date_trunc(\'day\', ordered_at) AS d,\n       SUM(amount) AS revenue,\n       COUNT(*)    AS orders\nFROM orders\nGROUP BY region, d\n```\n\nOne row per region per day - exactly the grain a BI dashboard wants.',
  },
  { op: 'widget_create', id: 'sch', type: 'schema', title: 'Orders data model' },
  {
    op: 'node_add', widgetId: 'sch', id: 'orders', label: 'orders',
    fields: [
      { name: 'id', type: 'bigint', key: 'pk' },
      { name: 'customer_id', type: 'bigint', key: 'fk' },
      { name: 'region', type: 'text' },
      { name: 'amount', type: 'numeric' },
      { name: 'ordered_at', type: 'timestamp' },
    ],
  },
  {
    op: 'node_add', widgetId: 'sch', id: 'customers', label: 'customers',
    fields: [
      { name: 'id', type: 'bigint', key: 'pk' },
      { name: 'name', type: 'text' },
    ],
  },
  { op: 'edge_add', widgetId: 'sch', source: 'customers', target: 'orders', label: '1:N' },
])
sleep(DELAY)

apply('Turn 5 - restructure: collapse a branch, reparent a concept', [
  { op: 'node_update', widgetId: 'mm', id: 'joins', collapsed: true },
  { op: 'suggestion_accept', widgetId: 'mm', id: 'window', label: 'Window functions (running totals)' },
  { op: 'node_update', widgetId: 'mm', id: 'having', parentId: 'agg' },
  { op: 'node_unflag', widgetId: 'mm', id: 'having' },
])

console.log(`\nreplay complete - board "${BOARD}"`)
