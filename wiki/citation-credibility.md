---
boards: [scalar/web-grounding-citations]
updated: 2026-08-29
---

# Citation credibility

A citation tells you a piece of generated text was built from something. It does not tell
you the something was worth building from. Holding those two apart is the whole discipline,
and the reason it needs to be taught is that nothing in the presentation separates them.

## Why owning the knowledge base was doing the work

[Grounding](grounding.md) is auditable because you drew the boundary. You chose the
documents, so you can ask for something you know is absent and watch whether the tool
refuses — and that negative test is the one that actually proves the fence exists, rather
than proving the model is competent.

Web grounding keeps the fence and removes the audit. When the knowledge base is the live
internet, nothing is knowably absent, so there is no negative case to construct. You also
cannot say what the correct retrieval would have been, which means a retrieval failure
leaves no trace you could detect. The tool really is grounding: it read articles, it
attached sources, the sources really do contain the claim. What you have lost is any way to
check the choice it made.

So the question moves up a layer. Not *is this tool correct*, which you can no longer
establish, but *how do I grade the citations it handed me*. That is evaluation of sources
after the fact, from the outside — a different skill from evaluating a model, and the one
worth building.

## Skepticism is not a method here

The instinctive answer is to be more careful, and it fails for a structural reason.
Web-grounded output is shaped to look settled: real URLs, real articles, genuinely
containing the claim. There is no visible seam for care to catch on. Fluency and confidence
are not signals of anything, because a worthless source rendered fluently reads exactly
like an authoritative one.

What replaces instinct is a set of explicit checks run one at a time, against the source
rather than the answer — the [Source-Quality Framework](source-quality-framework.md). Ordering the work
that way also explains why tooling matters at the end rather than the start: once you know
which checks you need to run, "does this tool show me what it searched" stops being a
feature comparison and becomes the deciding question.

## A refusal is not one thing

The demonstration that opens the subject puts one question to three tools and gets two
refusals and one answer. The refusals are the interesting half, because they print
identically on screen and mean completely different things.

One tool refused because it lacked the reach: the question was a current event past its
training cutoff and its web search was switched off, so there was no mechanism to go
further. Restore the reach and it answers. Nothing about that tool was wrong for the job.

The other refused because it was the wrong tool by remit. Its knowledge base was a handful
of documents on an unrelated subject, and its job is answering from the sources it was
given. It could have had live access to everything and still, correctly, declined. That
refusal is the grounding fence doing exactly what it was built to do.

So one refusal is a capability limit and the other is a correct result, and the screen
cannot tell you which you are looking at. Reading the output alone is not enough — you have
to know what configuration produced it.

## Nothing visible to object to

Asked whether they would accept the one tool that did answer, a whole class says yes. It
carried citations, named a specific date, and attached articles that could be clicked and
read. The acceptance was not carelessness. There was no seam.

That is the hinge the rest of the discipline turns on. If a confident, cited, on-topic
answer can still be wrong, then the check cannot be run on the answer. It has to be run on
the sources.

## The failure the pizza case actually shows

An AI overview once recommended adding glue to pizza so the cheese would stick, sourced from
a years-old forum joke about slipping cheese. The instinct is to file this as hallucination,
and that reading gets the mechanism backwards. Nothing was invented. No source was
misquoted or blended. A real post in a real thread was retrieved and reported faithfully.
Every step of the pipeline worked.

The citation was genuine and the source was worthless, which is only a contradiction if you
assume the two travel together. Retrieval quality and source quality are separate problems,
and a perfectly functioning retrieval system will serve garbage confidently when garbage is
what it found.

## Three ways a citation fails

**Old, relative to the question rather than the calendar.** This is the one most often
misread, because "old" sounds like a property of the article and is actually a relationship
between its date and the question's time-sensitivity. A paper from 2008 on an ancient
civilization is not old; nothing about the subject has moved. An article from five months
ago about an unfolding conflict is useless. Same calendar distance, opposite verdict. The
question worth asking is not *is this recent* but *how fast does the answer to my question
change* — a property of the question, not of the source.

**Unreliable, meaning nothing accountable stands behind it.** Public forums rank answers by
popularity rather than verification, so an incorrect answer that happened to be agreeable
gets promoted into the position that reads as authoritative — and that top answer is exactly
what a crawler picks up. What confers reliability instead is authority in the narrow sense
of remit: a body whose job is precisely this subject, held responsible for being right about
it. Not size, not fame. Wikipedia sits in between — solid on public, well-known knowledge,
riskier on niche topics, because anyone can edit and reviewers miss things.

**Uncorroborated, meaning one source carries the claim while others contradict it or stay
silent.** The test is whether anyone else is saying it.

## Reliability is a by-product of liability

The mechanism underneath the third failure is worth separating out, because it explains why
news organisations are usually worth trusting and it is not journalistic virtue. They are
liable. Publish a false statement of fact and you can be sued, and made to justify your
sources at real cost. Accountability is what produces the accuracy — which also predicts
exactly where the accuracy stops.

Hence a long-standing workaround: run the unverified claim in the headline as a question.
An interrogative is not an assertion of fact, so nothing attaches, and the claim still
reaches the reader. Then the retrieval layer arrives and reads the words. The punctuation
carrying the entire legal and epistemic weight of that sentence does not survive the trip,
and a deniable headline becomes a sourced claim.

This generalises past the specific trick. Signals that humans read as hedging — a question
mark, a conditional, an attribution to an unnamed source — are load-bearing for a reader and
close to invisible to a system that scrapes the claim. Anything a publisher does to avoid
committing to a statement is something retrieval is liable to strip.

## The prior question: did it search at all?

Before any of the four checks can run, you need to know whether there is anything to check.
A tool that decides *per turn* whether to reach for the web makes that a live question — the
capability being available does not mean it was used, and a confident, well-written answer
reads identically either way.

The signals are visible ones: citation markers in the text, and a source panel you can open.
Both absent means the answer came from training alone. That is not a quality judgement and
it does not say the answer is wrong — it says which regime you are in, gradeable or not yet
gradeable. Run it before the framework, not alongside it.

The failure it guards against is not a tool declining to search. It is you assuming a search
happened.

Three misconceptions cluster around that rule, and each is worth refusing explicitly. That
a tool sometimes hides its citations — it does not; if it searched, it shows them, and the
reliability of that signal is what the whole check rests on. That a factual question never
needs a search — *factual* is not *static*, and a question turning on recent information
should trigger one. And that a missing citation means the answer is wrong — sometimes the
training data holds the correct answer.

The last one cuts both ways, which is why it has to be stated rather than assumed. The
purpose of the check is not to reject uncited answers. It is to know you have not checked
one yet.


## Visibility is the axis that separates the tools

Two of the failures above are only diagnosable if you can see the step that chose the
sources, and most tools do not show it. A web-search tool hands you sources and never says
what it searched. An assistant that decides per turn whether to search shows you citations
when it did, but not the decision or the query. In both cases you can grade what you were
given and cannot inspect what you were not.

One surface in the set closes that. A developer console offering grounding with search
displays the search query it actually ran — and displaying it is a stated requirement of
using the tool rather than a courtesy, which is a firmer basis for expecting it to stay.
Take the query, run it yourself, and the sources it cited come back at the top. The
retrieval is reproducible by hand.

That is what converts a phrasing failure from invisible to legible. When a badly chosen
phrase quietly steers retrieval, seeing the query is how you notice — you read what it
searched for, recognise it is not what you needed, and fix the prompt rather than the
output.

The same surface exposes a per-source confidence score, between 0 and 1, in the raw
response rather than the interface. It is worth being precise about what it measures: how
useful the model judged a document for answering the question. That is the relevance check,
automated — not authority, not recency, not corroboration. A recent, fluent, wholly
unaccountable post that addresses your question directly can score high. So it is a filter
to run before the four checks, at scale and in code, not a substitute for them.

The pattern underneath is worth naming, because it explains the trade rather than just
listing features: **more visibility, further from an end user.** The tool that shows the
most is the developer console, and the reason it should not be put in front of a client is
the same reason it is valuable to you.

## Related

- [Source-Quality Framework](source-quality-framework.md) — the four checks this argument exists to justify
- [Grounding](grounding.md) — the fence this assumes, and the audit test that stops working
- [RAG](rag.md) — the retrieval step whose failures leave no visible mark on the web
- [Choosing a RAG tool](choosing-a-rag-tool.md) — the grounding surface that decides whether you can audit at all
- [AI safety failure modes](ai-safety-failure-modes.md) — hallucination told apart from a faithful read of a bad source
