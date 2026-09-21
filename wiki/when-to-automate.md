---
boards: [scalar/workflow-automation, scalar/n8n-automation]
updated: 2026-09-17
---

# When to automate

The decision that precedes every workflow tool, and the one the tools themselves cannot help with.
A lecture on building automations opens and closes on it, which is the clearest signal available
that the building is the easy half.

The opening statement is an intuition. Automation suits work that is **mundane and monotonous** —
tasks that need attentiveness but no sympathy or emotional bandwidth. The test case is better than
the rule: a guest complains that a stay was bad, and the complaint splits down the middle. Capturing
the feedback is mechanical. Being sympathetic, promising better, offering credits is not. The
boundary does not run between tasks, it runs **through** one.

Held against that is an awkward counter-case raised in the same breath: support flows built
precisely to absorb a frustrated customer before a human hears them. That is automation placed
exactly where the rule says a person belongs, working as designed and irritating the person on the
other end. The rule does not resolve it. It asks you to make that call deliberately rather than
arrive at it by default.

## The three-question test

> What's the input trigger? What are the conditions? What's the output? Answer all three in one
> clear sentence and it's a strong candidate. If any honest answer is "it depends", that's a job for
> a human.

What makes this work is that it demands an **artefact** rather than an opinion. You are not asked
whether something feels automatable; you are asked to produce a sentence, and the sentence will not
form when the task resists it. **"It depends" is the diagnostic, not a hedge** — the moment it shows
up, you have found the judgement the automation would have had to fake.

The three slots are the canvas's own vocabulary, so the test is already the shape of the thing you
would build. That is the whole thesis in the class notes: the skill is not clicking the right
buttons, it is naming your trigger, condition and action before you open either tool.

## The four screening criteria

**Volume** — automate when it happens often enough that a person doing it by hand is the
bottleneck; do not when it is rare enough that the setup cost outweighs the time saved. A
missing-item complaint on a food delivery app qualifies; a question a handful of people ask on a
Discord does not, and answering it yourself is what is expected.

**Rule clarity** — automate when the decision follows a clear, stable rule every time; do not when
it needs judgement, empathy, or reading between the lines. A hospital or emergency call needs a
human deciding fast on human understanding.

**Stakes if wrong** — automate when the consequence is low and easily reversible; do not for binding
prices, offers or commitments. The case cited is an airline chatbot that described a bereavement
policy the airline did not have. The payout was small; the precedent was not — **if an AI bot makes
a mistake, the company is at fault.**

**Failure visibility** — automate when errors are easy to notice and fix; do not when they could run
silently and unattended. If the error is not visible, you lose it, and the automation keeps making
it.

## How the four combine

Worth noticing, because the table does not say it: **they can disagree, and any one of them can
veto.** The airline case passes volume comfortably and passes rule clarity on its face — refund
policies are rules. It fails on stakes, and that single failure is decisive. A set where one
objection stops the build is doing different work from a score you average, and treating it as a
score is how a high-volume, clearly-ruled, catastrophic automation gets approved.

**Failure visibility is the one most likely to be skipped**, and it is the only one about the
aftermath rather than the task. The other three ask whether to build it; this one asks whether you
would find out when it broke. It is the same question the competent-reader test asks of a generated
answer, arriving from the other direction.

## A worked case, and what the screen catches

The scenario the lecture runs on is a travel business drowning in inbound messages: thousands of
Instagram DMs since a post went live, about a third of them answered in whatever order the app
happened to open, and a separate WhatsApp inbox with its own backlog cross-checked against nothing.
The same person can ask on both channels and get two different answers.

**The diagnosis is speed, not quality** — *it's not about the quality of your answer, it's primarily
about the speed of your answer* — and the case that carries it is one lost booking. An enquiry
arrives at 11:04 in the morning asking about a specific discount code. The customer books with a
competitor at 3:12 that afternoon. The message is seen at 9:47 that night. A perfect answer at 9:47
was worth nothing, which is the whole point: **the entire failure is latency**, and latency is the
kind of thing a machine fixes and a person does not.

Run the four criteria over it and three pass comfortably — the volume is plainly past what a person
can hold, the sorting rule is stable, and a misrouted enquiry commits nothing binding. The
interesting one is the fourth. **Failure visibility is the weak criterion here, and the lost booking
is exactly what an invisible failure looks like**: nothing errored, no queue showed red, no alert
fired. The money went elsewhere and the only trace was an unread message. That is the criterion to
design against rather than the one to be reassured by, and noticing it before the build is the
difference between using the screen and reciting it.

One detail from the same scenario is worth carrying into how the workflow gets built. The sorting
rule is stable **without being mechanical**: bulk versus small is defined by intent — booking for a
family against booking for fifteen or twenty colleagues — and there is no number in the message to
threshold on. Rule clarity does not require that a rule be computable, only that it be consistent,
which is precisely the gap a model fills in the middle of a workflow.

## What a silent failure actually looks like

Failure visibility is the criterion easiest to nod along to and hardest to picture, so it is worth
having two concrete cases where a workflow runs green and does the wrong thing.

**A node in the wrong place.** A canvas where the notification step sits *before* the classification
step rather than after it fires a notification for every incoming message, spam included. Nothing
errors. Every node reports success. The quiz that poses this offers "the workflow would fail to run
at all" as a distractor, and the reason that answer is wrong is the whole lesson: **order is the
logic**, and a misplaced node is not a broken workflow but a working workflow computing something
you did not ask for.

**A classifier returning something outside its known set.** A prompt that numbered its options got
back `2 small booking` instead of `small booking`. The downstream comparison matches nothing, every
record takes the false branch, and again the run is clean.

Both have the same shape — green run, wrong result, nothing raised — and in both cases the only
thing that caught it was somebody reading the output. **A green run is not evidence.** Check what an
automation did, not whether it finished, and prefer designs where a wrong result shows up somewhere
a person will look.

A later scenario sharpens the same boundary from the other side. Travel enquiries arrive at three
or four in the morning, nobody acts on them, and clients are lost. Nothing here is a judgement
failure — the work is not being done badly, it is not being done at all, because the people who
would do it are asleep. Where the earlier test asks whether a task needs sympathy, this one asks
what is actually causing the failure: when the answer is availability rather than discernment,
automation is not a compromise on quality, it is the only thing that changes the outcome.

## Related

- [The competent-reader test](competent-reader-test.md) — failure visibility for a generated answer: would anyone downstream notice?
- [Diagnose the hard part](diagnose-the-hard-part.md) — the sibling move, where the question is which tool rather than whether any
- [Delivery, not accuracy](delivery-not-accuracy.md) — the neighbouring case where the answer is known and the timing is what you do not control
- [Unintended claims](unintended-claims.md) — what a low-visibility failure costs once it reaches a customer
