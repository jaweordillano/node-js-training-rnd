# M06 Write-Up — SQL Fundamentals with SQLite

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own. Your M07 self needs this schema and ERD, so write it like you'll need it again.

## What I built

The schema (with the `task_tags` junction table), your seed data, your 20+ exercises, the Mermaid
ERD, and the injection demo.

**Training module page (authored, 2026-10-13).** A student-facing page for M06 as twin files, `index.html` and `index.md`, plus a second twin pair, `solution.html` and `solution.md`, for the exercise answers. About 3 hours (180 min): the relational model, SQLite and the schema design 25, create and seed the database 20, reading and changing data 20, joins, aggregates and subqueries 25, exercise set of 24 graded queries 40, indexes, `EXPLAIN QUERY PLAN` and transactions 20, SQL injection and the parameterised fix 15, the Mermaid ERD 10, check your understanding 5. The lab is built inside the `node-js-training` repo. Repo state in is M05's. Out: `sql/schema.sql` (users, tasks, tags, task_tags, plus three indexes added in section 6), `sql/seed.sql` (5 users, 15 tasks, 7 tags, 23 links), `sql/exercises.sql` (the student's answers), `src/labs/check-exercises.ts` and the script `sql:check`, `src/labs/injection.ts`, and a Mermaid ERD in `README.md`. The database file is `data/tasks.db`, already gitignored. The home page row links to M06 and M05's pager links forward. The lab has not been done by a real student yet.

## Why it's built this way (key decisions)

- Why this junction-table design for `task_tags`, specifically?
- What did you index, and what would change in your queries if you hadn't?
- Which of your 20+ exercises taught you something you didn't expect going in?

**Decisions on the training page (2026-10-13)**

- **3 hours, not 6. This was my assumption.** The open questions (hours, who supplies the exercises, the injection tool, the PR step) were not answered, so I planned 3 h, supplied the exercises, used `node:sqlite` and the plain add/commit/push loop. The brief, tasks, PRD and README still say 6 h and a PR; I did not edit them.
- **The page supplies 24 exercises (the brief says the student writes their own).** A student working alone has no trainer to spot-check. A checker script marks each answer by row values and order, so "graded" is real. The answers and the reason each works are on a solution page, linked "only after you have tried", as in M04.
- **The checker uses `node:sqlite`,** so students install nothing for it. M03 called `node:sqlite` awareness only, so the page says it is not how the Task API will talk to a database (that is Prisma, M07). The same choice runs the injection demo.
- **Schema choices:** `tasks.user_id` may be empty (`ON DELETE SET NULL`) so there are unassigned tasks for `LEFT JOIN` exercises. `task_tags` has a composite primary key and `ON DELETE CASCADE`. `status` has a `CHECK` for `todo`, `in_progress`, `done`, matching the Task API contract. Columns match M04's `Task` type plus the owner. Ids are integers, where the M05 API uses UUID strings: M07 decides how to map that.
- **The seed is fixed and the exercises have gaps built in:** Eli owns no tasks, two tasks have no owner, two have no tags, and one tag is unused. Each gap gives a join exercise something to find.
- **Data-changing demos are followed by a reset** (`.read` the two SQL files), so the exercises always run on the original data. The index lines go at the end of `schema.sql`, so a reset keeps them.
- **The Mermaid ERD is checked against the real schema** with `PRAGMA table_info`, so it cannot drift.
- **Cut:** window functions, views, triggers, migrations, `ALTER TABLE` practice, 1:1 practice (explained only) and DB Browser steps.
- **Page generated from one source** (in the session scratchpad, not the repo), reading code from files that were run.

## How to build it (teach it to the next trainee)

Write a guide to designing a junction table for a many-to-many relationship, using your own example
to show the reasoning, not just the SQL.

## Concepts worth explaining

Pick 1-2 ideas — 1:N vs M:N modeling, what an index is for, or why parameterised queries stop
injection — and explain each in your own words.

## What tripped me up

The SQL injection demo, any constraint or join surprises.

- (2026-10-13) This machine had no `sqlite3` and no sudo. I downloaded the official 3.54.0 command line from sqlite.org into a scratch folder to run every SQL block. Without it, every output block would have been unverified.
- The 3.54 shell's new line editor could not be driven from a script (it waits for terminal replies), so I could not capture the interactive prompt's error wording. The page quotes only the end of each error (`FOREIGN KEY constraint failed`, and so on), which I did verify, and says the front part varies.
- My first draft of the ERD section had a `PRAGMA table_info` block laid out from memory. VALIDATE caught it and I pasted the real output.
- Two exercises (the `page` and `bug` ones) first returned identical rows, so one answer could have passed for the other. I changed the first to a different word.
- A test harness of mine truncated `schema.sql` by opening it for writing before reading it. The page was right and my harness was wrong; I rebuilt it from the page.

## Checkpoint evidence

Show your 20+ query exercises, the Mermaid ERD matching your schema, and the injection demo
succeeding against the vulnerable query then failing against the fixed one.

(2026-10-13, page author, Linux/WSL, SQLite 3.54.0 command line, Node v24.21.0.) Every SQL block was run in a scratch folder and the page's "You should see" blocks come from those runs. Rebuilding from the page's own code blocks in a fresh folder gave: schema and seed load (5, 15, 7, 23 rows), `npm run typecheck` clean, `npm run sql:check` 0/24 with the empty template and 24/24 with the solution page's queries (also after the indexes were added and the database rebuilt), the injection output identical to the page, and the Mermaid diagram's columns identical to `PRAGMA table_info` for all four tables. The checker was also tried with a wrong order, a wrong row count and a misspelled table, and flagged each. Still student evidence to collect: their own run and their explanation of keys, indexes and 1:N vs M:N.

## What I'd do differently

If you started this module over, what would you do differently?

(2026-10-13) Ask for the hour budget and the exercise source before the first plan, as in M03 to M05. Capture the SQLite shell's interactive output with a real terminal, so the error messages can be quoted whole.

Still open: Windows and macOS were not run, including the `winget`, `brew` and `apt` install commands; the interactive `sqlite3` prompt and its exact error wording were not captured (checked with piped input); DB Browser for SQLite was not run; GitHub's drawing of the Mermaid diagram was not viewed (the diagram passes Mermaid's parser); not viewed in a browser; the 3 h plan is an estimate and section 5 (24 queries in 40 min) is the likeliest to overrun; `brief.md`, `tasks.md`, the PRD and arch doc still say 6 h, a PR, own exercises and a "junction-table guide" write-up; the home page still says about 80 hours in total; M02 to M05 Google Docs are stale and M06 has none; `AGENTS.md` does not mention the solution page pair; M07 should confirm integer ids against the API's UUIDs.
