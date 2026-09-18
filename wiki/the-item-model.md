---
boards: [scalar/n8n-automation]
updated: 2026-09-18
---

# The item model

The mechanical fact that explains most surprising workflow behaviour: **the unit of data is the
item, and a node executes once per incoming item.**

A node does not receive "the data". It receives a queue. Read fifty rows out of a spreadsheet and
what arrives downstream is fifty rows in individual boxes, not fifty rows in one box — and every
node after it runs fifty times. This is invisible until something counts: an HTTP call that fires
twice, an email that arrives twice, a log with duplicate entries a minute apart.

Two consequences follow, and they are the whole of it.

**Node order decides call count.** Put an API call downstream of a node that emits many items and
you have multiplied your requests by the row count. Move it before that node, directly after a
trigger that emits one item, and it is called once. This is not diagram tidiness — on a metered API
it is a bill, and on a rate-limited one it is an outage. The question to ask of any node is not
just "does this work" but "how many times will this run", and the answer is upstream of it.

**Fanning in is its own operation.** Collapsing many items into one is a separate node — an
aggregate step — usually with an option along the lines of *all item data into a single list*. It
is worth being precise about what that does: it converts n items into 1 item whose contents are
unchanged. It is structural, not semantic. **It does not summarise**, and expecting it to is a
common misreading of a node whose name sounds like it might.

There is a design corollary. Asked whether two independent lookups could run as parallel branches
instead of a single line, the answer was no — parallel branches mean two paths going forward, and
merging them is a problem you then have to solve. A straight line has one path and one item count
to reason about, which is worth more than the parallelism on flows this size.

The general habit: **count the items.** A node that ran twice was handed two items, and the fix is
almost never in the node that misbehaved.

## Related

- [Building a workflow three nodes at a time](iterative-workflow-building.md) — why this is findable at all: a node added at a time is a count you can watch
- [HTTP, for workflow builders](http-for-workflows.md) — the call count this multiplies, and the cost attached to it
- [The workflow grammar](workflow-grammar.md) — trigger, condition, action, all of which run per item
