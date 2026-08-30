---
boards: [scalar-primers/sql-intro]
updated: 2026-08-30
---

# SQL data types

The rule that makes the rest of this matter: **a column holds exactly one data type.** A spreadsheet
column happily mixes `47`, `forty-seven` and a date. A database column cannot. The corollary is the
one that bites in practice — if numbers and text appear together in a column, the numbers are text.
They are stored as strings and they will not add up.

Choosing a type is therefore a decision made once, at design time, by someone reading an
[ER diagram](er-diagram.md) — and it constrains every query written afterwards.

## The numeric types, and one thing to unlearn

`BOOLEAN` is `TRUE` / `FALSE`, explicitly not `1` / `0`; one and zero are integers. `INTEGER` is
whole numbers including the negatives, which is the reason the notes draw it on a number line rather
than as a counting sequence. Decimal types hold values with a fractional part, and the test case
worth keeping is that `12` is an integer while `12.0` is a decimal — a trailing zero does not make a
number whole.

**`DECIMAL(p, s)` means p total digits, of which s sit after the point.** The lecture reads it as p
digits *before* the point plus s after, making `DECIMAL(4,3)` into `9999.999`; it is `9.999`. The
class notes reproduce the same reading and break off without resolving it, so nothing in the course
material corrects it. This propagates: a `DECIMAL(16,2)` column on the schema holds sixteen digits
in total, not eighteen.

## Exact and approximate are different jobs

The lecture treats float and decimal as one thing. They are not, and the difference decides which to
reach for.

`DECIMAL` is **exact** — stored in base 10 as the digits written, so `0.1 + 0.2` is exactly `0.3`.
`FLOAT` is **approximate** — binary floating point, a fixed number of significant bits and an
exponent. Most decimal fractions have no exact binary form, so `0.1 + 0.2` returns
`0.30000000000000004` and an equality test against `0.3` matches nothing. The error is negligible per
value and accumulates across rows.

That gives the choice its shape. Anything a person will audit — money, prices, billed quantity, tax,
anything summed and then reconciled against another system — takes `DECIMAL`, because the failure it
prevents is a total that is off by a rounding artefact with no way to trace where. Anything measured
— temperature, sensor readings, coordinates, ratios, model output — takes `FLOAT`, where magnitude is
the point and the fourth decimal is noise. **Counted or paid takes decimal; measured takes float.**

It also explains the precision argument. `DECIMAL` has to be told how many digits to keep because it
promises to keep them. `FLOAT` takes no such argument because it promises no specific digit.

## Fixed versus variable text

`CHAR(n)` is **exactly** n characters. `VARCHAR(n)` is **up to** n. The distinction is usually taught
through what exceeds the limit, but the instructive failure is the short value: `An` fails `CHAR(3)`
for the same reason `Anup` does. Fixed is not a maximum.

Choosing between them is a question of what you want guaranteed. Names take `VARCHAR` because length
is unknowable. Country codes take `CHAR(3)` because three is the format. Phone numbers take
`CHAR(10)` and postal codes `CHAR(6)` — and the reason both are text rather than numbers is the
sharpest test in the section: **can you meaningfully add or average this?** An averaged postal code
is a number that means nothing. Being made of digits is not what makes something a number.

Gender stored as `M` or `F` takes `CHAR(1)` for the same reason a country code takes `CHAR(3)` — the
format is fixed at one character, and `VARCHAR(1)` would permit an empty string where the point is to
permit exactly one.

## Dates, and the format that defines one

A date is stored `yyyy-mm-dd` in every vendor. The rule is flagged as an interview question, but the
corollary is the useful half: a value like `2024-29-10` is not a date, it is a string. Only the
default format is actually held as a date type — the same shape as the mixed-column point, where
something that reads correctly to a person is text to the database.

`DATE` carries no time and `TIME` carries no date; where both appear the pairing is deliberate, as on
a schema that puts the day in one column and the clock time in another.

`DATETIME` and `TIMESTAMP` differ in exactly one thing: the timezone. `DATETIME` carries none;
`TIMESTAMP` is always stored in UTC. The reason is operational rather than technical — an
organisation spanning timezones cannot store transactions in local time and still analyse them
together, so everything lands in one standard zone. In India, GMT+5:30, that means the stored value
sits five and a half hours behind the wall clock, and anyone reading raw timestamps has to convert
back.

## Related

- [ER diagram](er-diagram.md) — where the type of every column is read off, one box at a time
- [DBMS](dbms.md) — the data type of each column is one of the three things a management system holds
- [Why a database and not a spreadsheet](why-a-database-not-a-spreadsheet.md) — one column one type is the constraint a sheet does not impose
