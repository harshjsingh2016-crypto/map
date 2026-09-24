---
boards: [scalar/n8n-automation, scalar-2/ai-agent-concepts]
updated: 2026-09-24
---

# The LLM chain and the agent node

Workflow tools offer two different ways to put a model in a flow, and picking the heavier one by
default is a common and expensive mistake.

A **basic LLM chain** is the plain case: it sends a prompt and returns a response. It does not
chain thought and it will never trigger a tool to go and find information. Whatever it can answer,
it answers from the prompt and its own weights, in one pass.

An **agent** node uses the model *and* tools — other software, connected services, MCP servers — to
complete a task. It chains its reasoning, asks itself multiple questions, and goes out to multiple
tools before it settles on an answer.

The rule for choosing is about the shape of the work, not its difficulty. A linear question that
resolves to an answer is a chain. A task that needs lookups or actions before an answer exists is
an agent.

Reaching for the agent when the work is linear is not merely unnecessary — it makes the result
worse. The agent will try to go to multiple tools, and on a question that needs none of them, that
does not help. You pay in latency, in cost, and in unpredictability for a reasoning loop with
nothing to reason about. The instinct to start with the more capable node is the wrong instinct
here; capability you do not need is behaviour you did not ask for.

## What the two cases actually divide on

Two simulated messages to a hotel bot make the boundary concrete, and they fail for different
reasons.

A guest asks what time they need to check out. The chain, running a be-helpful prompt, **invents a
plausible time** — it has no way to look anything up, so it is confident, unreliable and
occasionally wrong; and if the guest sounded annoyed it might offer a later time as appeasement. The
agent reads the booking reference from the session, calls the booking tool once, and answers with
what the booking says — then offers to *arrange* a late checkout rather than granting one.

The second guest asserts they were promised a discount and asks for it to be applied. The chain
agrees, **because agreeing is what helpful-sounding text looks like** — it is not evaluating the
claim and concluding it is true. The agent's rules are explicit that discounts are never its to
decide, so it routes the request to a human and tells the guest so.

The first is a **lookup** problem: the system does not know and cannot find out. Tools fix that. The
second is an **authority** problem: knowing the answer would not help, because the decision is not
the system's to make. Only explicit rules fix that, and an agent with excellent tools and no sense
of what is out of scope is the chain's failure with more steps. Hence the line worth carrying:
*an agent is as good as how well it identifies these situations.*

Underneath both sits the reason this matters more than a wrong answer usually does. What these
systems emit is frequently a **commitment** — a checkout time, a discount, a policy — made to a
customer in the company's name. "Now you cannot take that word back." A hallucination in a draft is
an editing problem; a hallucination in a reply is something somebody now has to honour or retract.

## What makes something an agent, and what it costs

The concepts lecture put the same boundary in general terms. A chatbot answers the one thing asked,
from what it already knows, in a single turn, and waits. An agent takes a goal, works out its own
steps, acts to check its work, and keeps going until the goal is met. What separates them is not
the quality or length of the output: a long, detailed answer is still one turn. *An agent is
defined by its repetitive nature* — the loop is the whole difference.

That makes "agent" a mode rather than a product. ChatGPT is reactive by default and becomes an
agent when Deep Research or connectors are switched on. And no system prompt can promote a chain
into an agent on its own: the model can propose steps, but repeating on them needs tooling and a
loop around the model. Without tools the loop has nothing to act with — an agent is only as good
as its tools, which is the lookup problem above from the other side.

The agent is also a different thing from a workflow, even one with a model in it. A workflow is
guaranteed: the millionth run still sends the email. An agent re-decides on every run and may take
a different route next time; a well-structured prompt narrows that variance but does not remove it.
The choice is predictability against adaptability, and most automation wants the first.

The loop has a price in both currencies: more calls means more money, and every extra pass means a
slower answer. Adding an agent everywhere does not make a system smarter, which is why well-built
agents cap their own steps. The case where the loop earns its cost is work like coding, where a
chatbot would have to ask permission for every name and signature and an agent can show its plan
once and proceed.

## Related

- [AI agents vs Agentic AI](ai-agents-vs-agentic-ai.md) — what the agent node is a packaged instance of
- [Reactive vs proactive AI](reactive-vs-proactive-ai.md) — the loop that separates the two, stated as waiting versus pursuing a goal
- [Chain of thought](chain-of-thought.md) — the reasoning behaviour the chain node deliberately lacks
- [Building a workflow three nodes at a time](iterative-workflow-building.md) — the AI step in the starting three is usually the chain
- [Use the model for what only a model can do](what-only-an-llm-can-do.md) — the decision above this one: whether a model belongs here at all
- [Classifying input you do not control](classifying-untrusted-input.md) — the other place a system must not take the submitter's word for something
