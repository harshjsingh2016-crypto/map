# Wiki

Concept articles distilled from the boards. Each article is a synthesis, not an export — the board holds the raw thinking, the wiki holds what it settled into.

## Gen AI fundamentals

- [Predictive vs Generative AI](predictive-vs-generative-ai.md) — one reads the puppy photo, the other rewrites it
- [Next-word prediction](next-word-prediction.md) — tokens, confidence scores, and patterns stored as weights
- [AI agents vs Agentic AI](ai-agents-vs-agentic-ai.md) — the chef, the restaurant, and the plan–act–check loop

## AI reliability

- [The prompt stack](prompt-stack.md) — system, user and response layers, told apart by lifetime
- [Meta prompting](meta-prompting.md) — handing the prompt back to the model for critique
- [Prompt templates](prompt-templates.md) — fixed structure, blanks filled per use case
- [Grounding](grounding.md) — fencing the model to data an answer can be traced to
- [Context persistence](context-persistence.md) — sessions forget; a persistent sandbox is what remembers
- [AI safety failure modes](ai-safety-failure-modes.md) — four ways it breaks, told apart by whose rules give way
- [Defensive prompt architecture](defensive-prompt-architecture.md) — role, refusal, safety and output rules, written against attack

## Prompt engineering

- [RCTFC Framework](rctfc-framework.md) — five things a prompt fixes so the model doesn't choose them
- [Zero-shot and few-shot prompting](zero-and-few-shot-prompting.md) — examples help until they overfit
- [Chain of Thought](chain-of-thought.md) — the reasoning trace as a prompt debugger
- [Iterative prompt refinement](iterative-prompt-refinement.md) — rounds of tuning, justified by reuse
- [Prompt costs](prompt-costs.md) — output is the expensive side; buy less of it with input
- [Model cards](model-cards.md) — the spec sheet read before choosing a model
- [Data anonymization](data-anonymization.md) — strip what traces back to a person before the model sees it
- [ML pipelines](ml-pipelines.md) — feature, training and prediction stages that improve independently

## AI ecosystems

- [Persistent context architecture](persistent-context-architecture.md) — the amnesia problem, answered by instructions, KB files and a sandbox
- [Persistent sandbox tools](persistent-sandbox-tools.md) — Gems, Projects and AI Studio, told apart by who the sandbox serves
- [Model dials](model-dials.md) — temperature and top-p narrow the same choice; move one at a time
- [RAG](rag.md) — the plumbing that carries the right slice of the KB into the prompt

## Solutioning

- [Problem discovery frame](problem-discovery-frame.md) — starting point, goal, paths between, constraints below
- [Base 1 — the year's plan](base-1-years-plan.md) — six areas the year is aimed at, success defined per area
