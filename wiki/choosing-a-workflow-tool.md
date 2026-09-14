---
boards: [scalar/workflow-automation]
updated: 2026-09-14
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

## Related

- [The workflow grammar](workflow-grammar.md) — the vocabulary both tools implement; only the nouns change
- [Fair-code](fair-code.md) — the licence that makes the self-hosting row possible
- [Polling vs webhooks](polling-vs-webhooks.md) — the one mechanical difference underneath the comparison
- [When to automate](when-to-automate.md) — the decision that comes before any of this
- [Bolted on, or built for it](bolted-on-or-built-for-it.md) — the sibling rule for judging a tool against a job
