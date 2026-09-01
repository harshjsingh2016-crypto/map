---
boards: [scalar-primers/sql-extraction]
updated: 2026-09-01
---

# The five sublanguages of SQL

The taxonomy is usually taught as a list to memorise. It is better taught as the answer to one
question: **will you be given access to edit the production tables?** No — and once that is settled,
the five sublanguages are just the division of a permission set, with your share at the bottom.

**DDL**, Data Definition Language, changes the *structure* of a table: add a column, rename one,
alter a data type, drop the table. **DML**, Data Manipulation Language, changes the *data* inside it:
`UPDATE`, `INSERT`, `DELETE`. That structure-against-data line is the distinction the lecture keeps
returning to, and it is the one that gets tested. **DCL**, Data Control Language, is `GRANT` and
`REVOKE` — the database administrator's language, and the one that decides who holds the others.
**TCL**, Transaction Control Language, is `COMMIT` and `ROLLBACK`. **DQL**, Data Query Language, is
`SELECT`, and it is the whole of this course bar a small remainder.

## The access argument is the content

Each exclusion has a reason, and the reasons are more useful than the acronyms.

You are not given DDL because a `DROP TABLE` is a one-command exit from a notice period. You are not
given DML because if everyone can update the sales records, nobody can trust the sales records — the
value of a shared number comes from the narrowness of who can change it. TCL exists because a
structural change should not go live the moment it is typed: the developer must commit it, and
somebody has to approve that commit, so important tables are not dropped by accident. `ROLLBACK` is
the undo that makes the gate survivable.

Read together, these are not database facts so much as an ordinary operational control model
expressed in a query language. Separation of who can change structure, who can change data, who
grants the rights, and who approves the commit — the sublanguages are that separation, named.

## What view-only actually forbids

DQL lets you see and extract. It does not let you drop, delete, add or alter a single value. Asked
whether you can at least *copy*, the answer is no: copying is effectively creating a new table, and
creating is not yours. What you may do is **download the result** and do whatever you like with the
download — the table and the database are untouched. The analogy is view access to a spreadsheet.

This fact is worth isolating because it arrives three more times in the lecture wearing different
clothes. Columns you do not name in a `SELECT` are not deleted, only not displayed. A column renamed
with an alias is renamed in the output only. A computed column is displayed and never stored. Those
are not three rules; they are one rule, met from three directions, and recognising that is what stops
them being memorised separately.

## Related

- [SQL as the extraction step](sql-extraction-step.md) — why DQL is the share that matters to an analyst
- [SELECT and FROM](select-and-from.md) — the two clauses DQL starts with
- [Computed columns](computed-columns.md) — where view-only is met for the third time
- [DBMS](dbms.md) — the access boundary these sublanguages divide
