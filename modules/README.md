# Node.js Developer Training — Modules

This folder holds one folder per stage of the Node.js Developer Training Program: four weeks, ten
modules, about 80 hours, ending in a typed REST API built, validated, tested and version-controlled
from scratch. It is built from `docs/arch-docs/Node.js Developer Training Program — Solution
Design.md` and `docs/prd/nodejs-developer-training.md`, applying the cycle in
`docs/build-to-teach-framework.md`.

**Who reads what.** Students follow the course page in each stage folder (`index.html`, with an
`index.md` twin), starting from the root `index.html`. The `brief.md`, `tasks.md` and
`write-up-template.md` files are the course author's workflow: the brief sets the scope and the
deliverable, and the write-up is where the author records what they built before turning it into
the page. The sections below describe that author workflow.

## How a stage works (author workflow)

> In the rest of this section, "you" is whoever builds and writes up the stage (the course author) and the "trainer" is whoever reviews it. Students do not follow this workflow.

1. Read the stage's `brief.md` — objective, scope, stack constraints, deliverable, lab, definition
   of done, and anything still open that needs your trainer's sign-off before you start.
2. Run `/trainee-task-planner modules/<stage>` to turn that brief into an ordered `tasks.md`
   checklist. Work through it solo.
3. Build the lab, producing the deliverable. Fill in `write-up-template.md` stage by stage, while
   the decisions and
   problems are still fresh — not after the thing already works.
4. Bring both the build and the write-up to your trainer at the stage's checkpoint (see the Friday
   gates below). They review both together, the same way the build-to-teach framework has the EM
   review drafts along the way rather than only the finished product.
5. A later trainee can read your `write-up-template.md` and follow what you did on their own. Write
   it for them, not for yourself.

## Stages

| Stage | Module | Week · Day | Hours | Builds on |
| --- | --- | --- | --- | --- |
| [m01-dev-environment-git-github](m01-dev-environment-git-github/brief.md) | Dev Environment, Git & GitHub | W1 · D1 | 4 | — |
| [m02-modern-javascript-async-await](m02-modern-javascript-async-await/brief.md) | Modern JavaScript & Async/Await | W1 · D2-4 | 10 | m01 |
| [m03-nodejs-runtime-npm](m03-nodejs-runtime-npm/brief.md) | Node.js Runtime & npm | W1 · D4-5 | 6 | m02 |
| [m04-typescript-on-node](m04-typescript-on-node/brief.md) | TypeScript Basics & TypeScript on Node.js | W2 · D1-2 | 8 | m02, m03 |
| [m05-express-task-api-v1](m05-express-task-api-v1/brief.md) | Express: Routing, Middleware & Error Handling | W2 · D3-5 | 12 | m04 |
| [m06-sql-fundamentals-sqlite](m06-sql-fundamentals-sqlite/brief.md) | SQL Fundamentals with SQLite | W3 · D1-2 | 6 | m05 |
| [m07-prisma-orm-migrations](m07-prisma-orm-migrations/brief.md) | Prisma ORM & Migrations | W3 · D2-4 | 8 | m05, m06 |
| [m08-zod-validation](m08-zod-validation/brief.md) | Zod Validation & Type Inference | W3 · D4-5 | 6 | m07 |
| [m09-integration-testing](m09-integration-testing/brief.md) | Integration Testing with Jest + Supertest | W4 · D1-2 | 8 | m08 |
| [m10-capstone](m10-capstone/brief.md) | Capstone Project | W4 · D3-5 | 12 | m01-m09 |

Four modules (M05, M07, M08, M09) grow one Task API from v1 to v4. The capstone repeats the whole
pattern alone, in a new domain, with no reference solution to copy from.

## Ground rules (every stage)

- **Free tools only. No Docker, no paid licences.**
- **SQLite is the only database you touch hands-on.** PostgreSQL and MongoDB are covered as concepts
  in M07, with no labs.
- **Plain JavaScript in Week 1. TypeScript from M04 onward.**
- **Pinned versions for the whole cohort:** Node.js 24 LTS, Express 5.x, TypeScript 7.0,
  Prisma ORM 7.x, Zod 4.x, Jest 30.x, Supertest 7.x. Your trainer re-verifies these are still current
  immediately before the cohort starts (versions move fast) but the choice of Node 24 over 26 is
  already decided — see `m04-typescript-on-node/brief.md`. Prisma is always installed and invoked as
  `@7` — an unversioned `prisma`/`npx prisma` install may resolve to Prisma 8, which does not read
  `schema.prisma` for this stack.
- **Public training repos** for every stage — see `m01-dev-environment-git-github/brief.md`.
- **Bruno** for manual API testing. Collections are plain text, committed to `bruno/` in your repo,
  never left uncommitted.
- **Git/GitHub workflow throughout:** feature branches, pull requests, Conventional Commits, and at
  least one peer review given and received across the program, not only at the capstone.

## Friday gates

Pass/fail against that module's definition of done, at the end of: M03, M05, M08, and M10 (the
capstone demo). A gate you don't pass yet is something to raise with your trainer before moving on —
don't self-advance past one.

## Assessment

- Every module ends in a checkpoint (see that stage's `brief.md`).
- The capstone (M10) is scored out of 100 against a fixed rubric; 70 or more passes. The rubric lives
  in `m10-capstone/brief.md` — it is the one place point values are specified, and it is not a
  solution, it is how your finished API gets graded.
- By the end of the program you should be able to evidence all ten competencies listed in the PRD's
  Section 6 — each module's `brief.md` names which one(s) it builds toward.
