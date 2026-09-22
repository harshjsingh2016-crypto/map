---
boards: [scalar/zapier-automation]
updated: 2026-09-22
---

# Where the filter goes

On a platform that bills per action, the position of a conditional step is a pricing decision, and
it is the cheapest optimisation available.

The setup: a filter sitting at step two stops around seventy per cent of incoming rows. Somebody
moves it to step four, *after* an expensive model call, reasoning that the AI can help decide. What
happens to the bill?

It goes up substantially. With the filter first, the model runs on the thirty per cent that survive.
With the filter last, the model runs on **every** row and seventy per cent of that spend is thrown
away one step later — "we are getting the summary and we are not doing anything with the summary."

Two things make this worth more than a rule of thumb.

**The bad move is not a stupid move.** "So the AI can help decide" is a real pattern; there are
cases where you genuinely need the model's output before the condition can be evaluated. The
question is not whether the design is sensible but what it costs, and those two come apart. When
they do, the honest answer is to price the version you want and decide deliberately, not to
discover the bill later.

**There is no optimiser.** One student read the explanation as *filters lower in the stack are
evaluated more efficiently* — which is exactly right in a query planner, where predicate pushdown
and short-circuiting mean placement is the engine's business rather than yours. An automation
canvas has none of that. The steps run in the order you wrote them, every time, and each one bills.
The redraw that settles it: **"the lower the filter goes, the higher the cost goes."**

From which: a filter is worth exactly as much as whatever sits *after* it, so its value falls
monotonically as it moves down. **Put filters before tasks**, and specifically, put the filter
immediately before the most expensive step it can legitimately guard.

## Related

- [Tasks, and what an automation actually costs](tasks-as-the-billing-unit.md) — the unit this is optimising, and why free steps are free
- [Batching to decouple cost from volume](batching-to-decouple-cost.md) — the other lever, when ordering has already been done
- [The item model](the-item-model.md) — the same ordering argument on another platform, where node order sets the call count
