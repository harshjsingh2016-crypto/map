---
boards: [scalar/gen-ai-fundamentals, scalar-2/ai-agent-concepts]
updated: 2026-09-25
---

# AI agents vs Agentic AI

An AI agent is a system that completes tasks on its own: an LLM brain that reasons and decides, tools it can use (email, calendar), memory of the conversation, and guardrails that constrain what it may do. Its defining loop is plan, act, check — without human intervention; the later concepts lecture names the phases Think, Act and Observe and works through what each one owes the next ([The agent loop](the-agent-loop.md)).

Agentic AI is the layer above: a manager agent that breaks a request down, delegates to AI agents and tools, checks the flow, and fixes and reworks until the result looks right. The key part is not the delegation but the loop of checking and reworking.

The class analogy: an AI agent is a chef who can cook; agentic AI is running the whole restaurant.

The Zomato example walks one agent end to end. Trigger: a "food is cold" complaint arrives. Act: it checks order history and the GPS trail — time taken to deliver after the food was prepared. Decide: it settles on a percentage refund. Act: it drafts an apology. Check: it takes confirmation before processing the refund. Every stage of the plan–act–check loop is visible, including the human confirmation sitting at the end as a guardrail.

## Related

- [The three pillars of an agent](three-pillars-of-an-agent.md) — tools, memory and autonomy, each with a visible failure when missing
- [The agent loop](the-agent-loop.md) — the plan, act, check loop taken apart phase by phase
- [Next-word prediction](next-word-prediction.md) — the LLM brain inside every agent
