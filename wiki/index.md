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
- [Citation credibility](citation-credibility.md) — a source exists is not a source is good; the audit you lose on the open web
- [Source-Quality Framework](source-quality-framework.md) — recency, authority, corroboration, relevance; recency runs first and overrides

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
- [Choosing a RAG tool](choosing-a-rag-tool.md) — the surface a tool grounds in decides what it is for

## SQL foundations

- [SQL as the extraction step](sql-extraction-step.md) — the precondition that gates every data role, whatever comes after
- [DBMS](dbms.md) — not storage; the layer that knows the shape of what is stored
- [RDBMS](rdbms.md) — the common field is the relationship; without it the question is unanswerable
- [ER diagram](er-diagram.md) — the map of the database, handed to you rather than drawn by you
- [Table relationships](table-relationships.md) — read the line both ways; many-to-many is a path, not a line
- [Database vs data warehouse](database-vs-data-warehouse.md) — the store and the godown, split by age and by grain
- [SQL data types](sql-data-types.md) — one column one type; counted takes decimal, measured takes float
- [Database keys](database-keys.md) — the test is whether a value can ever repeat, not whether it has
- [Why a database and not a spreadsheet](why-a-database-not-a-spreadsheet.md) — a sheet is not too small so much as unowned
- [The five sublanguages of SQL](sql-sublanguages.md) — a permission set, not a list; your share is the read-only one
- [SELECT and FROM](select-and-from.md) — a query is instructions handed over, never a glance at the table
- [Sorting and paging](sorting-and-paging.md) — ORDER BY chooses by value, OFFSET only counts positions
- [Computed columns](computed-columns.md) — arithmetic per row, named by an alias, stored nowhere
- [SQL string functions](sql-string-functions.md) — no + operator for text; separators are arguments like any other
- [The WHERE clause](where-clause.md) — the same rows, fewer of them; and the name SELECT invented that it cannot see
- [SQL order of execution](sql-order-of-execution.md) — the errand for two red spoons, and the rule you can derive from it

## Solutioning

- [Problem discovery frame](problem-discovery-frame.md) — starting point, goal, paths between, constraints below
- [Base 1 — the year's plan](base-1-years-plan.md) — six areas the year is aimed at, success defined per area
- [GRN-to-payment cycle](grn-to-payment-cycle.md) — six sequential steps, four of them one-way shares that never return
- [Codex control loop](codex-control-loop.md) — the now is the only lever; seven files and four skills point the hours at a written-down future
- [Logistics agent — the goal](logistics-agent-goal.md) — five regions of control: SLAs, BI, assignment, costs, escalations
