---
boards: [scalar-primers/sql-filtering]
updated: 2026-08-31
---

# SQL string functions

The functions that operate on text are taught by analogy: name the thing you already do in a
spreadsheet, then learn the syntax SQL uses to do it. The functions themselves hold no surprises.
The syntax does, and in one place in particular.

## Concatenation has no operator

`CONCAT(a, b, c, ...)` glues values into one string. What catches people is that SQL offers no `+`
for text — nothing like Excel's `&`, nothing like Python's `+`. Every piece that is to appear in the
result is passed as its own argument to the function.

The consequence lands on separators. A space between a first name and a last name is not something
concatenation does on your behalf, and it is not a setting on the function. It is a piece of text,
so it goes in as an argument like any other, sitting between the two columns:

```sql
CONCAT(customer_first_name, ' ', customer_last_name) AS full_name
```

Three arguments, not two. The same holds for a hyphen, a comma, or anything else meant to sit
between values. The function takes as many arguments as it is given — the cap people assume at two
does not exist, and adding a separator already puts a query past it.

## Reading `SELECT *,`

The comma after the star is doing real work: `SELECT *,` means every original column of the table
*plus* the one being computed. It is an addition to the output of a single query, not a change to
the table — nothing is stored, replaced or modified.

## Case conversion, and the rule underneath it

`UPPER` and `LOWER` hold nothing back — they return their argument in capitals or in lower case. What
the exercise around them is actually for is the nesting rule: **a function's argument does not have
to be a column.** It can be a literal, a column, or another function's result — anything that
evaluates to a value.

```sql
CONCAT(UPPER(customer_first_name), ' ', LOWER(customer_last_name)) AS new_name
```

Read inside-out, which is the order it runs: each inner function resolves against the row and
produces a value, and only then does `CONCAT` receive its three arguments. Concatenation never sees
the column names at all. By the time it runs, they have already become strings.

This is worth making automatic early, because building proper case by hand stacks the same rule
three levels deep, and that query is unreadable without it.

## Taking part of a string

`SUBSTR(value, start, length)` returns a piece of a string: what to cut from, where to begin, and how
much to take. Two properties of it are worth more than the syntax.

**Positions begin at 1.** SQL has no zero index, and the point was made emphatically and then
repeated — it is the habit to unlearn coming from a language where the first character is at 0.

**The third argument is a length, not a stop position.** The lecture calls it a "stop" throughout,
which is wrong in a way that hides itself: a length and a stop position give the same answer whenever
the start is 1, and the early examples all start at 1. The distinction surfaces the moment it does
not — six characters taken from position 2 run to position 7, not 6.

Leaving the third argument off runs to the end of the string, and this is the practical half of the
function. A hard-coded length is a query that works on the name it was written against and breaks on
the next one; omitting it makes the length of the input irrelevant. The same logic gives the pattern
for the other end of a string: to take the last *n* characters, start at `-n` and give no length.

A negative start counts back from the end, but it does not reverse anything — reading still runs left
to right from wherever it began. Starting three from the end of *Shankar* yields `kar`, never `rak`.

## Building proper case by hand

Turning `shankar` into `Shankar` without a built-in is the exercise these functions exist to set up:

```sql
CONCAT(UPPER(SUBSTR('shankar', 1, 1)), LOWER(SUBSTR('shankar', 2)))
```

One character from position 1, upper-cased; everything from position 2 onward — no length, so the
name's length is irrelevant — lower-cased. Note the absence of a separator argument. The two pieces
are halves of one word, and nothing about concatenation supplies a space on its own; the earlier
`full_name` query had one only because a first and last name are genuinely two words.

## Where the vendors part

BigQuery has `INITCAP`, which does proper case in a single call. MySQL does not have it at all. That
one fact is why the manual construction is worth building rather than skipping: it is not a
pedagogical warm-up discarded once the shortcut appears, it is the version that runs everywhere.

This is the first place the 90/10 rule bites in practice — most syntax carries across vendors, and
the slice that does not fails outright rather than degrading quietly. A query is portable until it
names a function one vendor invented.

The habit that follows is not to memorise the function list. It is vendor-specific, so it is not
something to hold in the head; what is held is the intent. The documentation says whether this
vendor has a name for it, and the manual build covers the case where it does not.

## The semicolon

A semicolon marks the end of a statement. It is therefore only required when more than one statement
is being run at once, so the engine knows where the first query stops. Running a single query, it is
optional — which is why omitting it produces no error rather than the failure a newcomer expects.

## Related

- [SQL as the extraction step](sql-extraction-step.md) — why the language is learned before the analysis it feeds
- [The WHERE clause](where-clause.md) — the other half of the same lecture, and where case-sensitivity turns costly
- [RDBMS](rdbms.md) — where the 90/10 rule across vendors was first drawn
