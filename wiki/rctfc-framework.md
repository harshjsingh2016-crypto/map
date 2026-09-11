---
boards: [scalar/prompt-engineering, scalar/no-code-ai-bot, scalar/ai-content-creation, scalar/multimodal-gen-ai]
updated: 2026-09-10
---

# RCTFC Framework

Five things a prompt can fix instead of leaving to the model: Role, Context, Task, Format, Constraints. A bare ask like "Summarize this meeting" specifies none of them — the model picks all five for you.

The T20 meeting-minutes exercise showed what specifying them buys. The RCTFC version named the role (meeting note-taker), the context (analyst circulating minutes after a weekly sync, attendees spanning engineering, ops and sales), the task (minutes people who missed the call can act on), the format (decisions, action items with owner and deadline, open questions) and the constraints (word cap, no invented details, no filler). Same input, same model — the difference sat entirely in the prompt. The specified version pulled action items into a table with a "Blocked By" column a bare ask never produces, and added a Risks section for things the meeting worried about but did not decide: raised, but with no owner and no due date.

Format deserves its own gloss: output formatting means naming the exact fields, headers or keys the response must carry — the same move as specifying a query's output columns. Especially useful when JSON output is required — the keys are the contract.

The five don't all live in the same place. Role, Context, Format and Constraints are baked into the system prompt — they describe the job, and the job is stable. The Task is what keeps changing, arriving as the user prompt. The split is the boundary between what you set once and what the caller supplies every time.

Two things about constraints worth keeping:

- A word limit is a [cost lever](prompt-costs.md), not just a style one — it caps the expensive side of the bill.
- Constraints can contradict the task. A word cap on an output that genuinely needs more words forces the model to choose which instruction to break. Watch for the contradiction rather than stacking constraints reflexively.

## TAF — the same framework with two slots assumed

Content work names its own version, **TAF: Tone, Audience, Format**. It is not a sixth thing to
learn. Tone is the sound half of Format, Audience is Context under another name, and Format is
Format. Role and Constraints have not been dropped — they are assumed, because in content work
they are stable: you already know you are briefing a copywriter, and the constraint is nearly
always "don't invent facts". That is the same constraint that carried the Gamma deck and the
handbook rewrite, which is why the compression survives contact with real work.

The compression is only safe while those two hold. A brief that carries a legal disclaimer, a
mandated call to action, or a word cap that fights the task has a constraint worth writing down,
and TAF has nowhere to put it — at which point you are back to spelling out all five.

Format is also lighter here than anywhere else, and that is the substantive difference rather
than a stylistic one. For an engineering prompt the format is a contract: the JSON keys the
response must carry. For a caption it is "2-3 short lines, no hashtags", and the weight shifts
onto tone and audience, because that is what content professionals actually lean on.

The worked pair makes the cost of leaving a slot empty concrete. "Write something about our
Kerala backwaters package" leaves the model guessing the medium, the reader and the length, and
a guessing model goes safely bland. The specified version names an Instagram caption, a tone
(warm, a little cheeky, one emoji max), an audience (young couples scrolling, not researching
yet) and a format (2-3 short lines, one concrete sensory detail). The audience clause quietly
does the most work: "not researching yet" rules out prices, dates and itineraries without any
of them being mentioned. Every ambiguous choice was made by the writer rather than the model.


## The block the framework has no slot for

A shipped customer-facing system prompt maps onto the five almost cleanly — a role-and-context
opening, a YOUR JOB block as the task, HARD RULES as constraints, a STYLE block as format. What
does not map is a fifth block instructing the bot to collect, before the conversation ends, the
travel month, the number of travellers and one contact detail.

The mismatch is informative rather than a gap in the framework. RCTFC describes how to get a
good *answer*, and every one of the five serves that. A bot deployed by a business has a second
job running underneath the answering one, and that job is commercial: the conversation is worth
something even when the answer is not. Nothing in a framework built around answering has a
place to put it.

Worth carrying as a check on any production prompt. If it only says how to answer well, it is
an RCTFC prompt in a place where the business also wanted an outcome.

## The Four S's, for pixels

Image generation gets its own four-letter framework, and the framing that matters is that it is
not a new skill. Subject, Style, Setting/Light, Shot — the same shape as RCTFC, aimed at pixels
instead of words. Subject is what or who is actually in frame. Style is illustration, photoreal or
painterly, and carries a prohibition of its own. Setting and Light is time of day, weather and
light quality. Shot is angle, framing and aspect ratio.

The teaching move is worth copying: all four were answered on a Coke Zero hero shot **before any
tool was opened**. They are desk questions, not discoveries you make by generating and squinting,
and answering them in order is what stops the prompt being a wish.

Subject is the row that does the most work, and its discipline is exclusion rather than
description — "very specifically about Coke Zero and nothing else". That is the same instruction
the definition of a hero image carries, arriving from the other direction: a frame with the
subject dead centre and in focus is a frame where you decided what was not in it.

One dial is missing from the four and worth knowing about. Temperature — high for creative, low
for restricted and grounded — is generally **no longer exposed by image tools**. The style field
carries that hint instead, because creativity has to run higher for images than for text. The dial
did not go away; it was folded into a field that does not look like a dial.

## Related

- [Prompt costs](prompt-costs.md) — why spending input tokens to narrow output pays
- [Zero-shot and few-shot prompting](zero-and-few-shot-prompting.md) — examples as an alternative way to pin down format
- [Iterative prompt refinement](iterative-prompt-refinement.md) — how a prompt like V2 actually gets written
- [Diagnose the hard part](diagnose-the-hard-part.md) — TAF is worth reaching for once the job is known to be a style-and-volume one
- [The do-not-guess constraint](do-not-guess-constraint.md) — the constraint TAF leaves unsaid, and what happens when it is
- [Defensive prompt architecture](defensive-prompt-architecture.md) — where the negative prompt sits, as the Four S's inverse
- [Personality rights](personality-rights.md) — the prohibition inside the Style row, and why it is not a copyright question
