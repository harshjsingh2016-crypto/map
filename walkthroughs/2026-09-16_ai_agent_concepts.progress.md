# Walkthrough — 2026-09-16_ai_agent_concepts.md
Board: scalar-2/ai-agent-concepts
Source: Armor/Output/2026-09-16_ai_agent_concepts.md
Updated: 2026-09-24
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
- [ ] §4 + §4.1 + §4.2 The Think → Act → Observe loop (with Quiz 2), the library simulation, and why step 3 is a trap — missed — pending
- [ ] §5 + §5.1 + §5.2 The three pillars (with Quiz 3), MCP as a bridge, and the red-team article — missed — pending
- [ ] §6 + §6.1 + §6.2 Three ways agents fail (with Quiz 4), why the model is often the cause, two real-world blow-ups — missed — pending
- [ ] §7 Three tools, same loop — Deep Research, Claude connectors, the n8n AI Agent node (with Quiz 5) — missed — pending
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
