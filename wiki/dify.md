---
boards: [scalar/no-code-ai-bot]
updated: 2026-09-05
---

# Dify

An open-source platform for building LLM-powered applications without writing code. You pick a
model, write instructions, attach a knowledge base of your own documents, and publish — as a
hosted web app, an embeddable widget, or an API.

It sits at the model-decides end of the [control dial](control-dial.md): you supply documents
and instructions, and the model composes every reply. That makes it the fastest of the three
tools to a working FAQ bot, and the one with the least say over what comes out.

## Three clarifications worth making early

**It is not an LLM.** It is a wrapper that sits on top of Claude, Gemini, DeepSeek and others,
makes the model call, and does work around it. You still bring a model, and the choice of model
is yours.

**It is not itself an agent.** It is a tool for *building* agents. The distinction matters when
describing what you shipped: you built an agent, using Dify.

**It can be self-hosted.** Their cloud or your own server, because the whole thing is open
source. This is not a footnote — it is the sentence that keeps an enterprise conversation alive
the moment a client says the word "data", where a pure SaaS proposal would end there.

## The retrieval flow, with the acronym removed

The pipeline Dify runs is [RAG](rag.md), and it is more instructive drawn without the name. A
user query goes two places at once. It goes to a search over the knowledge base, which returns
the material bearing on the question — that half is *retrieval*. That material is then inserted
into the prompt alongside the original query — that half is *augmentation*. The combined prompt
is what the model answers from.

What is different about seeing it here rather than as a technique is that the stages are a
product surface: in Dify they are three things you wire together on a canvas, which means they
are also three things you can wire together wrongly.

## The build is four nodes, in a line

User input, knowledge retrieval, LLM, answer. No branches and no decisions — the linearity is
the defining property, and it is what a flow builder is contrasted against later. Two settings
inside it carry the reliability of the whole thing.

**Temperature goes low.** Internal data should not hallucinate, and creativity and
hallucination fall together. The rule of thumb worth keeping is that grounded retrieval and a
high temperature are contradictory settings: the point of retrieval is that the answer is
determined by the documents, and temperature is the dial that lets the model wander away from
what is determined.

**Web grounding, URL context and code execution go off.** This is the configuration half of
what the system prompt already said in words. The prompt asks for the retrieved context only;
these switches make the open web unreachable. Both are worth having, because one is a request
and the other is a wall.

## The failure worth studying: declaring is not interpolating

The live demo broke for twenty-five minutes on the wire between two working nodes, and the
symptom is the transferable part. The bot fired its no-answer fallback while emitting a
citation to the very document that held the answer.

That pair of facts looks contradictory and is actually the diagnosis. The citation proves
retrieval ran. The refusal proves generation received nothing. Both nodes were doing their job,
so the break had to be between them — a contradictory symptom locates a fault at a boundary
rather than inside a stage, and reading it that way is faster than suspecting either end.

The cause: selecting the retrieval result in the LLM node's Context field is not enough. The
variable must also be referenced inside the prompt body with `{{ }}`. The Context field
declares what is *available*; the reference is what *interpolates* it into the string the model
receives. Declare without referencing and the model gets a prompt containing no documents — and
then correctly answers that it doesn't have the detail, exactly as its rules instruct.

Two notes the instructor drew from breaking his own demo. Getting stuck on a tool that changes
every few weeks is the process rather than a failure of skill. And debugging burns a free tier
fast, because every preview run is a paid model call — on a pro-class model rather than a
flash-class one, a debugging session is the most expensive way to spend free credits.

## Where it breaks: generation is not retrieval

The failure that decides where Dify belongs is not a bug and cannot be configured away. Asked
to list four packages held in the knowledge base, the bot returned one. Retrieval had worked —
all four were in the prompt. Generation decided one was good enough.

There is no setting for "use all of it", because the thing deciding is the generation step, and
generation is where your control ended. This is a different class from a wiring fault: nothing
is broken, and the system is working as designed.

The commercial version of it is sharper. Asked about a cancellation twelve days out, the bot
told a customer he would get "most of his money back". The real slab for under fifteen days was
25%. Nothing was hallucinated — the right document was retrieved and the right number was in
it. The model was even obeying its instructions: told never to invent a refund percentage, it
stated none and reached for natural language instead. **The prompt banned invention; it did not
ban vagueness.** The customer screenshotted the reply, and a wrong sentence being quoted back is
a commitment someone will argue you into honouring.

Adding *"use exact terms and numbers from the knowledge base"* to the prompt stops that
particular case. It does not converge, because every prompt fix is written against a failure
already observed, and the next one arrives the same way this one did. That unbounded surface,
rather than any weakness in the tool, is the argument for a flow builder.

Where Dify does belong is wherever the [competent-reader test](competent-reader-test.md)
passes: internal tooling, broad-coverage Q&A, anywhere a reader would notice a wrong answer.

## Related

- [The control dial](control-dial.md) — where Dify sits, and what that costs
- [RAG](rag.md) — the pipeline underneath, and why it does not distinguish one tool from another
- [Grounding](grounding.md) — what attaching a knowledge base is actually buying
- [The competent-reader test](competent-reader-test.md) — the rule that decides whether Dify's output is safe to ship unreviewed
