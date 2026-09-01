---
boards: [scalar-primers/sql-extraction]
updated: 2026-09-01
---

# Computed columns

A purchases table holds a per-unit price and a quantity, and the number anyone actually wants is
revenue. In a spreadsheet you write the multiplication once and fill it down the column. SQL does the
same thing and calls it an inline calculation — **arithmetic between columns, computed independently
for every row**. All four operators work, and the fill-down intuition transfers exactly.

```sql
SELECT *,
       ROUND(cost_to_customer_per_qty * quantity, 2) AS revenue
FROM `farmers_market.customer_purchases`;
```

That one query carries three separate ideas, which is why it is the query the lecture ends on.

## The output has no name until you give it one

Compute something without naming it and BigQuery labels the column `f0_`. It is not an error and the
values are right, but the header is unusable in anything anyone reads. That unusable header is the
motivation for `AS`, and it is the honest way round to teach an alias: not as a nicety, but as the
repair for output you cannot hand to anyone.

The point the class mostly got wrong is that **`AS` works on any column, not only computed ones**.
Aliasing an existing column gives it a different header while the column in the database keeps its
name. Roughly a third of the batch answered otherwise, by the instructor's own read-out, which is why
the lecture states it three times.

## Nothing here is stored

The revenue column is displayed, not saved. It does not enter the database, and running the query
again recomputes it. This is [DQL being view-only](sql-sublanguages.md) for the third time in one
lecture — after the columns that were not displayed rather than deleted, and the alias that changes a
header and nothing else. Three rules with one cause: a query describes an output, never a change to
the source.

The placement rule follows from writing order rather than from anything semantic. `SELECT *,` puts
the computed column at the end because the star came first; reverse them and it comes first. To put
it in the middle, next to the column it is derived from, there is no shortcut — you write out every
column name in the order you want them.

## ROUND, and why it is called a function

Rounding is introduced through the case where it decides an outcome: a score of 39.5 against a pass
mark of 40. `ROUND(value, decimals)` takes an optional second argument — `1` for one decimal place,
`2` for two, omitted for none. So `ROUND(39.93, 1)` is `39.9`, `ROUND(39.96, 1)` is `40.0`, and
`ROUND(39.5)` is `40`.

The taxonomy attached is the instructor's own and is worth keeping for the distinction rather than
the labels: a **clause** is structural — `SELECT`, `FROM`, `ORDER BY`, `LIMIT`, `OFFSET` — while a
**function** acts on a value. `ROUND` acts on a value, as do `UPPER`, `LOWER` and `SUM`. The same
scheme files `AS` and `DESC` under "attribute", which is not a standard category and does not survive
contact with documentation; the behaviour taught is correct throughout, and only the naming is
invented. `CEIL` and `FLOOR` are named as the nearest integer up and down, and left as homework
rather than taught.

One claim here is not supported and should not be carried: that `ROUND(100)` will always return a
decimal. Return type follows input type, and it was asserted without demonstration.

## Related

- [SELECT and FROM](select-and-from.md) — the comma after the star, and where this query starts
- [The five sublanguages of SQL](sql-sublanguages.md) — the view-only boundary this is the third proof of
- [SQL string functions](sql-string-functions.md) — the function family the next lecture opens up
