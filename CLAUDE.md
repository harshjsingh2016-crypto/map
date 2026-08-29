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

**2. Draw first, talk second.** Emit ops *before* composing your reply. Then keep the reply to 1–2 lines: "Mapped the escalation flow — added a suggested penalty branch as ghost nodes." Never narrate what you drew node by node; the user can see it. The one exception is **walkthrough mode** (below), which inverts this deliberately.

**3. Partial capture beats perfect capture.** From the user's first messy description, get something on the board immediately, then refine with follow-up ops. **Never ask clarifying questions before drawing.** Ask after, if needed, with the board already reflecting your understanding.

**4. Apply ops.**

```bash
node scripts/apply-ops.mjs --board <name> '[{"op":"widget_create", ...}]'
```

Also accepts `--file batch.json` or stdin. On Windows PowerShell, prefer `--file` or a heredoc through the Bash tool — quoting long inline JSON is error-prone.

Batches are **atomic**: if any op fails shape or referential validation, nothing is applied and you get a message naming the failing op and why. Read it and re-emit corrected ops.

**5. Stay oriented from the output.** Every successful apply prints a one-line board summary (widgets, counts, pending suggestions, open flags). That is your context — don't re-read the board each turn. `outline.mjs` is for cold starts only.

**6. File it in the wiki.** After the reply, update `wiki/` from what you just drew — from context, not by re-reading the board. One article per *concept* (`chain-of-thought.md`), never per board or per turn. If the turn deepened an existing concept, edit that article; if it introduced a genuinely new one, create the article and add it to `wiki/index.md` in the same turn. Bump `updated` and append to `boards:` in frontmatter when a new board touches an article. Articles are prose synthesis — what the user concluded and why, not a dump of node labels. Only accepted and user content goes in; pending suggestions and open flags stay on the board until resolved. Wiki prose follows the `voice.md` hard bans (no emojis, no hype, never an invented number). Skip this step only when the turn changed no content — style-only tweaks, board switching, undo.

---

## Cold start on an existing board

```bash
node scripts/outline.mjs --board <name>
```

Then open with a **≤2-line "where we left off"**: open suggestions, flagged questions, the area last worked on. Then wait for direction.

---

## Walkthrough mode (`armor-outputs/`)

`armor-outputs/` holds condensed context files — one `.md` per board, produced by the Armor
project's extraction pipeline (`D:\Projects_D\Armor`), which copies each deliverable here with its
`**Board:**` line at close-out. The context files themselves are **local only** (gitignored) —
they are large, and the same deliverable is already tracked in the Armor repo under `Output/`.
**Progress sidecars (`<name>.progress.md`) do sync**, alongside the boards and wiki: a walkthrough
cannot resume on the other laptop without the record of what was rejected and why.

A walkthrough is the **Learning** stage of Armor's per-lecture loop:
`Learning → Class Assignment → Internal QnA → Scaler QnA → Finished`. Armor's `INDEX.md` is the
stage ledger and Armor sessions run the later stages; this project runs Learning and shows the
stage on the board as a status strip (below). A walkthrough is **two jobs in one pass**: teach the
user each concept until they confirm they understand it, and capture the settled understanding on
the board. Teaching comes first — the board only ever records what the discussion settled.

Trigger: the user says "walk through <file>", names a file in `armor-outputs/`, or drops one in and asks to work it against a board.

**This mode inverts rule 2: talk first, draw on acceptance.** Nothing from the file reaches the board or the wiki until it has been discussed in chat and the user has accepted it. This is the only exception to draw-first.

**Setup (first turn):**

1. Read the context file. Its header is bold key-value lines (`**Course:**`, `**Lecture:**` …); the board mapping is the `**Board:** <folder>/<name>` line. Armor inserts it at close-out; if missing, propose a mapping, confirm it in chat, and add the line to the header.
2. `boards.mjs use <folder/name>` (create the board first — `boards.mjs create <name> --folder <folder>` — if it doesn't exist), then `outline.mjs --board <folder/name>`.
3. Ensure the **status strip** exists: a `timeline` widget with id `w-status`, title `Status`, five nodes in stage order. `layout.ts` pins `w-status` to the top-left slot on every board. If the board predates it, add it now:

   ```json
   [{"op":"widget_create","id":"w-status","type":"timeline","title":"Status"},
    {"op":"node_add","widgetId":"w-status","id":"n-learning","label":"Learning","order":1,"style":{"fill":"indigo","border":"indigo"}},
    {"op":"node_add","widgetId":"w-status","id":"n-assignment","label":"Class Assignment","order":2},
    {"op":"node_add","widgetId":"w-status","id":"n-internal-qna","label":"Internal QnA","order":3},
    {"op":"node_add","widgetId":"w-status","id":"n-scaler-qna","label":"Scaler QnA","order":4},
    {"op":"node_add","widgetId":"w-status","id":"n-finished","label":"Finished","order":5}]
   ```

   Convention: completed stages `{"fill":"green","border":"green"}`, the current stage `{"fill":"indigo","border":"indigo"}`, pending stages unstyled. **Set `fill` and `border` together** — `fill` colors the label chip, `border` colors the track dot, and a stage colored on only one reads as half-done. A stage skipped by the user's decision gets `marker: "skipped"` and stays unstyled. Stage changes are `node_update` style batches — Armor sessions also emit these (cross-repo) when their stages advance.
4. Read every wiki article whose `boards:` frontmatter lists that board.
5. Gap pass: walk the file section by section against board + wiki. Build an agenda of candidate items, each tagged **missed** (relevant, never boarded) or **refinement** (sharpens something already there — including open ghost suggestions the file confirms or contradicts). Skip what the board already covers.
6. Write the agenda to `<name>.progress.md` beside the file. Then open with the **summary and glossary**: a short chat summary of what the lecture covered and the list of concepts the walkthrough will go through, drawn from the file's glossary section and the section map — this is the syllabus for the sessions ahead. End with the first section queued. No ops this turn beyond the status strip; teaching starts when the user confirms the agenda.

**Each turn after — one section at a time, teach then draw:**

1. **Teach the section's concept like a teacher**: definition first, then mechanism, then the instructor's examples where they clarify — grounded strictly in the file. This is the one place in this project where a multi-paragraph chat reply is the point, not a failure of brevity.
2. **Discuss.** The user asks clarifying questions; answer from the file where it answers, and say plainly when a question goes beyond what the lecture covered (answering from general knowledge is fine, but label it as beyond the file). Don't move on until the user confirms the concept is clear.
3. **Then the board**: present 2–4 candidates from the section — one line each, tagged missed/refinement, low-confidence items named as such. When the user rules, apply everything accepted as **one batch** (plus `suggestion_accept`/`suggestion_reject` on existing ghosts the discussion settled), update the wiki in the same turn, update the progress file (mark the section `discussed ✓`). Then queue the next section.

**Completion:** when every section is discussed and ruled on, advance the status strip — Learning to green, Class Assignment to indigo — and hand back the next concrete action: complete the instructor's assignment, then run the Internal QnA drill in Armor. Everything after Learning is driven from Armor sessions.

**Rules in this mode:**

- Accepted items land as plain nodes (default `kind: "user"`) — the same thing `suggestion_accept` produces. The label is the phrasing settled in discussion, not the file's sentence. Don't create ghost suggestions for walkthrough content — the chat candidates replace them, and the 2–3 suggestion budget doesn't cap accepted items. Ideas of your own that go beyond the file still follow the normal budget.
- Flags: still at most 1 per turn.
- Provenance cites (`[video 0:17:04]`, `[notes p.2]`) stay in the file. Boards and the wiki never carry them — armor-outputs is local-only, so a cite is a dead reference on the other machine. If a source pointer matters, spell it out in `detail`.
- Material the file marks low-confidence ("coverage notes and cautions", garbled transcription) is never presented as fact. Raise it only with the caveat attached; if accepted anyway, the caveat goes into `detail`. Garbled numbers never land — the voice.md invented-number ban covers them.
- Rejected items are recorded with the reason and not re-raised.
- **The Internal QnA drill is Armor's, and it stays there.** The question sets, the user's answers, and Scaler corrections live in Armor's `QnA\<slug>.md` — none of it ever reaches the board or the wiki, in either direction. Boards and wiki carry the understood concepts; the drill record is a private learning log.

**Progress file** — `armor-outputs/<name>.progress.md`:

```
# Walkthrough — 2026-08-24_RAG_in_practice.md
Board: scalar/knowledge-management-and-rag
Updated: 2026-08-27
Agenda confirmed: 2026-08-27 (summary + glossary presented)

- [x] §2 recall check on retrieval — refinement — discussed ✓ — accepted
- [x] §2 real-world failure cases — missed — discussed ✓ — rejected (anecdotes, not structure)
- [>] §3 tool comparison table — missed — deferred
- [ ] §4 grounding tests — missed — pending
```

Statuses: `[ ]` pending · `[x]` accepted or rejected (say which; rejections carry the reason) · `[>]` deferred. `discussed ✓` marks that the user confirmed understanding of that section's concept — a section isn't done without it. Update the file every walkthrough turn, at the same time as the wiki step.

**Resuming on the other laptop.** The board, the wiki and the progress sidecar arrive through
`git pull` here. The context file does not — pull the Armor repo and copy
`Output/<name>.md` into `armor-outputs/`. Its `**Board:**` line travels with it, so the mapping
needs no reconstruction.

**Resuming:** read the progress file, outline the board, open with a ≤2-line "where we left off" ("Walkthrough of RAG in practice: §1–2 discussed and boarded, 3 accepted 1 rejected — next: §3, the three tools."), then wait for direction.

---

## Wiki

`wiki/` holds concept articles distilled from the boards — the durable, cross-machine record. Flat folder, kebab-case filenames, standard relative links (`[Chain of Thought](chain-of-thought.md)`), never wikilinks. Each article: frontmatter with `boards:` (the `folder/name` ids it draws from) and `updated:` (YYYY-MM-DD), exactly one H1, prose, and a `## Related` section of links with a short why-clause each. `wiki/index.md` is the master index — grouped under editorial theme headings, one line per article with a ~12-word hook; it is edited in the same turn any article is added or renamed.

```bash
node scripts/wiki.mjs list    # articles + orphan flags
node scripts/wiki.mjs check   # dead links, index drift, frontmatter — also runs in tests
```

**Two-laptop sync.** Boards and the wiki are committed and synced through git (`origin` on GitHub); the user alternates machines, never simultaneously. `npm run dev` handles it: `sync pull` before the servers start (first pushing any local unpushed work — a missed shutdown push is caught here), `sync push` when they exit. `npm run sync push` works any time; on divergence, sync stops and asks for manual resolution rather than merging board logs.

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
node scripts/wiki.mjs list                                    # wiki articles + orphan flags
node scripts/wiki.mjs check                                   # wiki dead links / index drift
npm run sync push                                             # commit + push boards and wiki now
node scripts/sync.mjs status                                  # ahead/behind + dirty files
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
- `src/layout.ts` — elkjs per widget + bottom-left-fill board packing (`w-status` always packs first)
- `src/store.ts` — SSE client, staggered op application (~50ms/op, ≤1.5s/batch)
- `scripts/wiki.mjs` — wiki link/index checker (`list`, `check`)
- `scripts/sync.mjs` + `scripts/dev.mjs` — two-laptop git sync (pull on start, push on exit)

**elk lays out nodes; React Flow lays out edges.** Only elk's node coordinates survive into the client — its edge routing (`sections`, bend points) and its edge-label coordinates are discarded, because React Flow re-routes every edge itself with `getSmoothStepPath` and drops the label at *its own* path midpoint. So elk layout options can buy an edge label clearance but never placement: `layoutGraphWidget` passes `labels: [{text, width, height}]` so elk reserves room and the widget frame grows, yet the label still lands wherever React Flow's midpoint falls inside that room. This is why long labels on feedback edges can end up drawn over a node (edges render *below* nodes, so the text is occluded rather than clipped), and why the two branches off a `decision` node can print side by side mid-frame instead of beside their own lines. Fixing placement, not just clearance, means reading `g.edges[i].labels[0].x/y` back out of the elk result, offsetting it by the group container and the frame's packed position, and rendering it from a custom edge component via `EdgeLabelRenderer` — not more elk options.

**Banded flowcharts.** A flowchart whose groups are self-contained — every edge stays
inside one group, no ungrouped nodes, more than one group — is laid out as horizontal
**bands** stacked in `group_add` order instead of going through the shared hierarchical
pass. Each band runs left to right and keeps its declared node order; a band with no
edges of its own is placed as a plain row. This is what makes a start / paths / goal
frame (or top-to-bottom swimlanes) come out as full-width strips. Add a single
cross-group edge and the widget falls back to the hierarchical layout, where elk's
model-order options do not survive `INCLUDE_CHILDREN` and in-layer order is elk's to
choose.

Boards are `boards/<folder>/<name>.board.jsonl`, one JSON batch per line, `v: 1`. Board ids are `<folder>/<name>` everywhere - scripts, SSE, and the client. A `{type: "snapshot"}` line format is reserved for future compaction; readers already skip to the last snapshot.

Adding an op type means touching `shared/ops.mjs` (schema), `shared/reduce.mjs` (apply + validation), `shared/summary.mjs` (rendering), and the client node components — then this file.
