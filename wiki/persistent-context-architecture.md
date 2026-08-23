---
boards: [scalar/ai-ecosystems]
updated: 2026-08-24
---

# Persistent context architecture

The answer to the **amnesia problem** — memory is not permanent across users, so each
session starts from nothing the last one established. Anything that must survive the
session boundary has to be held outside the model and reloaded into it.

The architecture splits that held material in two. **System instructions** carry
behaviour: role, tone, standing rules, how the assistant is to act. **KB files** carry
facts: the specific situation, documents, data the assistant is meant to know about. They
reload the same way and sit in the same reconstructed context, but they answer different
questions — one is how to behave, the other is what is true. Keeping them apart is the
same discipline as single responsibility in [SOLID](https://en.wikipedia.org/wiki/SOLID):
each piece has one reason to change, so editing the persona does not disturb the facts and
adding a document does not rewrite the behaviour.

The third piece is the **persistent sandbox** — the product surface that stores both and
reattaches them to every conversation. Instructions and KB files are portable; the sandbox
is not. Moving between tools means rebuilding the wrapper, never the content, which is why
the content is worth keeping in a form the wrapper does not own.

## Related

- [Context persistence](context-persistence.md) — the same problem seen from the prompt stack's system-prompt layer
- [Persistent sandbox tools](persistent-sandbox-tools.md) — the consumer products that implement the sandbox
- [RAG](rag.md) — how a KB file's relevant part actually reaches the prompt
- [The prompt stack](prompt-stack.md) — the layer instructions occupy, and its lifetime
