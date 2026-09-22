---
boards: [scalar/zapier-automation]
updated: 2026-09-22
---

# Creating dependency

The question that comes after "should this be automated?" is "once built, who can live with it?" —
and it is the one a working automation can fail most quietly.

The demonstration is better than the argument. A real, useful workflow canvas — a schedule, a
source fetch, filters, four model steps, a merge, an email, side branches writing files back — was
put in front of a room and they were asked to explain it. Nobody could, end to end, with ten minutes
to try. The verdict on it: *this flow is best understood by who created it.*

Nothing is wrong with that canvas. It runs, it does something genuinely useful, and it is
unreadable by anyone but its author. That turns out to be a property with consequences, and they
sort into three.

**It is not beginner-friendly**, so the people who have to live with it pay for it — in the case
described, with their weekends.

**Ownership is narrower than portability.** This distinction is worth keeping precise, because the
obvious rebuttal is that these things export. They do: a workflow serialises to JSON, and you can
select a canvas and copy it, since the nodes are configurations and nothing else. The *artefact*
moves. What does not move is that a published workflow lives on one account, visible and editable
by that account. Running something and owning it are different things, and an export does not close
that gap.

**And when the author leaves, nobody wants to touch it.** The cost here is not hypothetical. A
data-aggregation script written in 2018 by someone who then left sat untouched — `git blame`
confirmed it — until a migration six years later forced the issue, because it was "vulnerable to
breaking down if you make a lot of changes." Six years of nobody editing working code, not because
it was wrong but because understanding it cost more than leaving it alone.

A student in that room supplied the name: **creating dependency.**

Notice that none of the three complaints is technical. They are about who can read it, who may edit
it, and who dares change it. A system can be correct, efficient and still a liability, and none of
the usual quality checks catch it.

One tool's structural answer is a single constraint: **exactly one trigger per automation**, then
steps, top to bottom — where the alternative permits ten triggers and several independent flows
sharing a canvas. That is best read as a declined feature rather than a missing one. One entry point
and one direction means "what starts this, and what happens next" has an answer you can read off
the screen. You trade expressiveness for maintainability, and the trade is only worth making when
somebody other than you will have to read the result — which is more often than it feels like at
the time.

## The other dependency

The same question applies to data rather than people, and it has a tidier answer. Every automation
built on a shared spreadsheet is **borrowing somebody's file**: there are two parties involved, so
the file's API, the network between them, and the other provider itself are all surfaces that can
fail. Rarely — but they exist, and they are outside your reach when they do.

Platforms answer this with a store of their own — a lightweight table living in the same
infrastructure as the automations, which can also act as a trigger. The pitch is that your
automation then owns its data instead of borrowing it, and that the inner connection does not break
when the outer one does.

What makes the argument usable is the boundary its author put on it: **this is not a reason to move
everything off shared drives.** It is a reason to use the internal store where reliability and speed
matter. A failure surface existing is not by itself a reason to eliminate a dependency, because a
shared file is doing a job an internal table cannot — being something people can open and edit. The
question is per-integration: does *this* dependency carry risk worth removing? That is the same
discipline as evaluating a trigger's suitability rather than the platform's.

## Related

- [When to automate](when-to-automate.md) — the decision this one comes after
- [Choosing between workflow tools](choosing-a-workflow-tool.md) — where this trade-off sits as one dimension among several
- [Building a workflow three nodes at a time](iterative-workflow-building.md) — incremental building is also what keeps a flow explainable
