---
boards: [scalar/prompt-engineering, scalar/multimodal-gen-ai]
updated: 2026-09-10
---

# Prompt costs

Input and output are billed separately, and output is the expensive side. The class example rates: $10 per million input tokens against $50 per million output tokens.

What follows: a big prompt that produces a concise result is efficient — cheap tokens spent to avoid expensive ones. A small prompt that produces a lot of non-required information is the inefficient shape; "Summarize this meeting" is short to write and pays for every paragraph you did not need. This is where the [RCTFC framework](rctfc-framework.md) earns its keep: Role, Context, Task, Format and Constraints all spend input to narrow output.

Length is not the measure. Cost per useful answer is.

One non-obvious entry on the expensive side of the ledger: [chain-of-thought](chain-of-thought.md) reasoning steps are billed as output tokens too.

## The convenient interface is the expensive one

The same ledger shows up in credit-metered tools, where it is easier to see because the balance is
visible. An image workspace offering both a chat mode and a direct tool charges very differently
for the same picture: the chat mode is an agent that runs its own reasoning and tool steps before
generating, and a single image through it consumed roughly four fifths of the entire free
allowance. The same image through the direct tool, with the model chosen by hand, cost a small
fraction of that.

Nothing about the output was better. What was bought was not having to decide — the model choice,
the framing of the request, the sequencing — and that deliberation is billed like any other
generated tokens. The rule generalises past any one product: whenever a tool offers to think about
your request before acting on it, the thinking is on the bill, and a conversational front door is
the most expensive way to place an order you already knew how to place.

## Related

- [RCTFC framework](rctfc-framework.md) — the structured way to spend input tokens
- [Next-word prediction](next-word-prediction.md) — tokens, the unit being billed
- [Chain of Thought](chain-of-thought.md) — the reasoning that an agent mode bills you for
