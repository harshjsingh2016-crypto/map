---
boards: [scalar-primers/sql-intro, scalar-primers/sql-extraction]
updated: 2026-09-01
---

# Database keys

Keys get introduced through [RDBMS](rdbms.md) — tables are connected through a common field, and
that field is a key — and the framing is worth resisting immediately, because it makes every key look
relational. Only one of them is.

**A primary key's job is not to relate to other tables. It is to be the primary identifier of records
in its own table.** It answers "which row is this one", and it would still be needed if the database
held exactly one table and no join ever happened. The foreign key is the relational one, defined
entirely by pointing outward at another table. The primary key points inward.

With that separated, four keys get taught, and they are distinguished by two questions — can the
value repeat, and can it be missing.

## The test is about "ever", not "today"

A **primary key** is unique and not null, where null means missing. The definition is easy and the
application is not, because the obvious method — look at the column, check whether the values repeat
— gives the wrong answer.

The case that shows it is a sales column reading 100, 200, 300, 400, 500. Every value is distinct.
It passes inspection and it is not a primary key, because two customers can perfectly well spend the
same amount. Nothing prevents a repeat; the data simply has not produced one yet.

So the question is not whether these values are unique. It is **whether this value can ever repeat,
and whether it can ever be missing.** That reframes the whole exercise: a primary key is a claim
about what the column *means*, not an observation about the rows currently in it. You cannot settle
it by reading data.

Two rules follow. A table has exactly one primary key. And you do not pick it — whoever builds the
database sets that property, and your job is to recognise it and know what it implies. That is the
same handed-to-you relationship as the [ER diagram](er-diagram.md).

## Unique keys are primary keys minus not-null

A **unique key** never repeats but may be absent. A PAN card column is the example: PAN numbers are
distinct by construction, but a customer buying from an e-commerce site may not have one, so the
column admits nulls and fails the not-null half.

Aadhaar gets discussed as the government's attempt at "a primary key of India" — one identifier per
person. It does not qualify for the same reason: holding one is not compulsory, so nulls exist. The
example is worth keeping because it shows the failure is political rather than technical. Uniqueness
was achieved; universality was not.

A table may carry unique keys on as many columns as it likes. It may carry only one primary key.

## A foreign key's status belongs to the other table

A **foreign key** is a column that is a primary key in another table. That is the entire condition,
and the point people over-think is what it does *not* require: the column may contain duplicates, it
may contain nulls, and neither changes anything. In an orders table the customer id repeats on every
row a customer appears — it is still a foreign key, because the customer table's primary key is what
confers the status.

What they are for is joins. Putting customer names beside sales figures means joining the two tables
on that shared column, and enabling that is the whole payoff of the primary-key/foreign-key
relationship. Every other property is bookkeeping in service of it.

The duplication that a foreign key is permitted turns out to carry information rather than merely
being tolerated. A customer id that appears once in one table and repeats in another is describing a
[one-to-many relationship](table-relationships.md) between them, and the repeating side is the many
side. The cardinality is legible in the column itself.

## Candidate key — a name that means two things

Where no single column is unique but a combination is, the combination is the key. The worked case is
an order id that resets daily: neither the id nor the date identifies a row, but together they do.

The lecture calls that a **candidate key**. Conventionally it is a **composite key**, and *candidate
key* means any minimal set of columns that could serve as the primary key — a single column included.
The course's notes and recording agree with each other, so this is a taught definition rather than a
slip, and the practical consequence is that the right answer depends on who is asking: the assessment
wants the lecture's version, an interview wants the standard one.

The instructor's own caveat survives the naming dispute and is the part worth carrying: a
multi-column key is a poor way to store data, because every table you join to must then carry both
columns, which grows the dataset and the complexity of every query against it. One primary key column
is the thing to want.

That caveat has teeth on the farmer's-market schema, where three tables — purchases, inventory and
booth assignments — have no single-column primary key at all. Their identity is precisely the
multi-column arrangement being advised against, which is what a join table is.

## The two ways this gets misapplied

The class was quizzed on exactly two questions and got both wrong at scale, which is more useful than
it sounds, because the failures are mirror images of each other.

Asked whether an Aadhaar card can be a primary key, most of the batch said yes. It cannot — not
everyone holds one, the column admits nulls, and it fails not-null. What happened is that *unique*
fired and the answer arrived before the second clause was ever checked. **A clause was dropped.**

Asked whether a foreign key can hold nulls, most said no. It can. What happened is that "keys must be
unique and not null" got imported from the primary key and attached to a foreign key, which makes no
claim about its own contents whatsoever. **A clause was added that was never there.**

Both errors come from treating *key* as one concept whose properties carry across. They do not. A
primary key makes two claims about its column, a unique key makes one, and a foreign key makes none —
its status is a fact about a different table. Reading each definition as self-contained is what
prevents both mistakes.

## Not carried

The claim that "nulls are not unique" is made in passing and left undeveloped. Real engines differ on
whether a unique constraint permits more than one null, and the lecture does not establish it, so it
is not recorded here as a rule.

## Related

- [RDBMS](rdbms.md) — the shared column these name; the relationship is the field
- [ER diagram](er-diagram.md) — where keys are marked, and where join tables become visible
- [SQL data types](sql-data-types.md) — the other property set on a column at design time
- [Table relationships](table-relationships.md) — the cardinality a PK/FK pair reduces to
