---
boards: [scalar-2/agent-building-blocks]
updated: 2026-09-29
---

# The four tool types

Every action an agent takes falls into one of four types, and the type is the decision that matters
before any product name is. Search can be done through any number of services; the point is that
the task needs *a search tool*. Choose the kind of capability first, and the vendor becomes a
replaceable detail.

**Search** asks the open web something general: background, patterns, whether something is usually
true. It is the right tool when you do not know which site holds the answer, and it is the vaguest
of the four, because its answer is only as good as the page it happens to land on. **Browser** goes
to one known page and reads what is on it now. Once you are sure which page matters, it removes the
chance of search delivering the wrong one. **An API call** asks another system directly for a live
value, with no page in between, and gets back a small structured record. **Code** computes: counting,
adding, combining, the work a spreadsheet formula would do.

The first three all fetch, and they differ in how sure you are of where the answer lives: unsure,
sure of the page, or sure of the system. Code is the odd one out. It does not fetch at all; it works
on what is already in hand.

## Reading the task for its tool

The wording of a task usually names its tool. A newsroom's morning list after a storm made the
point: "flooded *right now*" and "the *live* map" are API questions; "per the city site" is a
browser question; "do underpasses *usually* clear" and "has this road flooded before, check the
archive" are search questions, because no known page or system holds the answer; "total the counts"
and "add up the calls from two spreadsheets" are code.

The last of those is the one that catches people. Two spreadsheets sent by a colleague sound like
something to go and get, but the data is already there. No API, page or search can add two files
together; the job is computing, not fetching.

## When an API exists, use it

Where a system offers an API and a web page for the same information, the API wins on four counts.
It returns more than the page shows. It is fresher, because a page can lag the system behind it. It
is signal without clutter: no advertising, no pagination, a compact record instead of a whole page
of markup. And it is stable, because its fields are a contract while a page's layout can change next
month. The rule taught was blunt: if a site provides an API, use it any day of the week, and fall
back to the browser only when it does not.

## Why the model does not do the arithmetic

A language model predicts the next word, so its numbers may not add up, and capable assistants
write a script rather than sum a column themselves. Arithmetic is the clearest case of work a model
should hand to something else, however available the model is.

## Related

- [The three pillars of an agent](three-pillars-of-an-agent.md) — tools are one pillar; this is what that pillar holds
- [Use the model for what only a model can do](what-only-an-llm-can-do.md) — the same preference for the authoritative source, from the workflow side
- [HTTP, for workflow builders](http-for-workflows.md) — how an API call is actually made
- [Chatbot, workflow or agent](chatbot-workflow-or-agent.md) — the decision above tool choice: whether the task needs an agent at all
