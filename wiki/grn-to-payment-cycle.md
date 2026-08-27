---
boards: [damensch/tp-op-fin]
updated: 2026-08-27
---

# GRN-to-payment cycle

The trade-payables cycle as it runs today at Damensch, stated as a starting point in the
[problem discovery frame](problem-discovery-frame.md). Eight steps, strictly sequential:
invoice and dispatch from the factory, CF invoice prep matching the factory invoice, GRN
prioritization, GRN raised against POs, GRN reconciliation, invoice accounting combined
with the tracker
update and share, and payment planning, which closes in two separate final payments: the
factory payment with deduction applied, and the CF payment.

What the sequence exposes is that every step producing an obligation for someone outside
finance ends in a **share** — the tracker is updated and shared, the plan is made and
shared — but sharing is where the chain stops. Nothing in the current process brings the
counterparty's response back into the system, so a reconciliation query, a tracker
correction from CF, or a deduction applied at final payment lives in whatever channel the
share happened in.

The goal restates four of those steps as closed loops rather than one-way handoffs: GRN
reconciliation as a share loop, tracker coordination run with CF rather than at them,
payment planning as a share loop, and final payment written back into the system. The
shape of the goal is the same cycle with returns attached at the four points that
currently leak. Each loop is now drawn out as its own flow:

- **GRN prioritization loop** — dispatch SKU data compared with inventory, inwards
  prioritized at factory invoice × option level, the prioritization shared with the
  warehouse as a view, and completed GRNs removed from it.
- **GRN reconciliation share loop** — reco info is ingested to the DB, summary and
  details auto-shared to the factory by mail, a CN taken from the factory against
  shortage, and excess/RTV info triggered for the excess/RTV invoice.
- **Tracker coordination with CF** — invoice accounting done by Fin with the GRN reco,
  tracker updated, the factory CN shared with CF and a DN taken against it, the
  excess/RTV factory invoice matched by an excess/RTV CF invoice taken from CF, and a
  GRN done against it with another tracker update.
- **Payment planning share loop** — a master plan is developed: upcoming due invoices
  slotted into it, its inputs (week budget) and payment slotting (invoice movement) kept
  updated, and invoices fixed for payment marked as locked.
- **Payment updates to system** — locked payments tracked to completion, UTR and payment
  date updated for completed ones (both CF and factory), and the payment advice updated
  in the system against the payment with the final deductions — short, TDS, other — then
  shared with the factories.

The ingestion layer is now mapped step by step: every stage of the cycle already emits a
well-defined record. Factory invoice and dispatch detail arrives by email today (invoice,
date, value, qty, rate, SKU — the final build will need a product flow instead), CF
invoice prep maps a CF invoice onto the factory invoice, GRN prioritization reads DIVAS
inventory (SKU, DOH), GRN comes from Increff data,
reconciliation from the warehouse with short/excess/RTV quantities (the final build
captures these at SKU level — shortage, RTV, excess and GRN against each SKU), invoice accounting is
a manually checked added-to-tracker flag, payment planning contributes a planned payment
date, and both final payments produce a payment advice — UTR, payment date, status to
paid, and the TDS/shortage/other deductions. From CF invoice prep onward every record
carries the CF invoice, making it the natural join key for the store. The CN/DN loop
gets its own new table — the CN/DN excess invoice record, ingested from factory email:
document number, date, qty, amount, a type discriminator (CN, DN or excess invoice), a
maps-to list of invoice numbers, and SKU details held as JSON meta. The CF trackers are
separate today; the final build replaces them with one view filtered per user or
manually.

Alongside the transactional records the store needs auxiliary tables. The first is the
factory table: factory, factory aliases, payment terms, and the emails used for sharing
GRN reco and payment updates — the reference data the auto-share and planning steps read
from. Aliases matter because the same factory arrives under different names across
emails, Increff and warehouse data, and joins need one canonical identity.

The first path drawn between the two is the data pipeline: ingestion, then storage and
schema, then the views used to reach the goals. Parallel to storage and schema runs a
retro-fitting step — backfilling the tables with past data — so the views open on history,
not just on records ingested from go-live onward.

A second path is process changes, distinct from the pipeline itself: the working practices
that turn the goal loops into routine. The first one drawn serves the GRN reconciliation
share loop — after GRN reconciliation, share the SKU-level GRN, shortage and excess with
the factory and CF, then auto-share the reconciliation output with the factory.

The second process change is the CN/DN generate loop, which turns reconciliation results
into paper both sides account for. Post GRN reconciliation: a shortage CN is taken from
the factory and a shortage DN given to the factory from CF; excess and RTV information is
triggered for the excess/RTV invoice, the factory raises that invoice, a CF excess/RTV
invoice is made, and a GRN is completed for the excess/RTV qty — so excess stock
re-enters the cycle
through the same invoice-to-GRN front door instead of as an adjustment. The reasoning is that in a flow that is
mostly financial, clean data flow basically guarantees the other requirements — get the
records moving through one pipeline and the four closed loops fall out of views over it,
rather than each loop needing its own mechanism. Whether that storage is a new store or a
feed into the tracker the team already shares is still an open question on the board.

## Related

- [Problem discovery frame](problem-discovery-frame.md) — the start / paths / goal structure this cycle is poured into
