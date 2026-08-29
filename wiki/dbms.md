---
boards: [scalar-primers/sql-intro]
updated: 2026-08-29
---

# DBMS

A Database Management System is named for the half people skip. Storing values is the easy part —
any file can do that. The interesting word is *management*, and it points at everything a file has
no notion of.

Three things have to be held alongside the values. The tables themselves, so the data is organised
into structures rather than left as a heap. The data type of every column, so the system knows this
one holds whole numbers and that one holds text before anyone writes a query against it. And the
relationships between tables — which connects to which, and through what. Together these are the
**schema**: a defined outline of what the data looks like. The DBMS is not storage. It is the layer
that knows the shape of what is stored.

## A database is a collection of tables

The working definition, and it carries through everything downstream. The clean analogy is a
spreadsheet application: the workbook is the database, and the sheets inside it are the tables. An
HR database follows the same pattern — an employees table, a salary table, a job history table. One
subject area, several tables, one database.

## You will not be handed all of it

A consequence worth separating from the definitions, because it is about working reality rather
than structure. Organisations run many databases and the sensitive ones are walled off. Nobody is
given the HR database on request; salary data sits there. The instructor's own example is that his
employer stores user chats and he has no access to them.

This reframes what "the database" means once you are in a job. You are not handed the organisation's
data. You are handed a subset that someone else scoped, and the edge of that subset is a permissions
decision, not a technical limit.

## Related

- [SQL as the extraction step](sql-extraction-step.md) — why the data ended up in a database in the first place
