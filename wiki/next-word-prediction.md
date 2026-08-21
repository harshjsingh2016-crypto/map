---
boards: [scalar/gen-ai-fundamentals]
updated: 2026-08-21
---

# Next-word prediction

Terminology first, because the class kept nesting it: AI contains machine learning, which contains deep learning, which contains generative AI, which contains LLMs. An LLM is the narrowest thing in that chain, not a synonym for AI.

What an LLM does is predict the next word. Two inputs feed the prediction: the previous words in the sequence, and the patterns the model absorbed from its training data. Every candidate word gets a confidence score and the highest-confidence one is selected.

Two ideas underneath that matter more than the mechanism:

- **Tokens, not words.** The model actually works in tokens, usually sub-word pieces — which is also the unit everything is [billed in](prompt-costs.md).
- **Patterns, not a copy.** The model remembers its training data as patterns stored in weights, not as a retrievable copy. Training shapes the answer; accuracy in context is the goal it was optimized toward.

## Related

- [Predictive vs generative AI](predictive-vs-generative-ai.md) — where next-word prediction sits in the larger split
- [Prompt costs](prompt-costs.md) — tokens are the billing unit
