# Node.js Developer Training

This repo holds the Node.js Developer Training Program, an asynchronous, self-paced course for
students: ten modules (M01–M10) that take a developer with basic programming skills to a typed,
validated, tested REST API. **Students start at [`index.html`](index.html)** and follow each module
page (`modules/<stage>/index.html`) on their own.

The course is authored with a build-to-teach cycle. The author builds each stage, writes it up, and
turns it into a course page. The briefs, task checklists and write-up templates in `modules/` are
that authoring workflow. They are not what students read, and students do not run the cycle
themselves.

A note on words: a **module** in this repository is a training stage, not a JavaScript/Node.js
module. Stages M02 and M03 are the ones that actually teach what a JavaScript/Node.js module is
(named vs default exports, ESM vs CommonJS).

## What is in this repository

| Path | What it holds |
| --- | --- |
| `modules/` | The nine stage folders (M01–M09), each with a brief, a checklist, and a write-up template |
| `modules/m10-capstone/` | The capstone, with its own brief, checklist, and write-up template |

## How a stage works (author workflow)

> In the rest of this section, "you" is whoever builds and writes up the stage (the course author) and the "trainer" is whoever reviews it. Students do not follow this workflow.

1. **Your trainer hands you the brief.** Each stage's `brief.md` says what to build and how you
   will know it is done: objective, scope, stack constraints, the named deliverable, a lab, a
   definition of done, and what to confirm with your trainer before you start. It contains no
   lesson, no steps, no code, and no solutions. How to build it is yours to work out.
2. **You build and write up the stage together.** Fill in `write-up-template.md` in the stage
   folder while you build, not after the build works. The lab's "you build and capture" section is
   your deliverable; your write-up is the teaching content — write it for someone who will follow
   it with no trainer to ask.
3. **Your trainer reviews both together.** When you reach the definition of done, bring both the
   working system and the write-up to your checkpoint. The question is not only "does it work?" but
   "could someone else learn from this?"
4. **You revise.** Fix what the review finds, in both the build and the write-up, before starting
   the next stage.
5. **The finished pair goes into the content library.** An accepted stage is the build plus its
   write-up. Your trainer decides what carries into the next cohort's plan.

Review happens at the end of every stage, not just at the end of the course.

## Why review as you go, not at the end

A write-up finished after the deliverable already works tends to be thin — there's no real
pressure to make it good once the thing runs. Reviewing both pieces together, stage by stage,
means the trainer is judging whether the work is teachable, not just whether it works, and catches
problems early instead of in a finished draft nobody wants to redo.

## What is in each stage folder

| File | Who writes it | Purpose |
| --- | --- | --- |
| `brief.md` | Your trainer | Objective, scope, stack constraints, the deliverable, a lab (goal, steps, what to capture), and definition of done. No answers. Do not edit it. |
| `write-up-template.md` | You | Blank at first; filled in as you build, not after. |
| `tasks.md` | Generated from `brief.md` via `/trainee-task-planner` | An ordered checklist mirroring the brief — setup, then research (M02–M09), then build (Day 3/4/5 for the M10 capstone), then verify, then write-up. You tick the boxes; it holds no answers and no steps you weren't already told. |

Your Node.js code lives outside this repository, in your own GitHub repo (the public training repo
you set up in M01). Link it from the header of your write-up. The capstone folder has the same
three files.

## Stages

| Stage | Title | Theme | Leaves behind |
| --- | --- | --- | --- |
| M01 | Dev Environment, Git & GitHub | Toolchain, the everyday Git workflow, a merged PR with a resolved conflict | Nothing |
| M02 | Modern JavaScript & Async/Await | Language essentials, the event loop, reliable async code | The Async toolkit (ported to TypeScript in M04) |
| M03 | Node.js Runtime & npm | Core modules, npm, a bare `node:http` server | Nothing |
| M04 | TypeScript Basics & TypeScript on Node.js | Strict TypeScript, the Task domain types | The ported toolkit and Task domain types |
| M05 | Express: Routing, Middleware & Error Handling | REST API structure, middleware, one consistent error model | Task API v1 (extended through M07–M09) |
| M06 | SQL Fundamentals with SQLite | Relational design, joins, transactions, SQL injection | The schema design (translated into Prisma in M07) |
| M07 | Prisma ORM & Migrations | Migrations, the typed client, Prisma error mapping | Task API v2 |
| M08 | Zod Validation & Type Inference | Runtime validation, type inference from schemas | Task API v3 |
| M09 | Integration Testing with Jest + Supertest | Real-database integration tests, CI | Task API v4 |
| M10 | Capstone Project | Independent API, authentication, a provable concurrency fix | — (terminal stage) |

Work the stages in order. Later stages build on earlier ones: M05's Task API carries forward
through M07, M08, and M09 (v1 → v4), and M06's schema design is what M07 translates into Prisma.
TypeScript (M04) comes before Express (M05) so the API is typed from the start; SQL (M06) comes
before Prisma (M07) so migrations aren't magic; hand-written validation (M05) comes before Zod
(M08) so the payoff is felt. Folder names are descriptive; each brief refers to other stages by
module ID (M01–M10).
