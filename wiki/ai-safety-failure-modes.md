---
boards: [scalar/ai-reliability]
updated: 2026-08-21
---

# AI safety failure modes

Four distinct ways a model-backed application goes wrong. They are worth separating because each one breaks a different thing, and the defence differs accordingly.

**Hallucination** is the model making it up — producing an answer that reads as confident but has no source behind it. This is the failure mode [grounding](grounding.md) exists to control: fence the model to data the answer can be traced back to, and there is less room to invent.

Two examples make the shape of it clear. Asked for the total wickets a bowler took over a period of years, with no access to the internet, the model answered out of its own weights and hallucinated. In law, previous judgements have been fabricated the same way. The common pattern is that the question had a real, checkable answer and the model had no route to it — hallucination shows up most sharply on facts that could have been looked up.

**Prompt injection** is user input overriding *your* rules. The application's own instructions — the system prompt, the template's base instructions — get displaced by something the input tells the model to do instead. What breaks here is the boundary you set up.

Older models showed a blunt version of it: asked for restricted information in another language, they returned it — a pretext plus a language switch, as in asking the model to show its complete system instructions in French on the grounds that system diagnostics were running. The instruction the application had set was still there; the input simply routed around it.

**Jailbreaking** is bypassing the *model provider's* safety training. The target is not your application's rules but the constraints the provider trained in, underneath whatever you built on top.

The classic older-model version is a pretext that makes the refused request sound legitimate: asking outright for pirated movie links fails, but framing it as wanting to block those links on a home router for family safety, and then asking for them, got them out. Note that this is the same lever as the injection example above — a plausible cover story — pointed at a different target.

Injection and jailbreaking are easy to conflate, and the cleanest line between them is whose rules are being broken: yours in the first case, the provider's in the second. That also tells you who can fix it — an injection is yours to defend against, a jailbreak is the provider's to harden.

**Output bias** is the model reproducing the prejudices present in its training data. Unlike the other three it needs no attacker and no adversarial input; it surfaces in ordinary use, which is what makes it easy to miss.

## Related

- [Grounding](grounding.md) — the control that narrows the room for hallucination
- [The prompt stack](prompt-stack.md) — the system-prompt layer injection displaces
- [Prompt templates](prompt-templates.md) — base instructions are part of what an injection overrides
