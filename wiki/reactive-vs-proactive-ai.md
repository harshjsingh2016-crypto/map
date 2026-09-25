---
boards: [scalar-2/ai-agent-concepts]
updated: 2026-09-24
---

# Reactive vs proactive AI

A newsroom gets a tip about a fire at an old mill and asks its AI assistant whether there is a gas
leak nearby. The assistant says it has no real-time information and recommends checking a live news
source — to the newsroom, which *is* the live news source.

The failure has two layers, and both matter. The model knows only what was in its training data, up
to its cut-off. And a web-connected tool fails as well, because something recent enough is not on
the web yet either. What the situation needs is not a better answer from what is already known; it
is something that goes and **finds out** — calls, checks, cross-checks. That gap is the difference
between the two kinds of system.

**Reactive AI** waits for a question, answers it, and waits for feedback before doing anything more.
Ask a chat assistant about the fire and it tells you what it knows, then asks whether you want it to
look further, and stops. Every automation built from a fixed sequence of steps is reactive in the
same sense: it fires, does what it was built to do, and finishes.

**Proactive AI** takes a goal, decides the steps itself, performs them, and keeps going until the
goal is met. Where the reactive system asks whether to take the next step, the proactive one takes
it — pausing, at most, for something that needs privileged access or an administrator's approval.
Coding agents and a flight-booking agent are the everyday examples.

The warning that belongs with the definition, and was repeated for good reason: **proactive is not
the same as smarter.** Both kinds rely on the same model underneath, so hallucination and invented
sources come along unchanged. "Proactive simply means something that's able to rework on the process
till the goal is met." What changes is the architecture — whether there is a loop — not the
intelligence. It is tempting to assume that something acting on its own must be more capable. It is
the same model with permission to keep going.

That permission has an obvious edge. Something built to continue until the goal is met will also
continue when the goal **cannot** be met, and pick wrong steps indefinitely. A system with a loop
needs a way to decide it is done, or that it should stop, and that turns out to be one of the main
ways agents fail.

## Related

- [AI agents vs Agentic AI](ai-agents-vs-agentic-ai.md) — what a proactive system is built from, and the layer above it
- [The LLM chain and the agent node](llm-chain-vs-agent.md) — the same line drawn inside a workflow tool
- [Use the model for what only a model can do](what-only-an-llm-can-do.md) — why a model cannot be the source for a fresh fact, which is where this starts
