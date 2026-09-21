---
boards: [scalar/n8n-automation]
updated: 2026-09-20
---

# Hosted or on your own machine

A workflow tool that can run both hosted and locally behaves identically either way. The nodes are
the same, the canvas is the same, a flow built in one runs in the other. Nothing about the choice
is a product question; all of it is an operations question.

What the hosted version sells is years of somebody else's expertise in keeping a thing running:
minimal downtime, support, and the consistency that when there is an outage somewhere, your
workflows still execute. Framed from the client's side, the argument sharpens — the point of paying
is that the client never hits a problem caused by a trigger that never fired *on your end*. That is
an accountability purchase, not a feature purchase, and it holds even when a free alternative is
sitting right there.

What running it yourself costs is everything that follows from the machine being yours. It has to
be on all the time, because you never know when a trigger fires. Reaching it from another device
means the machine's address on the same router, which stops working the moment you leave the
building. And the failure modes are mundane rather than technical: somebody pulls the Wi-Fi cable
and your server is down. The honest summary is that a local instance is considerably more likely to
fail than a hosted one.

One constraint overturns all of it: data privacy. When a client says their data must not go to a
cloud network, the reliability argument loses, because the constraint is not negotiable — the data
sits on your machine or the engagement does not happen. There is a middle path worth knowing, which
is renting a virtual machine from a cloud provider and running the tool on it: you pay for the
machine rather than for the tool, and you get managed uptime while the data stays under your own
control.

Two practical notes attach to the local route. Usage limits from the hosted free trial do not apply
to it — a local instance is unlimited. And local models work with it smoothly, which is the other
reason a privacy-constrained engagement ends up entirely on your own hardware: not just the
workflow data, but the inference too.

In practice the local route is a container stack rather than an install: a get-script one-liner
followed by a compose command brings up a handful of containers — the app, a sandbox API, a search
service and a couple of runners — in a few hundred megabytes of memory, reachable on a local port.
Two operational details catch people. Closing the terminal orphans the containers rather than
stopping them, so they are stopped from the container manager. And the machine staying on is not a
theoretical requirement: shut the laptop down and the triggers stop, which is the whole trade-off
arriving as a consequence.

One thing that is easy to conflate: **running the tool locally does not make the model local.** A
hosted model's API key is still needed, and the flow still calls out to it. Where the tool runs and
where inference runs are independent decisions, and only a local runtime collapses them — which is
what makes it the real answer for a privacy-constrained engagement rather than self-hosting alone.

## Related

- [Choosing between workflow tools](choosing-a-workflow-tool.md) — the other axis of the same decision, where self-hostability is one of the six rows
- [Fair-code](fair-code.md) — the licence that makes running it yourself permitted in the first place
- [API key hygiene](api-key-hygiene.md) — the credentials question that follows wherever the instance lives
