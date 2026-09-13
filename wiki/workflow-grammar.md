---
boards: [scalar/workflow-automation]
updated: 2026-09-13
---

# The workflow grammar

Three words describe any automation, whatever tool draws it: **trigger, condition, action**. What
starts it, what decides which path the data takes, what happens as a result. A canvas is the
surface it is drawn on, and the reading rule is that data flows left to right, one node at a time —
something happens, something gets done.

The reason to learn the words rather than the interface is stated plainly in the class: *you'll
forget which menu had which icon, you won't forget three words*. Node types belong to a particular
product's palette and change when the product does. Trigger, condition and action are properties of
workflows, so they survive the tool — which is why the same three slots are also what the
automation screen asks you to fill in before opening anything.

A second list sits alongside the first and is easy to mistake for a contradiction: the **node
types** you place on a canvas are a trigger node, an AI/LLM node, and a condition node. That is not
a rival account of the same three things. One list names the parts of a workflow, the other names
the pieces a tool gives you to build them with, and a set of class notes writing "Trigger, Node,
Action" on one page and "Trigger, Condition, Action" on another is recording both rather than
disagreeing with itself.

The trigger node is glossed as an accelerator pedal — the moment your foot goes down, the car moves.
The AI node gets the least glamorous description available and the most useful one: **just another
node, text in, text out, nothing magic.**

## Normalisation is the model's actual job

The sharpest idea in the material, and it answers a fair objection: if a workflow triggered by a
clock needs no intelligence, where does a model belong at all?

**The trigger is usually mechanical. The condition is where language defeats rules.** Routing a
message as a bulk enquiry rather than an individual one cannot be done by matching phrasings,
because the phrasings are unbounded — *booking for fifteen people*, *for my college friends*, *for
my colleagues*. The instructor's form of it: *will I be able to create all the possible rules in the
world? No. That's why you need LLM.*

So the model's job is **normalisation**: convert unbounded human phrasing into **one of a small set
of known values**, so an ordinary comparison can route on it. This is much narrower than adding AI
to a workflow, and the narrowness is what makes it usable. **The model is not making the decision.**
It collapses an infinite input space onto a finite one, and a dumb IF does the routing afterwards.

It also explains a detail from the scenario that would otherwise look like a contradiction of the
screening criteria. Bulk versus small is a **stable rule** — it passes rule clarity — and it is not
**computable** from any field in the message. Rule clarity asks for consistency, not arithmetic, and
the gap between the two is precisely the slot a model fills.

**A test follows from this, though the lecture does not state it.** If the model's job is
normalisation, you are not testing whether it was *right*; you are testing whether it **returned one
of your known values**. A response outside the set is a failure the workflow can detect by itself. A
response inside the set but wrong is a routing error that only shows up downstream. Those are
different failures with different costs, and only the first is catchable at the point it happens.

## The grammar outside a canvas

The claim that these words belong to workflows rather than to one product is testable, and the
lecture tests it with an automation built on a phone rather than a canvas at all: a voice command
dictates text, the text goes to a model's endpoint, the reply comes back and is sent on a messaging
app. Trigger is the dictation, action is the send. The grammar holds with no canvas anywhere.

What the same example shows is that **the three words are not a checklist where all three must
appear**. That shortcut has no condition — it is a straight line, every step runs every time,
nothing branches. A workflow with nothing to decide is still a workflow. It also places the model in
the *action* rather than the condition, which is the first extension below arriving in practice
before it is stated.

The detail worth carrying is the step list. Of ten steps, one dictates, one names the endpoint, two
fire and parse the request, one displays and one sends — and **four walk down the nested response to
extract a single field**. Over half the automation is not calling a model; it is digging a string
out of JSON. Those four steps do not vanish on a canvas. A node does them for you invisibly, hands
you clean text, and the work still happened. That is the entire reason a course on visual workflow
tools spends a section on HTTP: the abstraction is doing something real, and knowing what it hides
is what lets you debug it on the day it hands you nothing.

## A grammar, not a template

Two extensions keep the three words from hardening into a shape. A model can sit **in the action**
as well as the condition — processing something that in turn starts a further chain. And a workflow
can run trigger → condition → action → condition → action for as long as the job needs.

The deliberately dull worked example is a clock striking five, a check on whether the manager is
looking, and two branches: leave, or stay another hour. Its value is having no domain content to
distract from the structure, and it carries one thing worth noticing — **both branches are actions**.
The condition selects between two outcomes rather than gating one against nothing, which is the same
shape as a routing sketch where "ignore" is a branch rather than an absence.

## Related

- [When to automate](when-to-automate.md) — the same three words used as a test before anything is built
- [The control dial](control-dial.md) — the neighbouring question of how much the model gets to decide once it is in the flow
- [RCTFC Framework](rctfc-framework.md) — what to put in the AI node's system prompt once its job is defined
- [Delivery, not accuracy](delivery-not-accuracy.md) — why a mechanical trigger is worth more than a better answer when latency is the failure
