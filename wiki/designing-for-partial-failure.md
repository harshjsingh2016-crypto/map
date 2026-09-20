---
boards: [scalar/n8n-automation]
updated: 2026-09-20
---

# Designing for partial failure

An automation that runs unattended at eight on a Monday morning will eventually run on a morning
when one of the services it calls is restarting. What happens then is a decision, and if you do not
make it the tool makes it for you: the run dies and nobody finds out.

The settings that decide it are not nodes you add to a canvas. They are checkboxes inside a node's
settings tab that most people never open, which is the whole reason a lecture stops to name them.
Four behaviours are worth knowing, and they answer different questions.

**Retry** re-attempts a failed node a few times with a wait between attempts. It is for anything
calling an outside service, on the grounds that networks blip and rate limits clear — most failures
of this kind succeed on the second attempt, and a retry costs nothing when the first attempt worked.

**Continue on error** adds a second output, and failed items travel down it rather than killing the
run. **Continue using the error output** goes further: the failure response itself is passed forward
as data, so the error branch can read it and do something — call a different provider, for instance,
and rejoin the main line. A fallback path is built from the same kind of nodes as the happy path.

**Always output data** is the one that gets misremembered. It emits an empty item when a node
legitimately returns *nothing*, so downstream nodes still run. That is not error handling: a query
matching no rows has not failed, but it emits nothing, and nothing means no downstream execution —
so the "no results this week" message never sends. Confusing it with the error settings is easy and
worth resisting.

The judgement underneath all of them is the part that generalises. **Error handling is not making
nothing fail. It is deciding, per node, what the degraded version of your output looks like and
whether it is still worth sending.** In the worked case the weather call is allowed to fail and the
brief goes out without a temperature, because the bookings summary is what the reader actually needs
and they can look out of a window. A brief with one section missing is useful; no brief is not.
That is a product decision, not a technical one, and it is made node by node — which is exactly why
the settings live on nodes.

One more sits at a different level. An **error workflow** — a separate flow started by an error
trigger whenever this one dies — should be on anything running unattended, for one reason: **it is
what makes failure visible.** Everything else handles failure inside the flow; this handles the flow
being gone. Without it the failure mode is silence, and you learn about it when somebody asks why
they stopped receiving something. That is the same shape as a workflow left unpublished or an email
sitting in a spam folder: nothing reports a problem, because nothing is there to do the reporting.

## Related

- [Debugging a workflow](debugging-a-workflow.md) — the practices for when it has already gone wrong and you are looking for why
- [The item model](the-item-model.md) — why "one bad item" is the unit these settings operate on
- [Scheduling, and when to reach for cron](scheduling-and-cron.md) — unattended running is what makes all of this necessary
