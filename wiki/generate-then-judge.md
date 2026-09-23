---
boards: [solutions/meme-drop]
updated: 2026-09-23
---

# Generate, then judge

Asked once for something funny, a model returns the median joke: the most probable punchline on the most probable topic. The first version of the meme workflow did exactly that for a week, and the log read like a greeting-card rack — WiFi, coffee, phone battery, dead plants, every caption opening "When you…". The model was not failing. It was answering the question it was asked, which was "what is a typical meme".

The fix was structural, not a better prompt. **Volume first, then selection.** One call writes ten candidates in a single batch, forced to spread across at least three different joke mechanisms, so the batch contains shapes the model would never have reached as its first answer. A second call, with a different persona, scores every candidate and picks one. The writer is a bored shitposter; the judge is an editor who has seen ten thousand memes and thinks most were bad. Splitting the roles matters: a model asked to write and choose in the same breath defends its own first idea.

Three design decisions carry the weight.

**The judge never sees the writer's reasoning.** Each candidate carries a one-line "why it lands", and it is stripped before scoring. A judge that reads the justification is grading the argument, not the joke.

**The gate has a floor and a ceiling.** Below a score of seven the batch goes back once, with the top three verdicts attached as "rejected because". A second miss ships the best candidate anyway. For anything on a schedule this is the rule that matters: a quality gate that can block delivery will eventually turn a bad day into a missed slot, and the missed slot is the worse outcome.

**The judge has to be checked for bias, like any other component.** Four runs in a row, a drawn image beat a real meme template, even when seven of ten candidates were templates. The cause was the input, not the judge's taste: a drawn candidate arrived with a vivid scene description, a template candidate with only a name like "Two Buttons". The richer text read as the better joke. One instruction — picture the named template with its text before scoring, and never reward a description for being vivid — brought the two types level, and a template won the next run. The scores looked plausible the whole time, which is why it took counting winners by type to see it.

What it costs is a second call per run and a larger first one. What it buys is that the best of ten is now the output, not the first of one.

## Related

- [Taste profile](taste-profile.md) — the bar both the writer and the judge are working against
- [Designing for partial failure](designing-for-partial-failure.md) — the ship-anyway rule is the same argument: decide what degraded output looks like
- [Make the answer a field, not a substring](structured-output-for-branching.md) — scores and the winning index come back as schema fields, so the gate can branch on them
- [Meta prompting](meta-prompting.md) — the other way to put a model in a reviewing role, aimed at the prompt rather than the output
