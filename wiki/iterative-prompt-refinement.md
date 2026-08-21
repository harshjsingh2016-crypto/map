---
boards: [scalar/prompt-engineering]
updated: 2026-08-21
---

# Iterative prompt refinement

Spend a few rounds making the prompt right instead of accepting the first output. Each round: run the prompt, read what came back, adjust, run again.

Two working rules attach to it:

- **It pays when the prompt gets reused.** A prompt that will run many times deserves the rounds; a one-off ask does not.
- **The [chain-of-thought](chain-of-thought.md) trace is what each round acts on.** Without a trace you are guessing at what to change; with one, each round targets the specific assumption or reasoning step that went wrong.

The end state of the loop is usually a fully specified [RCTFC](rctfc-framework.md) prompt — refinement is how you discover which role, context and constraints the task actually needs.

## Related

- [Chain of thought](chain-of-thought.md) — the debugging signal each round reads
- [RCTFC framework](rctfc-framework.md) — what a refined prompt converges to
