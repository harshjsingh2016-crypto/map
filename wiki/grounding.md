---
boards: [scalar/ai-reliability, scalar/ai-ecosystems, scalar/knowledge-management-and-rag]
updated: 2026-08-27
---

# Grounding

Limiting the data and context the model is allowed to work with. Instead of letting it answer from everything absorbed during training, you fence it to a defined source and require the answer to come from there.

This is a reliability move, not a capability one. The model's own knowledge is [patterns in weights](next-word-prediction.md), not a checkable record — so an answer drawn from it cannot be traced to anything. An answer drawn from supplied data can.

Grounding lives in the same layer as the rest of the standing instructions: the [system prompt](prompt-stack.md), where what the model may use is declared once rather than re-argued per request.

The framing that makes it concrete is one of restriction rather than addition: a tool with
the whole web available to it is deliberately *narrowed* to the knowledge you want it
working from. Ten books may cover your question, but you want the answer out of this one,
so you fence the model to it. Nothing is being given to the model that it lacked — what is
being removed is its licence to answer from anywhere else.

## It reduces hallucination, it does not end it

Asked directly whether grounding finishes hallucination off, the answer is *never* — it can
only be reduced. That ceiling is worth stating plainly, because grounding is easy to treat
as a solved problem once implemented.

Two things keep the floor above zero. The supplied data still has to be *retrieved*, and
[retrieval](rag.md) is the fragile step: a source that never reaches the prompt cannot
ground anything, and the resulting answer is confident and unmarked. And generation from
correct sources is still generation — inference across supplied documents produces content
that was not written in any of them. That last case is not the failure, though it is often
mistaken for one. Generating new content is what the model is for; the problem is
*ungrounded* generation, where the content traces to nothing you supplied.

## Related

- [The prompt stack](prompt-stack.md) — where the grounding rule is declared
- [Next-word prediction](next-word-prediction.md) — why ungrounded answers have no source to check
- [RAG](rag.md) — the retrieval mechanism that actually supplies the grounded data
