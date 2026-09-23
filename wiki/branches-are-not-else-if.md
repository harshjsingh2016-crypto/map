---
boards: [scalar-2/zapier-automation]
updated: 2026-09-22
---

# Branches are not else-if

A fork in an automation looks like a conditional and is not one, and the gap between those two
readings is measured in money.

The question that exposes it: a classifier's reply satisfies the rule on branch A *and* the rule on
branch B. What runs? **Both, in full** — every step down each branch, every one of them billed.

> "Path is not like a conditional statement. Both of them are true, go for both of them."

Anyone arriving from code expects otherwise, and for a good reason: `if / else if` has trained a
first-match-wins instinct, where the branches of one statement are mutually exclusive by
construction. A fork built from independent conditions has no such guarantee. Each rule is evaluated
on its own against the same data, and each one that holds fires.

Both consequences are worth stating, because the feature is not a bug.

**It is good for control.** There are real cases where you want two things to happen — notify a
team and file a record, alert and escalate — and independent branches express that without
contortion.

**It is expensive when you did not intend it.** Unconfigured, "your cost is going to double whatever
you had predicted", and **nesting compounds it**: two branches at the top and two below turn one
run into four executed paths. The failure is silent in the way that matters — everything succeeds,
nothing errors, and the only symptom is the bill.

Set this beside the other cost lever and the pair covers most of it. Ordering a filter well is about
steps you **avoid**. Branch rules are about steps you did not realise you were **authorising**, and
they multiply where ordering merely adds.

The defence is not to avoid forks but to make their conditions mutually exclusive on purpose:
constrain what the upstream step can emit, and compare exactly rather than loosely, so that an
unexpected value takes no branch instead of every branch.

## Related

- [Make the answer a field, not a substring](structured-output-for-branching.md) — how to make the branch conditions genuinely exclusive
- [Where the filter goes](filter-placement.md) — the other cost lever, which adds where this one multiplies
- [Tasks, and what an automation actually costs](tasks-as-the-billing-unit.md) — the unit that doubles when two branches both fire
