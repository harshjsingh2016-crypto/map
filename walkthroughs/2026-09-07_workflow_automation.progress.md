# Walkthrough — 2026-09-07_workflow_automation.md
Board: scalar/workflow-automation
Source: Armor/Output/2026-09-07_workflow_automation.md
Updated: 2026-09-13
Agenda confirmed: 2026-09-13 (summary + glossary presented 2026-09-12)

Board created empty this session, so every item is **missed** by definition; the tags below note
which are core structure and which are supporting material. No wiki article cites this board yet,
though several existing articles (rctfc-framework, prompt-costs, competent-reader-test,
diagnose-the-hard-part) are likely homes for what this lecture settles.

**Position in the course:** this is the *concepts* half of a three-part block — Day 13 covers n8n in
depth, Day 14 covers Zapier end to end. Where the file says a topic was deferred, that is the
lecture's design rather than a gap in the extraction.

- [x] §1 + §9 Why automate, and the Automation Mindset — the three-question test and four screening criteria — missed — discussed ✓ — accepted (four-criteria **mindmap** at the user's call rather than the table I proposed, three-question-test note, what-automation-is-for note). A fourth candidate — that the criteria are vetoes rather than a score, and that failure visibility is the only one about the aftermath — was offered **labelled as board-derived rather than the instructor's**, and **not boarded** on my recommendation; it went into the wiki article's own section instead, where the labelling is explicit. The résumé-asset aside left off: the file marks it as his read of the market, not a verified claim. New wiki article: when-to-automate.md.
- [x] §2 The Wanderline scenario and Kabir's solution sketch — missed — discussed ✓ — accepted (sketch flowchart with labelled decision branches, speed-not-quality note, and the four-criteria table run over this scenario). The third was offered **labelled board-derived** — the lecture teaches the criteria in §9 and the scenario in §2 and never runs one over the other — and the user took it; the table carries that labelling as its first row. **One flag raised** on the irrelevant branch: three branches is the instructor's own class simplification, agreed with a student, and the board has to decide whether to keep the sketch as taught or carry fuller branching once Day 13 builds it for real. Wiki: when-to-automate.md gains the worked case and the rule-clarity-without-computability point.
- [x] §3 Parts of a canvas — the two vocabularies, the 5:00 PM analogy, where the AI node earns its place — missed — discussed ✓ — accepted (two-vocabularies table including the resolution of the notes' p.1/p.2 apparent contradiction, AI-node note, 5:00 PM flowchart). The AI-node note closes with a **board-derived** paragraph, taken at the user's request and labelled inline: if the model's job is normalisation then the test is whether it returned a known value, not whether it was right — an out-of-set answer is mechanically detectable, an in-set-but-wrong one is not. New wiki article: workflow-grammar.md.
- [x] §4 iOS Shortcuts as a worked non-canvas example — missed — discussed ✓ — accepted (ten-step table, canvas-is-a-shape-of-thinking note, cost-is-invisible note). The third was taken **against my recommendation** — I judged it thin on the instructor's side (he states that dictation is free and draws nothing from it) and speculative on mine; the user took it anyway and it is boarded with the board-derived half separated below a rule and framed as a question to ask of a build rather than a rule. Wiki: workflow-grammar.md gains the outside-a-canvas section — the grammar holds with no canvas, the three words are not a checklist (this shortcut has no condition), and four of ten steps are JSON extraction that a node hides.
- [x] §5 n8n — what it is, fair-code, the lead-router build, Groq, API-key hygiene, the bias detour — missed — discussed ✓ — accepted (all five offered plus a sixth: lead-router flowchart, build-notes note, "2 small booking" note, API-keys note, bias table, fair-code table, and a Groq-not-Grok note folded in with the model-name caveat). The section is twice the size of the others and was offered as four-plus-a-fifth rather than crammed; the user took all of it. **Three low-confidence items handled:** the Groq model variant is boarded as unrecoverable with an instruction to check the console rather than trust any written name; the polling-vs-webhook friction is boarded as **polling** per the file's resolution, with the "sort of like a webhook" aside left off; the bias boundary is boarded **in the mid-teens without a hard number**, with the caveat that he probed a chat assistant rather than the model on the canvas. New wiki articles: api-key-hygiene.md, fair-code.md; workflow-grammar.md gains the `2 small booking` failure as the live example of normalisation breaking.
- [ ] §6 + §11 The self-hosted n8n homework, the assignment and the mini build — missed — pending
- [ ] §7 Zapier — the connector argument, the build, the one mechanical difference, n8n vs Zapier — missed — pending
- [ ] §8 HTTP — the five methods, payload and response, webhooks, Postman — missed — pending
- [ ] §10 Quizzes 1–4 and their reasoning — missed — pending
- [ ] §12 Doubt session — composing multiple automation tools (the on-topic part) — missed — pending

**Low-confidence material to raise with the caveat attached, never as fact** (file §14): the Groq
model name (transcript garbles it; clearly a Qwen model, variant unrecoverable); polling vs webhook
for n8n's own Sheets trigger (trust the poll-interval setting, not the later "sort of like a webhook"
aside); "a webhook uses the GET API behind the curtain" (webhooks are typically POST); the GDPR and
data-residency specifics (concern real, specifics are recollection); HTTP method updates (explicitly
unresolved in class); "ChatGPT Astra" / GPT-6 (unverified and off-subject — do not carry forward);
Zapier's connector count (marketing figure); Bitbucket/Status Hero availability; and the ~15-person
bias boundary (it is ChatGPT's answer, not the model wired into the canvas — the principle transfers,
the number does not).

**Bookmark drift** (file §14): *Guided Exercise* and *Mini Build* mark Quiz 4, not those sections —
no guided exercise was run and the mini build was moved to Discord. *Wrap-Up* and *Doubt Resolution*
are five seconds apart; there is effectively no wrap-up.
