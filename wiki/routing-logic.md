---
boards: [scalar-2/agent-building-blocks]
updated: 2026-09-29
---

# Routing logic

An agent with more than one tool needs a way to decide which one a task gets, and that decision is
made by rules checked in order. Each tool carries a name and a rule, its description, and the agent
reads them top to bottom. **The first rule that matches wins.** A rule higher on the list therefore
overrides one lower down, even for tasks the lower rule was written for.

That gives routing two separate ways to go wrong, and they are worth keeping apart because they have
separate fixes: a rule that describes the wrong thing, and a sound rule sitting in the wrong place.

The teaching example was two tools and five tasks: four Phillips-head screws and one bolt, all about
two centimetres. The wrench came first, with the rule "if we need to work with big screws", and the
screwdriver second. Nothing says what a big screw is. If the agent decides two centimetres counts,
it takes the wrench to every screw as well as the bolt, and the screws are never tightened. The
description was fixed by making it say what the wrench is actually for, bolts, so a screw fails the
rule and falls through. The order was fixed by putting the screwdriver first. Either repair alone
helps; together they make the routing hold.

## Why a good description does not make order irrelevant

Descriptions overlap. A presentation generator and a dashboard generator both honestly match
"create a dashboard from this spreadsheet", because a presentation is a visual representation of
data too. Whichever sits first wins every such request. The durable fix uses both levers: put the
dashboard tool first, and write the distinction into the rules, so the word dashboard means one tool
and the word presentation the other. Order settles ties; descriptions stop them happening. A working
rule of thumb follows: the more specific tool goes above the more general one.

Nor does naming the tool inside the task help; it only moves the vagueness from the rule to the
request.

## Finding the order

There is no way to know the right order in advance. The method taught was empirical: build the
agent, run it against the range of requests real users send, and watch for the patterns where a
keyword lands on the wrong tool. Each such pattern means a description or an order needs adjusting.
With closely related tools a single word in a description can decide which one is picked, which is
why this tuning, and not the first build, is most of the work of making an agent reliable.

## What bad routing produces

A vague rule fails in one of two ways. The wrong tool fails, the agent observes the failure, thinks
again, and the same rule matches the same tool: an endless loop with memory and goal both intact.
Or the wrong tool half-works, the way a flat screwdriver or a knife sometimes turns a Phillips screw.
That improvisation, jugaad, is the harder of the two to catch, because the result looks like a
success. The remedy for both is the same: label the drawers precisely.

The most instructive case is the one where the agent knows the right tool and still cannot reach it.
With "general question, search" ranked above "live status, API", a question about whether the power
is back on right now matches both rules, goes to search, and may come back stale, while a live
source sits one rule lower, never consulted. The agent has no licence to reorder its own rules; order
is the mechanism.

## Related

- [Model Context Protocol](model-context-protocol.md) — an MCP server is a routing table; its descriptions and order are these rules
- [The four tool types](four-tool-types.md) — choosing the type of tool, the half of the decision routing then has to reach
- [Three ways agents fail](three-ways-agents-fail.md) — routing as a third cause of the endless loop, and jugaad's resemblance to an invented success
- [The agent loop](the-agent-loop.md) — why a failed tool is retried: Observe sends it back to Think, and Think routes the same way
- [Chatbot, workflow or agent](chatbot-workflow-or-agent.md) — an agent's routing is judgment; a workflow's branches are fixed in advance
