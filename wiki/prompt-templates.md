---
boards: [scalar/ai-reliability]
updated: 2026-08-21
---

# Prompt templates

A reusable prompt structure with blanks filled in per use case. Write the scaffolding once, substitute what varies each time.

A template is not the same thing as a system prompt, and the difference is scope. The system prompt sets up the broader application; a template serves one specific use case inside it — a particular query-and-answer job, say. One application, one system prompt, many templates.

A concrete way to see the split is attribute versus sub-attribute. The system prompt carries what to do — the attribute level, broad and true for every call. The template narrows the user input down to the sub-attribute: the one specific thing being asked this time. What changes per request is the sub-attribute, and that is why it sits in the template rather than in the system prompt. Where the set of sub-attributes is fixed and known, it stops being free user input and becomes a parameter.

A template has three parts:

- **Base instructions** — establish the AI's role and behaviour. Fixed.
- **Parameters** — dynamic variables injected at run time: details, dataset, user goals, user-defined priorities or constraints.
- **Execution payload** — the actual data or sample provided for context, which the model reasons on.

Base instructions are the structure; parameters and payload are the blanks. The distinction between the last two is worth holding: parameters *configure* the run, the payload is what the run *operates on*.

It is the same boundary the [prompt stack](prompt-stack.md) draws, made concrete: the fixed structure is the part that could live in a system prompt, and the blanks are what the caller supplies — usually the Task, in [RCTFC](rctfc-framework.md) terms. A template is what you are left holding once you have decided which of the five components change and which do not.

Templates are also the case where [iterative refinement](iterative-prompt-refinement.md) clearly pays: rounds spent on a structure that runs many times amortise, where rounds on a one-off ask do not.

## Related

- [The prompt stack](prompt-stack.md) — fixed structure versus per-request blanks
- [RCTFC framework](rctfc-framework.md) — which components end up as blanks
- [Iterative prompt refinement](iterative-prompt-refinement.md) — why reuse justifies the tuning rounds
