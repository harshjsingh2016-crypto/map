---
boards: [scalar/n8n-automation, scalar/zapier-automation, scalar-2/ai-agent-concepts]
updated: 2026-09-24
---

# Right-sizing the model

Parameter count is the crude proxy for a model's capability, and a workflow builder needs two
separate readings of it: what a size can do, and what a size will run on.

On capability, the working thresholds are blunt. Under 15 billion parameters is generally not very
powerful. Over twenty to twenty-five billion a model can be stable and useful, while still being
nowhere close to the frontier assistants people compare everything against. Nothing in that range
is a substitute for the hosted flagships; it is a different tier being asked to do a smaller job.

On hardware, the same numbers say something else. Eight to twelve billion parameters will
potentially run fine on a laptop through a local runtime. Twenty-seven billion is going to fail for
sure on that laptop. Around a hundred and twenty billion is impossible even with two or three
high-end consumer cards. This is why "we could run it locally" and "we could run it locally *here*"
are different claims, and why the privacy-driven local deployment is also a capability decision.

The principle that follows is genuinely right: **a simple request does not need an expensive
model.** Summarisation is simple; any model can do it; reaching for the most capable option on a
one-line summarisation task is paying for nothing.

Two things sit against it, and both matter more than the principle does.

The first is the **cut-off date**, which is orthogonal to size. A mid-sized model with a 2023 cut-off
is fine for English summarisation or general coding and useless on any library or product newer
than that — it will answer confidently about something it has never seen. There is no single
reliable page listing cut-offs; you ask the model, or read the model pages of whichever local
runtime you use.

The second is that **"simple task" is a judgement, and you can get it wrong.** The lecture's own
worked build chose a small model for exactly the right stated reason, and the choice held through
two builds before failing in the third — where the task had quietly stopped being summarisation and
started being synthesis over retrieved data. Handed two rows, the model reported a hundred bookings,
then fifty, then five, and a temperature unrelated to the one the API returned. Instructing it not
to invent numbers changed nothing; a stronger model was grounded on the first attempt. The failure
did not announce itself as a sizing mistake, it announced itself as wrong content in an email.
Right-sizing is correct as a default and needs re-checking every time the job changes shape.

One side effect of the upgrade is worth knowing about in advance. The stronger model, being
grounded, reported one of its inputs as *missing* — exposing a broken expression that the weak model
had been covering with a plausible invented value. A model that fabricates does not only produce
wrong output; it hides the defects upstream of it, and fixing the model is sometimes how you find
out what else was broken.

One last framing, which is a reading of the material rather than a line anyone said. Sizing is the
*third* of three decisions, and it is usually asked first. Does this work need a model at all, or
does something else own the answer? If it needs a model, does it need an agent with tools, or does a
plain chain do it? Only then: how big? Asked in that order, a good deal of the sizing question
dissolves — the expensive call was never the right shape of call.

The middle decision was later stated outright rather than inferred. An agent costs more money per
run, because it makes several calls before it answers, and more time, because every pass is
latency. Adding an agent everywhere does not make a system smarter; knowing where an agent is
needed and where a chatbot will do is the skill. The same instinct that reaches for the biggest
model reaches for the agent, and both are the truck in the bike race.

## What the number in a model's name tells you

A model name like *GPT-OSS-20B* decomposes cleanly: a family, a company, an open-weight release, and
a count of learned weights. The count is the part people over-read, and it is worth sorting what it
does and does not tell you.

It tells you, **reliably, what hardware the model needs.** Anything beyond fifteen to twenty billion
parameters will not run on a general laptop — which agrees with the thresholds above.

It does **not** reliably tell you capability. More weights generally means more capable, but smaller
recent models have matched much larger older ones, so the count is a weak proxy for how good a model
is and a strong one for how heavy it is.

And it does not tell you price, which depends on age as much as size: a four-year-old large model
can cost less than a new smaller one. **Size, capability and price are three separate axes**, and
the parameter count sits squarely on only the first of them.

## Related

- [Model cards](model-cards.md) — the spec sheet where capability and training data are meant to be stated
- [Prompt costs](prompt-costs.md) — the other half of the same trade-off, priced per token
- [The LLM chain and the agent node](llm-chain-vs-agent.md) — the second of the three decisions, and what the agent loop costs
- [Hosted or on your own machine](self-hosting-tradeoffs.md) — where the hardware ceiling on local models actually bites
