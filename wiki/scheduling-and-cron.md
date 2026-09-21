---
boards: [scalar/n8n-automation]
updated: 2026-09-18
---

# Scheduling, and when to reach for cron

A schedule trigger is the other half of the automation case. A form or a webhook starts a flow when
something arrives; a schedule starts it when nothing has. The interesting question is not how to set
one but *what time to set it to*, and there is a clean rule visible in one worked build.

**The meeting is at nine, so the report runs at eight.** Not at nine, not on request — an hour
before anybody needs it, because "it does not have to wait for a human interaction." Work that has
no human in it should happen while there is no human around, and the output should be waiting rather
than being fetched. This is the same observation that made the original problem automatable in the
first place, turned round: enquiries arriving at 3am fail because nobody is awake to read them, and
a brief generated at 8am succeeds for exactly the same reason.

The mechanical side is unremarkable until the last option. A schedule node offers intervals in
seconds, minutes, hours, days, weeks and months — pick the unit, pick the value, pick the day and
hour. Then there is **custom cron**, the five-field expression that can say things the picker
cannot.

The honest position on cron is worth copying. You can find an expression by searching for the
schedule in English and pasting the result — and relying on that is not recommended. The picker is
verifiable by reading it; a pasted `0 0 5 7 *` is not, and a wrong cron expression does not fail, it
fires at a time you did not mean, possibly months from now. Use the picker wherever it can express
the schedule, treat cron as the escape hatch for what it genuinely cannot, and read any expression
you paste field by field before trusting it.

## Related

- [Polling vs webhooks](polling-vs-webhooks.md) — the other two ways a flow starts, and the latency each implies
- [A showcase is not a use case](showcase-vs-use-case.md) — the availability gap that scheduling exists to close
- [The workflow grammar](workflow-grammar.md) — the schedule is a trigger; everything after it is unchanged
