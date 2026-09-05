---
boards: [scalar/no-code-ai-bot]
updated: 2026-09-05
---

# The competent-reader test

One question that decides whether a generated answer is safe to ship unreviewed: **is there
someone downstream who would notice if it were wrong?**

It emerges from sorting the places a knowledge-base chatbot belongs from the places it doesn't.
The good cases — an internal Q&A bot over your own ticket history, a teacher generating
questions on a chapter she already knows — look unrelated until you notice what they share.
In each, the person reading the answer already holds enough of the domain to catch a bad one.
They are, without being asked to be, a verification layer.

The bad cases invert exactly that. A customer asking what refund they are owed cannot check the
answer; not knowing is the entire reason they asked. Whatever they are handed is what they will
believe, act on, and quote back later.

## Why it beats an internal/external split

"Internal is fine, customer-facing is risky" gets the same answer most of the time and is the
wrong reason, which means it fails at the edges. A new hire on day two is internal and cannot
check anything. A domain expert who happens to be a client can check everything. What matters
is competence at the receiving end, not which side of the org chart it sits on.

The test also tells you what to build when the answer is no. If nobody downstream can verify,
either put a verifier there — a human handoff, a review step — or take the sentence out of the
model's hands entirely, which is what moving along the [control dial](control-dial.md) does.

## The uneven cost of a wrong sentence

Underneath the test is an assumption worth stating on its own: the cost of a wrong sentence is
not spread evenly across the sentences a system produces. Most cost nothing and are corrected
in passing. A number that someone can hold you to — a refund percentage, a price, a legal term
— costs whatever they can hold you to, and a screenshot of it turns a technical fault into a
commitment to argue about.

So the test is applied per answer type, not per product. The same bot can be safe describing a
trekking route and unsafe quoting a cancellation slab, which is the observation that makes
mixed architectures — generated answers for most things, scripted text for the binding ones —
the sensible shape rather than a compromise.

## Related

- [The control dial](control-dial.md) — what to do when the test fails: move the binding sentence out of generation
- [Dify](dify.md) — the tool the test was drawn from, and the failure that produced it
- [Delivery, not accuracy](delivery-not-accuracy.md) — the scope rule is the same instinct applied to coverage
