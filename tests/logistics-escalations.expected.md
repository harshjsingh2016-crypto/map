# Logistics Escalations

## Escalation process (current)

1. Customer raises escalation
   - → CS team sends to logistics dashboard
2. CS team sends to logistics dashboard
   - → LM routes to courier partner channel
3. LM routes to courier partner channel
   - → Courier partner commits TAT
4. Courier partner commits TAT _(Courier partner responsibility)_
   - → TAT communicated to customer
5. TAT communicated to customer
   - → LM follows up in courier channel
6. LM follows up in courier channel
   - → Ticket resolved?
7. Ticket resolved?
   - **Yes** → Courier shares RCA + resolution
   - **No** → LM follows up in courier channel
8. Courier shares RCA + resolution _(Courier partner responsibility)_
   - → LM updates logistics dashboard
   - → LM tags penalty applicability at RCA
9. LM updates logistics dashboard
   - → Penalty applied (payment deduction)
10. Penalty applied (payment deduction)
   > [question] Does this survive a courier partner disputing the RCA? Who arbitrates?
11. LM tags penalty applicability at RCA
   - → LM updates logistics dashboard

## Escalation types

- Delay in delivery
- Missing products in shipment
- Delay in reverse pickups

## Penalty tracking (new field)

| Field | Source | Why |
| --- | --- | --- |
| Penalty applicable (Y/N) | LM at resolution | Not recorded today |
| Penalty amount | Contract slab | Drives deduction |
| Penalty status (pending/applied/waived) | Finance | Closes the loop with payments | <!-- suggestion -->

> [suggestion] rows: r3

## Ageing ticket escalation ladder

1. **T+0** — Ticket routed, TAT committed
2. **50% of TAT** — Auto nudge to courier channel
3. **TAT breach** — Escalate to courier account manager

## What to build first

Axes: **Effort** (x) × **Impact** (y)

**high Impact / low Effort**
- Penalty flag on ticket
- Critical tag + priority queue

**high Impact / high Effort**
- Auto ageing escalation ladder
- Courier scorecard

**low Impact / low Effort**
- TAT auto-communication to customer

**low Impact / high Effort**
- Full penalty-to-payment automation
