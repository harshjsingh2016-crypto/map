---
boards: [scalar/n8n-automation]
updated: 2026-09-17
---

# The LLM chain and the agent node

Workflow tools offer two different ways to put a model in a flow, and picking the heavier one by
default is a common and expensive mistake.

A **basic LLM chain** is the plain case: it sends a prompt and returns a response. It does not
chain thought and it will never trigger a tool to go and find information. Whatever it can answer,
it answers from the prompt and its own weights, in one pass.

An **agent** node uses the model *and* tools — other software, connected services, MCP servers — to
complete a task. It chains its reasoning, asks itself multiple questions, and goes out to multiple
tools before it settles on an answer.

The rule for choosing is about the shape of the work, not its difficulty. A linear question that
resolves to an answer is a chain. A task that needs lookups or actions before an answer exists is
an agent.

Reaching for the agent when the work is linear is not merely unnecessary — it makes the result
worse. The agent will try to go to multiple tools, and on a question that needs none of them, that
does not help. You pay in latency, in cost, and in unpredictability for a reasoning loop with
nothing to reason about. The instinct to start with the more capable node is the wrong instinct
here; capability you do not need is behaviour you did not ask for.

## Related

- [AI agents vs Agentic AI](ai-agents-vs-agentic-ai.md) — what the agent node is a packaged instance of
- [Chain of thought](chain-of-thought.md) — the reasoning behaviour the chain node deliberately lacks
- [Building a workflow three nodes at a time](iterative-workflow-building.md) — the AI step in the starting three is usually the chain
