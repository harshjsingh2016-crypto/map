---
boards: [scalar/web-grounding-citations]
updated: 2026-08-29
---

# Source-Quality Framework

Four checks a citation passes through, and only a citation clearing all four is
trustworthy: **Recency** (when was this published), **Authority** (who published it),
**Corroboration** (do others agree), **Relevance** (does it answer *this* question). The
framework exists because [a citation certifies provenance, not judgement](citation-credibility.md),
so the check has to be run on the source rather than on the answer.

Three of the four are the known failure modes inverted — from *how a source breaks* into
*what to ask it*. The fourth is different in kind.

## Relevance is the check for a good source doing the wrong job

The failure mode here is not an off-topic article; that is caught instantly and needs no
framework. It is a source that is recent, authoritative, corroborated and genuinely
excellent, answering a question adjacent to the one asked. Every quality signal fires.
Nothing about the source is wrong. It is easy to miss precisely because everything else
checks out, which is what earns it a place alongside the three failure modes rather than
inside them.

## Recency runs first, and it overrides the rest

The order is not arbitrary and the weighting is not equal. Ask who the Prime Minister of a
country is and get an answer naming the holder from twenty years ago, supported by ten
genuine news articles from that year. Authority passes — real news organisations. Relevance
passes — directly on the question asked. Corroboration passes hardest of all, because ten
contemporaneous reports of the same true fact will always agree with each other.

And the answer is wrong.

What makes the case instructive is that the articles are not even wrong. They were accurate
when published. There is no bad source anywhere in the chain, nothing the other three checks
could possibly catch. Recency fails alone and fails the whole thing — it is not outvoted
three to one, it invalidates the other three passes, because those checks were run against
sources answering a question about a different year.

That is also why it runs first rather than merely counting for more. Verifying the
credentials of a stale source is careful work on the answer to a question nobody asked.

## Recency means matching the window, not preferring the new

The mirror case keeps the check honest. The tense of the question sets the window the source
has to sit in. *Who is the PM* wants today. *Who was the PM* wants the full list, or the
most recent — and a partial list from somewhere in the middle is itself a recency failure,
however impeccable each article behind it. Sometimes the correct window is all of history.

## One failure means unverified, not false

The framework's endpoint is a downgrade rather than a rejection: everything that clears all
four is trustworthy, and a single failure sends the claim back for verification before you
act on it. This is worth holding firmly, because the looser phrasing — that an
uncorroborated claim is therefore incorrect — overshoots. A source can fail a check and
still be reporting the truth. What it has lost is the right to be acted on unchecked.

## The framework is the second line of defence

There is a failure the four checks cannot catch, and it happens one step before they run.

The demonstration is a question about an unfolding conflict phrased as *what was the last
strike*. That phrase has a life of its own on the web — it is how headlines describe a
completed, named, well-covered event — so retrieval optimised for documents matching it and
returned the older, heavily reported strike. A more recent incident existed, ambiguous and
unattributed, which nobody had described that way. It was in the citation set. The summary
went past it.

Run the checks on what came back and every one of them passes. Authoritative outlets,
heavy corroboration, directly relevant to the question as asked, recent enough on its face.
The tool retrieved well; it optimised for exactly the phrase it was given. The framework
grades the sources you were shown, and the phrasing had already decided which sources you
were ever going to see.

So there are two independent failure points, and they run in order. Prompt-side: restrictive
wording or the wrong terminology, and recency is compromised before a citation exists to
check. Source-side: a good prompt returns a good answer built on stale sources, which is
what the four checks are for.

The move that follows is to push the framework upstream — state in the prompt that recency
is to be prioritised, that sources should be corroborated and should carry authority. The
checks stop being something applied to output and become something shaping retrieval.

## Fluency is not one of the checks

Two failures bracket this from opposite directions. A forum joke about glue on pizza was
retrieved faithfully and was worthless. A recent, articulate post arguing a technical claim
with apparent rigour — no peer review, no methodology, not even citing the study it invokes
— reads as entirely convincing. As the instructor puts it, reading it will make you feel it
is absolutely correct, and it is not.

One was written badly and retrieved well; the other was written well and grounded in
nothing. Both defeat a reader who is judging how a source reads rather than what stands
behind it.

The consequence is a distinction between searching and publishing. Nothing here argues for
excluding sources from a search — you may well want to know an argument exists. The rule
governs what reaches the output: a source that fails the checks does not travel onward to a
client or an end user. Search wide, publish narrow.

## Stale is counterproductive, not merely useless

Worth pushing the recency case one step further than "the answer is out of date". An article
from March reporting an athlete perfectly fit cannot justify a claim about his fitness in
July, because anything could have happened in between — and the instructor's word for that
is *counterproductive* rather than useless.

The distinction matters. A stale source does not leave you where you started. It leaves you
worse off, holding a confident belief attributed to a real article, having stopped looking.
Absence of information makes a person cautious; stale information makes them certain and
wrong.

There is a measured signal that this is the hard idea rather than the obvious one. Across a
set of quizzes on this material, the recency question was the only one to score badly —
roughly three quarters of a room, against near-universal scores on the rest — and it was the
check that had been taught most emphatically. *Recency is relative to the question* resists
being held, because every instinct says a good article is a good article. It is the failure
where nothing looks wrong.

The ordering shows up as procedure too. Working such a case by elimination, corroboration
is never reached at all: the first question is whether it was even correct to pick this
article. You do not corroborate a source that has not cleared recency.

## Related

- [Citation credibility](citation-credibility.md) — why the check has to run on the source, and the three failure modes this inverts
- [Grounding](grounding.md) — the fence whose audit stops working on the open web
- [Choosing a RAG tool](choosing-a-rag-tool.md) — which tools show you enough to run these checks
