---
boards: [scalar/workflow-automation]
updated: 2026-09-13
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

## Related

- [The competent-reader test](competent-reader-test.md) — failure visibility for a generated answer: would anyone downstream notice?
- [Diagnose the hard part](diagnose-the-hard-part.md) — the sibling move, where the question is which tool rather than whether any
- [Delivery, not accuracy](delivery-not-accuracy.md) — the neighbouring case where the answer is known and the timing is what you do not control
- [Unintended claims](unintended-claims.md) — what a low-visibility failure costs once it reaches a customer
