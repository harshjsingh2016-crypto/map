---
boards: [scalar/ai-reliability]
updated: 2026-08-21
---

# Context persistence

Filed under the prompt stack, at the system-prompt layer. The equation the class drew: **system prompt = persistent context** — it is the slot in the stack that holds what stays true across calls, as against the per-request parts that change every time.

A session boundary is a memory boundary. Open a new session and the model starts with none of what the last one established — the failure mode the class named as context loss when opening a new session.

A persistent sandbox is one answer: an environment that outlives the session, holding files and state the model can pick back up rather than being re-told. The distinction that matters is between what the model *remembers* (nothing, across sessions) and what it can *read back* (whatever the sandbox kept).

Products expose this as a first-class feature rather than a prompt field. Claude has Projects, where files and context are attached and carry across every conversation inside them; Cursor has rules files doing the same job for a codebase. Both are the system-prompt layer made durable and editable, which is the practical form of a persistent sandbox.

## Related

- [Next-word prediction](next-word-prediction.md) — why nothing persists in the model itself; patterns are frozen in weights
