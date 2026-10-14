# M10 retro: Capstone Project

Date: 2026-10-14. Page: `modules/m10-capstone/index.html` and `index.md`.

## Criteria

- Smallest page that reaches the success mark (new-domain API, auth, provable concurrency fix, 25+ tests): PASS, as a spec with no solution code.
- Time plan adds up to the stated hours: PASS (720 min = 12 h).
- Twin files and mechanical checks (one h1, unique ids, labels, anchors, relative links, known classes, no JavaScript, same sections, 34 checkboxes and 7 checkpoints in both): PASS.
- Stays inside the brief's stack: PASS. Demo, Q&A and self-score were cut at the user's request, so the page differs from the brief, which is untouched.

## Issues found and fixed

- Awkward sentence about rate-limiting scope reworded in both twins.
- Removed an unverified claim about a pure JavaScript hashing option.

## Backlog

- Build an exemplar capstone and check the 720-minute plan and the SQLite race reproduction.
- Test bcrypt/argon2 install on Windows, macOS and Linux.
- Run the GitHub-side steps for real (Issues, 8 PRs, CI with a secret).
- Day 4 holds 390 minutes of work and may overrun. Consider splitting it or cutting scope.
- Decide whether the brief, tasks and write-up template should drop the demo and self-score to match the page.
- Peer review is in the PRD and solution design but nowhere on the page.

## Patterns and surprises worth reusing

- For a project stage, replace "steps and code" with "what to build, what to research, what evidence proves it, a checkpoint".
