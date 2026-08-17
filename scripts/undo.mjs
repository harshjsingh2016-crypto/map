#!/usr/bin/env node
// Remove the last N op batches from a board (default 1).
//   node scripts/undo.mjs --board <name> [--count N]
// Rewrites the file atomically (temp + rename) so the watcher never reads a
// partial file; the server detects the shrink and tells clients to reset.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readBoardLog, boardPath, getActiveBoard, listBoards, splitCompleteLines, resolveBoardId } from '../shared/log.mjs'
import { materialize } from '../shared/reduce.mjs'
import { summarize } from '../shared/summary.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
let board = null, count = 1
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--board') board = argv[++i]
  else if (argv[i] === '--count') count = parseInt(argv[++i], 10)
}
if (!board) board = getActiveBoard(ROOT)
if (!board) { console.error('ERROR: no board specified and no active board.'); process.exit(1) }
if (!Number.isInteger(count) || count < 1) { console.error('ERROR: --count must be a positive integer'); process.exit(1) }

{
  const { id, matches } = resolveBoardId(ROOT, board)
  if (!id && matches.length > 1) {
    console.error(`ERROR: board "${board}" exists in more than one folder: ${matches.map((m) => m.id).join(', ')}`)
    process.exit(1)
  }
  if (id) board = id
}
const bp = boardPath(ROOT, board)
if (!fs.existsSync(bp)) {
  console.error(`ERROR: board "${board}" does not exist. Existing: ${listBoards(ROOT).map((b) => b.id).join(', ') || '(none)'}`)
  process.exit(1)
}

const text = fs.readFileSync(bp, 'utf8')
const { lines } = splitCompleteLines('', text)
if (!lines.length) { console.log('board is already empty — nothing to undo'); process.exit(0) }

const keep = lines.slice(0, Math.max(0, lines.length - count))
const tmp = `${bp}.tmp`
fs.writeFileSync(tmp, keep.length ? keep.join('\n') + '\n' : '', 'utf8')
fs.renameSync(tmp, bp)

const { entries } = readBoardLog(bp)
const { state } = materialize(entries, { strict: false })
console.log(`UNDONE ${Math.min(count, lines.length)} batch(es) → ${summarize(state, board)}`)
