---
boards: [scalar-primers/sql-intro]
updated: 2026-08-29
---

# SQL as the extraction step

Every interaction with a connected device generates data, and it generates far more of it than
people expect. A minute spent on a social platform records not only the posts a user liked, but the
posts they saw and scrolled past, the ads that appeared and were ignored, and the location the
session started from. Absence is recorded as carefully as action, because "saw this and moved on"
carries as much signal as "liked it".

That volume settles the storage question before it is really asked. A spreadsheet holds on the
order of a million rows; a large consumer platform has users in the billions. The gap is not one of
degree — a sheet is not merely a bit too small, it is short by orders of magnitude before a single
interaction per user has been written down. So the data goes into a database, and a database
understands exactly one language.

## Why this comes before the analysis

The consequence is the part worth carrying. Whatever the role downstream — analyst, data scientist,
machine learning — the first step is identical: go to the database, write SQL, pull the data out.
Only then does the analysis begin, in Python or anywhere else. An analysis cannot start without a
dataset, and a dataset cannot be had without SQL.

This makes SQL a precondition rather than the interesting part of the work, which is precisely why
it is non-negotiable. It gates everything downstream. It is also why every data role posting lists
it, and why a data programme opens here rather than with a modelling language.

The boundary of the territory is drawn once: SQL is for tabular data. Unstructured data — images,
video — belongs to NoSQL databases instead. The distinction is named to mark the edge, not explored.

## Related

- [Predictive vs Generative AI](predictive-vs-generative-ai.md) — the modelling work that only starts once the data is out
