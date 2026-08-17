#!/usr/bin/env node
// Compact board outline (cold starts) and markdown export.
//   node scripts/outline.mjs --board <name>
//   node scripts/outline.mjs --board <name> --md [--out file.md]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { materialize } from '../shared/reduce.mjs'
import { readBoardLog, boardPath, getActiveBoard, listBoards, resolveBoardId } from '../shared/log.mjs'
import { outline, toMarkdown, summarize } from '../shared/summary.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
let board = null, md = false, out = null
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--board') board = argv[++i]
  else if (argv[i] === '--md') md = true
  else if (argv[i] === '--out') out = argv[++i]
}
const allIds = () => listBoards(ROOT).map((b) => b.id).join(', ') || '(none)'
if (!board) board = getActiveBoard(ROOT)
if (!board) {
  console.error(`ERROR: no board specified and no active board. Existing: ${allIds()}`)
  process.exit(1)
}
{
  const { id, matches } = resolveBoardId(ROOT, board)
  if (!id && matches.length > 1) {
    console.error(`ERROR: board "${board}" exists in more than one folder: ${matches.map((m) => m.id).join(', ')}`)
    process.exit(1)
  }
  if (id) board = id
}
const bp = boardPath(ROOT, board)
const { entries, errors, exists } = readBoardLog(bp)
if (!exists) {
  console.error(`ERROR: board "${board}" does not exist. Existing: ${allIds()}`)
  process.exit(1)
}
for (const e of errors) console.error(`WARNING: ${e}`)
const { state } = materialize(entries, { strict: false })

const text = md ? toMarkdown(state, board) : `${summarize(state, board)}\n\n${outline(state, board)}`
if (out) {
  fs.writeFileSync(out, text, 'utf8')
  console.log(`wrote ${out}`)
} else {
  console.log(text)
}
