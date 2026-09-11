---
boards: [scalar/multimodal-gen-ai]
updated: 2026-09-10
---

# Diffusion

How images are generated, and it is not how text is generated. The distinction explains the
artefacts everyone has seen, the reason video clips arrive in short lengths, and why a seed is a
useful thing to write down.

Every generation begins from a **screen of random noise** — random pixels, random colours, no
content of any kind. The **seed** is the identifier for which noise you started from; a student's
phrasing that the instructor accepted is that it is the unique identification for the white noise
image. From there the process removes what does not belong. The teaching analogy is a sculptor: a
block of marble, the artist chips away everything that is not the statue, and what remains is the
sculpture. Diffusion changes and strips pixels that are not needed until the image is what is left.

The load-bearing difference from a language model is **where the work happens**. An LLM predicts
the next token, then the next, each conditioned on what came before, so stopping it halfway through
"the capital of France is" still leaves something coherent — like closing a book at a random page.
Diffusion does not produce one piece and then another; it operates **across the whole frame at
once**. Stop it halfway and you have nothing, because a partial diffusion is not a partial image,
it is noise that has not finished resolving.

Mechanically the process is iterative denoising over many passes rather than a single step, and it
is worth being precise about that, because the useful contrast is not "one step versus many" but
"everywhere at once versus one piece at a time".

## What falls out of it

**Two trunks.** Ask for an elephant and you may get two. While the process is resolving pixels on
one side of the frame, it settles that a trunk belongs there — without registering that one already
exists elsewhere. Three hands, two noses, a smile that sits wrong: all the same cause. The model is
not ignorant of elephants. **No single step of the process is looking at the whole animal**, so
local plausibility can win against global sense.

**Video is expensive in a way that does not amortise.** One image is one full diffusion. A few
seconds of footage at any usable frame rate is tens of images, each one its own complete process.
That single fact orders the whole field: video generation is slower than image generation, and
image generation is slower than any LLM output. It is also why clips come in short fixed lengths
rather than arbitrary ones — the cost is per frame, and a longer clip buys no efficiency.

## The seed as a working tool

If a generation comes out right and you want the next one to keep that quality, supply the **same
seed**. It does not guarantee consistency; it gets you much closer. The instructor's framing is
that it is not a system prompt — a system prompt grounds a language model — but some bits of
grounding toward the output.

**Seeds are not portable across tools.** A seed from one image tool does nothing useful in another,
and that follows directly from the definition: a seed indexes *that tool's* noise, it does not
describe a look. By default each generation picks a random one, and in current tools that
randomness barely affects the final result, which is why the rubber-banding that used to appear
between successive video frames has largely gone.

## Related

- [Next-word prediction](next-word-prediction.md) — the mechanism this is being told apart from
- [Model dials](model-dials.md) — the other generation settings, and which ones image tools stopped exposing
- [RCTFC Framework](rctfc-framework.md) — the Four S's, the prompt side of the same generation
- [The realism balance](realism-balance.md) — what to do with the output once you understand how it was made
