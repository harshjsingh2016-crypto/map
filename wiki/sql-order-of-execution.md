---
boards: [scalar-primers/sql-filtering]
updated: 2026-08-31
---

# SQL order of execution

A query is not run in the order it is written. Two clauses move, and one of those moves explains a
rule that otherwise has to be memorised.

```
Written:   SELECT → FROM → WHERE → ORDER BY → LIMIT → OFFSET
Executed:  FROM → WHERE → SELECT → ORDER BY → OFFSET → LIMIT
```

SELECT falls from first to third. LIMIT and OFFSET swap.

## The errand

The analogy the lecture uses is an errand: *go to the kitchen and get me the two red spoons that are
second and third longest.* Every clause is a step, and the steps only work in one sequence.

Go to the kitchen, because nothing can be done before you are there. Keep only the red spoons. Now
you are holding something. Arrange them by length. Skip the longest. Take the two that remain.

Two things fall out of reading it this way. The first is that **filtering precedes sorting**, and not
as a matter of taste — sorting every spoon of every colour and then discarding most of them is work
done on rows that were never going to survive. The second is the inversion at the end: the query says
`LIMIT 2 OFFSET 1`, but the skip has to happen before the take, or "second and third longest" means
nothing.

## What the order explains

Because SELECT executes after WHERE, **nothing passes backwards between them**.

A column aliased in SELECT does not exist when WHERE runs. WHERE is not declining to resolve the
name; the name has not been created yet. And a function applied in WHERE cannot change the displayed
values, because WHERE has already finished by the time SELECT decides what the output looks like.

Both halves of that boundary — the alias WHERE cannot see, and the case conversion that never reaches
the output — are one fact stated twice. This is the difference between a rule that has to be
remembered and one that can be derived, and it is why the order is worth learning early rather than
as trivia.

## Related

- [The WHERE clause](where-clause.md) — the rule this explains, and where it is first met as an arbitrary restriction
