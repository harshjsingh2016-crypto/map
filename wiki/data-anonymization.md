---
boards: [scalar/prompt-engineering]
updated: 2026-08-21
---

# Data anonymization

Removing or replacing names, emails and phone numbers before customer data reaches a prediction model, so nothing traces back to an individual. The test is the trace-back: if any field can still identify a person, the data is not anonymized yet.

Variants worth distinguishing: de-identification is the general act; pseudonymization or PII redaction replaces values with placeholders instead of deleting them, which keeps records linkable to each other without being linkable to a person.

## Related

- [Model cards](model-cards.md) — a model's limitations section is where training-data handling like this gets disclosed
