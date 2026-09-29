---
boards: [scalar-2/agent-building-blocks]
updated: 2026-09-29
---

# Short-term and long-term memory

An agent's memory comes in two kinds, and they answer different questions. Short-term memory is a
scratchpad for the current run: what has already been checked this session, so the sixth task does
not repeat the second task's phone call. It is gone when the session ends. Long-term memory is a
notebook that survives: a verified address, a source that proved reliable, a figure that rarely
changes, so tomorrow does not start from nothing on questions already settled.

The line between them is not importance but role. **The conclusion goes to long-term memory; the
ways of reaching it stay in short-term.** In the newsroom example, the calls to the fire department
and to the fire captain are short-term; "the fire is confirmed" is long-term. Two days later, asked
the same question in a new session, an agent with long-term memory answers from the conclusion and
one without it starts making the calls again. Not every conclusion earns a place, though: a trivial
sum stays in the scratchpad, and only something that carries weight in later reasoning is kept. The
agent makes that retention decision itself.

The familiar pictures fit. Short-term memory is RAM, quick and volatile; long-term memory is the
disk. Or the film hero who forgets everything every few hours and tattoos what matters on himself:
the tattoos are the long-term store, and in practice that store is often literally a markdown file
of saved facts. In a chat assistant, short-term memory is the current conversation, which a new chat
cannot see, and long-term memory is the profile it keeps about you on its own.

## Diagnosing which one is missing

Repetition is the tell, and the time boundary it crosses says which memory failed. An agent that
repeats an action within one session has no working short-term memory. An agent that never repeats
itself within a morning but re-verifies the same address on three separate mornings has short-term
memory and lacks long-term. The class split evenly on exactly that case, which is why the boundary
is worth checking before naming the cause.

## How memory reaches the model

Memory is a store kept by the platform, not something inside the model. For each call, the relevant
parts are retrieved from the store, by search over it, and placed into the prompt; that is the only
way they reach the model. Two consequences follow. Swapping one model for another mid-conversation
keeps the memory, because the memory was never in either model. And memory has a running cost:
whatever is retrieved is sent, and paid for, on every call.

## Memory that steers

Long-term memory is not neutral storage. Because it is added to every answer, it pulls answers
toward what the user has shown interest in before, and an assistant inclined to please will lean
further that way. A career reading shaped by past searches, or a favourable view of a venture the
user had asked about before, is memory doing exactly what it was built to do. When an answer should
not be steered by that history, a temporary chat, which leaves long-term memory out, is the tool.

## Related

- [The three pillars of an agent](three-pillars-of-an-agent.md) — memory as one pillar; this is its inside
- [Context persistence](context-persistence.md) — the same session boundary seen from the prompt side
- [The agent loop](the-agent-loop.md) — the repeat-means-it-forgot trap, now split by which memory forgot
- [Three ways agents fail](three-ways-agents-fail.md) — missing memory as the first cause of the endless loop
