# M05 Write-Up — Express: Routing, Middleware & Error Handling (Task API v1)

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own. This write-up is also your own reference for M07-M09 — write it like you'll
> need it again, because you will.

## What I built

Task API v1 — the endpoints, the middleware stack, your `AppError` hierarchy, and the Bruno
collection.

**Training module page (authored, 2026-10-12).** A student-facing page for M05 as twin files, `index.html` and `index.md`, beside the brief. About 5 hours (300 min): HTTP, REST and the first Express app 35, routing and the in-memory store 60, middleware 45, errors and the central handler 50, hand-written validation 30, config, health and graceful shutdown 25, Bruno collection 45, check your understanding 10. The lab is built inside the `node-js-training` repo, in stages. Repo state in is M04's. Out: `express@5`, `cors`, `@types/express`, `@types/cors`, `@usebruno/cli`; `src/app.ts` (exports the app) and `src/server.ts` (listens and shuts down gracefully); `src/errors.ts` (`AppError`, `BadRequestError`, `ValidationError`, `NotFoundError`, `ConflictError`); `src/middleware/` (`request-id.ts`, `logger.ts`, `errors.ts`); `src/routes/tasks.ts`; `src/store/tasks.ts`; `src/validation.ts`; `src/labs/express5.ts`; `bruno/` (15 requests, an environment); scripts `dev`, `start` and `bruno`. The home page row links to M05 and M04's pager links forward. The lab has not been done by a real student yet.

## Why it's built this way (key decisions)

- How did you implement the fixed error envelope, and what's the actual `AppError` hierarchy you
  designed?
- What's your middleware order, and what would break if two of your middleware swapped places?
- Why hand-write validation here instead of reaching for a library, given M08 is coming?

**Decisions on the training page (2026-10-12)**

- **5 hours, not 12. This was my assumption.** The open questions (hours, the `in_progress` fix, timestamps, PR step) were not answered, so I planned 5 h, fixed M04, kept the timestamps and used the plain add/commit/push loop with no PR. The brief, tasks, PRD and README still say 12 h and a PR; I did not edit them.
- **Cut:** `helmet`, `morgan` and `pino-http` (a 10-line logger shows the same idea), `express.static`, `urlencoded`, `express-rate-limit` (the brief's stretch goal), API-key auth and timing middleware (the brief lists them as examples), and pagination (explained, not built). The REST refresher is two tables.
- **The error envelope is built exactly as the brief fixes it:** `code`, `message`, `details` (validation only) and `requestId`. Codes used: `BAD_REQUEST`, `VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR`. `ConflictError` is shown through a duplicate-title rule I added, because the brief names `ConflictError` but no endpoint needs it. Validation failures return `400`, not `422`.
- **Built in stages, with the pain first.** Section 2 has no validation and a different 404 shape on purpose, and the student sees the API accept a task with no title. Section 3 has them move `express.json()` and watch a task lose its title silently. Sections 4 and 5 fix both.
- **The store is `async` and sits behind plain functions,** so M07 can swap it for Prisma without touching the routes.
- **Hand-written validation takes `unknown`,** collects every problem into `details`, and defaults `status` to `todo`, so M08's Zod payoff is visible.
- **Bruno:** the `.bru` files are plain text, and the page gives them in full. The check is `@usebruno/cli` (`npm run bruno`), so it can be run and verified without the GUI. The collection re-runs cleanly because it cleans up after itself.
- **`app.ts` and `server.ts` are split from the first file,** as the brief says, with the M09 reason given.
- **Page generated from one source** (in the session scratchpad, not the repo), reading the code from files that were run.

## How to build it (teach it to the next trainee)

Write a guide to building a central error handler that produces one consistent shape, using your
own example to show the reasoning, not just the code.

## Concepts worth explaining

Pick 1-2 ideas — the middleware pipeline, operational vs programmer errors, or Express 5's
auto-forwarded rejected promises — and explain each in your own words.

## What tripped me up

Express 5 migration surprises, middleware ordering bugs, etc.

- (2026-10-12) The brief's contract says `status` is `in_progress`, but my M04 page used `in-progress`. I found it while evaluating M05 and fixed M04 (pages, code and outputs). The two `AGENTS.md`/brief readings should have been cross-checked when M04 was written.
- My first stage-2 handler wrote `store.createTask({ status: "todo", ...req.body })`. TypeScript rejected it (TS2783: `status` specified twice), because `CreateTaskInput` already requires `status`. The honest version is `createTask(req.body)`, which also shows that the type is a promise the runtime never checks.
- A bare `POST` with no body returned `201` with an empty task, and a bad `status` was accepted, until validation was added. This became the teaching point of section 2.3.
- `pkill`/`pgrep` patterns in my own test commands matched the shell running them and killed it, twice. Run servers from a subprocess harness, and use `[x]` in the pattern.
- Cutting a `bru run` short with `head` left a task in memory, and the next run failed with `409`. It is a real student trap, so it is in troubleshooting.
- A signal to the `npm` wrapper did not reach the server. A process-group signal (what `Ctrl+C` sends) did, and so did `pkill -f` on the whole command.

## Checkpoint evidence

Show v1 merged by PR, every error path returning the fixed envelope, and the Bruno collection
passing.

(2026-10-12, page author, Linux/WSL, Node v24.21.0, Express 5.3.0, TypeScript 7.0.2, `@usebruno/cli` 4.2.1.) Every stage was run in a scratch folder and the page's "You should see" blocks come from those runs. All 77 code blocks that are files match files that were run. The finished API passes `npm run typecheck`, answers all five task endpoints and the health route, and returns the error envelope for an unknown route, an unknown task, invalid JSON, a validation failure, a conflict and a deliberate bug (`500` with no leak). Shutdown prints `SIGINT received, closing` on a process-group SIGINT, and `SIGTERM received, closing` with `pkill`. `npm run bruno` passes with 15 requests and 35 assertions, and fails with exit code 1 when an error code is changed. Still student evidence to collect: their own run and their explanation of Express 5's async handling.

## What I'd do differently

If you started this module over, what would you do differently?

(2026-10-12) Ask for the hour budget, the PR decision and cross-module contract checks before the first plan. Check the status value against the brief when M04 is written, not when M05 is evaluated.

Still open: Windows and macOS were not run (Git Bash assumed); the Bruno desktop app steps were not run (the page was checked with the CLI); `pkill -TERM` was run on Linux only; not viewed in a browser; the 5 h plan is an estimate and sections 2 and 7 (60 and 45 min) are the likeliest to overrun; `brief.md`, `tasks.md`, the PRD and arch doc still say 12 h, a PR, `helmet`/`morgan` and a "central-error-handler guide" write-up; the home page still says about 80 hours in total; M02's, M03's and M04's Google Docs are stale and M05 has none; `timestamps` on `Task` go beyond the brief's field list.
