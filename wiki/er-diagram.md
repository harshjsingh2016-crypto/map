---
boards: [scalar-primers/sql-intro]
updated: 2026-08-30
---

# ER diagram

An organisation runs many databases holding many tables, and the first question anyone asks of them
is not a query. It is: which column lives in which table. The Entity Relations diagram exists to
answer that and nothing else. The analogy offered is a mall — you find one store using the map and
the signboards rather than walking into every shop in turn.

The payoff is concrete. Asked for the total quantity sold, the diagram sends you straight to the
purchases table. Without it you open every table hunting for a `quantity` column, and the hunting is
the part that scales badly.

## You are handed it

The diagram is produced by the data engineering or data architecture team. You read it; you do not
draw it. This is the same shape as the access boundary in [DBMS](dbms.md) — the structure of the
data is scoped by someone else and arrives as a given. Creating tables is a separate skill taught
later and, in most analyst roles, never used.

## One box, five parts

Entity means table. A single box on the diagram decomposes the same way every time: the title bar is
the table name, the rows are the column names, the right-hand side is the data type of each column,
and the lines running between boxes are the relations.

The first three together are the **schema** — the outline of one table. That is not a coincidence of
notation. Tables, data types, relationships is exactly the triple a management system holds, so the
ER diagram is the [DBMS](dbms.md) definition rendered as a picture. Reading a diagram and describing
a DBMS turn out to be the same exercise.

## Reading structure off the shape

The relations tell you more than which tables connect. A table carrying no primary key of its own,
whose columns are mostly other tables' ids, is a join table — it exists to record that a customer
bought a product from a vendor on a date, and its identity is the combination rather than a key.
Spotting those on sight is most of what reading a schema is for, and it is the same shared-column
mechanic [RDBMS](rdbms.md) is built on.

## The name to recognise twice

The course calls it an Entity **Relations** diagram. The standard industry term is Entity
**Relationship** Diagram. The instructor, the class notes and the course's own revision notes agree
on "Relations", so it is a deliberate house term rather than a slip — but it is not what you will
meet outside. Recognise both.

One discrepancy is worth recording for how it resolved. The lecture names nine tables while saying ten,
in three separate places, and the tenth appears in neither the recording nor the notes. It turned up in
the platform setup list as a demonstration table unrelated to the model being taught — which is exactly
why it was never on the diagram. The diagram was right and the count was loose, rather than the reverse.

## Related

- [DBMS](dbms.md) — the tables/types/relationships triple this diagram draws
- [RDBMS](rdbms.md) — the shared columns the relation lines stand for
- [SQL as the extraction step](sql-extraction-step.md) — reading the map is what precedes writing the query
- [SQL data types](sql-data-types.md) — the right-hand side of every box, and how to choose it
- [Database keys](database-keys.md) — what the PK and FK markers on a box mean
