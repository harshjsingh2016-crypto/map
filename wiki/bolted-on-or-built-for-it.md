---
boards: [scalar/ai-content-creation, scalar/multimodal-gen-ai]
updated: 2026-09-11
---

# Bolted on, or built for it

Comparing a purpose-built AI tool against the assistant inside an incumbent product, the answer
that survives the next release cycle is architectural. A deck tool built for an AI result from the
start owns its interface, its image placement and its layout decisions end to end. An assistant
added to a product that already existed has to produce its results through a surface designed for
someone doing the work by hand.

That is a claim about how each was built rather than how either performed last month, which is
what makes it worth keeping. Benchmarks of a specific release age out within weeks; the shape of
the product does not. The general form: expect a tool built around the model to beat AI features
retrofitted onto an incumbent, and treat that as the prior you argue against with evidence rather
than the conclusion you reach after testing everything.

Performance verdicts collected alongside it — sluggish, poor at complicated requests — are worth
hearing and not worth carrying as fact. They are one person's experience of a product shipping
changes continuously, and the half-life is short.

## Ecosystem convenience is not capability

The follow-up question is the more valuable one: does having all your data in a vendor's ecosystem
change which tool to use? Convenience, yes, and substantially — nothing has to be exported, moved
or re-permissioned.

Capability, no. Data living in a suite says nothing about how well that suite's assistant works
with it, and reports of poor data-fetching from inside the ecosystem are the direct evidence.
Integration convenience and output quality are independent properties that vendors deliberately
present as one, because only the first is something owning the data actually buys.

## First establish which of the two you are holding

Before the question can even be asked properly, a prior one has to be settled: is the thing in
front of you a **model**, or a **product wrapped around a model**? A base generator and the
interface plus agentic flow built on top of it are different objects, and the analogy offered for
the difference is comparing a chat assistant to the model that powers it.

Getting this wrong makes comparisons meaningless in both directions. A feature list and a
capability are not the same claim, and a product can change the model underneath it without
telling anyone, so a judgement formed about the output may not survive next month. The two
questions to keep apart are whether the underlying generation is good and whether the thing built
around it is good, because only the second is what the vendor actually controls.

An honest footnote on where this came from: asked to place two specific video tools on that
distinction, the instructor gave two answers that do not agree — one of them described first as a
tool wrapped around a base model and then as running its own proprietary model — and the lecture
never resolved it. The distinction is the durable part; that particular classification is not
settled here.

## Related

- [Diagnose the hard part](diagnose-the-hard-part.md) — the job comes first; this is how to judge the candidates it points at
- [Gamma](gamma.md) — the built-for-it side of the comparison, and what its design buys and costs
- [Vendor data diligence](vendor-data-diligence.md) — the other question to ask a vendor once convenience is on the table
