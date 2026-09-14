---
boards: [scalar/workflow-automation]
updated: 2026-09-14
---

# Fair-code

A licence shape that sits next to open source and is easy to mistake for it. You may read the
source, modify it, and run it on your own hardware. You may not **redistribute or sell the software
itself** — that right stays with the vendor.

| You may… | Open source | Fair-code |
|---|---|---|
| Read and modify the source | Yes | Yes |
| Run it on your own machine | Yes | Yes |
| Redistribute or sell it | Yes | **No** |

The worked example is a missing connector. The automation tool has no SAP integration; you may take
a local copy, build one, and publish it on GitHub for anyone to use. You may not package it as a
product and charge ten dollars for it.

## The distinction that decides whether you can work this way

A student's confusion here is the one worth pre-empting, because the answer is the difference
between the licence being a curiosity and being a constraint on your business. **You may absolutely
sell the automations you build with the tool.** You may not sell the tool. The analogy offered:
modifying Windows does not entitle you to resell Windows, but a presentation you make in it is
yours to sell.

So a consultancy building workflows for clients is unaffected. A company packaging the canvas itself
as part of a product it ships is not.

## Why a licence term ends up in a course on automation

Because it is what gives the tool **two homes**. Being source-available means the same canvas and
the same nodes run either as a hosted service or entirely on hardware you control — and that choice
is the one a data-residency constraint forces. A tool you cannot self-host has one answer to "this
client's data may not leave our infrastructure", and it is no.

## Related

- [The workflow grammar](workflow-grammar.md) — the canvas that has two homes
- [Vendor data diligence](vendor-data-diligence.md) — the constraint that makes self-hosting the answer rather than a preference
- [When to automate](when-to-automate.md) — the decision that precedes picking any of this
