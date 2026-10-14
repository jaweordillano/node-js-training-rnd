# M10 Write-Up — Capstone Project

> Fill this in as you go, stage by stage (Day 3 / Day 4 / Day 5) — not only at the end. This is the
> write-up a future trainee reads to understand what building a whole API solo, under this stack,
> actually took.

## Domain chosen, and why

## What I built

Your domain, the finished API — the models, the resources, the business rule.

**Capstone page (authored, 2026-10-14).** A project brief as twin files, `index.html` and `index.md`, beside the brief. About 12 hours (720 min): requirements, rubric and domain 60, Day 3 schema/ERD/migrations/skeleton 150, Day 4 authentication and roles 150, Day 4 routes/validation/errors/business rule 120, Day 4 concurrency proof and tests 120, Day 5 polish/CI/README/PRs 120. Repo state in: the end of M09 (Task API v4), used only as a template. Out: a new standalone API repo. The page gives requirements, per-day checklists, checkpoints, what to research for auth and the concurrency proof, four check prompts, troubleshooting and a done-when list. It has no solution code. The home page row and the M09 pager link to it. No student has used it yet.

## Why it's built this way (key decisions)

- Which business rule did you choose, and why did it need a transaction?
- Which two roles did you design, and what genuinely differs between them?
- Which password-hashing library and token strategy did you pick, and why?

**Added 2026-10-14 (page decisions).**
- The page is a project spec, not a lesson, because the brief says there is no reference solution and the user said this is a capstone project. It gives no steps or code for auth or the concurrency script, only what to research and what evidence to produce.
- **Demo, Q&A and rubric self-score were cut** at the user's request. `brief.md`, `tasks.md` and this template still ask for them (the lab, the Documentation and demo row, the Definition of done, "Rubric self-score"). The page follows the user; the brief and tasks are untouched. The page shows the Documentation row as "Documentation" (10 points) without the demo.
- The page says to create one new repo, which is the one exception to the course's one-repo rule, because the brief says the capstone is built from scratch and not as an extension.
- The PRD's peer review is not on the page (students work alone; the brief also dropped it). The PRD and solution design rubric weights (20/20/15) differ from the brief (15/15/10 plus Security 15). The page follows the brief.
- Added a "what to cut first" callout because 12 hours is tight (solution design item P6).

## How to build it (teach it to the next trainee)

Write a guide to proving a transaction prevents a race condition under concurrent load, using your
own example to show the reasoning, not just the script.

## Concepts worth explaining

Pick 1-2 ideas — race conditions and transactions, role-based access control, or what makes an
error envelope "consistent" — and explain each in your own words.

## Security & Authorization

Your hashing library and why, JWT vs signed session and why, how your two roles differ in
practice, where rate-limiting is applied.

## Proving the concurrency fix

How you generated concurrent load against the contested resource, what happened before the
transaction was correct, what happened after — the actual evidence, not just a description.

## What tripped me up

**Added 2026-10-14.** Writing the page, I could not run anything: it is a spec, and the GitHub steps (Issues, PRs, CI) and the auth and concurrency snippets need a real build. The only check I could do was the mechanical one (links, ids, classes, twin parity, 720 minutes), which passed. During the editorial read I fixed one awkward sentence and removed an unverified claim about a pure JavaScript hashing library.

## Checkpoint evidence

Show the concurrency script's before/after and the demo you gave. (Your rubric score and
must-haves go in the self-score table below, not here.)

## Rubric self-score

| Criterion | Points available | My estimate | Evidence |
| --- | --- | --- | --- |
| Functionality and business rule | 15 | | |
| Testing quality and coverage | 15 | | |
| Validation and error handling | 10 | | |
| Security & Authorization | 15 | | |
| Data layer and migrations | 15 | | |
| TypeScript quality | 10 | | |
| Git/GitHub workflow and CI | 10 | | |
| Documentation and demo | 10 | | |
| **Total** | **100** | | |

## What I'd do differently

If you started this module over, what would you do differently?

**Added 2026-10-14. Still open.**
- Build one capstone exemplar and check the page against it: is 720 minutes enough, and does the race show on SQLite with Prisma 7? The page says to widen the read/write gap if it does not, which is untested.
- bcrypt/argon2 install notes per OS are untested.
- GitHub-side steps (Issues, 8 PRs, CI with secrets) are untested.
- Decide whether to restore a demo or self-score step later, and update the brief and tasks to match the page if not.
- The brief, tasks and this template still mention the demo and self-score.
