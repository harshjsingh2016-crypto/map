---
boards: [scalar/ai-content-creation]
updated: 2026-09-09
---

# Gamma

The tool at the organising-it end of the content triage. It generates presentations, documents
and simple web pages from a brief, an outline or existing material, drafting a structured
multi-slide document in under a minute, picking layouts and pulling in contextually relevant
images. Decks are the headline use; it positions itself as more than slides.

The pipeline has one review gate and it is easy to walk past. Gamma returns **an outline before it
renders anything**, and the outline is content cards rather than slides: what each slide will
contain, not what it will look like. Slides can be merged, added or inserted at that point. After
that come theme and image-source settings, then generation, then editing through an assistant pane
that offers an original-versus-modified diff. Everything downstream of the outline is correction;
the outline is the last place shape is cheap to change.

## Speed and invention are the same setting

The phrase to hold from the demo is *under a minute*, because it turns out to be the same fact as
the failure. Asked to add a slide covering what happens if a guaranteed minimum in the deal is not
met, Gamma produced one offering to adjust the commission, extend the trial and renegotiate terms.
None of it was in the brief. Three commercial concessions, invented, on a slide headed for a
partner negotiation.

A second run produced the quieter and more dangerous version: a *four-person core team* in the
brief came back as *four full-time founders* in the deck. That is not invention from nothing but a
supplied fact upgraded into a different claim, and it survives a skim by someone who knows the
brief well.

Two things cause it, and neither is a defect to be patched. Gamma understands its job as producing
the presentation, so incomplete information is a hole in a slide rather than a question to raise,
and it fills the hole. And producing decks requires creative choices — which layout, which image,
how the text reads — so it runs at a higher temperature, which raises hallucination probability
directly.

That is the whole trade. Speed and invention are not two properties you tune against each other.
They are one setting, and choosing the fast tool is choosing the inventive one. A better system
prompt helps only to a degree: you can steer it toward your supplied documents, but unclean input
still returns a finished deck, and the proofread is still yours.

## What it is worth anyway

The honest accounting is that a job of four to five hours becomes about half an hour of
proofreading. That is not a small saving, and it explicitly does not remove the analyst — it moves
their time off assembly and onto the part only they can do. Outside its demo context it fits
pitching an architecture or a solution not yet built, and proposing a project to leadership. It is
a documenting-and-sharing tool, not an automation tool.

## Related

- [Canva Magic Studio](canva-magic-studio.md) — the other end of the triage: styling and volume rather than structure
- [Diagnose the hard part](diagnose-the-hard-part.md) — the selection rule that sends a structure problem here in the first place
- [Finished-looking is not checked](finished-looking-is-not-checked.md) — the principle this tool demonstrates most bluntly
- [Model dials](model-dials.md) — temperature as a dial you set deliberately, which is what Gamma has set for you
- [Free-tier arithmetic](free-tier-arithmetic.md) — Gamma is the credit-metered exception among the content tools
