---
boards: [scalar/ai-content-creation, scalar/multimodal-gen-ai]
updated: 2026-09-11
---

# The editor's checklist

Five checks to run before anything generated ships, whatever produced it and whatever shape it
is in: every number matches the source notes, checked one by one; the tone matches who is
actually going to read it; nothing in the draft was invented; any financially or legally binding
figure is untouched from its verified source rather than paraphrased; and the format fits the
channel it is going to.

The checklist is deliberately indifferent to the tool. A deck slide, a handbook paragraph and an
Instagram caption fail in the same five ways, because the failures belong to generation itself
rather than to any vendor's implementation of it. That is what makes a list worth memorising
instead of a set of per-tool cautions worth looking up.

Two of the five are doing more work than the other three. The numbers check and the binding-figure
check are the ones with an outside cost — a wrong figure in a partner deck loses the deal, a
reworded refund term creates a legal exposure — while tone, invention and format failures are
mostly embarrassment. Ranking them that way is useful when the pass has to be short: read the
figures first, and read them against the source rather than for plausibility.

The binding-figure check is separate from the invention check on purpose, because a paraphrased
figure passes the invention check. Nothing was made up; a real number was rewritten into a
different claim. That is [its own failure mode](paraphrase-failure-mode.md), and it is why the
wording is *untouched* rather than *accurate*.

## The shortcut that does not discharge it

You can paste the draft back into a second tool and ask whether anything in it is cooked up. It
gives useful feedback, and the instructor's own qualification is the part to keep: there is still
a chance it misses things, so the manual check still has to happen.

The reason is structural rather than a matter of which model you ask. The second model has no
access to your source notes. It can flag what reads as unsupported — a suspiciously round figure,
a claim with no visible basis — but it cannot tell you whether the number in the draft is the
number you supplied, because it has never seen the number you supplied. Cross-verification is a
smell test. The check is a comparison against the source, and only you are holding the source.

## The multimodal version, and what it adds

The same pass exists for generated images, video and voice, run before anything ships and
regardless of which tool produced it. Six items rather than five, and the useful exercise is
sorting them against the text-side list, because two transfer unchanged and four do not exist in
text at all.

Two transfer whole. **Any overlaid text or spoken number must match the verified source exactly** —
nothing goes in that your own documentation and research do not corroborate, which is the numbers
check word for word. And **the format must fit the destination channel**, where resolution, aspect
ratio and duration stand in for length and structure.

Four are new in kind, and they are new because the output now depicts things rather than describing
them.

**Does this output claim to represent something real?** If it does, it must be accurate; if it does
not, it must be clearly labelled concept or illustrative. This is the sharpest of the four, and it
has no text equivalent for a precise reason: a document does not claim to *be* the thing it
describes, and an image does.

**Do you have consent or rights** for any real person's likeness, voice or property shown or
cloned? Someone's house, hotel, car or face is not yours to use because it is online. Text rarely
depicts a person, so this obligation simply does not arise there.

**Could the visible style or subject create a copyright or right-of-publicity risk?** A named living
artist's style, a recognisable public figure, a copyrighted logo. The two examples offered — a
voice-over in a famous actor's voice, and a caricature painted the way a named painter paints —
are the identity half and the style half of the same argument, arriving as one line item.

**Are there visible generation artifacts?** Garbled text, warped detail, an odd vocal cadence. The
instruction attached to it is the justification for the whole pass: zoom in, listen closely,
**assume someone else will** — which is not hypothetical, since the published failures this rule
exists to prevent were all found by someone who did. It is also the only check on either list where
the failure is **visible rather than inferential**. Every other item requires holding the source to
run. This one you can simply look at, which makes it the cheapest to perform and, for that reason,
the easiest to skip.

It also has a ceiling that the others do not, and it is worth knowing where it is. Detection is a
hard industry problem: a good output from a capable tool will not show to the naked eye at all, and
identifying one relies on software reading pixel-level signatures, with some generators embedding a
watermark into the pixels themselves. On synthetic voices there was no answer to give — tools are
being worked on. So **the better the generator gets, the less this check can protect you**, which
is not an argument for skipping it but an argument about where the weight sits. The two items that
do not degrade as models improve are the label and the consent, because neither depends on anyone
being able to tell.

## Related

- [Paraphrase is a different failure from invention](paraphrase-failure-mode.md) — why one of the five checks says untouched rather than accurate
- [Finished-looking is not checked](finished-looking-is-not-checked.md) — why the pass feels skippable exactly when there is most to miss
- [The do-not-guess constraint](do-not-guess-constraint.md) — the upstream half; the checklist is what survives it failing
- [Gamma](gamma.md) — the demonstration that made the numbers check non-negotiable
- [Unintended claims](unintended-claims.md) — the exposure the first multimodal item is written against
- [Personality rights](personality-rights.md) — the consent and right-of-publicity items, argued out in full
- [The realism balance](realism-balance.md) — the judgement the artifacts check cannot make for you
