---
boards: [scalar/ai-reliability, scalar/ai-ecosystems, scalar-2/agent-building-blocks]
updated: 2026-09-29
---

# Context persistence

Filed under the prompt stack, at the system-prompt layer. The equation the class drew: **system prompt = persistent context** — it is the slot in the stack that holds what stays true across calls, as against the per-request parts that change every time.

A session boundary is a memory boundary. Open a new session and the model starts with none of what the last one established — the failure mode the class named as context loss when opening a new session.

A persistent sandbox is one answer: an environment that outlives the session, holding files and state the model can pick back up rather than being re-told. The distinction that matters is between what the model *remembers* (nothing, across sessions) and what it can *read back* (whatever the sandbox kept).

Products expose this as a first-class feature rather than a prompt field. Claude has Projects, where files and context are attached and carry across every conversation inside them; Cursor has rules files doing the same job for a codebase. Both are the system-prompt layer made durable and editable, which is the practical form of a persistent sandbox.

The ecosystem board later gave this a name and a shape: [persistent context architecture](persistent-context-architecture.md), which splits the durable material into behaviour (instructions) and facts (KB files) and treats the sandbox as the third, non-portable piece that reattaches both.

A session can also lose context without ending. When a conversation outgrows the model's context
window, it is compacted: summarised, with the summary replacing the transcript, the way one remembers
school without remembering the classes. That is serviceable for everyday use and costly for
anything where the texture matters; in research writing the tone is the first thing to go. Long
sessions can also cost more than expected, because some models charge a premium once a context
crosses a threshold. The defence against both is the one this article already points at, done by
hand: keep your own markdown handover files, so the conclusions that matter are written down by you
rather than left to a lossy summary. It is long-term memory kept deliberately.

## Related

- [Short-term and long-term memory](short-and-long-term-memory.md) — the same boundary from the agent side: what survives a session, and how it is fed back in
- [Persistent context architecture](persistent-context-architecture.md) — the same problem named as the amnesia problem, with its three-part answer
- [Next-word prediction](next-word-prediction.md) — why nothing persists in the model itself; patterns are frozen in weights
