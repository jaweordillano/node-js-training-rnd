# M10 — Capstone Project

**Capstone M10 · Week 4 · Days 3-5 · about 12 hours**

Build a complete, secured and tested REST API on your own, in a domain you have not built before, using everything from M01 to M09. This page is a project brief, not a lesson: it tells you what to build and what proves it is done, and you work out how.

## Overview & time plan

**Builds on:** M01 to M09. The capstone is a new API, not an extension of the Task API, but it uses the same stack and the same habits. Before you start, re-read your own notes and pages for M05 (Express and the error model), M07 (Prisma and migrations), M08 (Zod and `config.ts`) and M09 (the Jest and Supertest setup). They are your reference material, and there is no solution to copy. (On this page, "module" means the course lessons, M01 to M10.)

**Why there are no steps.** Every earlier page gave you the code and the reasons. Here you make the decisions: the data model, the roles, the libraries and the order of work. That is the point. AI assistants make CRUD plus Prisma plus Zod plus tests quick to produce. What they cannot do for you is the judgment behind an auth design, or show you that a correctness claim holds under load. Those two things carry the most weight here.

You will:

- plan the work as **GitHub Issues** and design the schema and an ERD before you write code;
- build an API with **3 or more models**, full CRUD for 2 resources, and a list endpoint with filtering, sorting and pagination;
- add real **authentication and authorization**: registration, login, hashed passwords, tokens, two roles and rate-limiting on the auth endpoints;
- enforce one **business rule in a transaction**, and prove with a script that it holds under concurrent requests;
- write **25 or more integration tests** with **80% or more coverage** on routes and services;
- ship it with a README, a Bruno collection and **GitHub Actions** CI, through at least 8 pull requests.

**The pass rule.** You pass with **70 or more out of 100 points, and every must-have present**. A missing must-have (for example the transaction, 25 tests or 3 migrations) fails the capstone even at 70 or more, so close every gap first.

**Stack.** Node.js 24, Express 5, TypeScript 7 in strict mode, Prisma 7 on SQLite (always `npx prisma@7`), Zod 4, Jest 30 and Supertest 7. Free tools only, no Docker. A password-hashing library and a token library are the only new additions. You choose them, and you note your choice and its version in your README.

Time plan:

1. Requirements, rubric and your domain: 60 min
2. Day 3: schema, ERD, migrations and skeleton: 150 min
3. Day 4: authentication and roles: 150 min
4. Day 4: routes, validation, errors and the business rule: 120 min
5. Day 4: prove the concurrency fix and write the tests: 120 min
6. Day 5: polish, CI, README and pull requests: 120 min

> **If you run out of time** Cut in this order: extra endpoints first, then extra tests beyond 25, then README polish. Never cut a must-have. A small API that has every must-have beats a large one that is missing one.

> **How this page uses your time** Each day lists what to build, a checkpoint to compare against, and the evidence to keep. Where a task needs something you have not been taught, the page names what to research and gives no code. Your own earlier work is where to look first. Your process numbers, ids and dates will differ from any example. If something breaks, check [Troubleshooting](#troubleshooting).

## 1. Requirements, rubric and your domain (60 min)

### 1.1 Pick a domain

Choose one, or invent one with the same shape. You need **two user roles** with a real difference between them.

| Domain | Core models | Two roles |
| --- | --- | --- |
| Library / Bookshelf | books, authors, loans | member, librarian |
| Expense Tracker | users, categories, expenses | regular user, admin |
| Event RSVP | events, attendees, registrations | attendee, organizer |
| Support Tickets | tickets, comments, labels | requester, agent |
| Recipe Book | recipes, ingredients, tags | contributor, admin |

Pick a domain you have not built before. Before you build anything, write two or three sentences in your README or notes: which domain, and why.

### 1.2 What the rubric checks

| Criterion | Points | Must-have |
| --- | --- | --- |
| Functionality and business rule | 15 | 3 or more models, including a 1:N and an M:N relation. Full CRUD for 2 or more resources. One list endpoint with filtering, sorting and pagination. One business rule enforced in a service inside a transaction, shown to hold under concurrent load |
| Testing quality and coverage | 15 | 25 or more integration tests, including error paths and at least one test of the role-gated endpoint. 80% or more coverage on routes and services |
| Validation and error handling | 10 | Zod validation for body, params, query and env. A central error handler with one consistent error shape |
| Security and authorization | 15 | Registration and login with hashed passwords. A JWT or signed session cookie required on protected routes. 2 or more roles, with at least one endpoint whose behavior differs by role. Rate-limiting on the auth endpoints |
| Data layer and migrations | 15 | 3 or more committed Prisma migrations and a seed script |
| TypeScript quality | 10 | Strict mode and zero `tsc --noEmit` errors |
| Git/GitHub workflow and CI | 10 | Issues, then feature branches, then 8 or more pull requests. Conventional Commits. GitHub Actions CI passing |
| Documentation | 10 | A README with setup steps, scripts, a Mermaid ERD and an endpoint list, and a committed Bruno collection |

Keep this table open while you work. You can tick off each must-have as you build it.

**Checkpoint 1**

- [ ] You have chosen a domain, and written down why.
- [ ] You can name your two roles and one thing a role can do that the other cannot.
- [ ] You can say which business rule needs a transaction, and what goes wrong without one.

## 2. Day 3: schema, ERD, migrations and skeleton (150 min)

**Goal:** a new project that starts, connects to its database and type-checks, with a plan in GitHub Issues.

1. **Create the repo.** Make a new repo for the capstone with the same conventions as `node-js-training` from M01: plain Git, a `.gitignore`, `.env.example`, `.nvmrc` for Node 24, and a README. (This is the one time the course asks for a second repo, because the capstone is a standalone API.) Make the first commit before anything else, so the history is clean from the start.
2. **Plan as Issues first.** Create GitHub Issues for the work before you write code: for example schema, auth, each resource, the business rule, tests, CI and docs. You will branch from these and close them with your pull requests, so make them small enough for 8 or more.
3. **Design the schema.** Sketch your models with at least one 1:N and one M:N relation, plus a `User` with a role. Write the ERD in **Mermaid** as you go. Your M06 and M07 pages show how to turn a design into Prisma.
4. **Create the first migrations.** Install Prisma 7 (`@7`) and write your `schema.prisma`. Make at least **3 committed migrations** by growing the schema in steps (for example: users, then the core resources, then the join table), not by making one migration and splitting it afterwards. Add a **seed script**.
5. **Set up the skeleton.** Express 5 and TypeScript 7 in strict mode, with the same layout as your Task API (`app.ts` that exports the app, `server.ts` that listens, routes, services, middleware). Copy the **`config.ts` validate-at-startup pattern** from M08, and make every secret flow through it from the start.
6. **Copy your test setup.** Bring over the Jest, `@swc/jest` and Supertest setup from M09, with the test database and the `DATABASE_URL` guard. Run one test to prove it works before you build anything on top.
7. **Add CI early.** Copy your workflow from M09 so every pull request runs the checks from day one.

**Checkpoint 2**

- [ ] `npx tsc --noEmit` reports zero errors, and `npx prisma@7 migrate status` says the database is up to date.
- [ ] You can see 3 or more folders under `prisma/migrations` and a working `npm run seed`.
- [ ] Your Issues exist, and your ERD renders on GitHub.
- [ ] `npm test` runs at least one passing test.

Commit with `git add .`, `git commit -m "..."` and `git push`, using Conventional Commits. From here, work on a branch per Issue and open a pull request for each.

## 3. Day 4: authentication and roles (150 min)

This is the first of the two new topics. Nothing in M01 to M09 covered it, so you research it as you would on a real team. Read the library's own documentation, and note your choices as you make them.

**What to build**

- **Register and login endpoints.** Registration stores a user. Login checks the credentials and returns a token (or sets a cookie).
- **Hashed passwords.** Choose **bcrypt or argon2** and be ready to say why. A password must never be stored or logged as plain text, and a response must never include the hash.
- **Protected routes.** Choose **a JWT or a signed session cookie**, and be ready to say why. Build a middleware that rejects a request without a valid token, and attaches the user to the request for the routes behind it.
- **Two roles with a real difference.** At least one endpoint must behave differently by role. For example, only the librarian can delete a book, or only the agent can close a ticket. A cosmetic flag does not count: the wrong role must be **blocked**.
- **Rate-limiting on the auth endpoints.** Limit repeated attempts to register and log in. Other routes do not need it. Pick a small limit so you can see it trigger.
- **The secret goes through `config.ts`.** The signing secret is validated at startup, never hard-coded and never committed. `.env.example` shows its name, with no real value.

**What to research**

- How a hash differs from encryption, and what a salt and a cost factor are.
- What a JWT contains, what signing proves, and what it does not (a JWT is signed, not hidden).
- Where each choice lives: a JWT you send in a header, or a signed cookie the browser sends for you, and what each risks.
- Which HTTP status each failure deserves: **401** (we do not know who you are) and **403** (we know who you are, and you may not do this).
- Why a login error should not say whether the email or the password was wrong.

**You should see**

- A registration, then a login, then a protected route that answers `200` with the token and `401` without it.
- The wrong role getting `403` on the role-gated endpoint, and the right role getting through.
- Repeated logins from the same client eventually getting `429`.

**Checkpoint 3**

- [ ] You can register and log in, and a database row shows a hash and not the password.
- [ ] A protected route answers `401` with no token and `200` with one.
- [ ] The wrong role is rejected with `403`, and the right role succeeds.
- [ ] Repeated login attempts trigger `429`.
- [ ] `config.ts` refuses to start without the secret, and the secret is in no committed file.

## 4. Day 4: routes, validation, errors and the business rule (120 min)

**Goal:** the API behind the auth, with the rules that make it correct.

1. **Resources.** Build full CRUD for 2 or more resources, and wire the M:N relation so a client can create and read it.
2. **One list endpoint** with filtering, sorting and pagination. Use query parameters and validate them.
3. **Validate everything with Zod 4.** Body, params and query, plus the environment (`config.ts`). Reject bad input with your consistent error shape.
4. **One central error handler** with a single error shape for every failure, including auth failures (`401`, `403`, `429`) and Prisma errors you map, as you did in M05 and M07. No stack trace reaches the client.
5. **The business rule, in a service, inside a transaction.** Choose a rule that depends on the current state of the database, such as "cannot loan a book with no copies left", "cannot register for a full event" or "cannot spend past a budget". Put the check and the write in one service function and one transaction. The route calls the service, and the route does no rule checking itself.

**Checkpoint 4**

- [ ] Each resource has working create, read, update and delete, and the list endpoint filters, sorts and pages.
- [ ] A bad body, bad id and bad query each return the same error shape with a `400`.
- [ ] A broken rule returns a clear `409` (or your chosen status) from the service, and nothing is half-written.

Commit and push on a branch, and open a pull request.

## 5. Day 4: prove the concurrency fix and write the tests (120 min)

### 5.1 Prove the transaction prevents the race

This is the second new topic. The rubric does not accept "I used a transaction". It wants **evidence** that, under parallel requests, the rule still holds.

**What the evidence must show:** a **before** and an **after**.

- **Before.** Fire many requests at the same contested resource at the same moment, against a version of your rule that checks and then writes **without** a correct transaction. Show that the rule breaks: for example, more loans than copies, or more registrations than seats.
- **After.** Run the same script against the correct transaction. Show the rule holds: exactly as many succeed as the rule allows, and the rest are rejected cleanly.

**How to approach it**

- Write a small script (a Node script is enough) that sends N requests in parallel to the same resource, for example with `Promise.all` over N `fetch` calls, and then counts the outcomes and reads the final state.
- Make the "before" version on purpose (a temporary branch is enough): a read, then a gap, then a write. If you cannot make the race appear, widen the gap between the read and the write, and increase N.
- Keep the output. Paste both runs into your README or notes: the number of successes, the number of rejections and the final database state.

**What to research:** what a race condition is, why check-then-write is unsafe, and what your database guarantees inside a transaction (SQLite's locking is different from other databases, so say what you observed, not what you assume).

**Checkpoint 5a**

- [ ] You have a script that fires parallel requests at one resource.
- [ ] The "before" output shows the rule broken, and the "after" output shows it holding.
- [ ] Both outputs are saved somewhere you can show.

### 5.2 Tests

Reuse your M09 setup and write **25 or more integration tests**:

- the happy path for each endpoint, and the error paths (`400`, `401`, `403`, `404`, `409`, `429` where you can);
- **at least one test** where the wrong role is rejected on the role-gated endpoint, and not only that the right role succeeds;
- the business rule, including the case where it must refuse;
- your validation and the error shape.

Run `npm run test:coverage` (or your equivalent) and aim for **80% or more on routes and services**. Rate-limit tests can make other tests flaky, so check how your limiter behaves across tests, and make the limit configurable if you need to.

**Checkpoint 5b**

- [ ] You have 25 or more tests, all passing, and the tests include one for the wrong role.
- [ ] Coverage on routes and services is 80% or more.
- [ ] `npx tsc --noEmit` still reports zero errors.

## 6. Day 5: polish, CI, README and pull requests (120 min)

1. **Check the Git workflow.** You should have Issues, a branch per Issue, **8 or more merged pull requests** and Conventional Commits. If you are short on pull requests, split the remaining work into smaller branches, and not by opening empty ones.
2. **CI green.** Your GitHub Actions workflow runs install, type-check and tests on every pull request, and the latest run passes.
3. **README.** It must have setup steps, the scripts, the **Mermaid ERD**, an **endpoint list**, your hashing and token choices with versions, and the concurrency evidence from section 5.1.
4. **Bruno collection.** Commit a collection for the API in `bruno/`, including login and a protected request.
5. **Final pass.** Strict mode and zero `tsc --noEmit` errors. At least 3 migrations and a seed. No secret, `.env`, `*.db`, `node_modules/` or `dist/` committed. Run the whole project from a fresh clone, following only your own README, to be sure the setup steps are right.

**Checkpoint 6**

- [ ] The CI badge or latest run is green.
- [ ] A fresh clone starts by following only your README.
- [ ] Each rubric row's must-haves, in the table in section 1.2, are present in the repo.

## Check your understanding

Each prompt has a short note on what a good answer covers.

**1. Why is "I used a transaction" not enough to show a race is prevented?**
A transaction can still contain a check-then-write that interleaves with another request, depending on the database's locking and the isolation it gives you. The only proof is to reproduce the race without the fix, and then show it gone with the fix, under parallel load.

**2. Why `403` for the wrong role and `401` for no token?**
`401` means the server does not know who you are (no or bad credentials). `403` means it knows you and you are not allowed. Mixing them hides which problem the client has.

**3. What is the trade-off between a JWT and a signed session cookie?**
A JWT is sent by the client in a header and is checked without a database lookup, but it is hard to revoke before it expires. A signed cookie is sent by the browser automatically, which suits browser clients and brings cookie-specific risks such as cross-site requests. Say which you chose and which risk you accepted.

**4. Why is the must-have list a gate on top of the 70 points?**
Points can add up to 70 while a required piece, such as the transaction or the tests, is absent. The gate makes sure the project proves the skills the program is about, and not just a good total.

## Troubleshooting

**`bcrypt` or `argon2` fails to install**
Both download a prebuilt binary and fall back to compiling, which needs build tools. On Windows install the build tools Node mentions, on macOS the Xcode command line tools, and on Linux `build-essential`. If it still fails, read the error for the missing tool, or try the other library. This is untested on every OS.

**Your server starts without a signing secret, or crashes with a Zod error about it**
`config.ts` should fail fast when the secret is missing. Add it to your local `.env` (never committed) and to `.env.example` with a placeholder, and in CI set it as an environment variable or a repository secret. Use a different value for tests.

**You cannot reproduce the race**
Fire more requests, and make the gap between the read and the write wider in the "before" version (for example by awaiting a short delay between them). Also check that the requests are really sent in parallel and not one after another.

**The rate limiter makes other tests fail with `429`**
Your auth tests share one counter. Reset the limiter between tests, make the limit configurable in `config.ts`, or use a high limit for the test environment and a low one only in the rate-limit test.

**`npx prisma` behaves strangely or does not read `schema.prisma`**
Always use `npx prisma@7`. An unversioned `npx prisma` can resolve to a later major version.

**Tests delete your development data**
Copy the `DATABASE_URL` guard from your M09 `globalSetup`, so tests refuse to run unless they point at the test database.

**CI fails on GitHub but passes locally**
Open the failing step. Usual causes: a missing `prisma generate` step, a secret or `.env.test` value not available in CI, or `package-lock.json` not committed. This is untested here, because it needs a real GitHub repository.

## You're done when

- [ ] You have a standalone API in a new domain, with 3 or more models, a 1:N and an M:N relation, full CRUD for 2 resources, and a list endpoint with filtering, sorting and pagination.
- [ ] Registration and login work, passwords are hashed, protected routes need a token, and the wrong role is rejected.
- [ ] Rate-limiting triggers on the auth endpoints, and the signing secret comes from `config.ts` and is not committed.
- [ ] One business rule runs in a service inside a transaction, and your script shows the before and after under concurrent load.
- [ ] You have 25 or more integration tests, including the role-gated endpoint, with 80% or more coverage on routes and services.
- [ ] Zod validates body, params, query and env, and one central error handler returns one error shape.
- [ ] You have 3 or more committed migrations, a seed script, strict TypeScript and zero `tsc --noEmit` errors.
- [ ] You have 8 or more pull requests, Conventional Commits and a passing CI.
- [ ] The README has setup steps, scripts, a Mermaid ERD and an endpoint list, and a Bruno collection is committed.
- [ ] Everything is committed and pushed to your repo.

This is the last stage of the course. When every box is ticked, you have finished.

Previous: [M09, Integration Testing with Jest + Supertest](../m09-integration-testing/index.md).
