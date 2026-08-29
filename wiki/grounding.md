---
boards: [scalar/ai-reliability, scalar/ai-ecosystems, scalar/knowledge-management-and-rag, scalar/web-grounding-citations]
updated: 2026-08-29
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

The mirror image is worth naming, because it is the default state rather than a broken one.
An ungrounded model has no knowledge base at all: it answers from training, which means it
is bounded by its cutoff and has nothing to check itself against. Both halves of that are
failures waiting to happen, and they are different failures — the cutoff produces answers
that were true once, and the absence of a source produces answers that were never true.

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

## Over-restriction is the failure in the other direction

Grounding is written as a defence, which makes it easy to read a refusal as a success. It
is not. Across a set of CV chatbots built to the same brief, a common guardrail — anything
outside the CV counts as personal information — made them refuse questions about hobbies,
which the brief had explicitly said to answer. Nothing leaked and the tool was still wrong.

The target is a tool that answers what it should and withholds what it shouldn't, and
both halves of that sentence carry equal weight. Leakage is the visible failure and gets
attention; over-restriction is invisible, because a refusal looks like the guardrail
working. A fence tight enough to be certain of is a fence that has stopped being useful.

## Testing whether the ground holds

Because both failures are quiet, grounding is something to test rather than something to
declare. Three questions settle it, and each one fails in a way that names its own cause.

Ask about something that *is* in the knowledge base: a good answer means retrieval is
working, and a poor one means retrieval is broken rather than the model being weak. Ask
about something that *isn't*: the tool should decline, and if it answers anyway it is
hallucinating — this is the test most people skip, and the one that actually proves the
fence exists. Then ask something whose answer changed recently. A stale answer is proof
that the model is working from training rather than from live data, which is the failure
no amount of confident prose reveals on its own.

The third test is the one that needs a moving target to work at all, which is why the
comparison that exposes it is usually between two tools rather than inside one: the same
question put to a model with grounding switched off and to a web-grounded one separates
them immediately.


Worth noticing that the negative test sometimes runs itself. Put a question well outside a
document-grounded tool's sources to it — a live news event, say, to a notebook built from
three files on prompting — and its refusal is the test passing, unasked. The same words on
screen from a tool whose web access is merely switched off mean nothing of the kind. The
refusal only carries information if you know which configuration produced it.

## Traceable, not correct

The analogy that settles it is a person describing a dream against the same person teaching
a class. The dream is ungrounded — it is the brain working from its own thoughts, with
nothing outside itself to check against. The teaching is grounded in a list of external
things: course material, academic training, articles read, research done.

What makes the pairing better than it first looks is the choice of the ungrounded side. A
dream is not a lie, and is not necessarily even wrong; dreams are full of true material,
recombined. What it lacks is a chain leading back out. So the distinction being drawn is not
truth against falsehood but **traceable against untraceable**, and hearing "grounded" as a
synonym for "correct" gets it wrong in both directions. A grounded answer built on stale
sources is still wrong, and a model answering from training alone sometimes has the right
answer sitting in its weights. Grounding does not buy correctness. It buys something to
check correctness against.

The hedging in the original phrasing is deliberate and worth preserving: answering from
memory *could be* ungrounded, and ungrounded has *more potential* for hallucination.
Ungrounded is not a verdict of wrongness, it is an absence of verification —
[unverified is not false](source-quality-framework.md).

## Related

- [The prompt stack](prompt-stack.md) — where the grounding rule is declared
- [Next-word prediction](next-word-prediction.md) — why ungrounded answers have no source to check
- [RAG](rag.md) — the retrieval mechanism that actually supplies the grounded data
- [Citation credibility](citation-credibility.md) — what a citation does and does not certify once the ground is the open web
