---
boards: [scalar-primers/sql-filtering]
updated: 2026-08-31
---

# The WHERE clause

Filtering is the narrowest possible idea: you have all the rows, and you want a subset of them. Not
a different table, not a transformed one — the same rows, fewer of them. A four-row orders table and
the question "which of these bought P1" is the entire concept, and the syntax is one line.

```sql
SELECT * FROM orders
WHERE product_id = 'P1';
```

## Two rules, one of which is the interesting one

**WHERE is written after FROM**, because until the engine has a table there is nothing to filter.
This is stated as a rule of writing order, and it is really a first glimpse of
[order of execution](sql-order-of-execution.md).

**The column being filtered on must exist in the table.** This is the rule that costs people time,
and the lecture predicts that most errors in the more advanced work trace back to it.

## The asymmetry worth holding

The consequence is sharper than the rule sounds. A column invented in SELECT cannot be filtered on:
`quantity * cost AS revenue` gives a column called `revenue` in the output, but `WHERE revenue = 100`
fails outright. Write the same arithmetic out and it works — `WHERE quantity * cost = 100` — because
`quantity` and `cost` are real columns of the table.

So the arithmetic is not the obstacle. WHERE computes without complaint. What it will not do is
resolve a name that SELECT invented, and the reason is that when WHERE runs, SELECT has not run yet.
That explanation arrives ninety minutes later in the lecture; until it does, the rule has to be taken
on trust. See [order of execution](sql-order-of-execution.md).

## Choosing the operator

For a single column, two questions settle which operator to use: **one value or several**, and **keep
or exclude**. That gives `=`, `!=` (equivalently `<>`), `IN` and `NOT IN`, and there is nothing else
to decide.

The one that trips people is asking for several values. Written out, "P1 or P2" is
`product_id = 'P1' OR product_id = 'P2'`, and the temptation is to write AND instead — because *"show
me products P1 and P2"* is how the request is phrased out loud. AND requires both conditions true of
the **same row**, and no row's product is simultaneously P1 and P2. The query is not merely
inefficient; it returns nothing, every time.

`IN` is that OR chain with the repetition removed. It is worth understanding as the same operator
rather than a new one that happens to accept a list: its inherent meaning is OR, which is why it
belongs to the several-values-one-column case and nowhere else.

## The test that actually decides AND or OR

"One column takes OR" is the wrong summary, and the range example is what breaks it. Asking for IDs
strictly between 3 and 8 is two conditions on one column joined by **AND** — because a single value
can be above 3 and below 8 at the same time. Asking for P1 or P2 cannot use AND, because no single
value is both.

So the real test is not how many columns are involved. It is **whether one row can satisfy both
conditions simultaneously**. A range can. Two distinct values of the same column cannot. Two
conditions on two different columns can, which is why both-must-hold across columns is AND. That one
question answers every case the lecture puts up, including the awkward one — a range *plus* a
disjoint extra value, where the range is an AND and the extra value has to be an OR.

There is a hazard the lecture leaves unmarked. Mixing AND and OR in a single WHERE clause relies on
AND binding tighter than OR, and precedence was never discussed. The query that returns the right
five rows does so because the engine reads the range as a parenthesised unit. Change the intended
grouping and it silently returns a different set rather than failing, so mixed conditions are worth
parenthesising whatever the precedence rules would have done.

## BETWEEN is shorthand, not a third operator

A range written `BETWEEN 4 AND 7` includes both bounds and names the column once. Both are
conveniences over `> ... AND < ...`, and neither adds capability — underneath, it is still the AND
case, because one value can satisfy a lower and an upper bound simultaneously.

The inclusivity is the part to watch, because it is inconsistent with the comparison operators next
to it. `>` excludes its boundary and BETWEEN includes both of them, so rewriting one form as the
other changes the literals: `> 3 AND < 8` is `BETWEEN 4 AND 7`. Same rows, different numbers. Copying
the bounds across unchanged is the off-by-one this invites.

On dates, the format is `YYYY-MM-DD` — largest unit first, so no reading of it is ambiguous — and the
literal takes no spaces inside the quotes. That constraint is worth knowing as the *loud* failure: a
malformed date literal is a string the engine cannot parse into a date, so it errors before comparing
anything. Contrast the case-sensitivity failure, which parses perfectly and quietly returns a
plausible wrong answer. Of the two, the one that shouts is much the cheaper.

## Quoting, and the silence around case

Text and dates go in quotes; numbers do not. The consequence that costs an afternoon is that quoted
text is **case-sensitive** — the value is stored as text and the comparison is an exact match, so
asking for `'edwards'` when the table holds `Edwards` matches nothing. Nothing warns you. The row is
simply absent from a result that otherwise looks correct, which makes this the failure most likely to
be believed.

## Normalising both sides, and what that reveals

The remedy for case-sensitivity is to lower-case both halves of the comparison —
`LOWER(customer_last_name) IN ('diaz','edwards','wilson')` — so the casing of the stored data stops
mattering. Half a fix is no fix: lower-casing the column while leaving a capitalised value in the
list changes nothing.

The interesting part is what this does *not* do. `LOWER()` in WHERE does not lower-case the output.
The values come back exactly as stored. Only a function applied in SELECT changes what is displayed,
and that is the clearest statement of the division between the two clauses: **WHERE decides which
rows come back, SELECT decides how they look.**

WHERE computes freely — arithmetic, case conversion, whatever is needed — but everything it computes
is scratch work, discarded the moment the row has passed or failed. Nothing it produces reaches the
result. Which is the same boundary that stops WHERE from seeing a SELECT alias, seen from the other
direction. The two clauses share results in neither direction, and
[one execution order](sql-order-of-execution.md) explains both.

## The comparison operator has one spelling

`==` does not exist in SQL. Comparison is a single `=`, and the double form is a habit carried in from
a language that needed it: where `=` is already taken for assignment, equality has to be spelled
differently. SQL assigns nothing inside a query, so it has no such collision and no need for the
second spelling.

## Grain, and why repeated rows are not a mistake

A table whose rows repeat the same customer and product is not malformed — it is at order grain. Each
row is one purchase event, and the absence of an order ID column is what makes two genuine orders
look like a duplicate. Reading the grain before reading the data is the habit; the columns shown do
not always announce it.

## What this leaves unanswered

Every filter described here assumes the column has a value. NULL was raised in class and explicitly
deferred — what a not-equals comparison does to a row holding no value at all is not something the
rules above settle, and guessing from them is how the wrong answer gets learned. It is a hole worth
knowing is there.

## Related

- [SQL as the extraction step](sql-extraction-step.md) — filtering is the first thing done to the extracted set
