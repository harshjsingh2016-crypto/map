# Walkthrough — 2026-09-11_zapier_automation.md
Board: scalar/zapier-automation
Source: Armor/Output/2026-09-11_zapier_automation.md
Updated: 2026-09-22
Agenda confirmed: 2026-09-22 (summary + glossary presented 2026-09-21)

Board created empty this session, so every item is **missed** by definition. No wiki article cites
this board yet. The seven articles on the Day 12 board and the thirteen on the Day 13 board are the
prior context — `choosing-a-workflow-tool.md` in particular was written generically about "two
platforms" and §9 of this lecture is the named comparison, so it is the likeliest article to deepen
rather than duplicate.

- [x] §1 + §2 Why Zapier at all — Wanderline's three complaints, the one-trigger structure — and Zap terminology including action vs task — missed — discussed ✓ — accepted (dependency-argument note keeping the export-versus-ownership distinction precise; terminology table with Filter carrying the shield emphasis; action-vs-task note boarded separately from the table, since filter placement and the cost quiz both attach to it)
- [x] §3 Zap 1 — two steps, one published Zap, and what watching it run revealed — missed — discussed ✓ — accepted (Zap 1 flowchart ending on the any-change flaw; the delay accounted stage by stage as a table; Gotchas note opened. The account facts were folded into the trigger node's detail as agreed, with the plan numbers left off as unverified. One wiki correction fell out of this: polling-vs-webhooks said the poll interval was one you set — on this platform it is not, and the article now says so)
- [ ] §4 + §4.1 Zap 2 — teach it to skip, the Filter; and proving it with Zap History — missed — pending
- [ ] §5 Tasks — what actually costs money, filter placement, and the Digest aggregation pattern — missed — pending
- [ ] §6 Zap 3 — make it fork: the AI action, Paths, the run, and when two paths match — missed — pending
- [ ] §7 + §8 Zapier Tables, and Zap History statuses — missed — pending
- [ ] §9 Zapier or n8n — the honest comparison — missed — pending
- [ ] §10 The four quizzes with the instructor's reasoning — missed — pending
- [ ] §11 + §12 Assignment, and the doubt session — missed — pending

**Low-confidence material to raise with the caveat attached, never as fact** (file §14): the plan
numbers (trial length given two ways, task allowance "750 or 1,000" — unverified; only the $20
monthly figure was consistent); the **Digest monthly arithmetic**, where the file corrects him — two
tasks per hour is 48 a day and around 1,440 a month, not the 24 a day and 720 a month he said, so
the pattern's logic holds and the sizing does not; the **aggregation cost rule**, read live off
Zapier's help text during the break and never confirmed; the "1,500 billion open weights" estimate
for a closed model; the **garbled Qwen parameter counts** (the claim is that smaller models match
larger ones, not any figure); the hedged "editing the sheet might stop the Sheets trigger polling";
the OAuth-review and 2018-script stories, offered as personal anecdotes; and the "EN file" guess.

**Three places the printed notes depart from what was built** (file §14) — the video is authority
for what happened, the panels describe a planned build:
1. **Zap 2's contents.** The printed diagram gives Zap 2 four steps, Filter *and* a Groq write-reply
   action. The recording added **only the Filter**; the Groq step first appears in Zap 3. The
   handwritten line matches the video. Nothing writes back to the sheet in any build.
2. **Zap 3's destinations.** The diagram routes Path A to Zapier Tables and Path B to Notion. In the
   recording **both paths post to Google Chat**; Tables was set as self-study and Notion was never
   mentioned. The `NEW` labels describe the plan, not the delivery.
3. **"Google Meet"** on notes p.3 is a slip for Google Chat.

**Two host bookmarks have no matching content** — *What We Deliberately Did Not Build Today* and
*Your Automation Portfolio*. Neither topic was spoken; they look like slide headings skipped when
the class ended early. Nothing to board from them.

**This lecture has four in-class quizzes**, unlike Day 13 — so §10 is real teaching content and the
Internal QnA drill later has the instructor's own questions to draw on.
