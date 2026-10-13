# M08 — Zod Validation & Type Inference

**Module M08 · Week 3 · Days 4-5 · about 3 hours**

Make bad input impossible to reach your code: describe each request once as a Zod schema, check it before the handler runs, and let TypeScript take its types from the same schema.

## Overview & time plan

**Builds on:** M05 and M07. You need the `node-js-training` repo with the Task API from M07: Prisma and SQLite behind a service layer, the error handler from M05, and `npm run bruno` passing. Everything you write here goes into that same repo, on `main`, with the add, commit and push steps you know. (The word "module" on this page means the course lessons, M01 to M10.)

In M05 you wrote validation by hand, and M07 grew that file to about 100 lines of `if` checks that you have to keep in step with the types. **Zod** is a library where you describe the data once, as a **schema**. The schema checks data while the program runs, and TypeScript can read the same schema to give you the type. One description, two jobs, and nothing to keep in step.

You will:

- learn the parts of Zod 4 that a real API uses, in three small practice files;
- write schemas for the Task API's create, update, list query and `:id` parameter, and derive the update schema from the create one;
- build a typed **`validate` middleware**, and work around `req.query` being read-only in Express 5;
- **delete** `src/validation.ts`, so no hand-written validation is left;
- turn a `ZodError` into the `400` envelope you fixed in M05, with a `details` entry for every bad field;
- keep Zod and Prisma aligned, and check your environment variables with Zod when the app starts.

1. Why validate at runtime, and install: 10 min
2. Zod 4 basics: 25 min
3. Parsing and errors: 15 min
4. Refine, transform and pipe: 10 min
5. The Task schemas and type inference: 30 min
6. The validate middleware, and removing the old validation: 45 min
7. Zod and Prisma, and checking the environment: 35 min
8. Check your understanding: 10 min

> **Zod 4, not older tutorials.** Many articles still show Zod 3. In Zod 4 you write `z.email()`, `z.uuid()` and `z.url()` (not `z.string().email()`), the error message option is called `error`, and the error helpers are `z.flattenError(...)` and `z.prettifyError(...)` (not `error.flatten()`). Install `zod@4` as shown below, and if a snippet from the web does not compile, check which version it is for.

This page moves quickly. Type the schemas and the middleware yourself where you can, because that is how they sink in. The new `src/middleware/errors.ts` (section 6) you may paste: only one branch of it is new. Run each step, and compare with the *You should see* box. Your ids, timestamps and request IDs will differ from the examples. Commands are written for Git Bash on Windows, and macOS and Linux Terminal. If anything else differs, check [Troubleshooting](#troubleshooting).

## 1. Why validate at runtime, and install (10 min)

TypeScript checks your code **before** it runs, and then it disappears. The JSON a client sends arrives **while** the program runs, and TypeScript cannot see it. In M05 you typed the request body as `CreateTaskInput` in the route, and a type like that is a promise to the compiler, not a check. `as` is the same promise. See what a broken promise looks like. Create `src/labs/types-vanish.ts`:

```ts
// TypeScript trusts you. It checks your code, not the data that arrives while the program runs.
interface CreateBody {
  title: string;
}

const text = '{"title": 42}'; // what a client might send
const body = JSON.parse(text) as CreateBody; // "as" is a promise to the compiler, not a check

console.log(body.title.toUpperCase());
```

Check the types, then run it:

```bash
npm run typecheck
npx tsx src/labs/types-vanish.ts
```

*You should see:*

```text
src/labs/types-vanish.ts:9
console.log(body.title.toUpperCase());
                       ^

TypeError: body.title.toUpperCase is not a function
```

`npm run typecheck` prints no errors: the types are fine, the data is not. The crash is a `TypeError` from inside your program, and the path and the lines after it are your own. In an API this would be a `500` caused by a client's mistake. **`req.body` is untrusted data**, like everything else that comes from outside: the body, the query string, the URL parameters and the environment.

So the rule of this module: **check untrusted data at the edge, once, before your logic sees it.** Hand-written checks do that, but they cost you twice: you write the check, and you write the type, and the two drift apart. Open `src/validation.ts` and look for `(data.title as string).trim()`: that `as` is the same broken promise, kept only by the checks above it.

Install Zod 4:

```bash
npm install zod@4
npm ls zod
```

*You should see:*

```text
js-training@1.0.0 /path/to/node-js-training
└── zod@4.6.7
```

Yours may be a newer `4.x`. `package.json` now lists `zod` with a `^4` version. If it says `3`, run `npm install zod@4` again.

Delete the practice file, you will not need it again. Then commit:

```bash
rm src/labs/types-vanish.ts
git add .
git commit -m "chore: add zod"
git push
```

**Checkpoint 1**

- [ ] You saw a `TypeError` that `npm run typecheck` did not warn you about.
- [ ] `npm ls zod` shows a `4.x` version.

## 2. Zod 4 basics (25 min)

A schema describes what valid data looks like. `schema.parse(data)` returns the data if it is valid and throws if it is not. Create `src/labs/zod-basics.ts` and read the comments as you type:

```ts
import { z } from "zod";

// A schema describes what valid data looks like. parse() returns the data, or throws.
const name = z.string().trim().min(1).max(30);
console.log(name.parse("  Ada  "));

// Top-level formats (Zod 4): z.email(), z.uuid(), z.url()
console.log(z.email().safeParse("ada@example.com").success);
console.log(z.uuid().safeParse("not-a-uuid").success);
console.log(z.url().safeParse("https://zod.dev").success);

// Objects: z.object ignores keys it does not know, z.strictObject rejects them
const loose = z.object({ title: z.string() });
const strict = z.strictObject({ title: z.string() });
console.log(loose.parse({ title: "A", id: "sneaky" }));
console.log(strict.safeParse({ title: "A", id: "sneaky" }).success);

// Enums, arrays, optional, nullable and default
const status = z.enum(["todo", "in_progress", "done"]);
const task = z.object({
  title: z.string(),
  status: status.default("todo"),
  tags: z.array(z.string()).optional(),
  dueDate: z.string().nullable(),
});
console.log(task.parse({ title: "Write M08", dueDate: null }));

// Literals and unions: "one of these exact shapes"
const event = z.discriminatedUnion("type", [
  z.object({ type: z.literal("created"), title: z.string() }),
  z.object({ type: z.literal("deleted"), id: z.uuid() }),
]);
console.log(event.parse({ type: "created", title: "A" }));

// Query strings are always text. z.coerce.number() turns "2" into 2 before it checks.
const page = z.coerce.number().int().min(1);
console.log(page.parse("2"), page.safeParse("abc").success);
```

```bash
npx tsx src/labs/zod-basics.ts
```

*You should see:*

```text
Ada
true
false
true
{ title: 'A' }
false
{ title: 'Write M08', status: 'todo', dueDate: null }
{ type: 'created', title: 'A' }
2 false
```

Go through the output, one line at a time:

| Line | What it showed |
| --- | --- |
| `Ada` | `.trim()` is part of the schema: `parse` returned the cleaned value, not the input. A schema can **change** data as well as check it |
| `true`, `false`, `true` | `z.email()`, `z.uuid()` and `z.url()` are top-level checks for common formats |
| `{ title: 'A' }` | `z.object` **strips** keys it does not know. The `id` the client sneaked in is gone |
| `false` | `z.strictObject` **rejects** unknown keys instead. Use it for input where an extra field is a mistake or an attack |
| `{ title: 'Write M08', status: 'todo', dueDate: null }` | `.default("todo")` filled a missing value, `.optional()` allowed `tags` to be absent, and `.nullable()` allowed `null` |
| `{ type: 'created', title: 'A' }` | A **discriminated union** picks the right shape by looking at one field (`type`), so the errors are about the right shape |
| `2 false` | `z.coerce.number()` converts text to a number first, then checks it. `"abc"` becomes `NaN` and fails |

`optional` means the key may be missing, `nullable` means the value may be `null`, and `default` fills in a missing value. They are different things. Only the last one changes the data.

**Why `z.coerce` matters for an API:** everything in a query string (`?page=2`) and every URL parameter is **text**. `"2"` is not the number `2`. You will use `z.coerce.number()` for `page` and `pageSize` in section 5.

**Checkpoint 2**

- [ ] Your output matches, line for line.
- [ ] You can say the difference between `z.object` and `z.strictObject`, and between `optional` and `nullable`.

## 3. Parsing and errors (15 min)

`parse` throws when the data is wrong. `safeParse` never throws: it returns `{ success: true, data }` or `{ success: false, error }`. Use `safeParse` when a bad value is normal and you want to handle it where you stand. Use `parse` when a bad value should stop the work, and let the error travel up to a central handler. Your middleware will use `parse`, because your error handler already exists.

Create `src/labs/zod-errors.ts`. The schema has custom messages, set with the `error` option (in Zod 4, one option for every message), and the data breaks three rules at three depths:

```ts
import { z } from "zod";

const schema = z.object({
  title: z.string("Title must be text").min(1, "Title is required"),
  address: z.object({ email: z.email() }),
  tags: z.array(z.string()),
});

const bad = { title: "", address: { email: "nope" }, tags: ["ok", 7] };

// parse() throws a ZodError when the data is wrong
try {
  schema.parse(bad);
} catch (error) {
  console.log(error instanceof z.ZodError);
}

// safeParse() never throws. It returns { success: true, data } or { success: false, error }
const result = schema.safeParse(bad);
if (!result.success) {
  // issues is the raw list. Each one has a path and a message (and more)
  console.log(result.error.issues.map(({ path, message }) => ({ path, message })));
  console.log(z.flattenError(result.error));
  console.log(JSON.stringify(z.treeifyError(result.error), null, 2));
  console.log(z.prettifyError(result.error));
}
```

```bash
npx tsx src/labs/zod-errors.ts
```

*You should see:*

```text
true
[
  { path: [ 'title' ], message: 'Title is required' },
  { path: [ 'address', 'email' ], message: 'Invalid email address' },
  {
    path: [ 'tags', 1 ],
    message: 'Invalid input: expected string, received number'
  }
]
{
  formErrors: [],
  fieldErrors: {
    title: [ 'Title is required' ],
    address: [ 'Invalid email address' ],
    tags: [ 'Invalid input: expected string, received number' ]
  }
}
{
  "errors": [],
  "properties": {
    "title": {
      "errors": [
        "Title is required"
      ]
    },
    "address": {
      "errors": [],
      "properties": {
        "email": {
          "errors": [
            "Invalid email address"
          ]
        }
      }
    },
    "tags": {
      "errors": [],
      "items": [
        null,
        {
          "errors": [
            "Invalid input: expected string, received number"
          ]
        }
      ]
    }
  }
}
✖ Title is required
  → at title
✖ Invalid email address
  → at address.email
✖ Invalid input: expected string, received number
  → at tags[1]
```

There are four ways to look at the same `ZodError`:

| Tool | Gives you | Use it for |
| --- | --- | --- |
| `error.issues` | The raw list. Each issue has a `path` (an array) and a `message` | Building your own response. **You will do this in section 6** |
| `z.flattenError(error)` | `fieldErrors` by top-level field. `address.email` is reported under `address` | Flat forms |
| `z.treeifyError(error)` | A tree that mirrors the data, with `properties` and `items` | Nested data |
| `z.prettifyError(error)` | A readable text block | Logs and terminals. **You will use it in section 7** |

Notice that `path` is `['tags', 1]`: the second tag, found by its position. Your API needs a path as text, such as `tags.1`.

**Checkpoint 3**

- [ ] You saw the same three problems in all four formats.
- [ ] You can say when to use `parse` and when to use `safeParse`.

## 4. Refine, transform and pipe (10 min)

Some rules cannot be written as a type: "the end is after the start". Some values need cleaning: trim, lower-case. Create `src/labs/zod-refine.ts`:

```ts
import { z } from "zod";

// refine: your own rule, on one field or across fields
const dates = z
  .object({ start: z.coerce.date(), end: z.coerce.date() })
  .refine((v) => v.end > v.start, { error: "End must be after start", path: ["end"] });

console.log(dates.safeParse({ start: "2026-10-01", end: "2026-09-01" }).error?.issues[0]?.message);

// transform: change the value after it has passed the checks
const tag = z.string().trim().toLowerCase();
console.log(tag.parse("  Backend "));

const csv = z.string().transform((text) => text.split(",").map((part) => part.trim()));
console.log(csv.parse("a, b ,c"));

// pipe: the output of one schema becomes the input of the next
const age = z.string().transform(Number).pipe(z.number().int().min(0));
console.log(age.parse("42"), age.safeParse("-1").success);

// input and output types can differ. z.input is what you put in, z.output is what you get out.
type AgeIn = z.input<typeof age>;
type AgeOut = z.output<typeof age>;
const typed: [AgeIn, AgeOut] = ["42", 42];
console.log(typed);
```

```bash
npx tsx src/labs/zod-refine.ts
```

*You should see:*

```text
End must be after start
backend
[ 'a', 'b', 'c' ]
42 false
[ '42', 42 ]
```

- **`.refine(check, { error, path })`** adds your own rule. It runs after the field checks pass, and it sees the whole object, so it can compare fields (a cross-field rule). `path` says which field gets the message.
- **`.transform(fn)`** changes the value after it passed the checks. `.trim()` and `.toLowerCase()` are built-in versions of this idea.
- **`.pipe(next)`** sends the output of one schema into another. `transform(Number).pipe(z.number()...)` converts first, then checks.
- **`z.input` and `z.output`** are the two ends of a schema. `age` takes a string in and gives a number out, so its input and output types differ. `z.infer` is another name for `z.output`.

You will use all of these in the next section, so keep the output in mind: `z.input` is what the **client sends**, `z.output` is what **your code receives**.

**Checkpoint 4**

- [ ] The cross-field rule printed `End must be after start`.
- [ ] You can say what `z.input` and `z.output` are for the `age` schema.

## 5. The Task schemas and type inference (30 min)

Now the real thing. Create `src/schemas/task.ts`. Read the comments: the whole file is about **one** description of a task, and every other schema is **derived** from it.

```ts
import { z } from "zod";

export const taskStatus = z.enum(["todo", "in_progress", "done"], {
  error: "Must be one of: todo, in_progress, done",
});

// The fields a client may send. Every other schema in this file is derived from this one.
const taskFields = z.strictObject({
  title: z
    .string({ error: (issue) => (issue.input === undefined ? "Required" : "Must be a string") })
    .trim()
    .min(1, "Must not be empty")
    .max(100, "Must be 100 characters or fewer"),
  description: z.string({ error: "Must be a string" }),
  status: taskStatus,
  tags: z
    .array(z.string().trim().min(1, "Must not be empty").max(30, "Must be 30 characters or fewer"), {
      error: "Must be a list of tag names",
    })
    .transform((names) => [...new Set(names)]), // drop repeated tags
});

// Create: a title is required, the rest is optional, and a missing status becomes "todo"
export const createTaskSchema = taskFields
  .partial({ description: true, tags: true })
  .extend({ status: taskStatus.default("todo") });

// Update: every field is optional, but not an empty body
export const updateTaskSchema = taskFields
  .partial()
  .refine((fields) => Object.keys(fields).length > 0, {
    error: "Send at least one of: title, description, status, tags",
  });

// Path parameters: /tasks/:id
export const taskParamsSchema = z.object({ id: z.uuid({ error: "Must be a valid id" }) });

// A whole number from 1 to max. Query-string values are text, so z.coerce does the conversion.
const whole = (max: number) => {
  const error = `Must be a whole number from 1 to ${max}`;
  return z.coerce.number({ error }).int({ error }).min(1, { error }).max(max, { error });
};

// Query string: GET /tasks?status=done&sort=title&page=2
export const listQuerySchema = z.object({
  status: taskStatus.optional(),
  q: z.string().trim().optional(),
  sort: z.enum(["createdAt", "title", "status"], { error: "Must be one of: createdAt, title, status" }).default("createdAt"),
  order: z.enum(["asc", "desc"], { error: "Must be asc or desc" }).default("desc"),
  page: whole(1_000_000).default(1),
  pageSize: whole(100).default(20),
});

// The types are derived from the schemas. Nothing is written twice.
export type TaskStatus = z.infer<typeof taskStatus>;
export type TaskInput = z.output<typeof createTaskSchema>;
export type TaskChanges = z.output<typeof updateTaskSchema>;
export type ListQuery = z.output<typeof listQuerySchema>;
```

Check it compiles, then try the schemas in a practice file, `src/labs/schemas-try.ts`:

```ts
import { createTaskSchema, listQuerySchema, updateTaskSchema } from "../schemas/task.ts";
import type { TaskInput } from "../schemas/task.ts";
import { z } from "zod";

console.log(createTaskSchema.parse({ title: "  Write M08  ", tags: ["a", "a", " b "] }));
console.log(updateTaskSchema.parse({ status: "done" }));
console.log(updateTaskSchema.safeParse({}).error?.issues.map((i) => i.message));
console.log(createTaskSchema.safeParse({ id: "x", title: "" }).error?.issues.map((i) => [i.path.join("."), i.message]));
console.log(listQuerySchema.parse({}));
console.log(listQuerySchema.parse({ page: "2", pageSize: "5", status: "done" }));
console.log(listQuerySchema.safeParse({ page: "0", pageSize: "abc", sort: "x" }).error?.issues.map((i) => [i.path.join("."), i.message]));

type In = z.input<typeof createTaskSchema>;
const draft: In = { title: "no status yet" };
const saved: TaskInput = createTaskSchema.parse(draft);
console.log(saved.status);
```

```bash
npm run typecheck
npx tsx src/labs/schemas-try.ts
```

*You should see:*

```text
{ title: 'Write M08', status: 'todo', tags: [ 'a', 'b' ] }
{ status: 'done' }
[ 'Send at least one of: title, description, status, tags' ]
[ [ 'title', 'Must not be empty' ], [ '', 'Unrecognized key: "id"' ] ]
{ sort: 'createdAt', order: 'desc', page: 1, pageSize: 20 }
{
  status: 'done',
  sort: 'createdAt',
  order: 'desc',
  page: 2,
  pageSize: 5
}
[
  [ 'sort', 'Must be one of: createdAt, title, status' ],
  [ 'page', 'Must be a whole number from 1 to 1000000' ],
  [ 'pageSize', 'Must be a whole number from 1 to 100' ]
]
todo
```

Read what the schemas did:

- **Create.** `"  Write M08  "` came back trimmed, the tags `["a", "a", " b "]` came back as `['a', 'b']` (trimmed, repeats dropped), and the missing `status` became `todo`.
- **Update.** `{ status: "done" }` is fine, and `{}` is rejected by the `refine`, because a PATCH that changes nothing is a mistake.
- **Unknown fields.** `{ id: "x", title: "" }` failed for two reasons: the empty title, and the `id`. The `id` issue has an empty path, because the problem is the whole object. Your handler will report that as `body`.
- **List query.** `{}` gave the defaults, `"2"` and `"5"` became the numbers `2` and `5`, and the bad values each got the same messages as the hand-written checks in M07.

**Deriving instead of repeating.** `taskFields` is written once. `createTaskSchema` is made from it with `.partial({ ... })` (make some fields optional) and `.extend({ ... })` (replace a field: here `status` gets a default). `updateTaskSchema` is `.partial()` (everything optional) plus a `refine`. Two more tools do the same job for other cases: `.pick({ ... })` keeps only some fields, and `.omit({ ... })` drops some. If you change the title rule in `taskFields`, create and update both change, with nothing to remember.

**The types.** The last four lines are the point of this module. `z.infer<typeof taskStatus>` is `"todo" | "in_progress" | "done"`. `TaskInput` is what the create handler receives. Look at the last lines of `schemas-try.ts`: `z.input` of the create schema allows `{ title: "no status yet" }`, and `z.output` has a `status`, because the default was applied. **Schemas first, types derived**: you never write `interface CreateTaskInput` again.

**Checkpoint 5**

- [ ] `npm run typecheck` is clean, and the practice file printed what is shown above.
- [ ] You can say what `.partial`, `.extend` and `.default` did to create the update and create schemas.

## 6. The validate middleware, and removing the old validation (45 min)

A **middleware** runs before the handler (M05). The idea: for each route, say which schemas apply to the body, the params and the query, check them, and hand the handler **parsed** values. Before you build it, try the obvious way to store a parsed query, and see why it does not work in Express 5. Create `src/labs/query-readonly.ts`:

```ts
import express from "express";
import { z } from "zod";

const querySchema = z.object({ page: z.coerce.number().default(1) });

const app = express();
app.get("/try", (req, res) => {
  try {
    // The obvious idea: replace req.query with the parsed value
    req.query = querySchema.parse(req.query) as never;
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
});

const server = app.listen(4100, async () => {
  const response = await fetch("http://localhost:4100/try?page=2");
  console.log(response.status, await response.json());
  server.close();
});
```

```bash
npx tsx src/labs/query-readonly.ts
```

*You should see:*

```text
500 {
  message: 'Cannot set property query of #<IncomingMessage> which has only a getter'
}
```

In Express 5, `req.query` is a read-only getter: it re-reads the URL each time, and you cannot assign to it. So the middleware stores the parsed values somewhere Express lets you write: **`res.locals`**, an object that lives as long as the request. Delete the practice file, then create `src/middleware/validate.ts`:

```bash
rm src/labs/query-readonly.ts
```

```ts
import type { RequestHandler, Response } from "express";
import type { z } from "zod";

// Which parts of the request to check. Each one is optional.
interface RequestSchemas {
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
}

// For each part you gave a schema for, the type of the parsed result (z.output)
export type Valid<S extends RequestSchemas> = {
  [K in keyof S & keyof RequestSchemas]: S[K] extends z.ZodType ? z.output<S[K]> : never;
};

// Parse the request. A ZodError is thrown on bad input: Express 5 passes it to the central error handler.
// The parsed values go on res.locals.valid, because Express 5 makes the query object read-only.
export function validate(schemas: RequestSchemas): RequestHandler {
  return (req, res, next) => {
    const valid: Record<string, unknown> = {};
    if (schemas.params) valid.params = schemas.params.parse(req.params);
    if (schemas.query) valid.query = schemas.query.parse(req.query);
    if (schemas.body) valid.body = schemas.body.parse(req.body);
    res.locals.valid = valid;
    next();
  };
}

// Read the parsed values back, typed by the same schemas you gave validate()
export function valid<S extends RequestSchemas>(res: Response): Valid<S> {
  return res.locals.valid as Valid<S>;
}
```

How it works:

- `validate(schemas)` returns an ordinary middleware. It calls `parse` on each part you gave a schema for. If one fails it **throws** a `ZodError`, and Express 5 passes a thrown error to the central handler (M05), so there is no `try/catch` here. If all pass, the parsed values go on `res.locals.valid` and `next()` runs the handler.
- The `Valid<S>` type reads the schemas you gave and gives each part the `z.output` type of its schema. `valid<typeof schemas>(res)` gives the handler those values with the right types. The type comes from the schema, not from anything you wrote by hand.
- The params are checked first, then the query, then the body: the first part that fails is reported. This keeps the middleware short.

Now replace `src/routes/tasks.ts`. Each route declares what it accepts in one object, and the handlers shrink to the business call. Nothing in this file checks anything by hand:

```ts
import { Router } from "express";
import type { Response } from "express";
import { valid, validate } from "../middleware/validate.ts";
import { createTaskSchema, listQuerySchema, taskParamsSchema, updateTaskSchema } from "../schemas/task.ts";
import * as tasks from "../services/tasks.ts";
import type { ListResult, TaskView } from "../services/tasks.ts";

export const tasksRouter = Router();

// One object per route says what that route accepts. validate() checks it, valid() reads it, typed.
const listRequest = { query: listQuerySchema };
const createRequest = { body: createTaskSchema };
const idRequest = { params: taskParamsSchema };
const updateRequest = { params: taskParamsSchema, body: updateTaskSchema };

tasksRouter.get("/", validate(listRequest), async (_req, res: Response<ListResult>) => {
  const { query } = valid<typeof listRequest>(res);
  res.json(await tasks.listTasks(query));
});

tasksRouter.post("/", validate(createRequest), async (_req, res: Response<TaskView>) => {
  const { body } = valid<typeof createRequest>(res);
  res.status(201).json(await tasks.createTask(body));
});

tasksRouter.get("/:id", validate(idRequest), async (_req, res: Response<TaskView>) => {
  const { params } = valid<typeof idRequest>(res);
  res.json(await tasks.getTask(params.id));
});

tasksRouter.patch("/:id", validate(updateRequest), async (_req, res: Response<TaskView>) => {
  const { params, body } = valid<typeof updateRequest>(res);
  res.json(await tasks.updateTask(params.id, body));
});

tasksRouter.delete("/:id", validate(idRequest), async (_req, res) => {
  const { params } = valid<typeof idRequest>(res);
  await tasks.deleteTask(params.id);
  res.sendStatus(204);
});
```

The service still has its own hand-written `TaskInput`, `TaskChanges` and `ListQuery`. Open `src/services/tasks.ts` and **replace everything from the top of the file down to and including the `ListResult` interface** with the lines below. The service now takes its types from the schemas. (`TaskView` stays for now. You replace it in section 7.)

```ts
import type { Task } from "../domain/task.ts";
import { prisma } from "../db.ts";
import type { Prisma } from "../generated/prisma/client.ts";
import type { ListQuery, TaskChanges, TaskInput } from "../schemas/task.ts";

export type TaskView = Task & { tags: string[] };

export interface ListResult {
  data: TaskView[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}
```

Now the old file is dead code. **Delete it**, and check the code:

```bash
rm src/validation.ts
npm run typecheck
```

`npm run typecheck` should print no errors. If it complains about `validation.ts`, something still imports it: search with `grep -rn "validation.ts" src`.

Start the server (`npm run dev`) and, in a second terminal, send a bad create request. The handler for it does not exist yet, so you will see what a `ZodError` does without help:

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST localhost:4000/api/v1/tasks -H "Content-Type: application/json" -d '{"title":""}'
```

*You should see:*

```text
{"error":{"code":"INTERNAL_ERROR","message":"Internal server error","requestId":"213ea13c-4ffb-4cc1-bec0-573dfd50e082"}}
HTTP 500
```

Your `requestId` is your own. The invalid data **was** stopped: it never reached Prisma. But the central handler from M05 does not know a `ZodError`, so it treats it as a bug: `500`, and the real error in your server terminal. A client's mistake must be a `400`.

Add the missing piece to the central handler. **Replace** `src/middleware/errors.ts`. `fromZodError` returns the same `ValidationError` you wrote in M05, so the envelope cannot change: it only needs one `{ path, message }` per issue.

```ts
import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { AppError, ConflictError, NotFoundError, ValidationError } from "../errors.ts";
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

// Turn a ZodError into the same ValidationError as before: one { path, message } per problem
function fromZodError(error: ZodError): ValidationError {
  return new ValidationError(
    error.issues.map((issue) => ({ path: issue.path.map(String).join(".") || "body", message: issue.message })),
  );
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
      : error instanceof ZodError
        ? fromZodError(error)
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

- `issue.path` is an array such as `["tags", 1]`, so `.map(String).join(".")` makes the text `tags.1`. An empty path (the whole body is wrong) becomes `"body"`, as in M05.
- The new branch sits next to the `AppError` and Prisma ones, so every error still ends in one `res.status(...).json({ error: ... })` at the bottom.

Save. The server restarts by itself. Try the failures from the last two modules, and a valid request:

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST localhost:4000/api/v1/tasks -H "Content-Type: application/json" -d '{"title":"","status":"archived","owner":"me"}'
curl -s -w "\nHTTP %{http_code}\n" -X POST localhost:4000/api/v1/tasks
curl -s -w "\nHTTP %{http_code}\n" localhost:4000/api/v1/tasks/abc
curl -s -w "\nHTTP %{http_code}\n" "localhost:4000/api/v1/tasks?page=0&pageSize=abc&sort=name"
curl -s -w "\nHTTP %{http_code}\n" -X PATCH localhost:4000/api/v1/tasks/00000000-0000-4000-8000-000000000000 -H "Content-Type: application/json" -d '{}'
curl -s -w "\nHTTP %{http_code}\n" -X POST localhost:4000/api/v1/tasks -H "Content-Type: application/json" -d '{"title":"  Write the Zod page  ","tags":["zod","zod"," api "]}'
```

*You should see:*

```text
{"error":{"code":"VALIDATION_ERROR","message":"Request validation failed","details":[{"path":"title","message":"Must not be empty"},{"path":"status","message":"Must be one of: todo, in_progress, done"},{"path":"body","message":"Unrecognized key: \"owner\""}],"requestId":"331e0251-9468-4cab-ac54-0700ab2f96ac"}}
HTTP 400
{"error":{"code":"VALIDATION_ERROR","message":"Request validation failed","details":[{"path":"body","message":"Invalid input: expected object, received undefined"}],"requestId":"2d8aa0d0-2330-4420-8689-b381a5176822"}}
HTTP 400
{"error":{"code":"VALIDATION_ERROR","message":"Request validation failed","details":[{"path":"id","message":"Must be a valid id"}],"requestId":"4853beb0-e925-4b74-801f-d38a4ee6278d"}}
HTTP 400
{"error":{"code":"VALIDATION_ERROR","message":"Request validation failed","details":[{"path":"sort","message":"Must be one of: createdAt, title, status"},{"path":"page","message":"Must be a whole number from 1 to 1000000"},{"path":"pageSize","message":"Must be a whole number from 1 to 100"}],"requestId":"451f7846-a865-4c8b-9cea-3b90bde27003"}}
HTTP 400
{"error":{"code":"VALIDATION_ERROR","message":"Request validation failed","details":[{"path":"body","message":"Send at least one of: title, description, status, tags"}],"requestId":"9a52ccac-7064-4cc0-91ed-008c94154879"}}
HTTP 400
{"id":"5c0fdaa1-36ef-44be-a515-00a8da9985b2","title":"Write the Zod page","status":"todo","createdAt":"2026-10-13T01:29:25.634Z","updatedAt":"2026-10-13T01:29:25.634Z","tags":["api","zod"]}
HTTP 201
```

Your `requestId`, `id` and timestamps are your own. Each `400` has the M05 shape: `code`, `message`, `details` and `requestId`. The first one reports **all three** problems at once: the empty title, the bad status, and the unknown field `owner` (path `body`, because an unknown key belongs to the whole object). The second has no body at all, so `req.body` is `undefined`. The last one shows the cleaning: the title is trimmed and the tags are `["api","zod"]` (no repeat, trimmed, sorted by `toView`). Send the last request a second time and you get `409`: the title rule from M07 lives in the database.

Now run the Bruno collection from M05, which must pass without a single change:

```bash
npm run bruno
```

*You should see:*

```text
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
│ Duration (ms) │      454       │
└───────────────┴────────────────┘
```

All 15 requests and 35 assertions pass: the same envelope, the same status codes, the same `details[0].path` of `title`. Only the duration is your own.

Last, the proof the brief asks for: no hand-written checks remain. Search the code (the practice files in `src/labs/` are exercises from earlier modules, not request handling):

```bash
grep -rnE "typeof (req|body|data|query|input)|if \(!(req\.)?body|isInteger|\.trim\(\) ?===" src prisma --include=*.ts --exclude-dir=generated --exclude-dir=labs
echo "matches: $?"
```

*You should see:*

```text
matches: 1
```

`grep` exits with `1` when it finds nothing, so `matches: 1` means no hand-written check is left. (On Windows Git Bash, macOS and Linux this works the same.)

```bash
git add .
git commit -m "feat: validate requests with zod schemas and a validate middleware"
git push
```

**Checkpoint 6**

- [ ] `src/validation.ts` is gone and `npm run typecheck` is clean.
- [ ] Bad input gives a `400` with a `details` entry for every problem, in the M05 envelope.
- [ ] `npm run bruno` passes with 15 requests and 35 assertions, unchanged.
- [ ] The `grep` finds nothing.

## 7. Zod and Prisma, and checking the environment (35 min)

**Two contracts.** Zod describes what a **client** may send: the request contract. Prisma's types describe what the **database** can store: the persistence contract. They are different on purpose (a client never sends `titleKey`), but they must agree where they meet. Two rules keep them honest:

1. **Never pass raw `req.body` to Prisma.** Only the parsed, derived values go through. Check that nothing in `src` touches the raw request except the middleware:

```bash
grep -rn "req\.body\|req\.query\|req\.params" src --include=*.ts --exclude-dir=generated --exclude-dir=labs
```

*You should see:*

```text
src/middleware/validate.ts:21:    if (schemas.params) valid.params = schemas.params.parse(req.params);
src/middleware/validate.ts:22:    if (schemas.query) valid.query = schemas.query.parse(req.query);
src/middleware/validate.ts:23:    if (schemas.body) valid.body = schemas.body.parse(req.body);
```

1. **Let the compiler compare them.** `satisfies Prisma.TaskCreateInput` checks an object against Prisma's own type. The same idea works for **responses**: parse the database row through a Zod schema, and only the fields in the schema are left, so an internal column can never leak by accident. Add the response schema to the bottom of `src/schemas/task.ts`:

```ts
// What the API sends back. A database row parsed through this keeps these fields and drops the rest.
export const taskViewSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().transform((text) => text ?? undefined),
  status: taskStatus,
  tags: z.array(z.object({ name: z.string() })).transform((tags) => tags.map((tag) => tag.name).sort()),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type TaskView = z.output<typeof taskViewSchema>;
```

Now use both in the service. **Replace everything from the top of `src/services/tasks.ts` down to and including `toView`** (the old `toView` function, which built the object by hand) with:

```ts
import { prisma } from "../db.ts";
import type { Prisma } from "../generated/prisma/client.ts";
import { taskViewSchema } from "../schemas/task.ts";
import type { ListQuery, TaskChanges, TaskInput, TaskView } from "../schemas/task.ts";

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

// A database row goes through taskViewSchema: it keeps the public fields, makes the tags a list of names, and drops the rest
const toView = (row: unknown): TaskView => taskViewSchema.parse(row);
```

And **replace the `createTask` function** with a version that builds the Prisma input explicitly and checks it with `satisfies`:

```ts
export async function createTask(input: TaskInput): Promise<TaskView> {
  const { tags = [], ...fields } = input;
  // `satisfies` checks this object against Prisma's own type. If Zod and Prisma drift apart, tsc says so.
  const data = {
    title: fields.title,
    description: fields.description,
    status: fields.status,
    // titleKey is the lower-case title. It is unique, so "Write docs" and "write DOCS" clash (P2002).
    titleKey: fields.title.toLowerCase(),
    tags: { connectOrCreate: tagLinks(tags) },
  } satisfies Prisma.TaskCreateInput;
  const row = await prisma.task.create({ data, select: taskSelect });
  return toView(row);
}
```

`TaskView` now comes from the schema too, so in `src/routes/tasks.ts` import it from there: replace the line `import type { ListResult, TaskView } from "../services/tasks.ts";` with these two lines:

```ts
import type { ListResult } from "../services/tasks.ts";
import type { TaskView } from "../schemas/task.ts";
```

See the difference between a row and a view. Create `src/labs/strip-demo.ts`:

```ts
import { prisma } from "../db.ts";
import { taskViewSchema } from "../schemas/task.ts";

// Ask Prisma for everything, including the internal columns
const row = await prisma.task.findFirstOrThrow({ include: { tags: true } });
console.log("row keys :", Object.keys(row).join(", "));

// Parse it through the response schema: only the public fields are left
const view = taskViewSchema.parse(row);
console.log("view keys:", Object.keys(view).join(", "));

await prisma.$disconnect();
```

```bash
npx tsx --env-file-if-exists=.env src/labs/strip-demo.ts
```

*You should see:*

```text
row keys : id, title, titleKey, description, status, userId, createdAt, updatedAt, tags
view keys: id, title, description, status, tags, createdAt, updatedAt
```

`titleKey` and `userId` are in the row and not in the view. Zod objects drop unknown keys, so the response schema is also a list of what you are allowed to say.

**Make them drift on purpose.** In `src/schemas/task.ts`, add `"blocked"` to the `taskStatus` list, so Zod accepts a status that the database enum does not have, and run:

```bash
npm run typecheck
```

*You should see:*

```text
src/services/tasks.ts(...): error TS2322: Type '"blocked" | "done" | "in_progress" | "todo"' is not assignable to type 'TaskStatus | undefined'.
  Type '"blocked"' is not assignable to type 'TaskStatus | undefined'.
```

There are a few errors, all in `src/services/tasks.ts`, and your line numbers differ. This is the one to look for. Without the check, a client sending `"blocked"` would get past Zod and fail inside Prisma at run time. Now it fails at compile time. Remove `"blocked"` again and make sure `npm run typecheck` is clean.

**Validate the environment.** `process.env` is untrusted too: a typo in `.env` should stop the app at the start, not fail on the first request. Create `src/config.ts`:

```ts
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().startsWith("file:", "Must start with file: (this course uses SQLite)").default("file:./data/app.db"),
});

// Check the environment once, when the app starts. If it is wrong, say why and stop.
const result = envSchema.safeParse(process.env);
if (!result.success) {
  console.error(`Invalid environment:\n${z.prettifyError(result.error)}`);
  process.exit(1);
}

export const config = result.data;
```

It checks `process.env` once, when the file is first imported, and `process.exit(1)` with a readable message if something is wrong. The values it returns have the right types: `config.PORT` is a number, because `z.coerce.number()` did the conversion. Use it in `src/db.ts` and `src/server.ts`. **Replace** both files:

```ts
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { config } from "./config.ts";
import { PrismaClient } from "./generated/prisma/client.ts";

// One client for the whole app. PrismaClient needs a driver adapter: here, better-sqlite3.
const adapter = new PrismaBetterSqlite3({
  url: config.DATABASE_URL,
});

export const prisma = new PrismaClient({ adapter });
```

```ts
import { app } from "./app.ts";
import { config } from "./config.ts";
import { prisma } from "./db.ts";

const server = app.listen(config.PORT, () => {
  console.log(`Task API listening on http://localhost:${config.PORT}`);
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

Check it works, and then break it. A variable you set in front of a command wins over `.env`:

```bash
npm run typecheck
PORT=abc DATABASE_URL=postgres://x npx tsx --env-file-if-exists=.env src/server.ts
echo "exit: $?"
```

*You should see:*

```text
Invalid environment:
✖ Invalid input: expected number, received NaN
  → at PORT
✖ Must start with file: (this course uses SQLite)
  → at DATABASE_URL
exit: 1
```

Before this change, `PORT=abc` would have started the server on port `NaN`, and a wrong `DATABASE_URL` would have failed later, inside Prisma. Now the app refuses to start and tells you what to fix. (In Windows PowerShell or cmd, a variable in front of a command does not work: use Git Bash, as in M07.)

Run the whole check once more, then commit:

```bash
npm run typecheck
npm run bruno
git add .
git commit -m "feat: parse responses and the environment with zod"
git push
```

> **Two things to know, not to use.** **Zod Mini** (`import * as z from "zod/mini"`) is a smaller version of the same library with a function-style API, made for front-end bundles where size matters. **`z.toJSONSchema(schema)`** turns a schema into JSON Schema, the format that tools such as OpenAPI use. You do not need either in this course.

**Checkpoint 7**

- [ ] The service builds the Prisma input from parsed values, with `satisfies Prisma.TaskCreateInput`, and rows go through `taskViewSchema`.
- [ ] Adding `"blocked"` to the Zod status made `npm run typecheck` fail, and removing it fixed it.
- [ ] A bad `PORT` or `DATABASE_URL` stops the app at startup with a readable message.
- [ ] `npm run typecheck` and `npm run bruno` both pass.

## Check your understanding (10 min)

Answer each one in your head, then open it to compare.

**Why does TypeScript not protect `req.body`, and what does Zod add?**
TypeScript types are removed when the code runs, and `req.body` is data that arrives from outside while it runs. `req.body as CreateTaskInput` only tells the compiler to believe you. A Zod schema checks the real data at run time, and gives you a value whose type is true because it was checked.

**When would you use `parse`, and when `safeParse`?**
`parse` throws a `ZodError` when the data is bad. Use it when bad data should stop the work and the error can travel to a central handler, as in the `validate` middleware. `safeParse` returns `{ success, data }` or `{ success, error }` and never throws. Use it when you want to handle the bad case on the spot, as in `config.ts`, where you print a message and exit.

**Why does the middleware store parsed values on `res.locals` and not on `req.query`?**
In Express 5 `req.query` is a read-only getter, so assigning to it throws a `TypeError`. `res.locals` is meant for per-request values and can be written. One place for body, params and query keeps the handlers simple.

**What are `z.input` and `z.output`? Use `z.coerce.number()` as the example.**
`z.input` is the type the schema accepts, and `z.output` (the same as `z.infer`) is the type it returns. For `z.coerce.number()` the input is anything (a query string value is text) and the output is a `number`. For `createTaskSchema`, `status` is optional in the input and always present in the output, because of `.default("todo")`.

**Why is `updateTaskSchema` made with `.partial()`, and why does it need a `refine`?**
`.partial()` makes every field of `taskFields` optional, so a PATCH may change only one field, and the title rules are not written twice. It also makes `{}` valid, and a PATCH that changes nothing is a mistake, so the `refine` adds back the one rule `.partial()` took away: at least one field must be sent.

**Zod is the request contract and Prisma is the persistence contract. What does that mean?**
Zod says what a client may send (no `titleKey`, no `id`, a trimmed title). Prisma's types say what the database can store. They are separate on purpose, and they must agree where they meet. `satisfies Prisma.TaskCreateInput` makes the compiler compare them, and a response schema parsed over each row makes sure only the public fields leave the API.

## Troubleshooting

**`TS2307: Cannot find module 'zod'`, or Zod functions that do not exist (`z.email is not a function`)**
Zod is not installed, or an old version is. Run `npm install zod@4` and check `npm ls zod` shows `4.x`. Snippets from older tutorials (`z.string().email()`, `error.format()`) are for Zod 3.

**`Cannot set property query of #<IncomingMessage> which has only a getter`**
Some code assigns to `req.query`. In Express 5 you cannot. Store the parsed value on `res.locals` as `validate` does, and read it with `valid<typeof schemas>(res)`.

**A bad request returns `500 INTERNAL_ERROR` instead of `400`**
The central handler does not know `ZodError`. Check that `src/middleware/errors.ts` has the `error instanceof ZodError` branch and imports `ZodError` from `"zod"`. If it does, check that you have only one copy of Zod: `npm ls zod` should list one version.

**`page` or `pageSize` is rejected, or becomes `0` or `NaN`**
Query-string values are text, so they need `z.coerce.number()` (or the `whole` helper of section 5). An empty `?page=` becomes `0` and fails the `min(1)`: that is correct. If a valid number is rejected, check `max`: `pageSize` is at most `100`.

**A valid-looking request is rejected with `Unrecognized key`**
`z.strictObject` rejects fields the schema does not list, on purpose. Add the field to `taskFields` if the API should accept it, or stop sending it. Fields such as `id` and `createdAt` are never accepted.

**`TS2322` errors in `src/services/tasks.ts` after you change a schema**
The compiler is telling you Zod and Prisma disagree (section 7). Make the Zod schema match the Prisma schema, or change the Prisma schema, run a migration (M07) and run `npx prisma@7 generate`.

**The app exits with `Invalid environment` on start**
That is `config.ts` working. Read the `→ at NAME` line, fix the value in `.env` (`PORT=4000`, `DATABASE_URL="file:./data/app.db"`), and start again. If you set the variable in your shell earlier, it wins over `.env`: close the terminal or unset it.

**`PORT=abc npx ...` does nothing, or is a syntax error**
Setting a variable in front of a command works in Git Bash, macOS and Linux Terminal. It does not work in Windows PowerShell or cmd, so use Git Bash, as the rest of this course does.

## You're done when

- [ ] `zod` is installed at `^4`, and `src/schemas/task.ts` has the create, update, list query and params schemas.
- [ ] `src/validation.ts` is gone, and the `grep` for hand-written checks finds nothing.
- [ ] Every task route uses `validate(...)`, and the handlers read typed values from `valid<typeof ...>(res)`.
- [ ] The service and the routes take `TaskInput`, `TaskChanges`, `ListQuery` and `TaskView` from the schemas, and `npm run typecheck` is clean.
- [ ] Invalid input returns a `400` in the M05 envelope with a `details` entry for each problem, and never reaches Prisma.
- [ ] `src/config.ts` checks the environment at startup and stops the app on a bad value.
- [ ] `npm run bruno` passes with 15 requests and 35 assertions.
- [ ] You can explain `z.infer` vs a hand-written type, and why Zod is the request contract and Prisma the persistence contract.
- [ ] Everything is committed and pushed to your repo.

Keep `src/schemas/`, `src/middleware/validate.ts` and `src/config.ts` as they are. M09 tests the `app` you export with Jest and Supertest, against its own database, and those tests send both valid and invalid requests to the routes you built here.

Previous: [M07, Prisma ORM & Migrations](../m07-prisma-orm-migrations/index.md). Next: M09, Integration Testing with Jest + Supertest (coming soon).
