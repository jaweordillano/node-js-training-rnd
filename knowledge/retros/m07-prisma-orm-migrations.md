# Retro: M07 training module page (index.html + index.md)

## Criteria results (2026-10-13)

- Exactly one `<h1>`, no `<script>`/`onclick`, no external links or CDN: PASS
- Every relative link and in-page anchor resolves; ids unique; every checkbox has a label: PASS
- Only classes that exist in `assets/style.css`: PASS
- HTML and Markdown: the same sections in the same order and the same 72 code blocks: PASS
- Time plan sums to 300 min: PASS
- Every Prisma command on the page uses `npx prisma@7` (no bare `npx prisma`): PASS
- Rebuilt in a fresh copy of the M05 repo from the page's own blocks, in page order, with each "You should see" block compared with real output: 22 of 23 match. The one difference is Prisma's optional update box, which the page says does not always appear: PASS
- Finished API: typecheck clean, `{ data, meta }` list, `409`/`404`/`409` for `P2002`/`P2025`/`P2003`, seed, a second database rebuilt from the migrations, `npm run bruno` 15 requests and 35 assertions twice in a row: PASS
- `npm run db:reset` and `prisma migrate reset`, Prisma Studio: NOT RUN
- Scope: 5 h, my assumption, against the brief's 8 h. Brief unchanged: NEEDS USER CONFIRMATION
- Rendered in a browser: NOT CHECKED

## Issues found and fixed

- Errors and the Bruno run were first placed in section 5, before the error handler knew Prisma's codes, so they would have given `500`. Moved to section 6.
- The "fresh deploy" expected block left out two npm banner lines that `npm run db:seed` prints (BLOCKER, found by the rebuild).
- A broken sentence in section 5 that referred to the error handler "next to explain" was removed.
- The `pageSize` in a list example was written as 2 where the real answer is 20 (the default).
- The overview did not say the extended `validation.ts` may be pasted (FIX NOW). It does now.

## Backlog

- Windows and macOS untested, including the `better-sqlite3` install and its build-tool fallback.
- `npm run db:reset` and `prisma migrate reset` were not run: Prisma blocks them for AI agents, and consent was declined.
- Prisma Studio was not run.
- Time per section is an estimate. Section 3 (50 min) and section 5 (55 min) are the likeliest to overrun. Have a real student time them.
- Not viewed in a browser.
- Hours: `brief.md`, `tasks.md`, the PRD, arch doc and README still say 8 h and a PR. The home page still says about 80 hours in total.
- `brief.md` asks for an "add-a-column guide" write-up and a PR; the page replaces both.
- The `{ data, meta }` list shape changes two M05 Bruno requests, which the brief does not mention.
- Integer ids in M06 against UUID ids in the API: the page uses UUIDs.
- M02 to M06 Google Docs are stale. M07 has none.
- `AGENTS.md` and `/create-training` describe one page pair per module. M04 and M06 added solution pages.
- The page generator and sources live in the session scratchpad. Move a cleaned copy into `knowledge/patterns/` if M08 needs it.
- Cut but possible later: `groupBy`, `upsert`, `createMany` practice, interactive transactions, CI wiring.

## Patterns worth reusing

- Build the lab in stages so the student feels each problem before its fix (a `500` before the error mapping, a failing migration before the hand edit).
- Choose a hand-edited migration that fixes a real problem (a required column on a table with rows), not a cosmetic one.
- Re-run the whole lab from the page's own code blocks and compare every output, with ids, timestamps and migration names normalised. It catches missing banner lines and wrong order.
- If a tool blocks an agent from a dangerous command, ask the user. Do not work around the block. Prove the same claim another way and mark the original command untested.
- Check what a scaffolding command installs beyond the files you expect (`prisma init` adds agent skills) and look for an off switch.
