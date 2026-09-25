---
boards: [scalar-2/ai-agent-concepts]
updated: 2026-09-25
---

# The three pillars of an agent

An agent stands on three pillars: tools, memory and autonomy. Miss any one and the agent fails,
and the useful part is that each one fails in a way you can recognise from the outside.

**Tools** are its hands: the phone line, the records lookup, anything it can reach and act on,
whether a spreadsheet, a chat channel or a weather service. Without them an agent is as good as a
chatbot. Switched off in the newsroom simulation, it answered the fire tip by saying it had no
real-time information and did not know who to call. **The tell is that it cannot act.**

**Memory** is its notebook: who it has already called and what they said, the task and the result.
Switched off, it called the fire department, got an answer, and with no record of the call rang the
same line again, and again. Three identical calls, no new information, a confused press officer.
The class gave it a film's name, Ghajini, after the hero who cannot form new memories and tattoos
reminders on himself. **The tell is that it repeats itself.**

**Autonomy** is its judgment: deciding on its own that one source is not enough, and deciding
whether the next step should run at all. Switched off, it made one call, heard that the cause was
under investigation, and stopped to ask whether it should check with the fire captain too. Not
because it judged the answer sufficient, but because it was not allowed to judge anything. Tools
and memory intact, it was a chatbot wearing an agent badge. **The tell is that it asks you.**

With all three on, the same tip produced a call to the fire department, a second confirmation from
the officer on scene, and a two-line verified brief, with nobody re-prompting along the way.

The tells make diagnosis a matter of elimination. An agent that calls the same line twice with the
same question has shown it has tools, because it called, and autonomy, because it called again
without being told to. What it lacks is memory. Reading the pillars off the behaviour is more
reliable than guessing at the cause.

## Autonomy is bounded by safe

The definition that matters is that autonomy means the agent will not wait for your response; it
will perform the actions it considers *safe*. That qualifier is the whole design problem.
Escalation has to stop somewhere: from the library to the city council is sensible, from there to
parliament and the head of government is absurd, and a good agent should refuse, the way it should
refuse an instruction to delete an entire repository. Autonomy without that boundary is not more
capable, only less predictable, which is why guardrails are named alongside it rather than after
it.

The strongest guardrail is one the agent cannot cross rather than one it is asked to respect. The
instructor's own setup is the example: his coding agent runs with its permission checks skipped,
free to do whatever it decides, but it is never connected to the production VPN. The free rein only
ever reaches the development environment, because the boundary lives in what the agent can reach,
not in an instruction it might reason its way past.

Well-built agent products go a step further and make the worst action reversible. Asked to tidy a
cloud drive, an agent can be told to send deletions to the bin rather than delete outright, so it
keeps its free rein while every mistake stays recoverable for weeks. The alternative lever is to
have it confirm each deletion, which buys control by giving back some of the autonomy.

## Memory is a store, not the prompt

Memory is easy to confuse with the context window, and they are different things. The context
window is what is sent in the prompt, measured in tokens. Memory is a separate store the agent
maintains and writes its observations to, something closer to a spreadsheet or a document. It holds
results and standing instructions both: tell it not to call anyone, and that instruction persists.

Memory is also not free with the model. The agent writes it, but only where the platform gives it
somewhere to write; in a workflow tool, an agent with no memory attached has none.

## Where the pillars live in real tools

The same three pillars sit in different places depending on the product, and knowing where each one
lives is most of knowing how to use it.

In the n8n AI Agent node they are literal: three ports under the node, one each for the chat model,
the memory and the tools. The chat model is where the judgment comes from, and it decides how well
the agent performs; a weak model will spoil things however well the rest is wired. The memory port
takes a simple store to begin with, and left empty, the agent has none. The tools port takes
connectors and custom calls, and with nothing plugged in the node is just a model with a longer
name.

In Claude, the agent is Claude and the tools are connectors switched on per chat, and memory can
arrive with the tool rather than live in the agent. A meal-planning connector held the user's
preferences; asked directly, Claude knew nothing about them, and asked through the connector, it
returned the full profile. Memory, in other words, is a property of the whole system, not
necessarily of the model at its centre.

In ChatGPT's Deep Research, the pillar on show is the thinking: the plan is presented before the run
and can be edited, and an activity panel lists every step afterwards. One demonstrated run used no
web search at all and was still unmistakably an agent, because it looped. The same product with
nothing switched on makes no calls and is a chatbot. What changed between the two is not the
model's intelligence but the architecture around it.

## Where MCP fits

Tools reach the agent through connections, and the one that keeps coming up is MCP, the Model
Context Protocol, introduced here only at the level of what it is. An API is a single ticket:
request, response, done, and doing many things means one API per operation with authentication for
each. MCP is a continuous bridge between the agent and a product, over which the agent can perform
many operations while the bridge holds what is and is not allowed. An agent asked for tax-saving
ideas over an accountancy product's MCP connection fetches the year's financials, decides that is
not enough, and goes back for the investments before it answers: the loop, running over one
connection. An API gateway is unrelated despite the name, a piece of architecture between front end
and back end that handles rate limiting and data protection. Building MCP connections is left to a
later class.

## Related

- [The agent loop](the-agent-loop.md) — tools are what Act runs on, memory is what lets Observe build on the last round
- [AI agents vs Agentic AI](ai-agents-vs-agentic-ai.md) — the earlier brain, tools, memory and guardrails framing these pillars refine
- [Right-sizing the model](right-sizing-the-model.md) — the chat model port is where sizing decides how the agent performs
- [Context persistence](context-persistence.md) — the prompt-side view of what survives between calls, as against an agent's own memory store
- [The LLM chain and the agent node](llm-chain-vs-agent.md) — an agent is only as good as its tools, seen from the workflow side
