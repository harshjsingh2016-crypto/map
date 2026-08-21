---
boards: [scalar/prompt-engineering]
updated: 2026-08-21
---

# Chain of Thought

Chain-of-thought reasoning is the steps the model follows to analyze and answer, made visible. You initiate it with phrases like "think step by step", "share chain of thought", or "share auditable reasoning trace" — and the three are not equivalent. "Auditable" asks for a trace someone can check, not just longer output.

The reason to want the trace: a prompt is essentially code, and the trace is its debugger. Reading it shows what the model is assuming, what it is understanding, and the reasoning steps it is following. When the answer goes sideways, the trace shows *which step* went sideways — so you modify the prompt at that point instead of rewriting the whole thing and hoping.

When to reach for it, from the assignment: a request that needs the model to *trace* which of several delayed tasks cascades into the most downstream work — rather than simply listing the tasks. The signature is a question whose answer is a chain of dependencies, not a set of items. Listing is retrieval; tracing is reasoning, and chain of thought is the technique that targets it.

The catch: reasoning steps are billed as output tokens, the [expensive side](prompt-costs.md). The trace is worth paying for while a prompt is being developed, not on every production run.

## Related

- [Iterative prompt refinement](iterative-prompt-refinement.md) — the loop that consumes the trace
- [Prompt costs](prompt-costs.md) — why the trace has a price
