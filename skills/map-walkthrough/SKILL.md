---
name: map-walkthrough
description: Walk through an Armor lecture deliverable (Output/<slug>.md) against its Map board — teach each section, then board what the discussion settled. Use when the user says "walk through <file>", names a file in Output/, asks to resume a walkthrough, or to run a primer express walk. Runs inside the repo that owns the lecture boards (Armor).
---

# Map walkthrough

This runs in the repo that holds the lecture boards, wiki and context files (Armor). The drawing
tools belong to the Map project at `{{MAP_HOME}}`; the op vocabulary, content rules, wiki
conventions and command forms are in the **map-blueprint** skill — load it first if it is not
already in context. Every Map command here is run as:

```bash
node "{{MAP_HOME}}/scripts/<script>.mjs" --root . <args>
```

## Walkthrough mode

The condensed context files — one `.md` per board, produced by Armor's extraction pipeline —
live in `Output/<slug>.md`. Armor inserts the `**Board:** <folder>/<name>` line into that file at
close-out, which is how a walkthrough finds its board.

Everything a walkthrough produces sits beside them in the same repo: the boards under
`boards/<folder>/`, the concept articles under `wiki/`, and the **progress sidecars** —
`walkthroughs/<slug>.progress.md`, one per walkthrough. The sidecar is what lets a walkthrough
resume on the other laptop: it is the record of what was rejected and why.

A walkthrough is the **Learning** stage of Armor's per-lecture loop:
`Learning → Class Assignment → Internal QnA → Scaler QnA → Finished`. Armor's `INDEX.md` is the
stage ledger. A walkthrough runs Learning and shows the stage on the board as a status strip
(below); the later stages advance the same strip. A walkthrough is **two jobs in one pass**: teach the
user each concept until they confirm they understand it, and capture the settled understanding on
the board. Teaching comes first — the board only ever records what the discussion settled.

Trigger: the user says "walk through <file>", names a file in `Output/`, or points at one and asks to work it against a board.

**This mode inverts the map-blueprint loop: talk first, draw on acceptance.** Nothing from the file reaches the board or the wiki until it has been discussed in chat and the user has accepted it. This is the only exception to draw-first.

**Setup (first turn):**

1. Read the context file at `Output/<slug>.md`. Its header is bold key-value lines (`**Course:**`, `**Lecture:**` …); the board mapping is the `**Board:** <folder>/<name>` line. Armor inserts it at close-out; if missing, propose a mapping, confirm it in chat, and add the line to that file's header.
2. `boards.mjs use <folder/name>` (create the board first — `boards.mjs create <name> --folder <folder>` — if it doesn't exist), then `outline.mjs --board <folder/name>`. Every command takes `--root <this repo>`, as in the map-blueprint skill.
3. Ensure the **status strip** exists: a `timeline` widget with id `w-status`, title `Status`, five nodes in stage order. The Map app pins `w-status` to the top-left slot on every board. If the board predates it, add it now:

   ```json
   [{"op":"widget_create","id":"w-status","type":"timeline","title":"Status"},
    {"op":"node_add","widgetId":"w-status","id":"n-learning","label":"Learning","order":1,"style":{"fill":"indigo","border":"indigo"}},
    {"op":"node_add","widgetId":"w-status","id":"n-assignment","label":"Class Assignment","order":2},
    {"op":"node_add","widgetId":"w-status","id":"n-internal-qna","label":"Internal QnA","order":3},
    {"op":"node_add","widgetId":"w-status","id":"n-scaler-qna","label":"Scaler QnA","order":4},
    {"op":"node_add","widgetId":"w-status","id":"n-finished","label":"Finished","order":5}]
   ```

   Convention: completed stages `{"fill":"green","border":"green"}`, the current stage `{"fill":"indigo","border":"indigo"}`, pending stages unstyled. **Set `fill` and `border` together** — `fill` colors the label chip, `border` colors the track dot, and a stage colored on only one reads as half-done. A stage skipped by the user's decision gets `marker: "skipped"` and stays unstyled. Stage changes are `node_update` style batches, emitted by whichever session advances the stage.
4. Read every wiki article whose `boards:` frontmatter lists that board.
5. Gap pass: walk the file section by section against board + wiki. Build an agenda of candidate items, each tagged **missed** (relevant, never boarded) or **refinement** (sharpens something already there — including open ghost suggestions the file confirms or contradicts). Skip what the board already covers.
6. Write the agenda to `<name>.progress.md` beside the file. Then open with the **summary and glossary**: a short chat summary of what the lecture covered and the list of concepts the walkthrough will go through, drawn from the file's glossary section and the section map — this is the syllabus for the sessions ahead. End with the first section queued. No ops this turn beyond the status strip; teaching starts when the user confirms the agenda.

**Each turn after — one section at a time, teach then draw:**

1. **Teach the section's concept like a teacher**: definition first, then mechanism, then the instructor's examples where they clarify — grounded strictly in the file. This is the one place where a multi-paragraph chat reply is the point, not a failure of brevity.
2. **Discuss.** The user asks clarifying questions; answer from the file where it answers, and say plainly when a question goes beyond what the lecture covered (answering from general knowledge is fine, but label it as beyond the file). Don't move on until the user confirms the concept is clear.
3. **Then the board**: present 2–4 candidates from the section — one line each, tagged missed/refinement, low-confidence items named as such. When the user rules, apply everything accepted as **one batch** (plus `suggestion_accept`/`suggestion_reject` on existing ghosts the discussion settled), update the wiki in the same turn, update the progress file (mark the section `discussed ✓`). Then queue the next section.

**Completion:** when every section is discussed and ruled on, advance the status strip — Learning to green, Class Assignment to indigo — and hand back the next concrete action: complete the instructor's assignment, then run the Internal QnA drill.

**Rules in this mode:**

- Accepted items land as plain nodes (default `kind: "user"`) — the same thing `suggestion_accept` produces. The label is the phrasing settled in discussion, not the file's sentence. Don't create ghost suggestions for walkthrough content — the chat candidates replace them, and the 2–3 suggestion budget doesn't cap accepted items. Ideas of your own that go beyond the file still follow the normal budget.
- Flags: still at most 1 per turn.
- Provenance cites (`[video 0:17:04]`, `[notes p.2]`) stay in the file. Boards and the wiki never carry them — Map shows the board with no access to the context file, so on the board the cite is a dead reference. If a source pointer matters, spell it out in `detail`.
- Material the file marks low-confidence ("coverage notes and cautions", garbled transcription) is never presented as fact. Raise it only with the caveat attached; if accepted anyway, the caveat goes into `detail`. Garbled numbers never land — the voice.md invented-number ban covers them.
- Rejected items are recorded with the reason and not re-raised.
- **The Internal QnA drill stays out of the boards and the wiki.** The question sets, the user's answers, and Scaler corrections live in `QnA/<slug>.md` — none of it ever reaches the board or the wiki, in either direction. Boards and wiki carry the understood concepts; the drill record is a private learning log.

**Progress file** — `walkthroughs/<slug>.progress.md`:

```
# Walkthrough — 2026-08-24_RAG_in_practice.md
Board: scalar/knowledge-management-and-rag
Source: Armor/Output/2026-08-24_RAG_in_practice.md
Updated: 2026-08-27
Agenda confirmed: 2026-08-27 (summary + glossary presented)

- [x] §2 recall check on retrieval — refinement — discussed ✓ — accepted
- [x] §2 real-world failure cases — missed — discussed ✓ — rejected (anecdotes, not structure)
- [>] §3 tool comparison table — missed — deferred
- [ ] §4 grounding tests — missed — pending
```

Statuses: `[ ]` pending · `[x]` accepted or rejected (say which; rejections carry the reason) · `[>]` deferred. `discussed ✓` marks that the user confirmed understanding of that section's concept — a section isn't done without it. Update the file every walkthrough turn, at the same time as the wiki step.

**Resuming on the other laptop.** One `git pull` in this repo brings the context file, the board,
the wiki and the progress sidecar together. Push them the same way when a session ends:
`node "{{MAP_HOME}}/scripts/sync.mjs" push --root .`

**Resuming:** read the progress file, outline the board, open with a ≤2-line "where we left off" ("Walkthrough of RAG in practice: §1–2 discussed and boarded, 3 accepted 1 rejected — next: §3, the three tools."), then wait for direction.

### Which folder a lecture board belongs in

The GenAI course runs across two folders, split by segment (decided 2026-09-23):

- **`scalar/`** — Days 1–14, the first segment. Closed; nothing new lands here. Day 14
  (`zapier-automation`) belongs here as the close of the automation block; it was briefly moved to
  `scalar-2/` and moved back on 2026-09-23.
- **`scalar-2/`** — **Day 15 onwards**, the current segment.
- **`scalar-primers/`** — SQL/Python skill lectures, either segment; unaffected by the split.

The `**Board:**` line in the context file is always authoritative — read the folder from there
rather than inferring it.

### Primer express walk (`scalar-primers/` boards)

Boards under `scalar-primers/` (SQL/Python skill lectures) get a compressed Learning stage — one
sitting, ~15 minutes — instead of the section-by-section walkthrough. Decided 2026-09-01; this repo's
CLAUDE.md ("Primer track — the sprint variant") holds the full loop. Everything not named here
follows the walkthrough rules above.

- **Setup:** steps 1–4 as above, except the status strip is **4 nodes** — `n-learning`,
  `n-internal-qna`, `n-scaler-qna`, `n-finished`, order 1–4. Add `n-assignment` (after
  `n-learning`) only if the lecture sets an actual assignment. **No gap pass, no agenda** — skip
  steps 5–6.
- **One teaching turn:** the whole lecture as a tight brief distilled live from the deliverable —
  key syntax, the decision/operator tables, gotchas and quiz-caught traps, 2–3 worked patterns.
  Course admin, the glossary and long worked examples are skimmed, not taught. Then doubts; depth
  only where asked.
- **One board batch, 2–4 widgets total** (typically a cheat-sheet `table` or `mindmap` plus a
  gotchas `note`) — not a widget per concept. Talk-first still holds: the batch lands after the
  discussion, containing what it settled.
- **Wiki: unchanged.** One article per concept, exactly as the map-blueprint skill defines — the only difference
  is that all of a lesson's wiki writing lands in this single turn. This is the flexible part of
  the time budget; a dense primer may run a few minutes over.
- **Progress sidecar, minimal:** the standard header plus `Brief delivered: <date>` and a short
  list of the doubt topics raised — no per-section checkbox log.
- **Completion:** advance the strip — Learning green, Internal QnA (or Class Assignment, if
  present) indigo — and hand back: the next concrete action is the 10-question drill.
