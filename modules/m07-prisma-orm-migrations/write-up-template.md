# M07 Write-Up — Prisma ORM & Migrations (Task API v2)

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own.

## What I built

Task API v2 — the Prisma schema, your migrations (including the hand-edited one), the service
layer, and the seed script.

**Training module page (authored, 2026-10-13).** A student-facing page for M07 as twin files, `index.html` and `index.md`, beside the brief. About 5 hours (300 min): what an ORM is and Prisma 7 setup 30, the Prisma schema (translating M06) 35, migrations including a hand-edited one 50, the Prisma client 40, the service layer 55, Prisma errors in the existing error handler 30, seeding, reset and generated types 30, concepts (team migrations, PostgreSQL, MongoDB, Prisma 8) 20, check your understanding 10. The lab is built inside the `node-js-training` repo, on top of M05's API. Repo state in is M06's. Out: `prisma@7`, `@prisma/client@7`, `@prisma/adapter-better-sqlite3`, `dotenv`; `prisma7.config.ts`; `prisma/schema.prisma` (User, Task, Tag, a `TaskStatus` enum, an implicit many-to-many); `prisma/migrations/` with two migrations (the second hand-edited); `prisma/seed.ts`; `src/db.ts`; `src/services/tasks.ts` replacing `src/store/tasks.ts`; a Prisma-error mapping inside the existing `src/middleware/errors.ts`; `validation.ts` and `routes/tasks.ts` updated; two Bruno requests changed; practice files in `src/labs/`; scripts `db:generate`, `db:migrate`, `db:seed`, `db:reset`. The home page row links to M07 and M06's pager links forward. The lab has not been done by a real student yet.

## Why it's built this way (key decisions)

- Why this translation of the M06 schema into Prisma models, specifically?
- What did you have to hand-edit in the `--create-only` migration, and why couldn't
  `migrate dev` generate it for you?
- How did you map `P2002`/`P2025`/`P2003` onto your existing M05 error handler?

**Decisions on the training page (2026-10-13)**

- **5 hours, not 8. This was my assumption.** The open questions (hours, ids, tags, PR step) were not answered, so I planned 5 h, UUID string ids, a nested `tags` field and the plain add/commit/push loop. The brief, tasks, PRD and README still say 8 h and a PR; I did not edit them.
- **UUID string ids, not M06's integers,** so the M05 API and Bruno collection keep working. The page says so in the M06 to Prisma table.
- **The hand-edited migration is a real one.** `titleKey` (the lower-case title) is a required, unique column added to a table that already has rows. Prisma writes the SQL but leaves `titleKey` empty, so `--create-only` plus a backfill (`lower("title")`) is needed. It also moves M05's case-insensitive duplicate-title rule into the database, which is where `P2002` comes from, so no code check is left.
- **Prisma errors go into the existing handler,** not a new one: `fromPrismaError` returns the same `ConflictError` and `NotFoundError` classes, so the envelope never changes. `P2025` replaces the old `if (!task)` checks through `findUniqueOrThrow`. `P2003` is shown through a temporary route, because the API has no route that sets `userId`.
- **Errors come after the service layer on purpose.** The student first sees a `500` for a missing task, then fixes it in section 6. The Bruno run is at the end of section 6, because it needs every error path handled.
- **The list endpoint changes shape to `{ data, meta }`,** so two Bruno requests change by one line. I read "still green" as green after that change, and recorded it.
- **Nested `tags` on the task endpoints,** with `connectOrCreate` on write and a list of names on read, follows the M05 contract. PATCH replaces the tags.
- **`--no-skills` on `prisma init`:** without it, init also installs AI-agent skill folders and a lock file.
- **Rebuild from scratch is shown with `migrate deploy` and the seed on a second database file.** `migrate reset` is described and given as the `db:reset` script, but I did not run it (see below).
- **Cut:** `groupBy`, `upsert` and `createMany` practice (mentioned in a table), interactive transactions (one sentence), CI wiring beyond "run `generate`", PostgreSQL and MongoDB hands-on (concepts only, as the brief says).
- **Page generated from one source** (in the session scratchpad, not the repo), reading code from files that were run.

## How to build it (teach it to the next trainee)

Write a guide to adding a column to a table that already has data, using your own example to show
the reasoning, not just the migration commands.

## Concepts worth explaining

Pick 1-2 ideas — `migrate dev` vs `migrate deploy`, what the lock file/generated client actually
are, or `select` vs `include` — and explain each in your own words.

## What tripped me up

Migration conflicts, the hand-edited `--create-only` migration, the `better-sqlite3` install if it
gave you trouble.

- (2026-10-13) Prisma blocked `migrate reset --force` because it detected an AI agent and asked for the user's explicit consent. I asked, the answer was no, and I did not run it or work around the block. The page marks `db:reset` untested and proves the rebuild with `migrate deploy` plus the seed on a fresh file instead.
- `prisma init` created agent-skill folders (`.agents`, `.claude`, `.windsurf`) and `skills-lock.json` until I found `--no-skills`.
- On Prisma 7.10 the config file is `prisma7.config.ts`, and `migrate dev` no longer runs `generate`. My first tour script failed at run time with "Unknown argument `titleKey`" because the client was stale.
- Prisma prints an "update available 7.10.0 -> 8.0.0-rc.22" box with `npm i prisma@latest`. It appears only some of the time, so the page warns about it twice and says it does not always appear. My rebuild check failed on this block alone.
- A failed hand-edited migration (`P3018`) leaves a `new_Task` table on SQLite, so the fix is to delete the development database file and run `migrate dev` again.
- My first draft ran the Bruno collection and a duplicate-title request in section 5, before the error handler knew Prisma's codes, so they would have returned `500`. I moved the errors and the Bruno run to section 6 and rebuilt from the page's own blocks to be sure.
- `npm run db:seed` prints two npm banner lines that my first "fresh deploy" expected block left out. The rebuild check caught it.

## Checkpoint evidence

Show `migrate reset` plus your seed script rebuilding the database from scratch, the Bruno
collection from M05 still green against v2, `P2002`/`P2025`/`P2003` each mapping to the right
status code, your own explanation of `migrate dev` vs `migrate deploy`, and `package.json` locking
`prisma`/`@prisma/client` to `^7`.

(2026-10-13, page author, Linux/WSL, Prisma 7.10.0, `@prisma/adapter-better-sqlite3` 7.10.0, Node v24.21.0, Express 5.3.0, TypeScript 7.0.2.) The whole lab was rebuilt in a fresh copy of the M05 repo from the page's own code blocks, in page order, and each "You should see" block was compared with the real output. 22 of 23 matched; the one difference is Prisma's optional update box, which appears only some of the time. The finished API passes `npm run typecheck`; the list endpoint filters, sorts and pages and returns `{ data, meta }`; a duplicate title gives `409`, a missing task `404` and a bad owner `409`, all in the usual envelope; the seed gives 3 users, 8 tasks and 5 tags; a second database built only from the two migrations plus the seed has 8 tasks; `npm run bruno` passes with 15 requests and 35 assertions, twice in a row. `package.json` has `prisma` and `@prisma/client` at `^7.10.0`, and every Prisma command on the page is `npx prisma@7`. Not run: `migrate reset`, Prisma Studio. Still student evidence to collect: their own run and their explanation of `migrate dev` vs `migrate deploy`.

## What I'd do differently

If you started this module over, what would you do differently?

(2026-10-13) Ask for the hour budget, the id type and the tags decision before the first plan. Check which commands Prisma blocks for agents before planning a lab around them.

Still open: Windows and macOS were not run, including the `better-sqlite3` install; `npm run db:reset` and `prisma migrate reset` were not run (Prisma blocks them for agents, and consent was declined); Prisma Studio was not run; not viewed in a browser; the 5 h plan is an estimate and section 3 (50 min, two migrations and a hand edit) and section 5 (55 min, about 350 lines of code to type or paste) are the likeliest to overrun; `brief.md`, `tasks.md`, the PRD and arch doc still say 8 h, a PR and an "add-a-column guide" write-up; the home page still says about 80 hours in total; M02 to M06 Google Docs are stale and M07 has none; `AGENTS.md` does not mention the solution pages of M04 and M06; the `{ data, meta }` list shape changes two M05 Bruno requests.
