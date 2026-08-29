---
boards: [scalar/knowledge-management-and-rag, scalar/web-grounding-citations]
updated: 2026-08-29
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

Capture, research, produce is the shape worth remembering, and the capture step is the one
that turns out to be optional more often than it looks. Notebook takes a YouTube URL
directly and will pull the transcript itself, so a separate capture tool earns its place
only when you want a summary rather than the raw transcript, or when the video is a local
file rather than a link. Either way the same limit applies underneath: a video whose content
is genuinely visual rather than spoken loses most of itself in any transcript, and no
chaining recovers it.

The worked example is smaller than the committee case and makes the value clearer. A
39-minute tutorial video plus a diagram of the setup, both loaded into one notebook,
becomes an answer another person can act on in minutes — the notebook reasons over the
image alongside the text and will draft the step-by-step guide. The gain is not that any
one tool was clever. It is that the material nobody would sit through got converted into
material a notebook could retrieve from.

The rest reduces to matching the surface to the need. Parameters and API code point at AI
Studio; a persona over a small knowledge base at Gems; deep research over documents you own
at Notebook; live or time-sensitive material that has to be cited at Perplexity; ordinary
low-stakes search at a general assistant. None of this is about which is strongest.

## The surface narrows the field; the shape of the work decides

The grounding surface answers most selection questions on its own, and a worked set of five
scenarios shows where it runs out. Three of them fall straight out of it — a pile of your own
reports goes to the document-grounded tool, a recurring web brief to the web-grounded one, a
long recording to the media-grounded one. No further thought needed.

The interesting case is a one-off fact check that has to happen *inside a conversation you
are already having*, and every reason the other tools lose is a non-grounding reason. The
document tool is capped at its uploaded context — a surface argument, fair enough. The
web tool would answer the fact perfectly well and is rejected anyway, because the fact check
is a step inside something larger and a search-only tool cannot carry the larger thing. The
developer console would also work and is rejected on audience.

So three further axes sit under the surface question, and they are worth asking in order
once the surface has narrowed things:

**Scope** — is this a step inside a larger task, or the task itself? A tool that only does
one thing cannot hold a multi-topic conversation around it, and the cost being minimised is
context switching rather than retrieval quality.

**Cadence** — will this run once or every week? "Reusable with one click" is what turns a
web-search tool into a saved space, and it is a different requirement from depth.

**Audience** — who reads the output? This is the same axis that orders tools by how much of
their working they expose: the most visible tool is the developer path, and the reason it
should never be put in front of a client is exactly the reason it is valuable to a builder.

Together these make selection a procedure rather than a feature comparison. Surface first,
then scope, cadence and audience.

## The closest pair, separated by shape rather than strength

Two of these tools are genuinely hard to tell apart on capability: a general assistant with
a web-search tool, and a dedicated web-research tool. Both ground in the live web, both
cite, both search well.

The dividing line is whether searching *is* the task or a step inside it. The assistant will
write a script that pulls a column out of a spreadsheet with no internet involved, then
corroborate the news articles sitting in that column, reaching for the web partway through
and dropping it again. The research tool goes deep across many articles on one topic and
does nothing else. Neither is stronger. One holds a multi-topic task around a moment of
grounding; the other is the moment of grounding, at depth.

## Read the roster by defaults

The most practically useful cut across a set of grounding tools is not what each can do but
what each does when you have touched nothing — because configuration mistakes come from
defaults, not from limitations.

A general assistant searches by default, so disabling it is the deliberate act, and the
setting can silently fail to apply until the page is hard-refreshed. A document-grounded
notebook never reaches the web inside a grounded answer, and offers rather than doing it
silently. A dedicated web tool always searches and cannot be switched off — no default to
get wrong, and no ungrounded comparison available either. A developer console ships with
grounding *off*, which is the reverse of what people assume about a search company's tool,
and getting it wrong makes you conclude the tool does not ground at all. And an assistant
that decides per turn is the one case where being correctly configured still does not tell
you what happened.

The two most dangerous are therefore not the least capable ones. They are the tool with the
best transparency in the set, silently not grounding, and the tool that is switched on and
may still not have searched. The failure is not weakness. It is confidence about a state
that was never verified.

## Related

- [RAG](rag.md) — the mechanism every one of these tools is implementing
- [Grounding](grounding.md) — what the surface each tool retrieves from actually buys you
- [Citation credibility](citation-credibility.md) — how much of its working each tool lets you see, and why that matters
- [Persistent sandbox tools](persistent-sandbox-tools.md) — Gems and its siblings, told apart by who the sandbox serves
