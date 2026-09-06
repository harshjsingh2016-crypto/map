---
boards: [scalar/no-code-ai-bot]
updated: 2026-09-06
---

# Vendor data diligence

What to say when a client asks whether their documents are safe in a third-party AI tool — and
why the honest answer is a process rather than a reassurance.

The factual part is straightforward and mostly good news. The established vendors handle
uploaded data well; encryption and privacy policies apply on the free tier as much as the paid
one, and uploaded content is not used to train the vendor's models. None of that is a reason
to skip the next step.

The operative half of the answer is that you **check the vendor's compliance posture and
customer feedback against this client's requirements before choosing** — GDPR being the usual
named one, but the general form is whatever regime and internal policy the client is bound by.
Safety here is a per-client requirement you verify, not a property of the tool you assume. Two
clients can look at the same vendor and reach opposite conclusions, and both can be right,
because the line is theirs to draw and not yours.

## Self-hosting is the answer to the hard case

When a client's position is that nothing may leave their premises, no amount of vendor
assurance reaches it — the requirement is about location, not about trust. That is the moment
an open-source, self-hostable tool stops being a nice property and becomes the only option
still standing, and it is worth knowing which of your candidate tools can be run on someone
else's server before the question is asked.

The related habit is smaller and applies before any of this: strip what does not need to be
there. Diligence about the vendor and
[anonymisation](data-anonymization.md) of what you send are separate controls, and the second
one does not wait on the first.

## Related

- [Data anonymization](data-anonymization.md) — the control you own regardless of what the vendor promises
- [Dify](dify.md) — the self-hostable option, and why that clause matters commercially
- [Grounding](grounding.md) — what the uploaded documents are being used for in the first place
