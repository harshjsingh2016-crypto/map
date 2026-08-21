---
boards: [scalar/ai-reliability]
updated: 2026-08-21
---

# The prompt stack

Three layers make up what the model actually sees on any call: the **system prompt**, the **user prompt**, and the **model response**.

They differ in lifetime, and that is the whole point of naming them separately. The system prompt is [persistent context](context-persistence.md) — set once, true across calls. The user prompt is per-request. The model response is generated, and then becomes part of the context the next turn is built on.

Seen this way, the [RCTFC framework](rctfc-framework.md) is a rule for distributing across the stack: Role, Context, Format and Constraints belong in the system layer because they do not change; the Task is the one that arrives in the user layer, because it does.

## Related

- [Context persistence](context-persistence.md) — what happens when the system layer does not survive a session
- [RCTFC framework](rctfc-framework.md) — which of the five components sits in which layer
