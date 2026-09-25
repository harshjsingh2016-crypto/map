---
boards: [scalar-2/ai-agent-concepts]
updated: 2026-09-25
---

# Chatbot, workflow or agent

Three shapes of system cover almost every task a model is put to, and choosing between them is a
more consequential decision than choosing the model inside.

A **chatbot** answers one question and is done. It is right when nothing needs to be checked in the
real world, where the answer is general knowledge the model already holds. A **workflow** runs fixed
steps in a fixed order, every time. It is right when the steps never change based on judgment, and
it is cheaper and more predictable than an agent for exactly that reason: nothing in it keeps asking
what to do next. An **agent** takes multiple steps where each one depends on what the last one found.
It is right when the path cannot be written down in advance.

That last test is the one to hold on to. The case for an agent is not that the task is hard, long or
important. A task with twenty steps whose order is known is a workflow, and a model step inside it
does not change that. The agent earns its cost only when the next step genuinely depends on an
answer not yet in hand, such as a source saying the decision belongs to someone else.

## When an agent is the wrong call

Five signals argue against the agent, and each one is a cost or a failure already seen from the
other side.

- **The steps never change.** A workflow does it cheaper and faster and will not wander. This is
  the guarantee a workflow gives and an agent, which re-decides every run, cannot.
- **Speed matters more than judgment.** A workflow has no reasoning to wait on, and an agent is
  always slower.
- **One fact, nothing to verify.** A chatbot is enough. A long, accurate paragraph of general
  knowledge is still one turn, and an agent there is overkill.
- **Being wrong is unacceptably costly.** Use an agent that only drafts, with a person confirming
  before anything is published: human in the loop. This is not a fourth option but an agent with its
  last action taken away. It still loops, checks and drafts; the irreversible step belongs to a
  person, which is the same logic as a guardrail the agent cannot cross.
- **There is no clear done.** Redefine the goal before choosing anything. An agent with no finish
  line keeps going and does more than was asked, which is the vague-goal endless loop. A vague goal
  wastes a chatbot or a workflow too; the agent is simply the one that keeps spending on it.

Run as a sequence, the signals become a decision: is there anything to check in the world, can the
path be written down, is there a clear done, and how costly is a wrong answer.

## Precision is the price of the agent

Agents demand more precise prompts than chatbots. A vague prompt costs a chatbot one poor answer. It
costs an agent every loop it runs chasing it, stopping too early if it settles, or never stopping
if it cannot tell when it has finished. Choosing the agent is also choosing to write the goal
properly.

## Related

- [The LLM chain and the agent node](llm-chain-vs-agent.md) — the same choice made inside a workflow tool, and what the agent loop costs
- [Right-sizing the model](right-sizing-the-model.md) — this decision is the middle question of the sizing stack
- [Three ways agents fail](three-ways-agents-fail.md) — the failures the wrong-call signals are designed around
- [The three pillars of an agent](three-pillars-of-an-agent.md) — where the confirmation step and the guardrails that hold actually live
- [Choosing between workflow tools](choosing-a-workflow-tool.md) — the next decision once the answer is a workflow
