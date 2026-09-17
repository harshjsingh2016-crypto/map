---
boards: [scalar/n8n-automation]
updated: 2026-09-17
---

# A showcase is not a use case

A lecture that demonstrates workflows teaches you that the grammar works — this is a trigger, this
is a condition, this is an action, here is what a canvas does. It does not produce anything that
responds to a client. The distinction is worth naming because the two look identical on screen and
only one of them is worth building.

The correction is not "make it more complex". It is to start from somebody's actual problem and let
the flow be whatever answers it. The problem in this case: enquiries arrive at three or four in the
morning, nobody acts on them, and clients are being lost. That statement is tightly specified in a
way a showcase's premise never is — it names a **time**, a **gap** and a **cost**. Each of those is
checkable after the build, which is what makes the build assessable at all.

It also decides the automation question cleanly. An enquiry that lands at 3am does not need
anybody's judgement at 3am; it needs someone to have seen it by 9am. The failure is caused by
humans not being awake, not by humans judging badly — so nothing of value is lost by handing it to
a machine.

The build spec that comes out of this is one sentence: *whenever a new request comes in,
consolidate it and email a summary to the team*. A good problem statement produces a spec that
short, and a spec that short reads directly onto the starting three nodes — input, AI step,
somewhere to put the result. If the first version of a flow cannot be stated in a sentence, the
problem behind it probably has not been narrowed enough yet.

## Related

- [When to automate](when-to-automate.md) — the test this scenario passes, and why it passes it
- [Building a workflow three nodes at a time](iterative-workflow-building.md) — what the one-sentence spec becomes on the canvas
- [Problem discovery frame](problem-discovery-frame.md) — the same discipline at solution scale: state the starting point and the goal before choosing a path
