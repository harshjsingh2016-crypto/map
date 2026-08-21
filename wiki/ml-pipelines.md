---
boards: [scalar/prompt-engineering]
updated: 2026-08-21
---

# ML pipelines

Splitting one large process into a feature pipeline, a training pipeline, and a prediction service — each built, tested, and improved independently. The point is the independence: features can be reworked without retraining from scratch, training can be rerun without touching serving, and the prediction service can scale on its own.

The same decomposition instinct shows up elsewhere in the course: [agentic AI](ai-agents-vs-agentic-ai.md) breaks a request into delegated pieces at run time; an ML pipeline breaks the system into stages at build time.

## Related

- [AI agents vs Agentic AI](ai-agents-vs-agentic-ai.md) — decomposition at run time instead of build time
- [Data anonymization](data-anonymization.md) — typically applied inside the feature pipeline, before data reaches training
