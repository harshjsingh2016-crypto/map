---
boards: [scalar/n8n-automation]
updated: 2026-09-18
---

# Use the model for what only a model can do

The question that decides how much of an automation should be an LLM node at all, asked concretely:
the flow needs today's temperature — why call a weather API instead of asking the model?

**Because it hallucinates, and confidently.** The model says the city is twenty degrees, you pack
for twenty degrees, it is thirty-five. The problem is not that the model does not know; it is that
not knowing and knowing look identical in the output, so the failure arrives without a signal
attached.

**And because even when it is not hallucinating it is answering from a snapshot.** A live endpoint
updates on a short cycle; a model's number is at best whatever its training data held. For a
decision made against current conditions, hours of staleness is a wrong answer delivered in good
faith.

The rule that follows: use the model for what only a model can do — summarising English text,
drafting a message, producing something that did not exist before. Where something else can do the
job faster, cheaper and more authoritatively, use that.

Those three criteria are not equal, and separating them matters. *Faster* is latency and *cheaper*
is cost per call — both are optimisations, and both can be argued away when convenience is worth
the money. **Authoritative is the one that decides.** An API is the source of record for what the
temperature is, in a way no model can be however good models get. That is a correctness argument,
and it does not soften as the technology improves.

This also resolves a tension that runs through any lecture on the subject. One lesson says do not
overkill a simple task with an expensive model. The next says the cheap model fabricated numbers,
use a stronger one. Both are true, and both are downstream of the real question: **a surprising
amount of what gets put in an LLM node is a lookup wearing a costume.** Right-sizing applies only to
the work that genuinely needs a model; the rest should be a request to whoever owns the answer.

## Related

- [Right-sizing the model](right-sizing-the-model.md) — the sizing question, which only applies once this one is settled
- [HTTP, for workflow builders](http-for-workflows.md) — how the authoritative source gets called
- [Grounding](grounding.md) — the same instinct where the model must stay in the loop: hand it the facts rather than trusting its own
- [Finished-looking is not checked](finished-looking-is-not-checked.md) — why a confident wrong number carries no signal
