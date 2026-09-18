---
boards: [scalar/prompt-engineering, scalar/n8n-automation]
updated: 2026-09-18
---

# Iterative prompt refinement

Spend a few rounds making the prompt right instead of accepting the first output. Each round: run the prompt, read what came back, adjust, run again.

Two working rules attach to it:

- **It pays when the prompt gets reused.** A prompt that will run many times deserves the rounds; a one-off ask does not.
- **The [chain-of-thought](chain-of-thought.md) trace is what each round acts on.** Without a trace you are guessing at what to change; with one, each round targets the specific assumption or reasoning step that went wrong.

The end state of the loop is usually a fully specified [RCTFC](rctfc-framework.md) prompt — refinement is how you discover which role, context and constraints the task actually needs.

There is a third rule the rounds teach, visible only when you watch a refinement that keeps failing.
A live build needed a small model to tag each message BOOKING, SPAM or QUERY. Round two sharpened
every definition; round three added an explicit formatting instruction. Both came back with the same
wrong tag. What worked was round four: **dropping one of the three categories**. With two classes
left the model got it right immediately.

The lesson is that not every failed round is a wording problem. Sometimes the prompt is clear and
the model cannot do the thing being asked — and the move is to ask for less, not to say it better.
Three rounds of rewording is a reasonable signal that you are up against a capability ceiling rather
than an ambiguity, and reducing the task is a legitimate fix rather than a retreat.

## Related

- [Chain of thought](chain-of-thought.md) — the debugging signal each round reads
- [RCTFC framework](rctfc-framework.md) — what a refined prompt converges to
