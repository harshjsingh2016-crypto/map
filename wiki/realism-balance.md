---
boards: [scalar/multimodal-gen-ai]
updated: 2026-09-10
---

# The realism balance

There is a ceiling on how polished a generated image should be, and it is set by credibility rather
than by honesty. Past it, the image stops being read as a record of a place and starts being read
as a picture someone made.

The example is a secondhand marketplace listing. An old fridge photographed badly gets no
attention — nobody clicks a dark, crooked photo of a white box. A fridge that looks showroom-new
makes buyers suspicious, because the picture is better than the thing plausibly is, and the gap
between them is where a buyer starts imagining what else has been improved. Neither listing sells.

The same curve applies to a property. Taking the flat overcast photo you actually have and
restyling it to warm morning light is the job. Taking it far enough that the result is, in the
instructor's phrase, so unrealistically beautiful that it is not real, loses you the booking — the
viewer concludes it is AI and goes somewhere that what they see is what they get. Nothing false has
been claimed at that point. The picture is simply not believed, and an unbelieved picture does the
same commercial damage as a disproved one.

This is what the Style and Setting/Light fields are really deciding, and it explains a line in the
worked restyle prompt that belongs to none of the four questions: **keep the roofline, windows and
signage exactly as in the original**. Anchoring the parts a returning visitor would recognise is
what buys permission to change the light.

## Fidelity is not truth

A neighbouring trap runs in the opposite direction, and the tools are getting better at it. Most
image generators render embedded text as scribbles that merely look like writing — ask for an
airport scene and the departures board is gibberish. One of them renders real letters and
real-looking times instead, which is a genuine capability and a specific hazard: it does not mean a
real flight exists, only that the board looks real.

So improving fidelity makes a frame **more convincing without making it more true**, and the two
qualities are worth tracking separately. The realism ceiling says do not exceed what will be
believed. This says do not mistake what is believed for what is the case — which is why the rule
attached to the whole modality panel is that a generated frame must never be allowed to pretend to
be a photograph.

Practical residue: check every spelling in generated text, including from the tool that is best at
it. Frequent misspellings are the visible half of this problem, and the invisible half is a
plausible number nobody questioned.

## Related

- [Unintended claims](unintended-claims.md) — the failure that starts where believability ends
- [RCTFC Framework](rctfc-framework.md) — the Four S's, where the Style and Setting fields make this judgement
- [Finished-looking is not checked](finished-looking-is-not-checked.md) — the text-side version, where polish and accuracy come apart
- [Delivery, not accuracy](delivery-not-accuracy.md) — the other case where the output's job is to land rather than to be right
