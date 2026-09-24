---
boards: [scalar-2/ai-agent-concepts]
updated: 2026-09-24
---

# The agent loop: Think, Act, Observe

What makes an agent an agent is a loop of three phases, run until the goal is met.

**Think** is where the steps come from, and it is the phase the instructor called the most
important. **Act** carries them out against the world: open a file, search, read a transcript,
write to a sheet, make a call. **Observe** asks one question, whether the original goal is
complete, and if it is not, the loop goes back to Think with what it just learned.

The order is not arbitrary. Act cannot come first because there is nothing yet to act on. Observe
cannot come first because nothing has been done that could be observed. And Observe is a check on
what the action produced, measured against the goal; it does not review the plan. A loop whose
checking looks only at its own reasoning is still a chatbot thinking out loud.

That contrast is the clearest way to hold it. A chatbot is Think alone: asked to build a workflow,
it plans the workflow and stops. It does not build, test or publish. The agent is Think plus the
two phases that touch the world, which is the same loop a person runs building an automation by
hand: plan it, build it, test it, find the failure, plan again, and publish only when the test
passes.

## What done looks like

The library simulation walks the loop on a rumour that a branch library is closing. The first
call goes to the library, which answers that it has heard nothing and that budget decisions belong
to the city council. That observation is useful and not sufficient, because the source is not the
body that decides, so the loop goes round again. The second check is the council's public agenda
and budget, which show no closure vote. Only then does the loop stop, and the brief it hands back
says what it rests on and leaves a follow-up open.

Two things define the stop. It comes from independent checks agreeing, not from one source
sounding sure. And the answer is scoped to what was checked. A chatbot given the same rumour
produces the library's history and a hedge, which is everything except what was asked.

Fetching from the web and citing where it came from is not this loop either. That is retrieval in
a single pass. The loop is choosing what to check next from what the last check returned.

## The repeat that means it forgot

The trap sits at the second Think. One option is to call the library again with the identical
question. Nothing reasonable does that on purpose; the way a person takes the morning medicine
twice is by forgetting they took it. An agent without memory of what it already checked repeats
the action, and with no memory at all it never stops. The library has already said what it knows,
so each repeat only delays the answer. This is the endless loop, and memory is its most visible
cause but not its only one: a vague goal handed to an agent with strong autonomy can argue itself
in circles with its memory intact.

## Related

- [AI agents vs Agentic AI](ai-agents-vs-agentic-ai.md) — the components the loop runs on, and the manager layer above it
- [Reactive vs proactive AI](reactive-vs-proactive-ai.md) — the loop is what makes a system proactive, and why that is not the same as smarter
- [The LLM chain and the agent node](llm-chain-vs-agent.md) — when a task needs the loop and when one pass is enough
- [Iterative workflow building](iterative-workflow-building.md) — the plan, build, test cycle a person runs, which the loop mirrors
