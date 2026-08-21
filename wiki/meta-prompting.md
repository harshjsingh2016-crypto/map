---
boards: [scalar/ai-reliability]
updated: 2026-08-21
---

# Meta prompting

Asking the AI to critique, improve and rewrite your own prompt. It applies to either layer of the [prompt stack](prompt-stack.md) — the system prompt and the user prompt are both just text the model can be asked to review.

It is [iterative refinement](iterative-prompt-refinement.md) with the model doing a round on itself: instead of you reading the output and deciding what to change, the model reads the prompt and proposes the change. The two compose — a critique pass suggests edits, a run against the real task tests whether they helped.

## Related

- [Iterative prompt refinement](iterative-prompt-refinement.md) — the manual loop this automates one step of
- [The prompt stack](prompt-stack.md) — both layers are fair game for a rewrite
