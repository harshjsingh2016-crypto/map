---
boards: [scalar/zapier-automation]
updated: 2026-09-22
---

# Tasks, and what an automation actually costs

An automation platform that bills by **task** is billing you for something specific, and the
distinction it rests on is easy to wave past and expensive to get wrong.

The teaching image is a cricket bat. Swinging it in the air is an **action** — the capability
exists, the motion happened, nothing came of it. Hitting a ball that somebody actually bowled is a
**task**: "that is what has real tangible effect… you hit the ball and you get runs."

So a *send message* step sitting in an automation is an action. The moment it actually sends, that
is a task. An automation that sends an email, then a chat message, then an SMS spends **three tasks
every time it runs**.

Two consequences follow, and between them they explain most surprising bills.

**Cost scales with steps × runs, not with how many automations you own.** Ten automations that
never fire cost nothing. One automation with five steps firing hourly is expensive. The instinct to
tidy up by consolidating flows does nothing for the bill; the instinct to remove a step does.

**A step that runs and achieves nothing still costs you.** There is no line on the invoice
distinguishing a task that mattered from one that was thrown away a step later. This is the whole
reason a filtering step is taught as a **shield** rather than as a neutral gate — its job is not to
express a condition, it is to stop tasks being spent. Read as a gate it is plumbing; read as a
shield, where you put it becomes the most consequential decision in the flow.

## Related

- [Free-tier arithmetic](free-tier-arithmetic.md) — the same sizing discipline applied to model usage
- [The item model](the-item-model.md) — the other platform's multiplier, where a node runs once per item
