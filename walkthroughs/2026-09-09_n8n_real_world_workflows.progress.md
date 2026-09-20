# Walkthrough — 2026-09-09_n8n_real_world_workflows.md
Board: scalar/n8n-automation
Source: Armor/Output/2026-09-09_n8n_real_world_workflows.md
Updated: 2026-09-17
Agenda confirmed: 2026-09-17 (summary + glossary presented 2026-09-14)

Board created empty this session, so every item is **missed** by definition. No wiki article cites
this board yet, but seven cite the Day 12 board and are the likely homes for what this lecture
settles: workflow-grammar, when-to-automate, http-for-workflows, polling-vs-webhooks,
api-key-hygiene, choosing-a-workflow-tool, fair-code.

**Position in the course:** the hands-on half of the block Day 12 opened. The whole lecture is
**one live build, iterated three times** on the same scenario, so the agenda follows the builds
rather than topics. No quiz this session.

- [x] §1 + §3 + §4 The build principle (start with three nodes), Basic LLM Chain vs AI Agent first pass, cloud vs local n8n — missed — discussed ✓ — accepted (build-principle flowchart, Chain vs Agent table, cloud vs local table; the Ollama and free-trial side answers folded into the cloud/local table as rows, the "build your own n8n is a nightmare" aside dropped)
- [x] §2 The scenario — Wanderline is still sad — missed — discussed ✓ — accepted (scenario note with the goal sentence and the three-node mapping folded in; Gotchas note opened, first entry: unpublished workflows never trigger. The publish trap has no wiki home yet — fold it into the error-handling article when §9/§10 lands)
- [x] §5 Build 1 — form → Basic LLM Chain → Gmail, and what is wrong with it — missed — discussed ✓ — accepted (Build 1 flowchart ending on the spam failure; form design decisions table; model sizing table with names left off as machine-heard; four appends to Gotchas. CRM-tool answer dropped as a one-liner. User asked for more on "don't go to table, go to schema" — answered from §5.4 plus the §7.7 `[object Object]` payoff, with the table-view reasoning labelled as beyond the file. Still without a wiki home: the schema/leaf rule and node-success-is-not-outcome — fold both into the error-handling article at §9/§10)
- [x] §6 Build 2 — IF node for spam, Sheets for the log, and the substring false positive — missed — discussed ✓ — accepted (Build 2 flowchart with labelled branches and the design answers in node detail; substring false positive note carrying the JSON-key exercise; five-round prompt iteration table; three appends to Gotchas. The McDonald's kiosk illustration was raised with its low-confidence caveat and kept off the board — the principle boards without it)
- [x] §7.0–7.3 Build 3 — fixing the tagging, schedule trigger, Sheets get-rows, HTTP request — missed — discussed ✓ — accepted (Build 3 spine flowchart with per-node item counts, Get rows amber as the cause of the next section's bug; tagging-fix note; schedule table; HTTP method flowchart carrying the temperature_2m correction — measurement height, not refresh rate. Build 3's Aggregate node is boarded as a placeholder and gets its detail at §7.7)
- [x] §7.4–7.7 The debugging sequence — the item model, the chain's error states, hallucination and model size, `[object Object]` — missed — discussed ✓ — accepted (item model note; canvas/errors table; hallucination note; `[object Object]` note carrying the temporary-chat method. Two refinements applied: Build 3's Aggregate node detail filled in, and the model sizing table's cost row rewritten with the settled finding. The debugging method itself is boarded but still without a wiki home — fold it into the §10 practices article)
- [x] §7.8–7.9 + §8 Formatting the brief, and why an HTTP call rather than the LLM for facts — missed — discussed ✓ — accepted (formatting note; where-facts-come-from note. Two refinements: the HTTP method flowchart gained a fixed-versus-live node carrying the geocoding chain pattern, and Build 3's start node now records his own two-item summary of what the build added)
- [x] §9 + §10 Error handling — three settings and a safety net — and the debugging practices collected — missed — discussed ✓ — accepted (error handling table boarding the printed reference's reading of Always Output Data, with the live gloss recorded as the mismatch; degraded-output note; nine debugging practices as a mindmap grouped by habit. Retry's specific values kept off as low-confidence. Both parked items now have a wiki home in debugging-a-workflow: the schema/leaf rule and node-success-is-not-outcome)
- [ ] §11 AI Agent vs Basic LLM Chain — the diagram and two hotel cases — missed — pending
- [ ] §12 + §13 Doubt session and the assignment — missed — pending

**Low-confidence material to raise with the caveat attached, never as fact** (file §15): the
`temperature_2m` gloss (he read `2m` as a two-minute refresh rate; in that API's naming it is the
**measurement height**, 2 metres — the freshness *argument* stands, the mechanism given for it does
not); the Hugging Face aside (hedged by him and wrong); **all model names** (machine-heard and
unverified — the lesson about small models misclassifying does not depend on them); the text-input
character cap (stated as a guess); the local install command (URL not recoverable from audio — he
posted it in the class chat); the retry defaults (read off his screen, provenance unstated); the
McDonald's kiosk and Air Canada illustrations (from memory, unsourced); the sign-off name spelling.

**One place the video departs from the printed notes** (file §15) — RESOLVED at §9, boarded the table's reading with the mismatch recorded: he glossed *Always Output Data*
as "even if it's an error, we send it forward". **The table is right and the gloss is wrong** — it
emits an empty item when a node legitimately returns nothing, which is a different case from error
handling; the live gloss conflates it with *Continue (using error output)*. Board the table.
