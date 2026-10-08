# M02 retro — Modern JavaScript & Async/Await

## Status (2026-10-08)
Toolkit, timing, fs refactor and event-loop snippet built in `m02-async-toolkit/`. Write-up drafted.
Remaining: trainee explains the event-loop order out loud, reads the Research items, and reviews the
write-up.

## Criteria
- [x] All `node:assert` self-checks pass — PASS (17/17; 4 deliberate code breaks confirmed the tests can fail)
- [ ] Explain setTimeout/promise/await output order out loud — PARTIAL (prediction matched actual output
      and is written up; the spoken explanation is the trainee's)
- [x] Timing comparison shows parallel beating sequential — PASS (3/3 runs: 8.3x, 1.4x, 1.6x)

## Issues
- FIXED: scaffolded test printed "all self-checks passed" with zero assertions (vacuous green).
- FIXED: scaffold first created outside the repo; moved to `m02-async-toolkit/` at repo root.
- PARTLY FIXED: stray generated `graphify-out/` removed from `modules/m02-.../`. Another copy sits in
  `m02-async-toolkit/` (gitignored, so it won't be committed; the graphify hook recreates it when run from
  inside that folder).
- FIXED (code review): nothing tested that `withTimeout`/`sleep` clean up their timers; added 2 checks and
  confirmed they fail without the cleanup.
- FIXED (code review): write-up blamed the 6.8s timing outlier on connection setup, but the warm-up was
  already in place; now says the cause is unknown.
- Misjudgement: initially scaffolded stubs only, reading "trainee builds" too literally; corrected to a
  full reference implementation at the trainee's request.

## Backlog
- From code review: `withTimeout`/`retry` don't validate `ms`/`delayMs`; `retry` retries on programmer
  errors and has no AbortSignal; two timing-based checks have small margins; `timing.js` has no error
  handling.
- Timing is network-dependent; report a median over more runs.
- `withTimeout` only stops waiting, it does not cancel work; consider an AbortSignal variant.
- Research checklist items in tasks.md are left unticked on purpose (trainee's reading).
- Re-run `graphify update .` after the commit.

## Patterns worth reusing
- An empty test file exits 0. Seed scaffolded tests with an explicit failure until real checks exist.
- Mutation-check a test (break the code on purpose) before trusting it.
