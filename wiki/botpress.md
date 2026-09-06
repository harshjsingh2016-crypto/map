---
boards: [scalar/no-code-ai-bot]
updated: 2026-09-05
---

# Botpress

An open-source platform for building AI agents on a visual canvas. You lay out nodes and cards
that define the conversation's path, and the same build deploys to many channels — webchat,
Telegram, WhatsApp — at once.

Its position on the [control dial](control-dial.md) is the middle: you decide, node by node,
where the model gets to improvise and where the bot follows your script exactly. What changes
against a linear tool like [Dify](dify.md) is one thing — the flow can branch — and everything
useful about it follows from that, because a branch is a place to put text the model never
touches.

## Standard nodes and autonomous nodes

The distinction that carries the tool. A **standard node** holds cards and is a script: it runs
the cards you put in it, in the order you put them, and does nothing else. A card can be text,
an image, executed code, generated content, a page fetch, a capture-information step or an
insert-record step.

An **autonomous node** is a small agent. It contains an embedded LLM you can query, and — the
part that matters — **exit conditions**. The exit conditions are what make the flow non-linear.

Mixing the two on one canvas is the whole proposition. Every branch you draw yourself is a
branch the model cannot rephrase; every stretch you leave autonomous is a stretch you did not
have to specify.

Two supporting pieces are easy to underrate. **Tables** give the bot built-in persistence —
typed columns, rows written from a node — which is what turns a question-answering surface into
a data-capture instrument. An instruction to collect a contact detail is only worth writing if
there is somewhere for the answer to land. And **variables** carry a card's result forward
(`workflow.phone_number`) for a later node to read; phone numbers want a string column, since a
numeric one cannot hold a leading `+91`.

## Forbidding the model from the expensive topics

The system prompt used is the linear tool's prompt plus a single line: if the question is about
a refund, a cancellation or an angry customer, a separate flow handles it — **do not respond**.

That line is the architecture. Not *be careful*, not *quote exactly* — the model is excluded
from the topics that carry money and liability. Where an instruction to handle refunds
correctly produced vague compliance, an instruction that refunds are not the model's job
produces a routing decision.

The branch it routes to holds a plain text card with the exact figures typed into it. That text
is not generated. It is written once by a human and returned verbatim every time, and it cannot
be paraphrased because nothing is composing it. This is the structural answer to a model
blurring a binding number into a vague quantifier — the failure that motivates the whole tool.

A second branch shows the same upgrade applied to escalation. Where a prompt could only promise
to fetch a human, a flow can de-escalate, capture a phone number into a variable, and write it
into an "angry clients" table — a promise turned into a mechanism that leaves a row behind for
someone to act on.

## The model is demoted, not removed

Worth being precise, because "deterministic branch" invites the wrong picture. Exit conditions
are declared as detected **intent**, and intent detection is itself a model call: the LLM
classifies what the user wants and picks the exit. The model is still in the loop on the risky
path.

What changed is the size of its job. It has been demoted from *composing the answer* to
*choosing the branch* — and the failure modes of those two jobs are not comparable. A misroute
sends someone to the wrong text card, which the next message corrects. A mis-composed refund
percentage arrives in a screenshot.

This is the general shape of the mitigation: you rarely take the model out, you give it a
smaller decision with a cheaper worst case.

## The embed is the deliverable

Publishing gives a script tag, and that tag is the whole integration. A static page and the
hosted agent share no code, no build and no deployment — which makes the agent portable in a way
that is easy to underrate. The same bot drops onto any page, on any site, without integration
work, and "one build, many channels" is that property stated for messaging platforms rather than
for web pages.

The practical consequence is that the embed snippet, not the bot's internals, is what you hand
over.

## Related

- [The control dial](control-dial.md) — where Botpress sits, and why the branch is the whole difference
- [Dify](dify.md) — the linear tool this is answering, and the failure it answers
- [The competent-reader test](competent-reader-test.md) — why the binding answers are the ones that get scripted
