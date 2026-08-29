# Walkthrough — 2026-08-24_RAG_in_practice.md
Board: scalar/knowledge-management-and-rag
Updated: 2026-08-28
Status: COMPLETE. Batches applied: 9 (S1-S7) - board now 38 mindmap nodes, 3 notes,
4 tables, 1 flowchart, 0 open flags.
One item deferred out of this board: structural input isolation (S3) - see below.
Wiki touched: rag.md, grounding.md, choosing-a-rag-tool.md.

Board at start: 7-node mindmap (RAG -> Retrieval/Augmented/Generation) + Meera note,
3 pending ghosts (n-recall, n-cite, n-index). Wiki: rag.md.

## S1 What RAG is
- [x] "RAG isn't magic, it's plumbing" as the board's framing line - refinement - accepted (detail on n-rag)
- [x] Augmented = the AR insertion analogy; insertion target is the prompt - missed - accepted (detail on n-augmented)
- [x] Retrieval draws from anywhere: web, KB, uploaded docs, SQL DB - missed - accepted (n-retrieval-anywhere; held from S1, landed in the S4 batch)
- [x] KB vs RAG - where files live vs how they reach the prompt - refinement - accepted (n-kb-vs-rag)
- [x] Tools you already use are doing RAG (Gems, ChatGPT, Cursor) - missed - accepted (n-already-rag)

## S2 Why retrieval quality is the whole game
- [x] Meera note gains the specifics: Yash, match 1+2, the "superstar" conclusion - refinement - accepted (w-meera rewritten)
- [x] Correct reasoning over an incomplete picture is not hallucination - refinement - accepted (n-incomplete)
- [x] Real-world failures: Air Canada, Amazon Q, NYC MyCity - missed - accepted (note w-failures)
- [x] Amazon Q insight: your guardrails are themselves retrievable documents - missed - accepted (n-guardrails)
- [x] Two stated reasons RAG is needed (private data / PSP; grounding vs hallucination) - missed - accepted (n-why + 2 children)
- [x] Grounding defined; never fully eliminates hallucination - missed - accepted (n-grounding; wiki/grounding.md gained this board)
- [>] Cost argument: retrieval shrinks the prompt, shrinks input tokens - missed - deferred (belongs in wiki/prompt-costs.md against the prompt-engineering board, not here)
- [>] Embeddings, deliberately simplified - and why he stops there - missed - deferred (partly absorbed into n-index detail; the course defers the depth too)
- [x] Four levers that shift retrieval (name files, system prompt, doc structure, context window) - missed - accepted (n-levers + 4 children)
- [x] Over-grounding: the CV chatbot refusing hobbies; over-restriction is also failure - missed - accepted (n-overground, placed under n-grounding with the S4 material where it reads better)
- [x] Settle ghosts n-recall / n-cite / n-index - refinement - accepted; recall+cite regrouped under new n-detect (detection, not influence), n-index accepted in place with embeddings detail

## S3 The three tools
- [x] Three tools ground three different ways (documents / live web / media) - missed - accepted (n-tools + 3 children)
- [x] Gemini Notebook vs Gems comparison table - missed - accepted (table w-nb-vs-gems; new wiki article choosing-a-rag-tool.md)
- [x] Notebook's four distinguishing behaviours - missed - accepted (4 nodes under n-tool-notebook)
- [x] Grounded generation is not hallucination - missed - accepted (n-grounded-gen)
- [>] Structural input isolation - missed - deferred off this board. It is a prompt-injection
      defence, not a RAG concept; its home is scalar/ai-reliability and
      wiki/defensive-prompt-architecture.md. Carry it in when that board is next worked.
- [x] Perplexity: training cutoff, deep research, focus modes, citations-on-everything - missed - accepted (table w-tools-compare)
- [x] NoteGPT: pulls YouTube's existing captions, does not transcribe - missed - accepted (table w-tools-compare)
- [x] Choosing between them - the situation-to-tool table - missed - accepted (table w-tool-choice)
- Excluded from S3: RTX price and Perplexity model-name list (low-confidence in source).
  RTX demo contrast retained and used in S4's time-sensitive test.

## S4 Grounded vs ungrounded
- [x] Grounded vs ungrounded definition pair - missed - accepted (n-ungrounded under n-grounding)
- [x] Three grounding tests: positive, negative, time-sensitive - missed - accepted (table w-grounding-tests, 4 columns incl. what each failure proves)

## S5 Quiz items
- [x] The fault rule: missing docs = retrieval, wrong output from complete docs = generation,
      augmentation essentially never fails - refinement - accepted (n-fault-rule)
- [x] Q3 committee scenario: chain NoteGPT -> Notebook - missed - accepted, merged with S6's
      pipeline shape into one flowchart (w-chain); the committee case is the detail on the start node
- [ ] Q2 (Notebook asked about an un-uploaded meeting) - not raised; the desirable behaviour is
      already on the board as n-nb-refuse and is the negative test case in w-grounding-tests

## S6 Mini build
- [x] Pipeline shape: NoteGPT to capture -> Notebook to research -> any tool to produce - missed - accepted (flowchart w-chain)
- [x] Pi-hole worked example - missed - accepted (note w-minibuild)
- [x] Assignment brief - missed - accepted (closing block of w-minibuild, kept with the example rather than as its own widget)

## S7 Doubt session
- [x] Keeping a RAG store from going stale (pipeline or live web source) - missed - accepted (n-stale under n-index; new wiki section in rag.md)
- [x] Integrating RAG with agents: doc hygiene, explicit steering, accept it is empirical - missed - accepted (n-empirical under n-levers). This answered the open flag on n-lever-name, so the flag was cleared in the same batch.
- [x] A retrieval miss is dangerous when the missed doc held the constraint - missed - accepted (n-output-guard under n-guardrails)
- [x] Can you ask a model to show its source of truth - missed - accepted (n-ask-source under n-detect)
- [ ] "Gem system instructions = system prompt" - not raised - glossary-level restatement, already covered by wiki/prompt-stack.md
- [ ] Context-window eviction / persona drift - not raised - already covered by wiki/context-persistence.md on the ai-ecosystems board

## S9 Not landing
- Acquisition claim re NotebookLM, the "2004" MyCity date, the RTX 5090 price,
  the Perplexity model-name list - all flagged low-confidence in the file. Excluded.
