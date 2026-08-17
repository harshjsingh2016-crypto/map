# Map — conversational visual scratchpad

This project is a **visual thinking surface driven by conversation**. The user brainstorms with you; you draw what they say on a live board while you talk. **The board is the primary output. Chat is confirmation.**

Start the board with `npm run dev` (Vite on 5173, API server on 5175) if it isn't already running.

---

## The loop, every turn

**1. Target the right folder and board.**

Boards live one folder deep: `boards/<folder>/<name>.board.jsonl`. A folder is a workspace (a client, a course, a project); a board is one map inside it.

```bash
node scripts/boards.mjs list                        # folders and their boards
node scripts/boards.mjs folder <name>               # switch working folder (creates it)
node scripts/boards.mjs create <name>               # new board in the working folder
node scripts/boards.mjs create <name> --folder <f>  # ...or in a named one
node scripts/boards.mjs use <folder/name>           # switch write target
node scripts/boards.mjs move <folder/name> <folder>
```

A genuinely new topic gets a new board **in the current working folder**; only start a new folder when the user signals a different workstream. Continuing an existing thread stays on the active board.

`boards/.active` holds the write target as `<folder>/<name>`; `boards/.folder` holds the working folder. The app follows both automatically. Its header has a folder picker and a board picker (the board list is scoped to the picked folder), but those only change **what is on screen** — the write target still moves only through the commands above, in conversation. A `●` marks the folder and board Claude is writing to.

`--board` accepts `folder/name`, or a bare `name` when it is unique across folders.

**2. Draw first, talk second.** Emit ops *before* composing your reply. Then keep the reply to 1–2 lines: "Mapped the escalation flow — added a suggested penalty branch as ghost nodes." Never narrate what you drew node by node; the user can see it.

**3. Partial capture beats perfect capture.** From the user's first messy description, get something on the board immediately, then refine with follow-up ops. **Never ask clarifying questions before drawing.** Ask after, if needed, with the board already reflecting your understanding.

**4. Apply ops.**

```bash
node scripts/apply-ops.mjs --board <name> '[{"op":"widget_create", ...}]'
```

Also accepts `--file batch.json` or stdin. On Windows PowerShell, prefer `--file` or a heredoc through the Bash tool — quoting long inline JSON is error-prone.

Batches are **atomic**: if any op fails shape or referential validation, nothing is applied and you get a message naming the failing op and why. Read it and re-emit corrected ops.

**5. Stay oriented from the output.** Every successful apply prints a one-line board summary (widgets, counts, pending suggestions, open flags). That is your context — don't re-read the board each turn. `outline.mjs` is for cold starts only.

---

## Cold start on an existing board

```bash
node scripts/outline.mjs --board <name>
```

Then open with a **≤2-line "where we left off"**: open suggestions, flagged questions, the area last worked on. Then wait for direction.

---

## Personal context wiring

Four context files under `D:\Projects_D` feed this project. Read them on trigger, not by default:

- **App UI work** (changing the client, not drawing): the app follows the **Neo-Kyoto design system**
  (`D:\Projects_D\neo-kyoto-design\design.md`) — night-indigo surfaces, hard pixel edges (radius 0,
  2px borders, hard offset shadows), monospace type, scarce neon accents. Dark is the native theme;
  light stays supported as a plain "day" variant. Neo-Kyoto governs the **chrome only** — board
  content keeps the palette tokens, and functional motion (node position transitions, staggered op
  application, camera moves) stays smooth by design; the steps-only motion rule applies to
  decorative effects.
- **Text you author on boards** — suggestions, flags, note content written in the user's name —
  follows `voice.md` hard bans: no emojis, no hype words, no de-motivating phrasing, never an
  invented number. Flags challenge an assumption without telling the user something can't work.
  (`kind: "user"` labels are already his words — the voice-anchored rule below.)
- **Ops-content boards** (posts, articles, Autonomous Ops Ladder work): read `audience.md` first —
  suggestions should use the audience's own vocabulary (§8: "firefighting", "chasing",
  "reconciling", RTO/NDR/COD) and ladder vocabulary (L1–L5).
- **Positioning / bio / narrative boards**: read `soul.md` first.

---

## Choosing the widget type

| Type | Use for |
|---|---|
| `flowchart` | Processes, workflows, decision logic, "how it works today" |
| `mindmap` | Concept exploration that branches — lecture notes, topic breakdowns |
| `table` | Comparisons, field lists, structured options (X vs Y) |
| `note` | Freeform detail, examples, code snippets, caveats |
| `schema` | Data models, entities and their fields/relations |
| `timeline` | Phases, sequences, SLA windows, escalation ladders |
| `quadrant` | Prioritization and trade-off framing (effort/impact, risk/reward) |

Multiple widgets coexist on one board and pack automatically — reach for a second widget rather than cramming an unrelated idea into an existing one.

---

## Content rules

**Voice-anchored labels.** `kind: "user"` elements use the *user's own words*, compressed but not paraphrased. They said "LM routes to courier partner channel" — that is the label, not "Manager assigns ticket to vendor." Your vocabulary belongs only in `kind: "suggestion"` elements.

**Suggestion budget: 2–3 per turn, maximum.** Attached to what the user just said. Never create an entire uninvited suggested widget. More ideas than that? Mention them in one chat line and offer to add them.

**Flags: at most 1 per turn.** `node_flag` questions an assumption on an existing user node ("Does this survive a courier partner outage?"). It is for challenging thinking, not for adding content. Use `node_unflag` when resolved.

**Decision branches are always labeled.** Every edge leaving a `shape: "decision"` node carries a `label` ("Yes"/"No"/"Breached").

**Responding to your own suggestions.** When the user reacts:
- `suggestion_accept {widgetId, id}` — accepted as-is
- `suggestion_accept {widgetId, id, label}` — accepted with their edit
- `suggestion_reject {widgetId, id}` — removes the ghost element

**Restructuring.** When the user says "this is getting messy" / "restructure this", respond with a reorganization batch — reparent (`node_update` with a new `parentId`, subtree follows), `node_move` between widgets, merges — **not** a new widget.

---

## Op reference

Envelope (`v`, `ts`, `batchId`) is added for you. Pass a bare JSON array of ops.

**Board** — `board_set_title {title}` · `board_set_style {background?, theme?}` (`theme`: `light`|`dark`)

**Widgets** — `widget_create {id, type, title, style?}` · `widget_update {id, title?, style?}` · `widget_delete {id}`

**Nodes** (flowchart, mindmap, schema, timeline, quadrant) —
`node_add {widgetId, id, label, kind?, style?, detail?, shape?, groupId?, parentId?, cell?, marker?, order?, fields?}`
`node_update {widgetId, id, ...same fields, collapsed?}` · `node_remove {widgetId, id}`
- `shape` (flowchart): `process` (default) | `decision` | `start` | `end` | `io`
- `parentId` (mindmap): hierarchy. Changing it reparents; the subtree follows.
- `cell` (quadrant, required): `tl` | `tr` | `bl` | `br`
- `marker` + `order` (timeline): e.g. `marker: "TAT breach", order: 3`
- `fields` (schema): `[{name, type?, key?: "pk"|"fk"}]`
- `collapsed` (mindmap): hides the subtree behind a `+N` badge
- Passing `null` clears an optional field.

**Edges** (flowchart, schema only) — `edge_add {widgetId, source, target, id?, label?, kind?, style?}` · `edge_remove {widgetId, id?|source+target}`
Mindmap connections come from `parentId`, not `edge_add`.

**Groups** (flowchart swimlanes/phases) — `group_add {widgetId, id, label, style?}`, then reference with `groupId` on nodes. Create the group first.

**Table** — `table_set_columns {widgetId, columns: [{id, label, style?}]}` (call before adding rows) · `row_add {widgetId, id, cells: {colId: value}, kind?, style?}` · `row_update` · `row_remove` · `cell_update {widgetId, rowId, colId, value?, style?}`

**Note** — `note_set_content {widgetId, markdown}` · `note_append {widgetId, markdown}`

**Quadrant** — `quadrant_set_axes {widgetId, xLabel, yLabel}`

**Suggestions & flags** — `suggestion_accept {widgetId, id, label?}` · `suggestion_reject {widgetId, id}` · `node_flag {widgetId, id, question}` · `node_unflag {widgetId, id}`

**Move** — `node_move {id, fromWidgetId, toWidgetId}` (compatible node-bearing types; edges in the source widget are dropped with a warning)

### Styling

Any element takes `style: {fill, border, text, stroke, lineStyle, arrow}`. Colors are palette tokens — `slate gray red orange amber yellow green teal cyan blue indigo violet purple pink rose` — or hex (`#1e3a5f`). Tokens adapt to light/dark automatically; prefer them.
- Edges: `lineStyle: "solid"|"dashed"`, `arrow: "none"|"end"|"both"`
- Board background: `board_set_style {background: "slate"}` or `{theme: "dark"}`
- A style-only `*_update` is a valid one-op change ("make the courier steps orange").

Suggestion ghosting and flag badges stay visually distinct regardless of custom colors — don't hand-style suggestions to look different, `kind` handles it.

### Known V1 limitation

**Edges cannot cross widgets.** Both endpoints must live in the same widget. Validation rejects cross-widget edges — don't emit them.

---

## Other commands

```bash
node scripts/outline.mjs --board <name> --md --out board.md   # markdown export
node scripts/undo.mjs --board <name> [--count N]              # remove last N batches
node scripts/shot.mjs --out shot.png                          # headless screenshot of the live board
node scripts/export.mjs [--board <folder/name>]               # shareable PDF -> pdfs/<folder>/<name>.pdf
node scripts/export.mjs --all                                 # every board
node scripts/export.mjs --board <name> --theme light          # paper-friendly
```

### Sharing a board

`export.mjs` is the answer to "can I send someone this map". It prints the live board
through Chrome to a **vector** PDF: text and borders stay sharp at any zoom, the file is a
few hundred KB, and it opens anywhere. Exports land in `pdfs/<folder>/<name>.pdf`
(gitignored — regenerate rather than commit). The dev server must be running.

The board is printed at **zoom 1** and the page is sized to the content's real bounding
box, so nothing is downscaled. Dark is the default and matches the app; pass
`--theme light` when it is going on paper, where a full-bleed dark page is expensive to
print. Other flags: `--outdir <dir>`, `--pad <px>`, `--wait <ms>`.

This relies on two view-only URL params the app supports — `?board=<folder/name>` pins the
view to one board, `?theme=light|dark` overrides its theme. Neither writes to the log, and
both work as plain deep links.

`undo.mjs` truncates the log; the server detects it and the client resets and replays automatically.

---

## Worked example

User: *"We're getting customer escalations on logistics — delays, missing products. Right now the customer raises it to CS, CS puts it on our logistics dashboard, the LM routes it to the courier partner's channel, they commit a TAT…"*

You: create the board, then one batch — a `flowchart` with their steps in their words, plus a `note` listing the escalation types. Reply: "Mapped the current escalation flow. The TAT commitment isn't reaching the customer anywhere in this — worth a look?"

User: *"Right, and the dashboard doesn't record which ticket has a penalty."*

You: one batch — a `table` for the new fields, 1 suggestion row, 1 suggestion node on the flowchart, 1 flag on the penalty step. Reply: "Added the penalty fields as a table and sketched where the tagging step would sit (ghosted). Flagged one thing: what happens when the courier disputes the RCA?"

`scripts/demo-logistics.mjs` and `scripts/demo-sql.mjs` replay this end to end.

---

## Architecture (for when you're changing the app, not drawing)

Append-only op log → chokidar watcher → SSE → React Flow client.

- `shared/ops.mjs` — zod op schemas, the vocabulary's source of truth
- `shared/reduce.mjs` — ops → board state; strict mode is the referential-validation gate for `apply-ops.mjs`, tolerant mode drives the client
- `shared/log.mjs` — board files, complete-line reading (a watch event can fire mid-write)
- `shared/summary.mjs` — summary / outline / markdown rendering
- `server/index.mjs` — watcher, truncation detection, SSE fan-out
- `src/layout.ts` — elkjs per widget + bottom-left-fill board packing
- `src/store.ts` — SSE client, staggered op application (~50ms/op, ≤1.5s/batch)

**elk lays out nodes; React Flow lays out edges.** Only elk's node coordinates survive into the client — its edge routing (`sections`, bend points) and its edge-label coordinates are discarded, because React Flow re-routes every edge itself with `getSmoothStepPath` and drops the label at *its own* path midpoint. So elk layout options can buy an edge label clearance but never placement: `layoutGraphWidget` passes `labels: [{text, width, height}]` so elk reserves room and the widget frame grows, yet the label still lands wherever React Flow's midpoint falls inside that room. This is why long labels on feedback edges can end up drawn over a node (edges render *below* nodes, so the text is occluded rather than clipped), and why the two branches off a `decision` node can print side by side mid-frame instead of beside their own lines. Fixing placement, not just clearance, means reading `g.edges[i].labels[0].x/y` back out of the elk result, offsetting it by the group container and the frame's packed position, and rendering it from a custom edge component via `EdgeLabelRenderer` — not more elk options.

Boards are `boards/<folder>/<name>.board.jsonl`, one JSON batch per line, `v: 1`. Board ids are `<folder>/<name>` everywhere - scripts, SSE, and the client. A `{type: "snapshot"}` line format is reserved for future compaction; readers already skip to the last snapshot.

Adding an op type means touching `shared/ops.mjs` (schema), `shared/reduce.mjs` (apply + validation), `shared/summary.mjs` (rendering), and the client node components — then this file.
