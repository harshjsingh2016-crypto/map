# Map — a conversational visual scratchpad

Brainstorm out loud with Claude Code; a live board next to the conversation fills in with flowcharts, mind maps, notes, tables, schemas, timelines, and prioritization quadrants as you talk.

```bash
npm install
npm run dev          # board at http://localhost:5173
```

Then just describe something in Claude Code — a process, a concept you're learning, a decision you're weighing. Claude draws it while replying, using the protocol in [CLAUDE.md](CLAUDE.md).

To see it in motion without saying anything:

```bash
npm run demo
```

That replays two worked conversations — a logistics escalation process and a SQL lecture — as separate boards.

## How it works

```
Claude Code ──ops──▶ boards/<name>.board.jsonl ──watch──▶ server ──SSE──▶ React Flow board
```

Claude never writes HTML or pixels. It appends small, validated JSON **operations** to an append-only log; the board is the result of replaying them. That is what makes it fast (a turn is a handful of ops, applied incrementally), safe (a write gate rejects malformed or dangling ops before they land), and reversible (undo truncates the log; the client resets and replays).

Layout is not Claude's job either: elkjs arranges each widget and the board packs them bottom-left-fill, so a board stays legible as it grows.

## Folders and boards

Maps live one folder deep — `boards/<folder>/<name>.board.jsonl`. A folder is a workspace (a client, a course, a project); a board is one map inside it. Both are plain files, so a whole workspace is a directory you can copy or commit.

Folders and boards are managed **from the conversation** — "start a board for X", "put this in the scalar folder". The app is display-only: it shows which folder you're in and which board you're looking at.

```bash
node scripts/boards.mjs list                       # folders and their boards
node scripts/boards.mjs folder scalar              # switch working folder (creates it)
node scripts/boards.mjs create pricing-model       # new board in that folder
node scripts/boards.mjs use scalar/pricing-model   # switch active board
node scripts/boards.mjs move scalar/pricing-model archive
```

`boards/.active` is Claude's write target (`<folder>/<name>`) and `boards/.folder` the working folder; the app follows both unless you untick **follow active** and pick a board yourself. Commands taking `--board` accept `folder/name`, or a bare `name` when it's unique.

## Widget types

`flowchart` · `mindmap` · `note` · `table` · `schema` · `timeline` · `quadrant`

Any number of them coexist on one board. Flowcharts support decision shapes, labeled branches, and named groups (swimlanes). Mind map branches collapse to a `+N` badge — click the toggle or let Claude set it.

## Suggestions and flags

Claude's own additions render as dashed **ghost** elements, so your thinking and its thinking never blur together. Say the word and it becomes real:

- "yes, add that" → `suggestion_accept`
- "accept it but call it X" → accept with an edit
- "drop that one" → `suggestion_reject`

It can also pin a **question flag** (amber `?`) on one of your nodes to challenge an assumption, rather than only ever adding more boxes.

## Colors

Everything takes a color: board background, node fill/border/text, edge stroke, dash and arrow style, table headers, individual cells, group frames. Palette tokens (`blue`, `amber`, `red`, …) adapt to light and dark automatically; hex works too.

> "make the courier partner steps orange" · "highlight the penalty column red" · "give this board a dark background"

## Export

```bash
node scripts/outline.mjs --board <name> --md --out board.md
```

Mind maps become nested bullets, tables become markdown tables, flowcharts become numbered steps with branches; suggestions and flags stay marked.

## Other commands

```bash
node scripts/undo.mjs --board <name> [--count N]   # remove the last N batches
node scripts/outline.mjs --board <name>            # compact outline
node scripts/shot.mjs --out shot.png               # headless screenshot
npm test                                           # validation + reducer + golden export
npm run test:live                                  # browser checks (needs npm run dev)
npm run test:stress                                # watcher ordering under rapid writes
npm run test:reconnect                             # survives an API-server restart
```

## Current limits

- The board is **view-only** — panning, zooming, and collapsing branches are yours; content changes come through the conversation.
- **Edges can't cross widgets.** Both ends must live in the same widget.
- Log compaction isn't implemented, though the snapshot line format is reserved and readers already honor it.
