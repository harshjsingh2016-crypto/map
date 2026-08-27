---
boards: [scalar/ai-ecosystems, scalar/knowledge-management-and-rag]
updated: 2026-08-28
---

# RAG

Retrieval Augmented Generation — the technique for having a model use specific files or
data rather than answering from training alone.

It sits directly under KB files in the ecosystem, and the division of labour is worth
holding onto: the KB is *what* the model is allowed to draw on, RAG is *how* the relevant
piece of it reaches the prompt at answer time. A knowledge base of any size cannot be
pasted in wholesale, so retrieval selects the fragments that bear on the question and
those fragments — not the whole store — are what the model actually reads.

This makes RAG the mechanism behind [grounding](grounding.md) rather than a separate idea.
Grounding is the rule that the answer must come from supplied data; RAG is the plumbing
that supplies it.

## The name is the pipeline

The acronym is not decoration — each letter is one stage, and they run in order.

**Retrieval** fetches the relevant files and searches through them. **Augmented** injects
those specific notes into the prompt. **Generation** has the LLM write the answer using
only the notes it was handed.

The middle letter is the one that reads as jargon, and the way in is augmented reality:
AR inserts a virtual object into your real surroundings, so *augmented* means insertion
into something that already exists. In RAG the thing being inserted into is the prompt.
Naming the insertion target is what turns the letter from a label into a step you can
point at.

Reading it as three stages rather than one technique is what makes failures locatable. An
answer that is wrong because the wrong files came back is a retrieval problem; an answer
that ignores correct files is a generation problem. They do not have the same fix.

The rule sharpens once you notice the middle stage never appears in it. Missing or wrong
documents are always retrieval's fault. Wrong output from complete documents is
generation's fault. Augmentation essentially never fails, because copying retrieved text
into a prompt is mechanically trivial — there is nothing in it to get wrong. The
three-stage model is really a two-suspect model, and one of the two is far more fragile
than the other, so retrieval is where to look first every time.

Retrieval is also less bounded than the word suggests. It can draw on the open web, a
managed knowledge base, documents you uploaded, or a SQL database. RAG is not confined to
files you hand over, and reading it as an upload feature understates what the retrieval
step can reach.

## You are already using it

RAG reads as a technique you would go and build, which makes it easy to miss that it is
the default plumbing of the tools already in use. Gems does RAG. ChatGPT does, including
every time it searches the web rather than answering from training. Cursor does it when it
picks a handful of files out of a thousand-file repository to put in front of the model.

This matters for how the rest of the material lands. The question in practice is almost
never whether to use RAG, but how much engineering has gone into the retrieval step of
whatever is already doing it — which is the axis the tools genuinely differ on.

## Partial retrieval fails silently

The stages are sequential, so generation inherits whatever retrieval decided — and it has
no way to know what retrieval left behind.

The cricket example makes this concrete. A store holds notes on three matches alongside
other match notes, and the question asks about a player's performance. If the augmentation
step never injects the notes for the second and third match, the model still answers, and
it answers confidently. The output carries no signal that two thirds of the evidence was
missing. It does not read as incomplete; it reads as finished.

Worth separating out what kind of failure that is. The model did not hallucinate and it did
not reason badly — on the evidence it was handed, "superstar" is the correct reading. It
reasoned correctly over an incomplete picture. That is a third category alongside a
retrieval fault you can see and a generation fault you can argue with, and it is the one
with no internal signature: every step behaved, and the output is wrong anyway.

That is the failure mode worth designing against, because it is invisible at the point of
use. Confidence is a property of how models write, not of how much they were given. The
countermeasures sit at the seams rather than in the model: check whether retrieval returned
all the relevant chunks and not merely the top-scoring ones, and have the answer cite which
notes it used, so a thin retrieval becomes visible in the output instead of staying silent.

The sharpest version of this is that your guardrails are themselves retrievable documents.
Amazon's internal assistant surfaced internal documentation to a user probing it, and the
reading given is that retrieval fetched the internal documents but missed the document
carrying the instruction not to share them. The restriction was written down and it still
did not apply, because a rule the model never retrieved is a rule that is not in the
prompt. Anything you are relying on as a constraint sits in the same lottery as the
content it is meant to constrain.

That is what makes a retrieval miss more than an accuracy problem. Most misses cost you a
weaker answer; the miss that matters is the one where the absent document held the security
or legal constraint, because the output then reads exactly as well as a correct one while
having quietly lost the thing that made it safe. The mitigation is not better retrieval,
which cannot be guaranteed — it is a guardrail on the output, checked after generation
rather than hoped for before it.

## Two reasons to reach for it

The first is that your data may not be public knowledge. *PSP* inside one organisation
means problem solving percentage; outside it, PlayStation Portable or payment service
provider. No amount of training data resolves that — only the organisation's own
documentation does, which is a retrieval problem rather than a model-capability one.

The second is [grounding](grounding.md): you want the answer to come from a source you
chose rather than from training. These are different needs and they fail differently. The
first fails as a wrong answer about your own terminology; the second fails as a confident
answer about the world with nothing behind it.

## Influencing retrieval, and detecting when it failed

Retrieval is not under direct control, which makes it tempting to treat as weather. It
isn't — four things shift it, in rough order of reliability. Naming the files explicitly in
the prompt is the strongest: ask for match 1 and match 2 by name and both are in the
prompt. The system prompt can carry standing rules about how documents get selected and
which are conditional. Document structure matters more than it looks, because headings and
formatting change the embeddings that get generated and therefore what a query matches
against — which is why document hygiene is a retrieval intervention rather than tidiness.
And the context window bounds how much can be carried at all.

Worth separating from those: checking recall and having the answer cite its sources are not
levers. They do not make retrieval better, they make a bad retrieval visible. Influence and
detection are two different jobs, and a system that only does the first has no way of
knowing when it failed — which is precisely the silent-failure problem. The levers are
also empirical rather than guaranteed; naming files works cleanly at three documents and
stops being available once the store is large enough that you cannot enumerate it.

What replaces naming at that scale is not a fifth lever. It is the two remaining levers
applied deliberately — document hygiene, meaning clear names, titles and structure, which
is a retrieval intervention because it changes the embeddings; and explicit steering in the
system prompt about which files must always be consulted and which are conditional — plus
the acceptance that the rest is empirical. You cannot guarantee retrieval, so you test,
observe and iterate. Tuning this for a single product is a months-long job, and starting a
new product means starting over. Treating retrieval quality as something to be configured
once is the mistake; it behaves more like a system to be tuned and re-tuned.

Detection has a cheap complement worth keeping in reach: asking the tool directly to show
its source of truth will generally surface the underlying documentation. That converts a
claim you would otherwise have to take on trust into one you can check against the store.

## A store does not refresh itself

Retrieval quality is usually discussed as a matter of selection, which hides a slower
failure: the store going out of date. A notebook holds whatever was uploaded and nothing
more, and it will keep answering fluently from stale material long after the material stops
being true. Nothing in the interface marks the difference.

Two routes keep it current. A pipeline can push updated documents in through an API, or a
source can be added that is itself live on the web, so freshness is a property of the source
rather than of anyone's discipline. Absent one of those, the honest default is to treat the
contents as stale and say so wherever the output is used. This is a manual problem today
rather than a solved one — connectors and workflows are the answer, and they are a layer the
tooling has not made routine yet.

## Related

- [Grounding](grounding.md) — the rule RAG implements
- [Persistent context architecture](persistent-context-architecture.md) — where KB files sit relative to instructions
- [AI safety failure modes](ai-safety-failure-modes.md) — confident-sounding wrong answers as a general pattern
