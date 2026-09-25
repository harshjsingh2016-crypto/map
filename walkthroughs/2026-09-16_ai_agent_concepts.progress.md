# Walkthrough — 2026-09-16_ai_agent_concepts.md
Board: scalar-2/ai-agent-concepts
Source: Armor/Output/2026-09-16_ai_agent_concepts.md
Updated: 2026-09-25
Agenda confirmed: 2026-09-24 (summary + glossary presented 2026-09-23)

Board created empty this session, so every item is **missed** by definition. No wiki article cites
this board yet. Existing articles this lecture will **refine** rather than duplicate:
`ai-agents-vs-agentic-ai` (states the loop as plan–act–check and the parts as brain, tools, memory,
guardrails — this lecture restates both), `llm-chain-vs-agent` (the n8n node-level distinction),
`ai-safety-failure-modes` (prompt injection and jailbreaking reappear in §6.1), and
`observing-what-did-not-happen` (the Invented Source is the same trap from the agent side).

**Quizzes are taught in place, not as a separate item** — the five quizzes sit inside the sections
whose concept they test (Q1 in §3, Q2 in §4, Q3 in §5, Q4 in §6, Q5 in §7). Decided on the Day 14
walkthrough, where a separate quiz section only duplicated what was already boarded.

- [x] §1 + §2 The Groundwire scenario and the Kessler mill tip; reactive vs proactive AI — missed — discussed ✓ — accepted (scenario note carrying the four roles, the eyewitness-is-a-perspective point and the two reasons the assistant's reply fails; reactive-vs-proactive table with proactive-is-not-smarter and the endless-loop corollary highlighted)
- [x] §3 + §3.1 Chatbot vs agent (with Quiz 1), and the cost and latency of agents — missed — discussed ✓ — accepted (chatbot-vs-agent table with the workflow trade folded in as rows; "agent is a mode" note; cost note — Deep Research step cap boarded as "a handful", no number)
- [x] §4 + §4.1 + §4.2 Think → Act → Observe (with Quiz 2), the library simulation, the step-3 trap — missed — discussed ✓ — accepted (loop flowchart + n8n-analogy note; library timeline; loop-traps note; new wiki article the-agent-loop)
- [x] §5 + §5.1 + §5.2 Three pillars (with Quiz 3), the MCP bridge, the red-team article — missed — discussed ✓ — accepted: switchboard table, autonomy-and-memory note, MCP intro table; new wiki article three-pillars-of-an-agent. Rejected: red-team article (specifics unverified; the guardrails lesson stands on the escalation example). Added during §6: footnote on the guardrails point — agent never connected to the production VPN (a boundary it can't cross)
- [x] §6 + §6.1 + §6.2 Three failures (with Quiz 4), model vs prompt, two blow-ups — missed — discussed ✓ — accepted: failures table, model-layer note (tool preferences kept as one person's example), Replit note; new wiki article three-ways-agents-fail. Rejected: vending machine (details from a secondary summary, unverified)
- [x] §7 Three tools, same loop (with Quiz 5) — missed + refinement — discussed ✓ — accepted: where-the-pillars-live table; Quiz 5 row on the chatbot-vs-agent table (refinement); agent-tasks note (doubles as the homework list); wiki three-pillars-of-an-agent deepened
- [ ] §8 Chatbot, workflow, or agent — the decision — missed — pending
- [ ] §10 + §11 Doubt session and homework — missed — pending

**Low-confidence material to raise with the caveat attached, never as fact** (file §13): the
**OpenAI red-team article** (read aloud at speed, transcript fragmentary, a stray chat line that may
belong elsewhere — the lesson that autonomy needs guardrails is solid, the incident specifics are
not); the **vending-machine details** (PlayStation 5, a live fish, a "boardroom coup", the dollar
figure — read from a Reddit summary, not the primary write-up; directionally right only); **Replit's
name** (he speculated a rename live and corrected himself — keep the correction); the **"Qwen 27
billion"** figure (garbled here as in earlier lectures, never quote it); **PERT** in agent planning
(he said he was unsure); **"will we implement agents in code"** (hedged, not a commitment);
**Deep Research timing** (given as two different ranges — a rough range at most).

**Notes vs video agree throughout** — no divergences to reconcile this time. The notes are the
printed skeleton; the narration carries the library simulation, the pillar switchboard, the MCP
digression, the two blow-ups, the demos and the doubts.

**Deferred by the lecture itself:** agentic AI (many agents), MCP in depth, LangGraph, Sovereign AI.
Nothing to board on these beyond the one-line pointers the lecture gave.
