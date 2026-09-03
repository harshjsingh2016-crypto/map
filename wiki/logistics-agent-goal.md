---
boards: [damensch/logistics-agent]
updated: 2026-09-01
---

# Logistics agent — the goal

The end state for the logistics rebuild, stated as five things the system must control
rather than as a list of features. The predecessor was a consolidation pipeline: daily
exports from three systems ingested into SQLite, joined, and turned into an EDD and a
breach flag. That answered *where is this order and is it late*. The goal here is wider —
the system is expected to act on the answer, not only produce it.

**SLAs** is the largest region and splits cleanly on direction. Forward carries EDD
adherence, TAT control, pickup-time adherence, and first-attempt conversion; reverse
carries pickup-date adherence and its own first-attempt conversion. Cutting across both is
ageing — not just whether a breach happened but how long it has been sitting unresolved —
plus the two loss modes, RTO and lost orders. Ageing is the tell that this is a control
system: a breach that is measured and left alone is a report, a breach that is aged and
chased is an operation.

**NDR/NPR management** is a region of its own rather than a sub-branch of SLAs: the failed
attempt cross-check and the re-attempt loop with the customer. First-attempt conversion
measures the entry to it and RTO measures the exit; the loop between the two is where the
outcome is actually decided, which is why it earns separate standing.

**BI** is not a separate body of work but a requirement applied to everything in SLAs:
every metric has to be sliceable by zone, lane, city, order value, and partner. The slice
list is what makes a metric actionable — a breach rate for the whole book tells you
nothing you can assign to anyone.

**Operation control** is the write side. Pincodes and orders get assigned to partners, and
the system recommends that assignment on cost and performance together. This is where the
old project's Excel deliverable pointed — it compared current SLA against vendor TAT per
pincode and printed a switch/keep recommendation — but as a monthly workbook, not a live
decision. Ranking on cost and performance together implies a **partner scorecard** — one
score per partner rolled up from SLA performance and cost — since neither region produces a
single comparable number on its own. Serviceability sits in the same region and is its
precondition: which pincode is serviceable by whom, whether COD and reverse pickup are
available there, and which pincodes a partner could newly open up. Assignment can only
rank partners that can serve the pin at all.

**Costs** closes the loop from order to money. Orders map to final invoices with the
breakup separated out — freight, charge weight, fuel charge, tax, overheads — and each
component is cross-checked against the partner agreement. Mismatches raise an escalation
that has to be closed, not merely logged; the invoice is then tracked through to payment,
and missing-item and lost-order complaints land as deductions against it. The claim
embedded here is that SLA failure and billing are one subject: a lost order is both a
service breach and a debit.

**Escalations** is the human-facing region. Customer tickets are tracked to completion
against a resolution commitment made to the customer, with ageing on anything unresolved,
an escalation matrix that automates the chase, and a defined path for critical tickets.
Two supporting requirements sit under it: CS agents need current order status visible
while they are on the call, and RTO-driven manual re-placement needs controlling. Metrics
cut by status, type, and criticality.

The open question the frame still holds is what "good" is for each requirement — the
requirement table has a success column deliberately left empty, because a control target
without a number is an intention.

## Related

- [Problem discovery frame](problem-discovery-frame.md) — the structure this goal was poured into
- [GRN-to-payment cycle](grn-to-payment-cycle.md) — the same order-to-money closing loop, seen from procurement
