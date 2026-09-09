---
boards: [scalar/ai-content-creation]
updated: 2026-09-09
---

# Paraphrase is a different failure from invention

Invention adds a claim that was never in the source. Paraphrase takes a claim that **was** in the
source and rewrites it into a different one. Both produce a draft that reads well, and the two are
worth separating because only the first is caught by asking where something came from. A
paraphrased figure has a real provenance. It is traceable to the source note it distorts.

The worked case is a refund policy carried over from the previous lecture. The policy gives someone
25% back. The draft says they "get most of their money back". Nothing was fabricated, the source was
consulted, and the sentence is friendlier than the original — which is exactly the rewrite a
model asked to improve phrasing will make. It is also a legal exposure. The same trap in arithmetic
form is a count rewritten as a proportion: the number survives, the denominator does not, and the
claim changes by an order of magnitude while reading as a tidy-up.

The structural point is that **grounding does not prevent this**. Retrieval worked; the source was
correct and correctly fetched. The error enters during rephrasing, which happens downstream of
everything grounding controls. Sources, citations and a do-not-guess instruction all sit upstream of
the step that breaks here, so a system can be fully grounded and still ship the wrong refund term.

What follows is the wording of the check. A binding figure — a price, a refund percentage, a policy
term, a contractual date — is to be *untouched*, not *accurate*. Accuracy invites a judgement about
whether the rewrite preserved the meaning, and that judgement is the thing that fails. The only safe
operation on a binding figure is copy, which also makes the check mechanical enough to run at speed:
find the figure in the source, compare the characters, move on.

## Related

- [The editor's checklist](editors-checklist.md) — the five-check pass this rule is the fourth item of
- [Grounding](grounding.md) — the upstream defence this failure mode gets past
- [Finished-looking is not checked](finished-looking-is-not-checked.md) — why the friendlier rewrite is the one that ships
- [Citation credibility](citation-credibility.md) — the neighbouring case; a pointer to a source certifies less than it appears to
