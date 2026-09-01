# Walkthrough — 2024-04-12_extracting_data_using_sql.md
Board: scalar-primers/sql-extraction
Source: Armor/Output/2024-04-12_extracting_data_using_sql.md
Updated: 2026-09-01
Mode: primer express walk (compressed Learning stage, one sitting)
Brief delivered: 2026-09-01
Learning complete: 2026-09-01 — brief delivered, doubts cleared, board batch applied
Class Assignment complete: 2026-09-01 — CEIL/FLOOR homework done in the BigQuery console, Scaler
platform assignments done; strip and Armor's INDEX advanced to Internal QnA

Board created fresh for this walkthrough — no prior coverage.
Source is video-only: no class-notes PDF, so no second authority on identifier spelling.
Wiki articles from `scalar-primers/sql-intro` and `scalar-primers/sql-filtering` were read for
continuity; none listed this board before this session.

Sequencing: this class precedes *Filtering Data in SQL* in the curriculum despite the later calendar
date, and it is where `ORDER BY`, `LIMIT` and `OFFSET` are actually taught — the gap the filtering
deliverable flagged. That gap is now closed backwards.

## Doubts raised

- **Why many-to-many is never drawn / what a junction table is.** Answered with the mechanism the
  lecture leaves out: a line stands for a shared column, a column holds one value per row, so the
  list has nowhere to live. The junction table turns it into two one-to-many lines meeting in the
  middle, worked on `customer_purchases`. Labelled as beyond-file reasoning.
- **The backtick.** Key location, the backtick/tilde split on the same key, and — beyond the file —
  the identifier-versus-string-literal distinction that explains why the error message reads
  "unexpected string literal" rather than "wrong quote type".
- **`OFFSET` and ties.** Positional against conditional; `ORDER BY` runs first, so the sort decides
  what position one is; where rows tie the sort has under-specified the question and the result is
  unstable unless the tied rows are identical in the displayed columns. The tiebreaker rule (keep
  adding sort columns until a tie is impossible) is flagged as mine, not the lecture's — the lecture
  demonstrates it with `transaction_time` without stating it.

## Board

Four widgets, one batch: cardinality table (method row plus the three relationships, junction table
and the table-level answer), the DQL mindmap (access model plus every clause with its rules in
detail, `OFFSET` ties in amber), the syntax-gotchas note, and the quizzes/mis-namings note carrying
the unsupported claims and the two open questions.

Not boarded by decision: the database-vs-warehouse section, which the lecture itself marks as
background — captured in the wiki only.

## Wiki

New: `table-relationships.md`, `sql-sublanguages.md`, `select-and-from.md`, `sorting-and-paging.md`,
`computed-columns.md`, `database-vs-data-warehouse.md`.
Updated: `er-diagram.md` and `database-keys.md` (board added, cardinality link), and
`sql-order-of-execution.md` (board added — this class is where the clauses it orders were taught).

## Open, carried forward

- The expected first-row values for the most-recent-transactions query are garbled in the recording
  and were not reconstructed. Check against your own output.
- What `OFFSET` does when it exceeds the row count was asked in class and never answered. Worth
  putting to the instructor.
- Identifier spellings (`product`/`products`, `customer`/`customers`, `cost_to_customer_per_qty`) are
  transcript-derived. Verify in the BigQuery panel.
