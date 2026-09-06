---
boards: [scalar/no-code-ai-bot]
updated: 2026-09-06
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

One clarification keeps the picture honest: moving right rarely removes the model, it demotes
it. In a flow builder the branches are chosen by detected intent, and detecting intent is a
model call — so on the risky path the model is still deciding something. What shrank is the
size of the decision. Choosing which vetted text to return has a worst case the next message
corrects; composing a binding number has a worst case that arrives in a screenshot. The
mitigation is almost never removal, it is a smaller decision with a cheaper failure.

The property being traded is **variance, not capability**. A model asked for a figure it holds
is not unable to give it — it may give it, or may phrase it differently, on any particular run.
The instructor's image is a five-year-old who has been taught a nursery rhyme: the child knows
the song, and whether they sing it when a guest asks is a separate question. Scripted text has
no such gap between knowing and doing, which is the entire reason binding answers are moved
into it. Reliability questions of this kind are usually about consistency across runs rather
than about what the system can do.

The review step at the far end is a different kind of reduction and should not be filed with
the other two. It is a design-time check, not a runtime one. Drawing the flow reduces what the
model can say when a user is waiting; team review catches a badly designed conversation before
anyone builds it.

## Making the thesis operational: reader, sentence, org

"Match the shape of the tool to the shape of the risk" stays a slogan until the risks are
named. Three questions name them, and they are asked in order.

**The reader.** Can whoever receives this answer tell if it is wrong? This is the
[competent-reader test](competent-reader-test.md), and passing it is what makes the
model-decides end viable rather than reckless — fast to build, wide coverage, and a verifier
sitting downstream.

**The sentence.** Does any answer this bot gives commit the business to something? If yes, that
answer stops being generated and becomes scripted text. Note the unit: the question is asked of
answer *types*, not of products. The same bot can be safe describing a route and unsafe quoting
a cancellation slab, which is why a mixed build — autonomous for most of the conversation,
scripted for the few sentences that commit you — is the sensible shape rather than a
compromise. Choosing a tool per bot is what makes the decision feel like a ranking; choosing per
answer type makes it a design.

**The org.** Who has to say yes before this ships? If the honest answer is "just me", the
review-and-approval end buys nothing and costs money. If it is the founder, CX and marketing,
it buys the one thing the other options do not offer.

Three different questions, three different rows — which is also why comparing the tools on any
single criterion always picks the most elaborate one, and always picks wrong.

## Each end has its own ceiling

None of the three positions is free, and the costs are not the same kind.

At the model-decides end, prompt fixes are reactive and do not converge: every rule is written
against a failure already seen. In the middle, control means node handling — you own every
branch, and each new edge case is another branch to draw and maintain, which is a cost paid
continuously rather than once. At the reviewed end, the review loop and the price are both real:
it is the most expensive of the options and the one whose free tier runs out fastest, which is
worth remembering precisely because it is also the one that demonstrates best.

## What these tools are not

Two boundaries worth holding, because both come up constantly in the same conversations.

**They are not general workflow automation.** Node-based automation platforms look nearly
identical on screen — a canvas, nodes, connections — and the difference is what they are shaped
for. Email and marketing automation belongs in the automation platform; a conversation belongs
in these.

**They are not the model.** A model provider is the LLM layer, and can sit underneath any of
these as the API endpoint. What the tools supply is the knowledge base, the routing between
steps, and the integration surface that puts the result on a channel. The model is a component
of the product, not the product — which is also why "can I just build this in [model X]?"
answers itself once the question is which layer you mean.

## Related

- [Delivery, not accuracy](delivery-not-accuracy.md) — the reframe that makes a chatbot the tool in the first place; the dial is how you then pick one
- [Grounding](grounding.md) — the same restriction instinct one level down, applied to what the model may read rather than where it may speak
- [AI safety failure modes](ai-safety-failure-modes.md) — hallucination is the failure the dial is trading against
- [Botpress](botpress.md) — the middle of the dial, where the branch you draw is the branch the model cannot rephrase
- [Choosing a RAG tool](choosing-a-rag-tool.md) — the sibling selection rule, where the axis is the grounding surface rather than who decides the next step
