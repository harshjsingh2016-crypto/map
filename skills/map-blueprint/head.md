---
name: map-blueprint
description: Keep this project's blueprint board and build wiki, drawn with the Map project's tools. Use when the user wants to map, plan, brainstorm or restructure this project on a board; asks about the blueprint, backlog, next steps or direction; says "put this on the board" / "update the blueprint"; or when work in this repo changes the plan and the blueprint should follow.
---

# Map blueprint

This project keeps its own **blueprint board** and **build wiki**, inside this repo:

- `boards/<folder>/<name>.board.jsonl` — the boards. The folder is this project's alias, so a
  board id reads `<alias>/<name>` (`qvs-agent/blueprint`). Folder names are unique across all the
  user's projects; do not invent a second folder without being asked.
- `wiki/` — the account of the build: goals, direction, decisions and why, next steps, backlog.

The tools are not here. They live in the Map project at `{{MAP_HOME}}` and are pointed at this
repo with `--root`. Nothing from Map is copied in; Map in turn mounts this repo's `boards/` and
`wiki/` read-only, which is how the user sees every project side by side. **Only sessions in this
repo write this project's boards and wiki.**

## Commands

Run from this repo's root. `--root .` is not optional — without it the command acts on Map's own
boards.

```bash
node "{{MAP_HOME}}/scripts/boards.mjs" --root . list
node "{{MAP_HOME}}/scripts/boards.mjs" --root . create <name> --folder <alias>
node "{{MAP_HOME}}/scripts/boards.mjs" --root . use <alias/name>
node "{{MAP_HOME}}/scripts/apply-ops.mjs" --root . --board <alias/name> --file batch.json
node "{{MAP_HOME}}/scripts/outline.mjs" --root . --board <alias/name>      # cold start only
node "{{MAP_HOME}}/scripts/undo.mjs" --root . --board <alias/name> [--count N]
node "{{MAP_HOME}}/scripts/wiki.mjs" --root . check
node "{{MAP_HOME}}/scripts/sync.mjs" --root . push     # commit + push boards/ wiki/ walkthroughs/
```

`apply-ops` takes a bare JSON array of ops inline, by `--file`, or on stdin; prefer `--file` or a
heredoc on Windows. Batches are **atomic** — if any op fails validation nothing is applied and
the message names the failing op. Every successful apply prints a one-line board summary; that
is your context, so do not re-read the board each turn.

**First use in a project** (no `boards/` yet): create the board as above, then tell the user to
register the project with Map once so it shows up there — from the Map repo,
`node scripts/projects.mjs add <alias> <path to this repo>`. This repo must be the top of its own
git repo with a remote, or its boards cannot sync between machines.

**Seeing it.** The live board is the Map app (`npm run dev` in `{{MAP_HOME}}`, port 5173). It
follows whichever project drew last. If it is not running, keep drawing — the log is the record.
`view.mjs` and `export.mjs` take a board id and need no `--root`.

## The loop, every turn

1. **Draw first, talk second.** Emit ops before composing the reply, then keep the reply to 1–2
   lines. Never narrate what you drew node by node.
2. **Partial capture beats perfect capture.** Get something on the board from the first messy
   description, then refine. Never ask clarifying questions before drawing.
3. **File it in the wiki** after the reply, from context. Skip only when the turn changed no
   content (style tweaks, board switching, undo).

Cold start on an existing board: `outline.mjs`, then a ≤2-line "where we left off" — open
suggestions, open flags, the area last worked on — and wait for direction.

## What a blueprint holds

The board is the plan of the build, not a log of it. Typical widgets: a `flowchart` of how the
system works or will work, a `schema` for its data model, a `timeline` of phases, a `table` of
the backlog (item, status, why it matters), a `quadrant` when priorities are in question. One
`blueprint` board is the default; split a second board off only when a sub-system has outgrown
it. When code changes make the board wrong, fix the board in the same session.

## Wiki

Flat folder, kebab-case filenames, standard relative links, never wikilinks. Each article has
frontmatter `boards: [<alias>/<name>, ...]` and `updated: YYYY-MM-DD`, exactly one H1, prose, and
a `## Related` section of links with a short why-clause each. `wiki/index.md` is the index —
grouped under headings, one line per article with a short hook — edited in the same turn any
article is added or renamed.

One article per **concept or decision**, never per board or per turn. For a build that usually
means: what the project is for and who uses it; the direction and what is deliberately out of
scope; each significant design decision and why; where the build stands; what is next and the
backlog. Articles are prose synthesis — what was concluded and why — not a dump of node labels.
Only accepted and user content goes in; pending suggestions and open flags stay on the board.
No emojis, no hype, never an invented number.

**Links never cross repos.** An article in another project, or in Map, is named in prose, not
linked — `wiki.mjs check` rejects a link that leaves `wiki/`.

