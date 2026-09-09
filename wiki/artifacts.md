---
boards: [scalar/ai-content-creation]
updated: 2026-09-07
---

# Artifacts

A generated document or page that stays **a single object** for the life of a chat session.
Revisions edit that same object rather than producing a new file each time, which is a smaller
sounding property than it turns out to be.

The consequence is that nobody ends up holding a stale copy. A document sent as an attachment
forks the moment you fix a typo: the version in someone's inbox and the version you are working on
are now two different documents, and you have no way to reach the first one. An artifact that is
revised in place has one current state, and whoever opens it gets that state. For anything that
will be corrected after it is shared — and a document built from messy source notes will be
corrected — this is the practical reason to prefer this path over a deck tool, ahead of any
argument about output quality.

Two mechanics worth carrying. A generated HTML artifact can hold its **CSS inline in the same
file**, making it one self-contained thing that opens directly in a browser and can be handed over
as a plain file. Serving it from a content delivery network is the grown-up answer; a single
self-contained file is the simpler one and is often enough. And **publishing has conditions**: the
publish control is unavailable inside an incognito chat, which is the sort of thing that reads as a
missing feature until someone points it out, and a published link expires. It lasts on the order of
weeks rather than indefinitely, and the exact lifetime is not something to quote.

## Related

- [Do-not-guess constraint](do-not-guess-constraint.md) — the other half of what made the same demo work
- [Gamma](gamma.md) — the comparison: a deck tool can produce a PDF, but not one this easy to correct
- [Context persistence](context-persistence.md) — the session boundary that defines how long an artifact stays one object
