---
boards: [scalar-primers/sql-extraction]
updated: 2026-09-01
---

# SELECT and FROM

Open a spreadsheet file and the data is simply there — you double-click and look. You cannot
double-click a table. SQL is a *structured query language*, and a query is not a glance: it is a set
of instructions handed over before anything is shown. `SELECT` and `FROM` are the smallest complete
pair of instructions there is, and every later clause is an addition to them.

`SELECT` names the columns you want. `FROM` names the table. `*` means every column. That is the
first query anyone writes, and it doubles as the check that the environment is set up correctly —
against the teaching dataset it returns 23 product rows, and a wrong count means the upload, not the
query, is the problem.

## Naming columns is not narrowing the table

When a table is wide and only two columns matter, you name them instead of using the star, and the
result has two columns and the same number of rows. The question the class is then asked is the one
worth carrying: what happened to the columns you did not name — were they deleted, or were they not
displayed?

Not displayed. Nothing changed in the back end. This is
[DQL being view-only](sql-sublanguages.md) arriving from a second direction, and it is the first
appearance of a pattern that runs through the whole lecture: **a query describes an output, never a
change to the source.** Once that is settled, several separate-looking rules stop needing separate
memory.

`SELECT *,` deserves its own note, because the comma is doing all the work. The star means every
column and the comma adds one more expression to them. Where that new column lands is decided by
writing order — after the star it appears at the end, before the star it appears first. Anywhere in
the middle, and there is no shortcut: you write out every column name in the order you want them.

## The mechanics that cost the most class time

Two of these are not SQL so much as typing, and they account for most of the errors in a first
hands-on session.

The table name is wrapped in **backticks** — the key to the left of the `1` — and not in single
quotes. The distinction is not stylistic. A backtick wraps an *identifier*, the name of a thing in
the database; a single quote wraps a *string literal*, a piece of text data. So the mistyped version
is not a near miss the parser can recover from — it is a well-formed instruction to select from a
piece of text, and the error returned says exactly that: an unexpected string literal where a table
name belongs. Read that way, the message diagnoses itself. (The lecture calls this character a tilde
throughout. The tilde is the shifted character on the same key; the instruction is right and the name
is wrong.)

The **semicolon** is a full stop. Running one statement, it is optional and nothing breaks. Running
several together — which you do the moment you want to compare two tables — it is required, because
it is the only thing telling SQL where one statement ends. The failure is a parser error pointing at
the line where the second `SELECT` began. Since the rule has one exception and it is the one you will
hit, the practical version is: always write it.

Beyond that, SQL is forgiving in ways other languages are not. Case does not matter, in keywords or
in clause names. Indentation does not matter at all — a query split across four lines is the same
query. Both `--` and `#` open a comment. And to run one statement out of a document full of them, you
select that text and run the selection, which is also the fix for the missing-semicolon error.

## Related

- [The five sublanguages of SQL](sql-sublanguages.md) — why a read-only clause pair is the whole job
- [Sorting and paging](sorting-and-paging.md) — the clauses that attach to this pair next
- [Computed columns](computed-columns.md) — what the comma after the star is for
- [The WHERE clause](where-clause.md) — the next lecture's addition, and the first one that removes rows
