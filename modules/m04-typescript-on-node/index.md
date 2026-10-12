# M04 — TypeScript Basics & TypeScript on Node.js

**Module M04 · Week 2 · Days 1-2 · about 3 hours**

Learn the TypeScript you will use for the rest of the course, set up a strict TypeScript project on Node.js, and port your Async toolkit to TypeScript as an exercise that the compiler marks for you.

## Overview & time plan

**Builds on:** M02 and M03. You need the `node-js-training` repo, Node.js 24, and the M02 Async toolkit in `src/toolkit/`. Everything you write here goes into that same repo, on `main`, using the add, commit and push steps you know. (The word "module" on this page means the course lessons, M01 to M10, unless it says JavaScript module.)

JavaScript lets you pass a number where a string is expected, and finds out when the program runs. **TypeScript** is JavaScript with **types**. A tool called the compiler reads your code *before* it runs and reports mistakes like that one. From this module on, the whole course is TypeScript: the Express API, Prisma, Zod and the tests.

You will:

- set up a strict TypeScript project in your repo, with a `typecheck` command;
- learn the core of the type system, in small files you run and break on purpose;
- build the **Task domain types** (`Task`, `CreateTaskInput`, `UpdateTaskInput`, `Result<T, E>`) that the Task API uses from M05;
- **port your Async toolkit to TypeScript yourself**, as an exercise. The compiler tells you when you are right, and a separate [solution page](solution.md) explains the answer if you get stuck.

1. Why TypeScript, and set up the project: 25 min
2. Core types: 30 min
3. Functions, generics and narrowing: 35 min
4. Utility types and the Task domain: 30 min
5. Exercise: port the Async toolkit: 40 min
6. Running TypeScript on Node.js: 15 min
7. Check your understanding: 5 min

This page moves quickly. In sections 2 to 4 you may paste the practice files, because the learning is in running them and breaking them on purpose. In section 5, type the code yourself. Run every command, and compare with the *You should see* box. Line numbers in compiler errors will differ from the examples, because your files are your own. Commands are written for Git Bash on Windows, and macOS and Linux Terminal. If anything else differs, check [Troubleshooting](#troubleshooting).

## 1. Why TypeScript, and set up the project (25 min)

### 1.1 What types give you

A type is a rule about what a value can be: `string`, `number`, a list of tasks, an object with a `title`. TypeScript checks those rules while you type, so you find mistakes in your editor and not in front of a user. Three ideas to hold on to:

- **Types disappear at runtime.** TypeScript checks your code, then the types are removed and plain JavaScript runs. A type never validates data that arrives while the program runs (that is why M08 adds Zod).
- **Inference vs annotation.** TypeScript works out most types itself (*inference*). You write a type yourself (an *annotation*) where it cannot, mostly on function parameters and on the shapes you design.
- **Structural typing.** A value fits a type if it has the right *shape*. It does not need to be created "as" that type.

### 1.2 Install and configure

From the repo root:

```bash
npm install -D typescript@7 tsx @types/node@24
```

All three are dev dependencies (you met `-D` in M03):

| Package | What it is |
| --- | --- |
| `typescript` | The compiler. Version 7 is the new native compiler, and it is much faster than 6. Its command is `tsc`. |
| `tsx` | Runs `.ts` files directly. It is this course's runner. It removes the types and does **not** check them. |
| `@types/node` | The types for Node.js itself (`node:fs`, `process`, and so on). Use the major version of your Node.js: 24. |

> **A warning about install scripts.** Depending on your npm version, the install may print a warning that `esbuild` (which `tsx` uses) has an install script that is not yet approved. That is the lifecycle-script idea from M03. `tsx` works anyway, so you can ignore it here.

Create `tsconfig.json` in the repo root. It tells `tsc` how strictly to check, and which files to check.

```json
{
  "compilerOptions": {
    "target": "es2023",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "verbatimModuleSyntax": true,
    "erasableSyntaxOnly": true,
    "rewriteRelativeImportExtensions": true,
    "noEmit": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["src"]
}
```

What the options do:

| Option | What it does and why |
| --- | --- |
| `target` | Which JavaScript version the code is checked against. `es2023` is fine for Node.js 24. |
| `module`, `moduleResolution` | `nodenext` makes TypeScript follow Node.js's own rules for ES modules, so what passes the check also runs. |
| `strict` | Turns on the strict family of checks (no hidden `any`, no `null` surprises). Always on for this course. |
| `noUncheckedIndexedAccess` | `list[0]` has type `T \| undefined`, because the item may not exist. It catches real bugs. |
| `verbatimModuleSyntax` | You must write `import type` for type-only imports. This keeps imports honest when types are removed. |
| `erasableSyntaxOnly` | Only allows TypeScript that can be removed cleanly, which is what Node.js's built-in type stripping can run (section 6). It rules out `enum`. |
| `rewriteRelativeImportExtensions` | Lets you write `import ... from "./file.ts"`, with the real file extension. |
| `noEmit` | `tsc` only checks. It writes no files, because `tsx` runs the code. |
| `skipLibCheck` | Do not re-check other people's `.d.ts` files. Faster, and their errors are not yours to fix. |
| `types` | Which `@types/*` packages to load. TypeScript no longer loads them all by itself, so name `node`. |
| `include` | The folders to check: everything in `src`. |

Add a script to run the checker, then make your first TypeScript file:

```bash
npm pkg set scripts.typecheck="tsc --noEmit"
```

Create `src/labs/types-intro.ts`:

```ts
// Inference: TypeScript works out the type for you
const city = "Manila"; // type "Manila" (a const string is its own literal)
let count = 3; // type number

// Annotation: you write the type, here on a function
function greet(name: string): string {
  return `Hello, ${name}`;
}
console.log(greet(city), count);

// Structural typing: a value fits if it has the right shape
type Named = { name: string };
const user = { name: "Ana", age: 30 };
const named: Named = user; // fine: user has a name
console.log(greet(named.name));
```

The first comment is *inference*: you never wrote `string` and `number`, but TypeScript knows them. `greet(name: string): string` is *annotation*: a parameter must be annotated, and a return type is worth writing. `user` has an extra `age`, yet fits `Named`, because it has a `name`: that is *structural typing*.

Run the check, then run the program:

```bash
npm run typecheck
npx tsx src/labs/types-intro.ts
```

*You should see:*

```text
> js-training@1.0.0 typecheck
> tsc --noEmit

Hello, Manila 3
Hello, Ana
```

`tsc` prints nothing when there are no errors. The first two lines come from npm and show your `package.json` name.

### 1.3 Read your first compiler error

Add a blank line and then one bad line to the end of `types-intro.ts`, and run the check:

```ts
greet(42);
```

```bash
npm run typecheck
```

*You should see:*

```text
src/labs/types-intro.ts(17,7): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
```

Read it in this order: the **file and position** (line 17, column 7), then the **message**, which says what you gave (`number`) and what was expected (`string`). The `TS2345` code is what you search for. Now the important part: `tsx` does *not* check types. Run the broken file:

```bash
npx tsx src/labs/types-intro.ts
```

It runs and prints `Hello, 42`, as if nothing was wrong. So `npm run typecheck` is the step that protects you, and you must run it yourself. Delete the `greet(42);` line (and the blank line before it) and check that `npm run typecheck` is quiet again.

**Checkpoint 1**

- [ ] `npm run typecheck` prints no errors for your `types-intro.ts`.
- [ ] You saw error `TS2345` for `greet(42)`, and the file still ran under `tsx`.
- [ ] You can say what `strict` and `noEmit` are for.

```bash
git add .
git commit -m "chore: add typescript and tsconfig"
git push
```

## 2. Core types (30 min)

Create `src/labs/types-core.ts`:

```ts
// Arrays and tuples
const scores: number[] = [90, 72, 85];
const pair: [string, number] = ["Ana", 30]; // exactly a string, then a number

// Unions and literal types
type Id = string | number;
type Status = "todo" | "in_progress" | "done"; // only these three strings
const status: Status = "todo";

function show(id: Id): string {
  return typeof id === "string" ? id.toUpperCase() : id.toFixed(0);
}
console.log(scores.length, pair[0], status, show("a1"), show(7));

// as const: freeze a value into its exact literal types
const levels = ["low", "medium", "high"] as const;
type Level = (typeof levels)[number]; // "low" | "medium" | "high"
const level: Level = levels[2];
console.log(level);

// type vs interface
interface Point {
  x: number;
  y: number;
  label?: string; // optional
  readonly id: number; // cannot be reassigned
}
const p: Point = { x: 1, y: 2, id: 1 };
console.log(p);

// Intersection: combine two types
type Timestamped = { createdAt: Date };
type Post = { title: string } & Timestamped;
const post: Post = { title: "Hi", createdAt: new Date(0) };
console.log(post.createdAt.toISOString());
```

```bash
npx tsx src/labs/types-core.ts
```

*You should see:*

```text
3 Ana todo A1 7
high
{ x: 1, y: 2, id: 1 }
1970-01-01T00:00:00.000Z
```

What each part teaches:

- **Arrays and tuples.** `number[]` is a list of any length. A *tuple* `[string, number]` has a fixed length and a type for each position.
- **Unions and literal types.** `string | number` means "either". A *literal type* such as `"todo"` is one exact value, so `Status` can only be one of three strings. This is how this course models a set of options, **instead of `enum`** (more on that in section 6).
- **Narrowing.** `typeof id === "string"` inside `show` tells TypeScript which branch has a string, so `.toUpperCase()` is allowed there.
- **`as const`.** It freezes a value into its exact literals, so `levels` is `readonly ["low", "medium", "high"]`, and `(typeof levels)[number]` turns it into a union.
- **Optional and `readonly`.** `label?` may be missing. `readonly id` cannot be reassigned.
- **Intersection.** `A & B` is a value that has everything from both.

Now break it on purpose. Add a blank line and then these three lines to the end of the file, and run `npm run typecheck`:

```ts
const bad: Status = "archived";
p.id = 2;
scores.push("100");
```

*You should see:*

```text
src/labs/types-core.ts(37,7): error TS2322: Type '"archived"' is not assignable to type 'Status'.
src/labs/types-core.ts(38,3): error TS2540: Cannot assign to 'id' because it is a read-only property.
src/labs/types-core.ts(39,13): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
```

Each error is a bug that JavaScript would have let through. Delete the three lines again.

### 2.1 type or interface?

Both describe the shape of an object, and for objects they are almost the same. The differences that matter:

|  | `type` | `interface` |
| --- | --- | --- |
| Object shapes | Yes | Yes |
| Unions, tuples, literals, results of utility types | Yes | No |
| Extend another | `A & B` | `interface B extends A` |
| Same name declared twice | Error | The two are merged |

The rule used in this course: **`interface` for the shape of an object you design** (like `Task`), and **`type` for everything else** (unions, aliases, types built with utility types). Pick one, be consistent, and do not worry beyond that.

**Checkpoint 2**

- [ ] `types-core.ts` printed the output above, and `typecheck` is clean after you removed the three bad lines.
- [ ] You can say what a literal type is and why `"archived"` is rejected.
- [ ] You can say when you would use `interface` and when `type`.

## 3. Functions, generics and narrowing (35 min)

Create `src/labs/types-generics.ts`:

```ts
// Generics: one function, many types. T is filled in from how you call it.
function first<T>(items: T[]): T | undefined {
  return items[0];
}
const n = first([10, 20]); // number | undefined
const s = first(["a", "b"]); // string | undefined
console.log(n, s);

// A constraint limits what T can be
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}
console.log(longest("hello", "hi"), longest([1, 2, 3], [1]));

// A default type, used when T is not given
type Box<T = string> = { value: T };
const box: Box = { value: "text" }; // Box<string>
const numBox: Box<number> = { value: 5 };
console.log(box.value, numBox.value);

// Narrowing: check a value, and TypeScript knows more inside the check
function describe(value: string | number | string[]): string {
  if (typeof value === "string") return `string of ${value.length}`;
  if (Array.isArray(value)) return `list of ${value.length}`;
  return `number ${value.toFixed(1)}`;
}
console.log(describe("abc"), describe(["a", "b"]), describe(2));

// Discriminated union: one field ("kind") tells the shapes apart
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.side ** 2;
    default: {
      const unreachable: never = shape; // errors if a new kind is not handled
      return unreachable;
    }
  }
}
console.log(area({ kind: "square", side: 3 }).toFixed(1));

// A user-defined type guard: you write the check, TypeScript trusts it
function isShape(value: unknown): value is Shape {
  return typeof value === "object" && value !== null && "kind" in value;
}

// unknown: the safe "I do not know yet" type. any turns checking off.
const input: unknown = JSON.parse('{"kind":"circle","radius":2}');
if (isShape(input) && input.kind === "circle") {
  console.log(input.radius);
}
```

```bash
npx tsx src/labs/types-generics.ts
```

*You should see:*

```text
10 a
hello [ 1, 2, 3 ]
text 5
string of 3 list of 2 number 2.0
9.0
2
```

### 3.1 Generics

A **generic** is a type with a blank, `T`, that is filled in when you use it. `first<T>(items: T[]): T | undefined` works for any list, and it remembers the type: `first([10, 20])` is `number | undefined`, because TypeScript works out `T` from what you pass. This is exactly how `retry<T>` and `mapLimit<T, R>` will work in section 5. Three things to know:

- A **constraint** (`T extends { length: number }`) limits what `T` may be, so the function body can safely use `.length`.
- A **default** (`Box<T = string>`) is used when you do not give `T`.
- Write `<T>` only when the type really has to flow from the input to the output. If a function does not need that, a plain type is simpler.

### 3.2 Narrowing

Narrowing is checking a value so TypeScript knows more inside the check: `typeof`, `Array.isArray`, `in`, `===`. A **discriminated union** adds one field (`kind`) that tells the shapes apart, and `switch (shape.kind)` narrows each case. `Result<T, E>` in the next section uses the same trick with `ok`.

### 3.3 unknown, any and never

| Type | Meaning | Use |
| --- | --- | --- |
| `unknown` | A value of a type you do not know yet. You must check it before you use it. | Data from outside: `JSON.parse`, `catch (e)`, request bodies. |
| `any` | Switches type checking off for that value. Anything is allowed, even mistakes. | Avoid it. It hides the bugs you are using TypeScript to find. |
| `never` | A value that cannot exist. | The "impossible" branch of an exhaustive `switch`. |

A **type guard** (`value is Shape`) is a function you write that checks a value, and TypeScript trusts the answer. Be careful: the compiler cannot check that your guard is right.

Now break it on purpose. Add a blank line and then these two lines at the end, and run `npm run typecheck`:

```ts
longest(1, 2);
input.toUpperCase();
```

*You should see:*

```text
src/labs/types-generics.ts(59,9): error TS2345: Argument of type 'number' is not assignable to parameter of type '{ length: number; }'.
src/labs/types-generics.ts(60,1): error TS18046: 'input' is of type 'unknown'.
```

The second error is `unknown` doing its job: it will not let you call a method before you have checked the value. If `input` had been `any`, that line would compile and crash at runtime. An `as` assertion (`input as string`) also compiles, because it tells the compiler to *trust you*, so use it rarely.

Delete those two lines. Then try one more: add a third shape to the `Shape` union, and leave `area` as it is. Change the type to:

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number }
  | { kind: "triangle"; base: number };
```

*You should see:*

```text
src/labs/types-generics.ts(42,13): error TS2322: Type '{ kind: "triangle"; base: number; }' is not assignable to type 'never'.
```

The `never` check found the one place that forgot the new shape. That is the point of an exhaustive `switch`. Remove the triangle again.

**Checkpoint 3**

- [ ] `types-generics.ts` printed the output above and `typecheck` is clean again.
- [ ] You saw the `never` error for the triangle.
- [ ] You can say the difference between `unknown` and `any`, in your own words.

```bash
git add .
git commit -m "docs: add typescript practice files"
git push
```

## 4. Utility types and the Task domain (30 min)

**Utility types** build a new type from an existing one, so you describe a shape once and derive the rest.

| Utility | Result |
| --- | --- |
| `Partial<T>` | Every property optional. |
| `Required<T>` | Every property required. |
| `Pick<T, "a" \| "b">` | Only the listed properties. |
| `Omit<T, "a">` | Everything except the listed properties. |
| `Record<K, V>` | An object with a key for each `K`, each holding a `V`. |
| `Readonly<T>` | Every property `readonly`. |
| `ReturnType<typeof fn>` | The type a function returns. |
| `Awaited<T>` | The type inside a promise (`Awaited<Promise<number>>` is `number`). |

### 4.1 The Task domain

The Task API starts in M05. Define its types now, in one file, so every later module imports them. Create `src/domain/task.ts`:

```ts
export const taskStatuses = ["todo", "in_progress", "done"] as const;
export type TaskStatus = (typeof taskStatuses)[number];

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  readonly createdAt: Date;
  updatedAt: Date;
}

// Derived from Task, so they can never drift apart
export type CreateTaskInput = Omit<Task, "id" | "createdAt" | "updatedAt">;
export type UpdateTaskInput = Partial<CreateTaskInput>;

// Either it worked (ok: true) or it failed (ok: false)
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
```

- `taskStatuses` is the list of values, and `TaskStatus` is the type made from it. The list and the type cannot disagree, because one comes from the other.
- `CreateTaskInput` is `Task` **without** the fields the server sets. `UpdateTaskInput` is `CreateTaskInput` with everything optional. They are never written by hand, so if `Task` changes they change with it. (M08 replaces them with Zod schemas, and the idea stays.)
- `Result<T, E>` is a discriminated union. A function returns `ok(value)` or `err(error)` and the caller must check `ok` before touching `value`. That is an alternative to throwing exceptions.

### 4.2 Use it

Create `src/labs/task-demo.ts`:

```ts
import { randomUUID } from "node:crypto";
import { err, ok, taskStatuses } from "../domain/task.ts";
import type { CreateTaskInput, Result, Task, UpdateTaskInput } from "../domain/task.ts";

function createTask(input: CreateTaskInput): Task {
  const now = new Date();
  return { id: randomUUID(), ...input, createdAt: now, updatedAt: now };
}

function updateTask(task: Task, changes: UpdateTaskInput): Result<Task, string> {
  if (changes.title !== undefined && changes.title.trim() === "") {
    return err("title cannot be empty");
  }
  return ok({ ...task, ...changes, updatedAt: new Date() });
}

const task = createTask({ title: "Write M04", status: "todo" });
console.log(task.title, task.status);

const result = updateTask(task, { status: "done" });
if (result.ok) {
  console.log("updated:", result.value.status); // value exists here
} else {
  console.log("failed:", result.error); // error exists here
}
console.log(updateTask(task, { title: " " }));

// Record: one entry for every key of a union
const counts: Record<Task["status"], number> = { todo: 1, in_progress: 0, done: 0 };
console.log(counts);

// satisfies: check a value against a type, and keep its exact type
const defaults = { status: "todo", pageSize: 20 } satisfies Partial<Task> & { pageSize: number };
console.log(defaults.pageSize.toFixed(0), taskStatuses.length);

// ReturnType and Awaited read types out of functions
type Created = ReturnType<typeof createTask>; // Task
async function load() {
  return [task];
}
type Loaded = Awaited<ReturnType<typeof load>>; // Task[]
const loaded: Loaded = [task];
const same: Created = task;
console.log(loaded.length, same.id === task.id);

// Pick: keep only some fields
type Summary = Pick<Task, "id" | "title">;
const summary: Summary = { id: task.id, title: task.title };
console.log(Object.keys(summary));

// Readonly and Required
const frozen: Readonly<Task> = task;
const full: Required<Task> = { ...task, description: "now required" };
console.log(frozen.title, full.description);
```

```bash
npx tsx src/labs/task-demo.ts
```

*You should see:*

```text
Write M04 todo
updated: done
{ ok: false, error: 'title cannot be empty' }
{ todo: 1, in_progress: 0, done: 0 }
20 3
1 true
[ 'id', 'title' ]
Write M04 now required
```

New in this file: `import type` (types only, as `verbatimModuleSyntax` requires: a normal `import { Task }` is error `TS1484`), `satisfies` (checks that a value fits a type, and keeps its exact type, so `defaults.pageSize` is a `number` and not "possibly missing"), and `ReturnType`/`Awaited` to read a type out of a function.

Now break it on purpose. Add a blank line and then these five lines to the end, and run `npm run typecheck`:

```ts
createTask({ title: "No status" });
updateTask(task, { status: "archived" });
frozen.title = "x";
task.createdAt = new Date();
console.log(result.value);
```

*You should see:*

```text
src/labs/task-demo.ts(56,12): error TS2741: Property 'status' is missing in type '{ title: string; }' but required in type 'CreateTaskInput'.
src/labs/task-demo.ts(57,20): error TS2322: Type '"archived"' is not assignable to type '"done" | "in_progress" | "todo" | undefined'.
src/labs/task-demo.ts(58,8): error TS2540: Cannot assign to 'title' because it is a read-only property.
src/labs/task-demo.ts(59,6): error TS2540: Cannot assign to 'createdAt' because it is a read-only property.
src/labs/task-demo.ts(60,20): error TS2339: Property 'value' does not exist on type 'Result<Task, string>'.
```

The last one is the point of `Result`: until you check `result.ok`, TypeScript will not let you read `value`. Delete the five lines, and check that `typecheck` is quiet.

**Checkpoint 4**

- [ ] `task-demo.ts` printed the output above, and `typecheck` is clean after you removed the bad lines.
- [ ] You can say why `CreateTaskInput` is derived with `Omit` and not written out by hand.
- [ ] You can say why you must check `result.ok` before reading `result.value`.

```bash
git add .
git commit -m "feat: add task domain types"
git push
```

## 5. Exercise: port the Async toolkit (40 min)

This is the module's deliverable. You will convert `src/toolkit/toolkit.js` from M02 to TypeScript, **writing the types yourself**. Nothing here tells you the answer. The compiler marks your work: you are done when `npm run typecheck` shows zero errors and `npm run check` prints `All checks passed`.

### 5.1 Set up the exercise

1. Rename the two files. The code inside stays the same for now.

```bash
mv src/toolkit/toolkit.js src/toolkit/toolkit.ts
mv src/toolkit/check.js src/toolkit/check.ts
```

1. In `src/toolkit/check.ts`, change the import on line 2 to end in `.ts`:

```ts
import { sleep, withTimeout, TimeoutError, retry, mapLimit } from "./toolkit.ts";
```

1. Make the `check` script use `tsx`:

```bash
npm pkg set scripts.check="tsx src/toolkit/check.ts"
```

1. Add the **type tests**. This file is the examiner. It calls your functions the way a real caller would, and it stops compiling if your types are wrong (for example, if you use `any`). It is never run. Create `src/toolkit/types.check.ts`, and copy it exactly:

```ts
// Type tests: this file is checked by `npm run typecheck`. It is never run.
import { mapLimit, retry, sleep, withTimeout } from "./toolkit.ts";

// Copy these two lines as they are. They fail to compile if two types differ.
type Equal<A, B> = (<X>() => X extends A ? 1 : 2) extends <X>() => X extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

// retry gives back whatever its function resolves to
const r1 = retry(async () => 42);
const r2 = retry(async () => "text");
export type Test1 = Expect<Equal<typeof r1, Promise<number>>>;
export type Test2 = Expect<Equal<typeof r2, Promise<string>>>;

// withTimeout keeps the type of the promise it wraps
const w1 = withTimeout(sleep(10).then(() => true), 100);
export type Test3 = Expect<Equal<typeof w1, Promise<boolean>>>;

// mapLimit: the callback gets each item and returns each result
const m1 = mapLimit([1, 2, 3], 2, async (n) => {
  type Item = Expect<Equal<typeof n, number>>;
  return String(n);
});
export type Test4 = Expect<Equal<typeof m1, Promise<string[]>>>;

// These must be rejected. If the line below does NOT error, tsc reports an unused directive.
// @ts-expect-error retries must be a number
retry(async () => 1, { retries: "3" });
// @ts-expect-error the callback must accept a number here
mapLimit([1, 2, 3], 2, async (s: string) => s);
```

1. Type `sleep` and `TimeoutError` first. They are given, as the worked example of what to do. In `toolkit.ts`, change them to:

```ts
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Timed out after ${ms} ms`);
    this.name = "TimeoutError";
  }
}
```

A parameter always gets an annotation. `Promise<void>` says the promise resolves with no value. Now run the check:

```bash
npm run typecheck
```

*You should see:*

```text
src/toolkit/check.ts(44,64): error TS7006: Parameter 'n' implicitly has an 'any' type.
src/toolkit/toolkit.ts(13,29): error TS7006: Parameter 'promise' implicitly has an 'any' type.
src/toolkit/toolkit.ts(13,38): error TS7006: Parameter 'ms' implicitly has an 'any' type.
src/toolkit/toolkit.ts(14,7): error TS7034: Variable 'timer' implicitly has type 'any' in some locations where its type cannot be determined.
src/toolkit/toolkit.ts(18,70): error TS7005: Variable 'timer' implicitly has an 'any' type.
src/toolkit/toolkit.ts(21,29): error TS7006: Parameter 'fn' implicitly has an 'any' type.
src/toolkit/toolkit.ts(32,32): error TS7006: Parameter 'items' implicitly has an 'any' type.
src/toolkit/toolkit.ts(32,39): error TS7006: Parameter 'limit' implicitly has an 'any' type.
src/toolkit/toolkit.ts(32,46): error TS7006: Parameter 'fn' implicitly has an 'any' type.
src/toolkit/types.check.ts(11,28): error TS2344: Type 'false' does not satisfy the constraint 'true'.
src/toolkit/types.check.ts(12,28): error TS2344: Type 'false' does not satisfy the constraint 'true'.
src/toolkit/types.check.ts(16,28): error TS2344: Type 'false' does not satisfy the constraint 'true'.
src/toolkit/types.check.ts(19,42): error TS7006: Parameter 'n' implicitly has an 'any' type.
src/toolkit/types.check.ts(20,22): error TS2344: Type 'false' does not satisfy the constraint 'true'.
src/toolkit/types.check.ts(23,28): error TS2344: Type 'false' does not satisfy the constraint 'true'.
src/toolkit/types.check.ts(28,1): error TS2578: Unused '@ts-expect-error' directive.
```

That is your to-do list. Your line numbers may differ a little.

### 5.2 Your task

Port these three functions. Do them one at a time, and run `npm run typecheck` after each. The errors in `types.check.ts` drop as you go.

| Function | What the types must say |
| --- | --- |
| `withTimeout` | Takes a promise of *some* type and a number of milliseconds, and returns a promise of **the same type**. It must still reject with `TimeoutError` when too slow. |
| `retry` | Takes a function that receives the attempt number and returns a promise of *some* type, and an optional options object with `retries` and `delayMs` (both numbers, both optional). It returns a promise of **the type the function resolves with**. |
| `mapLimit` | Takes a list of items of *some* type, a limit, and a function that receives an item and its index and returns a promise of *another* type. It returns a promise of **a list of that other type**. |

Rules: no `any`. Do not change what the functions do. The `unknown` type belongs in `catch`.

### 5.3 Hints

Try for a few minutes before you open a hint. Each function has two: a nudge, then the shape of the signature. The full answer is on the [solution page](solution.md), which explains every line.

**withTimeout: hint 1**
Which part of the type has to flow from the input promise to the output promise? That is the blank to make generic, and it is the same idea as `first<T>` in section 3. After you add it, `timer` and the promise you build for the timeout still need a type. `setTimeout` returns different things in browsers and in Node.js, so what type does `timer` hold? Look at what the compiler says.

**withTimeout: hint 2**
The signature has the shape `withTimeout<T>(promise: Promise<T>, ms: number): Promise<T>`. For `timer`, use `ReturnType<typeof setTimeout>`. The timeout promise never resolves with a value, only rejects, so it is a `Promise<never>`. If you forget that, `Promise.race` gives you a `Promise<unknown>`.

**retry: hint 1**
`retry` needs one generic for the result, and it appears in two places: the type of `fn` and the return type. The options object is its own shape, with two optional fields. Naming it as an `interface` keeps the signature readable. What type does a function that returns a promise have? Remember `fn` receives the attempt number.

**retry: hint 2**
`retry<T>(fn: (attempt: number) => Promise<T>, { retries = 3, delayMs = 100 }: RetryOptions = {}): Promise<T>`, where `RetryOptions` is an `interface` with `retries?: number` and `delayMs?: number`. In the `catch` block, write `catch (err: unknown)`. You then rethrow it, which is allowed for `unknown`.

**mapLimit: hint 1**
There are **two** blanks here: the type of each item going in, and the type of each result coming out. Which parts of the signature use each one? The results list is built up by assigning into an array by index. Because of `noUncheckedIndexedAccess`, reading `items[index]` may give you something extra. What does the compiler say it is?

**mapLimit: hint 2**
`mapLimit<T, R>(items: readonly T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]>`. For the results, `const results: R[] = new Array(items.length)`. The inner `worker` function should be typed `Promise<void>`. For `items[index]`, the compiler says it is `T | undefined` even though your loop makes sure the index is valid. You decide how to tell it that.

### 5.4 Compiler errors you will probably meet

**Parameter implicitly has an 'any' type (TS7006)**
You have not annotated a parameter yet. Under `strict`, a parameter never gets a hidden `any`. Give it a type, or a generic.

**Type 'Promise<unknown>' is not assignable to type 'Promise<T>' (TS2322)**
Something in the chain has no type of its own, so it became `unknown`. In `withTimeout`, it is the promise made for the timeout. Say what it can resolve with: it never does.

**Type 'Timeout' is not assignable to type 'number' (TS2322)**
In Node.js, `setTimeout` returns an object, and not a number as in browsers. Do not guess the type: ask TypeScript for it, with `ReturnType<typeof setTimeout>`.

**Argument of type 'T | undefined' is not assignable to parameter of type 'T' (TS2345)**
`noUncheckedIndexedAccess` makes `items[index]` possibly `undefined`. In `mapLimit` your loop already guarantees the index is valid. You can tell the compiler so with `as T`, which is a promise from you that the compiler cannot check, so use it only where, like here, you know it is true.

**Type 'false' does not satisfy the constraint 'true' (TS2344), in types.check.ts**
The type of a call is not exactly what the test expects. Often a type is `any`, `unknown` or still unannotated. Find the line the error points at, work out what type the call should return, and check which part of your signature decides it.

### 5.5 Check and save

When you think you are done:

```bash
npm run typecheck
npm run check
```

*You should see:*

```text
> js-training@1.0.0 typecheck
> tsc --noEmit

> js-training@1.0.0 check
> tsx src/toolkit/check.ts

ok  sleep
ok  withTimeout
ok  retry
ok  mapLimit
All checks passed
```

If you are stuck after the hints, open the [solution page](solution.md) (only after you have tried). It has the complete `toolkit.ts` and explains each type. Copy it, run the two commands, and read why each type is what it is, so you can do it alone next time.

Commit:

```bash
git add .
git commit -m "feat: port async toolkit to typescript"
git push
```

**Checkpoint 5**

- [ ] `npm run typecheck` shows no errors, including in `types.check.ts`.
- [ ] `npm run check` prints `All checks passed`.
- [ ] You did not use `any` anywhere in `toolkit.ts`.
- [ ] Your `toolkit.ts` still has the same exports as before: `sleep`, `TimeoutError`, `withTimeout`, `retry` and `mapLimit`.

Keep `src/toolkit/toolkit.ts` as it is. M05 and later modules import from it.

## 6. Running TypeScript on Node.js (15 min)

There are three ways to run TypeScript. You have used the first.

| Way | What it does | Checks types? |
| --- | --- | --- |
| **`tsx`** | Runs `.ts` files, removing the types first. The course's dev runner. | No |
| **Node.js type stripping** | Node.js 24 can run `.ts` files itself, with no tool, if the file only uses *erasable* syntax: syntax that is removed cleanly. | No |
| **`tsc` build** | Compiles `.ts` to `.js` files in a folder, which Node.js then runs. | Yes |

The type check is always a separate step: `npm run typecheck`. Try each.

### 6.1 Native type stripping

```bash
node src/toolkit/check.ts
```

*You should see:*

```text
ok  sleep
ok  withTimeout
ok  retry
ok  mapLimit
All checks passed
```

It works on Node.js 24 with no flag, because `toolkit.ts` and `check.ts` only use annotations, which can be removed. That is why `check.ts` imports `./toolkit.ts` with the extension: Node.js needs the real file name. (If Node.js prints an `ExperimentalWarning` line first, it is harmless.)

Things that need more than removing, such as `enum`, do not work. Create `src/labs/enum-demo.ts`:

```ts
enum Color { Red, Green }
console.log(Color.Red);
```

```bash
npx tsx src/labs/enum-demo.ts
npm run typecheck
node src/labs/enum-demo.ts
```

*You should see:*

```text
0
src/labs/enum-demo.ts(1,6): error TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled.
SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]: TypeScript enum is not supported in strip-only mode
```

`tsx` runs it, `tsc` warns because of `erasableSyntaxOnly`, and Node.js refuses. That setting makes `tsc` catch it early. This is one more reason the course uses unions instead of `enum`. Delete `enum-demo.ts`.

Native type stripping becomes fully stable in Node.js 26, so this course stays on `tsx` for dev, and uses native stripping as awareness only.

### 6.2 A tsc build

Awareness only: a build writes JavaScript to a folder. `dist` is already in your `.gitignore`.

```bash
npx tsc --noEmit false --outDir dist --rootDir src
node dist/toolkit/check.js
```

*You should see:*

```text
ok  sleep
ok  withTimeout
ok  retry
ok  mapLimit
All checks passed
```

`tsc` rewrote the `./toolkit.ts` import to `./toolkit.js` in the output, because of `rewriteRelativeImportExtensions`. You will not need a build for this course. TypeScript 7 asks you to set `--rootDir` yourself, which is why it is there.

### 6.3 process.env, @types and TypeScript 7

`process.env` values are `string | undefined`, because a variable may not be set. Create `src/labs/env.ts`:

```ts
// process.env values are string | undefined: the variable may not be set
const port = process.env.PORT; // string | undefined
// port.toUpperCase(); // error: 'port' is possibly 'undefined'

function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value;
}

console.log(port ?? "(PORT not set)");
console.log(requireEnv("GREETING"));
```

```bash
GREETING=hi npx tsx src/labs/env.ts
npx tsx src/labs/env.ts
```

*You should see:*

```text
(PORT not set)
hi
(PORT not set)
.../src/labs/env.ts:8
    throw new Error(`Missing environment variable ${name}`);
          ^
Error: Missing environment variable GREETING
```

The first command sets `GREETING` for one run (that syntax works in Git Bash, macOS and Linux). The second does not, so `requireEnv` fails fast with a clear message, which is better than a `undefined` travelling through your program. The stack trace lines after the error are left out here.

Two more things to know:

- **`@types/*` packages and `.d.ts` files.** Some JavaScript libraries have no types of their own. A package named `@types/<library>` supplies them, as `@types/node` does for Node.js. A `.d.ts` file holds only type declarations, with no code. Your own projects rarely need to write one.
- **TypeScript 6 to 7.** TypeScript 7 is a new compiler written in Go: the same checks, much faster, and `strict` is on by default (you set it anyway, so it is clear). Old options were removed, and it does not yet have the programmatic JavaScript API that some tools use to embed the compiler. In M09 you will see why: the test setup uses a transform that only strips types, and `tsc --noEmit` stays the real type check.

Commit:

```bash
git add .
git commit -m "docs: add typescript runner and env labs"
git push
```

## Check your understanding (5 min)

Answer each one in your head, then open it to compare.

**What is the difference between `unknown` and `any`?**
Both can hold any value. `any` turns off checking: you can call anything on it, and mistakes become runtime errors. `unknown` is safe: you must check the value (with `typeof`, a type guard or similar) before you use it. Use `unknown` for data you did not create, such as parsed JSON or a caught error.

**When do you use `type`, and when `interface`?**
Both describe object shapes. This course uses `interface` for the shape of an object you design (like `Task`), and `type` for unions, aliases and types built from other types (like `CreateTaskInput` and `Result`). A `type` can do things an `interface` cannot (unions, tuples), and interfaces with the same name merge. The most important rule is to be consistent.

**`tsx` ran your file with a type error in it. Why, and what protects you?**
`tsx` only removes the types and runs the JavaScript left. It never checks. `npm run typecheck` (`tsc --noEmit`) is the check, and it is a separate step that you, and later CI, must run.

**Why is `CreateTaskInput` written as `Omit<Task, ...>` and not as its own interface?**
So there is one source of truth. If `Task` gets a new field, the input types follow, and they cannot drift out of sync. This is what utility types are for.

**Why does `Result<T, E>` make you check `ok` before reading `value`?**
It is a discriminated union: the `ok` field says which of the two shapes you have. Before the check, TypeScript only knows it is one or the other, so reading `value` is an error. This makes failure impossible to forget, unlike an exception that nobody catches.

## Troubleshooting

**`npm run typecheck` says `error TS18003: No inputs were found`**
There is no `.ts` file in `src` yet, or `include` in `tsconfig.json` is wrong. Create `src/labs/types-intro.ts` and check `"include": ["src"]`.

**`Cannot find name 'node:assert/strict'` or `Cannot find name 'process'` (TS2591)**
`tsconfig.json` is missing `"types": ["node"]`, or `@types/node` is not installed. Run `npm install -D @types/node@24` and check the `types` line. TypeScript no longer loads `@types` packages on its own.

**`Cannot find module './toolkit.js'` (TS2307) or `ERR_MODULE_NOT_FOUND`**
After the rename the file is `toolkit.ts`. Import it as `./toolkit.ts`, with the real extension, in `check.ts`, `types.check.ts` and anywhere else.

**`'Task' is a type and must be imported using a type-only import` (TS1484)**
`verbatimModuleSyntax` is on. Write `import type { Task } from ...`, or `import { type Task }`, for anything that is only a type.

**`This syntax is not allowed when 'erasableSyntaxOnly' is enabled` (TS1294)**
You used `enum`, a class constructor parameter property (`constructor(private x: string)`), or a `namespace`. Use a union of literals, a normal property assignment, or a plain object instead.

**`Object is possibly 'undefined'` on `list[0]` (TS2532 or TS18048)**
`noUncheckedIndexedAccess` makes indexing return `T | undefined`. Check it first (`if (item !== undefined)`), use `?.`, or, if you know it is there, `as T`.

**`tsx: command not found` or `npx` tries to install tsx**
`tsx` is not installed in this repo. Run `npm install -D tsx`, from the repo root, and run it with `npx tsx` or an npm script.

**The editor shows red lines that `tsc` does not (or the other way round)**
VS Code may use its own TypeScript. Press `Ctrl+Shift+P` (`Cmd+Shift+P` on macOS), run **TypeScript: Select TypeScript Version**, and choose the workspace version. If the two disagree, trust the terminal: `npm run typecheck` is always the source of truth.

**`npm run check` fails but `typecheck` is clean**
They test different things. `check` runs the toolkit's behaviour. If you changed what a function does while typing it, compare with the M02 version. Types should never change behaviour.

**`types.check.ts` still fails and I do not see why**
Read the line the error points to, find what the call should give back, and look at which part of your signature decides that type. A `false` constraint error usually means a type is `any`, `unknown` or `Promise<unknown>`. If you are stuck, use the hints, then the [solution page](solution.md).

## You're done when

- [ ] `npm run typecheck` shows zero errors on a strict config.
- [ ] `npm run check` passes, through `tsx`, on your TypeScript toolkit, with no `any` in it.
- [ ] `src/domain/task.ts` has `Task`, `CreateTaskInput`, `UpdateTaskInput` and `Result<T, E>`.
- [ ] You ran a `.ts` file with native type stripping on Node.js 24 and saw what happened with an `enum`.
- [ ] You can explain `unknown` vs `any`, and `type` vs `interface`, in your own words.
- [ ] Everything is committed and pushed to your repo.

Keep `src/toolkit/toolkit.ts` and `src/domain/task.ts` as they are. M05 builds the Task API on them.

Previous: [M03, Node.js Runtime & npm](../m03-nodejs-runtime-npm/index.md). Next: [M05, Express: Routing, Middleware & Error Handling](../m05-express-task-api-v1/index.md).
