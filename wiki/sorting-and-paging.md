---
boards: [scalar-primers/sql-extraction]
updated: 2026-09-01
---

# Sorting and paging

Two problems arrive together in a first hands-on session. The answer you want is often "the top one"
rather than "the ones matching a condition" — the most expensive shirt is found by sorting on price
and reading the first row, not by filtering. And `SELECT *` on a large table returns everything,
which means waiting a long time to see what a table even contains. `ORDER BY` answers the first,
`LIMIT` and `OFFSET` answer the second.

## ORDER BY: priority runs left to right

`ORDER BY` needs a column; it will not run alone. Ascending is the default, so `DESC` is compulsory
if you want descending and `ASC` never is — which is exactly what one quiz tests. Text sorts
alphabetically, with A to Z being the ascending direction.

Give it several columns and **the sequence is the priority**: the first sorts, and the second only
breaks ties inside the first. Swapping the two produces a different answer, which follows from that
and is worth stating because the class was asked directly. Direction attaches per column rather than
to the clause, so `ORDER BY category DESC, name` is category descending with names ascending inside
each category.

The worked question is a better artefact than the syntax, because it shows the reasoning that gets
reused: *arrange the data by the most recent transactions*. Which table holds transactions?
Purchases. Look at it first, with a plain `SELECT *`, to see what columns exist. "Most recent" means a
date descending. A single day holds many times, so break the tie on the time, also descending. Four
steps, none of them about syntax.

## LIMIT and OFFSET: counting, not choosing

`LIMIT n` returns at most n rows, and **it limits rows, never columns** — a distinction one quiz
turns on. There is no `TOP` keyword here, whatever other dialects offer. The ten-most-recent query is
just the sorted query with `LIMIT 10` added, which is the lecture's point about the character of the
language: what you say is what you write.

`OFFSET n` skips n rows, and exists for the request that `LIMIT` alone cannot serve — the *second and
third* most recent, where `LIMIT 2` gives you the first two. Three rules come with it: it is written
after `LIMIT`; `LIMIT` is compulsory for it to run at all; and `LIMIT` works perfectly well without
it. Neither clause requires `ORDER BY` to execute — the query runs, it just returns arbitrary rows,
which is a different failure from an error and a worse one.

## The distinction that makes OFFSET behave

`OFFSET` is **positional, not conditional**, and every surprising thing it does follows from that.

A `WHERE` clause evaluates a condition against each row, so it removes the same rows regardless of
the order they arrive in. `OFFSET` evaluates nothing. It counts, and discards whatever occupies the
first n positions. The instructor's word for this is *hard coding*, which is unkind to the clause but
accurate about the behaviour: you are naming a position, not a row.

Since [ORDER BY executes before OFFSET](sql-order-of-execution.md), the sort decides what position one
*is*. That answers the recurring complaint that rows "reorder when I use OFFSET" — they did not; the
sort changed which row was standing where the skip lands.

It also settles the tie question, asked twice in the session. Where several rows share the sorted
value, the `ORDER BY` has said everything it has to say about them, and the engine arranges them
however it processed them. If the tied rows are identical in the columns being displayed, the
question is invisible and harmless — you get the same output whichever was dropped. If they differ in
other columns, the result is **not stable**, and nothing in the query determines which one goes.
Nothing is broken; the sort simply did not fully specify the question. The fix is to keep adding sort
columns until a tie is impossible — which is precisely what the second sort column is doing in the
worked example above, doing double duty as a finer answer and as a tiebreaker.

The boundary is worth marking: when you need to skip a *specific* row rather than a positional one,
this is the wrong tool entirely. That is a window function, later in the course.

One question from the session is recorded as open rather than answered. Asked what happens when
`OFFSET` exceeds the number of rows available, the reply addressed only `OFFSET` being larger than
`LIMIT`. It is worth putting again.

## Related

- [SQL order of execution](sql-order-of-execution.md) — why the sort decides what OFFSET skips
- [SELECT and FROM](select-and-from.md) — the pair these clauses attach to
- [The WHERE clause](where-clause.md) — the conditional counterpart to OFFSET's positional skip
