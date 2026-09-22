---
boards: [scalar/workflow-automation, scalar/zapier-automation]
updated: 2026-09-22
---

# Choosing between workflow tools

Two platforms build the same automation with the same grammar, and the comparison table between
them has six rows of which exactly one decides anything.

The rows are real. One is source-available and runs either hosted or entirely on your own hardware;
the other is hosted only. One gives you a free-form node graph where branches merge and loop as you
like; the other is mostly linear with a branching step bolted on. One exposes native model nodes
with full prompt and model control; the other has a built-in AI step for common tasks. Pricing
differs in unit — executions against tasks. The hosted one has a far larger library of pre-built
integrations.

**The stated default is the flexible one, with a single disqualifying exception:** use it unless a
connector you need is missing, in which case use the other. Everything else in the table informs
the choice without deciding it.

## Why connector count is the wrong reading of the connector argument

The library size is quoted as a headline number and is partly a marketing surface. The story told
against it is the useful one: a workflow-tool builder found that clients shown "150 connectors
available" would only ever use a file store and email — and that hearing the number still made the
product much more appealing.

Held against that is the sharp version of why connectors matter at all: *if my data sits in SAP and
I cannot connect it, the tool is obsolete for me.*

These are not in tension. **The count is marketing; the connector you need is binary.** Nine
thousand integrations are worth nothing if yours is the missing one, and one is enough if it is
yours. Which makes the check a two-minute one rather than a comparison exercise: open the search
box and type the tools your work actually runs on. That method transfers; any particular
afternoon's results do not.

## Self-hosting is an answer to a constraint, not a virtue

The hosting row is the one most likely to be read as a moral. It is not. The honest form, added
aloud and missing from the written table: **you can put sensitive data through a hosted tool if
your contract with the client explicitly says so and the client knows.**

So self-hosting is what you reach for when a constraint forbids the alternative — a data-residency
rule, a client agreement — rather than a default good practice. A tool that cannot be self-hosted
has exactly one answer to "this client's data may not leave our infrastructure", and the value of
the option is that it lets you say yes.

**And self-hosting has a limit that the hosting row hides.** Raised by a student and conceded
immediately: if the workflow runs on your own hardware but still sends the query out to a hosted
model, **the data leaves anyway**. Self-hosting moves where the records sit; it does nothing about
where the payload goes, and in a classification workflow the customer's phone number and message
text are in that payload either way. So "we self-host, therefore the client's data never leaves our
infrastructure" holds only if the workflow contains no outbound model call — and the moment it does,
the promise has to be re-checked against that one node. The implied fix is a local model.

## Splitting one process across tools

The question arrives naturally once two platforms are on the table: can a large, complex process use
different tools for different phases? The answer reframes it, and the reframing is the useful part.

**A single long workflow is expected, not a smell.** These canvases are built assuming you will
create a great many nodes and branch out of them; one can fill a spreadsheet, message three chat
platforms and make a model call end to end. The instinct behind the question — decompose, separate
concerns — is a good engineering instinct and the wrong one here.

**Do not stack two paid platforms**, because you are then paying twice for the same category of
thing. And the recommended split is **by context rather than by phase**: the self-hosted free option
for personal and small projects, the hosted one for company work where connector coverage and ease
matter. Which is to say the asker proposed splitting **one process** across tools, and the answer
splits **classes of work** — same tool for the whole of any given job.

**When a tool genuinely cannot reach the finish line, bridge with a data store rather than a second
orchestrator.** If it does most of the job but cannot connect to the final destination, write the
output to a spreadsheet or a SQL database and have the destination read from there — a presentation
tool that cannot pull from the workflow platform can pull from a sheet the workflow platform writes.
Both platforms can also run scripts, so a short script updating the destination directly is the
other route.

A shared store is a much cheaper seam than a second platform: no second subscription, no second set
of credentials, **no second place for a workflow to fail silently**, and either end can be replaced
without touching the other. It is also the HTTP lesson arriving as advice — when no connector
exists, you are back to moving the data yourself, and a sheet is the least ceremonious way to do it.

The deciding rule offered for all of this is unglamorous and right: look for **where the trade-off
is lowest**.

## A second comparison, with a different headline

A later lecture, taught from the hosted side, laid the same two tools out across eight rows — shape,
maintainability, data access, integrations, cost model, data location, volume, custom code — and
named a different row as the one that matters: **who can maintain it.** On one side, anyone in the
business; on the other, whoever built it. The line that went with it is worth keeping because it
names the incentive honestly: the builder of an unreadable flow "builds a dependency; the company is
never firing" them. What is bad for the business is good for the person who owns the flow, which is
why it keeps happening without anyone intending it.

The cost row got the fairest framing either comparison offered: **"the cost of n8n is your life; the
cost of Zapier is the actual cost."** Self-hosting is not free. It is paid in servers, upgrades and
your own time — a cost that appears on no invoice and so goes uncounted. Per-task pricing is worse
in absolute terms and better in legibility: you can forecast it, expense it, and hand it to someone
else.

Two more rows belong in the table though neither comparison printed them. **Retrying a failed
run**: on the self-hosted tool it is a free checkbox; on the hosted one it is a paid tier — same
capability, different commercial position. And **portability**: the self-hosted tool's flows export
as JSON, the hosted tool's cannot be exported at all, which splits the maintainability row into
readability (the hosted tool wins) and portability (the self-hosted tool wins).

## Reconciling the two rules

The earlier rule was *flexible by default, unless a connector is missing*. The later headline is
*maintainability*, and it points the other way. They are not in conflict so much as answering
different questions — and the reconciliation below is a reading of the two, not something either
instructor stated.

**The first rule optimises for the build. The second optimises for the life of the thing
afterwards.** Which should decide depends on whether the automation stays yours. A personal pipeline
only you will touch has no dependency problem, so capability wins and the first rule stands.
Anything handed to a business has one, and then maintainability outranks the connector question —
because **a missing connector is a problem you find on day one, and an unmaintainable flow is a
problem you find in year three.**

Above both sits the one row that vetoes: where data must not leave your own network, a hosted-only
tool has no answer at all.

## Related

- [The workflow grammar](workflow-grammar.md) — the vocabulary both tools implement; only the nouns change
- [Fair-code](fair-code.md) — the licence that makes the self-hosting row possible
- [Polling vs webhooks](polling-vs-webhooks.md) — the one mechanical difference underneath the comparison
- [When to automate](when-to-automate.md) — the decision that comes before any of this
- [Bolted on, or built for it](bolted-on-or-built-for-it.md) — the sibling rule for judging a tool against a job
- [Creating dependency](creating-dependency.md) — the cost the maintainability row is pricing
