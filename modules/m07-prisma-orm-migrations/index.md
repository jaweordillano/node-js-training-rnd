# M07 — Prisma ORM & Migrations

**Module M07 · Week 3 · Days 2-4 · about 5 hours**

Move the Task API from memory to a real database: translate your SQL schema into Prisma, evolve it with migrations (including one you edit by hand), and let the typed Prisma client do the work, with Prisma's errors flowing through the error handler you already have.

## Overview & time plan

**Builds on:** M05 and M06. You need the `node-js-training` repo with the Task API from M05 (`npm run bruno` passes), TypeScript set up, the `sqlite3` command line from M06, and Node.js 24. Everything you write here goes into that same repo, on `main`, with the add, commit and push steps you know. (The word "module" on this page means the course lessons, M01 to M10.)

Right now the Task API keeps its tasks in memory, so a restart loses them. In M06 you designed a relational schema and wrote the SQL by hand. **Prisma** is an **ORM** (object-relational mapper): you describe your tables once, in a schema file, and Prisma gives you migrations that change the database safely and a typed client that writes the SQL for you. Because you wrote the SQL yourself first, you know what it is doing.

You will:

- install **Prisma 7** with the SQLite driver adapter, and translate the M06 schema into Prisma;
- create **two migrations**, the second one **edited by hand** because Prisma cannot guess what your existing rows need;
- learn the Prisma client: queries, filters, pagination, nested writes, transactions and raw SQL;
- replace the in-memory store with a **service layer**, and give the list endpoint filtering, sorting and pagination;
- map Prisma's error codes into the **same error handler** from M05;
- write a **seed script** that rebuilds your data, and prove the database can be rebuilt from nothing.

1. What an ORM is, and Prisma 7 setup: 30 min
2. The Prisma schema: translating M06: 35 min
3. Migrations, including a hand-edited one: 50 min
4. The Prisma client: 40 min
5. The service layer: replacing the in-memory store: 55 min
6. Prisma errors in the existing error handler: 30 min
7. Seeding, reset and generated types: 30 min
8. Concepts: team migrations, PostgreSQL, MongoDB, Prisma 8: 20 min
9. Check your understanding: 10 min

> **Always Prisma 7.** The newest Prisma on npm is now version 8, a release candidate that does not work with this course's setup. Every Prisma command on this page is written as `npx prisma@7 ...`, and your `package.json` locks `prisma` and `@prisma/client` to `^7`. Prisma itself will print a box suggesting you update to version 8. **Ignore it.** If you ever see a Prisma version starting with `8`, stop and check section 1.

This page moves quickly. Type the code in sections 1 to 6 where you can. The seed script, the extended `validation.ts` (section 5) and the Bruno changes you may paste. Run each step, and compare with the *You should see* box. Your migration names contain a date and time, and your ids and timestamps are your own, so they will differ. Commands are written for Git Bash on Windows, and macOS and Linux Terminal. If anything else differs, check [Troubleshooting](#troubleshooting).

## 1. What an ORM is, and Prisma 7 setup (30 min)

### 1.1 What an ORM gives you, and what it costs

| Gives you | Costs you |
| --- | --- |
| **Types**: a query's result type is generated from your schema, so a typo in a field name is a compile error | It hides the SQL, so a slow or odd query is harder to understand. (You wrote SQL in M06, so you can read it.) |
| **Migrations**: schema changes are versioned files in your repo | One more tool and one more thing to keep in step with the database |
| **Safety**: values are always parameters, so SQL injection (M06) is not possible by accident | Some queries are awkward or slow to express in the ORM |

When a query is complicated (reports, heavy joins) or performance-critical, drop to raw SQL. Prisma keeps a door open for that, `$queryRaw`, which you meet in section 4.

### 1.2 Install

From the repo root:

```bash
npm install -D prisma@7
npm install @prisma/client@7 @prisma/adapter-better-sqlite3 dotenv
```

| Package | What it is |
| --- | --- |
| `prisma` (dev) | The command-line tool: migrations, `generate`, the schema checker |
| `@prisma/client` | The client your app uses to run queries. It is generated from your schema |
| `@prisma/adapter-better-sqlite3` | The **driver adapter**. Prisma 7 requires one, and this one talks to SQLite through `better-sqlite3` |
| `dotenv` | Loads `.env` for the Prisma tool |

`better-sqlite3` is a native library, so its install runs a script that downloads a ready-made binary for your system. That is the lifecycle-script idea from M03 again, and Prisma's own packages also have install scripts. Depending on your npm version you may see a warning that they are not yet approved. They work anyway.

Check what you got, and open `package.json`:

```bash
npx prisma@7 --version
```

*You should see:*

```text
prisma               : 7.10.0
@prisma/client       : 7.10.0
Operating System     : linux
Architecture         : x64
```

Your version may be a newer `7.x`, and the system lines are your own. In `package.json`, `prisma` (under `devDependencies`) and `@prisma/client` (under `dependencies`) both start with `^7`. That `^7` stops npm from ever moving them to version 8. If either says `8`, run `npm install -D prisma@7` and `npm install @prisma/client@7` again.

### 1.3 Initialise Prisma

```bash
npx prisma@7 init --datasource-provider sqlite --output ../src/generated/prisma --no-skills
```

The options say: use SQLite, put the generated client in `src/generated/prisma`, and **do not** install Prisma's optional "agent skills" (without `--no-skills`, `init` also creates folders for AI coding assistants that you do not need).

*You should see:*

```text
Initialized Prisma in your project

  prisma/
    schema.prisma
  prisma7.config.ts

warn You already have a .gitignore file. Don't forget to add .env in it to not commit any private information.

Next, set up your database:
  1. Configure your DATABASE_URL in prisma7.config.ts
  2. Run prisma db pull to introspect your database.

Then, define your models in prisma/schema.prisma and run prisma migrate dev to apply your schema.

Learn more: https://pris.ly/getting-started

```

The warning is fine: `.env` is already in your `.gitignore` from M01. Ignore the "Next" steps below it: this page tells you what to do.

It made three changes:

- **`prisma/schema.prisma`** is where you describe your data. You write it in section 2.
- **`prisma7.config.ts`** tells the Prisma tool where the schema is, where migrations go, and which database to use (it reads `DATABASE_URL`). On Prisma 7.10 the file is called `prisma7.config.ts`. On a slightly older 7.x it is `prisma.config.ts`. The tool finds either one by itself.
- **`.gitignore`** gained a line, `/src/generated/prisma`. The client Prisma generates is code, but it is rebuilt from your schema, so it is not committed. That means you run `prisma generate` yourself after installing and after every schema change, and in CI.

It also added a line to `.env`. Open `.env` and change that line, so the database goes in your `data/` folder (which is gitignored, with `*.db`):

```text
DATABASE_URL="file:./data/app.db"
```

(Keep your `PORT=4000` line. There may be explanatory comments above the `DATABASE_URL` line: leave them.)

**Checkpoint 1**

- [ ] `npx prisma@7 --version` shows `7.x`, and `package.json` has `^7` for `prisma` and `@prisma/client`.
- [ ] `prisma/schema.prisma` and `prisma7.config.ts` exist, and `.env` has `DATABASE_URL="file:./data/app.db"`.
- [ ] You can say why the generated client is not committed.

## 2. The Prisma schema: translating M06 (35 min)

### 2.1 From SQL tables to Prisma models

A Prisma **model** is a table. Each line in a model is a column, or a relationship. Here is how the pieces of your M06 schema translate:

| In M06 (SQL) | In Prisma |
| --- | --- |
| `CREATE TABLE tasks (...)` | `model Task { ... }` |
| `INTEGER PRIMARY KEY` | `String @id @default(uuid())`. This course uses UUID text ids, because the API from M05 already does. Prisma makes the id for you |
| `NOT NULL` | The field has no `?` |
| a nullable column | A `?` after the type: `description String?` |
| `DEFAULT 'todo'` | `@default(todo)` |
| `UNIQUE` | `@unique` |
| `CHECK (status IN (...))` | An `enum`. Note: on SQLite Prisma checks the value in the client, and does not add a database `CHECK` |
| `FOREIGN KEY ... ON DELETE SET NULL` | `@relation(fields: [userId], references: [id], onDelete: SetNull)` |
| `CREATE INDEX` | `@@index([status])` |
| the `task_tags` junction table | An **implicit many-to-many**: `tags Tag[]` on `Task` and `tasks Task[]` on `Tag`. Prisma creates the junction table itself, called `_TagToTask` |
| `updated_at` you maintained yourself | `@updatedAt`: Prisma sets it on every update |

The implicit many-to-many is the one real difference. In M06 you wrote `task_tags` yourself. Prisma will write an equivalent table with two columns, `A` and `B`, and you never touch it directly: you read and write `task.tags`.

### 2.2 The schema

Replace the contents of `prisma/schema.prisma`:

```text
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "sqlite"
}

enum TaskStatus {
  todo
  in_progress
  done
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  tasks     Task[]
}

model Task {
  id          String     @id @default(uuid())
  title       String
  description String?
  status      TaskStatus @default(todo)
  userId      String?
  user        User?      @relation(fields: [userId], references: [id], onDelete: SetNull)
  tags        Tag[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([status])
  @@index([userId])
}

model Tag {
  id    String @id @default(uuid())
  name  String @unique
  tasks Task[]
}
```

- **`generator client`** says to generate the client into `src/generated/prisma`.
- **`datasource db`** names the database type. In Prisma 7 the address is not here: it comes from `prisma7.config.ts` and `.env`.
- **`enum TaskStatus`** lists the allowed statuses. They are exactly the `todo`, `in_progress` and `done` of the API contract, so the generated type matches the one from M04.
- **`@relation(fields: [userId], references: [id], onDelete: SetNull)`** is the foreign key. `userId` is the column, and `user` is the related row you can read in code. `SetNull` is what you chose in M06: deleting a user keeps their tasks, unassigned.
- **`@@index`** lines add the indexes you added in M06 section 6.

Check the file, and generate the client from it:

```bash
npx prisma@7 validate
npx prisma@7 generate
```

*You should see:*

```text
Loaded Prisma config from prisma7.config.ts.

Prisma schema loaded from prisma/schema.prisma.
The schema at prisma/schema.prisma is valid 🚀
Loaded Prisma config from prisma7.config.ts.

Prisma schema loaded from prisma/schema.prisma.
┌─────────────────────────────────────────────────────────┐
│  Update available 7.10.0 -> 8.0.0-rc.22                 │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘

✔ Generated Prisma Client (7.10.0) to ./src/generated/prisma in 32ms

```

That box is the "update available" message. **Do not run those commands.** They would install Prisma 8, which does not work here. The box does not always appear. The last line is what matters. It wrote the client into `src/generated/prisma`, where TypeScript can import it.

`generate` reads the schema and writes TypeScript code: a `Task` type, a `TaskStatus` enum, and a client with methods like `prisma.task.findMany`. Whenever you change the schema, the generated code is out of date until you run `generate` again. Prisma 7 does not do it for you when you migrate.

**Checkpoint 2**

- [ ] `validate` says the schema is valid, and `generate` wrote the client to `src/generated/prisma`.
- [ ] You can say how `task_tags` from M06 appears in Prisma.
- [ ] You did not run the `@latest` commands from the update box.

## 3. Migrations, including a hand-edited one (50 min)

### 3.1 What a migration is

A **migration** is a SQL file that moves the database from one shape to the next. Prisma stores them in `prisma/migrations/`, one folder each, named with a date and a label. The database remembers which ones it has run, in a table called `_prisma_migrations`. To change the schema you change `schema.prisma`, and Prisma writes the SQL for the difference. This beats editing the database by hand, because the changes are in Git, in order, and anyone can rebuild the same database.

| Command | What it does | When |
| --- | --- | --- |
| `prisma migrate dev` | Compares the schema with your migrations, **writes a new migration** if they differ, applies it, and creates the database if it does not exist | Development, every time you change the schema |
| `prisma migrate deploy` | Applies the migrations that have not run yet. It never writes new ones and never asks | A test, CI or production database |
| `prisma migrate status` | Shows which migrations are applied | Any time |
| `prisma migrate reset` | **Drops the database**, runs every migration again, and runs the seed | Development only |
| `prisma db push` | Forces the database to match the schema with **no migration file** | Quick prototypes only: it leaves no history |

**Never edit a migration that has already been applied**, here or on anyone else's machine: the database remembers it ran, so a changed file no longer matches and Prisma will complain. To change something, add a new migration.

### 3.2 The first migration

```bash
npx prisma@7 migrate dev --name init
```

*You should see:*

```text
Loaded Prisma config from prisma7.config.ts.

Prisma schema loaded from prisma/schema.prisma.
Datasource "db": SQLite database "app.db" at "file:./data/app.db"

SQLite database app.db created at file:./data/app.db

Applying migration `20261012232021_init`

The following migration(s) have been created and applied from new schema changes:

prisma/migrations/
  └─ 20261012232021_init/
    └─ migration.sql

Your database is now in sync with your schema.

```

The number in front of `init` is the date and time you ran it.

Open the new `prisma/migrations/<date>_init/migration.sql`. This is the SQL Prisma wrote for you. Compare it with your M06 `schema.sql`: it is the same kind of thing.

```text
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TagToTask" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TagToTask_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TagToTask_B_fkey" FOREIGN KEY ("B") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_userId_idx" ON "Task"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_TagToTask_AB_unique" ON "_TagToTask"("A", "B");

-- CreateIndex
CREATE INDEX "_TagToTask_B_index" ON "_TagToTask"("B");
```

You can see your M06 work in it: the `CREATE TABLE`s, the foreign key with `ON DELETE SET NULL`, the unique indexes, and the junction table `_TagToTask` with its `CASCADE` rules. Notice what is **not** there: there is no `CHECK` for `status`. Check the new database with the SQLite shell from M06:

```bash
sqlite3 data/app.db ".tables"
```

*You should see:*

```text
Tag     Task     User     _TagToTask     _prisma_migrations
```

### 3.3 The client, and some existing data

Create `src/db.ts`. It makes the one Prisma client the whole app shares, connected through the driver adapter:

```ts
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./generated/prisma/client.ts";

// One client for the whole app. PrismaClient needs a driver adapter: here, better-sqlite3.
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./data/app.db",
});

export const prisma = new PrismaClient({ adapter });
```

Now put some rows in the database, so the next migration has something to deal with. Create `src/labs/old-data.ts`:

```ts
import { prisma } from "../db.ts";

// A few rows that exist before the second migration
await prisma.task.createMany({
  data: [
    { title: "Write the report", status: "done" },
    { title: "Review the schema", description: "Check the indexes" },
    { title: "Fix the login bug", status: "in_progress" },
  ],
});
console.log("tasks:", await prisma.task.count());
await prisma.$disconnect();
```

```bash
npx tsx --env-file-if-exists=.env src/labs/old-data.ts
```

*You should see:*

```text
tasks: 3
```

`--env-file-if-exists=.env` loads your `.env`, as in M03, so `DATABASE_URL` is set.

### 3.4 A second migration that Prisma cannot write alone

M05 had a rule: you cannot create two tasks whose titles differ only in capital letters. It was checked in code, which is not safe (two requests at the same moment could both pass). The database should guarantee it. SQLite's `UNIQUE` is case-sensitive, so the trick is a second column, `titleKey`, that holds the lower-case title, and is unique.

Add the column to the `Task` model in `prisma/schema.prisma`, on the line after `title`:

```text
  titleKey    String     @unique
```

It is **required** (no `?`), and your table already has 3 rows with no `titleKey`. Ask Prisma for the migration, but **do not apply it yet**. `--create-only` writes the file and stops, so you can read it:

```bash
npx prisma@7 migrate dev --create-only --name add_title_key
```

*You should see:*

```text
Loaded Prisma config from prisma7.config.ts.

Prisma schema loaded from prisma/schema.prisma.
Datasource "db": SQLite database "app.db" at "file:./data/app.db"



⚠️ We found changes that cannot be executed:

  • Step 0 Added the required column `titleKey` to the `Task` table without a default value. There are 3 rows in this table, it is not possible to execute this step.

Prisma Migrate created the following migration without applying it 20261012232023_add_title_key

You can now edit it and apply it by running prisma migrate dev.
```

Prisma noticed the problem: a new required column with no value for the 3 existing rows. It wrote the migration anyway, and left the fix to you. Open `prisma/migrations/<date>_add_title_key/migration.sql`:

```text
/*
  Warnings:

  - Added the required column `titleKey` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "titleKey" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("createdAt", "description", "id", "status", "title", "updatedAt", "userId") SELECT "createdAt", "description", "id", "status", "title", "updatedAt", "userId" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE UNIQUE INDEX "Task_titleKey_key" ON "Task"("titleKey");
CREATE INDEX "Task_status_idx" ON "Task"("status");
CREATE INDEX "Task_userId_idx" ON "Task"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
```

SQLite cannot add a required column to a table in place, so Prisma **redefines the table**: it creates `new_Task` with the new column, copies the rows across with `INSERT ... SELECT`, drops the old table and renames the new one. The copy is the problem: it lists every column *except* `titleKey`, so the new column would be empty, and `NOT NULL` would reject every row.

Fix it by hand. In the `INSERT INTO "new_Task"` line, add `"titleKey"` to the list of columns being filled, and fill it from the title with `lower("title")` in the `SELECT`. The whole line becomes:

```sql
INSERT INTO "new_Task" ("createdAt", "description", "id", "status", "title", "titleKey", "updatedAt", "userId") SELECT "createdAt", "description", "id", "status", "title", lower("title"), "updatedAt", "userId" FROM "Task";
```

That is a **backfill**: the existing rows get a sensible value. This is the general recipe for a required column on a table with data: add it, fill it from existing data, then enforce it. Now apply the migration (you can edit it freely because it has not run yet), and check:

```bash
npx prisma@7 migrate dev
npx prisma@7 migrate status
sqlite3 data/app.db ".headers on" ".mode column" "SELECT title, titleKey FROM Task;"
```

*You should see:*

```text
Loaded Prisma config from prisma7.config.ts.

Prisma schema loaded from prisma/schema.prisma.
Datasource "db": SQLite database "app.db" at "file:./data/app.db"

Applying migration `20261012232023_add_title_key`

The following migration(s) have been applied:

migrations/
  └─ 20261012232023_add_title_key/
    └─ migration.sql

Your database is now in sync with your schema.

Loaded Prisma config from prisma7.config.ts.

Prisma schema loaded from prisma/schema.prisma.
Datasource "db": SQLite database "app.db" at "file:./data/app.db"

2 migrations found in prisma/migrations

Database schema is up to date!
      title            titleKey
-----------------  -----------------
Write the report   write the report
Review the schema  review the schema
Fix the login bug  fix the login bug
```

Your three tasks survived, each with its `titleKey`. You now have two migrations, and one of them you edited.

### 3.5 Regenerate, and let the types tell you

The migration changed the database. The generated client still describes the old schema, so generate it again, and check the code:

```bash
npx prisma@7 generate
npm run typecheck
```

*You should see:*

```text
✔ Generated Prisma Client (7.10.0) to ./src/generated/prisma in 38ms

src/labs/old-data.ts(6,5): error TS2741: Property 'titleKey' is missing in type '{ title: string; status: "done"; }' but required in type 'TaskCreateManyInput'.
src/labs/old-data.ts(7,5): error TS2741: Property 'titleKey' is missing in type '{ title: string; description: string; }' but required in type 'TaskCreateManyInput'.
src/labs/old-data.ts(8,5): error TS2741: Property 'titleKey' is missing in type '{ title: string; status: "in_progress"; }' but required in type 'TaskCreateManyInput'.
```

(The first lines of `generate`'s output, and possibly the update box, are left out here.)

That is the typed client working: the schema now requires `titleKey`, so the old script no longer compiles. `old-data.ts` did its job, so delete it:

```bash
rm src/labs/old-data.ts
```

> **If a migration fails halfway.** If your hand-edited migration has a mistake, `migrate dev` stops with an error such as `P3018` and `NOT NULL constraint failed`. On SQLite the half-finished attempt can leave a leftover `new_Task` table behind. In development the quickest recovery is to fix the SQL file, delete the database file (`rm data/app.db`), and run `npx prisma@7 migrate dev` again: it rebuilds the database from all the migrations. **Never delete a database like that if the data matters.** On a real database you use `prisma migrate resolve` instead, which is outside this course.

**Checkpoint 3**

- [ ] `prisma/migrations/` has two folders, and `migrate status` says the schema is up to date.
- [ ] You edited the `INSERT ... SELECT` in the second migration, and the 3 tasks have a `titleKey`.
- [ ] You regenerated the client, saw the type error in `old-data.ts`, and deleted that file.
- [ ] You can say why you must not edit a migration after it has been applied.

```bash
git add .
git commit -m "feat: add prisma schema and migrations"
git push
```

## 4. The Prisma client (40 min)

You now have a typed client. Create `src/labs/prisma-tour.ts`. It walks through the operations you will use, one at a time. Read the comments:

```ts
import { prisma } from "../db.ts";
import type { Prisma } from "../generated/prisma/client.ts";

// create: returns the new row, with its generated id and timestamps.
// titleKey is required now, so you have to pass it. The service layer will do that for you.
const task = await prisma.task.create({
  data: { title: "Learn Prisma", titleKey: "learn prisma", description: "Read the docs" },
});
console.log("created:", task.title, task.status);

// nested write: create the task and connect-or-create its tags in one call
const tagged = await prisma.task.create({
  data: {
    title: "Tag me",
    titleKey: "tag me",
    tags: {
      connectOrCreate: ["learning", "prisma"].map((name) => ({ where: { name }, create: { name } })),
    },
  },
  include: { tags: true },
});
console.log("tags:", tagged.tags.map((tag) => tag.name).sort());

// findMany with where, orderBy, skip and take
const page = await prisma.task.findMany({
  where: { status: "todo", title: { contains: "learn" } },
  orderBy: { createdAt: "desc" },
  skip: 0,
  take: 10,
});
console.log("found:", page.length);

// select: only the fields you name come back. include: the task plus its relations.
const small = await prisma.task.findUnique({ where: { id: task.id }, select: { id: true, title: true } });
console.log("select:", small);

// update and count
await prisma.task.update({ where: { id: task.id }, data: { status: "done" } });
console.log("done tasks:", await prisma.task.count({ where: { status: "done" } }));

// $transaction: both changes happen, or neither does
const [removed] = await prisma.$transaction([
  prisma.task.deleteMany({ where: { title: { in: ["Learn Prisma", "Tag me"] } } }),
  prisma.tag.deleteMany({ where: { name: { in: ["learning", "prisma"] } } }),
]);
console.log("removed tasks:", removed.count);

// $queryRaw: plain SQL when you need it. The tagged template turns ${} into safe parameters.
const status = "todo";
const rows = await prisma.$queryRaw<{ n: bigint }[]>`SELECT COUNT(*) AS n FROM "Task" WHERE status = ${status}`;
console.log("raw count:", Number(rows[0]?.n));

// The type of a where clause is generated for you
const where: Prisma.TaskWhereInput = { OR: [{ status: "todo" }, { title: { contains: "x" } }] };
console.log("where:", JSON.stringify(where));
await prisma.$disconnect();
```

```bash
npx tsx --env-file-if-exists=.env src/labs/prisma-tour.ts
```

*You should see:*

```text
created: Learn Prisma todo
tags: [ 'learning', 'prisma' ]
found: 1
select: { id: '9b9d7a87-9e51-4c8d-bfa6-f7192f4fc5c9', title: 'Learn Prisma' }
done tasks: 2
removed tasks: 2
raw count: 1
where: {"OR":[{"status":"todo"},{"title":{"contains":"x"}}]}
```

The `id` is your own. `done tasks: 2` is "Write the report" from section 3 plus the one this script marked done. The script cleans up after itself, so you can run it again.

What each part shows:

| Code | What it does |
| --- | --- |
| `create` | Inserts a row and returns it, with the `id` and timestamps Prisma filled in |
| `tags: { connectOrCreate: [...] }` | A **nested write**: create the task, and for each tag name either connect the existing tag or create it, in one call |
| `findMany` with `where`, `orderBy`, `skip`, `take` | Filtering, sorting and pagination. `contains` is a `LIKE '%...%'`, and `skip`/`take` are `OFFSET`/`LIMIT` from M06. Other filters: `equals`, `in`, `gte`, `lt`, `AND`, `OR`, `NOT` |
| `select` | Return only the fields you name |
| `include` | Return the whole row **plus** its relations (used above to get the tags). Use `select` to be exact and `include` to add relations |
| `update`, `count`, `delete` | What they say. `upsert` updates a row, or creates it if it does not exist. `createMany` inserts many rows |
| `$transaction([...])` | Runs the operations as one transaction (M06): all happen, or none. There is also an interactive form, `$transaction(async (tx) => { ... })`, for when one step depends on the last |
| `$queryRaw` | Raw SQL. The **tagged template** (backticks) turns each `${}` into a parameter, so it is safe from injection. Never build the string by hand |
| `Prisma.TaskWhereInput` | A type generated from your schema, so a filter you write is checked |

Prisma can also show you the SQL it runs. Create `src/labs/query-log.ts`. It makes a second client with `log: ["query"]`:

```ts
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client.ts";

// A second client with query logging on, to see the SQL Prisma writes for you
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./data/app.db" });
const prisma = new PrismaClient({ adapter, log: ["query"] });

await prisma.task.findMany({ where: { status: "todo" }, select: { id: true, title: true }, take: 2 });
await prisma.$disconnect();
```

```bash
npx tsx --env-file-if-exists=.env src/labs/query-log.ts
```

*You should see:*

```text
prisma:query SELECT `main`.`Task`.`id`, `main`.`Task`.`title` FROM `main`.`Task` WHERE `main`.`Task`.`status` = ? ORDER BY `main`.`Task`.`id` ASC LIMIT ? OFFSET ?
```

The `?` marks are parameters: the value `'todo'` is sent separately, which is why Prisma is safe from SQL injection. This is the `SELECT ... WHERE ... LIMIT` you wrote by hand in M06.

**Checkpoint 4**

- [ ] The tour script prints the output above.
- [ ] You can say the difference between `select` and `include`.
- [ ] You saw the SQL behind a Prisma query, with `?` parameters.

## 5. The service layer: replacing the in-memory store (55 min)

The Task API's routes call `src/store/tasks.ts`, which keeps tasks in a `Map`. You will replace it with a **service**: a file that holds the data logic, built on Prisma. The routes stay thin, and they do not know where the data lives.

### 5.1 The service

Create `src/services/tasks.ts`:

```ts
import type { CreateTaskInput, Task, TaskStatus, UpdateTaskInput } from "../domain/task.ts";
import { prisma } from "../db.ts";
import type { Prisma } from "../generated/prisma/client.ts";

export type TaskView = Task & { tags: string[] };
export type TaskInput = CreateTaskInput & { tags?: string[] };
export type TaskChanges = UpdateTaskInput & { tags?: string[] };

export interface ListQuery {
  status?: TaskStatus;
  q?: string;
  sort: "createdAt" | "title" | "status";
  order: "asc" | "desc";
  page: number;
  pageSize: number;
}

export interface ListResult {
  data: TaskView[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

// The fields we send back. `satisfies` checks it against Prisma's own type, and keeps the exact shape.
const taskSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  tags: { select: { name: true } },
} satisfies Prisma.TaskSelect;

type TaskRow = Prisma.TaskGetPayload<{ select: typeof taskSelect }>;

// A database row becomes the Task type from M04, plus the tag names
function toView(row: TaskRow): TaskView {
  const { tags, description, ...rest } = row;
  return {
    ...rest,
    ...(description !== null && { description }),
    tags: tags.map((tag) => tag.name).sort(),
  };
}

const tagLinks = (names: string[]) => names.map((name) => ({ where: { name }, create: { name } }));

export async function listTasks(query: ListQuery): Promise<ListResult> {
  const where: Prisma.TaskWhereInput = {
    ...(query.status && { status: query.status }),
    ...(query.q && { title: { contains: query.q } }),
  };
  const [rows, total] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      orderBy: [{ [query.sort]: query.order }, { id: "asc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      select: taskSelect,
    }),
    prisma.task.count({ where }),
  ]);
  return {
    data: rows.map(toView),
    meta: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) },
  };
}

// findUniqueOrThrow throws Prisma error P2025 when there is no such task
export async function getTask(id: string): Promise<TaskView> {
  return toView(await prisma.task.findUniqueOrThrow({ where: { id }, select: taskSelect }));
}

export async function createTask(input: TaskInput): Promise<TaskView> {
  const { tags = [], ...fields } = input;
  const row = await prisma.task.create({
    // titleKey is the lower-case title. It is unique, so "Write docs" and "write DOCS" clash (P2002).
    data: { ...fields, titleKey: fields.title.toLowerCase(), tags: { connectOrCreate: tagLinks(tags) } },
    select: taskSelect,
  });
  return toView(row);
}

export async function updateTask(id: string, changes: TaskChanges): Promise<TaskView> {
  const { tags, ...fields } = changes;
  const row = await prisma.task.update({
    where: { id },
    data: {
      ...fields,
      ...(fields.title !== undefined && { titleKey: fields.title.toLowerCase() }),
      // when tags are sent they replace the old ones
      ...(tags && { tags: { set: [], connectOrCreate: tagLinks(tags) } }),
    },
    select: taskSelect,
  });
  return toView(row);
}

export async function deleteTask(id: string): Promise<void> {
  await prisma.task.delete({ where: { id } });
}
```

- **`taskSelect ... satisfies Prisma.TaskSelect`** picks the fields to return, and `satisfies` (M04) checks them against Prisma's own type while keeping the exact shape. **`Prisma.TaskGetPayload<{ select: typeof taskSelect }>`** is the type of a row with exactly those fields. The result type follows the `select`, so a field you leave out is not in the type.
- **`toView`** turns a row into the `Task` type from M04, plus `tags` as a list of names. A missing description stays out of the JSON, as in M05.
- **`createTask`** fills `titleKey` with the lower-case title, so a duplicate title (in any capitals) breaks the unique rule. The database refuses it, and you will map that error in section 6.
- **`findUniqueOrThrow`**, **`update`** and **`delete`** throw a Prisma error when the row does not exist. There is no `if (!task)` check left: the not-found error goes through the error handler.
- **`listTasks`** filters, sorts and pages, and returns the rows with a `total` from a `count`, both in one `$transaction`. A second sort on `id` keeps the order stable when two rows tie.

### 5.2 Validation, routes and the server

The list endpoint now takes a query string, and task bodies may carry `tags`. **Replace** `src/validation.ts` (your M05 file, extended with `tags` and a `validateListQuery`):

```ts
import { taskStatuses } from "./domain/task.ts";
import type { TaskStatus } from "./domain/task.ts";
import { ValidationError } from "./errors.ts";
import type { ErrorDetail } from "./errors.ts";
import type { ListQuery, TaskChanges, TaskInput } from "./services/tasks.ts";

const isStatus = (value: unknown): value is TaskStatus =>
  typeof value === "string" && (taskStatuses as readonly string[]).includes(value);

// Each check adds a problem to the list. At the end, one error carries all of them.
function checkFields(body: Record<string, unknown>, details: ErrorDetail[]): void {
  if ("title" in body) {
    if (typeof body.title !== "string" || body.title.trim() === "") {
      details.push({ path: "title", message: "Must be a non-empty string" });
    } else if (body.title.length > 100) {
      details.push({ path: "title", message: "Must be 100 characters or fewer" });
    }
  }
  if ("description" in body && typeof body.description !== "string") {
    details.push({ path: "description", message: "Must be a string" });
  }
  if ("tags" in body) {
    const ok =
      Array.isArray(body.tags) &&
      body.tags.every((tag) => typeof tag === "string" && tag.trim() !== "" && tag.length <= 30);
    if (!ok) details.push({ path: "tags", message: "Must be a list of non-empty strings, 30 characters or fewer" });
  }
  if ("status" in body && !isStatus(body.status)) {
    details.push({ path: "status", message: `Must be one of: ${taskStatuses.join(", ")}` });
  }
}

// req.body is undefined when no body was sent, so treat the input as unknown
function asObject(body: unknown): Record<string, unknown> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new ValidationError([{ path: "body", message: "Must be a JSON object" }]);
  }
  return body as Record<string, unknown>;
}

export function validateCreateTask(body: unknown): TaskInput {
  const data = asObject(body);
  const details: ErrorDetail[] = [];
  if (!("title" in data)) details.push({ path: "title", message: "Required" });
  checkFields(data, details);
  if (details.length > 0) throw new ValidationError(details);

  const input: TaskInput = {
    title: (data.title as string).trim(),
    status: isStatus(data.status) ? data.status : "todo",
  };
  if (typeof data.description === "string") input.description = data.description;
  if (Array.isArray(data.tags)) input.tags = cleanTags(data.tags);
  return input;
}

export function validateUpdateTask(body: unknown): TaskChanges {
  const data = asObject(body);
  const details: ErrorDetail[] = [];
  checkFields(data, details);
  const hasAny = ["title", "description", "status", "tags"].some((key) => key in data);
  if (!hasAny && details.length === 0) {
    details.push({ path: "body", message: "Send at least one of: title, description, status, tags" });
  }
  if (details.length > 0) throw new ValidationError(details);

  const changes: TaskChanges = {};
  if (typeof data.title === "string") changes.title = data.title.trim();
  if (typeof data.description === "string") changes.description = data.description;
  if (isStatus(data.status)) changes.status = data.status;
  if (Array.isArray(data.tags)) changes.tags = cleanTags(data.tags);
  return changes;
}

// Trim every tag name and drop repeats
function cleanTags(tags: string[]): string[] {
  return [...new Set(tags.map((tag) => tag.trim()))];
}

// Query-string values arrive as text, so check each one and turn the numbers into numbers
export function validateListQuery(query: Record<string, unknown>): ListQuery {
  const details: ErrorDetail[] = [];
  const text = (key: string): string | undefined => (typeof query[key] === "string" ? query[key] : undefined);

  const status = text("status");
  if (status !== undefined && !isStatus(status)) {
    details.push({ path: "status", message: `Must be one of: ${taskStatuses.join(", ")}` });
  }

  const sort = text("sort") ?? "createdAt";
  if (!["createdAt", "title", "status"].includes(sort)) {
    details.push({ path: "sort", message: "Must be one of: createdAt, title, status" });
  }

  const order = text("order") ?? "desc";
  if (order !== "asc" && order !== "desc") details.push({ path: "order", message: "Must be asc or desc" });

  const whole = (key: string, fallback: number, max: number): number => {
    const raw = text(key);
    if (raw === undefined) return fallback;
    const value = Number(raw);
    if (!Number.isInteger(value) || value < 1 || value > max) {
      details.push({ path: key, message: `Must be a whole number from 1 to ${max}` });
    }
    return value;
  };
  const page = whole("page", 1, 1_000_000);
  const pageSize = whole("pageSize", 20, 100);

  if (details.length > 0) throw new ValidationError(details);
  return {
    ...(status !== undefined && isStatus(status) && { status }),
    ...(text("q") && { q: text("q") }),
    sort: sort as ListQuery["sort"],
    order: order as ListQuery["order"],
    page,
    pageSize,
  };
}
```

**Replace** `src/routes/tasks.ts`. Each handler is now one line, because validation and data logic have moved out:

```ts
import { Router } from "express";
import type { Request, Response } from "express";
import * as tasks from "../services/tasks.ts";
import type { ListResult, TaskView } from "../services/tasks.ts";
import { validateCreateTask, validateListQuery, validateUpdateTask } from "../validation.ts";

export const tasksRouter = Router();

// Request<Params, ResBody, ReqBody, Query>
tasksRouter.get("/", async (req: Request<{}, ListResult, unknown, Record<string, unknown>>, res: Response<ListResult>) => {
  res.json(await tasks.listTasks(validateListQuery(req.query)));
});

tasksRouter.post("/", async (req: Request<{}, TaskView, unknown>, res: Response<TaskView>) => {
  res.status(201).json(await tasks.createTask(validateCreateTask(req.body)));
});

tasksRouter.get("/:id", async (req: Request<{ id: string }>, res: Response<TaskView>) => {
  res.json(await tasks.getTask(req.params.id));
});

tasksRouter.patch("/:id", async (req: Request<{ id: string }, TaskView, unknown>, res: Response<TaskView>) => {
  res.json(await tasks.updateTask(req.params.id, validateUpdateTask(req.body)));
});

tasksRouter.delete("/:id", async (req: Request<{ id: string }>, res: Response) => {
  await tasks.deleteTask(req.params.id);
  res.sendStatus(204);
});
```

**Replace** `src/server.ts`. It now also closes the database connection on shutdown:

```ts
import { app } from "./app.ts";
import { prisma } from "./db.ts";

const PORT = Number(process.env.PORT ?? 3000);

const server = app.listen(PORT, () => {
  console.log(`Task API listening on http://localhost:${PORT}`);
});

// Stop cleanly: finish the requests in progress, then exit
function shutdown(signal: string): void {
  console.log(`${signal} received, closing`);
  // close the server first, then the database connection
  server.close(() => {
    void prisma.$disconnect().then(() => process.exit(0));
  });
  // If a connection will not close, give up after 10 seconds
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
```

The in-memory store has no users left. Delete it, and check the code:

```bash
rm src/store/tasks.ts
npm run typecheck
```

`npm run typecheck` should print no errors. Now start the server (`npm run dev`), and in a second terminal try the new list endpoint. It takes `status`, `q` (a title search), `sort` (`createdAt`, `title` or `status`), `order` (`asc` or `desc`), `page` and `pageSize`:

```bash
curl -s -w "\nHTTP %{http_code}\n" "localhost:4000/api/v1/tasks?pageSize=2&sort=title&order=asc"
curl -s -w "\nHTTP %{http_code}\n" "localhost:4000/api/v1/tasks?status=done&q=report"
```

*You should see:*

```text
{"data":[{"id":"502cd1ab-d796-40af-b2ae-c380305320a6","title":"Fix the login bug","status":"in_progress","createdAt":"2026-10-12T23:20:22.181Z","updatedAt":"2026-10-12T23:20:22.181Z","tags":[]},{"id":"3159d524-6553-4227-8dbc-f493f9c2efe8","title":"Review the schema","status":"todo","createdAt":"2026-10-12T23:20:22.181Z","updatedAt":"2026-10-12T23:20:22.181Z","description":"Check the indexes","tags":[]}],"meta":{"page":1,"pageSize":2,"total":3,"totalPages":2}}
HTTP 200
{"data":[{"id":"ceb79f29-cd03-4a30-8994-959c701fe9ea","title":"Write the report","status":"done","createdAt":"2026-10-12T23:20:22.181Z","updatedAt":"2026-10-12T23:20:22.181Z","tags":[]}],"meta":{"page":1,"pageSize":20,"total":1,"totalPages":1}}
HTTP 200
```

The list is now an object with `data` (the page of tasks) and `meta` (the counts). It used to be a plain array. Your ids and timestamps differ, and your list holds the 3 tasks from section 3 plus any you created. `pageSize` is `20` unless you ask for another number.

Create a task with tags, and read it back by its `id`:

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST localhost:4000/api/v1/tasks -H "Content-Type: application/json" -d '{"title":"Write the tests","tags":["testing","backend"]}'
```

*You should see:*

```text
{"id":"590a8c9a-b323-4479-9131-a4680c898a80","title":"Write the tests","status":"todo","createdAt":"2026-10-12T23:21:12.348Z","updatedAt":"2026-10-12T23:21:12.348Z","tags":["backend","testing"]}
HTTP 201
```

The tags came back as a sorted list of names. Your `id` and timestamps are your own, and the task is saved in your database file now: stop and start the server, and it is still there.

Two things are not finished yet. A request for a task that does not exist, and a duplicate title, make Prisma throw errors your error handler has never heard of. You fix that in section 6, and run the Bruno collection there.

**Checkpoint 5**

- [ ] `npm run typecheck` is clean, and `src/store/tasks.ts` is gone.
- [ ] The list endpoint returns `{ data, meta }`, and filters by `status` and `q`.
- [ ] A task with `tags` shows them in the response, and it is still there after a server restart.

```bash
git add .
git commit -m "feat: replace the in-memory store with a prisma service layer"
git push
```

## 6. Prisma errors in the existing error handler (30 min)

Ask for a task that does not exist:

```bash
curl -s -w "\nHTTP %{http_code}\n" localhost:4000/api/v1/tasks/does-not-exist
```

*You should see:*

```text
{"error":{"code":"INTERNAL_ERROR","message":"Internal server error","requestId":"7b21686b-04cf-414f-b33e-27005cb0d429"}}
HTTP 500
```

A `500`, and in the **server** terminal a long Prisma error about `findUniqueOrThrow`. Your handler treated it as a bug (a programmer error), because it does not know Prisma's errors yet. It should be a `404`.

When the database refuses something, Prisma throws a `PrismaClientKnownRequestError` with a **code**. These three are the ones this API meets:

| Code | Meaning | Example here | Becomes |
| --- | --- | --- | --- |
| `P2002` | A unique constraint failed | A second task with the same `titleKey` | `409` `CONFLICT` |
| `P2025` | The record to read, change or delete does not exist | Asking for, updating or deleting a task id that is not there | `404` `NOT_FOUND` |
| `P2003` | A foreign key points at nothing | A task whose `userId` is a user that does not exist | `409` `CONFLICT` |

See the three errors for yourself. Create `src/labs/prisma-errors.ts`:

```ts
import { prisma } from "../db.ts";
import { Prisma } from "../generated/prisma/client.ts";

async function show(label: string, action: () => Promise<unknown>) {
  try {
    await action();
    console.log(label, "-> no error");
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.log(label, "->", error.code, JSON.stringify(error.meta));
    } else {
      throw error;
    }
  }
}

// P2002: a unique constraint failed (the title key already exists)
await show("duplicate title", () =>
  prisma.task.create({ data: { title: "Write the report", titleKey: "write the report" } }),
);

// P2025: the record you asked to change does not exist
await show("update missing", () => prisma.task.update({ where: { id: "nope" }, data: { title: "x" } }));

// P2003: a foreign key points at nothing
await show("bad owner", () => prisma.task.create({ data: { title: "Orphan", titleKey: "orphan", userId: "nope" } }));

await prisma.$disconnect();
```

```bash
npx tsx --env-file-if-exists=.env src/labs/prisma-errors.ts
```

*You should see:*

```text
duplicate title -> P2002 {"driverAdapterError":{"name":"DriverAdapterError","cause":{"originalCode":"SQLITE_CONSTRAINT_UNIQUE","originalMessage":"UNIQUE constraint failed: Task.titleKey","kind":"UniqueConstraintViolation","constraint":{"fields":["titleKey"]},"table":"Task"}},"modelName":"Task"}
update missing -> P2025 {"modelName":"Task","operation":"an update"}
bad owner -> P2003 {"modelName":"Task","driverAdapterError":{"name":"DriverAdapterError","cause":{"originalCode":"SQLITE_CONSTRAINT_FOREIGNKEY","originalMessage":"FOREIGN KEY constraint failed","kind":"ForeignKeyConstraintViolation","constraint":{"foreignKey":{}}}}}
```

Each error has a `code` and a `meta` with details. The first one needs a task called "Write the report" to exist, as in section 3.

These are **operational errors**, in the sense of M05: they can happen in a correct program, and you know what to tell the client. So they belong in the **same central error handler**, not in a new one. The file `src/middleware/errors.ts` from M05 changes by one function and a few lines. **Replace** it:

```ts
import type { ErrorRequestHandler, RequestHandler } from "express";
import { AppError, ConflictError, NotFoundError } from "../errors.ts";
import { Prisma } from "../generated/prisma/client.ts";

// Runs only when no route matched
export const notFound: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
};

// Turn the Prisma error codes we expect into the same AppError classes as before
function fromPrismaError(error: Prisma.PrismaClientKnownRequestError): AppError | undefined {
  switch (error.code) {
    case "P2002": // a unique constraint failed
      return new ConflictError("A record with this value already exists");
    case "P2025": // the record to read, change or delete was not found
      return new NotFoundError("The requested record was not found");
    case "P2003": // a foreign key points at nothing
      return new ConflictError("This record refers to another record that does not exist");
    default:
      return undefined;
  }
}

// express.json() reports a body that is not valid JSON with this shape
function isBodyParseError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "type" in error && error.type === "entity.parse.failed";
}

// Four arguments: this is how Express knows it is the error handler
export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, next) => {
  if (res.headersSent) return next(error);

  let status = 500;
  let code = "INTERNAL_ERROR";
  let message = "Internal server error"; // never leak the real message of a bug
  let details;

  const appError =
    error instanceof AppError
      ? error
      : error instanceof Prisma.PrismaClientKnownRequestError
        ? fromPrismaError(error)
        : undefined;

  if (appError) {
    ({ status, code, message, details } = appError);
  } else if (isBodyParseError(error)) {
    status = 400;
    code = "BAD_REQUEST";
    message = "Request body is not valid JSON";
  } else {
    console.error(error); // a programmer error: log it, do not send it
  }

  res.status(status).json({
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      requestId: res.locals.requestId,
    },
  });
};
```

- **`fromPrismaError`** is a `switch` on the code. It returns the same `ConflictError` and `NotFoundError` classes you wrote in M05, so the answer has the same envelope as every other error.
- In `errorHandler`, an `AppError` is used as before, a `PrismaClientKnownRequestError` is first turned into an `AppError`, and anything else is still a bug: a generic `500`, with the real error logged.
- An unknown Prisma code returns `undefined`, so it falls through to the `500`.

Save, and ask again for the missing task, and for a duplicate title:

```bash
curl -s -w "\nHTTP %{http_code}\n" localhost:4000/api/v1/tasks/does-not-exist
curl -s -w "\nHTTP %{http_code}\n" -X POST localhost:4000/api/v1/tasks -H "Content-Type: application/json" -d '{"title":"WRITE THE TESTS"}'
```

*You should see:*

```text
{"error":{"code":"NOT_FOUND","message":"The requested record was not found","requestId":"00b92ab9-e8cf-4d35-8bc9-8d815a1c1977"}}
HTTP 404
{"error":{"code":"CONFLICT","message":"A record with this value already exists","requestId":"a12c35b2-0da8-46a7-a4d0-cd5a1c0eafd8"}}
HTTP 409
```

The missing task is a `404` now, and the duplicate (the title "Write the tests" in capitals, which you created in section 5) is a `409`.

`P2025` you just saw. `P2003` needs a foreign key to break, and the API has no route that sets `userId`, so add a temporary route to `src/app.ts` **above** `app.use(notFound);`, and import `prisma` at the top (`import { prisma } from "./db.ts";`):

```ts
app.get("/api/v1/bad-owner", async () => {
  await prisma.task.create({ data: { title: "Orphan", titleKey: "orphan", userId: "nope" } });
});
```

```bash
curl -s -w "\nHTTP %{http_code}\n" localhost:4000/api/v1/bad-owner
```

*You should see:*

```text
{"error":{"code":"CONFLICT","message":"This record refers to another record that does not exist","requestId":"ca3b5771-f462-4a5b-872a-402797e24cab"}}
HTTP 409
```

Delete the temporary route and the `prisma` import again.

### 6.1 Run the Bruno collection

Because the list is now `{ data, meta }`, two requests from M05 need a one-line change each. Replace `bruno/03-list-tasks.bru`:

```text
meta {
  name: List tasks
  type: http
  seq: 3
}

get {
  url: {{baseUrl}}/tasks
  body: none
  auth: none
}

assert {
  res.status: eq 200
  res.body.data: isArray
}

tests {
  test("the new task is in the list", function () {
    expect(res.body.data.some((task) => task.id === bru.getVar("taskId"))).to.equal(true);
  });
}
```

And `bruno/06-filter-by-status.bru`:

```text
meta {
  name: Filter by status
  type: http
  seq: 6
}

get {
  url: {{baseUrl}}/tasks?status=in_progress
  body: none
  auth: none
}

assert {
  res.status: eq 200
  res.body.data: isArray
}
```

Now every error path is handled, so run the whole collection against v2 (the server must be running):

```bash
npm run bruno
```

*You should see:*

```text
> js-training@1.0.0 bruno
> cd bruno && bru run --env local

01-health (200 OK) - 12 ms
...
📊 Execution Summary
┌───────────────┬────────────────┐
│ Metric        │     Result     │
├───────────────┼────────────────┤
│ Status        │     ✓ PASS     │
├───────────────┼────────────────┤
│ Requests      │ 15 (15 Passed) │
├───────────────┼────────────────┤
│ Tests         │      1/1       │
├───────────────┼────────────────┤
│ Assertions    │     35/35      │
├───────────────┼────────────────┤
│ Duration (ms) │      374       │
└───────────────┴────────────────┘
```

All 15 requests and 35 assertions pass against the database-backed API, including the duplicate-title conflict, the validation errors and the 404s. Only the two list assertions changed.

**Checkpoint 6**

- [ ] You saw `P2002`, `P2025` and `P2003` from the script.
- [ ] A duplicate title returns `409`, a missing task returns `404`, and the bad owner returns `409`, all in the usual envelope.
- [ ] `npm run bruno` passes: 15 requests and 35 assertions.
- [ ] You changed the existing error handler, and did not add a second one.
- [ ] You can say why `P2025` replaced the old `if (!task)` checks.

```bash
git add .
git commit -m "feat: map prisma errors into the central error handler"
git push
```

## 7. Seeding, reset and generated types (30 min)

### 7.1 A seed script

A **seed** script fills the database with starting data, so you can always rebuild the same one. Create `prisma/seed.ts`. It deletes everything first, so running it twice gives the same result. It is repetitive, so you may paste it:

```ts
import { prisma } from "../src/db.ts";
import type { TaskStatus } from "../src/generated/prisma/client.ts";

// Start from empty, so the seed gives the same database every time
await prisma.task.deleteMany();
await prisma.tag.deleteMany();
await prisma.user.deleteMany();

await prisma.user.createMany({
  data: [
    { email: "ana@example.com", name: "Ana" },
    { email: "ben@example.com", name: "Ben" },
    { email: "cara@example.com", name: "Cara" },
  ],
});

const tasks: { title: string; status: TaskStatus; owner?: string; tags: string[] }[] = [
  { title: "Set up the project", status: "done", owner: "ana@example.com", tags: ["backend"] },
  { title: "Design the schema", status: "done", owner: "ana@example.com", tags: ["backend", "feature"] },
  { title: "Build the login page", status: "in_progress", owner: "cara@example.com", tags: ["frontend", "feature"] },
  { title: "Fix the login redirect", status: "todo", owner: "cara@example.com", tags: ["bug", "frontend"] },
  { title: "Add the task list endpoint", status: "in_progress", owner: "ben@example.com", tags: ["backend"] },
  { title: "Write the API docs", status: "todo", owner: "ana@example.com", tags: ["docs"] },
  { title: "Fix the date bug", status: "todo", tags: ["bug"] },
  { title: "Plan the next sprint", status: "todo", tags: [] },
];

for (const task of tasks) {
  await prisma.task.create({
    data: {
      title: task.title,
      titleKey: task.title.toLowerCase(),
      status: task.status,
      ...(task.owner && { user: { connect: { email: task.owner } } }),
      tags: { connectOrCreate: task.tags.map((name) => ({ where: { name }, create: { name } })) },
    },
  });
}

console.log(
  `Seeded ${await prisma.user.count()} users, ${await prisma.task.count()} tasks, ${await prisma.tag.count()} tags`,
);
await prisma.$disconnect();
```

Tell Prisma about it, so `migrate reset` can run it. In `prisma7.config.ts`, add a `seed` line under `migrations`:

```ts
// This file was generated by Prisma, and assumes you have installed the following:
// npm install --save-dev prisma dotenv
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx --env-file-if-exists=.env prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

Add scripts for the four jobs you will repeat:

```bash
npm pkg set scripts.db:generate="prisma generate"
npm pkg set scripts.db:migrate="prisma migrate dev"
npm pkg set scripts.db:seed="tsx --env-file-if-exists=.env prisma/seed.ts"
npm pkg set scripts.db:reset="prisma migrate reset --force"
```

(Inside an npm script, `prisma` means the copy installed in your project, which is version 7. The `@7` matters for commands you type in the terminal, where `npx` might otherwise fetch a different version.)

```bash
npm run db:seed
```

*You should see:*

```text
> js-training@1.0.0 db:seed
> tsx --env-file-if-exists=.env prisma/seed.ts

Seeded 3 users, 8 tasks, 5 tags
```

The Prisma tool can run the same script through the config you just edited:

```bash
npx prisma@7 db seed
```

*You should see:*

```text
Loaded Prisma config from prisma7.config.ts.

Running seed command `tsx --env-file-if-exists=.env prisma/seed.ts` ...
Seeded 3 users, 8 tasks, 5 tags

🌱  The seed command has been executed.
```

### 7.2 Rebuild from nothing

The promise of migrations is: with only your migration files and a seed script, anyone can build the database from scratch. `npm run db:reset` does exactly this to your development database: it drops everything, applies every migration and runs the seed. It destroys the data in that database on purpose, which is why it is development-only. (This command was not run for this page, so its output is not shown. Run it and read what it prints: each migration applied, then the seed.)

You can prove the same thing safely without touching your data, on a second database file. `migrate deploy` is the command for a fresh database: it only applies existing migrations. Set `DATABASE_URL` for just these two commands (this form works in Git Bash, macOS and Linux):

```bash
DATABASE_URL="file:./data/fresh.db" npx prisma@7 migrate deploy
DATABASE_URL="file:./data/fresh.db" npm run db:seed
sqlite3 data/fresh.db ".tables" "SELECT COUNT(*) FROM Task;"
```

*You should see:*

```text
Loaded Prisma config from prisma7.config.ts.

Prisma schema loaded from prisma/schema.prisma.
Datasource "db": SQLite database "fresh.db" at "file:./data/fresh.db"

SQLite database fresh.db created at file:./data/fresh.db

2 migrations found in prisma/migrations

Applying migration `20261012232021_init`
Applying migration `20261012232023_add_title_key`

The following migration(s) have been applied:

migrations/
  └─ 20261012232021_init/
    └─ migration.sql
  └─ 20261012232023_add_title_key/
    └─ migration.sql

All migrations have been successfully applied.

> js-training@1.0.0 db:seed
> tsx --env-file-if-exists=.env prisma/seed.ts

Seeded 3 users, 8 tasks, 5 tags
Tag     Task     User     _TagToTask     _prisma_migrations
8
```

A new database file, built only from your two migrations, with the seed data in it. Remove it:

```bash
rm data/fresh.db
```

Now run `npm run bruno` against your seeded database once more (the server must be running). It passes again, because the collection cleans up the tasks it creates.

### 7.3 Types that come from the schema

You have been using them already: `Prisma.TaskWhereInput` in the tour, and `Prisma.TaskSelect` and `Prisma.TaskGetPayload` in the service. They are generated from `schema.prisma`, so they change when the schema changes, and the compiler tells you everywhere that needs updating (you saw that in section 3.5). Others you will meet: `Prisma.TaskCreateInput` (the data to create a task), `Prisma.TaskUpdateInput`, and the model type `Task` itself, which you can import from `src/generated/prisma/client.ts`. This course keeps its own `Task` type from M04 for the API, and maps to it in `toView`.

**Prisma Studio** is a graphical way to look at your data. Open it with `npx prisma@7 studio`, and it opens in your browser. (Not run for this page, because it needs a browser.) Press `Ctrl+C` in the terminal to stop it.

**Checkpoint 7**

- [ ] `npm run db:seed` prints `Seeded 3 users, 8 tasks, 5 tags`.
- [ ] The `fresh.db` rebuild worked: two migrations applied, then 8 tasks.
- [ ] `npm run bruno` is still green against the seeded database.
- [ ] You can say the difference between `migrate dev` and `migrate deploy`.

```bash
git add .
git commit -m "feat: add database seed and reset scripts"
git push
```

## 8. Concepts: team migrations, PostgreSQL, MongoDB, Prisma 8 (20 min)

Nothing to build here: this section is the shape of the answers to questions you will be asked.

**Migrations in a team.** Two people each change the schema on their own branch, so each makes a new migration. When the branches meet, the migration folders sit side by side, and their order (it comes from the date in the name) may not match the order the changes make sense in, or both may change the same table. Prisma will tell you the database and the migration history have drifted. The way out is to merge the schema file first (the real source of truth), delete **your** unmerged migration, and create it again with `migrate dev` on top of the merged history. You never delete or edit a migration that has been merged and applied elsewhere. In CI and in production you only ever run `migrate deploy`, and you run `prisma generate` (the generated client is not in Git).

**PostgreSQL.** The change from SQLite is small, and it is the point of an ORM: you set `provider = "postgresql"` in the datasource, use `@prisma/adapter-pg` in place of the better-sqlite3 adapter, and your queries do not change. What does change: a real server (a connection address with a user and a password), **connection pooling** (many app instances share a limited number of connections, so you use a pooler), and richer types (real `enum`s checked by the database, `Json`, arrays, `Decimal`). Migrations are regenerated for the new database, because the SQL is different. M06 and this module are SQLite only, by design.

**MongoDB.** A **document** database: it stores JSON-like documents in collections, with no tables, no fixed columns and no joins. Related data is often **embedded** inside one document (a task with its tags inside it) instead of linked through foreign keys. It is flexible when data is a self-contained document, and awkward when you need many relationships and consistency across records. Relational (M06) fits the Task API's users, tasks and tags well. Prisma supports MongoDB, but not in this course.

**Prisma 8.** A new major version, still a release candidate when this was written. It is not compatible with this course's setup: its command-line tool does not read the schema the way version 7 does, and its SQLite support is experimental. That is why everything here is pinned to `@7`. The Prisma documentation now defaults to version 8, so when you look something up, make sure the page is the version 7 one (the address contains `/v7/`).

## Check your understanding (10 min)

Answer each one in your head, then open it to compare.

**What is the difference between `migrate dev` and `migrate deploy`?**
`migrate dev` is for development: it compares your schema with the migrations, writes a new migration file if they differ, applies it, and may reset or ask questions. `migrate deploy` only applies migrations that already exist and have not run, never creates one, and never asks. It is what a test database, CI or production uses, so the same files give the same database everywhere.

**Why did the second migration need a hand edit, and what did you change?**
It added a required column (`titleKey`) to a table that already had rows. Prisma's SQL copied the old columns across and left the new one empty, so `NOT NULL` would reject the rows. You changed the `INSERT ... SELECT` to fill the new column from existing data with `lower("title")`. That is a backfill. Prisma could not guess what value the existing rows should get.

**Why must you never edit a migration that has been applied?**
The database records that the migration ran, and Prisma checks its file against that record. A changed file no longer matches what was run, and other databases (a teammate's, the server) that already ran the old version would end up different from ones that run the new version. To change something, add a new migration.

**What does `findUniqueOrThrow` give you, and how do `P2002`, `P2025` and `P2003` reach the client?**
`findUniqueOrThrow` throws Prisma error `P2025` when the row is not there, so you do not write an `if (!task)` check. Every Prisma error is thrown up to Express 5, which forwards it to the central error handler. There `fromPrismaError` turns `P2002` (unique) into `409`, `P2025` (not found) into `404` and `P2003` (foreign key) into `409`, using the same `AppError` classes and the same envelope as before.

**Why is the generated client not committed, and when do you run `prisma generate`?**
It is code generated from `schema.prisma`, so committing it would only add noise and merge conflicts. Anyone who clones the repo makes it with `prisma generate`. You run it after installing, after every schema change (`migrate dev` does not do it in Prisma 7), and in CI before the type check.

## Troubleshooting

**A Prisma command prints a version starting with `8`, or the schema is not read**
You ran a command that fetched Prisma 8. Use `npx prisma@7 ...` for every command, check `package.json` has `^7` for `prisma` and `@prisma/client`, and run `npm install` again. Never run the commands in Prisma's "update available" box.

**`Cannot find module './generated/prisma/client.ts'`, or `@prisma/client did not initialize`**
The client has not been generated, or is out of date. Run `npx prisma@7 generate`. It must also be run after a fresh `git clone` and after every schema change.

**`PrismaClient needs to be constructed with a non-empty, valid PrismaClientOptions` or `adapter` errors**
Prisma 7 needs a driver adapter. Check `src/db.ts` passes `{ adapter }` to `new PrismaClient`, and that `@prisma/adapter-better-sqlite3` is installed.

**`Environment variable not found: DATABASE_URL`, or `url` is undefined**
`DATABASE_URL` is missing. Check `.env` has the line (`DATABASE_URL="file:./data/app.db"`), and for your own scripts run them with `--env-file-if-exists=.env` (the npm scripts do). The Prisma tool reads `.env` through `dotenv` in `prisma7.config.ts`.

**`better-sqlite3` fails to install, or `Could not locate the bindings file`**
`better-sqlite3` downloads a ready-made binary for your system and Node.js version. If that fails (offline, or an unusual system), the install tries to compile it, which needs build tools: on Windows, the Visual Studio Build Tools, on macOS `xcode-select --install`, on Linux `sudo apt install build-essential python3`. Then run `npm install` again. This part was only tested on Linux.

**`migrate dev` stops with `P3018` and `NOT NULL constraint failed: new_Task.titleKey`**
Your second migration still has the original `INSERT ... SELECT`, so the new column is empty. Edit the SQL as in section 3.4. In development, delete `data/app.db` and run `npx prisma@7 migrate dev` again to rebuild from the migrations.

**`migrate dev` says the database is out of sync, or asks to reset**
The database does not match the migration history. This happens if you edited an applied migration, ran `db push`, or changed the database by hand. In development you can delete `data/app.db` and run `npx prisma@7 migrate dev` to rebuild it. Never do that to a database whose data matters.

**`TS2741: Property 'titleKey' is missing ...` (or any type error about a field)**
The generated client is newer than your code: the schema changed and `generate` was run. This is the typed client doing its job. Give the field a value, or remove the code that is out of date.

**`npm run bruno` fails on `03-list-tasks` or `06-filter-by-status`**
The list now returns `{ data, meta }`. Check those two `.bru` files use `res.body.data` as in section 5.3.

**`Create task` fails with `409` on a second Bruno run**
A run that stopped halfway can leave a task behind, and the title rule now lives in the database. Delete the leftover task through the API, or run `npm run db:seed` to reset your data, and run `npm run bruno` again.

**`DATABASE_URL="..." npx prisma@7 ...` does nothing, or is a syntax error**
Setting a variable in front of a command works in Git Bash, macOS and Linux Terminal. It does not work in Windows PowerShell or cmd, so use Git Bash, as the rest of this course does.

## You're done when

- [ ] `prisma` and `@prisma/client` are locked to `^7` in `package.json`, and every Prisma command you ran used `npx prisma@7`.
- [ ] `prisma/migrations/` has two migrations, and you edited the second one by hand.
- [ ] `src/store/tasks.ts` is gone, the routes use `src/services/tasks.ts`, and the list endpoint filters, sorts and pages, returning `{ data, meta }`.
- [ ] `P2002`, `P2025` and `P2003` each reach the client as the right status (`409`, `404`, `409`) through your existing error handler.
- [ ] `npm run db:seed` fills the database, and you rebuilt a second database from the migrations and the seed alone.
- [ ] `npm run bruno` passes against the new API, and `npm run typecheck` is clean.
- [ ] You can explain `migrate dev` vs `migrate deploy`.
- [ ] Everything is committed and pushed to your repo.

Keep `prisma/`, `src/db.ts` and `src/services/tasks.ts` as they are. M08 replaces the hand-written validation with Zod, and M09 tests the `app` you export, against its own database.

Previous: [M06, SQL Fundamentals with SQLite](../m06-sql-fundamentals-sqlite/index.md). Next: [M08, Zod Validation & Type Inference](../m08-zod-validation/index.md).
