#!/usr/bin/env node
// The write gate. Usage:
//   node scripts/apply-ops.mjs --board <name> '<json ops array>'
//   node scripts/apply-ops.mjs --board <name> --file batch.json
//   echo '[...]' | node scripts/apply-ops.mjs --board <name>
//   ... plus [--root <dir>] to write another project's boards (default: Map's own)
//
// Input: a JSON array of ops, or {"ops": [...]}. The script adds the
// envelope (v, ts, batchId). Batches are ATOMIC: shape validation (zod) +
// referential validation (against materialized state) run for every op;
// if any op fails, the whole batch is rejected and nothing is appended.
// On success, prints a one-line board summary.
import fs from 'node:fs'
import { opSchema, LOG_VERSION } from '../shared/ops.mjs'
import { materialize, applyOp } from '../shared/reduce.mjs'
import { readBoardLog, getActiveBoard, setActiveBoard } from '../shared/log.mjs'
import { listAllBoards, resolveBoard, mountRefusal } from '../shared/mounts.mjs'
import { resolveRoot } from '../shared/root.mjs'
import { summarize } from '../shared/summary.mjs'

const { root: ROOT, argv, isHome } = resolveRoot()

function die(msg) {
  console.error(`REJECTED: ${msg}`)
  process.exit(1)
}

// --- parse args -------------------------------------------------------------
let board = null
let file = null
let inline = null
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--board') board = argv[++i]
  else if (argv[i] === '--file') file = argv[++i]
  else inline = argv[i]
}
const allIds = () => listAllBoards(ROOT).boards.map((b) => b.id).join(', ') || '(none)'
if (!board) board = getActiveBoard(ROOT)
if (!board) die(`no board specified and no active board set. Use --board <folder/name> or scripts/boards.mjs use <folder/name>. Existing boards: ${allIds()}`)
// Accept "folder/name" or a bare unique name.
const loc = resolveBoard(ROOT, board)
if (!loc.id && loc.matches.length > 1) {
  die(`board "${board}" exists in more than one folder: ${loc.matches.map((m) => m.id).join(', ')}. Use the full folder/name.`)
}
if (loc.id) board = loc.id
// Mounted projects are read-only from here; their own sessions write them.
if (loc.mounted) die(mountRefusal(`board "${board}"`, loc))
if (!loc.path) die(`"${board}" is not a valid board id (want folder/name)`)

let raw
if (file) {
  try { raw = fs.readFileSync(file, 'utf8') } catch (e) { die(`cannot read --file ${file}: ${e.message}`) }
} else if (inline) {
  raw = inline
} else {
  raw = fs.readFileSync(0, 'utf8') // stdin
}

let input
try {
  input = JSON.parse(raw)
} catch (e) {
  die(`input is not valid JSON: ${e.message}`)
}
const ops = Array.isArray(input) ? input : input?.ops
if (!Array.isArray(ops) || ops.length === 0) die('input must be a non-empty JSON array of ops, or {"ops": [...]}')

// --- load current state -----------------------------------------------------
const bp = loc.path
if (!fs.existsSync(bp)) {
  die(`board "${board}" does not exist. Create it first: node scripts/boards.mjs create <name> --folder <folder>. Existing boards: ${allIds()}`)
}
const { entries, errors, lastBatchId } = readBoardLog(bp)
if (errors.length) {
  console.error(`WARNING: board log has ${errors.length} unreadable line(s): ${errors[0]}`)
}
const { state } = materialize(entries, { strict: false })

// --- validate the whole batch (atomic: reject everything on first failure) --
const validated = []
const warnings = []
for (let i = 0; i < ops.length; i++) {
  const shape = opSchema.safeParse(ops[i])
  if (!shape.success) {
    const issue = shape.error.issues[0]
    die(`op ${i + 1} (${ops[i]?.op || 'missing "op" field'}) failed shape validation — ${issue.path.join('.') || '(root)'}: ${issue.message}. Nothing was applied.`)
  }
  try {
    // Apply sequentially so later ops can reference earlier ops in the batch.
    warnings.push(...applyOp(state, shape.data, { strict: true }))
  } catch (e) {
    die(`op ${i + 1} (${shape.data.op}) failed referential validation — ${e.message}. Nothing was applied (batches are all-or-nothing).`)
  }
  validated.push(shape.data)
}

// --- append -----------------------------------------------------------------
const batch = { v: LOG_VERSION, ts: Date.now(), batchId: lastBatchId + 1, ops: validated }
fs.appendFileSync(bp, JSON.stringify(batch) + '\n', 'utf8')
setActiveBoard(ROOT, board)

for (const w of warnings) console.log(`WARNING: ${w}`)
if (!isHome) console.log(`root: ${ROOT}`)
console.log(`APPLIED batch ${batch.batchId} (${validated.length} op${validated.length > 1 ? 's' : ''}) → ${summarize(state, board)}`)
