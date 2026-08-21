---
boards: [scalar/prompt-engineering]
updated: 2026-08-21
---

# Prompt costs

Input and output are billed separately, and output is the expensive side. The class example rates: $10 per million input tokens against $50 per million output tokens.

What follows: a big prompt that produces a concise result is efficient — cheap tokens spent to avoid expensive ones. A small prompt that produces a lot of non-required information is the inefficient shape; "Summarize this meeting" is short to write and pays for every paragraph you did not need. This is where the [RCTFC framework](rctfc-framework.md) earns its keep: Role, Context, Task, Format and Constraints all spend input to narrow output.

Length is not the measure. Cost per useful answer is.

One non-obvious entry on the expensive side of the ledger: [chain-of-thought](chain-of-thought.md) reasoning steps are billed as output tokens too.

## Related

- [RCTFC framework](rctfc-framework.md) — the structured way to spend input tokens
- [Next-word prediction](next-word-prediction.md) — tokens, the unit being billed
