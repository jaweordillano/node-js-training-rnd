# Retro: M06 training module page (index.html + index.md, solution.html + solution.md)

## Criteria results (2026-10-13)

- Exactly one `<h1>` on each page, no `<script>`/`onclick`, no CDN; the only external link is the SQLite download page: PASS
- Every relative link and in-page anchor resolves (including cross-page links to `index.html#s5` and `#s6`); ids unique; every checkbox and radio has a label: PASS
- Only classes that exist in `assets/style.css`: PASS
- HTML and Markdown: the same sections in the same order and the same code blocks (73 on the index page, 54 on the solution page): PASS
- Time plan sums to 180 min: PASS
- Every SQL block on the index page was re-run in page order on the SQLite 3.54 command line and its output compared with the page: PASS
- Rebuilt from the page's own code blocks in a fresh folder: typecheck clean, `sql:check` 0/24 then 24/24 with the solution page's queries (also with indexes), injection output identical, ERD columns equal the real schema: PASS
- Scope: 3 h, my assumption, against the brief's 6 h. Brief unchanged: NEEDS USER CONFIRMATION
- Rendered in a browser; Mermaid drawn by GitHub: NOT CHECKED (the diagram passes Mermaid's parser)

## Issues found and fixed

- The `PRAGMA table_info` block was laid out by hand; replaced with the real output (BLOCKER).
- Overview said the seed data was in section 5; it is in section 2 (FIX NOW).
- The `node:sqlite` troubleshooting entry claimed older Node versions work; reworded to Node.js 24 only (FIX NOW).
- Section 5 had no time guidance for 24 exercises in 40 min; added a per-exercise budget and "read the answer after five minutes" (FIX NOW).
- Exercises 2 and 14 had identical result rows, so one answer could pass for the other; exercise 2 now searches for a different word.
- An empty "commit" step at the end of section 4 was removed (nothing was written there).

## Backlog

- Windows and macOS untested, including `winget install SQLite.SQLite`, `brew` and `apt`.
- The interactive `sqlite3` prompt and its exact error wording were not captured; older SQLite versions format tables and errors a little differently.
- DB Browser for SQLite was not tried.
- Time per section is an estimate. Section 5 (24 queries in 40 min) is the likeliest to overrun. Have a real student time it.
- Not viewed in a browser, and GitHub's rendering of the diagram was not checked.
- Hours: `brief.md`, `tasks.md`, the PRD, arch doc and README still say 6 h and a PR. The home page still says about 80 hours in total.
- `brief.md` asks the student to write their own exercises (trainer spot-check) and a junction-table guide; the page replaces both.
- M02 to M05 Google Docs are stale. M06 has none.
- `AGENTS.md` and `/create-training` describe one page pair per module. M04 and M06 added solution pages.
- Integer ids in the schema against UUID ids in the M05 API: M07 should decide.
- The page generator and sources live in the session scratchpad. Move a cleaned copy into `knowledge/patterns/` if M07 needs it.
- Cut but possible later: `ALTER TABLE`, views, triggers, window functions, 1:1 practice.

## Patterns worth reusing

- Give students a self-checking exercise set when there is no trainer: a checker that compares result values and order, with "right count, wrong values" told apart.
- Check a hash or fingerprint of the answer instead of the SQL text, so any correct query passes.
- Build the data with deliberate gaps (no match, no tag, unused tag) so each join type has something to find.
- Re-run every code block of the page, in page order, and compare its output with the next "You should see" block. It catches hand-typed output.
- If a tool is missing, download the official binary into a scratch folder to verify against the real thing. Do not guess its output.
