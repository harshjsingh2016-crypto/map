---
boards: [scalar/ai-content-creation]
updated: 2026-09-09
---

# Canva Magic Studio

The tool at the style-and-volume end of the content triage. Where Gamma answers *organise this*
and a chat model answers *get this right*, Magic Write answers a third question: write many
pieces that sound like us. Social and short-form is its territory, and the reason it wins there
is not writing quality in the abstract but that it is design-aware and built for batches.

What it takes as input is the part worth remembering. You do not describe the voice to it. You
hand it past posts and it works from those, which makes the curation of examples the real task
and the prompt a much smaller one. A style guide explaining the tone does less work than a
handful of pieces already written in it — the same lesson the do-not-guess constraint teaches
from the other direction, that what you supply beats what you instruct.

The pipeline has four steps and the fourth is the one people drop. Examples in, generation of
the batch, **a proofread that is its own pass**, then the posts go out. Separating the proofread
from the generation is not fastidiousness. Matching a voice and being correct are unrelated
properties, and a batch of twenty posts that all sound right is twenty pieces of unchecked
copy, not one. Volume is exactly what makes skipping the pass tempting and expensive.

What the proofread step is not is a verification. In the transferable version of the pipeline the
caption goes back to Claude or ChatGPT to be tightened, and a second model tightening prose has no
access to the notes the figures came from. It improves phrasing, and phrasing is the operation that
[rewrites a binding figure into a different claim](paraphrase-failure-mode.md). So the proofread
sits inside the generation half of the work, not the checking half: [the manual
pass](editors-checklist.md) still runs after it, against the source.

## Related

- [Voice is per channel, not per brand](voice-is-per-channel.md) — which examples you feed it, which is the whole input question
- [Diagnose the hard part](diagnose-the-hard-part.md) — the triage that sends style-and-volume work here rather than to Gamma
- [Gamma](gamma.md) — the other end of the same triage; a tool article shaped the same way, organising instead of styling
- [Finished-looking is not checked](finished-looking-is-not-checked.md) — why the proofread is a step in the pipeline and not an optional tidy-up
- [The editor's checklist](editors-checklist.md) — the pass that runs after the proofread, and is not the proofread
- [Zero-shot and few-shot prompting](zero-and-few-shot-prompting.md) — examples as the mechanism, and the overfitting risk that comes with them
