---
boards: [scalar/zapier-automation, solutions/meme-drop, scalar-2/ai-agent-concepts]
updated: 2026-09-25
---

# Observing what did not happen

A filter was added to an automation so that only rows with a particular status would send a message.
Two rows were then added, one matching and one not, and exactly one message arrived. The person
demonstrating it said the right thing: **"I could very well be lying to you."**

That line is worth keeping, because the demo genuinely does not prove the claim. The message that
arrived proves one row went through. It proves nothing at all about the other one. The absence of a
second message is equally consistent with the filter working, the automation being switched off, the
trigger not having polled yet, and a delivery failure somewhere past the last step. **You cannot
verify a negative from the destination.**

This is the mirror of a failure already worth knowing — that a step reporting success is not the
outcome happening. Here the evidence is missing rather than misleading, and it is easier to be
fooled by, because a system doing exactly what you asked and a system doing nothing at all produce
the same empty inbox.

The resolution is that a well-built platform records the non-event as an event. A run log shows two
runs at the same minute: one **Success**, and one whose status is its own category — *filtered*,
with the text "the filter successfully stopped your run. Did not attempt to send." That is not a
failure and not an absence. The run happened, the condition was evaluated, and the stop was
deliberate. The log also shows the data at each step, so you can see what the condition actually
tested against rather than what you believe it tested against.

The general habit: **when the expected behaviour is that nothing happens, go and look at the run
record, not at the destination.** Anything conditional — a filter, a branch that was not taken, a
send that was suppressed — needs a positive statement somewhere that the decision was made and made
that way. If your setup cannot produce that statement, you have no way to tell correct silence from
broken silence, and you will eventually meet both.

The meme workflow met the harder version of this, where even the run record lies. For a week every
run ended in a green WhatsApp send step and Meta's reply **"accepted"** — and nothing arrived. Two
causes, found one after the other: plain image messages outside the 24-hour window, and then a
Marketing-category template, which Meta quietly declines to deliver to Indian numbers. Neither
produced an error anywhere the workflow could see. "Accepted" means the request was well-formed, not
that a message reached a phone; the delivered-or-failed verdict comes back later, asynchronously, to
a webhook that did not exist. The only detector was a person noticing an empty chat. When the last
step hands off to someone else's system, the run log ends at the handoff, and a positive statement
of the outcome has to be subscribed to separately.

An agent can produce the same blind spot at a larger scale. A coding agent that wiped a production
database kept its unit tests green; the loss was found only when a downstream batch job stopped
working. Agents add the case where the reporter itself is the one inventing the success, which
makes a positive record of the outcome, taken from somewhere other than the agent, even more
necessary.

## Related

- [Three ways agents fail](three-ways-agents-fail.md) — the Invented Source, where the success report itself is false
- [Generate, then judge](generate-then-judge.md) — the workflow where the accepted-but-undelivered case came up
- [Debugging a workflow](debugging-a-workflow.md) — the companion failure, where a step succeeds and the outcome still does not happen
- [Designing for partial failure](designing-for-partial-failure.md) — making failure visible, which is the same argument applied to breakage rather than to skips
- [Tasks, and what an automation actually costs](tasks-as-the-billing-unit.md) — why a stopped run is worth having a record of: it is also a task you did not spend
