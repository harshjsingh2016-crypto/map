---
boards: [damensch/tp-op-fin]
updated: 2026-08-26
---

# GRN-to-payment cycle

The trade-payables cycle as it runs today at Damensch, stated as a starting point in the
[problem discovery frame](problem-discovery-frame.md). Six steps, strictly sequential:
GRN raised against POs, GRN reconciliation, invoice accounting, tracker update and share,
payment planning, and final payment with deduction applied.

What the sequence exposes is that every step producing an obligation for someone outside
finance ends in a **share** — the tracker is updated and shared, the plan is made and
shared — but sharing is where the chain stops. Nothing in the current process brings the
counterparty's response back into the system, so a reconciliation query, a tracker
correction from CF, or a deduction applied at final payment lives in whatever channel the
share happened in.

The goal restates four of those steps as closed loops rather than one-way handoffs: GRN
reconciliation as a share loop, tracker coordination run with CF rather than at them,
payment planning as a share loop, and final payment written back into the system. The
shape of the goal is the same six-step cycle with returns attached at the four points
that currently leak.

Paths between the two are not yet drawn.

## Related

- [Problem discovery frame](problem-discovery-frame.md) — the start / paths / goal structure this cycle is poured into
