---
boards: [portfolio/master-blueprint, qvs-agent/qvs-agent, inward-compiler/blueprint, qvs-fin-mod/fin-blueprint, lvs-logistics/lvs-blueprint, lvs-logistics/lvs-plan-2, google-connect/blueprint]
updated: 2026-10-23
---

# Project portfolio

The Damensch build is a set of small local projects, each owning one domain and one store,
joined by two pieces of shared plumbing. Read top to bottom it is a pipeline: outside
systems, then plumbing, then domain engines, then the places the team reads results.

**Plumbing.** dam_data_warehouse is the single way source data enters the build. It reads
Damensch's central ClickHouse warehouse (Delphi Analytics) and live QVS tables through the
DataGate query API, both read-only, and its daily sync job (DWH-Daily-Sync, 11:00 or at
logon) runs the whole chain: QVS-Agent's feeds, QVS-Fin-Mod's reads, LVS_Logistics' feeds,
the unattended inward run and the daily brief. It replaced Ingest_Automation, which scraped
portal exports with Playwright on logged-in session snapshots. Google_Connect is the single way any project touches Gmail, Drive, Sheets or Chat;
it replaced the per-project Apps Script bridges, which stay as a fallback until they are
retired.

**Domain engines.** QVS-Agent mirrors QVS production data into DuckDB and turns views into
signals and owner-routed tasks; its reports web app (Production Report, Fabric Status
Update, RM / Fabric Gantt) is where the team now reads production. Inward_Compiler turns vendor dispatch and invoice mails into compiled invoices,
GRN status and reconciliation, and hands `compiled.csv` to QVS-Agent. QVS-Fin-Mod sits
downstream of both: it reads GRN, inventory and the open-PO book from QVS-Agent and
invoices, dispatch and reco from Inward_Compiler, and works out what each CF and factory is
owed, paid and short. LVS_Logistics is the one engine off that chain — it reads order and
shipment data from the warehouse feeds, plus Clickpost and Logisupport, to measure order
movement, TAT and EDD breach, and courier cost.

**What the engines drive.** Each engine ends in things the team reads and acts on, not in
its database. QVS-Agent's Production Report shows each shortfall with its likeliest lever
and leaves the decision to the team; its task queue puts each signal with the owner who has
to act, and the hybrid frozen month plan is the one requirement basis every surface is
moving onto. Its Fabric Status Update page is the build's one write into QVS: reviewed
fabric values go in through QVS's bulk-upload API only when the user presses Submit, and
each push is re-read and checked. Inward_Compiler's Inward Automation sheet tracks GRN status per shipment and
holds a Review tab of mismatches to decide; its Reconciliation tab says what each factory
invoice is actually payable after shortages and RTV, and its buying priorities say which
inward to push first. QVS-Fin-Mod turns settlements into the monthly payments plan (who is
paid what, with vendor plan drafts each Tuesday), the ROD gap report and collection list,
vendor statement and account-reconciliation mails, a dated Tancom tab per payment, and a
Chat brief at the end of the daily chain; its CFO OTB
views (`cfo_otb_views`), still a design mock, are meant for long-term cashflow visibility
and planning. LVS_Logistics
feeds a vendor dashboard for comparing courier partners, a Verify Data sheet the team
cross-checks against its own records, an EDD Breach RCA sheet where the manager records
a cause per late AWB, a Chat post of orders still waiting for an AWB, and an ideal pincode
TAT list (the P80 of actual delivery days) that operations adds buffers to before updating
Bettercommerce.

**Picked tasks and goals.** The next work chosen per engine. QVS-Agent: a fabric
production review process, a supply quick-view dashboard, an agent-driven overhaul of the
task queue, and a Production Report overhaul. Inward_Compiler: standardizing its data
pipeline, with a cloud shift. QVS-Fin-Mod: ROD reconciliation end to end, a payment plan
manager with communication automation, cashflow plan versioning, a GRN CN/DN recon manager,
and its own cloud shift. LVS_Logistics: a post-order app, an allocation engine, a
performance manager agent, and a legal assister. Two engines name a cloud shift, which
would move them off the one-laptop setup the rest of the build runs on.

Control Tower, a three-layer trust/execution/direction view over QVS-Agent, was closed on
12 October 2026 in favour of the Production Report. Both it and Ingest_Automation are now
archived, and their blueprint boards are no longer mounted in Map.

**Rules that hold across all of them.** QVS stays the system of record, with the reviewed
fabric status as the one write back. `qvs.duckdb` has one writer and everyone else reads it
read-only. Source data comes read-only from the warehouse and DataGate, and one daily chain
runs every engine in order: a failed step is reported and the chain goes on, and the day
ends in a digest of every step. Where an LLM is used it only classifies and extracts;
arithmetic, joins and state are deterministic Python. Everything still runs on one laptop,
catching up at the next logon — so the open question on the master board is whether each
surface shows the date its data is from, not only whether the chain ran.

Outside the Damensch build, Map is the engine that mounts every project's blueprint, and
Armor holds the Scalar course lecture boards.

## Related

- [Codex control loop](codex-control-loop.md) — QVS Agent, Logistics and QVS Finance are the systems its Work horizon stands on
