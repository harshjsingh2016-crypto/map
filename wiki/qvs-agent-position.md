---
boards: [damensch/qvs-agent]
updated: 2026-09-09
---

# QVS agent — the project position

The project began as a mirror: QVS holds no dated history, so the agent keeps one locally
and answers questions against it. That part is finished and unremarkable now. What is worth
recording is where the project has actually got to, because the centre of gravity has moved
and the remaining work is a different kind of work.

**One engine, running daily.** Files drop into an inbox, a watcher ingests them per file in
its own transaction, and a derive pass rebuilds every derived table and view from the raw
snapshots. Seventeen feeds are registered, eleven of them daily. The derive pass ends by
regenerating the task ledger, which means the ledger can never lag the views it is built
from — a deliberate ordering decision, not an implementation detail.

**Five surfaces are live, and they are all read paths.** Chat over the views, three daily
email digests, a shelf of Excel report builders, the task queue through a CLI and a per-owner
digest, and a local Gantt app for raw-material deliveries. Nothing writes back to QVS. The
only writes the agent makes at all are the narrow user-directed ones: lineage confirmations,
PR batch mappings, holidays, ownership rows, manual inspections, RM delivery updates.

**The unbuilt work is mostly about where people read it, not about deriving more.** The Line
Sequence dashboard is built and tested — a TypeScript port of the sequencing engine held to
the Python original by parity fixtures, an Express API on Functions, a React SPA, migrations
and user provisioning. It has never been deployed. The Control Tower is designed to the point
of a written data hand-off mapping every goal to a view, and not started. Both are waiting on
the same thing: a Google Cloud account and the six-phase cutover that follows from it. That is
the honest reading of the position — two of the largest threads are blocked on an
administrative step, not on engineering.

**The second class of blocker is someone else's data.** A direct inspections API exists, is
documented, and the token is in hand, but every endpoint is keyed on a numeric purchase-order
id that no export carries; until QVS supplies the mapping, inspections stay derived from daily
production deltas. The fabric export has been degraded since late July by a bug on the QVS
side and is rebuilt from a saved union before each ingest. The old inspection feed died
outright and was replaced rather than repaired. Each of these has a working substitute, which
is why none of them stopped the project — but each substitute is carried code that only exists
because an upstream is broken, and the workaround is worth deleting the day the upstream is
fixed.

**What the project is now** is closer to a signal-and-routing system than a mirror. Signals
are the views; the task layer decides which of them somebody must own; the ownership map
routes them; the digests deliver them on a schedule. The ownership map is the thinnest part
of that chain — seven people registered, scopes still to fill — and it is the piece the whole
routing layer rests on.

## Related

- [Logistics agent — the data position](logistics-agent-data-position.md) — the same reading applied to the sibling project
- [Problem discovery frame](problem-discovery-frame.md) — starting point, goal, paths and constraints, which is the shape this position takes
