---
boards: [scalar/n8n-automation]
updated: 2026-09-18
---

# Classifying input you do not control

An automation that acts on public submissions needs to sort the real ones from the noise, and there
are three ways to do it. Two of them fail for reasons worth understanding, because the reasons are
about people rather than about technology.

**A keyword list fails on coverage.** You cannot hold a full repository of keys — whatever set of
words you enumerate, the next submission uses a phrasing you did not list. This is not a matter of
trying harder; natural language has more ways to say a thing than a list can hold, which is
precisely the gap a model generalises across.

**Asking the submitter to declare the category fails on incentive.** Put radio buttons on the form —
booking, query, other — and a spammer selects *booking*. You cannot ask the adversary to classify
themselves. The categories are only meaningful when the person filling them in wants the same
outcome you do, which is exactly the case where you did not need the classifier.

That leaves a model reading the free text and deciding. It generalises where a list cannot, and it
is not taking the submitter's word for anything. The trade-off is that its answer is a judgement
rather than a lookup, which sets up everything else: the answer needs
[its own field](structured-output-for-branching.md) so the branch can read it unambiguously, and it
needs to be wrong sometimes without costing you the record.

That last point is the design move worth copying. **Route the branch, keep the record.** In the
worked build, the condition decides who gets an email — and *both* branches still write a row to
the log. Filtering and discarding are different operations, and conflating them means a
misclassified enquiry disappears rather than sitting somewhere recoverable. You get this cheaply,
and it is what makes an imperfect classifier safe to deploy: the failure mode becomes a delayed
response instead of a lost customer.

The wider point, which the lecture reached through an AI ordering kiosk taking questions it was
never meant to answer: any free-text space open to the public will attract input it was not
designed for. That is not a reason to close the text box — it is a reason to put something between
the text box and the action.

## Related

- [Make the answer a field, not a substring](structured-output-for-branching.md) — how the classifier's verdict should reach the branch
- [Defensive prompt architecture](defensive-prompt-architecture.md) — the same adversarial reading applied to the prompt itself
- [The workflow grammar](workflow-grammar.md) — trigger, condition, action; this is what makes the condition trustworthy
