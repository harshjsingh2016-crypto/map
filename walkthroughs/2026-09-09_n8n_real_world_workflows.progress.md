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
- [ ] §2 The scenario — Wanderline is still sad — missed — pending
- [ ] §5 Build 1 — form → Basic LLM Chain → Gmail, and what is wrong with it — missed — pending
- [ ] §6 Build 2 — IF node for spam, Sheets for the log, and the substring false positive — missed — pending
- [ ] §7.0–7.3 Build 3 — fixing the tagging, schedule trigger, Sheets get-rows, HTTP request — missed — pending
- [ ] §7.4–7.7 The debugging sequence — the item model, the chain's error states, hallucination and model size, `[object Object]` — missed — pending
- [ ] §7.8–7.9 + §8 Formatting the brief, and why an HTTP call rather than the LLM for facts — missed — pending
- [ ] §9 + §10 Error handling — three settings and a safety net — and the debugging practices collected — missed — pending
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

**One place the video departs from the printed notes** (file §15): he glossed *Always Output Data*
as "even if it's an error, we send it forward". **The table is right and the gloss is wrong** — it
emits an empty item when a node legitimately returns nothing, which is a different case from error
handling; the live gloss conflates it with *Continue (using error output)*. Board the table.
