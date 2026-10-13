# M09 retro: Integration Testing with Jest + Supertest

Date: 2026-10-13. Page: `modules/m09-integration-testing/index.html` and `index.md`.

## Criteria

- Smallest page that reaches the success mark (25+ tests, 80% coverage, `--randomize`, test-first `PATCH`, green CI): PASS. 38 tests, 100% coverage on routes and services, random order green, red then green then refactor shown. CI is PASS for the commands and untested on GitHub itself.
- Time plan adds up to the stated hours: PASS (300 min = 5 h).
- Twin files and mechanical checks (links, ids, classes, no JavaScript, same code blocks): PASS.
- Stays inside the brief's stack: PASS. Brief says 8 hours and "v3". The page says 5 hours and builds on M07. `brief.md` and `tasks.md` untouched.

## Issues found and fixed

- Test counts in "You should see" blocks (12 vs 13, 12 vs 11, 9 vs 8) fixed after a full replay.
- The "break it on purpose" text in section 3.8 corrected from real output.
- A claim about how Jest prints a green run was removed.
- A callout mentioned the brief's 8 hours to the student. Removed.

## Backlog

- Build or check M08's page, then re-run the M09 suite against Zod messages. Update the "Previous" pager text and make M08's pager link here.
- Try the three `@swc/jest` fallbacks once on a scratch copy and document what each needs.
- Run section 8 for real (GitHub repo, PR, badge) and on Windows and macOS.
- Consider dropping `--experimental-vm-modules` from the page. Node 24.21 ran without it. The brief and solution design specify it.
- Maybe add a short exercise where the student breaks an API rule on purpose and sees the matching test fail.
- Check the Windows quoting of `npm pkg set` with the long Jest script.

## Patterns and surprises worth reusing

- A guard in the global setup that refuses to run unless `DATABASE_URL` looks like a test database protects the dev data from `deleteMany` helpers.
- A "stricter assertion" lesson: a `404` test passes while the route is missing, so assert the message too.
- Replaying a lab from the previous module's end state, with the page's own code blocks, found four wrong numbers and one wrong explanation. Generate the page's code blocks from files you run.
- Subagents that start servers must use their own port and never `pkill` by a broad pattern. Check the port first (`.env` here sets `PORT=4000`).
- `/tmp` can fill up from another session. Put big installs on the home disk, and watch `ENOSPC`.
