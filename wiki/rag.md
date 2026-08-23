---
boards: [scalar/ai-ecosystems]
updated: 2026-08-24
---

# RAG

Retrieval Augmented Generation — the technique for having a model use specific files or
data rather than answering from training alone.

It sits directly under KB files in the ecosystem, and the division of labour is worth
holding onto: the KB is *what* the model is allowed to draw on, RAG is *how* the relevant
piece of it reaches the prompt at answer time. A knowledge base of any size cannot be
pasted in wholesale, so retrieval selects the fragments that bear on the question and
those fragments — not the whole store — are what the model actually reads.

This makes RAG the mechanism behind [grounding](grounding.md) rather than a separate idea.
Grounding is the rule that the answer must come from supplied data; RAG is the plumbing
that supplies it.

## Related

- [Grounding](grounding.md) — the rule RAG implements
- [Persistent context architecture](persistent-context-architecture.md) — where KB files sit relative to instructions
