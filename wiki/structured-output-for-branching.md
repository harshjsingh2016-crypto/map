---
boards: [scalar/n8n-automation, scalar/zapier-automation]
updated: 2026-09-22
---

# Make the answer a field, not a substring

When a model's classification decides which branch a workflow takes, how the answer is *carried*
matters as much as whether it is right.

The shortcut that presents itself is obvious and wrong. The branching node offers a **contains**
operator, so you make the model append a tag — BOOKING, SPAM — to the end of its output, and you
test whether the text contains `booking`. It works on every example you try.

Then someone submits a message with the word *booking* in it. The model summarises the message,
echoes the word mid-sentence, and tags the end SPAM — correctly. The condition fires true anyway,
because all it looks for is that the word is mentioned somewhere in the document. The spam gets
treated as a real enquiry.

Read what actually failed there. The classifier was right. The prompt was right. The failure is
entirely in the *reading* of the answer: a substring test against a whole document instead of a
lookup of a designated field. The signal was correct and the channel carrying it was ambiguous,
because a tag appended to prose cannot be separated from prose.

The fix is to give the answer its own container. Have the prompt emit a key and a value —
`type_of_message: spam|booking` — and branch on that field. The word can then appear anywhere in
the summary without touching the decision, because the decision no longer reads the summary. The
cost is real and worth stating: malformed output does cause problems, and a model that returns
almost-valid JSON turns a classification bug into a parsing bug.

The general rule underneath: **any value a branch depends on should live somewhere a human could
point at.** If you cannot name the field holding the decision, the decision is being inferred from
text, and text has other authors.

A second, humbler version of the same fragility is worth naming, because it does not need a model to
appear. A filter reading a status column with *exactly matches* is **case-sensitive**: `New` does not
match `new`. In a spreadsheet where a person types that column by hand, one capitalised entry skips
a row that should have gone through — and it fails silently, because a filtered run is not an error
and nothing flags it.

The pattern is the same as the substring case. **The branch condition is the fragile component**,
not the logic on either side of it. A value that a human types freely, or that a model writes into
prose, is not a reliable key to branch on; a value that comes from a fixed set, in a field of its
own, is.

## Related

- [The workflow grammar](workflow-grammar.md) — the condition is one of the three words, and this is how you make it readable
- [Classifying input you do not control](classifying-untrusted-input.md) — why a model is doing the classifying in the first place
- [Iterative prompt refinement](iterative-prompt-refinement.md) — the rounds that got the tag emitted at all
