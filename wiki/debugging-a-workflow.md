---
boards: [scalar/n8n-automation, scalar-2/zapier-automation]
updated: 2026-09-22
---

# Debugging a workflow

A lecture that put "debugging" on the agenda and then never gave it a section taught it the only way
it can be taught: by getting things wrong in front of people and fixing them. Gathered afterwards,
the moves sort into four habits, and almost none of them are about any particular tool.

**Read what the system is already telling you.** Four of the nine are this. Configure downstream
nodes against real sample data rather than an assumed shape, and re-run the trigger after editing it,
because the sample is a snapshot that goes stale while still looking valid. Read the border colours
before opening anything — one state means it ran, another means it failed, and a third means it was
never configured, which is a different problem. Read the error body and fix the node it *names*: a
rate-limit error belongs to the model, not to the chain that surfaced it, and fiddling with the node
displaying an error is the default instinct and often the wrong node. And count the items — a node
that ran twice was handed two items, so the fix is upstream of the node that misbehaved.

**Your workflow is not the only system involved.** Two of them are this, and both produce the same
symptom from opposite causes. Step-executing a node does not run the nodes after it, so the email
you are waiting for was never sent. And the email that *was* sent may have been filtered into spam
on the way in. Both look identical from an empty inbox, and neither is a workflow bug. The general
form: **a node reporting success is not the outcome happening.** The tool is telling the truth about
its own step; delivery belongs to somebody else.

**You may be debugging the wrong layer.** Before rewriting a prompt a fourth time, try a better
model. Small models misclassify and invent numbers, and an instruction cannot supply a capability
the model lacks — so three rounds of rewording is itself a signal that you are against a ceiling
rather than an ambiguity.

**Do not hoard syntax.** The recurring shape error, `[object Object]`, has exactly two causes: a
parent object dragged where a leaf was meant, or a collection forced into a string. Knowing which
case you are in is the skill; the function that fixes it is lookup. Which licenses the last move,
taught explicitly rather than hidden — screenshot the node, open a temporary chat so it stays out of
your history, describe the situation in one line and ask for a short answer. "Do you need to
remember that? Not necessarily."

That last habit is worth defending, because it looks like a shortcut and is not. The knowledge that
compounds is recognising a symptom and knowing which layer owns it. Expression syntax does not
compound, and treating both as things to memorise spends attention on the half that does not pay it
back.

Two additions from a second build, both about absence.

**An empty list may mean "not permitted", not "not created".** A destination dropdown showed only an
old entry; the new one had been created and refreshing changed nothing. The cause was that the new
destination had not been set to allow the integration's app, so it existed and was invisible.
Several minutes went into looking for a thing that was already there. The general form: when
something you just made does not appear, check authorisation before you check existence — absence
with no error attached is more often a permission than a mistake.

**A demo that works better than reality is a problem, not a result.** The first run of that build
delivered almost instantly, because the row had been pasted in a way that a poll caught mid-edit.
The normal path takes minutes. Whoever is watching now has an expectation the system will not meet,
and the correction — made on the spot — is the right instinct: **a happy path you cannot reproduce
is worse than a slow one you understand.** The same applies to your own testing, where a lucky first
run quietly becomes the baseline you later debug against.

## Related

- [Designing for partial failure](designing-for-partial-failure.md) — what to configure before it breaks, rather than after
- [The item model](the-item-model.md) — the count that explains a node running more times than you expected
- [Make the answer a field, not a substring](structured-output-for-branching.md) — the schema tree is where a parent and a leaf are distinguishable
- [Building a workflow three nodes at a time](iterative-workflow-building.md) — the practice that keeps any of this findable
