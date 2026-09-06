---
boards: [scalar/no-code-ai-bot]
updated: 2026-09-06
---

# Voiceflow

A collaborative platform for designing, prototyping and launching conversational agents, chat
and voice. You build on a visual canvas of blocks — messages, choices, conditions, API calls,
AI steps, knowledge-base queries — and the distinguishing feature is not the canvas. It is that
the canvas is **a document a whole team can read**: designers, product managers, CX leads and
engineers working on the same artifact. That is why the tool appears in conversation-designer
and voice-interface job descriptions rather than developer ones.

## It answers a different problem, not a harder one

Worth stating plainly, because the sequence invites the wrong reading. A flow builder arrives to
fix a specific failure — a model paraphrasing a binding number. Voiceflow does not arrive to fix
a failure of the flow builder. A new problem turns up: onboarding twenty seasonal freelance
guides who need the same explanations and the same FAQ every year.

Two properties of that problem decide the tool. The users are **internal and competent** — by
the [competent-reader test](competent-reader-test.md) even the least controlled option would
have been safe, so reliability is not the reason. And they are **on bad networks**, standing at
a trekking point rather than sitting at a form, which points at voice.

The differentiator is organisational rather than technical. A flow builder already had a canvas.
What is new is that the artifact is legible to someone who knows nothing about AI.

## Playbooks

The unit of configuration. A playbook is a **plain-prose document** holding the questions to ask
first, the deliverables to produce, the tools it may use, and the conditions under which it
hands off to another playbook. One paragraph of description generated six of them, unasked.

Two definitions are worth keeping because they answer different questions. *A system prompt for
the platform — not just the system prompt but everything the platform will do* says what a
playbook **is**: instructions in natural language. *A function-based role description* says how
to **scope** one: written per job, not per topic.

A playbook can hand off to another, and that handoff is what replaces node-drawing. Complaints
go to the complaints playbook; nothing is wired. The canvas survives but is thin — drop a
playbook block on it, connect the start, and configure by editing prose.

## Same decision, different medium

This is the connection back to the [control dial](control-dial.md), and the most useful thing to
take from the tool.

A flow builder raises control by making you **draw** the branches. Voiceflow keeps that control
and changes the **medium**: the routing one expresses as an exit condition on a canvas, the
other expresses as a sentence inside a prose document. Same architectural decision, written in a
form a non-engineer can read and argue with.

The phrase that carries the value is *before build effort is spent*. A working prototype proves
the thing works; it does not help anyone discover that the wrong thing was built. Review only
saves anything when it sits upstream of the build, which is why this is a design-time property
and not a runtime one.

The demonstration is the proof. Run the agent, let it ask its opening questions, then ask how
anyone would find out what happens next. The answer is *go read the playbook* — where the flow
builder's answer is *trace the canvas*, which a marketing lead cannot do.

## Agent level and playbook level

Tools — knowledge base, buttons, cards, web search, and later APIs, functions and MCP — toggle
at two levels, and the inheritance runs one way: **a tool enabled at the agent level cannot be
disabled inside an individual playbook.** Turn it off at the agent first, and each playbook can
then enable or disable it independently.

Read that as a permissions model rather than a convenience: the agent level is a floor, not a
default. The safe habit follows — off at the agent, on per playbook — which is least privilege
applied to tool access. Backwards, and a playbook searches the web when you believed you had
disabled it. What it buys is genuine variation: some playbooks with web search, some without,
some carrying API tools the others cannot reach.

## Cost

The credits expire and exhaust faster than expected, and of the three tools this is the one
named as the most expensive. Its free tier is small enough that ordinary prototyping runs
through it.

## Related

- [The control dial](control-dial.md) — the far end, where the route is approved before the driver gets it
- [Botpress](botpress.md) — the same control expressed as a drawn canvas rather than prose
- [The competent-reader test](competent-reader-test.md) — why reliability is not what selects this tool
- [Free-tier arithmetic](free-tier-arithmetic.md) — the cost side of choosing the most reviewable option
