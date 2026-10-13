# Retro: M08 training module page (index.html + index.md)

## Criteria results (2026-10-13)

- Exactly one `<h1>`, no `<script>`/`onclick`, no external links or CDN: PASS
- Every relative link and in-page anchor resolves; ids unique; every checkbox has a label: PASS
- Only classes that exist in `assets/style.css`: PASS
- HTML and Markdown: the same 11 sections in the same order and the same 54 code blocks: PASS
- Time plan sums to 180 min: PASS
- Rebuilt in a copy of the finished M07 repo from the page's own blocks, in page order, with every "You should see" block compared with real output: 17 of 17 match; final tree identical to the hand-built one: PASS
- Finished API: typecheck clean, `npm run bruno` 15 requests and 35 assertions without changing the collection, `grep` for hand-written checks empty, `blocked` drift caught by `tsc`, env fail-fast: PASS
- Windows and macOS: NOT RUN
- Rendered in a browser: NOT CHECKED
- Scope: 3 h against the brief's 6 h, no PR. Brief and tasks unchanged: NEEDS USER CONFIRMATION

## Issues found and fixed

- The create-request output was captured in the finished state, so the key order did not match the code at that point in the page (found by the rebuild). The block now shows the order of that moment.
- The last curl returned `409` on a second run, because the title rule is in the database. The page says so.
- The `grep` proof first matched `isBodyParseError` in the error handler. The pattern was narrowed to input-checking shapes, and the M04 practice files are excluded.
- The page said M05 wrote `req.body as CreateTaskInput`, which it did not (it typed the route). Reworded.
- An unverified claim that `req.body` and `req.params` can be assigned in Express 5 was removed.
- Minutes were rebalanced after reading as a student: section 7 had 20 min for five edits and two experiments, now 35; section 6 is 45; sections 1, 2, 3 and 4 were cut to pay for it.
- The `errors.ts` replacement may be pasted, which the overview now says.

## Backlog

- Windows and macOS untested (npm, curl, grep from Git Bash).
- Time per section is an estimate. Sections 5 and 6 are the likeliest to overrun. Have a real student time them.
- Not viewed in a browser.
- Hours and PR: `brief.md`, `tasks.md`, the PRD, arch doc and README still say 6 h and a pull request. The brief's "teach it" write-up is replaced by the page. The home page still says about 80 hours in total.
- No Google Doc for M08.
- `src/domain/task.ts` still has hand-written types for the M04 practice file `task-demo.ts`. Decide whether M04 should derive them from Zod later.
- `validate` reports only the first failing part (params, then query, then body). Collecting all parts would need building one `ZodError` from several.
- M09 handoff: `config.ts` reads `process.env` at import, so tests must set `DATABASE_URL` before importing `app`.
- The page generator and sources are in the session scratchpad. Move a cleaned copy into `knowledge/patterns/` (M07 said the same).
- Cut but possible later: `z.discriminatedUnion` in a real schema, Zod Mini, `z.toJSONSchema`, custom error maps.

## Patterns worth reusing

- Capture each expected output at the point in the page where it is shown, then rebuild from the page's own blocks to prove it.
- Show the failure before the fix: the real `TypeError`, the `req.query` getter error, the `500` before the `ZodError` branch, the `tsc` error from drift.
- `satisfies` only checks keys written out in the object, not keys that come in through a spread.
- Copy a big `node_modules` with hard links (`cp -al`) when the temp disk is small, and make real copies of everything else.
