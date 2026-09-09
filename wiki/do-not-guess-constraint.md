---
boards: [scalar/ai-content-creation]
updated: 2026-09-07
---

# The do-not-guess constraint

One clause in a prompt, and the single most useful line in the content-creation lecture:

> If anything is ambiguous or missing, do not guess — list it at the end under *Open questions*.

What makes it worth its own article is the comparison it sets up. Two tools were handed the same
category of problem, a gap in the supplied information. One filled the gap silently, inventing
three commercial concessions onto a slide bound for a negotiation. The other appended a list of
questions addressed to the person who wrote the notes.

The tempting reading is that one model is more careful than the other. The accurate reading is
that **one was told what to do with a gap and the other was not**. The instruction is what
converted a hallucination into a visible question, and nothing about the model made that choice.

That is the transferable move. A generative tool will always do *something* with missing
information, because producing output is the job it understands itself to have. Leaving the
behaviour unspecified does not make it cautious; it makes the choice for you, in the direction of
completeness. Naming the alternative — surface it, list it, mark it — is what redirects the
default.

Two details keep it honest in practice. The constraint has to name the destination, not just
forbid the guess: *list it under open questions* gives the model somewhere to put the gap, where
*do not invent anything* gives it nowhere and quietly returns you to the old behaviour. And the
open-questions section itself is correct output but internal output. It is a message to the author
of the source material, and it gets stripped before the document reaches its readers.

The wider prompt this sat inside is worth copying too: use only facts, do not round or re-tier any
number, and the notes correct themselves in one place so follow the correction. Each is the same
shape — a specific failure named in advance, with the wanted behaviour spelled out rather than
implied.

## Related

- [Finished-looking is not checked](finished-looking-is-not-checked.md) — the principle; this constraint is the cheapest thing you can do about it before review
- [Gamma](gamma.md) — the other half of the comparison, where the gap was filled instead of surfaced
- [Defensive prompt architecture](defensive-prompt-architecture.md) — the same instinct built out into role, refusal and output rules
- [RCTFC Framework](rctfc-framework.md) — where this sits as the constraints element, and the framework the class recognised under it
- [Grounding](grounding.md) — restricting what the model may draw on, which reduces gaps rather than handling them
