# M05 — Express: Routing, Middleware & Error Handling

**Module M05 · Week 2 · Days 3-5 · about 5 hours**

Build Task API v1: a typed Express 5 REST API with middleware, one consistent error format for every failure, hand-written validation, and a Bruno collection that proves it all works.

## Overview & time plan

**Builds on:** M03 and M04. You need the `node-js-training` repo with TypeScript set up (`npm run typecheck` is clean), the Task types in `src/domain/task.ts`, and a `.env` file from M03. Everything you write here goes into that same repo, on `main`, with the add, commit and push steps you know. (The word "module" on this page means the course lessons, M01 to M10, unless it says JavaScript module.)

In M03 you wrote a web server with only `node:http` and felt what hurt: routing by hand, reading the body by hand, one `try/catch` for every failure. **Express** is the library that removes that pain. In this module you build the **Task API v1**, the API that the rest of the course grows: it gets a database in M07, validation with Zod in M08 and tests in M09.

You will build:

- an Express 5 app in TypeScript, split into `app.ts` (builds the app) and `server.ts` (starts it);
- five endpoints under `/api/v1/tasks`, backed by an in-memory store;
- **middleware**: a request ID, a request logger and CORS;
- an error model where **every** failure, from every endpoint, returns the same JSON shape;
- hand-written validation (on purpose, so you feel why M08 adds Zod);
- a **Bruno** collection of requests with assertions that checks every endpoint and every error.

1. HTTP, REST and the first Express app: 35 min
2. Routing and the in-memory store: 60 min
3. Middleware: request ID, logging and CORS: 45 min
4. Errors: AppError and the central handler: 50 min
5. Hand-written validation: 30 min
6. Config, health and graceful shutdown: 25 min
7. Bruno collection: 45 min
8. Check your understanding: 10 min

This page moves quickly. Type the code in sections 1 to 6 yourself where you can, because the typing is how the middleware and error flow sink in. The long, repetitive files (`validation.ts` and the Bruno request files) you may paste. Run each step, and compare with the *You should see* box. Your ids, timestamps and timings will differ from the examples. Commands are written for Git Bash on Windows, and macOS and Linux Terminal. If anything else differs, check [Troubleshooting](#troubleshooting).

## 1. HTTP, REST and the first Express app (35 min)

### 1.1 What you need to know about HTTP and REST

An HTTP **request** has a **method**, a **path**, headers and sometimes a body. The **response** has a **status code**, headers and a body. In a **REST** API, the path names a *thing* (a resource) and the method says what to do with it.

| Method | Meaning | Safe to repeat? |
| --- | --- | --- |
| `GET` | Read | Yes |
| `POST` | Create something new | No: two calls make two things |
| `PUT` | Replace a whole thing | Yes |
| `PATCH` | Change part of a thing | Usually |
| `DELETE` | Remove | Yes: the second call finds nothing, and the end state is the same |

Being safe to repeat is called **idempotent**. It matters because networks fail and clients retry.

| Status | Meaning | Used here for |
| --- | --- | --- |
| `200` | OK | A read or an update worked |
| `201` | Created | `POST` made a task |
| `204` | No content | `DELETE` worked, nothing to send back |
| `400` | Bad request | The request is malformed or invalid |
| `401` / `403` | Not signed in / not allowed | Not used until the capstone (M10) |
| `404` | Not found | No such task, or no such route |
| `409` | Conflict | The request clashes with what exists, such as a duplicate title |
| `422` | Unprocessable | Some APIs use it for validation errors. This course uses `400` |
| `500` | Server error | A bug in your code |

Two naming rules: use **plural nouns** for resources (`/tasks`, not `/getTask`), and put a **version** in the path (`/api/v1/...`) so you can change the API later without breaking old clients. Lists often grow a pagination convention such as `?limit=20&offset=40`. You will not build it here, but you will see it in real APIs.

The Task API has these endpoints:

| Request | Result |
| --- | --- |
| `GET /api/v1/health` | `200` `{ "status": "ok" }` |
| `GET /api/v1/tasks` | `200` list of tasks, optionally `?status=todo` |
| `POST /api/v1/tasks` | `201` the new task |
| `GET /api/v1/tasks/:id` | `200` one task |
| `PATCH /api/v1/tasks/:id` | `200` the updated task |
| `DELETE /api/v1/tasks/:id` | `204` no body |

### 1.2 Install Express

```bash
npm install express@5
npm install -D @types/express
```

`express@5` is Express 5, the current major version. `@types/express` gives TypeScript the types for it (section 6 of M04 explained `@types/*`). Some tutorials online still show Express 4, so if code you find behaves differently, check the version first. The official [Express 5 migration guide](https://expressjs.com/en/guide/migrating-5.html) lists every difference. You meet the important ones in section 2.

### 1.3 Two files: app.ts and server.ts

You build the app in one file, and start it in another:

- **`src/app.ts`** creates the Express app and exports it. It never listens on a port.
- **`src/server.ts`** imports the app and calls `listen`. It is the only file that does.

Why split them? In M09 your tests will `import { app }` and send requests to it without opening a real port, and this only works if importing the app has no side effect of starting a server.

Create `src/app.ts`:

```ts
import express from "express";

// Build the app and export it. It never calls listen: server.ts does that.
export const app = express();

app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ok" });
});
```

Create `src/server.ts`:

```ts
import { app } from "./app.ts";

const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, () => {
  console.log(`Task API listening on http://localhost:${PORT}`);
});
```

`express()` creates an app. `app.get(path, handler)` says "when a GET request arrives for this path, run this function". The handler gets a request (`req`) and a response (`res`), and `res.json(...)` sends JSON with the right header and a `200` status.

Add two scripts. `tsx watch` restarts the server when you save a file, and `--env-file-if-exists` loads `.env` as in M03:

```bash
npm pkg set scripts.dev="tsx watch --env-file-if-exists=.env src/server.ts"
npm pkg set scripts.start="tsx --env-file-if-exists=.env src/server.ts"
```

Your `.env` should contain `PORT=4000` (you made it in M03). If it does not, create it:

```bash
echo "PORT=4000" > .env
```

Start the server, and leave it running:

```bash
npm run dev
```

*You should see:*

```text
> js-training@1.0.0 dev
> tsx watch --env-file-if-exists=.env src/server.ts

Task API listening on http://localhost:4000
```

The first line shows the `name` in your `package.json`.

In a **second terminal**, call it. The `-w` option makes `curl` print the status code after the body:

```bash
curl -s -w "\nHTTP %{http_code}\n" localhost:4000/api/v1/health
curl -s -w "\nHTTP %{http_code}\n" localhost:4000/nope
```

*You should see:*

```text
{"status":"ok"}
HTTP 200
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Cannot GET /nope</pre>
</body>
</html>

HTTP 404
```

The second answer is HTML, and an API client expects JSON. Keep that in mind: by the end of section 4, every error will be JSON in one shape.

**Checkpoint 1**

- [ ] `npm run typecheck` is clean.
- [ ] `curl` to `/api/v1/health` returns `{"status":"ok"}` with `HTTP 200`.
- [ ] You can say why `app.ts` never calls `listen`.

```bash
git add .
git commit -m "feat: add express app and server"
git push
```

## 2. Routing and the in-memory store (60 min)

### 2.1 The store

The API needs somewhere to keep tasks. For v1 it is a `Map` in memory, so the data is gone when the server restarts. In M07 you swap this file for a database, so its functions are `async` and return promises now, and the rest of the code will not need to change. Create `src/store/tasks.ts`:

```ts
import { randomUUID } from "node:crypto";
import type { CreateTaskInput, Task, TaskStatus, UpdateTaskInput } from "../domain/task.ts";

const tasks = new Map<string, Task>();

// These are async on purpose: M07 swaps this file for a database, and the callers will not change
export async function listTasks(status?: TaskStatus): Promise<Task[]> {
  const all = [...tasks.values()];
  return status ? all.filter((task) => task.status === status) : all;
}

export async function getTask(id: string): Promise<Task | undefined> {
  return tasks.get(id);
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const now = new Date();
  const task: Task = { id: randomUUID(), ...input, createdAt: now, updatedAt: now };
  tasks.set(task.id, task);
  return task;
}

export async function updateTask(id: string, changes: UpdateTaskInput): Promise<Task | undefined> {
  const existing = tasks.get(id);
  if (!existing) return undefined;
  const updated: Task = { ...existing, ...changes, updatedAt: new Date() };
  tasks.set(id, updated);
  return updated;
}

export async function deleteTask(id: string): Promise<boolean> {
  return tasks.delete(id);
}
```

It uses the types you built in M04: `Task`, `CreateTaskInput`, `UpdateTaskInput` and `TaskStatus`. The store sets the `id` and the timestamps, so a client never does.

### 2.2 The routes

A **router** is a mini app that owns a group of routes, so `app.ts` does not fill up. Create `src/routes/tasks.ts`:

```ts
import { Router } from "express";
import type { Request, Response } from "express";
import type { CreateTaskInput, Task, UpdateTaskInput } from "../domain/task.ts";
import * as store from "../store/tasks.ts";

export const tasksRouter = Router();

// Request<Params, ResBody, ReqBody, Query>
tasksRouter.get("/", async (_req: Request, res: Response<Task[]>) => {
  res.json(await store.listTasks());
});

tasksRouter.post("/", async (req: Request<{}, Task, CreateTaskInput>, res: Response<Task>) => {
  const task = await store.createTask(req.body);
  res.status(201).json(task);
});

tasksRouter.get("/:id", async (req: Request<{ id: string }>, res: Response<Task | { error: string }>) => {
  const task = await store.getTask(req.params.id);
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.json(task);
});

tasksRouter.patch(
  "/:id",
  async (req: Request<{ id: string }, Task, UpdateTaskInput>, res: Response<Task | { error: string }>) => {
    const task = await store.updateTask(req.params.id, req.body);
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.json(task);
  },
);

tasksRouter.delete("/:id", async (req: Request<{ id: string }>, res: Response<{ error: string } | undefined>) => {
  if (!(await store.deleteTask(req.params.id))) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.sendStatus(204);
});
```

Update `src/app.ts` to use it:

```ts
import express from "express";
import { tasksRouter } from "./routes/tasks.ts";

// Build the app and export it. It never calls listen: server.ts does that.
export const app = express();

app.use(express.json());

app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/v1/tasks", tasksRouter);
```

What is new:

- **`express.json()`** is *middleware* that reads a JSON request body and puts the result in `req.body`. Without it, `req.body` is `undefined`.
- **`app.use("/api/v1/tasks", tasksRouter)`** mounts the router. The routes inside are relative to that path: `"/"` is `/api/v1/tasks` and `"/:id"` is `/api/v1/tasks/<id>`.
- **`:id`** is a route parameter. Its value arrives in `req.params.id`.
- **`Request<Params, ResBody, ReqBody, Query>`** is how you type a handler: the shape of `req.params`, of the response body, of `req.body`, and of `req.query`. `{}` means "no route parameters".
- **`res.status(201).json(task)`** sets the status and sends JSON. **`res.sendStatus(204)`** sends a status with its standard text and no body.
- **`async` handlers**: a handler may return a promise. You will see in section 2.4 what happens when it fails.

Save, and let `tsx watch` restart. Create a task, and read it back:

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST localhost:4000/api/v1/tasks -H "Content-Type: application/json" -d '{"title":"Learn Express","status":"todo"}'
curl -s -w "\nHTTP %{http_code}\n" localhost:4000/api/v1/tasks
```

*You should see:*

```text
{"id":"53fe34d3-6d55-42d6-abfb-653ae18331cb","title":"Learn Express","status":"todo","createdAt":"2026-10-12T12:52:11.950Z","updatedAt":"2026-10-12T12:52:11.950Z"}
HTTP 201
[{"id":"53fe34d3-6d55-42d6-abfb-653ae18331cb","title":"Learn Express","status":"todo","createdAt":"2026-10-12T12:52:11.950Z","updatedAt":"2026-10-12T12:52:11.950Z"}]
HTTP 200
```

Your `id` and timestamps are different. Dates become ISO text in JSON.

Use the `id` from your own output for the next calls (write it in place of `<id>`):

```bash
curl -s -w "\nHTTP %{http_code}\n" localhost:4000/api/v1/tasks/<id>
curl -s -w "\nHTTP %{http_code}\n" -X PATCH localhost:4000/api/v1/tasks/<id> -H "Content-Type: application/json" -d '{"status":"done"}'
curl -s -w "\nHTTP %{http_code}\n" -X DELETE localhost:4000/api/v1/tasks/<id>
curl -s -w "\nHTTP %{http_code}\n" localhost:4000/api/v1/tasks/<id>
```

You should see the task with `HTTP 200`, then the same task with `"status":"done"` and a newer `updatedAt` (`HTTP 200`), then an empty body with `HTTP 204`, and last `{"error":"Task not found"}` with `HTTP 404`.

### 2.3 What this version gets wrong

Now send two bad requests:

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST localhost:4000/api/v1/tasks -H "Content-Type: application/json" -d '{"status":"banana"}'
curl -s -w "\nHTTP %{http_code}\n" -X POST localhost:4000/api/v1/tasks
```

*You should see:*

```text
{"id":"784e8fc8-331f-4e35-aa94-70a993d6bcae","status":"banana","createdAt":"2026-10-12T12:52:11.977Z","updatedAt":"2026-10-12T12:52:11.977Z"}
HTTP 201
{"id":"b7542c1b-bc08-4486-9eaf-a578eb145ba5","createdAt":"2026-10-12T12:52:11.993Z","updatedAt":"2026-10-12T12:52:11.993Z"}
HTTP 201
```

A task with no title, and a status of `banana`, and the API said `201 Created`. The type `Request<{}, Task, CreateTaskInput>` *says* the body is a `CreateTaskInput`, but Express never checks it: types disappear at runtime (M04). Real input needs real checks, and you add them in section 5. Also notice the `404` answer is `{"error":"Task not found"}`, a different shape than any other error will have. Section 4 fixes that.

### 2.4 What changed in Express 5

Express 5 changed several things from Express 4. Create `src/labs/express5.ts` to see them run:

```ts
import express from "express";

// 1. The old "*" path pattern is gone. Express 5 wants a name: "*splat".
try {
  express().get("/files/*", () => {});
} catch (error) {
  console.log("old pattern:", (error as Error).message);
}

const app = express();
app.get("/files/*splat", (req, res) => {
  res.json({ splat: req.params.splat }); // an array of path segments
});

// 2. Optional segments use braces: /report{.json} matches both /report and /report.json
app.get("/report{.json}", (_req, res) => {
  res.send("report");
});

// 3. Without express.json(), req.body is undefined (Express 4 gave {})
app.post("/echo", (req, res) => {
  res.json({ bodyIsUndefined: req.body === undefined });
});

// 4. req.query is a read-only getter: you cannot assign to it
app.get("/query", (req, res) => {
  try {
    (req as { query: unknown }).query = {};
  } catch (error) {
    res.json({ assigning: (error as Error).constructor.name });
    return;
  }
  res.json({ assigning: "worked" });
});

// 5. A rejected promise in an async handler reaches the error handler by itself
app.get("/boom", async () => {
  throw new Error("boom");
});
app.use(((error, _req, res, _next) => {
  res.status(500).json({ caught: (error as Error).message });
}) satisfies express.ErrorRequestHandler);

const server = app.listen(0, async () => {
  const { port } = server.address() as { port: number };
  const get = async (path: string, init?: RequestInit) =>
    console.log(path, "->", await (await fetch(`http://localhost:${port}${path}`, init)).text());

  await get("/files/a/b/c");
  await get("/report");
  await get("/report.json");
  await get("/echo", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  await get("/query");
  await get("/boom");
  server.close();
});
```

```bash
npx tsx src/labs/express5.ts
```

*You should see:*

```text
old pattern: Missing parameter name at index 8: /files/*; visit https://git.new/pathToRegexpError for info
/files/a/b/c -> {"splat":["a","b","c"]}
/report -> report
/report.json -> report
/echo -> {"bodyIsUndefined":true}
/query -> {"assigning":"TypeError"}
/boom -> {"caught":"boom"}
```

| Express 5 | What you saw |
| --- | --- |
| **New path syntax.** A bare `*` is gone: write `*splat` (a named wildcard), and optional parts use braces, `/report{.json}`. | The old pattern throws when you register it. `/files/*splat` captured the rest of the path as an array. |
| **`req.body` is `undefined` with no body parser.** Express 4 gave `{}`. | Always treat `req.body` as `unknown` and check it (section 5). |
| **`req.query` is a read-only getter.** | Assigning to it throws a `TypeError`. Read it, never replace it. |
| **Rejected promises are forwarded to the error handler.** | `/boom` is an `async` handler that throws, and the error handler caught it. In Express 4 you needed a `try/catch` with `next(error)` in every async handler, or the request hung. |

That last row is why none of your handlers has a `try/catch`: if a handler throws or its promise rejects, Express passes the error on by itself. You use that in section 4. You can delete `src/labs/express5.ts` or keep it for reference.

**Checkpoint 2**

- [ ] All five task endpoints answered as above, and `npm run typecheck` is clean.
- [ ] You saw the API accept a task with no title, and you can say why.
- [ ] You can say how Express 5 handles an `async` handler that throws.

```bash
git add .
git commit -m "feat: add task routes and in-memory store"
git push
```

## 3. Middleware: request ID, logging and CORS (45 min)

### 3.1 The pipeline

A request does not go straight to your handler. It passes through a line of functions, from the top of `app.ts` down, and each one can look at it, change it, answer it, or hand it on. A function in that line is **middleware**. It receives `(req, res, next)`:

- **`next()`** passes the request to the next function.
- **`next(error)`** skips ahead to the error handler (section 4).
- If it answers (`res.json(...)`), the request stops there.

`express.json()` was middleware, and so is each route handler. The **order** you register them in is the order they run, so order matters, and you will break it on purpose in section 3.3.

### 3.2 Request ID, logging and CORS

Create `src/middleware/request-id.ts`. It gives each request an id, so a log line and an error answer can be matched later:

```ts
import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

// Give every request an id, so a log line and an error response can be matched
export const requestId: RequestHandler = (req, res, next) => {
  const id = req.get("x-request-id") ?? randomUUID();
  res.locals.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
};
```

Create `src/middleware/logger.ts`. It logs one line per request, when the response is finished:

```ts
import type { RequestHandler } from "express";

export const requestLogger: RequestHandler = (req, res, next) => {
  const start = Date.now();
  // "finish" fires after the response has been sent, so we know the status
  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms ${res.locals.requestId}`);
  });
  next();
};
```

`res.locals` is a place to keep values for the life of one request. The logger listens for `finish` because only then does it know the status code and the time taken.

**CORS** is a browser rule: a web page from one address may not call an API on another address unless the API says it may. The `cors` package adds the headers that say so. Install it:

```bash
npm install cors
npm install -D @types/cors
```

Update `src/app.ts` so the middleware runs first, before everything else:

```ts
import cors from "cors";
import express from "express";
import { requestLogger } from "./middleware/logger.ts";
import { requestId } from "./middleware/request-id.ts";
import { tasksRouter } from "./routes/tasks.ts";

// Build the app and export it. It never calls listen: server.ts does that.
export const app = express();

// Order matters: each request passes through these from top to bottom
app.use(requestId);
app.use(requestLogger);
app.use(cors());
app.use(express.json());

app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/v1/tasks", tasksRouter);
```

Save, and call the API:

```bash
curl -s -i localhost:4000/api/v1/health
curl -s -i -H "Origin: http://example.com" localhost:4000/api/v1/health
```

In the first answer, look for `X-Request-Id`. In the second, look for `Access-Control-Allow-Origin`. Your server terminal should print one line per request:

*You should see:*

```text
GET /api/v1/health 200 8ms 5e334c43-23da-46ca-aa9f-a0361f870505
GET /api/v1/health 200 1ms 8b74ba93-d049-4d49-b17b-884cafded141
```

The answers carry `X-Request-Id: 5e334c43-...` (the same id as the log line) and, for the second call, `Access-Control-Allow-Origin: *`. `cors()` with no options allows every address. A real API names the addresses it trusts.

### 3.3 Break the order on purpose

In `src/app.ts`, move the line `app.use(express.json());` to *below* the line `app.use("/api/v1/tasks", tasksRouter);`. Save, and create a task with a perfectly valid body:

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST localhost:4000/api/v1/tasks -H "Content-Type: application/json" -d '{"title":"Learn Express","status":"todo"}'
```

*You should see:*

```text
{"id":"d3a1c7b5-dea6-4ce1-aa92-e6858fb36f4f","createdAt":"2026-10-12T12:52:29.558Z","updatedAt":"2026-10-12T12:52:29.558Z"}
HTTP 201
```

The request reached the route handler before `express.json()` had read the body, so `req.body` was `undefined` and the task has no title. Nothing crashed, and nothing told you. That is the kind of bug that order causes. Put the line back where it was.

**Checkpoint 3**

- [ ] Every request prints one log line, and the response has an `X-Request-Id` header with the same id.
- [ ] You broke the order, saw the task with no title, and put the line back.
- [ ] You can say what `next()` does, and why middleware order matters.

```bash
git add .
git commit -m "feat: add request id, logging and cors middleware"
git push
```

## 4. Errors: AppError and the central handler (50 min)

### 4.1 One error shape for everything

The problem from sections 1 and 2: errors come back in different shapes, one is HTML, and a `500` could even leak your code. A client should only have to understand **one** error format. This is the format for the whole course. Every error, from every endpoint, looks like this:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [{ "path": "title", "message": "Required" }],
    "requestId": "5e334c43-23da-46ca-aa9f-a0361f870505"
  }
}
```

`code` is a stable, machine-readable name (a client can `switch` on it), `message` is for people, `details` appears only for validation errors, and `requestId` is the id from section 3, so a user can quote it and you can find the log line.

The plan: when something goes wrong, **throw a typed error**. One **central error handler** at the end of the pipeline catches everything and writes the envelope. Handlers stay short, and the format lives in exactly one place.

### 4.2 Operational errors vs programmer errors

- An **operational error** is something that can happen in a correct program: a task that does not exist, a bad request, a duplicate title. You know what to tell the client, so you give each one a class, a status and a code.
- A **programmer error** is a bug: reading a property of `undefined`, a typo. You do not know what went wrong, and the client must not see the details. The handler answers `500` with a generic message, and logs the real error for you.

Create `src/errors.ts`:

```ts
export interface ErrorDetail {
  path: string;
  message: string;
}

// An error we expected and know how to describe to the client
export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ErrorDetail[] | undefined;

  constructor(status: number, code: string, message: string, details?: ErrorDetail[]) {
    super(message);
    this.name = new.target.name;
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(400, "BAD_REQUEST", message);
  }
}

export class ValidationError extends AppError {
  constructor(details: ErrorDetail[]) {
    super(400, "VALIDATION_ERROR", "Request validation failed", details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(404, "NOT_FOUND", message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(409, "CONFLICT", message);
  }
}
```

`AppError` carries a status, a code and optional details, and each subclass fixes the status and code. This module has `erasableSyntaxOnly` on (M04), so the fields are declared and assigned by hand and not with constructor parameter properties.

Create `src/middleware/errors.ts`:

```ts
import type { ErrorRequestHandler, RequestHandler } from "express";
import { AppError, NotFoundError } from "../errors.ts";

// Runs only when no route matched
export const notFound: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
};

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

  if (error instanceof AppError) {
    ({ status, code, message, details } = error);
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

- **`notFound`** runs only if no route answered. It does not answer itself: it calls `next(new NotFoundError(...))`.
- **`errorHandler`** has **four** parameters. That is how Express knows it is an error handler, so keep all four even though `_next` is unused here. It turns an `AppError` into the envelope, handles the invalid-JSON error that `express.json()` reports, and treats everything else as a bug: log it, and send a generic `500`.
- `res.headersSent` guards the case where a response has already started, which is the one case Express wants you to pass the error on.

Now register them. They go at the **end**, after all the routes. Replace `src/app.ts`:

```ts
import cors from "cors";
import express from "express";
import { errorHandler, notFound } from "./middleware/errors.ts";
import { requestLogger } from "./middleware/logger.ts";
import { requestId } from "./middleware/request-id.ts";
import { tasksRouter } from "./routes/tasks.ts";

// Build the app and export it. It never calls listen: server.ts does that.
export const app = express();

// Order matters: each request passes through these from top to bottom
app.use(requestId);
app.use(requestLogger);
app.use(cors());
app.use(express.json());

app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/v1/tasks", tasksRouter);

app.use(notFound);
app.use(errorHandler);
```

And replace the not-found answers in `src/routes/tasks.ts` with thrown errors. Replace the whole file:

```ts
import { Router } from "express";
import type { Request, Response } from "express";
import type { CreateTaskInput, Task, UpdateTaskInput } from "../domain/task.ts";
import { NotFoundError } from "../errors.ts";
import * as store from "../store/tasks.ts";

export const tasksRouter = Router();

// Request<Params, ResBody, ReqBody, Query>
tasksRouter.get("/", async (_req: Request, res: Response<Task[]>) => {
  res.json(await store.listTasks());
});

tasksRouter.post("/", async (req: Request<{}, Task, CreateTaskInput>, res: Response<Task>) => {
  const task = await store.createTask(req.body);
  res.status(201).json(task);
});

tasksRouter.get("/:id", async (req: Request<{ id: string }>, res: Response<Task>) => {
  const task = await store.getTask(req.params.id);
  if (!task) throw new NotFoundError(`Task ${req.params.id} not found`);
  res.json(task);
});

tasksRouter.patch("/:id", async (req: Request<{ id: string }, Task, UpdateTaskInput>, res: Response<Task>) => {
  const task = await store.updateTask(req.params.id, req.body);
  if (!task) throw new NotFoundError(`Task ${req.params.id} not found`);
  res.json(task);
});

tasksRouter.delete("/:id", async (req: Request<{ id: string }>, res: Response) => {
  if (!(await store.deleteTask(req.params.id))) {
    throw new NotFoundError(`Task ${req.params.id} not found`);
  }
  res.sendStatus(204);
});
```

The handlers got shorter: no `res.status(404).json(...)`, no early return. They `throw`, and Express forwards it, because async handlers are handled by Express 5.

### 4.3 See it work

```bash
curl -s -w "\nHTTP %{http_code}\n" localhost:4000/api/v1/nope
curl -s -w "\nHTTP %{http_code}\n" localhost:4000/api/v1/tasks/abc
curl -s -w "\nHTTP %{http_code}\n" -X POST localhost:4000/api/v1/tasks -H "Content-Type: application/json" -d '{oops'
curl -s -w "\nHTTP %{http_code}\n" -H "X-Request-Id: my-trace-1" localhost:4000/api/v1/nope
```

*You should see:*

```text
{"error":{"code":"NOT_FOUND","message":"Route GET /api/v1/nope not found","requestId":"bc9d7817-d447-42f8-b6d7-0f94906393e1"}}
HTTP 404
{"error":{"code":"NOT_FOUND","message":"Task abc not found","requestId":"c3637ec4-52a0-4889-89a1-157c7f2712c0"}}
HTTP 404
{"error":{"code":"BAD_REQUEST","message":"Request body is not valid JSON","requestId":"c3a16c1e-2f6a-4ace-8b11-a7a29d12f20a"}}
HTTP 400
{"error":{"code":"NOT_FOUND","message":"Route GET /api/v1/nope not found","requestId":"my-trace-1"}}
HTTP 404
```

The last call sent its own request id, and the middleware used it.

### 4.4 A programmer error

Prove that a bug never leaks. Add a temporary route to `src/app.ts`, **above** `app.use(notFound);`:

```ts
app.get("/api/v1/boom", async () => {
  throw new Error("boom");
});
```

```bash
curl -s -w "\nHTTP %{http_code}\n" localhost:4000/api/v1/boom
```

*You should see:*

```text
{"error":{"code":"INTERNAL_ERROR","message":"Internal server error","requestId":"fd0bd493-d9c8-4aea-a025-ed0e6b7e0cd7"}}
HTTP 500
```

In the **server** terminal you will see the real error, `Error: boom` and a stack trace, which is where you read bugs. The client got no stack trace and no message from your code.

Delete the `/boom` route again.

**Checkpoint 4**

- [ ] Unknown routes, unknown tasks and invalid JSON all return the envelope, with a real `requestId`.
- [ ] `/boom` gave a generic `500`, and the real error appeared only in the server terminal.
- [ ] You can say the difference between an operational error and a programmer error.
- [ ] You can say what makes a function an Express error handler.

```bash
git add .
git commit -m "feat: add apperror classes and central error handler"
git push
```

## 5. Hand-written validation (30 min)

Section 2 showed the API accepting a task with no title. You now add checks, by hand. Libraries do this better, and M08 replaces your code with Zod. Writing it yourself first is on purpose: when you see how much code it takes, and how easy it is to miss a case, the library earns its place.

The rules for v1:

- `title`: required on create, a non-empty string, at most 100 characters.
- `description`: optional, a string.
- `status`: optional on create (it defaults to `"todo"`), and one of `todo`, `in_progress`, `done`.
- `PATCH` needs at least one of these fields.
- `GET /tasks?status=...` must use a valid status.
- Creating a task whose title already exists (ignoring case) is a conflict, `409`.

Validation failures use `400`, the code `VALIDATION_ERROR`, and a `details` list that names each bad field. Create `src/validation.ts`:

```ts
import { taskStatuses } from "./domain/task.ts";
import type { CreateTaskInput, TaskStatus, UpdateTaskInput } from "./domain/task.ts";
import { ValidationError } from "./errors.ts";
import type { ErrorDetail } from "./errors.ts";

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

export function validateCreateTask(body: unknown): CreateTaskInput {
  const data = asObject(body);
  const details: ErrorDetail[] = [];
  if (!("title" in data)) details.push({ path: "title", message: "Required" });
  checkFields(data, details);
  if (details.length > 0) throw new ValidationError(details);

  const input: CreateTaskInput = {
    title: (data.title as string).trim(),
    status: isStatus(data.status) ? data.status : "todo",
  };
  if (typeof data.description === "string") input.description = data.description;
  return input;
}

export function validateUpdateTask(body: unknown): UpdateTaskInput {
  const data = asObject(body);
  const details: ErrorDetail[] = [];
  checkFields(data, details);
  const hasAny = ["title", "description", "status"].some((key) => key in data);
  if (!hasAny && details.length === 0) {
    details.push({ path: "body", message: "Send at least one of: title, description, status" });
  }
  if (details.length > 0) throw new ValidationError(details);

  const changes: UpdateTaskInput = {};
  if (typeof data.title === "string") changes.title = data.title.trim();
  if (typeof data.description === "string") changes.description = data.description;
  if (isStatus(data.status)) changes.status = data.status;
  return changes;
}

export function validateStatusQuery(value: unknown): TaskStatus | undefined {
  if (value === undefined) return undefined;
  if (!isStatus(value)) {
    throw new ValidationError([{ path: "status", message: `Must be one of: ${taskStatuses.join(", ")}` }]);
  }
  return value;
}
```

Notes on the code:

- Each function takes `body: unknown`, because `req.body` could be anything, or `undefined` (section 2.4). It checks first, and only then returns a properly typed value.
- It collects **all** the problems into `details` and throws once, so a client sees every mistake in one response.
- `isStatus` is a type guard (M04). `taskStatuses` is the list you made in M04, so the allowed values live in one place.

The conflict check needs the store to find a task by title. Replace `src/store/tasks.ts` (it adds `findTaskByTitle`):

```ts
import { randomUUID } from "node:crypto";
import type { CreateTaskInput, Task, TaskStatus, UpdateTaskInput } from "../domain/task.ts";

const tasks = new Map<string, Task>();

// These are async on purpose: M07 swaps this file for a database, and the callers will not change
export async function listTasks(status?: TaskStatus): Promise<Task[]> {
  const all = [...tasks.values()];
  return status ? all.filter((task) => task.status === status) : all;
}

export async function getTask(id: string): Promise<Task | undefined> {
  return tasks.get(id);
}

export async function findTaskByTitle(title: string): Promise<Task | undefined> {
  return [...tasks.values()].find((task) => task.title.toLowerCase() === title.toLowerCase());
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const now = new Date();
  const task: Task = { id: randomUUID(), ...input, createdAt: now, updatedAt: now };
  tasks.set(task.id, task);
  return task;
}

export async function updateTask(id: string, changes: UpdateTaskInput): Promise<Task | undefined> {
  const existing = tasks.get(id);
  if (!existing) return undefined;
  const updated: Task = { ...existing, ...changes, updatedAt: new Date() };
  tasks.set(id, updated);
  return updated;
}

export async function deleteTask(id: string): Promise<boolean> {
  return tasks.delete(id);
}
```

And replace `src/routes/tasks.ts` with the final version, which validates and checks for conflicts:

```ts
import { Router } from "express";
import type { Request, Response } from "express";
import type { Task } from "../domain/task.ts";
import { ConflictError, NotFoundError } from "../errors.ts";
import * as store from "../store/tasks.ts";
import { validateCreateTask, validateStatusQuery, validateUpdateTask } from "../validation.ts";

export const tasksRouter = Router();

// Request<Params, ResBody, ReqBody, Query>
tasksRouter.get("/", async (req: Request<{}, Task[], unknown, { status?: string }>, res: Response<Task[]>) => {
  const status = validateStatusQuery(req.query.status);
  res.json(await store.listTasks(status));
});

tasksRouter.post("/", async (req: Request<{}, Task, unknown>, res: Response<Task>) => {
  const input = validateCreateTask(req.body);
  if (await store.findTaskByTitle(input.title)) {
    throw new ConflictError(`A task titled "${input.title}" already exists`);
  }
  res.status(201).json(await store.createTask(input));
});

tasksRouter.get("/:id", async (req: Request<{ id: string }>, res: Response<Task>) => {
  const task = await store.getTask(req.params.id);
  if (!task) throw new NotFoundError(`Task ${req.params.id} not found`);
  res.json(task);
});

tasksRouter.patch("/:id", async (req: Request<{ id: string }, Task, unknown>, res: Response<Task>) => {
  const changes = validateUpdateTask(req.body);
  const task = await store.updateTask(req.params.id, changes);
  if (!task) throw new NotFoundError(`Task ${req.params.id} not found`);
  res.json(task);
});

tasksRouter.delete("/:id", async (req: Request<{ id: string }>, res: Response) => {
  if (!(await store.deleteTask(req.params.id))) {
    throw new NotFoundError(`Task ${req.params.id} not found`);
  }
  res.sendStatus(204);
});
```

Try the good and the bad:

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST localhost:4000/api/v1/tasks -H "Content-Type: application/json" -d '{"title":"Write M05"}'
curl -s -w "\nHTTP %{http_code}\n" -X POST localhost:4000/api/v1/tasks -H "Content-Type: application/json" -d '{"title":"write m05"}'
curl -s -w "\nHTTP %{http_code}\n" -X POST localhost:4000/api/v1/tasks -H "Content-Type: application/json" -d '{"title":"","status":"archived"}'
curl -s -w "\nHTTP %{http_code}\n" -X POST localhost:4000/api/v1/tasks
curl -s -w "\nHTTP %{http_code}\n" "localhost:4000/api/v1/tasks?status=nope"
```

*You should see:*

```text
{"id":"37644e9f-c789-4e36-90a9-cdb0b9a23e8e","title":"Write M05","status":"todo","createdAt":"2026-10-12T12:47:38.392Z","updatedAt":"2026-10-12T12:47:38.392Z"}
HTTP 201
{"error":{"code":"CONFLICT","message":"A task titled \"write m05\" already exists","requestId":"b4a34d35-8177-4d17-a42d-c4c3d2a8b7c5"}}
HTTP 409
{"error":{"code":"VALIDATION_ERROR","message":"Request validation failed","details":[{"path":"title","message":"Must be a non-empty string"},{"path":"status","message":"Must be one of: todo, in_progress, done"}],"requestId":"53c61d55-921a-4ab2-8fab-9f7091cfb436"}}
HTTP 400
{"error":{"code":"VALIDATION_ERROR","message":"Request validation failed","details":[{"path":"body","message":"Must be a JSON object"}],"requestId":"cb4e2876-28c8-4439-9475-d06016292b37"}}
HTTP 400
{"error":{"code":"VALIDATION_ERROR","message":"Request validation failed","details":[{"path":"status","message":"Must be one of: todo, in_progress, done"}],"requestId":"c629c187-43e0-44c8-924d-a241d4bd2675"}}
HTTP 400
```

Also try an update with nothing to change, and a status filter:

```bash
curl -s -w "\nHTTP %{http_code}\n" -X PATCH localhost:4000/api/v1/tasks/<id> -H "Content-Type: application/json" -d '{}'
curl -s -w "\nHTTP %{http_code}\n" "localhost:4000/api/v1/tasks?status=done"
```

The first returns `VALIDATION_ERROR` with `"Send at least one of: title, description, status"`, and the second returns `[]` with `HTTP 200` (when no task is done). Every error carries the same envelope, whichever file threw it.

**Checkpoint 5**

- [ ] A valid `POST` returns `201`, and a bad one returns `400` with `details`.
- [ ] A duplicate title returns `409` with `CONFLICT`.
- [ ] `npm run typecheck` is clean.
- [ ] You can say why validation takes `unknown` and not `CreateTaskInput`.

```bash
git add .
git commit -m "feat: add task validation and conflict check"
git push
```

## 6. Config, health and graceful shutdown (25 min)

You already have the configuration (`PORT` from the environment, loaded from `.env`) and the health endpoint (`GET /api/v1/health`, which a hosting service or a load balancer calls to ask "are you alive?"). What is missing is **graceful shutdown**.

When a hosting service stops your app, it sends the process a `SIGTERM` signal (you met signals in M03). If you do nothing, the process dies on the spot, in the middle of any request. A graceful shutdown stops accepting new connections, lets the requests in progress finish, and then exits. Replace `src/server.ts`:

```ts
import { app } from "./app.ts";

const PORT = Number(process.env.PORT ?? 3000);

const server = app.listen(PORT, () => {
  console.log(`Task API listening on http://localhost:${PORT}`);
});

// Stop cleanly: finish the requests in progress, then exit
function shutdown(signal: string): void {
  console.log(`${signal} received, closing`);
  server.close(() => process.exit(0));
  // If a connection will not close, give up after 10 seconds
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
```

- `app.listen` returns the `server`. `server.close(callback)` stops new connections and calls back when the open ones are done.
- The `setTimeout(...).unref()` is a safety net: if a connection never closes, the process exits with code `1` after 10 seconds. `unref()` means this timer alone does not keep the process alive.
- `SIGINT` is `Ctrl+C`, and `SIGTERM` is what servers send.

Stop the running `npm run dev` with `Ctrl+C`, and start it again:

```bash
npm run dev
```

Press `Ctrl+C` in that terminal.

*You should see:*

```text
Task API listening on http://localhost:4000
SIGINT received, closing
```

To try `SIGTERM` on macOS and Linux, start the server with `npm start`, and in a second terminal run:

```bash
pkill -TERM -f src/server.ts
```

*You should see:*

```text
Task API listening on http://localhost:4000
SIGTERM received, closing
```

Windows has no `SIGTERM` in the same way, so on Windows use `Ctrl+C` only. This command was run on Linux. It is untested on macOS.

**Checkpoint 6**

- [ ] `Ctrl+C` prints `SIGINT received, closing` and the server stops.
- [ ] You can say what graceful shutdown protects against.

```bash
git add .
git commit -m "feat: add graceful shutdown"
git push
```

## 7. Bruno collection (45 min)

You have been testing with `curl`, one command at a time. **Bruno** is a free API client that stores your requests as plain text files, so you can commit them with your code, and run them all at once with assertions. A request file says what to send and what the answer must look like.

### 7.1 Install

Install the Bruno app from [usebruno.com/downloads](https://www.usebruno.com/downloads) (Windows, macOS and Linux installers), or with a package manager if you prefer one. The app is what you use to explore and edit. To run a collection from the terminal, which is how this page checks your work, install the command-line tool in your project:

```bash
npm install -D @usebruno/cli
npm pkg set scripts.bruno="cd bruno && bru run --env local"
```

The CLI is large, and it may print an install-scripts warning, as `tsx` did in M04. It works anyway.

### 7.2 Create the collection

A Bruno collection is a folder. Create a `bruno/` folder in the repo root with these files. The first says it is a collection:

```json
{
  "version": "1",
  "name": "Task API",
  "type": "collection",
  "ignore": [
    "node_modules",
    ".git"
  ]
}
```

The environment holds values that change between machines (here, the address of your server), so requests use `{{baseUrl}}` and not a fixed address. Create `bruno/environments/local.bru`:

```text
vars {
  baseUrl: http://localhost:4000/api/v1
}
```

If your `PORT` is not `4000`, change it here.

Now the requests. Each is one `.bru` file. The `seq` number sets the order they run in. Here is the first. A request has a method and URL, and an `assert` block that lists what the response must satisfy:

```text
meta {
  name: Health
  type: http
  seq: 1
}

get {
  url: {{baseUrl}}/health
  body: none
  auth: none
}

assert {
  res.status: eq 200
  res.body.status: eq ok
}
```

The second creates a task, and saves its id in a variable for the later requests (`vars:post-response`):

```text
meta {
  name: Create task
  type: http
  seq: 2
}

post {
  url: {{baseUrl}}/tasks
  body: json
  auth: none
}

body:json {
  {"title": "Write the Bruno collection"}
}

assert {
  res.status: eq 201
  res.body.title: eq Write the Bruno collection
  res.body.status: eq todo
}

vars:post-response {
  taskId: res.body.id
}
```

This one is an error path. Notice that it asserts the **envelope**: the code, and that `requestId` is a string:

```text
meta {
  name: Error: task not found
  type: http
  seq: 8
}

get {
  url: {{baseUrl}}/tasks/{{taskId}}
  body: none
  auth: none
}

assert {
  res.status: eq 404
  res.body.error.code: eq NOT_FOUND
  res.body.error.requestId: isString
}
```

The other twelve follow the same pattern. This table is the whole list. Create each file with the name shown, and copy its contents from the section below the table.

| File | What it checks |
| --- | --- |
| `01-health.bru` | `GET /health` is `200` |
| `02-create-task.bru` | `POST /tasks` is `201`, status `todo`, saves `taskId` |
| `03-list-tasks.bru` | `GET /tasks` is `200` and includes the new task |
| `04-get-task.bru` | `GET /tasks/{{taskId}}` is `200` |
| `05-update-task.bru` | `PATCH` to `in_progress` is `200` |
| `06-filter-by-status.bru` | `?status=in_progress` is `200` |
| `07-delete-task.bru` | `DELETE` is `204` |
| `08-error-task-not-found.bru` | the deleted task is `404` `NOT_FOUND` |
| `09-error-validation.bru` | a bad body is `400` `VALIDATION_ERROR` with `details[0].path` `title` |
| `10-error-invalid-json.bru` | broken JSON is `400` `BAD_REQUEST` |
| `11-duplicate-seed.bru` | creates "Duplicate me" (`201`), saves `dupId` |
| `12-error-conflict.bru` | the same title in other letters is `409` `CONFLICT` |
| `13-duplicate-cleanup.bru` | deletes that task (`204`), so you can run it again |
| `14-error-bad-status-filter.bru` | `?status=nope` is `400` `VALIDATION_ERROR` |
| `15-error-unknown-route.bru` | `/nope` is `404` `NOT_FOUND` |

**The remaining request files (03 to 07, 09 to 15)**
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
  res.body: isArray
}

tests {
  test("the new task is in the list", function () {
    expect(res.body.some((task) => task.id === bru.getVar("taskId"))).to.equal(true);
  });
}
```

```text
meta {
  name: Get task
  type: http
  seq: 4
}

get {
  url: {{baseUrl}}/tasks/{{taskId}}
  body: none
  auth: none
}

assert {
  res.status: eq 200
  res.body.id: eq {{taskId}}
}
```

```text
meta {
  name: Update task
  type: http
  seq: 5
}

patch {
  url: {{baseUrl}}/tasks/{{taskId}}
  body: json
  auth: none
}

body:json {
  {"status": "in_progress"}
}

assert {
  res.status: eq 200
  res.body.status: eq in_progress
}
```

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
  res.body: isArray
}
```

```text
meta {
  name: Delete task
  type: http
  seq: 7
}

delete {
  url: {{baseUrl}}/tasks/{{taskId}}
  body: none
  auth: none
}

assert {
  res.status: eq 204
}
```

```text
meta {
  name: Error: validation
  type: http
  seq: 9
}

post {
  url: {{baseUrl}}/tasks
  body: json
  auth: none
}

body:json {
  {"title": "", "status": "archived"}
}

assert {
  res.status: eq 400
  res.body.error.code: eq VALIDATION_ERROR
  res.body.error.requestId: isString
  res.body.error.details[0].path: eq title
}
```

```text
meta {
  name: Error: invalid JSON
  type: http
  seq: 10
}

post {
  url: {{baseUrl}}/tasks
  body: json
  auth: none
}

body:json {
  {oops
}

assert {
  res.status: eq 400
  res.body.error.code: eq BAD_REQUEST
  res.body.error.requestId: isString
}
```

```text
meta {
  name: Duplicate: create first
  type: http
  seq: 11
}

post {
  url: {{baseUrl}}/tasks
  body: json
  auth: none
}

body:json {
  {"title": "Duplicate me"}
}

assert {
  res.status: eq 201
}

vars:post-response {
  dupId: res.body.id
}
```

```text
meta {
  name: Error: conflict
  type: http
  seq: 12
}

post {
  url: {{baseUrl}}/tasks
  body: json
  auth: none
}

body:json {
  {"title": "duplicate ME"}
}

assert {
  res.status: eq 409
  res.body.error.code: eq CONFLICT
  res.body.error.requestId: isString
}
```

```text
meta {
  name: Duplicate: clean up
  type: http
  seq: 13
}

delete {
  url: {{baseUrl}}/tasks/{{dupId}}
  body: none
  auth: none
}

assert {
  res.status: eq 204
}
```

```text
meta {
  name: Error: bad status filter
  type: http
  seq: 14
}

get {
  url: {{baseUrl}}/tasks?status=nope
  body: none
  auth: none
}

assert {
  res.status: eq 400
  res.body.error.code: eq VALIDATION_ERROR
  res.body.error.requestId: isString
}
```

```text
meta {
  name: Error: unknown route
  type: http
  seq: 15
}

get {
  url: {{baseUrl}}/nope
  body: none
  auth: none
}

assert {
  res.status: eq 404
  res.body.error.code: eq NOT_FOUND
  res.body.error.requestId: isString
}
```

### 7.3 Run it

Make sure the server is running in one terminal (`npm run dev`), and run the collection in another:

```bash
npm run bruno
```

*You should see:*

```text
> js-training@1.0.0 bruno
> cd bruno && bru run --env local

01-health (200 OK) - 13 ms
Assertions
   ✓ res.status: eq 200
   ✓ res.body.status: eq ok
02-create-task (201 Created) - 11 ms
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
│ Duration (ms) │      280       │
└───────────────┴────────────────┘
```

The timings are yours. The middle of the output lists every assertion, and is left out here.

To use the app instead: open Bruno, choose **Open Collection**, pick your `bruno` folder, choose the `local` environment at the top right, and use the **Run** option on the collection. The app and the CLI read the same files. (The app steps are untested here: this page was checked with the CLI.)

### 7.4 See a failure

A test that cannot fail proves nothing. In `src/errors.ts`, change `"NOT_FOUND"` to `"MISSING"` inside `NotFoundError`, save, and run `npm run bruno` again.

*You should see:*

```text
08-error-task-not-found (404 Not Found) - 2 ms
Assertions
   ✓ res.status: eq 404
   ✕ res.body.error.code: eq NOT_FOUND
      expected 'MISSING' to equal 'NOT_FOUND'
   ✓ res.body.error.requestId: isString
```

Two requests fail (`08` and `15`), the summary says `✗ FAIL`, and the command exits with code `1`, which is what lets a script or CI notice. Change `"MISSING"` back to `"NOT_FOUND"`.

Run it once more to confirm it passes. The server keeps its tasks in memory, so if a run stopped halfway and left "Duplicate me" behind, restart the server before running again.

**Checkpoint 7**

- [ ] `npm run bruno` shows `✓ PASS`, with 15 requests and 35 assertions.
- [ ] You broke an error code on purpose, saw a failed assertion, and fixed it.
- [ ] The `bruno/` folder is committed. It is plain text, and it is part of the project.

```bash
git add .
git commit -m "test: add bruno collection for the task api"
git push
```

## Check your understanding (10 min)

Answer each one in your head, then open it to compare.

**Why does Express 5 not need a `try/catch` around an `async` handler?**
In Express 5, if a handler returns a promise and it rejects (or the handler throws), Express catches that and passes the error to the error-handling middleware by itself, as if you had called `next(error)`. In Express 4 you had to catch the error and call `next(error)` yourself, or the request would hang and the error would be lost.

**Why are `app.ts` and `server.ts` separate files?**
`app.ts` builds and exports the app, and `server.ts` is the only file that opens a port. A test (M09) can import `app` and send it requests without starting a real server or fighting over a port. If importing the app started listening, every test file would start a server.

**What went wrong when `express.json()` was registered after the routes?**
Middleware runs in the order it is registered. The request reached the route handler before the body had been read, so `req.body` was `undefined`, and the handler created a task with no title. Nothing crashed. Order bugs are silent, so keep the setup in a deliberate order: id and logging first, body parsing, routes, then the 404 handler and the error handler last.

**What is the difference between an operational error and a programmer error, and how does the handler treat each?**
An operational error can happen in a correct program (not found, invalid input, a conflict). It is an `AppError` with a status and a code, and the handler sends exactly that in the envelope. A programmer error is a bug. The handler logs it for you, and sends a generic `500` so no internal detail leaks to the client.

**What is the difference between `next()` and `next(error)`?**
`next()` passes the request to the next middleware or route. `next(error)` skips the rest of the normal pipeline and goes to the error-handling middleware (the one with four parameters). In Express 5 a thrown error or a rejected promise does the same as `next(error)`.

## Troubleshooting

**`EADDRINUSE: address already in use :::4000`**
Another process, often an earlier run of the server, is using the port. Stop it with `Ctrl+C`, or change `PORT` in `.env` (and `baseUrl` in `bruno/environments/local.bru`). To find the process on macOS and Linux, run `lsof -i :4000`, then `kill <pid>`. On Windows, run `netstat -ano | findstr :4000`, then `taskkill /PID <pid> /F`.

**`curl` shows `Connection refused` or `Could not connect to server`**
The server is not running, or it is on another port. Check the first terminal prints `Task API listening on http://localhost:4000` (or your `PORT`). A different `PORT` means a different address in every command.

**Valid JSON is rejected as `Must be a JSON object`, or a task has no title**
`req.body` is `undefined`, so the body was not parsed. Check that `app.use(express.json())` comes **before** the routes in `app.ts`, and that your `curl` command has `-H "Content-Type: application/json"`.

**`Missing parameter name at index ...` when the server starts**
A route path uses the old Express 4 wildcard `*`. Express 5 needs a name: `/files/*splat`. Check `app.ts` and the routes for a stray `*`.

**`TS2345` or `TS2769` on a route handler**
The handler's types do not fit `Request<Params, ResBody, ReqBody, Query>` or `Response<Body>`. Check the order of the four `Request` parameters (params first, then response body, request body, query), and that `res.json(...)` is given the type you declared in `Response<...>`. An error handler needs all four parameters.

**`Cannot find module '../errors.ts'` or a `.ts` import error**
Relative imports end in `.ts` here, as in M04 (`import { x } from "./file.ts"`). Check the path and the spelling, and that the file is where the import says.

**`npm run dev` does not restart when you save**
`tsx watch` only watches files your program imports. Check you saved the file, and that the file is imported from `server.ts` (directly or through `app.ts`). Stop it and start it again.

**`curl` shows a quoting error or `{"error":{"code":"BAD_REQUEST"...}}` for JSON that looks right**
The terminal changed your quotes. Use single quotes around the JSON in Git Bash, macOS and Linux (`-d '{"title":"x"}'`). Windows PowerShell and cmd need different escaping, so use Git Bash.

**The browser says a request was blocked by CORS**
Check `app.use(cors())` is in `app.ts` **above** the routes. With no options it allows every origin. If you restrict it later, the origin of your web page must be on the list.

**`npm run bruno` says `bru: not found`, or cannot find the collection**
Run `npm install -D @usebruno/cli` from the repo root, and use `npm run bruno` (it changes into `bruno/` first). If you run `bru` yourself, run it from inside the `bruno` folder.

**Bruno shows `ECONNREFUSED`**
The server is not running, or `baseUrl` in `bruno/environments/local.bru` has the wrong port. Start `npm run dev` in another terminal, and check the port matches your `.env`.

**`Create task` or `Error: conflict` fails on the second run**
The server keeps tasks in memory. A run that stopped halfway can leave a task behind, so the next run gets a `409`. Stop the server and start it again, and run `npm run bruno`.

## You're done when

- [ ] `npm run typecheck` is clean.
- [ ] All five task endpoints work, and `GET /api/v1/health` answers `200`.
- [ ] `app.ts` builds and exports the app, and only `server.ts` calls `listen`, and stops cleanly on `SIGTERM` and `Ctrl+C`.
- [ ] Every error path (unknown route, unknown task, invalid JSON, validation, conflict, a bug) returns the exact error envelope with a real `requestId`.
- [ ] `npm run bruno` passes: 15 requests and 35 assertions, and the `bruno/` folder is committed.
- [ ] You can explain why Express 5 does not need a `try/catch` around an `async` handler.
- [ ] Everything is committed and pushed to your repo.

Keep `src/app.ts`, `src/routes/tasks.ts`, `src/errors.ts` and `src/store/tasks.ts` as they are. M07 replaces the store with a database, M08 replaces the validation with Zod, and M09 tests the app you exported.

Previous: [M04, TypeScript Basics & TypeScript on Node.js](../m04-typescript-on-node/index.md). Next: M06, SQL Fundamentals with SQLite (coming soon).
