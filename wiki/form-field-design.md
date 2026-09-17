---
boards: [scalar/n8n-automation]
updated: 2026-09-17
---

# Designing the form that feeds the flow

When an automation starts at a form, the form is the only place data quality can be enforced
cheaply. Everything after it is cleanup. Three decisions from one worked build carry further than
the build.

**Pick the field type by what people will type, not by what the data is.** A phone number is
obviously a number and should obviously not be a number field — somebody will enter a country code
with a plus sign and a number field will reject it. The nominal type of the data and the type that
accepts real input are different questions, and only the second one matters at the point of entry.

**Prose needs a field that holds prose.** A single-line text input has a character cap and truncates
past it without complaint; a textarea expands. An enquiry describing what somebody wants is prose,
so the query field is a textarea. The failure mode here is the quiet one — you do not get an error,
you get a shorter sentence than the person wrote, and the model downstream summarises the truncated
version perfectly.

**Nothing is required until you say so.** A form built without marking fields required will accept
a submission with no email address and give the submitter no nudge at all. The attribute is set per
element, which means it is per element that you forget it. Anything the flow downstream depends on
having must be marked required at the form, because the alternative is discovering the gap as a
missing field in an expression three nodes later.

The through-line: each of these is a place where the form accepts something the flow cannot use,
and reports nothing wrong. Validation at the entry point is not pedantry, it is the only cheap
place to catch a shape problem before every downstream node is configured against it.

## Related

- [Building a workflow three nodes at a time](iterative-workflow-building.md) — the wrong-shape failure these decisions prevent at the source
- [The workflow grammar](workflow-grammar.md) — the form is the trigger; this is how the trigger's output is made trustworthy
