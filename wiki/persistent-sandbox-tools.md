---
boards: [scalar/ai-ecosystems]
updated: 2026-08-24
---

# Persistent sandbox tools

Three consumer products implementing the sandbox half of
[persistent context architecture](persistent-context-architecture.md). Choosing between
them is use-case fitting — context window and response quality — but the sharper axis is
*who the sandbox is for*: one person, a team, or the person tuning the model itself.

**Gemini Gem** is a custom version of the assistant, configured once. Its Instructions
field is the system prompt and its Knowledge section holds the KB — the two-part
architecture with a UI on it, nothing new underneath. A Gem earns its keep only when three
things are true together: the same task recurs, the task needs constant context such as
guidelines or a persona, and consistent behaviour is wanted. Miss any one and an ordinary
chat does the job. Vague instructions defeat the whole arrangement.

**Claude Project** is a self-contained workspace carrying chat history alongside the KB —
the part a Gem does not have, since the workspace accumulates where the Gem resets. System
prompt and KB are set project-wide, while files specific to one chat can be uploaded into
just that chat: a persistent tier and a disposable one. Connectors added to a project are
available to everyone sharing it, and sharing itself works at two grains — the whole
workspace, or a single chat out of it.

**Google AI Studio** is the developer-facing playground: open the hood, adjust the engine,
prototype model behaviour before deployment. It exposes the
[model dials](model-dials.md) the other two hide, plus a tools panel — structured outputs
for a fixed response format, code execution, function calling for API calls, grounding
against Google Search or Maps, and URL context. Structured outputs shape what comes back;
the rest let the model reach outside the chat. Both grounding tools trade the KB for a
live source, buying freshness at the cost of a fixed, checkable set of files. When the
configuration is tuned against a specific model for a given prompt, KB and purpose, Copy
Code exports it — the exit from the playground, where the tuned config leaves as code and
becomes the deployed thing.

## Related

- [Persistent context architecture](persistent-context-architecture.md) — the instructions/KB/sandbox split these products package
- [Model dials](model-dials.md) — what AI Studio exposes and the others fix
- [Grounding](grounding.md) — fencing answers to a source, here offered as a toggle
