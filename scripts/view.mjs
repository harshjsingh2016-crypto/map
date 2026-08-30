#!/usr/bin/env node
// Move the board window's camera from a conversation. Nothing is written to
// the board — this is an ephemeral command posted to the running server and
// fanned out over SSE to whoever is watching that board right now. A view
// command must never become an op: the log is append-only content, and it
// would replay on every load.
//
//   node scripts/view.mjs latest                  # the newest widget
//   node scripts/view.mjs focus <widgetId|nodeId> # a named target
//   node scripts/view.mjs back [--count 2]        # step the view history
//   node scripts/view.mjs forward
//   node scripts/view.mjs fit                     # whole board
//   ... plus [--board <folder/name>] (defaults to the active board)
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getActiveBoard, resolveBoardId } from '../shared/log.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PORT = process.env.MAP_SERVER_PORT || 5175
const ACTIONS = ['latest', 'back', 'forward', 'fit', 'focus']

const argv = process.argv.slice(2)
let board = null, count = 1, action = null, target = null
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--board') board = argv[++i]
  else if (argv[i] === '--count') count = parseInt(argv[++i], 10)
  else if (!action) action = argv[i]
  else if (!target) target = argv[i]
}

if (!action || !ACTIONS.includes(action)) {
  console.error(`ERROR: expected one of ${ACTIONS.join(', ')}${action ? ` — got "${action}"` : ''}`)
  process.exit(1)
}
if (action === 'focus' && !target) {
  console.error('ERROR: focus needs a target, e.g. `view.mjs focus w-status`')
  process.exit(1)
}
if (!Number.isInteger(count) || count < 1) {
  console.error('ERROR: --count must be a positive integer')
  process.exit(1)
}

if (!board) board = getActiveBoard(ROOT)
if (!board) { console.error('ERROR: no board specified and no active board.'); process.exit(1) }
{
  const { id, matches } = resolveBoardId(ROOT, board)
  if (!id && matches.length > 1) {
    console.error(`ERROR: board "${board}" exists in more than one folder: ${matches.map((m) => m.id).join(', ')}`)
    process.exit(1)
  }
  if (id) board = id
}

let res
try {
  res = await fetch(`http://localhost:${PORT}/api/view`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ board, action, target, count }),
  })
} catch {
  console.error(`ERROR: no Map server on port ${PORT}. Start it with \`npm run dev\`.`)
  process.exit(1)
}

const body = await res.json().catch(() => ({}))
if (!res.ok) {
  console.error(`ERROR: ${body.error || res.statusText}`)
  process.exit(1)
}
// Delivered to nobody means the board is not open on screen. Worth saying —
// the command is ephemeral, so it is simply gone, not queued.
const what = action === 'focus' ? `${action} ${target}` : action === 'latest' || action === 'fit' ? action : `${action} x${count}`
console.log(body.delivered
  ? `VIEW ${what} → board "${board}" (${body.delivered} window${body.delivered === 1 ? '' : 's'})`
  : `VIEW ${what} → board "${board}": no window is showing this board, nothing moved.`)
