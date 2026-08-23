---
boards: [scalar/ai-ecosystems]
updated: 2026-08-24
---

# Model dials

The generation settings exposed in a developer playground and fixed at defaults everywhere
else — temperature, top-p, and tokens. A Gem or a Project runs the same model underneath;
it simply does not offer the knobs.

**Top-p** limits the pool of words considered, by probability span: top-p = 0.6 keeps the
most likely words up to 60% of the cumulative probability and discards the tail.
**Temperature** governs how boldly the model chooses among whatever remains. The clean way
to hold them apart is that top-p picks which words are eligible and temperature decides
how adventurously it selects from that pool.

Because both narrow the same choice, they are not adjusted simultaneously. Move one at a
time — with both moving, an improvement or a regression cannot be attributed to either.

## Related

- [Persistent sandbox tools](persistent-sandbox-tools.md) — Google AI Studio is where these dials are exposed
- [Next-word prediction](next-word-prediction.md) — the probability distribution these settings act on
