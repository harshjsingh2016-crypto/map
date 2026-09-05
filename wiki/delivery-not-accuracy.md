---
boards: [scalar/no-code-ai-bot]
updated: 2026-09-05
---

# Delivery, not accuracy

The reframe that makes a chatbot the right tool rather than a better prompt.

Most work on an LLM optimises for one thing: getting a correct answer out of it. Prompt
structure, grounding, retrieval and the generation dials all serve that. For a whole class of
business problems, though, accuracy is already solved before anyone opens a model. A travel
agency knows its refund slab. It knows its package prices. Nobody needs a cleverer prompt to
discover what is already written down.

What is not solved is **delivery**: who asks, when they ask, and on which channel. And a late
answer is a lost customer even when it is a correct one — which makes speed a correctness
property rather than a nice-to-have. Stated as a deadline instead of a channel problem, the
requirement is not correct-and-complete but correct, complete and *in time*.

The clean way to hold the two apart: a prompt improves the answer, a bot improves its arrival.

## Three properties that make inbound worth automating

Not every stream of questions repays a bot. Three properties, together, are what make one
worth building — and they generalise well past any one company.

**It repeats.** A small set of questions covers most of the volume. Repetition is what lets
the answer be pre-written; without it there is nothing to pre-write.

**It is scattered.** The questions arrive across several channels with no single inbox, so no
human is watching everywhere at once. This is the property that makes the problem structural
rather than a matter of attention.

**It arrives off-hours.** The gap between question and answer exists because nobody is awake,
and no amount of hiring closes a gap that opens when the business is closed.

The three are worth checking in order before proposing a bot at all. A stream that fails the
first one wants better documentation; a stream that fails the second wants a shared inbox.

## The scope rule

The bot does not have to answer everything. It has to absorb the recurring majority plus the
obvious cases, and hand the rest to a human.

This is a design constraint rather than a limitation to apologise for, and it is the one most
first-time builders get wrong. Aiming at total coverage is precisely what produces a bot that
invents answers at the edges — the boundary where the model has no grounded material and
generates anyway. Deciding in advance what the bot refuses is the same decision as deciding
what it can be trusted on.

## Related

- [AI agents vs Agentic AI](ai-agents-vs-agentic-ai.md) — what the thing being deployed actually is, once delivery is the goal
- [Problem discovery frame](problem-discovery-frame.md) — the same instinct applied earlier: fix the problem statement before reaching for a tool
- [Grounding](grounding.md) — the mechanism behind the scope rule; a bot that must answer everything cannot stay fenced
