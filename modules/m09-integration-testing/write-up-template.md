# M09 Write-Up — Integration Testing with Jest + Supertest (Task API v4)

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own. The M10 capstone has no reference material except what you write here, so be
> thorough.

## What I built

Task API v4 — your test suite, the test-database setup, and the green CI run.

**Training module page (authored, 2026-10-13).** A student-facing page for M09 as twin files, `index.html` and `index.md`, beside the brief. About 5 hours (300 min): testing strategy and Jest vocabulary 30, Jest + `@swc/jest` setup and a first test 40, the test database 45, Supertest and the happy paths 50, error paths, list queries and middleware 55, test-first `PATCH /tasks/:id/complete` 25, coverage, random order and flaky tests 25, CI 25, check your understanding 5. Repo state in is the end of M07 (Task API v2). Out: Jest 30, Supertest 7, `@swc/jest`, `@swc/core`, `@jest/globals`, `@types/supertest`; `jest.config.js`; `.env.test`; `tests/` (`global-setup.js`, `setup.ts`, `helpers/db.ts`, `helpers/factories.ts`, 7 test files, 38 tests); `PATCH /tasks/:id/complete` (service `completeTask` and a route); `tsconfig.json` includes `tests`; scripts `test`, `test:coverage`, `test:random`; `.github/workflows/ci.yml`; a README badge. The home page row links to M09. The lab has not been done by a real student yet.

## Why it's built this way (key decisions)

- Why this test-database strategy, specifically — what would break if tests shared one database
  file without cleanup?
- Which toolchain fallback (if any) did you actually need, and why did `@swc/jest` or its
  alternative work for your setup?
- What did adding `PATCH /tasks/:id/complete` test-first actually change about how you wrote the
  handler?

**Added 2026-10-13.**
- **5 hours, not the brief's 8.** The user asked to trim. The page hands over the test code (type the first of each kind, paste the rest) and teaches the vocabulary where the lab needs it. The brief and tasks still say 8 hours and were left alone.
- **Built on M07, not v3.** There was no M08 page when this was written, so the page tests the M07 API (hand-written validation). Tests assert the error `path` and the `details` shape and not the message wording, so a later Zod swap should not break them. The brief says "Task API v3". That is a mismatch to settle once M08's page exists.
- **Test database.** `.env.test` is committed (no secrets), the npm script loads it with Node's `--env-file`, `globalSetup` runs `prisma migrate deploy`, `resetDb` empties tasks, tags then users before each test, and `--runInBand` keeps one SQLite writer. A guard in `global-setup.js` refuses to run unless `DATABASE_URL` contains "test", because `resetDb` deletes every row and a plain `npx jest` would otherwise fall back to the dev database.
- **`--experimental-vm-modules` kept.** The brief and solution design specify it. On Node 24.21 the suite also ran without it, so the page does not claim it is required.
- **Toolchain fallbacks.** `@swc/jest` worked first time with the Prisma 7 client, ESM and TypeScript 7, so none of the brief's fallbacks was needed. The page lists the order and marks the fallbacks untested.
- **Agents for cookies and snapshots** are one line at most. The API has no cookies, and snapshots are not used. `unstable_mockModule` is a read-only example (checked to work), not a lab step, because the real database is the better fake. The one lab mock is `jest.spyOn` on Prisma, to make the error handler see a bug.
- **Test-first evidence.** The page has the student commit the red tests before the code, so the history shows the order.
- **CI.** The student pushes `main` first, then opens a small PR that adds only the workflow and badge.

## How to build it (teach it to the next trainee)

Write a guide to setting up an isolated test database for integration tests, using your own
example to show the reasoning, not just the config.

## Concepts worth explaining

Pick 1-2 ideas — why integration tests here use a real database instead of mocks, flaky-test
causes, or the red-green-refactor cycle — and explain each in your own words.

## What tripped me up

Flaky tests, ESM/Jest friction, any ordering dependencies the `--randomize` run exposed.

**Added 2026-10-13.**
- A subagent that rebuilt the M07-state repo for me ran its first test pass against a server already listening on port 4000, which turned out to be the user's own dev server. It posted one task and sent `pkill -INT` to `src/server.ts`. I reported it to the user. Lesson: in this repo `.env` has `PORT=4000`, so check the port or use another one.
- `/tmp` filled up (another session's folder held about 3 GB), so `npm ci` failed with a confusing gyp error. I ran the CI simulation on the home disk instead.
- My first no-leak test mocked `prisma.task.findMany`, and failed with the mock's own error. The service uses `$transaction([...])` for the list. Mocking `findUniqueOrThrow` through `GET /tasks/:id` works.
- Counts: my first draft said 12 and 9 tests where the real runs gave 13 and 8. The 3.8 "break it on purpose" text also said the second test fails on a second run. In fact the second test fails on the first run and the first test fails on the next. Both were fixed from real runs.
- Without `--runInBand`, one test failed in 2 of 3 parallel runs (shared rows), not an SQLite lock error, so the page describes shared state.
- Without `afterAll($disconnect)` Jest printed no open-handle warning in my run. The page treats it as tidy-up, not a fix for a hang.

## Checkpoint evidence

Show green CI on your PR, the suite passing with `--randomize`, your coverage report meeting 80%+,
and `PATCH /tasks/:id/complete` added test-first.

**Added 2026-10-13.** (Page author, Linux/WSL, Node v24.21.0, Jest 30.5.2, Supertest 7.3.1, `@swc/jest` 0.2.39, `@swc/core` 1.16.18, Prisma 7.10.0, Express 5.3.0, TypeScript 7.0.2.) The lab was replayed from the M07-state repo in page order using the page's own code blocks. Results: health test 1 passed; with the Jest practice file 13 passed; test database 3 passed; happy paths 11; with error, list and middleware tests 35; red `3 failed` then green `3 passed`; after the refactor 38 passed and `typecheck` clean; coverage 100% on routes and services; `--randomize` passed on every run (3 of 3); without `--runInBand` one test failed in 2 of 3 runs; the guard stopped a plain `jest` run. A fresh clone with no `.env` ran `npm ci`, `prisma generate`, `typecheck` and the coverage run successfully, which is what the workflow does. Not run: GitHub Actions and the PR, Windows, macOS, and the three `@swc/jest` fallbacks. Student evidence still to collect: their own green PR, their coverage table, and their note on test-first.

## What I'd do differently

If you started this module over, what would you do differently?

**Added 2026-10-13.** Still open:
- Section 8 (GitHub Actions, the PR, the badge) is untested, and so are Windows and macOS.
- The brief says "Task API v3" and 8 hours. The page is on M07 and takes 5 hours. Decide what to do once M08's page exists (and whether the tests need re-checking against Zod's messages).
- The page's fallback list (`ts-jest`, TypeScript 6, CommonJS) was not tried. Run each once on a scratch copy if the user wants it.
- No Google Doc exists for M09.
- The user's dev server on port 4000 may have been stopped by the subagent. The stray "Write the tests" task may still be in that database.
