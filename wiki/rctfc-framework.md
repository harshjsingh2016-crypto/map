---
boards: [scalar/prompt-engineering]
updated: 2026-08-21
---

# RCTFC Framework

Five things a prompt can fix instead of leaving to the model: Role, Context, Task, Format, Constraints. A bare ask like "Summarize this meeting" specifies none of them — the model picks all five for you.

The T20 meeting-minutes exercise showed what specifying them buys. The RCTFC version named the role (meeting note-taker), the context (analyst circulating minutes after a weekly sync, attendees spanning engineering, ops and sales), the task (minutes people who missed the call can act on), the format (decisions, action items with owner and deadline, open questions) and the constraints (word cap, no invented details, no filler). Same input, same model — the difference sat entirely in the prompt. The specified version pulled action items into a table with a "Blocked By" column a bare ask never produces, and added a Risks section for things the meeting worried about but did not decide: raised, but with no owner and no due date.

Format deserves its own gloss: output formatting means naming the exact fields, headers or keys the response must carry — the same move as specifying a query's output columns. Especially useful when JSON output is required — the keys are the contract.

The five don't all live in the same place. Role, Context, Format and Constraints are baked into the system prompt — they describe the job, and the job is stable. The Task is what keeps changing, arriving as the user prompt. The split is the boundary between what you set once and what the caller supplies every time.

Two things about constraints worth keeping:

- A word limit is a [cost lever](prompt-costs.md), not just a style one — it caps the expensive side of the bill.
- Constraints can contradict the task. A word cap on an output that genuinely needs more words forces the model to choose which instruction to break. Watch for the contradiction rather than stacking constraints reflexively.

## Related

- [Prompt costs](prompt-costs.md) — why spending input tokens to narrow output pays
- [Zero-shot and few-shot prompting](zero-and-few-shot-prompting.md) — examples as an alternative way to pin down format
- [Iterative prompt refinement](iterative-prompt-refinement.md) — how a prompt like V2 actually gets written
