---
boards: [scalar-primers/sql-extraction]
updated: 2026-09-01
---

# Table relationships

The [ER diagram](er-diagram.md) has four components, and three of them are inside the boxes: table
name, column names, data types. The fourth is the lines between the boxes, and it is the only one
that needs a method rather than a reading.

The method is the whole subject. **Read the relationship in both directions.** One X has how many Y?
Then, separately, one Y has how many X? The pair of answers is the cardinality, and there is no
second technique. Every worked case — husband and wife, teacher and students, brand and products,
customer and orders, book and authors — is the same two questions asked twice.

## Three relationships, two of which you rarely draw

**One-to-one** is one row on each side mapping to exactly one row on the other: one customer, one
user ID. In key terms it is primary key to primary key. It is also close to unobservable between
tables, and for a reason worth holding: if two columns map one to one, they belong in the *same*
table. There is no reason to create a second table for information that never multiplies. So the
relationship is real and the line almost never appears.

**One-to-many** is the working case. One brand has many products; one product belongs to exactly one
brand. In key terms it is primary key to foreign key, and this is where the [key
definitions](database-keys.md) stop being bookkeeping and start doing work. Take `customer_id`. In
the customer table it appears once per customer — it is the primary key. In the purchases table the
same value repeats, because one customer buys many times, and because a table exists where it *is*
the primary key, here it is a foreign key. The duplication is not incidental to the cardinality; it
*is* the cardinality, visible in the data. You can read one-to-many off a column by noticing which
side repeats.

**Many-to-many** is the one that cannot be drawn, and the reason is mechanical. A line on the diagram
stands for a shared column, so asking whether a relationship can be drawn is asking whether one
shared column can express it. Customers and products are many-to-many: put `product_id` in the
customer table and the cell would have to hold every product that customer ever bought; put
`customer_id` in the product table and the same problem appears facing the other way. A column holds
one value per row. The list has nowhere to live, so there is no line.

## The junction table is where it actually goes

What sits between customers and products is a third table whose rows are the *events* — the
purchases. Each row names one customer, one product, one date, one quantity. Now read each side on
its own: one customer has many purchase rows and one purchase row has one customer; one product
appears in many purchase rows and one purchase row names one product. Two one-to-many relationships,
both pointing into the middle table, each needing only a single foreign key column — each one
storable.

Together they reproduce the many-to-many. It survives as a **path** through two lines rather than as
one line, and the answer to "what did customer 4 buy" is found by walking it. The instructor's three
names for the middle table — junction, conjunction, intermediate — are the same object; junction and
bridge are the terms used outside the course.

The consequence is what makes this practical: on a real diagram, what you will almost always observe
is one-to-many and many-to-one. Many-to-many is not something you spot as a line but something you
deduce from two lines meeting at a table in the middle. That table is recognisable on sight — no
primary key of its own, columns that are mostly other tables' ids — which is the same join-table
shape already noted as most of what reading a schema is for.

## The level question

Asked whether a relationship holds at table level or column level, the answer is table level, always.
The E in ER is *entity*, and an entity is a table. It is *executed* through a column — `customer_id`
here matching `customer_id` there — but the relationship being described is between the two tables.
Most cardinality confusion resolves once that distinction is made, because the column is only the
mechanism.

One caution carried from the lecture rather than corrected in it: asked how many relationship types
exist, the answer given was three, listing one-to-one, one-to-many and many-to-one, and omitting
many-to-many — which the same session had just taught at length. Read it as a slip in a fast reply,
not a revision of the lesson.

## Related

- [ER diagram](er-diagram.md) — the boxes these lines connect, and the document this completes
- [Database keys](database-keys.md) — primary and foreign key, which is what a cardinality reduces to
- [RDBMS](rdbms.md) — the shared column every line stands for
