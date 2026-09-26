# Walkthrough — 2026-09-18_agent_building_blocks.md
Board: scalar-2/agent-building-blocks
Source: Armor/Output/2026-09-18_agent_building_blocks.md
Updated: 2026-09-26
Agenda confirmed: pending (summary + glossary presented 2026-09-26)

Board created empty this session, so every item is **missed** by definition. No wiki article cites
this board yet. This lecture extends Day 15 directly, so existing articles it will **refine** rather
than duplicate: `three-pillars-of-an-agent` (tools, memory, the MCP paragraph — this lecture is the
full MCP treatment), `three-ways-agents-fail` (a third cause of the Endless Loop: routing),
`the-agent-loop` (multi-tool tasks are the loop doing its job), `ai-safety-failure-modes` (prompt
injection reappears as the MCP attack vector), `context-persistence` (compaction, and `.md` handover
files as the defence), `what-only-an-llm-can-do` (code over prediction for arithmetic).

**Quizzes are taught in place** — Q1 in §3, Q2 in §4, Q3 in §5, Q4 in §6, Q5 in §7.

- [ ] §1 + §2 Recap, and the morning seven (Advait's storm message) — missed — pending
- [ ] §3 (3.1–3.5) Four tool types — search, browser, API, code; the Zerodha aside; routing the seven (with Quiz 1) — missed — pending
- [ ] §4 (4.1–4.4) Routing logic — wrench and screwdriver, description vs order, testing, jugaad (with Quiz 2) — missed + refinement (routing Endless Loop) — pending
- [ ] §5 (5.1–5.3) Short-term vs long-term memory — ChatGPT, the fire example, the n8n demo (with Quiz 3) — missed + refinement — pending
- [ ] §6 (6.1–6.3) MCP — USB-C, N×M to N+M, descriptions inside the server, what MCP is not (with Quiz 4) — missed + refinement — pending
- [ ] §7 + §8 Permissions and least privilege (with Quiz 5); two MCP incidents — missed — pending
- [ ] §11 + §12 Doubt session and take-home — API vs MCP in practice, compaction, memory promotion — missed + refinement — pending

**Low-confidence material to raise with the caveat attached, never as fact** (file §14):
**Invariant Labs incident specifics** (partly read from screen, partly memory — the mechanism,
over-broad scope plus prompt injection, is the claim; specifics unchecked); **Gemini pricing
anecdote** (model name uncertain, the tier boundary from memory — no figures to land);
**"MCP will not get outdated"** (reframed: the vendor's MCP tracks its own API changes);
**HITL nodes in n8n** (asserted, not shown); the **n8n demo model name** (garbled, irrelevant);
**Zerodha leadership** and **Postman's age** (immaterial — not raised).

**Scenario continuity:** Day 15's fire was at the Kessler mill; this lecture says "Miller Street"
for the memory example. Treat as the same fire; the lesson doesn't depend on the name.

**Deferred by the lecture itself:** n8n MCP Client Tool (to the Monday OpenClaw class), OpenClaw,
tool chaining in a fixed order, LangChain/LangGraph.
