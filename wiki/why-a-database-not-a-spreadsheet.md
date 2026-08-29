---
boards: [scalar-primers/sql-intro]
updated: 2026-08-29
---

# Why a database and not a spreadsheet

Five reasons are given, and the useful move is to notice that they do not all argue the same kind of
thing.

**Scale.** Anything a spreadsheet does, SQL does — but not across billions of rows. A narrower limit
sits underneath the obvious one: a lookup formula returns a single match. Where a value occurs three
times, it hands back the first and drops the rest without complaint. That is a correctness failure
rather than a capacity one, and it surfaces as a wrong answer instead of an error.

**Concurrent users.** This was demonstrated rather than asserted. A sheet was shared with the class,
everyone was told to enter their name and email, and a small prize was promised to whoever ended up
in the top row. Within moments people were deleting each other's entries and inserting rows to jump
the queue. What the demonstration actually establishes is subtler than "it breaks": with several
writers and no notion of ownership, the file's contents become a record of who edited last rather
than of what is true.

**Security.** A spreadsheet has essentially none. The question that makes it concrete is whether you
would trust a company that kept your account password in one.

**Data integrity.** Close to the concurrency argument but distinct. Where everyone can edit, the
table is not a source of truth — someone short of a sales target could add a row and claim the
commission, and nothing in the file would object. A database narrows write access to very few
people. The point is not that databases are harder to tamper with; it is that they distinguish
reading from writing at all.

**Performance.** Databases are fast; spreadsheets are not.

## The shape of the list

Only the first and last reasons are about what the tool can do. Concurrency, security and integrity
are all versions of a single problem — many people touching the same data — and that is where the
real argument lives. A spreadsheet is not primarily too small. It is unowned.

## Read broadly, write nowhere

The natural follow-up is what remains possible without edit rights, and the answer defines the
analyst's job. You can view data and extract it to your own machine; you cannot change values in
place. Writing belongs to developers. Combined with the access boundary described in
[DBMS](dbms.md), the working picture is a wide but strictly read-only window onto a subset someone
else scoped.

## Related

- [DBMS](dbms.md) — the access boundary this sits inside, and the schema a spreadsheet has no notion of
- [SQL as the extraction step](sql-extraction-step.md) — extraction is what read-only access still permits
