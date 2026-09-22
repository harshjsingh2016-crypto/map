# Wiki

Concept articles distilled from the boards. Each article is a synthesis, not an export — the board holds the raw thinking, the wiki holds what it settled into.

## Gen AI fundamentals

- [Predictive vs Generative AI](predictive-vs-generative-ai.md) — one reads the puppy photo, the other rewrites it
- [Next-word prediction](next-word-prediction.md) — tokens, confidence scores, and patterns stored as weights
- [AI agents vs Agentic AI](ai-agents-vs-agentic-ai.md) — the chef, the restaurant, and the plan–act–check loop
- [Diffusion](diffusion.md) — noise carved down everywhere at once, and why that gives you two trunks

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
- [Unintended claims](unintended-claims.md) — a generated detail promises something real, and nobody decided to promise it
- [Personality rights](personality-rights.md) — style, then voice; consent goes on record before cloning, not before publishing
- [The realism balance](realism-balance.md) — a ceiling on polish set by belief, not by honesty

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

## No-code chatbots

- [Delivery, not accuracy](delivery-not-accuracy.md) — the answer is known; what you don't control is when it's asked
- [The control dial](control-dial.md) — who decides what happens next; match the tool's shape to the risk's shape
- [Dify](dify.md) — the model composes every reply; fastest to a bot, least say over it
- [Botpress](botpress.md) — draw the branch and the model cannot rephrase it; the model picks the exit, not the words
- [Voiceflow](voiceflow.md) — the same routing decision written as prose a whole team can argue with
- [Vendor data diligence](vendor-data-diligence.md) — safety is a per-client requirement you verify, not a vendor property
- [Free-tier arithmetic](free-tier-arithmetic.md) — count messages, not conversations; volume bites before seats do
- [The competent-reader test](competent-reader-test.md) — is there anyone downstream who would notice a wrong answer?

## Workflow automation

- [When to automate](when-to-automate.md) — three questions and four vetoes, decided before either tool is opened
- [The workflow grammar](workflow-grammar.md) — trigger, condition, action; and the model's job is normalisation
- [API key hygiene](api-key-hygiene.md) — expire, rotate, name each one; and the model never sees it
- [Fair-code](fair-code.md) — read, modify, self-run; resell the automations, not the tool
- [Polling vs webhooks](polling-vs-webhooks.md) — asking repeatedly, or being told; a latency difference you rarely choose
- [HTTP, for workflow builders](http-for-workflows.md) — the five methods, and the work a node hides rather than removes
- [Choosing between workflow tools](choosing-a-workflow-tool.md) — six dimensions, and only one of them decides
- [Building a workflow three nodes at a time](iterative-workflow-building.md) — the wrong-shape success that quietly misconfigures everything downstream
- [The LLM chain and the agent node](llm-chain-vs-agent.md) — one prompt and an answer, or a task that needs lookups first
- [Hosted or on your own machine](self-hosting-tradeoffs.md) — an operations choice, and only data privacy overturns it
- [A showcase is not a use case](showcase-vs-use-case.md) — a time, a gap and a cost; and a spec that fits in one sentence
- [Designing the form that feeds the flow](form-field-design.md) — pick the field type by what people will type, not by what the data is
- [Right-sizing the model](right-sizing-the-model.md) — two readings of parameter count, and the cut-off date that cuts across both
- [Classifying input you do not control](classifying-untrusted-input.md) — a list fails on coverage, a radio button fails on incentive
- [Make the answer a field, not a substring](structured-output-for-branching.md) — the classifier was right and the branch still read it wrong
- [Scheduling, and when to reach for cron](scheduling-and-cron.md) — the meeting is at nine, so the report runs at eight
- [The item model](the-item-model.md) — a node runs once per incoming item, and node order decides the call count
- [Use the model for what only a model can do](what-only-an-llm-can-do.md) — faster and cheaper are optimisations; authoritative is the argument
- [Designing for partial failure](designing-for-partial-failure.md) — decide what the degraded output looks like, and make failure visible
- [Debugging a workflow](debugging-a-workflow.md) — read what the system already tells you, and know which layer owns the symptom
- [Creating dependency](creating-dependency.md) — a workflow can be correct, efficient and still a liability nobody dares touch
- [Tasks, and what an automation actually costs](tasks-as-the-billing-unit.md) — cost scales with steps times runs, and a wasted step bills the same
- [Observing what did not happen](observing-what-did-not-happen.md) — correct silence and broken silence look identical from the destination
- [Where the filter goes](filter-placement.md) — a filter is worth what sits after it, so moving it down costs money
- [Batching to decouple cost from volume](batching-to-decouple-cost.md) — accumulate and release, and the bill follows a number you pick
- [Branches are not else-if](branches-are-not-else-if.md) — independent conditions, so two matching rules both run in full

## AI for content creation

- [Diagnose the hard part](diagnose-the-hard-part.md) — structure, substance or style; the tool follows the diagnosis
- [Finished-looking is not checked](finished-looking-is-not-checked.md) — polish and accuracy are two processes; only one is running
- [Gamma](gamma.md) — decks in under a minute; the speed and the invention are one setting
- [The do-not-guess constraint](do-not-guess-constraint.md) — name what to do with a gap, or the tool decides for you
- [Artifacts](artifacts.md) — one object per session; the version you fixed is the version they open
- [Canva Magic Studio](canva-magic-studio.md) — examples in, batch out; the proofread is a step, not a tidy-up
- [Voice is per channel, not per brand](voice-is-per-channel.md) — the LinkedIn voice is not the Instagram voice
- [The editor's checklist](editors-checklist.md) — five checks before anything ships, and six when the output is not words
- [Paraphrase is a different failure from invention](paraphrase-failure-mode.md) — a real figure reworded into a different claim, past grounding
- [Bolted on, or built for it](bolted-on-or-built-for-it.md) — product shape predicts AI quality; convenience is not capability

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
- [Logistics agent — the goal](logistics-agent-goal.md) — eight regions of control, from SLAs to order movement
- [Logistics agent — the data position](logistics-agent-data-position.md) — six sources; column count is not coverage, and cost is empty
- [QVS agent — the project position](qvs-agent-position.md) — one engine, five read surfaces, and threads blocked on an account rather than on code
