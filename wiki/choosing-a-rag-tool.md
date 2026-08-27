---
boards: [scalar/knowledge-management-and-rag]
updated: 2026-08-27
---

# Choosing a RAG tool

Once you accept that [RAG](rag.md) is the default plumbing rather than an exotic technique,
the question stops being whether a tool does retrieval and becomes what it retrieves *from*
— and how much engineering went into the retrieving.

## The grounding surface is the classification

Three tools worth telling apart, and what separates them is not features but the surface
each one grounds itself against. Gemini Notebook grounds in documents you supply.
Perplexity grounds in the live internet. NoteGPT grounds in a piece of media you point it
at. Everything downstream — what each is good for, how each fails — follows from that
choice of surface rather than from anything in the interface.

This is a more useful axis than capability lists, because it predicts the failure. A tool
grounded in your documents cannot tell you what happened last week. A tool grounded in the
live web cannot answer from material that was never published. A tool grounded in one video
knows one video.

## Retrieval engineering is the real difference

The comparison that makes the point is Gemini Notebook against Google Gems, because both
ground in documents you supply and both do RAG. The difference is entirely in how much work
went into the retrieval step.

Notebook was built for research and deep retrieval: slower, more refined, holds up across
whole textbooks and large collections of papers, and picks up sources added after the
conversation started. Gems was built to be a chatbot: faster, weaker at scale, degrading as
the document count rises, and — the sharp edge — a document added mid-conversation often
stays invisible to it. Within that chat it effectively does not exist.

Two practical consequences fall out. A knowledge base you keep adding to needs Notebook,
because the thing Gems is weakest at is exactly the thing a growing store demands. And the
converse holds: reaching for Notebook to build a CV chatbot or an HR-policy bot is
over-tooling — slower, more sluggish, and no better at a job Gems was shaped for.

The general form is that "does it support RAG" is close to meaningless as a selection
criterion. Almost everything does. What varies is whether the retrieval step was treated as
the product or as a checkbox, and that difference only shows up at scale — which is to say,
after you have already committed.

## What deep retrieval buys

Four behaviours mark the difference out in use, and three of them are about showing work.
Notebook synthesises across documents — it will derive something no single source states,
and name which source contributed what. It shows its reasoning by default rather than on
request. Its citations point at your own passages, hoverable and clickable through to the
original, where a web-grounded tool's citations point at the internet.

The fourth is the one that matters for trust: it refuses out-of-scope questions instead of
improvising. Asked about something absent from the sources it says so and *offers* to
search the web rather than doing it silently. It has web access throughout and will not
reach for it once you have grounded it — which is what makes the ground hold.

Synthesis and refusal sound contradictory until you separate generation from grounding.
Inferring across supplied documents produces content that appears in none of them, and that
is not hallucination: it traces back to what you supplied. Generating is not the failure.
Generating from nothing is.

## The other two surfaces

Perplexity exists because of the training cutoff. A model trained to a date knows nothing
after it and cannot tell that anything is missing, so grounding in the live web is the
answer to a specific problem rather than a general improvement. What still distinguishes it
is not access but discipline: it attaches a source to everything, where a general assistant
cites when it judges citation necessary and otherwise just answers. That matters when the
output has to survive scrutiny. Its weakness is one layer up from retrieval — deciding
which source is authoritative. In practice it gravitates to established news sites,
Wikipedia, and whatever ranks highly in ordinary search, which is a reasonable heuristic
and not a rigorous one. Worth knowing too that it runs no model of its own; it routes to
other providers, so "which model" remains your choice rather than its identity.

NoteGPT is the smallest of the three and the most worth understanding mechanically, because
the mechanism explains both its speed and its limit: it does not transcribe a video. It
asks YouTube for the captions YouTube already holds. That makes it fast and makes it
useless on anything without captions — a limit invisible from the interface, which presents
transcription and retrieval of an existing transcript identically.

## They compose

The selection question is usually posed as which tool, and the more useful answer is often
which order. Capture with one, research with another, produce with a third: a video becomes
a transcript, the transcript joins the documents in a notebook, and the notebook answers
across all of it with citations. Reaching for a single tool that does everything is how the
video gets dropped from the analysis, which is a worse outcome than using three.

The rest reduces to matching the surface to the need. Parameters and API code point at AI
Studio; a persona over a small knowledge base at Gems; deep research over documents you own
at Notebook; live or time-sensitive material that has to be cited at Perplexity; ordinary
low-stakes search at a general assistant. None of this is about which is strongest.

## Related

- [RAG](rag.md) — the mechanism every one of these tools is implementing
- [Grounding](grounding.md) — what the surface each tool retrieves from actually buys you
- [Persistent sandbox tools](persistent-sandbox-tools.md) — Gems and its siblings, told apart by who the sandbox serves
