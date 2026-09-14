---
boards: [scalar/workflow-automation]
updated: 2026-09-14
---

# Polling vs webhooks

Two ways for one system to find out that something happened in another, and the difference shows up
as a property of whole products rather than a setting you tune.

**Polling** is repeatedly asking whether anything changed — every minute, every five, at whatever
interval you configure. **A webhook** is a standing address the other system calls the instant
something happens; nobody asks, the news arrives. One automation platform polls a spreadsheet
trigger at an interval you set; another sets up a webhook on the same integration and fires the
moment a row appears.

**The honest scope of the difference is latency, not capability.** Both tools see the row. One finds
out within its poll interval and the other finds out immediately, and on a spreadsheet of enquiries
that gap is the difference between a reply in seconds and a reply in a minute. Neither approach
misses the event.

What makes it worth knowing rather than trivia is that it is not usually your choice. The trigger
node hands you whichever mechanism the platform implemented for that integration, and the only
visible sign is a poll-interval field being present or absent. A poll interval in a trigger's
settings is a product decision surfacing as a configuration detail.

## When the gap matters

It scales in two directions and they pull opposite ways. Shortening the poll interval buys
responsiveness and costs requests — the check runs whether or not anything changed, so a
one-minute poll on a quiet sheet is fourteen hundred pointless questions a day. A webhook costs
nothing while nothing happens.

Against that, polling degrades gracefully. If the receiving end is down when a webhook fires, the
delivery is simply missed unless the sender retries; a poller that was offline finds the change on
its next pass, because the change is still sitting there. **Polling asks about state, webhooks
deliver events**, and state is still true later.

So the practical reading: prefer the webhook when latency is the thing you are fixing — which, in
an inbox-response problem, it is. Know that you are trading a small ongoing cost for a delivery you
have to notice missing.

## Related

- [The workflow grammar](workflow-grammar.md) — the trigger node, where this choice is made for you
- [When to automate](when-to-automate.md) — failure visibility, which is what a missed webhook delivery tests
- [Delivery, not accuracy](delivery-not-accuracy.md) — the case where latency rather than quality is the whole problem
