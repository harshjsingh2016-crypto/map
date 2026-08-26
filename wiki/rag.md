---
boards: [scalar/ai-ecosystems, scalar/knowledge-management-and-rag]
updated: 2026-08-26
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

## The name is the pipeline

The acronym is not decoration — each letter is one stage, and they run in order.

**Retrieval** fetches the relevant files and searches through them. **Augmented** injects
those specific notes into the prompt. **Generation** has the LLM write the answer using
only the notes it was handed.

Reading it as three stages rather than one technique is what makes failures locatable. An
answer that is wrong because the wrong files came back is a retrieval problem; an answer
that ignores correct files is a generation problem. They do not have the same fix.

## Partial retrieval fails silently

The stages are sequential, so generation inherits whatever retrieval decided — and it has
no way to know what retrieval left behind.

The cricket example makes this concrete. A store holds notes on three matches alongside
other match notes, and the question asks about a player's performance. If the augmentation
step never injects the notes for the second and third match, the model still answers, and
it answers confidently. The output carries no signal that two thirds of the evidence was
missing. It does not read as incomplete; it reads as finished.

That is the failure mode worth designing against, because it is invisible at the point of
use. Confidence is a property of how models write, not of how much they were given. The
countermeasures sit at the seams rather than in the model: check whether retrieval returned
all the relevant chunks and not merely the top-scoring ones, and have the answer cite which
notes it used, so a thin retrieval becomes visible in the output instead of staying silent.

## Related

- [Grounding](grounding.md) — the rule RAG implements
- [Persistent context architecture](persistent-context-architecture.md) — where KB files sit relative to instructions
- [AI safety failure modes](ai-safety-failure-modes.md) — confident-sounding wrong answers as a general pattern
