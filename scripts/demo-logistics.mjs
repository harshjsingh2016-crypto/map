#!/usr/bin/env node
// Replays the logistics-escalations example conversation turn by turn,
// exercising every V1 feature. Used for verification.
//   node scripts/demo-logistics.mjs [--delay ms]
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
// Pinned to the "test" folder so a fresh clone replays to the same board id
// the golden test reads, rather than into whatever folder is currently active.
const FOLDER = 'test'
const NAME = 'logistics-escalations'
const BOARD = `${FOLDER}/${NAME}`
const delayArg = process.argv.indexOf('--delay')
const DELAY = delayArg > -1 ? parseInt(process.argv[delayArg + 1], 10) : 900

function sh(args) {
  return execFileSync('node', args, { cwd: ROOT, encoding: 'utf8' })
}
function apply(label, ops) {
  process.stdout.write(`\n> ${label}\n`)
  process.stdout.write(sh([path.join('scripts', 'apply-ops.mjs'), '--board', BOARD, JSON.stringify(ops)]))
}
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)

try { sh([path.join('scripts', 'boards.mjs'), 'create', NAME, '--folder', FOLDER]) } catch { /* already exists */ }

// --- Turn 1: the messy first description -> capture immediately ------------
apply('Turn 1 - "we are getting customer escalations..." (partial capture, user voice)', [
  { op: 'board_set_title', title: 'Logistics Escalations' },
  { op: 'widget_create', id: 'proc', type: 'flowchart', title: 'Escalation process (current)' },
  { op: 'node_add', widgetId: 'proc', id: 'cust', label: 'Customer raises escalation', shape: 'start' },
  { op: 'node_add', widgetId: 'proc', id: 'cs', label: 'CS team sends to logistics dashboard' },
  { op: 'node_add', widgetId: 'proc', id: 'lm', label: 'LM routes to courier partner channel' },
  { op: 'node_add', widgetId: 'proc', id: 'tat', label: 'Courier partner commits TAT' },
  { op: 'node_add', widgetId: 'proc', id: 'comm', label: 'TAT communicated to customer' },
  { op: 'node_add', widgetId: 'proc', id: 'follow', label: 'LM follows up in courier channel' },
  { op: 'node_add', widgetId: 'proc', id: 'resolved', label: 'Ticket resolved?', shape: 'decision' },
  { op: 'node_add', widgetId: 'proc', id: 'rca', label: 'Courier shares RCA + resolution' },
  { op: 'node_add', widgetId: 'proc', id: 'update', label: 'LM updates logistics dashboard' },
  { op: 'node_add', widgetId: 'proc', id: 'penalty', label: 'Penalty applied (payment deduction)', shape: 'end' },
  { op: 'edge_add', widgetId: 'proc', source: 'cust', target: 'cs' },
  { op: 'edge_add', widgetId: 'proc', source: 'cs', target: 'lm' },
  { op: 'edge_add', widgetId: 'proc', source: 'lm', target: 'tat' },
  { op: 'edge_add', widgetId: 'proc', source: 'tat', target: 'comm' },
  { op: 'edge_add', widgetId: 'proc', source: 'comm', target: 'follow' },
  { op: 'edge_add', widgetId: 'proc', source: 'follow', target: 'resolved' },
  { op: 'edge_add', widgetId: 'proc', source: 'resolved', target: 'rca', label: 'Yes' },
  { op: 'edge_add', widgetId: 'proc', source: 'resolved', target: 'follow', label: 'No' },
  { op: 'edge_add', widgetId: 'proc', source: 'rca', target: 'update' },
  { op: 'edge_add', widgetId: 'proc', source: 'update', target: 'penalty' },
  { op: 'widget_create', id: 'types', type: 'note', title: 'Escalation types' },
  {
    op: 'note_set_content', widgetId: 'types',
    markdown: '- Delay in delivery\n- Missing products in shipment\n- Delay in reverse pickups',
  },
])
sleep(DELAY)

// --- Turn 2: penalty tracking feature --------------------------------------
apply('Turn 2 - "dashboard does not record which ticket has applicable penalty"', [
  { op: 'widget_create', id: 'pen', type: 'table', title: 'Penalty tracking (new field)' },
  {
    op: 'table_set_columns', widgetId: 'pen',
    columns: [
      { id: 'field', label: 'Field' },
      { id: 'source', label: 'Source' },
      { id: 'why', label: 'Why' },
    ],
  },
  { op: 'row_add', widgetId: 'pen', id: 'r1', cells: { field: 'Penalty applicable (Y/N)', source: 'LM at resolution', why: 'Not recorded today' } },
  { op: 'row_add', widgetId: 'pen', id: 'r2', cells: { field: 'Penalty amount', source: 'Contract slab', why: 'Drives deduction' } },
  { op: 'row_add', widgetId: 'pen', id: 'r3', kind: 'suggestion', cells: { field: 'Penalty status (pending/applied/waived)', source: 'Finance', why: 'Closes the loop with payments' } },
  { op: 'node_add', widgetId: 'proc', id: 'pflag', kind: 'suggestion', label: 'Tag penalty applicability at RCA stage' },
  { op: 'edge_add', widgetId: 'proc', id: 'e_rca_pflag', source: 'rca', target: 'pflag', kind: 'suggestion' },
  { op: 'edge_add', widgetId: 'proc', id: 'e_pflag_update', source: 'pflag', target: 'update', kind: 'suggestion' },
  { op: 'node_flag', widgetId: 'proc', id: 'penalty', question: 'Does this survive a courier partner disputing the RCA? Who arbitrates?' },
])
sleep(DELAY)

// --- Turn 3: ageing + critical tagging -------------------------------------
apply('Turn 3 - "escalate ageing tickets, tag some as critical"', [
  { op: 'widget_create', id: 'sla', type: 'timeline', title: 'Ageing ticket escalation ladder' },
  { op: 'node_add', widgetId: 'sla', id: 't0', order: 1, marker: 'T+0', label: 'Ticket routed, TAT committed' },
  { op: 'node_add', widgetId: 'sla', id: 't50', order: 2, marker: '50% of TAT', label: 'Auto nudge to courier channel' },
  { op: 'node_add', widgetId: 'sla', id: 't100', order: 3, marker: 'TAT breach', label: 'Escalate to courier account manager' },
  { op: 'node_add', widgetId: 'sla', id: 't200', order: 4, marker: 'TAT + 100%', label: 'LM escalates to leadership', kind: 'suggestion' },
  { op: 'group_add', widgetId: 'proc', id: 'vendor', label: 'Courier partner responsibility' },
  { op: 'node_update', widgetId: 'proc', id: 'tat', groupId: 'vendor' },
  { op: 'node_update', widgetId: 'proc', id: 'rca', groupId: 'vendor' },
])
sleep(DELAY)

// --- Turn 4: prioritization -------------------------------------------------
apply('Turn 4 - "prioritize these 6 ideas"', [
  { op: 'widget_create', id: 'prio', type: 'quadrant', title: 'What to build first' },
  { op: 'quadrant_set_axes', widgetId: 'prio', xLabel: 'Effort', yLabel: 'Impact' },
  { op: 'node_add', widgetId: 'prio', id: 'q1', cell: 'tl', label: 'Penalty flag on ticket' },
  { op: 'node_add', widgetId: 'prio', id: 'q2', cell: 'tl', label: 'Critical tag + priority queue' },
  { op: 'node_add', widgetId: 'prio', id: 'q3', cell: 'tr', label: 'Auto ageing escalation ladder' },
  { op: 'node_add', widgetId: 'prio', id: 'q4', cell: 'tr', label: 'Courier scorecard' },
  { op: 'node_add', widgetId: 'prio', id: 'q5', cell: 'bl', label: 'TAT auto-communication to customer' },
  { op: 'node_add', widgetId: 'prio', id: 'q6', cell: 'br', label: 'Full penalty-to-payment automation' },
])
sleep(DELAY)

// --- Turn 5: responding to suggestions + styling ----------------------------
apply('Turn 5 - accept one suggestion with edits, reject another, recolor', [
  { op: 'suggestion_accept', widgetId: 'proc', id: 'pflag', label: 'LM tags penalty applicability at RCA' },
  { op: 'suggestion_accept', widgetId: 'proc', id: 'e_rca_pflag' },
  { op: 'suggestion_accept', widgetId: 'proc', id: 'e_pflag_update' },
  { op: 'suggestion_reject', widgetId: 'sla', id: 't200' },
  { op: 'node_update', widgetId: 'proc', id: 'tat', style: { fill: 'orange', border: 'orange' } },
  { op: 'node_update', widgetId: 'proc', id: 'rca', style: { fill: 'orange', border: 'orange' } },
  { op: 'node_update', widgetId: 'proc', id: 'penalty', style: { fill: 'red', border: 'red' } },
])

console.log(`\nreplay complete - board "${BOARD}"`)
