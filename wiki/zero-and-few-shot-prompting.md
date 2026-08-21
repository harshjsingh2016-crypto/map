---
boards: [scalar/prompt-engineering]
updated: 2026-08-21
---

# Zero-shot and few-shot prompting

Zero-shot prompting asks the model to do the task with no examples — instructions only. Few-shot prompting includes worked examples in the prompt so the model can infer the pattern from them.

The counterintuitive part from class: more examples is not better. Past a handful — five or more — additional examples stop helping and start overfitting the model to the examples' surface features rather than the task. A few well-chosen examples beat many.

Examples and the [RCTFC framework](rctfc-framework.md) are two routes to the same end: pinning down what the output should look like instead of letting the model choose. Examples show it; RCTFC states it.

## Related

- [RCTFC framework](rctfc-framework.md) — stating the format instead of demonstrating it
