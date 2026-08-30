---
boards: [scalar-primers/sql-intro]
updated: 2026-08-30
---

# RDBMS

The concept is easier to reach through a question that cannot be answered than through a definition.
Take an employee table recording whether each person works remote or in an office, and a separate
salary table recording amounts. Ask for the average salary by location type. Neither table can
answer it — the location lives in one, the money in the other. The two have to be combined, and
combining them is only possible because the employee number appears in both.

Strip that shared column out and the question does not become harder. It becomes unanswerable.
Nothing remains to say which salary belongs to which location.

A database whose tables are connected by common fields is a **Relational DBMS**. The relationship is
the common field — there is nothing more to it than that. This compounds the [DBMS](dbms.md)
definition: a management system stores the relationships between tables, and the relational case is
the one where those relationships are realised as shared columns. That shared column is what later
gets called a key.

Almost every database met in practice is relational, which makes the R close to assumed.

The same mechanism is the only one available at larger scale. Databases can be related to each other, but the connection is always realised at table level — a sales table in one database joins an employees
table in another. "Related databases" describes an arrangement; two tables and a shared column is what
actually does the work, and there is no link that is not ultimately that.

## The vendor matters less than it looks

Oracle, MySQL, SQLite, PostgreSQL. Around ninety percent of the syntax is shared across all of them;
the portion that differs is date handling, because date functions were never standardised. Everything
else transfers.

That split is not arbitrary. Dates are the piece each vendor implemented its own way before anyone
agreed on a standard, so date syntax is precisely where muscle memory breaks when you move between
products. Nothing else will surprise you.

The practical consequence is a hiring one. Asked whether you know Oracle SQL after learning MySQL,
the honest answer is yes — Oracle is a company that built a relational database, and the language is
the same. Answering no treats a question about a skill as a question about a product.

## Related

- [DBMS](dbms.md) — the management layer this specialises; relationships realised as shared columns
- [SQL as the extraction step](sql-extraction-step.md) — the language every one of these vendors speaks
- [Database keys](database-keys.md) — the vocabulary for what that shared column is doing
