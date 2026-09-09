---
boards: [damensch/logistics-agent]
updated: 2026-09-01
---

# Logistics agent — the data position

What exists today, read against the goal. Six sources, and the split between them is the
useful fact: three are daily exports that describe the same orders from different angles,
one is a live application, and two are spreadsheets a person keeps by hand.

**Bettercommerce** arrives at order-line grain with sixteen columns, and it carries the
EDD promised to the customer. That single column settles a question the predecessor
project got wrong: it computed its own EDD from an SLA table and ignored the one already
in the export. The promised EDD is what partners are measured against, so the derived one
is at best a cross-check.

**Increff** arrives at order-item grain with eighty-three columns and is the only source
with a complete warehouse clock — channel order, SLA time, release, invoice, manifest
creation and closing, handover, shipment closing, delivery — plus its own breach flag on
the fulfilment SLA, which is a different SLA from delivery and worth keeping separate.

**Clickpost** arrives at shipment grain with a hundred and twenty-six columns and is the
richest and the least trustworthy. Attempts, failure reasons on both delivery and pickup,
hub scans, RTO dates and courier EDD are all real. But shipping cost is zero on every row,
weight and dimensions are placeholders, the three zone columns are empty, and forward and
reverse arrive in the same file. The lesson is that column count is not coverage.

**Logisupport** is the CS ticket tool — an Apps Script front end on Firestore, with
collections for tickets, timeline, handoffs, third-party escalations and users. It already
implements the harder half of the escalations goal: nine issue types, an ownership ledger
that accrues ageing separately per hand (CS, logistics, warehouse), a priority rule where
Critical is set by a human and High-ageing is applied automatically past a threshold, and
3PL forwarding recorded with channel and external ticket id. It is not a gap to fill but a
system to absorb — the real work is binding its free-text order id and AWB fields to actual
shipments.

The remaining two sources are spreadsheets: the zone map, partner-pincode assignment, rate
cards with zone and overhead detail, serviceability, and the invoice breakup at AWB level;
and separately a package-type master giving standardised weight and dimensions, which every
order maps onto. That package master matters more than its size suggests — it is the only
honest weight available anywhere, and a charged-weight dispute has to be argued from
something.

Read against the goal, the shape of the gap is clean. Delivery SLAs, RTO, first-attempt
conversion and order movement are already answerable — order movement in particular needs
no new data at all, only a daily presence check across the shared join keys that nobody has
been running. NDR is half-answerable: the courier's side of a failed attempt is recorded,
the customer's side is not. Everything cost-shaped is unanswerable, and it fails at the
first step rather than the last, because no invoice data enters the system at all. The
partner scorecard inherits that failure: performance is ready, cost is empty, so the
ranking cannot be built.

## Related

- [Logistics agent — the goal](logistics-agent-goal.md) — the eight regions this data was read against
- [Problem discovery frame](problem-discovery-frame.md) — data is one half of the starting point; process is the other
