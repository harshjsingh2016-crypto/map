---
boards: [scalar/multimodal-gen-ai]
updated: 2026-09-10
---

# Unintended claims

A generated asset can make a promise nobody in the company ever decided to make, and the promise
is binding on the company anyway. That is the specific exposure multimodal generation adds, and it
is a different problem from the model getting a fact wrong.

The instructor's formulation is the whole idea: intentionally putting wrong things into an image is
still fine, because you know your fault; when you do not even know what your fault is, it becomes
a bigger issue. Deliberate false advertising is a risk that was priced and chosen — somebody
weighed it, somebody can defend it, and somebody knows where to look when the complaint arrives.
An unintended claim is the same legal exposure with the knowledge removed. The liability is
identical and the decision never happened.

The worked case is small on purpose. A drone shot of the estate comes back looking correct, and a
pool the generator invented sits in one corner of it. Nobody notices, because nobody was looking
for a pool. The image now advertises an amenity the property does not have, and the first person
to discover this is a guest who booked because of it.

What makes this specific to generated imagery rather than a general warning about carelessness is
where the unchecked detail comes from. In a photograph, everything in the frame was there. The
error a photographer can make is choosing a misleading angle, which is a decision, reviewable as a
decision. A generated frame is assembled from nothing, so every element in it is an assertion the
tool made on your behalf, and there is no list of them. Reviewing it is not checking one claim
against a source; it is finding the claims first.

## The cost does not care how the promise was made

The consequences are borrowed from advertising failures that had no AI in them, which is the point
of using them. Freedom 251 sold a phone on pre-booking that never existed and never returned the
booking amounts, each loss too small for anyone to chase and thousands of them adding up. Ola
promised heavily on electric scooters and delivered vehicles that caught fire and stopped
randomly — not a scam, poor delivery, and a different failure with a similar ending.

Three consequences follow, and they are worth separating because they arrive on different
timescales. **Trust** goes first and shows up as people simply not buying. **Legal** is the one with
a threshold: advertise a rooftop infinity pool the hotel does not have and complaints stop being
complaints, becoming fraudulent-advertising cases. **Churn** is the slowest and the hardest to
attribute, because customers who used to return just stop returning — one bad season at a hotel,
one cockroach in a café kitchen, and the repeat business quietly ends.

None of these require the promise to have been made on purpose, which is why an unintended claim
costs the same as a deliberate one.

## Where the line is drawn

Two failures shipped by people with budgets set the standard. A 2025 Disney film used AI to fill a
background crowd at a basketball game, and zoomed in, a clapping figure and her neighbour are
visibly generated — the movement, the face, the hair. A film trailer shipped with a generator's
watermark still sitting in the corner of one shot. Neither is a failure of the model. Both are
failures of the look afterwards, which is the only place this class of error can be caught.

So the bar for anything that ships: nobody can later zoom in and find a watermark, a wrong
spelling, or something that is not real. And the split that follows — personal use, go ahead;
business, not without running the pre-ship check.

## Related

- [Finished-looking is not checked](finished-looking-is-not-checked.md) — the sibling failure, where the polish hides a wrong fact rather than an invented one
- [The competent-reader test](competent-reader-test.md) — the question that tells you whether anyone downstream would catch the claim
- [The editor's checklist](editors-checklist.md) — the text-side version of the pre-ship pass
- [AI safety failure modes](ai-safety-failure-modes.md) — hallucination named as a failure mode; an unintended claim is one that reached a customer
- [Diagnose the hard part](diagnose-the-hard-part.md) — the brief this exposure attaches to, where generation stands in for a photographer who is not on site
