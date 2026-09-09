---
boards: [scalar/no-code-ai-bot, scalar/ai-content-creation]
updated: 2026-09-07
---

# Free-tier arithmetic

The sizing calculation that decides whether a chatbot proposal survives contact with a bill —
and the one most people get wrong, because they estimate in the wrong unit.

The method is one line. **Conversations × messages per conversation = model calls**, because
every message in a conversation triggers a call. Nine hundred conversations a month at six
messages each is not nine hundred of anything; it is 5,400 billable calls.

That factor is where the error lives. Conversations are the unit a client thinks in and talks
in, and they under-count the meter by however long a typical conversation runs — commonly five
or ten times. A proposal priced against conversations is wrong by that multiple before anyone
looks at a rate card.

## Which limit bites first

Free tiers advertise several limits at once — editor seats, agent counts, message allowances,
credit balances — and the instinct is to check them in the order they are listed. Check volume
first. Seats and agent caps bite only in specific situations: a second seat matters when
somebody else has to approve the build, and an agent cap matters when you genuinely need more
than the two or three you get. Volume bites in every situation, because it scales with usage
while the others are fixed by how you work.

The practical calibration worth carrying: free tiers are sized for something in the range of a
few hundred conversations a month — a small local business that does not really run on chat. A
product that depends on chat has to be priced as paid from the start. This is a modelling
question rather than a recall question, which is why it is the one people get wrong even when
they know all the numbers.

## Two shapes of limit

Before counting anything, work out which of two structures you are counting against, because
they are planned for differently.

A **credit budget** is a balance you spend down, metered per generated artefact rather than per
token. It does not refill. Planning against it means counting artefacts — how many decks is this
allowance worth — and the answer is often far larger than it first sounds, because a single
artefact costs a small fraction of the balance rather than a meaningful share of it.

A **rate limit** is a cap on how much you can do inside a time window, followed by a cool-off. It
refills. Planning against it means spacing the work out, because waiting genuinely solves it,
which is never true of a spent credit balance.

The failure modes differ in a way that matters more than the arithmetic. A credit balance stops
you cleanly, at the door, before work begins. A rate limit can stop you mid-generation: the
window's budget is spent while the model is writing, so the *response* is what gets truncated,
not the request that gets refused. You are left holding a half-finished output rather than a
clear no.

## Treat the numbers as perishable

Vendor allowances change every few weeks, are quoted in units that do not convert into each
other — credits, incoming messages, interaction credits, dollars of model usage — and often do
not match what the product's own counter shows. The arithmetic is the durable part. Any
specific allowance is worth looking up at the moment you need it and worth nothing as a
remembered figure, and it should never be quoted to a client from memory.

## Related

- [Prompt costs](prompt-costs.md) — the same accounting one level down, at the token rather than the message
- [The control dial](control-dial.md) — the tool decision this arithmetic constrains, since the most reviewable option is also the priciest
