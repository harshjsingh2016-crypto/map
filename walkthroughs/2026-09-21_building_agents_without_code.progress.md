# Walkthrough — 2026-09-21_building_agents_without_code.md
Board: scalar-2/build-agent-nocode
Source: Armor/Output/2026-09-21_building_agents_without_code.md
Updated: 2026-09-30
Agenda confirmed: pending (summary + glossary presented 2026-09-30)

Board created empty this session, so every item is **missed** by definition. No wiki article cites
this board yet. This is the first build-and-break class of the agent segment, so it lands mostly as
**refinements** of what Days 15–16 set up: `three-pillars-of-an-agent` (the brain outside the agent),
`the-agent-loop` and `three-ways-agents-fail` (the seven-search loop, capped), `routing-logic`
(routing rules inside the prompt; hard gating), `short-and-long-term-memory` (memory as tool-call
saver), `chatbot-workflow-or-agent` and `llm-chain-vs-agent` (node vs tool — the fixed-step half of
the workflow/agent split), `designing-for-partial-failure` (retry, error output, fallback model),
`what-only-an-llm-can-do` and `right-sizing-the-model` (a model has no internet; a small model
loops), `free-tier-arithmetic` (the SerpApi cost trap), `iterative-prompt-refinement` (keep your
test queries).

**Quizzes are taught in place** — Q1 in §2–4, Q2 in §9–10.

- [ ] §1–§4 What the lecture is, the research-agent brief; the Brain outside the agent; tool chaining vs routing; "a tool is not mandatory" (with Quiz 1) — missed + refinement — pending
- [ ] §5 Build 1 — SerpApi, the cost trap, "the model has no internet", configuring the tool (JSON restrictor, let-the-model-define), the system prompt — missed + refinement — pending
- [ ] §6 Build 1 breaks — the seven-search loop, why it looped, the fixes (max iterations, the budget in the prompt, the buffer of one) — missed + refinement — pending
- [ ] §7 + §8 Tool routing rules in the prompt — position, ambiguity, hard gating, the trade-off; memory as tool-call saver — missed + refinement — pending
- [ ] §9 + §10 + §11 Node vs tool (with Quiz 2); Build 2 — Google Docs on the main output, the chat-response bug — missed + refinement — pending
- [ ] §12 Build 3 (theory) — what breaks, retry on fail, error output, failing gracefully, fallback model, timeouts, choosing a model — missed + refinement — pending
- [ ] §13 + §14 + §15 Relevance AI; take-home; doubt session (no-code vs code, prompt regression testing, data residency) — missed + refinement — pending

**Low-confidence material to raise with the caveat attached, never as fact** (file §17): the **live
search topic** and everything the agent returned about it (unverified model output about an
unverified news item — never repeated); the **failure reading** (described as a context-window
breach; almost certainly a tokens-per-minute rate limit — the teaching point stands, the mechanism
is loose); **model names in the context-window passage** (transcription artefacts — shape only, no
names or figures); **Groq vs Grok** (read Groq throughout); **Relevance AI account requirements**
(unresolved); **Copilot/Cursor opinions** (opinion, labelled); the **model-for-the-job table** (his
opinion, not benchmark).

**Agenda item not reached:** Multi Tool — no multi-tool agent built; only two asides.
