---
boards: [scalar-2/agent-building-blocks]
updated: 2026-09-29
---

# Least privilege

When an agent is connected to an outside service, the consent screen offers permissions, called
scopes, and least privilege is the rule of granting only the ones the task needs. It sounds like
common sense and is routinely broken, because the extra scope looks harmless: the agent will not use
it.

The practical test is to read the task verb by verb. A task that says *check* my mail, *check* a
document in my drive, and *draft* a note back to me needs mail read access and drive read access.
It does not need permission to send mail, because drafting to yourself is not sending, and it does
not need calendar access, because nothing in it touches a calendar. Every scope granted should have a
verb behind it. In the class exercise most people ticked send access as well, which is the ordinary
mistake: a capability granted and never used, exposure nobody asked for. Some newer or smaller
connectors skip the choice entirely and ask for blanket access to everything, which is worth
noticing before accepting.

## The risk is in reach, not in use

The instinct that an unused permission is harmless is the error. Nothing guarantees an unused
permission will be misused, but it widens what a malicious instruction or a flawed connector can
reach, and it appears in no log until the day it matters. The person connecting never sees the APIs
behind a scope; the agent reads the server's tool descriptions and the server makes the calls. That
makes the consent screen the one real control, and a scope not granted the only reliable boundary.
A scope granted with the intention of never using it is an intention, not a boundary, which is the
same distinction as a coding agent kept off the production network, or a trading platform's agent
connection that leaves trading out rather than trusting a spending cap in the prompt.

## What goes wrong

Two incidents reported by a security evaluation firm illustrate the mechanism; the details were told
from memory in class and should be checked before being cited, but the shape is the point. In one, an
instruction smuggled into an ordinary-looking request about a public code repository steered the
connection into private repositories, whose contents leaked. In the other, a messaging integration
could be made to hand over entire conversation histories when a task needed a handful of messages.
Neither was a break-in. Each was a connection granted broader reach than the job required, and an
injected instruction that used it. Both were fixed.

The lesson runs in two directions. Whoever builds a server is responsible for it exposing no more than
it must, because attackers will reach it through agents carrying injected prompts. Whoever connects to
one should grant the narrowest access that does the job: if the task needs calendar read access, grant
calendar read access and nothing else. Everything that was ever true of an API's exposure is true of
these connections too; the convenience is new, the risk is not.

## Related

- [Model Context Protocol](model-context-protocol.md) — the connections these permissions govern, and why convenience is not safety
- [AI safety failure modes](ai-safety-failure-modes.md) — prompt injection, the vehicle in both incidents
- [The three pillars of an agent](three-pillars-of-an-agent.md) — guardrails the agent cannot cross, of which an ungranted scope is one
- [API key hygiene](api-key-hygiene.md) — the older form of the same discipline: credentials scoped and kept narrow
