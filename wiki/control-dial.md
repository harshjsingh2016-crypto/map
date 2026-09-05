---
boards: [scalar/no-code-ai-bot]
updated: 2026-09-05
---

# The control dial

The axis that separates chatbot-building tools from one another, once you stop comparing
feature lists. There is only one question, and it is asked at runtime: **a user has just typed
something — what determines the next thing that happens?**

At one end the model determines it. You supply documents and instructions, and it composes
every reply from scratch. At the other end you determine it, step by step, and the path is
reviewed and approved before it is built. Everything in between is a matter of how many of the
branches you drew yourself.

Three tools sit along it. Dify is a knowledge-linked app builder — you supply documents and
instructions, the model composes every reply, and it is the fastest route to a working FAQ
bot. Botpress is an open-source flow builder — you draw the flow and decide which branches the
model is allowed to run. Voiceflow is a conversation-design tool — the conversation is
designed, reviewed and signed off before it is built.

## The choice is a risk assessment

The thesis worth carrying out of the comparison is that all three ship a working chatbot and
none of them is the good one. **The skill is matching the shape of the tool to the shape of
the risk.**

That reframes the selection problem entirely. It is not a capability comparison, where you
tally what each can do and take the longest list. It is a question of what a single wrong
sentence would cost, and which tool's shape absorbs that cost. A wrong sentence in an internal
Q&A bot costs someone thirty seconds of double-checking. A wrong sentence about a refund
percentage is a liability, and the shape that absorbs it is the one where that sentence was
never generated at all.

## The driver analogy

The clearest way in. You need to get from A to B in your city.

With the first tool you **give the driver the address and go to sleep**. A local driver of
fifteen years. You wake up at the destination — you don't know the route, the time taken or
the petrol spent, only that you arrived. No control, and the process is a black box.

With the second you **hand the driver a route map**: first left, second right, straight at the
roundabout. The driver still drives. You are not steering. But you decided the path.

With the third, **the family approves the route before the driver gets it**. Someone objects,
someone proposes a different turn, the route goes back for rework, and only the signed-off
version reaches the driver.

The detail the analogy gets right, and a feature table would miss: in all three cases the
driver still drives. The model generates in every one of them. What moves along the dial is
not how much AI is involved — it is how much of the route was decided before the model got the
wheel.

## Reliability improves along it, and the mechanism is surface area

Hallucination risk falls as you move toward the you-decide end, and it is worth being exact
about why, because the reason is not a better model. It is the same models underneath.

Every sentence the model is allowed to generate is a sentence that can come out wrong. Drawing
a branch removes generation from that branch, so it cannot fail in a new way — the text is
fixed and vetted. Nothing has made the model more reliable; it has been given fewer chances to
be unreliable. This is the same instinct as [grounding](grounding.md), moved up a level:
grounding restricts what the model may draw on, and the dial restricts where it is permitted
to speak at all.

The review step at the far end is a different kind of reduction and should not be filed with
the other two. It is a design-time check, not a runtime one. Drawing the flow reduces what the
model can say when a user is waiting; team review catches a badly designed conversation before
anyone builds it.

## Related

- [Delivery, not accuracy](delivery-not-accuracy.md) — the reframe that makes a chatbot the tool in the first place; the dial is how you then pick one
- [Grounding](grounding.md) — the same restriction instinct one level down, applied to what the model may read rather than where it may speak
- [AI safety failure modes](ai-safety-failure-modes.md) — hallucination is the failure the dial is trading against
- [Choosing a RAG tool](choosing-a-rag-tool.md) — the sibling selection rule, where the axis is the grounding surface rather than who decides the next step
