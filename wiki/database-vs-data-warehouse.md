---
boards: [scalar-primers/sql-extraction]
updated: 2026-09-01
---

# Database vs data warehouse

Taught as background rather than as working knowledge, and the analogy carries most of it: the
[database](dbms.md) is the store, the warehouse is the godown. Both hold the same goods. What
separates them is what each is for.

Two forces push data out of one and into the other.

**Age.** The warehouse holds long history, on the order of fifteen years and more. The database holds
what is used daily, put at roughly the last two to five years. The justification is practical rather
than technical — analysis rarely reaches back fifteen years, so history that nobody queries should
not be sitting in the system everybody queries.

**Grain.** A bank's database *could* hold every individual transaction; the capability is not the
constraint. But you would keep the database aggregated to customer or order level and send the
transaction-grain table to the warehouse. Grain is the more interesting of the two, because it is a
choice about resolution rather than about volume: the same period of activity can be stored once per
customer or once per transaction, and which one you keep close decides what the everyday system is
good at.

They are separate systems — separate servers, separate locations — and **all the data in the
warehouse comes from the database**. The flow runs one way. Asked whether the difference is only
storage, the answer was that other factors exist, but for day-to-day work you use the database and go
to the warehouse only when you need to go deeper than it reaches. Asked whether warehouses need
different professionals, the answer was no: the choice is about whether you need current data or deep
history, not about who is asking.

Two claims from this section are recorded as unsupported. That Snowflake holds almost a monopoly in
warehouses was offered as an aside, alongside a suggestion to consider it as an investment, and is
not a market fact established anywhere in the material. And that BigQuery is "neither a database nor
a warehouse, just a platform" was given in answer to a direct question; it is generally described as
a data warehouse, and the course's own revision notes do not repeat the claim. Neither affects
anything the course asks you to do — BigQuery is where the queries run either way.

## Related

- [DBMS](dbms.md) — the system the store half of the analogy names
- [Why a database and not a spreadsheet](why-a-database-not-a-spreadsheet.md) — the earlier question about where data belongs
- [SQL as the extraction step](sql-extraction-step.md) — the day-to-day work that stays on the database side
