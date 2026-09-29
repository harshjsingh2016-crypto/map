---
boards: [scalar-2/ai-agent-concepts, scalar-2/agent-building-blocks]
updated: 2026-09-29
---

# Model Context Protocol

MCP, the Model Context Protocol, introduced by Anthropic at the end of 2024, is one shared, standard
way for any agent to plug into any outside tool, in place of a custom-built connection for every
pairing of agent and tool. The useful way to hold it is as **the agreed shape of the plug, not the
tool itself**. The comparison offered was USB-C: one connector for power, data, display and audio,
agreed by every vendor, so that nobody carries a bag of adapters any more.

## What it replaces

An API is a single ticket: a request, a response, done. Doing many things through APIs means one
API per operation, each with its own authentication, and every agent wired to every tool it uses.
Two agents and three tools make six connections to build and keep working; in general the count is
agents times tools. Put an MCP server in the middle and each agent makes one connection, to the
server, which holds the connections to the tools. The count becomes agents plus tools, and adding a
fourth tool means connecting it to the server and describing it. No agent changes.

The house phone number was the picture: instead of everyone's personal numbers, one number for the
house, which tells a caller who lives there and what each is good at, and brings the right person to
the same phone. Over that one connection an agent can do many things in turn. Asked for tax-saving
ideas through an accounting product's MCP connection, an agent fetched the year's financials, judged
them insufficient, and went back for the investments before answering: the agent loop, running over
a single connection.

For a no-code builder this is most of the value. Configuring APIs by hand is heavy and fragile; one
wrong parameter and the call fails. The tool's own MCP server has already done that work, and what
is left is the connection.

## What is inside the server

A server is a list of tools, each with a name and a description written for the agent. A mail server
might offer *send email* and *read email*; the names are obvious to a person and not to a model, so
each carries a rule saying when to use it. Told to send an email to someone, the agent reads the list
and picks. It no longer needs to know any API's address or logic; the server calls the API.

That makes a server a routing table, and everything about routing applies: descriptions must be
accurate, order matters where they overlap, and both are the builder's to write. Rules can even be
conditional on which other tool was used. The difference from an API specification file is the
reader: a specification helps a developer configure an API, where MCP descriptions exist so the
agent can choose.

## What it is not

- **Not smart.** It is a phone menu: it lists the options and the caller chooses. The server passes
  names, descriptions and routing to the agent, and the agent's model decides. The intelligence
  stays in the agent.
- **Not an orchestrator.** It connects an agent to tools, not agents to one another.
- **Not a replacement for APIs.** The APIs are still underneath, doing the work; the server is a
  layer on top that tidies the connection. Three switches scattered around a house, moved into one
  switchboard, are still three switches.
- **Not slower** in any way that matters. Which tool to call is a question the model answers either
  way.
- **Not an API gateway,** despite the similar vocabulary. A gateway is architecture between a
  front end and a back end, handling rate limiting and data protection.

## When to use it

Where a vendor offers an MCP server, use it, and prefer the vendor's own over a third party's, which
may be unsafe. A plain API remains the choice only when it is all that exists: a very small service
will not stand up a server, because running one is a real cost. The claim sometimes made that APIs go
out of date and MCP does not is too broad as stated, since a server is maintained by its owner like
anything else; the sound version is that a vendor's own server tracks that vendor's API changes, so a
builder is not left holding a hard-coded call that gets retired. The server is also where the tool
descriptions and their order live, written by whoever runs it.

## Related

- [Least privilege](least-privilege.md) — MCP is not safe by default: grant scopes by the task's verbs, and why unused ones still matter
- [Routing logic](routing-logic.md) — the rules inside every MCP server, and why their wording and order decide which tool runs
- [The four tool types](four-tool-types.md) — the kinds of tool a server exposes
- [The three pillars of an agent](three-pillars-of-an-agent.md) — tools as a pillar; MCP is how they are connected
- [HTTP, for workflow builders](http-for-workflows.md) — the API calls a server makes on the agent's behalf
