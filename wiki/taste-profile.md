---
boards: [solutions/meme-drop]
updated: 2026-09-23
---

# Taste profile

Examples tell a model what you liked. They do not tell it why, and "in the same spirit" is too vague to steer anything: shown three dark, profane memes and asked for more in the same spirit, the first meme workflow produced wholesome observations about adulting. It had matched the format and missed the humour entirely.

A taste profile is the why, written down once. Every saved example goes to the strongest available model at full detail, with one job: describe what these share, in terms a writer could act on. The output is a short document with four parts — the **register** (voice, tone, edge, formatting habits), the **mechanisms** it can name in the examples, a **never** list of the humour the examples reject, and a set of imperative rules for writing a new one.

The mechanisms section is where it earns its place. Looking at seven saved memes, it named things like *bait-and-switch obscenity* (imply one mistake, reveal a worse one), *literal category error* (answering a figure of speech as an object — "no im an air fryer"), and *image as punchline* (a violent picture answering a mundane question). Those are not categories anyone supplied. They are the difference between "be funny like this" and "here are the moves that make this funny", and the second is something a writer can be held to.

Two practical rules follow. **Distil once, reuse on every run.** The profile is produced by a separate workflow run by hand, and the everyday workflow only reads the file, so the expensive step does not repeat five times a day and the voice stays consistent between runs. **Rerun it when the examples change.** The saved folder is the only place the person's taste is expressed; seven examples is thin, and adding more with different mechanisms sharpens the profile more than any edit to the writer's prompt would.

The profile does not replace examples. Two of them still go to the writer on every run, at high detail, for calibration of register and format. The profile says what the bar is; the examples show it being cleared.

## Related

- [Generate, then judge](generate-then-judge.md) — the profile is read by the writer as its brief and implicitly by the judge as its standard
- [Zero-shot and few-shot prompting](zero-and-few-shot-prompting.md) — the examples-as-spec problem this sits on top of
- [Voice is per channel, not per brand](voice-is-per-channel.md) — the same idea applied to writing: a voice is a set of named rules, not a vibe
