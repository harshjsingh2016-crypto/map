---
boards: [scalar/ai-reliability]
updated: 2026-08-21
---

# Grounding

Limiting the data and context the model is allowed to work with. Instead of letting it answer from everything absorbed during training, you fence it to a defined source and require the answer to come from there.

This is a reliability move, not a capability one. The model's own knowledge is [patterns in weights](next-word-prediction.md), not a checkable record — so an answer drawn from it cannot be traced to anything. An answer drawn from supplied data can.

Grounding lives in the same layer as the rest of the standing instructions: the [system prompt](prompt-stack.md), where what the model may use is declared once rather than re-argued per request.

## Related

- [The prompt stack](prompt-stack.md) — where the grounding rule is declared
- [Next-word prediction](next-word-prediction.md) — why ungrounded answers have no source to check
