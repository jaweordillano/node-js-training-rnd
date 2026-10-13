# M09 — Integration Testing with Jest + Supertest

**Module M09 · Week 4 · Days 1-2 · about 5 hours**

Prove the Task API works the way you think it does: write integration tests that send real requests to your Express app and check a real SQLite database, add one endpoint test-first, and have GitHub run all of it on every pull request.

## Overview & time plan

**Builds on:** M05 and M07. You need the `node-js-training` repo with the Task API (an exported Express `app` in `src/app.ts`, your error handler from M05, and the Prisma database and service layer from M07), TypeScript set up with `npm run typecheck` clean, and Node.js 24. Everything you write here goes into that same repo, with the add, commit and push steps you know, plus the branch and pull request from M01 in section 8. (The word "module" on this page means the course lessons, M01 to M10.)

Today you check the Task API by hand with `npm run bruno`. That is slow, and it only covers the cases you remember. An **integration test** sends a real request into the real app and checks both the answer and the real database. You write each one once, and from then on a computer runs them all in about a second. When a later change breaks something, a test tells you at once, with the name of the broken promise.

You will:

- set up **Jest 30** and **Supertest** for a TypeScript and ES modules project, using **`@swc/jest`** to strip the types;
- give the tests their own **SQLite database**, built from your migrations and emptied before every test;
- write about **38 tests**: the happy path of every endpoint, then `400`, `404`, `409`, malformed JSON, filtering, sorting, paging, and your middleware;
- add `PATCH /tasks/:id/complete` **test-first**: red, green, refactor;
- measure **coverage**, run the suite in **random order**, and learn what makes tests flaky;
- run it all on **GitHub Actions**, and put a status badge on your README.

This is Task API v4. M05 to M07 built the API, and this module proves it works. Your validation is still the hand-written code from M05, and the tests check the answers it gives (a `400` with `details`), not how it works inside. Your M10 capstone will reuse this test setup, so keep it tidy.

Time plan:

1. Testing strategy and the Jest vocabulary: 30 min
2. Set up Jest, @swc/jest and a first test: 40 min
3. The test database: 45 min
4. Supertest and the happy paths: 50 min
5. Error paths, list queries and middleware: 55 min
6. Test-first: PATCH /tasks/:id/complete: 25 min
7. Coverage, random order and flaky tests: 25 min
8. CI: GitHub Actions and the badge: 25 min
9. Check your understanding: 5 min

> **How this page uses your time** The page gives you the test code to type or paste, with the reason for each part. You still run every step and read every result. If you want more practice, write one extra test of your own at the end of each section before you read on.

Type the first test of each kind and the setup files in sections 2 and 3. You may paste the longer test files in sections 4 and 5. Run each step, and compare with the *You should see* box. Your process numbers, timings, ids and migration dates will differ. Commands are written for Git Bash on Windows, and macOS and Linux Terminal. If anything else differs, check [Troubleshooting](#troubleshooting).

## 1. Testing strategy and the Jest vocabulary (30 min)

### 1.1 Why tests, and which kind

Right now you check the Task API by hand: you run `npm run bruno` or call it from a terminal and look at the answers. That works once. It does not tell you, next month, that a change to the list query quietly broke the `409` rule. An **automated test** is a small program that makes a request, checks the answer, and fails loudly if it is wrong. You run all of them in seconds, every time you change something, and on GitHub before a change is merged.

| Kind | What it runs | Speed | What it catches |
| --- | --- | --- | --- |
| **Unit** | One function, with everything around it faked | Very fast | A wrong calculation or branch inside one function |
| **Integration** | Several real parts together: here the Express app, your middleware, the service layer and a real SQLite database | Fast (about a second for this whole suite) | Parts that do not fit together: a wrong status code, a missing header, a database rule you forgot |
| **End-to-end** | The whole product, usually through a browser, against a deployed copy | Slow and fragile | Things only a real user flow shows. This API has no front end, so you do not need it |

The **testing pyramid** says: write many fast tests and few slow ones. For an API, the best value is in the middle. Each test sends one real HTTP request into your app and checks the response and the data it left behind. That is what this module builds.

### 1.2 Why a real database and not a mock

A **mock** is a stand-in that pretends to be a real part. You could replace Prisma with a mock that returns a made-up task. The test would pass, and prove only that your code calls the mock the way you wrote it. It would not prove that the SQL works, that your migration created the table, or that the `titleKey` column really rejects a duplicate title. In M07 the `409` comes from a **database rule**. A mock database cannot break that rule, so a mock cannot test it.

SQLite makes a real database cheap: it is one file, with no server to start. So the tests here use a real `test.db` file, built by your real migrations. The only thing you will fake is a failure that is hard to cause on purpose (section 5).

### 1.3 How a request reaches your tests

Since M05 your code is split in two: `src/app.ts` builds and exports the Express app, and `src/server.ts` is the only file that calls `listen`. Supertest uses that split. `request(app)` takes the app itself, starts it on a throw-away port for the length of one call, and gives you the response. No server to start or stop, and no port that can already be in use.

### 1.4 What to test in an API

For each endpoint, ask the same four questions. The tests you write in sections 4 to 6 are exactly these:

- **Does it work?** The happy path: the right status, body and data in the database.
- **Does it refuse bad input?** `400` with `details`, and nothing saved.
- **What if it does not exist, or already does?** `404` and `409`.
- **Is the plumbing right?** The `X-Request-Id` header, the unknown-route `404`, and an error handler that never leaks a stack trace.

### 1.5 The Jest vocabulary

**Jest** is the test runner: it finds your test files, runs them, and reports what failed. You will meet each of these in the next sections, so read this as a map, not something to memorise.

| Piece | What it does |
| --- | --- |
| `describe("name", () => {...})` | Groups related tests under a heading |
| `it("does something", () => {...})` | One test. It passes if it finishes without a failed `expect`. (`test` is another name for `it`.) |
| `expect(value).toBe(5)` | An assertion: it fails the test if the value is not what you said |
| `toBe` · `toEqual` · `toMatchObject` · `toContain` · `toHaveLength` | Matchers. `toBe` is for one value, `toEqual` compares whole objects, `toMatchObject` checks that an object contains at least these fields |
| `expect.any(String)` · `expect.objectContaining({...})` | Placeholders for the parts you cannot know in advance (an id) or do not care about |
| `async` tests and `await` | A test can be an `async` function. Jest waits for it, so you can `await` a request |
| `beforeEach` · `afterAll` (also `beforeAll`, `afterEach`) | Code that runs around your tests: before every test, or once after the last one |
| `it.each([...])` | Runs one test body against many inputs |
| `rejects` · `toThrow` | Check that a promise rejects, or a function throws |
| `jest.fn()` · `jest.spyOn()` | Fakes that record how they were called. Used only at boundaries (section 5) |

Imports come from `@jest/globals` (`import { describe, expect, it } from "@jest/globals"`). With TypeScript and ES modules that gives you proper types, and no hidden global names. Every test follows **Arrange, Act, Assert**: set up the data, do the one thing, check the result. Keep a blank line between the three, and you can read any test at a glance.

**Checkpoint 1**

- [ ] You can say why this module tests against a real SQLite file and not a mock database.
- [ ] You can say what `request(app)` needs from `src/app.ts`, and why `listen` lives in `server.ts`.
- [ ] You can name the four questions to ask for each endpoint.

## 2. Set up Jest, @swc/jest and a first test (40 min)

Work in your `node-js-training` repo, on `main`, as in M07. The tests live in a new `tests/` folder next to `src/`.

### 2.1 Install

```bash
npm install -D jest@30 supertest@7 @swc/jest @swc/core @jest/globals@30 @types/supertest
```

| Package | What it is |
| --- | --- |
| `jest` | The test runner |
| `supertest` | Sends HTTP requests to your app and lets you assert on the answers |
| `@swc/jest` and `@swc/core` | The **transform**. Jest only reads JavaScript, so something must turn your `.ts` files into JavaScript first. SWC is a very fast compiler that just removes the types |
| `@jest/globals` | The typed `describe`, `it`, `expect` and `jest` you import |
| `@types/supertest` | TypeScript types for Supertest |

Just as in M07, npm may print `install-scripts` warnings for `@swc/core` and others. They work anyway.

> **Types are checked somewhere else** SWC does not check types. It only strips them, the same as `tsx` does. The check is still `npm run typecheck`, and you will make it cover your tests in step 2.5. The CI workflow in section 8 runs it too.

### 2.2 Configure Jest

Your project is ES modules (`"type": "module"` since M01) with TypeScript files, so Jest needs to be told three things: which files are tests, how to turn `.ts` into JavaScript, and that `.ts` files are ES modules. Create `jest.config.js` in the repo root:

```js
/** @type {import('jest').Config} */
export default {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.ts$": [
      "@swc/jest",
      {
        jsc: { parser: { syntax: "typescript" }, target: "es2023" },
        module: { type: "es6" },
      },
    ],
  },
  silent: true,
};
```

- **`roots` and `testMatch`**: look for `*.test.ts` files inside `tests/` only.
- **`extensionsToTreatAsEsm`**: treat `.ts` files as ES modules, like Node.js does for your project.
- **`transform`**: run every `.ts` file through `@swc/jest`. `module: { type: "es6" }` keeps `import` and `export` as they are, instead of rewriting them to `require`. That is what ESM mode needs.
- **`silent: true`**: hide `console.log` output. Your M05 request logger prints a line per request, and 40 tests would bury the results in logs. (`console.error` from a failing test still shows in the failure report.)

The `.ts` import endings in your code (`from "./db.ts"`) work in Jest as they are, because Jest can find a file whose name is spelled out.

### 2.3 The test script

```bash
npm pkg set scripts.test="node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand"
```

- **`node ... node_modules/jest/bin/jest.js`**: start Jest through `node` directly. This works the same on Windows, macOS and Linux, with no shell tricks.
- **`--experimental-vm-modules`**: the Node.js flag that lets Jest run ES modules. It prints an `ExperimentalWarning` each run. That is normal.
- **`--runInBand`**: run the test files one after the other, in one process. You will see why in section 3: every test file uses the same SQLite file, and SQLite lets one writer in at a time.

### 2.4 The first test

Make the folder, then create the first test:

```bash
mkdir tests
```

Create `tests/health.test.ts`:

```ts
import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import { app } from "../src/app.ts";

describe("GET /api/v1/health", () => {
  it("answers 200 and { status: 'ok' }", async () => {
    const res = await request(app).get("/api/v1/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
```

`request(app).get(path)` sends the request, and `await` gives you the response: `res.status`, `res.headers`, `res.body` (the parsed JSON). Run it:

```bash
npm test
```

*You should see:*

```text
> js-training@1.0.0 test
> node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand

(node:12345) ExperimentalWarning: VM Modules is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        0.3 s
```

Your process number and timings differ. A green run ends with a summary like this: **Tests: 1 passed**. A failing test is printed in full above it.

### 2.5 Practise the Jest basics

Before the API tests, five minutes with the vocabulary from section 1.5, on plain functions where nothing else can go wrong. Create `tests/basics.test.ts`. **You will delete it afterwards.** Read each test, and guess whether it passes before you run it:

```ts
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const add = (a: number, b: number) => a + b;

function parsePort(value: string): number {
  const port = Number(value);
  if (Number.isNaN(port)) throw new Error(`Not a number: ${value}`);
  return port;
}

async function fetchUser(id: number) {
  if (id < 0) throw new Error("bad id");
  return { id, name: "Ada", roles: ["admin", "dev"] };
}

describe("matchers", () => {
  it("compares one value with toBe", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("compares whole objects with toEqual", () => {
    expect({ a: 1, b: [2, 3] }).toEqual({ a: 1, b: [2, 3] });
  });

  it("checks a subset with toMatchObject and objectContaining", () => {
    const user = { id: 7, name: "Ada", createdAt: "2026-10-13" };

    expect(user).toMatchObject({ name: "Ada" });
    expect([user]).toEqual([expect.objectContaining({ name: "Ada" })]);
    expect(user.id).toEqual(expect.any(Number));
  });

  it("works with async code", async () => {
    const user = await fetchUser(1);

    expect(user).toMatchObject({ name: "Ada" });
    expect(user.roles).toContain("dev");
  });

  it("checks a rejected promise with rejects", async () => {
    await expect(fetchUser(-1)).rejects.toThrow("bad id");
  });

  it("checks a thrown error with toThrow", () => {
    expect(() => parsePort("abc")).toThrow("Not a number: abc");
  });

  it.each([
    ["8080", 8080],
    ["0", 0],
    ["3000", 3000],
  ])("parsePort(%s) is %i", (input, expected) => {
    expect(parsePort(input)).toBe(expected);
  });
});

describe("hooks and fakes", () => {
  let count = 0;

  beforeEach(() => {
    count = 0; // runs before every test in this describe
  });

  it("starts at zero (first test)", () => {
    count += 1;
    expect(count).toBe(1);
  });

  it("starts at zero again (second test)", () => {
    count += 1;
    expect(count).toBe(1);
  });

  it("records the calls to jest.fn()", () => {
    const greet = jest.fn((name: string) => `Hello, ${name}`);

    greet("Ada");

    expect(greet).toHaveBeenCalledTimes(1);
    expect(greet).toHaveBeenCalledWith("Ada");
    expect(greet).toHaveReturnedWith("Hello, Ada");
  });
});
```

```bash
npm test
```

*You should see:*

```text
Test Suites: 2 passed, 2 total
Tests:       13 passed, 13 total
```

(Only the last lines are shown.) That is 1 health test plus 12 here, because `it.each` counts every row as its own test. Two things to try: change `toBe(5)` to `toBe(6)` and read the failure report, which shows the expected and received values and the line that failed. Then change it back. And notice that the two `count` tests both pass even though each adds 1: `beforeEach` reset it. **Sharing state between tests and resetting it in `beforeEach` is exactly what you do with the database in section 3.**

Delete the practice file when you are done:

```bash
rm tests/basics.test.ts
```

### 2.6 Type-check the tests too

Open `tsconfig.json` and add `"tests"` to `include`, so `tsc` checks your tests as well as `src`:

```json
"include": ["src", "tests"]
```

```bash
npm run typecheck
```

*You should see:*

```text
> js-training@1.0.0 typecheck
> tsc --noEmit
```

No errors. If it complains about `describe`, `it` or `supertest`, check step 2.1 installed `@jest/globals` and `@types/supertest`.

> **If @swc/jest does not work on your machine** Jest 30, `@swc/jest`, TypeScript 7 and the Prisma-generated client is the least tried combination in this course, and this page was checked only on Linux with Node.js 24. If `npm test` fails with an error that is about loading or transforming a file (not a failing test), the programme's fallback list applies. Try them **in this order, one at a time, never mixed**: first `ts-jest` with its TypeScript 7 side-by-side setup, then TypeScript 6 for the test tooling only, and last compiling the project as CommonJS by removing `"type": "module"` from `package.json`. These three fallbacks are **untested** on this page. Write down which one you needed.

Commit this much:

```bash
git add .
git commit -m "test: add jest, supertest and a first health test"
```

**Checkpoint 2**

- [ ] `npm test` shows `Tests: 1 passed` for the health test, and `tests/basics.test.ts` is deleted.
- [ ] You changed an expected value on purpose, read the failure, and changed it back.
- [ ] `npm run typecheck` is clean with `tests` included.
- [ ] You can say why `--runInBand` is in the script, and what `@swc/jest` does and does not do.

## 3. The test database (45 min)

### 3.1 Why tests need their own database

Your tests will create tasks, change them and delete them. Run them against `data/app.db`, the database you develop with, and they would fill your real data with test rows, or worse, delete it. Worse still, a test could pass or fail because of rows an earlier test left behind. So the strategy has four rules:

1. **A separate file**, `data/test.db`, that only the tests use.
2. **The same schema**, built by the same migrations as the real database. The tests run `prisma migrate deploy` (M07) once, before any test.
3. **Empty tables before every test**, so no test depends on another.
4. **One process at a time** (`--runInBand`), because all the test files share one SQLite file.

### 3.2 Point the tests at test.db

Your code already reads the database address from `DATABASE_URL` (`src/db.ts` and `prisma7.config.ts`). So "use another database" only means "start with another `DATABASE_URL`". Create `.env.test` in the repo root:

```text
DATABASE_URL="file:./data/test.db"
```

Unlike `.env`, this file holds no secret, so you **do** commit it: CI needs it too. (`data/` and `*.db` are already in your `.gitignore`, so `test.db` is never committed.) Now make the test script load it, with Node.js's own `--env-file` flag, as you did in M03:

```bash
npm pkg set scripts.test="node --env-file=.env.test --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand"
```

A value that is already set wins over `.env` files, so this is also why the Prisma tool, which loads `.env` through `dotenv`, still uses `test.db` when the tests run it.

### 3.3 Build the schema once: globalSetup

A Jest **globalSetup** file runs once, before the first test file. It is the place to run `prisma migrate deploy`, which applies your migrations to `test.db` and creates the file if it is missing. Create `tests/global-setup.js` (plain JavaScript: it runs before Jest's transform is ready):

```js
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";

// Runs once, before any test file. DATABASE_URL already points at data/test.db,
// because the npm script loads .env.test before it starts Jest.
export default function globalSetup() {
  // The tests delete every row, so refuse to run against anything but a test database.
  if (!process.env.DATABASE_URL?.includes("test")) {
    throw new Error("DATABASE_URL must point at a test database. Run the tests with npm test.");
  }
  mkdirSync("data", { recursive: true });
  execSync("npx prisma@7 migrate deploy", { stdio: "inherit" });
}
```

The first `if` is a safety catch. If someone starts Jest by hand (`npx jest`) and forgets the env file, `DATABASE_URL` would be empty, `src/db.ts` would fall back to `data/app.db`, and the next step would wipe your development data. The catch stops that before anything runs. `migrate deploy` is the M07 command for "apply the migrations that exist and ask nothing", which is why it fits tests and CI.

### 3.4 Empty the tables before every test

Create the folder, then `tests/helpers/db.ts`:

```bash
mkdir tests/helpers
```

```ts
import { prisma } from "../../src/db.ts";

// Empty every table before each test. Order matters: a task points at a user,
// so tasks go first. The task-tag link rows are removed together with the tasks and tags.
export async function resetDb(): Promise<void> {
  await prisma.task.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();
}

export { prisma };
```

**Why the order matters.** The database has a foreign key: `Task.userId` points at a `User`. Delete users first and the database refuses (or, with `onDelete: SetNull`, changes your tasks behind your back). Delete the table that *points* (tasks) before the table that is *pointed at* (users). The tags and the link table between tasks and tags follow along. If you add a table later, put it in the right place in this list.

The helper re-exports `prisma`, so tests that need to look in the database import it from here. It is the same client the app uses (`src/db.ts`), reading the same `DATABASE_URL`.

### 3.5 Factories: valid rows in one line

Many tests start with "given a task". A **factory** builds a valid row and lets a test override only the field it cares about, so the test shows what matters and hides the rest. Create `tests/helpers/factories.ts`:

```ts
import { prisma } from "./db.ts";
import type { TaskStatus } from "../../src/generated/prisma/client.ts";

let counter = 0;

// A factory builds a valid row and lets a test override only what it cares about.
// The counter keeps titles unique, because the title rule lives in the database.
export async function makeTask(overrides: { title?: string; description?: string; status?: TaskStatus } = {}) {
  counter += 1;
  const title = overrides.title ?? `Task ${counter}`;
  return prisma.task.create({
    data: { ...overrides, title, titleKey: title.toLowerCase() },
  });
}
```

It writes straight to the database with Prisma, not through the API, so a test that checks `GET /tasks/:id` does not depend on `POST /tasks` working. `titleKey` is the lower-case title from M07.

### 3.6 Run the reset for every test, and disconnect at the end

Create `tests/setup.ts`. Jest runs it before each test file when you list it as `setupFilesAfterEnv`:

```ts
import { afterAll, beforeEach } from "@jest/globals";
import { prisma, resetDb } from "./helpers/db.ts";

// Runs for every test file, so each test starts from empty tables.
beforeEach(resetDb);
afterAll(() => prisma.$disconnect());
```

`beforeEach(resetDb)` is the "empty tables" rule. `afterAll(() => prisma.$disconnect())` closes the database connection when a test file ends, as `server.ts` does on shutdown. Now add the two keys to `jest.config.js`, after `silent`:

```js
  silent: true,
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  globalSetup: "<rootDir>/tests/global-setup.js",
```

### 3.7 Prove the isolation

Create `tests/database.test.ts`. Two tests, written so that **both pass only if the reset works**, in whichever order they run:

```ts
import { describe, expect, it } from "@jest/globals";
import { prisma } from "./helpers/db.ts";
import { makeTask } from "./helpers/factories.ts";

describe("the test database", () => {
  it("can hold rows during a test", async () => {
    await makeTask();
    await makeTask();

    expect(await prisma.task.count()).toBe(2);
  });

  it("is empty again at the start of the next test", async () => {
    expect(await prisma.task.count()).toBe(0);
  });
});
```

```bash
npm test
```

*You should see:*

```text
> js-training@1.0.0 test
> node --env-file=.env.test --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand

Loaded Prisma config from prisma7.config.ts.

Prisma schema loaded from prisma/schema.prisma.
Datasource "db": SQLite database "test.db" at "file:./data/test.db"

SQLite database test.db created at file:./data/test.db

2 migrations found in prisma/migrations

Applying migration `20261013011433_init`
Applying migration `20261013011440_add_title_key`

The following migration(s) have been applied:

migrations/
  └─ 20261013011433_init/
    └─ migration.sql
  └─ 20261013011440_add_title_key/
    └─ migration.sql

All migrations have been successfully applied.
(node:12345) ExperimentalWarning: VM Modules is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)

Test Suites: 2 passed, 2 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        0.5 s
```

Your migration names have your own dates. The first run creates `data/test.db`. Later runs say `No pending migrations to apply.` instead.

### 3.8 Break it on purpose

See what the reset is worth. In `tests/setup.ts`, put `//` in front of `beforeEach(resetDb);`, and run `npm test`. The second test fails, because the first one left two rows behind:

*You should see:*

```text
  ● the test database › is empty again at the start of the next test

    expect(received).toBe(expected) // Object.is equality

    Expected: 0
    Received: 2
```

(Only the key lines.) Run it once more and the first test fails too, with a database error about a title that already exists, because the rows from the last run are still there. The result depends on what ran before and in which order. That is a **flaky test**, and shared state is its most common cause. Take the `//` away again, and check that `npm test` is green.

### 3.9 Check the safety catch

Start Jest the way the catch is meant to stop, without the env file:

```bash
node --experimental-vm-modules node_modules/jest/bin/jest.js
```

*You should see:*

```text
Error: Jest: Got error running globalSetup - .../tests/global-setup.js, reason: DATABASE_URL must point at a test database. Run the tests with npm test.
```

Your path differs, and a stack trace follows. Nothing ran, and `data/app.db` was not touched.

> **One database file per worker** `--runInBand` is the simple answer. The faster answer on a big suite is one database file per Jest worker, named from the `JEST_WORKER_ID` variable that Jest sets (`test-1.db`, `test-2.db`). This course keeps one file. Your suite takes about a second, so parallel workers would add complexity and save nothing.

Commit:

```bash
git add .
git commit -m "test: add a separate test database with reset helpers"
```

**Checkpoint 3**

- [ ] `data/test.db` exists, `npm test` is green with 3 tests, and `git status` does not list `test.db`.
- [ ] You saw the second database test fail with the reset switched off, then fixed it.
- [ ] The catch refused to run Jest without the env file, and `data/app.db` is untouched.
- [ ] You can say why `resetDb` deletes tasks before users.

## 4. Supertest and the happy paths (50 min)

### 4.1 The shape of a Supertest call

```ts
const res = await request(app)
  .post("/api/v1/tasks")        // method and path
  .set("X-Request-Id", "abc")   // a header
  .query({ page: 2 })           // ?page=2
  .send({ title: "Write it" }); // a JSON body (sets Content-Type for you)

res.status;   // 201
res.headers;  // all lower-case names: res.headers["x-request-id"]
res.body;     // the parsed JSON
```

`.get`, `.post`, `.patch` and `.delete` all work the same way, and `await` sends the request. Supertest does not throw on a `404` or `500`: you check `res.status` yourself, which is what lets you test error answers.

Supertest also has `request.agent(app)`, which remembers cookies between calls. The Task API does not use cookies, so you do not need it here. You will want it for sign-in in the capstone.

### 4.2 One test per behaviour

Each test below follows Arrange, Act, Assert, and checks the answer **and** what is left in the database, because a `201` with nothing saved is a bug. Create `tests/tasks.happy.test.ts`. Type the first test yourself so the pattern sinks in, then paste the rest:

```ts
import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import { app } from "../src/app.ts";
import { prisma } from "./helpers/db.ts";
import { makeTask } from "./helpers/factories.ts";

describe("POST /api/v1/tasks", () => {
  it("creates a task and answers 201", async () => {
    const res = await request(app).post("/api/v1/tasks").send({ title: "Write the tests" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: "Write the tests", status: "todo", tags: [] });
    expect(res.body.id).toEqual(expect.any(String));
    expect(await prisma.task.count()).toBe(1);
  });

  it("stores the optional fields and the tags", async () => {
    const res = await request(app)
      .post("/api/v1/tasks")
      .send({ title: "Ship it", description: "Before Friday", status: "in_progress", tags: ["work", "urgent"] });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      description: "Before Friday",
      status: "in_progress",
      tags: ["urgent", "work"],
    });
  });
});

describe("GET /api/v1/tasks/:id", () => {
  it("returns one task", async () => {
    const task = await makeTask({ title: "Find me" });

    const res = await request(app).get(`/api/v1/tasks/${task.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: task.id, title: "Find me", status: "todo" });
  });
});

describe("GET /api/v1/tasks", () => {
  it("returns an empty page when there are no tasks", async () => {
    const res = await request(app).get("/api/v1/tasks");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } });
  });

  it("returns every task, newest first by default", async () => {
    await makeTask({ title: "First" });
    await makeTask({ title: "Second" });

    const res = await request(app).get("/api/v1/tasks");

    expect(res.body.meta.total).toBe(2);
    expect(res.body.data.map((t: { title: string }) => t.title)).toEqual(["Second", "First"]);
  });
});

describe("PATCH /api/v1/tasks/:id", () => {
  it("changes only the fields you send", async () => {
    const task = await makeTask({ title: "Old title", description: "Keep me" });

    const res = await request(app).patch(`/api/v1/tasks/${task.id}`).send({ title: "New title" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ title: "New title", description: "Keep me" });
  });

  it("replaces the tags when tags are sent", async () => {
    const task = await makeTask();
    await request(app).patch(`/api/v1/tasks/${task.id}`).send({ tags: ["a", "b"] });

    const res = await request(app).patch(`/api/v1/tasks/${task.id}`).send({ tags: ["c"] });

    expect(res.body.tags).toEqual(["c"]);
  });
});

describe("DELETE /api/v1/tasks/:id", () => {
  it("deletes the task and answers 204 with no body", async () => {
    const task = await makeTask();

    const res = await request(app).delete(`/api/v1/tasks/${task.id}`);

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
    expect(await prisma.task.count()).toBe(0);
  });
});
```

Things to notice:

- **`toMatchObject`** checks the fields you name and ignores the rest. The response also has an `id` and two timestamps that change on every run, and the test does not care about them. `expect.any(String)` checks that the `id` is there without knowing its value.
- **The factory is the Arrange step.** `makeTask({ title: "Find me" })` shows the only detail the test depends on.
- **The list test sorts by nothing**, so it relies on the default order: newest first. A test that names its expectation ("newest first") catches the day someone changes the default.
- **Reading the database back** (`prisma.task.count()`) proves the change was saved, not just reported.
- **Titles are unique** (the M07 rule), so each factory call gets a different title.

```bash
npm test
```

*You should see:*

```text
Test Suites: 3 passed, 3 total
Tests:       11 passed, 11 total
Snapshots:   0 total
```

(Only the last lines are shown.) 1 health + 2 database + 8 here.

Commit:

```bash
git add .
git commit -m "test: cover the happy paths of every endpoint"
```

**Checkpoint 4**

- [ ] `npm test` shows `Tests: 11 passed`.
- [ ] Every endpoint (create, read one, list, update, delete) has at least one test, and each one checks the database or the body.
- [ ] You can say what `toMatchObject` ignores, and why that helps here.

## 5. Error paths, list queries and middleware (55 min)

The happy path is half the job. Most bugs live in what happens when something is wrong, so each of these tests pins down one promise your API makes. Three new files, each about one theme. Type one test from each, and paste the rest.

> **Assert on the path, not the wording** The validation tests below check that `details` names the right **field** (`path`) and that every message is a string. They do not check the message text. The text is the part most likely to change later, and the field name is the contract.

### 5.1 Errors: 400, 404 and 409

Create `tests/tasks.errors.test.ts`. `it.each` runs one test body for every row of a table, so four kinds of bad input cost four lines:

```ts
import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import { app } from "../src/app.ts";
import { prisma } from "./helpers/db.ts";
import { makeTask } from "./helpers/factories.ts";

describe("POST /api/v1/tasks errors", () => {
  it.each([
    ["a missing title", {}, "title"],
    ["an empty title", { title: "" }, "title"],
    ["a title that is not a string", { title: 42 }, "title"],
    ["an unknown status", { title: "Ok", status: "later" }, "status"],
  ])("rejects %s with 400 and details", async (_name, body, path) => {
    const res = await request(app).post("/api/v1/tasks").send(body);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ path, message: expect.any(String) })]),
    );
    expect(await prisma.task.count()).toBe(0);
  });

  it("rejects malformed JSON with 400", async () => {
    const res = await request(app)
      .post("/api/v1/tasks")
      .set("Content-Type", "application/json")
      .send('{"title": "oops"');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatchObject({ code: "BAD_REQUEST", message: "Request body is not valid JSON" });
  });

  it("rejects a duplicate title with 409, whatever the letter case", async () => {
    await makeTask({ title: "Write docs" });

    const res = await request(app).post("/api/v1/tasks").send({ title: "WRITE DOCS" });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
    expect(await prisma.task.count()).toBe(1);
  });
});

describe("tasks that do not exist", () => {
  it("GET answers 404 with the error envelope", async () => {
    const res = await request(app).get("/api/v1/tasks/no-such-id");

    expect(res.status).toBe(404);
    expect(res.body.error).toMatchObject({ code: "NOT_FOUND" });
  });

  it("PATCH answers 404", async () => {
    const res = await request(app).patch("/api/v1/tasks/no-such-id").send({ title: "x" });

    expect(res.status).toBe(404);
  });

  it("DELETE answers 404 when the task is already gone", async () => {
    const res = await request(app).delete("/api/v1/tasks/no-such-id");

    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/v1/tasks/:id errors", () => {
  it("rejects an invalid change with 400 and leaves the task alone", async () => {
    const task = await makeTask({ title: "Stay" });

    const res = await request(app).patch(`/api/v1/tasks/${task.id}`).send({ status: "later" });

    expect(res.status).toBe(400);
    expect(res.body.error.details).toEqual([expect.objectContaining({ path: "status" })]);
    expect(await prisma.task.findUnique({ where: { id: task.id } })).toMatchObject({ title: "Stay", status: "todo" });
  });

  it("rejects a rename to a title that is taken with 409", async () => {
    await makeTask({ title: "Taken" });
    const other = await makeTask({ title: "Free" });

    const res = await request(app).patch(`/api/v1/tasks/${other.id}`).send({ title: "taken" });

    expect(res.status).toBe(409);
  });
});
```

- **A rejected request leaves no trace.** The create tests check `prisma.task.count()` after the `400` and the `409`. An API that answers `400` but saves the row anyway is broken.
- **Malformed JSON** needs `.set("Content-Type", "application/json")` and a string body: `.send({...})` would always send valid JSON.
- **The `404` for a missing id** comes from Prisma error `P2025`, mapped in M07 by the central error handler. The test does not care how: it checks the promise the API makes.

### 5.2 The list endpoint: filter, search, sort, page

Create `tests/tasks.list.test.ts`. The list query has the most options, so it has the most ways to be wrong. Each test sets up just enough rows to tell the options apart:

```ts
import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import { app } from "../src/app.ts";
import { makeTask } from "./helpers/factories.ts";

const titles = (body: { data: { title: string }[] }) => body.data.map((task) => task.title);

describe("GET /api/v1/tasks query options", () => {
  it("filters by status", async () => {
    await makeTask({ title: "Open", status: "todo" });
    await makeTask({ title: "Finished", status: "done" });

    const res = await request(app).get("/api/v1/tasks").query({ status: "done" });

    expect(titles(res.body)).toEqual(["Finished"]);
  });

  it("searches titles with q", async () => {
    await makeTask({ title: "Buy milk" });
    await makeTask({ title: "Write report" });

    const res = await request(app).get("/api/v1/tasks").query({ q: "milk" });

    expect(titles(res.body)).toEqual(["Buy milk"]);
  });

  it("sorts by title in either direction", async () => {
    await makeTask({ title: "banana" });
    await makeTask({ title: "apple" });
    await makeTask({ title: "cherry" });

    const asc = await request(app).get("/api/v1/tasks").query({ sort: "title", order: "asc" });
    const desc = await request(app).get("/api/v1/tasks").query({ sort: "title", order: "desc" });

    expect(titles(asc.body)).toEqual(["apple", "banana", "cherry"]);
    expect(titles(desc.body)).toEqual(["cherry", "banana", "apple"]);
  });

  it("pages the results and reports the totals", async () => {
    for (const title of ["a", "b", "c", "d", "e"]) await makeTask({ title });

    const res = await request(app).get("/api/v1/tasks").query({ sort: "title", order: "asc", page: 2, pageSize: 2 });

    expect(titles(res.body)).toEqual(["c", "d"]);
    expect(res.body.meta).toEqual({ page: 2, pageSize: 2, total: 5, totalPages: 3 });
  });

  it.each([
    ["status", { status: "later" }],
    ["sort", { sort: "color" }],
    ["order", { order: "sideways" }],
    ["page", { page: 0 }],
    ["pageSize", { pageSize: 1000 }],
  ])("rejects a bad %s with 400 and details", async (path, query) => {
    const res = await request(app).get("/api/v1/tasks").query(query);

    expect(res.status).toBe(400);
    expect(res.body.error.details).toEqual([expect.objectContaining({ path })]);
  });
});
```

Two habits here. The small `titles` helper turns a response into a list of titles, so each assertion is one readable line. And every test asserts the **whole order** with `toEqual([...])` and not "contains", because "banana, apple, cherry" would otherwise pass a sort test.

### 5.3 Middleware: request id, unknown routes, no leaked errors

Create `tests/middleware.test.ts`. These are the promises from M05 that every request depends on:

```ts
import { describe, expect, it, jest } from "@jest/globals";
import request from "supertest";
import { app } from "../src/app.ts";
import { prisma } from "./helpers/db.ts";

describe("middleware", () => {
  it("gives every response an X-Request-Id header", async () => {
    const res = await request(app).get("/api/v1/health");

    expect(res.headers["x-request-id"]).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("reuses an X-Request-Id sent by the client", async () => {
    const res = await request(app).get("/api/v1/health").set("X-Request-Id", "my-trace-id");

    expect(res.headers["x-request-id"]).toBe("my-trace-id");
  });

  it("answers an unknown route with the 404 envelope", async () => {
    const res = await request(app).get("/api/v1/nope");

    expect(res.status).toBe(404);
    expect(res.body.error).toMatchObject({
      code: "NOT_FOUND",
      message: "Route GET /api/v1/nope not found",
      requestId: res.headers["x-request-id"],
    });
  });

  it("never leaks the message or stack of a bug", async () => {
    // Boundary mock: make the database layer fail once, as if the disk broke.
    jest.spyOn(prisma.task, "findUniqueOrThrow").mockRejectedValueOnce(new Error("secret failure at /srv/app/db.ts"));

    const res = await request(app).get("/api/v1/tasks/any-id");

    expect(res.status).toBe(500);
    expect(res.body.error).toMatchObject({ code: "INTERNAL_ERROR", message: "Internal server error" });
    expect(JSON.stringify(res.body)).not.toContain("secret");
    expect(JSON.stringify(res.body)).not.toContain("stack");
    expect(JSON.stringify(res.body)).not.toContain("/srv/app");
  });
});
```

### 5.4 When a mock is right

The last test is the one place this module fakes something. A correct database never throws a surprise error on request, and you need one to prove the handler hides the details of a bug. `jest.spyOn(prisma.task, "findUniqueOrThrow")` replaces one method for one call with a version that throws. The rule is: **fake at a boundary, only to cause something you cannot cause for real, and never to avoid using the database**. Everything else in this suite uses the real one.

A spy stays in place after the test unless you undo it. Add this line to `jest.config.js`, after `silent`, so Jest restores every spy after each test:

```js
  silent: true,
  restoreMocks: true,
```

```bash
npm test
```

*You should see:*

```text
Test Suites: 6 passed, 6 total
Tests:       35 passed, 35 total
Snapshots:   0 total
```

(Only the last lines are shown.) 11 from before, plus 11 error tests, 9 list tests and 4 middleware tests. If one fails, read the report: it shows the expected and the received value, and the line. Do not edit the test to match until you are sure which one is wrong, the test or the API.

Commit:

```bash
git add .
git commit -m "test: cover error paths, list queries and middleware"
```

**Checkpoint 5**

- [ ] `npm test` shows `Tests: 35 passed`.
- [ ] Every error path has a test: `400` with `details`, malformed JSON, `404`, `409` (on create and on rename), and the unknown-route `404`.
- [ ] Each rejected request test also checks that nothing was saved or changed.
- [ ] You can say why the stack-trace test uses a mock when the rest of the suite does not.

## 6. Test-first: PATCH /tasks/:id/complete (25 min)

### 6.1 Red, green, refactor

So far you wrote tests for code that already existed. **Test-driven development** (TDD) turns that around, in three short steps:

1. **Red.** Write a test for behaviour that does not exist yet, and watch it fail. A test you have never seen fail may be testing nothing.
2. **Green.** Write the least code that makes it pass.
3. **Refactor.** Tidy the code with the tests as your safety net, and keep them green.

The new endpoint: `PATCH /api/v1/tasks/:id/complete` marks a task as `done` and returns it. Calling it on a task that is already done is fine and changes nothing. An unknown id gives `404`. Decide that **before** any code exists: that is the point.

### 6.2 Red

Create `tests/tasks.complete.test.ts`:

```ts
import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import { app } from "../src/app.ts";
import { prisma } from "./helpers/db.ts";
import { makeTask } from "./helpers/factories.ts";

describe("PATCH /api/v1/tasks/:id/complete", () => {
  it("marks the task done", async () => {
    const task = await makeTask({ status: "in_progress" });

    const res = await request(app).patch(`/api/v1/tasks/${task.id}/complete`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: task.id, status: "done" });
    expect(await prisma.task.findUnique({ where: { id: task.id } })).toMatchObject({ status: "done" });
  });

  it("is safe to repeat on a task that is already done", async () => {
    const task = await makeTask({ status: "done" });

    const res = await request(app).patch(`/api/v1/tasks/${task.id}/complete`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("done");
  });

  it("answers 404 for a task that does not exist", async () => {
    const res = await request(app).patch("/api/v1/tasks/no-such-id/complete");

    expect(res.status).toBe(404);
    expect(res.body.error).toMatchObject({ code: "NOT_FOUND", message: "The requested record was not found" });
  });
});
```

```bash
npm test -- tests/tasks.complete
```

Everything after `--` goes to Jest, here as a file name filter, so only this file runs.

*You should see:*

```text
  ● PATCH /api/v1/tasks/:id/complete › marks the task done

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

  ● PATCH /api/v1/tasks/:id/complete › answers 404 for a task that does not exist

    expect(received).toMatchObject(expected)

    - Expected  - 1
    + Received  + 1
      Object {
        "code": "NOT_FOUND",
    -   "message": "The requested record was not found",
    +   "message": "Route PATCH /api/v1/tasks/no-such-id/complete not found",
      }

Tests:       3 failed, 3 total
```

(Shortened.) That is **red**, and the right kind: the tests run and fail for the reason you expect. The route does not exist, so Express answers `404 Route ... not found`. Look at the last test. It would have **passed** if it only checked `status` is `404`, because the missing route also answers `404`. That is why it also checks the message of the real "task not found" error. A test that passes before the code exists is a test that proves nothing.

Commit the failing tests on their own. The history then shows the order you worked in:

```bash
git add .
git commit -m "test: add failing tests for completing a task"
```

### 6.3 Green

Now the least code that works. In `src/services/tasks.ts`, add this at the end of the file:

```ts
// Green, first try: the quickest thing that makes the tests pass
export async function completeTask(id: string): Promise<TaskView> {
  await prisma.task.update({ where: { id }, data: { status: "done" } });
  return getTask(id);
}
```

In `src/routes/tasks.ts`, add the route **above** the `delete` route. It cannot clash with `PATCH /:id`, because `/:id` matches one path segment and this path has two:

```ts
tasksRouter.patch("/:id/complete", async (req: Request<{ id: string }>, res: Response<TaskView>) => {
  res.json(await tasks.completeTask(req.params.id));
});
```

```bash
npm test -- tests/tasks.complete
```

*You should see:*

```text
Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
```

**Green.** An unknown id works because `update` throws Prisma's `P2025`, which your M07 handler already maps to `404`. You wrote no error handling at all.

### 6.4 Refactor

The green version works, but it makes two database calls and repeats what `updateTask` already does. Completing a task *is* an update. Replace `completeTask` with:

```ts
// Refactor: completing a task is just an update, so reuse updateTask
export function completeTask(id: string): Promise<TaskView> {
  return updateTask(id, { status: "done" });
}
```

```bash
npm test
npm run typecheck
```

*You should see:*

```text
Test Suites: 7 passed, 7 total
Tests:       38 passed, 38 total
```

(Plus a clean typecheck.) The same three tests still pass after the rewrite, which is what they are for: you changed how it works and can see that you did not change what it does.

Commit:

```bash
git add .
git commit -m "feat: add PATCH /tasks/:id/complete"
```

> **What test-first changed** You decided the behaviour first: the status, the repeat call, the `404` message. And you saw the tests fail for the right reason before writing a line. Keep a note of what felt different from writing the tests after the code in section 5. That note is the "test-first" evidence the module asks for. Your commit history (`test: add failing tests...` before `feat: add ...`) is the other half.

**Checkpoint 6**

- [ ] You saw the three new tests fail (`3 failed`) before you wrote any code, and committed them first.
- [ ] `npm test` shows `Tests: 38 passed` and `npm run typecheck` is clean after the refactor.
- [ ] You can explain why the `404` test checks the message, and not only the status.

## 7. Coverage, random order and flaky tests (25 min)

### 7.1 Measure what the tests run

**Coverage** counts which lines of your code ran while the tests ran. It cannot tell you the code is correct. It can tell you what no test ever touched. Tell Jest which files matter, and set a floor. Your `jest.config.js` should now look like this in full:

```js
/** @type {import('jest').Config} */
export default {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.ts$": [
      "@swc/jest",
      {
        jsc: { parser: { syntax: "typescript" }, target: "es2023" },
        module: { type: "es6" },
      },
    ],
  },
  silent: true,
  restoreMocks: true,
  collectCoverageFrom: ["src/routes/**/*.ts", "src/services/**/*.ts"],
  coverageThreshold: { global: { statements: 80, branches: 80, functions: 80, lines: 80 } },
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  globalSetup: "<rootDir>/tests/global-setup.js",
};
```

`collectCoverageFrom` limits the report to the routes and the services, the code this module is about. `coverageThreshold` makes Jest **fail** the run if any figure drops under 80%, so coverage cannot quietly slide. Add two more scripts:

```bash
npm pkg set scripts.test:coverage="node --env-file=.env.test --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand --coverage"
npm pkg set scripts.test:random="node --env-file=.env.test --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand --randomize"
```

```bash
npm run test:coverage
```

*You should see:*

```text
-----------|---------|----------|---------|---------|-------------------
File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------|---------|----------|---------|---------|-------------------
All files  |     100 |      100 |     100 |     100 |
 routes    |     100 |      100 |     100 |     100 |
  tasks.ts |     100 |      100 |     100 |     100 |
 services  |     100 |      100 |     100 |     100 |
  tasks.ts |     100 |      100 |     100 |     100 |
-----------|---------|----------|---------|---------|-------------------
Test Suites: 7 passed, 7 total
Tests:       38 passed, 38 total
```

Your table should show 80% or more everywhere. This suite exercises almost every line, so you will likely see 100%. **100% does not mean no bugs**: it means every line ran, not that every outcome was checked. Use the "Uncovered Line #s" column the other way round. When it lists lines, you have found something no test tries.

Jest also wrote an HTML report in `coverage/` that you can open in a browser. It is already in your `.gitignore`.

### 7.2 Random order

Tests must not depend on each other. `--randomize` shuffles the order of the tests (and files) on every run, so a hidden dependency shows up as a failure:

```bash
npm run test:random
```

*You should see:*

```text
Seed:        1289845393
Test Suites: 7 passed, 7 total
Tests:       38 passed, 38 total
```

Your seed differs. Run it three or four times: the seed changes and the suite stays green. If a run ever fails, rerun with the same order using `npm run test:random -- --seed=1289845393` (your number). Then **fix the dependency**. Do not stop using the flag. The usual cause is a test that relied on rows another test left behind, which is exactly what `resetDb` prevents.

### 7.3 What makes a test flaky

A **flaky** test passes and fails on the same code. Three causes cover most of them:

| Cause | Example here | Fix |
| --- | --- | --- |
| **Shared state** | Rows left over from another test, or another test file running at the same moment on the same SQLite file | `resetDb` before each test, `--runInBand` |
| **Order** | A test that only passes after another has created the data it needs | Each test builds its own data with a factory. `--randomize` finds the rest |
| **Time** | `createdAt` values equal to the millisecond, or a test that sleeps and hopes | Do not assert on exact times. Give the query a tie-breaker (your list adds `id` to the order). Never use a fixed `sleep` to wait for something |

You can see the first cause for yourself. Run `node --env-file=.env.test --experimental-vm-modules node_modules/jest/bin/jest.js` once without `--runInBand`. In the run for this page, one test failed: two test files were using the one database at the same time, and one saw the other's rows. Run it a few times and the failures move around. That is what a flaky suite feels like, and why the script says `--runInBand`.

### 7.4 Mocking in ES modules (read only)

You used `jest.spyOn` on an object, which works as it is. Replacing a whole **module** is different. In CommonJS, `jest.mock("./file")` is moved to the top of the file, before the imports run. In ES modules every `import` runs first, so that cannot work. Jest's ESM answer is `jest.unstable_mockModule`: register the fake first, then load the thing that uses it with a dynamic `import`:

```ts
import { jest } from "@jest/globals";

jest.unstable_mockModule("../src/services/tasks.ts", () => ({
  getTask: jest.fn(async () => ({ id: "1", title: "Fake" })),
}));
const { app } = await import("../src/app.ts");
```

This is for your information: you do not need it in this suite, because the real database is the better fake. It is the right tool when a module talks to something you cannot run in a test, such as an email service or someone else's paid API. Mock at that boundary, and nowhere else.

**Checkpoint 7**

- [ ] `npm run test:coverage` passes, and routes and services are at 80% or more.
- [ ] `npm run test:random` passed at least three times with different seeds.
- [ ] You can name three causes of flaky tests and say which one `resetDb` and `--runInBand` remove.

Commit:

```bash
git add .
git commit -m "test: add coverage thresholds and random-order script"
```

## 8. CI: GitHub Actions and the badge (25 min)

**Continuous integration** (CI) runs your checks on a clean machine every time you push, so "it works on my laptop" stops being the test. **GitHub Actions** is GitHub's CI. A workflow is a YAML file in `.github/workflows/`, and GitHub runs it for you.

> **Not run for this page** This section needs a real GitHub repository, so its steps are **untested** here. The commands and the workflow were checked locally another way: a fresh copy of the repo with no `.env`, running `npm ci`, `prisma generate`, `typecheck` and the tests, all passed. If something differs on GitHub, read the log on the failing step and use Troubleshooting.

### 8.1 Push what you have

Everything so far is on `main`, on your computer. Push it first, so the next change is a small pull request and not a copy of the whole module:

```bash
git push
```

### 8.2 The workflow

Start a branch, as in M01:

```bash
git switch -c feat/m09-ci
```

Create the folders and the workflow file:

```bash
mkdir -p .github/workflows
```

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npx prisma@7 generate
      - run: npm run typecheck
      - run: npm run test:coverage
```

- **`on`**: run on every pull request, and on every push to `main`.
- **`runs-on: ubuntu-latest`**: a fresh Linux machine each time, with nothing of yours on it. That is the point.
- **`actions/checkout`** gets your code. **`actions/setup-node`** installs the Node.js version written in your `.nvmrc` (24) and caches npm's downloads.
- **`npm ci`**: a clean install exactly as `package-lock.json` says. It is stricter than `npm install`, and the right one for CI.
- **`npx prisma@7 generate`**: your generated client is not committed (M07), so CI must build it. Skip this and every test fails to import it.
- **`npm run typecheck`**, then **`npm run test:coverage`**: types first, then the tests with the 80% floor. Both must pass. The tests find their database through `.env.test`, which you committed.

### 8.3 The badge

A badge on your `README.md` shows the state of the latest run. Add this line under the title, with your GitHub user name and repo name in place of `YOUR-USER` and `node-js-training`:

```markdown
[![CI](https://github.com/YOUR-USER/node-js-training/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR-USER/node-js-training/actions/workflows/ci.yml)
```

### 8.4 Open the pull request

```bash
git add .
git commit -m "ci: run typecheck and tests on GitHub Actions"
git push -u origin feat/m09-ci
```

Open the pull request on GitHub as you did in M01 (the **Compare & pull request** button). Scroll down to the checks, or open the **Actions** tab. Your run is listed as `CI`, first yellow (running), then green with a tick.

*You should see (on the PR page):*

```text
✓ All checks have passed
  test (pull_request) — Successful in 1m
```

A first run takes about a minute: the machine is fresh, so it installs everything. Wording and timing on your page may differ.

Once it is green, click **Merge pull request**, then bring your computer up to date, as in M01:

```bash
git switch main
git pull
```

The badge on your README now turns green. **To see CI do its job**, make a second branch, break one assertion in a test, push it and open a pull request: the check goes red. Then close that PR without merging, and delete the branch. A check you have seen fail is a check you can trust.

**Checkpoint 8**

- [ ] `.github/workflows/ci.yml` and the README badge are merged into `main`.
- [ ] The pull request showed a green `CI` check.
- [ ] You can say why the workflow runs `prisma generate` and `npm ci`, and what each protects you from.

## Check your understanding (5 min)

Answer each one in your head, then open it to compare.

**Why does this suite use a real SQLite file and not a mock database, and what breaks if the tables are not emptied between tests?**
A mock only proves your code calls the mock the way you wrote it. A real database also proves the migrations, the SQL and the rules inside the database, such as the unique title that gives a `409`. A mock cannot break such a rule, so it cannot test it.
Without the reset, tests share rows. A test then passes or fails because of what an earlier test left behind, and the result changes with the order the tests run in: a flaky suite. `--randomize` would show it at once.

**A test passes the first time you run it, before you wrote the code. What does that tell you, and what do you do?**
It tells you the test proves nothing, or is not checking what you think. The `404` test for `/complete` is the example: a status check alone passes, because a missing route also answers `404`. Make the test stricter (here, check the error message), and watch it fail first. Only then write the code.

**`--randomize` fails one run in ten. What is wrong, and what do you not do?**
Some test depends on state or order: it needs rows another test made, or it clashes with another test over the same data. Rerun with the same seed (`--seed=...`) to repeat the failure, find the test that assumes something it did not set up, and give it its own data with a factory. Do not drop `--randomize` or retry until it is green: that hides a real bug in the tests.

## Troubleshooting

**`node: .env.test: not found`**
The test script loads `.env.test`, and it does not exist, or you ran `npm test` from another folder. Create `.env.test` in the repo root as in section 3.2 and run the command from the root.

**`DATABASE_URL must point at a test database`**
You started Jest without the script, so the env file was not loaded. That is the safety catch from section 3.3 doing its job. Run `npm test` (or `npm run test:coverage`, `npm run test:random`), and never plain `npx jest`.

**`Test suite failed to run`, with a syntax error such as `Cannot use import statement` or `Unexpected token`**
Jest read a `.ts` file without running it through `@swc/jest`. Check `jest.config.js` is in the repo root, has `export default`, and the `transform` key matches `.ts` files (section 2.2). Check `@swc/jest` and `@swc/core` are installed. If the error is inside the generated Prisma client, see the fallback list in section 2.6.

**`Cannot find module '../src/generated/prisma/client.ts'`, or `@prisma/client did not initialize`**
The Prisma client has not been generated. Run `npx prisma@7 generate`. You need it after every fresh clone and every schema change, and CI runs it too (section 8).

**A test fails with rows from another test, or the count is not what you expect**
The tables were not emptied. Check `tests/setup.ts` calls `beforeEach(resetDb)` and `jest.config.js` lists it under `setupFilesAfterEnv`. A leftover `data/test.db` from a broken run is harmless: delete it and run `npm test` to rebuild it from the migrations.

**Tests pass alone but fail together, or fail only sometimes**
Shared state or order (section 7.3). Run `npm run test:random -- --seed=<number>` with the seed from the failing run to repeat it. Check that every test builds its own data and that the script still has `--runInBand`.

**`Jest: Coverage for statements (33%) does not meet "global" threshold (80%)`**
Either too few tests ran (you filtered with a file name, so only some code was exercised), or real code has no tests. Run the whole suite with `npm run test:coverage` and read the **Uncovered Line #s** column.

**`TS2307: Cannot find module` or errors about `describe`, `it` or `supertest` in `npm run typecheck`**
Check `@jest/globals` and `@types/supertest` are installed (section 2.1) and that every test file imports `describe`, `it` and `expect` from `@jest/globals`. Local imports keep their `.ts` ending, like the rest of your code.

**The test for `/complete` gets `404` even after you added the route**
Check the route is registered in `src/routes/tasks.ts` (and the file is saved), that the path is exactly `"/:id/complete"`, and that you wrote `PATCH`, not `PUT`. A missing route answers `404 Route ... not found`, which is how you can tell this apart from a missing task.

**The workflow fails on GitHub but passes on your computer**
Open the failing step in the Actions log. The common causes: `npx prisma@7 generate` is missing from the workflow, `.env.test` was not committed (check `git status`, and that it is not in `.gitignore`), `package-lock.json` is not committed so `npm ci` fails, or a test relied on something only your machine has. Section 8 was not run for this page, so it is untested.

**`better-sqlite3` fails to install on your machine or in CI**
See the same item in M07's troubleshooting: it downloads a ready-made binary and falls back to compiling, which needs build tools on your system. GitHub's `ubuntu-latest` has them.

**`npm pkg set` or a Windows command does not work**
Use Git Bash on Windows, as in the rest of the course. The Jest commands in this module all go through `node`, so they do not depend on your shell.

## You're done when

- [ ] Jest 30, Supertest 7 and `@swc/jest` run your tests in ESM mode, and `npm run typecheck` includes the `tests` folder.
- [ ] The tests use their own `data/test.db`, built by `prisma migrate deploy` in `globalSetup` and emptied before every test.
- [ ] You have at least 25 integration tests (about 38) that cover every endpoint, and every error path: `400` with `details`, `404`, `409`, malformed JSON, and no stack trace leaked.
- [ ] `npm run test:coverage` passes with 80% or more on the routes and services.
- [ ] `npm run test:random` passes, more than once.
- [ ] `PATCH /tasks/:id/complete` exists, and your history shows the failing test committed before the code.
- [ ] A GitHub pull request showed a green `CI` check, and the badge is on your README.
- [ ] Everything is committed and pushed to your repo.

**Hand-off to M10.** Keep `tests/`, `jest.config.js`, `.env.test` and `.github/workflows/ci.yml` as they are. They are your template: the capstone is a new API, and you copy this test setup into it. M08 is the next lesson, and its Zod validation replaces the hand-written checks. Because your tests check each error's field `path` and not its wording, they should keep passing, and if one fails after M08, that failure is the tests doing their job.

Previous: M08, Zod Validation & Type Inference (coming soon). Next: M10, Capstone Project (coming soon).
