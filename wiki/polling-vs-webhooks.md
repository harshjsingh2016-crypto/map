---
boards: [scalar/workflow-automation, scalar/zapier-automation]
updated: 2026-09-22
---

# Polling vs webhooks

Two ways for one system to find out that something happened in another, and the difference shows up
as a property of whole products rather than a setting you tune.

**Polling** is repeatedly asking whether anything changed — every minute, every five, at whatever
interval applies (and, on some platforms, at an interval you do not get to set at all). **A webhook** is a standing address the other system calls the instant
something happens; nobody asks, the news arrives. One automation platform polls a spreadsheet
trigger on a fixed schedule of its own choosing; another sets up a webhook on the same integration
and fires the moment a row appears.

**The honest scope of the difference is latency, not capability.** Both tools see the row. One finds
out within its poll interval and the other finds out immediately, and on a spreadsheet of enquiries
that gap is the difference between a reply in seconds and a reply in a minute. Neither approach
misses the event.

What makes it worth knowing rather than trivia is that it is not usually your choice. The trigger
node hands you whichever mechanism the platform implemented for that integration, and the only
visible sign is a poll-interval field being present or absent. A poll interval in a trigger's
settings is a product decision surfacing as a configuration detail.

## What a webhook actually sends

Worth pinning down, because it is easy to get backwards. A webhook is **typically delivered as a
POST request carrying a payload** — the message text, the sender, the timestamp, whatever the event
was about. It is not a GET, and an off-the-cuff class answer describing it as using "the GET API
behind the curtain" is the one thing in this material worth correcting outright.

The correction fits the concept better than the original does. **A GET asks; a webhook tells.** The
entire value of the arrangement is that the news arrives *with its content attached*, so the
receiving workflow has what it needs without going back to fetch anything — and POST is the verb for
arriving with something to be saved or acted on. Verify in a specific integration before relying on
it either way, but that is the shape.

The framing offered for the mechanism is a good one: a webhook is not an API sitting and listening
to you, it is **wait-and-watch** — it costs nothing while nothing happens. The worked example is a
chat space wired to a virtual machine, where posting a slash command fires the webhook and the
machine turns on.

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

## Accounting for the delay

A worked build makes the latency concrete, and the accounting is more useful than the headline
number. A spreadsheet row was added and the chat message it should produce took minutes to arrive.
Decomposed:

- **Waiting for the next poll** — up to the full interval. The poll is scheduled, not continuous:
  "it closes its eyes for two minutes, then opens them and sees what's on the sheet." An edit
  landing just after a poll waits for the next one.
- **The source API answering** — tens of seconds.
- **The run sitting in a queue** — up to about a minute.
- **The action itself** — the send.

End to end, worst case ten to twelve minutes against an ideal case under two. Two details ride
along: the interval is the platform's to choose rather than yours, so shortening it is not on the
table; and several rows caught in a single poll each start their own run.

**None of those stages is an error, and none is retryable.** That is why a slow run is so often
mistaken for a broken one, and it is the reason to decompose before diagnosing — the question "is
something wrong?" has no answer until you know which stage the time went into.

When the lag is a genuine business problem, the fix is upstream of the tool. "You might not even
want to use Google Sheets" — take the input through a form trigger, which delivers rather than
waits to be asked. The line worth keeping is **"it's a Google Sheet issue, not a Zapier issue"**:
evaluate the suitability of the **node**, not the platform. A poll interval belongs to one
integration, and a webhook-based trigger in the very same automation does not carry it.

## Related

- [The workflow grammar](workflow-grammar.md) — the trigger node, where this choice is made for you
- [When to automate](when-to-automate.md) — failure visibility, which is what a missed webhook delivery tests
- [Delivery, not accuracy](delivery-not-accuracy.md) — the case where latency rather than quality is the whole problem
