# M02 — Modern JavaScript & Async/Await

**Module M02 · Week 1 · Days 2-4 · about 2 hours**

Learn the modern JavaScript you will use every day, understand how async code runs, and build an Async toolkit of four helpers that the rest of the course reuses.

## Overview & time plan

**Builds on:** M01. You need the `node-js-training` repo from M01, with `"type": "module"` in `package.json`, and Node.js 24. Everything you write here goes into that same repo.

Almost every Node.js program waits for something: a network reply, a file, a timer. This module teaches the modern JavaScript you will read and write all the time, and then how to wait for things without bugs. You will end with a small **Async toolkit**: `sleep`, `withTimeout`, `retry` and `mapLimit`.

**You will reuse the toolkit.** M03 builds on the same async patterns, M04 converts the toolkit to TypeScript, and M05 reuses the custom-error pattern in the API. So write it carefully, keep it in one file, and do not rename anything.

1. Modern JavaScript you will use every day: 25 min
2. How async code runs: 20 min
3. Build the Async toolkit: 45 min
4. Fetch: sequential vs parallel: 15 min
5. Callbacks to promises: 10 min
6. Check your understanding: 5 min

This page moves quickly. Type each code block yourself (typing teaches more than pasting), run it, and compare with the *You should see* box. The commands are the same on Windows (Git Bash), macOS and Linux. Your timings and file paths will differ from the examples. If anything else differs, check [Troubleshooting](#troubleshooting).

## 1. Modern JavaScript you will use every day (25 min)

You will write one file, `src/labs/essentials.js`, a topic at a time. First create the folders, inside `node-js-training`:

```bash
mkdir -p src/labs src/toolkit
```

Add each code block below to the **end** of `src/labs/essentials.js`. The output is shown once, after the last block.

### 1.1 Variables, arrow functions, closures, templates

Use `const` by default, and `let` only when a value must change. Do not use `var`. An **arrow function** is a short function: `(a, b) => a + b`. A **template literal** uses backticks and `${}` to put values into text. A **closure** is a function that remembers the variables around it, even after the outer function has finished. `retry` and `mapLimit` rely on closures.

```js
// const / let, arrow functions, template literals
const price = 20;
const addTax = (amount, rate = 0.1) => amount * (1 + rate);
console.log(`Total: ${addTax(price)}`);

// Closures: a function remembers the variables around it
function makeCounter() {
  let count = 0;
  return () => ++count;
}
const next = makeCounter();
next();
console.log("Counter:", next());
```

### 1.2 Destructuring, spread and rest

**Destructuring** pulls values out of objects and arrays into variables. **Spread** (`...`) copies items into a new object or array. **Rest** (`...nums`) collects extra arguments into an array.

```js
// Destructuring, spread and rest
const user = { name: "Ana", address: { city: "Manila" }, tags: ["a", "b"] };
const { name, tags: [firstTag] } = user;
const copy = { ...user, name: "Ben" };
const sum = (...nums) => nums.reduce((total, n) => total + n, 0);
console.log(name, firstTag, copy.name, sum(1, 2, 3));
```

### 1.3 Safe access and defaults: `?.`, `??`, `??=`

`?.` stops and gives `undefined` if something is missing, instead of throwing. `??` uses the right side only for `null` or `undefined`, while `||` also replaces `0` and the empty string. `??=` assigns only if the value is missing.

```js
// ?. ?? ??=
console.log(user.profile?.age);
console.log(0 || 10, 0 ?? 10);
const settings = {};
settings.retries ??= 3;
console.log(settings);
```

> **Use === and know what is falsy.** `==` converts types before comparing, so `"5" == 5` is `true` and `[] == false` is `true`. Always use `===`. The falsy values are `false`, `0`, `""`, `null`, `undefined` and `NaN`. Everything else is truthy, including `"0"`, `[]` and `{}`.

### 1.4 Array methods

These replace most `for` loops. `map` transforms every item, `filter` keeps some, `find` returns the first match, `some` and `every` answer yes or no, and `reduce` folds a list into one value. `toSorted` returns a sorted copy and leaves the original alone (`sort` changes the original). `Object.groupBy` groups items by a key.

```js
// Array methods
const tasks = [
  { title: "Write", done: true, points: 3 },
  { title: "Test", done: false, points: 5 },
  { title: "Ship", done: false, points: 2 },
];
console.log(tasks.filter((t) => !t.done).map((t) => t.title));
console.log(tasks.find((t) => t.points > 4)?.title);
console.log(tasks.some((t) => t.done), tasks.every((t) => t.done));
console.log(tasks.reduce((total, t) => total + t.points, 0));
console.log(tasks.toSorted((a, b) => a.points - b.points).map((t) => t.title));
console.log(Object.groupBy(tasks, (t) => (t.done ? "done" : "todo")).todo.length);
```

### 1.5 Errors: a custom class and `cause`

Throw an `Error` and catch it with `try/catch`. A **custom error class** gives a failure its own name, so code can tell failures apart (you build `TimeoutError` in section 3). `cause` keeps the original error attached. M05 builds its API errors the same way.

```js
// Custom error with cause
class AppError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "AppError";
  }
}
try {
  try {
    JSON.parse("{ not json");
  } catch (err) {
    throw new AppError("Could not read settings", { cause: err });
  }
} catch (err) {
  console.log(err.name, "-", err.message, "| cause:", err.cause.name);
}
```

### 1.6 Run it

```bash
node src/labs/essentials.js
```

*You should see:*

```text
Total: 22
Counter: 2
Ana a Ben 6
undefined
10 0
{ retries: 3 }
[ 'Test', 'Ship' ]
Test
true false
10
[ 'Ship', 'Write', 'Test' ]
2
AppError - Could not read settings | cause: SyntaxError
```

### 1.7 Modules: named exports

`package.json` has `"type": "module"` (from M01), so you can use `import` and `export`. A file **exports** values by name (`export const sleep = ...`), and another file **imports** them by the same name (`import { sleep } from "./toolkit.js"`). A *default* export (`export default ...`) has no fixed name, so every importer can call it something different, which makes code harder to search. This course uses **named exports**. Always write the `.js` extension in relative imports.

Here "module" means a JavaScript file that imports and exports. It is a different meaning from the course modules (M01, M02, and so on).

### Exists, but not needed yet

Know these exist so you recognise them. You do not need to practise them now.

| Feature | What it is for |
| --- | --- |
| `Map` and `Set` | A `Map` is like an object that allows any type of key. A `Set` holds unique values, and has methods such as `union`, `intersection` and `difference`. |
| `#private` fields, getters and setters | In a `class`, `#balance` can only be used inside the class. `get` and `set` run code when a property is read or assigned. |
| `Promise.withResolvers`, `Promise.try`, `Array.fromAsync` | Helpers for creating a promise you resolve later, for wrapping code that might throw or return a promise, and for collecting async results into an array. |
| `Temporal` | The future replacement for `Date`. It is not in Node.js 24, so keep using `Date`. |

**Checkpoint 1**

- [ ] `node src/labs/essentials.js` prints the output above.
- [ ] You can say why `0 ?? 10` is `0` but `0 || 10` is `10`.

## 2. How async code runs (20 min)

JavaScript does **one thing at a time**. The place where it keeps track of what is running is the **call stack**. A function that waits for a network reply must not block the stack, so Node.js hands the waiting to the system, carries on, and runs your code later, when the result is ready.

### 2.1 The event loop and its two queues

Finished work waits in a queue until the stack is empty. There are two queues:

- The **task queue** holds timers (`setTimeout`) and other finished I/O, such as files and network.
- The **microtask queue** holds promise callbacks (`.then`, `.catch`, `.finally`) and the code that comes after an `await`.

The **event loop** repeats this: run your synchronous code until the stack is empty, then run **every** microtask, then take **one** task, and repeat. That gives one rule to remember:

> **The ordering rule.** Synchronous code first, then microtasks (promises and `await`), then the next task (timers). `setTimeout(fn, 0)` does not run "now". It runs after the current code and all the microtasks.

### 2.2 Callbacks, promises, async/await

Here is one job written three ways. A **callback** is a function you pass in, to be called later. Nested callbacks get hard to read and hard to handle errors in ("callback hell"). A **promise** is an object for a result that arrives later: chain steps with `.then` and handle any error with one `.catch`. **`async`/`await`** is promise code that reads from top to bottom. `await` pauses *that function* (not the whole program) until the promise settles, and `try/catch` handles errors.

```js
// Callbacks
getUser(1, (err, user) => {
  if (err) return console.error(err);
  getPosts(user.id, (err, posts) => {
    if (err) return console.error(err);
    console.log(posts);
  });
});

// Promises
getUser(1)
  .then((user) => getPosts(user.id))
  .then((posts) => console.log(posts))
  .catch((err) => console.error(err));

// async/await
try {
  const user = await getUser(1);
  const posts = await getPosts(user.id);
  console.log(posts);
} catch (err) {
  console.error(err);
}
```

These three are for reading: `getUser` and `getPosts` do not exist, and you run a real example in section 5. An `async` function always returns a promise. `await` works inside an `async` function, and at the top level of a file when it is a module, which is why your lab files can use `await` directly.

### 2.3 Predict the output order

This is the module's main checkpoint. Create `src/labs/event-loop.js`:

```js
console.log("1 start");

setTimeout(() => console.log("2 timeout"), 0);

Promise.resolve().then(() => console.log("3 promise"));

(async () => {
  console.log("4 async function starts");
  await null;
  console.log("5 after await");
})();

console.log("6 end");
```

1. **Do not run it yet.** On paper, write the six messages in the order you think they print.

2. Run it and compare.

   ```bash
   node src/labs/event-loop.js
   ```

   *You should see:*

   ```text
   1 start
   4 async function starts
   6 end
   3 promise
   5 after await
   2 timeout
   ```

**Why this order?**
`1 start` prints first. `setTimeout` hands its callback to the task queue and the promise callback goes to the microtask queue, and neither runs yet. The `async` function runs **synchronously until its first `await`**, so `4 async function starts` prints straight away, and the rest of the function is queued as a microtask. Then `6 end` prints and the stack is empty.

Now the microtasks run, in the order they were queued: `3 promise`, then `5 after await`. Only after that does the event loop take a task: `2 timeout`, even though its delay was 0.

**Checkpoint 2**

- [ ] You wrote your prediction before running the file.
- [ ] You can explain why `2 timeout` is last, out loud, without looking at the answer.

## 3. Build the Async toolkit (45 min)

Four small helpers in one file, each with a self-check that uses `node:assert`. The checks fail loudly when something is wrong, and you need them because async bugs are easy to miss. Keep everything in `src/toolkit/`. Do not install any package.

### 3.1 `sleep`

`sleep(ms)` returns a promise that resolves after `ms` milliseconds, so `await sleep(500)` pauses a function. It wraps the callback-style `setTimeout` in a promise, which is how you adapt any callback API.

1. Create `src/toolkit/toolkit.js`:

   ```js
   // The Async toolkit: four small helpers for reliable async code.

   export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
   ```

2. Create `src/toolkit/check.js`. The check measures that `sleep` really waited:

   ```js
   import assert from "node:assert/strict";
   import { sleep } from "./toolkit.js";

   // sleep waits at least the time you ask for
   {
     const start = Date.now();
     await sleep(100);
     assert.ok(Date.now() - start >= 90, "sleep should wait about 100 ms");
     console.log("ok  sleep");
   }
   ```

3. Add a script so you can run the checks with one short command, then run it:

   ```bash
   npm pkg set scripts.check="node src/toolkit/check.js"
   npm run check
   ```

   *You should see:*

   ```text
   ok  sleep
   ```

   `npm run check` prints a couple of extra lines first, starting with `>`. That is normal.

### 3.2 `withTimeout`

Some promises never settle, or take too long. `withTimeout(promise, ms)` rejects with a `TimeoutError` if the promise takes longer than `ms`. It uses `Promise.race`, which settles with whichever promise finishes first: your work, or a timer that rejects. The `.finally` clears the timer, otherwise a finished call leaves a timer running that keeps Node.js alive until it fires.

`withTimeout` stops *waiting*. It does not stop the work. To cancel real work such as a `fetch`, pass it a signal, which section 4 shows.

1. Add this to the end of `toolkit.js`:

   ```js
   export class TimeoutError extends Error {
     constructor(ms) {
       super(`Timed out after ${ms} ms`);
       this.name = "TimeoutError";
     }
   }

   export function withTimeout(promise, ms) {
     let timer;
     const timeout = new Promise((_, reject) => {
       timer = setTimeout(() => reject(new TimeoutError(ms)), ms);
     });
     return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
   }
   ```

2. In `check.js`, change the import line to `import { sleep, withTimeout, TimeoutError } from "./toolkit.js";` and add this block at the end:

   ```js
   // withTimeout: resolves when fast enough, rejects with TimeoutError when not
   {
     assert.equal(await withTimeout(sleep(20).then(() => "done"), 200), "done");
     await assert.rejects(withTimeout(sleep(300), 50), TimeoutError);
     console.log("ok  withTimeout");
   }
   ```

   ```bash
   npm run check
   ```

   *You should see:*

   ```text
   ok  sleep
   ok  withTimeout
   ```

### 3.3 `retry`

Networks fail now and then, and trying again often works. `retry(fn, { retries, delayMs })` calls `fn`, and if it throws, waits `delayMs` and tries again, up to `retries` more times. After the last retry it throws the last error, so failures are never hidden. `fn` receives the attempt number, which is handy for logging.

> **return await inside try.** Inside `try`, write `return await fn()`, not `return fn()`. Without `await`, the promise leaves the function before it settles, so your `catch` never sees the failure and `retry` would not retry.

1. Add this to the end of `toolkit.js`:

   ```js
   export async function retry(fn, { retries = 3, delayMs = 100 } = {}) {
     for (let attempt = 0; ; attempt++) {
       try {
         return await fn(attempt);
       } catch (err) {
         if (attempt >= retries) throw err;
         await sleep(delayMs);
       }
     }
   }
   ```

2. Change the import line to `import { sleep, withTimeout, TimeoutError, retry } from "./toolkit.js";` and add this block at the end of `check.js`:

   ```js
   // retry: succeeds after failures, and gives up after the last retry
   {
     let calls = 0;
     const flaky = async () => {
       calls++;
       if (calls < 3) throw new Error("not yet");
       return "worked";
     };
     assert.equal(await retry(flaky, { retries: 3, delayMs: 10 }), "worked");
     assert.equal(calls, 3);

     let failures = 0;
     const alwaysFails = async () => {
       failures++;
       throw new Error("nope");
     };
     await assert.rejects(retry(alwaysFails, { retries: 2, delayMs: 10 }), /nope/);
     assert.equal(failures, 3, "1 first try + 2 retries");
     console.log("ok  retry");
   }
   ```

   ```bash
   npm run check
   ```

   *You should see:*

   ```text
   ok  sleep
   ok  withTimeout
   ok  retry
   ```

### 3.4 `mapLimit`

`Promise.all` starts everything at once. For 1,000 requests that overloads a server and can get you blocked. `mapLimit(items, limit, fn)` runs `fn` on every item with **at most `limit` at a time**, and returns the results **in the original order**. It starts `limit` workers. Each worker takes the next unclaimed index, runs `fn`, stores the result at that index, and repeats until the items run out. JavaScript runs one piece of code at a time, so `next++` is safe: no two workers can take the same index.

1. Add this to the end of `toolkit.js`:

   ```js
   export async function mapLimit(items, limit, fn) {
     const results = new Array(items.length);
     let next = 0;

     async function worker() {
       while (next < items.length) {
         const index = next++;
         results[index] = await fn(items[index], index);
       }
     }

     const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
     await Promise.all(workers);
     return results;
   }
   ```

2. Change the import line to `import { sleep, withTimeout, TimeoutError, retry, mapLimit } from "./toolkit.js";` and add this block at the end of `check.js`:

   ```js
   // mapLimit: keeps order, and never runs more than `limit` at once
   {
     let running = 0;
     let peak = 0;
     const results = await mapLimit([1, 2, 3, 4, 5, 6], 2, async (n) => {
       running++;
       peak = Math.max(peak, running);
       await sleep(30);
       running--;
       return n * 10;
     });
     assert.deepEqual(results, [10, 20, 30, 40, 50, 60]);
     assert.equal(peak, 2);
     console.log("ok  mapLimit");
   }

   console.log("All checks passed");
   ```

   ```bash
   npm run check
   ```

   *You should see:*

   ```text
   ok  sleep
   ok  withTimeout
   ok  retry
   ok  mapLimit
   All checks passed
   ```

### 3.5 See a check fail

A check you have never seen fail proves little. Break `retry` on purpose, in `toolkit.js`: change `if (attempt >= retries) throw err;` to `if (attempt > retries) throw err;`, then run `npm run check`.

*You should see (the first lines of the error):*

```text
AssertionError [ERR_ASSERTION]: 1 first try + 2 retries

4 !== 3
```

The broken version tried 4 times instead of 3, and the check caught it. Change `>` back to `>=` and run `npm run check` until it passes.

### 3.6 Save your work

```bash
git add .
git commit -m "Add async toolkit"
git push
```

**Checkpoint 3**

- [ ] `npm run check` prints four `ok` lines and `All checks passed`.
- [ ] You saw a check fail, then fixed it.
- [ ] `src/toolkit/` is on GitHub.

## 4. Fetch: sequential vs parallel (15 min)

`fetch` is built into Node.js 24, so you need no package. You will request posts from [JSONPlaceholder](https://jsonplaceholder.typicode.com), a free test API that needs no key, and compare two ways of waiting.

### 4.1 Time it

**Sequential** means one request at a time: you wait for each before starting the next. **Parallel** means you start them all, then wait for all of them with `Promise.all`. Create `src/labs/fetch-timing.js`. Part 1 uses `sleep` so the numbers are predictable. Part 2 uses real requests.

```js
import { sleep } from "../toolkit/toolkit.js";

async function time(label, work) {
  const start = performance.now();
  await work();
  console.log(`${label.padEnd(22)} ${Math.round(performance.now() - start)} ms`);
}

// Part 1: five fake jobs of 200 ms each. The numbers here are predictable.
const jobs = [1, 2, 3, 4, 5];
await time("sleep, sequential", async () => {
  for (const job of jobs) await sleep(200);
});
await time("sleep, parallel", () => Promise.all(jobs.map(() => sleep(200))));

// Part 2: ten real requests to JSONPlaceholder.
const BASE = "https://jsonplaceholder.typicode.com/posts";
const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

async function getPost(id) {
  const response = await fetch(`${BASE}/${id}`, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(`HTTP ${response.status} for post ${id}`);
  return response.json();
}

await time("fetch, sequential", async () => {
  for (const id of ids) await getPost(id);
});
await time("fetch, parallel", () => Promise.all(ids.map(getPost)));
```

Notes on the code: `fetch` only rejects when the network fails, so you check `response.ok` yourself (a `404` is a normal response). `AbortSignal.timeout(5000)` cancels the request after 5 seconds and rejects with a `TimeoutError`, which is the real cancellation that `withTimeout` cannot do. `response.json()` parses the body as JSON.

```bash
node src/labs/fetch-timing.js
```

*You should see:*

```text
sleep, sequential      1003 ms
sleep, parallel        201 ms
fetch, sequential      375 ms
fetch, parallel        259 ms
```

The `sleep` numbers will be close to these on any machine: five 200 ms waits one after another take about 1000 ms, and all at once about 200 ms. The `fetch` numbers depend on your connection, but parallel should be lower. The first run can be much slower for both because the connection is being set up, so run the file twice. Write your own numbers down.

**Why is parallel faster?**
Waiting is not work. While one request waits for the network, your program can start another. Sequential code waits for the total of all the delays, and parallel code waits only for the slowest one.

### 4.2 When one of them fails

`Promise.all` rejects as soon as **one** promise rejects. Pick the helper that fits:

| Helper | Settles when | Use it when |
| --- | --- | --- |
| `Promise.all` | All succeed, or the first one fails | You need every result and one failure means failure. |
| `Promise.allSettled` | All finish, success or not | You want each result or error, such as a batch where some may fail. |
| `Promise.race` | The first one settles | You want the fastest answer, or a timeout (`withTimeout` uses it). |
| `Promise.any` | The first one succeeds | You want the first success and can ignore failures. |

For many requests, combine the toolkit: `await mapLimit(ids, 5, (id) => retry(() => getPost(id)))` fetches with at most 5 at a time, and retries each failed one.

### 4.3 Common pitfalls

Each of these looks fine and goes wrong. Learn to spot them.

| Pitfall | What happens | Fix |
| --- | --- | --- |
| Forgotten `await` | `const v = fetchThing();` gives `Promise { <pending> }`, not the value. | Add `await`. |
| `await` in a loop for independent work | Each call waits for the previous one, so it is slow (see 4.1). | `Promise.all`, or `mapLimit` for many. A loop is right when each step needs the previous result. |
| `items.forEach(async ...)` | `forEach` does not wait. The line after it runs first, and you cannot catch errors. | Use `for (const x of items) await ...`, or `await Promise.all(items.map(...))`. |
| Unhandled rejection | A rejected promise nobody handles crashes Node.js (it exits with code 1). | `await` it inside `try/catch`, or add `.catch`. |
| Swallowed error | `catch {}` with nothing inside hides the failure. | Handle it, log it, or rethrow it. |

You can see the `forEach` one yourself. Put this in a file called `scratch.js` in the repo root, run `node scratch.js`, then delete it with `rm scratch.js` so it is not committed:

```js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const save = async (x) => { await sleep(50); console.log("saved", x); };

[1, 2].forEach(async (x) => await save(x));
console.log("forEach finished");
```

*You should see:*

```text
forEach finished
saved 1
saved 2
```

**Checkpoint 4**

- [ ] Your sleep timings are about 1000 ms and 200 ms.
- [ ] Your parallel `fetch` time is lower than your sequential one, and you wrote both numbers down.
- [ ] You can name the five pitfalls.

## 5. Callbacks to promises (10 min)

Older Node.js code uses **callbacks** for files. The error comes first, then the result, and every step nests deeper. You will rewrite one example with `node:fs/promises` and `async`/`await`.

1. Create `src/labs/notes.txt` with three lines of any text, such as:

   ```text
   Callbacks come first.
   Promises come next.
   async/await reads best.
   ```

2. Create `src/labs/fs-callbacks.js`. It reads the file and writes an upper-case copy:

   ```js
   import fs from "node:fs";

   const file = new URL("./notes.txt", import.meta.url);

   fs.readFile(file, "utf8", (err, text) => {
     if (err) {
       console.error("Could not read the file:", err.message);
       return;
     }
     const upper = text.toUpperCase();
     fs.writeFile(new URL("./notes-upper.txt", import.meta.url), upper, (err) => {
       if (err) {
         console.error("Could not write the file:", err.message);
         return;
       }
       console.log("Wrote notes-upper.txt");
     });
   });
   ```

   `new URL("./notes.txt", import.meta.url)` is the file's path relative to the code file, so it works from any folder and on every operating system.

   ```bash
   node src/labs/fs-callbacks.js
   ```

   *You should see:*

   ```text
   Wrote notes-upper.txt
   ```

3. Now refactor it. Create `src/labs/fs-promises.js` with the same behaviour:

   ```js
   import { readFile, writeFile } from "node:fs/promises";

   const file = new URL("./notes.txt", import.meta.url);

   try {
     const text = await readFile(file, "utf8");
     await writeFile(new URL("./notes-upper.txt", import.meta.url), text.toUpperCase());
     console.log("Wrote notes-upper.txt");
   } catch (err) {
     console.error("Could not read or write the file:", err.message);
   }
   ```

   The nesting is gone, and one `try/catch` handles both failures. Run it, and check the new file:

   ```bash
   node src/labs/fs-promises.js
   cat src/labs/notes-upper.txt
   ```

   *You should see:*

   ```text
   Wrote notes-upper.txt
   CALLBACKS COME FIRST.
   PROMISES COME NEXT.
   ASYNC/AWAIT READS BEST.
   ```

4. Save your work. This is the last commit for this module:

   ```bash
   git add .
   git commit -m "Add async labs"
   git push
   ```

On Windows `cat` works in Git Bash. In PowerShell use `type src/labs/notes-upper.txt`.

**Checkpoint 5**

- [ ] Both `fs` versions print the same output.
- [ ] `src/labs/` is on GitHub.

## Check your understanding (5 min)

Answer each one in your head, then compare.

**Why does a resolved promise's `.then` run before `setTimeout(fn, 0)`?**
Promise callbacks go in the microtask queue, and timers go in the task queue. After the current code finishes, the event loop runs all microtasks before it takes the next task.

**Why is `await` inside a `for` loop slow for independent calls, and when is it the right choice?**
Each iteration waits for the previous one, so the total time is the sum of all the delays. Use `Promise.all` (or `mapLimit` for many items) for independent calls. A loop is right when each step needs the previous result, or when you must not run steps at the same time.

**What is wrong with `items.forEach(async (x) => await save(x))`?**
`forEach` ignores the promises its callback returns, so it does not wait. Code after it runs before the saves finish, and errors become unhandled rejections. Use `for...of` with `await`, or `await Promise.all(items.map(save))`.

**What does `retry` do when `fn` fails on the last attempt?**
It throws that last error. The caller sees the failure, and nothing is hidden. With `retries: 2`, `fn` runs at most 3 times: the first try and 2 retries.

**Why must `withTimeout` clear its timer, and what does it not do?**
If the work finishes first, the timer is still counting down. An uncleared timer keeps the Node.js process alive until it fires. `withTimeout` only stops *waiting*. The underlying work keeps running, and to really cancel a `fetch` you pass it `AbortSignal.timeout(ms)`.

## Troubleshooting

**`SyntaxError: Cannot use import statement outside a module`**
Node.js is treating your file as CommonJS. Check that `package.json` in the repo root has `"type": "module"` (set in M01), and that you run the command from the `node-js-training` folder.

**`ERR_MODULE_NOT_FOUND` when you import `./toolkit`**
In ES modules a relative import needs the file extension. Write `"./toolkit.js"`, and check the path and spelling.

**`SyntaxError: The requested module './toolkit.js' does not provide an export named ...**
The name in `import { ... }` does not match an `export` in `toolkit.js`. Check spelling and capital letters, and that you added every function to `toolkit.js` before you imported it in `check.js`.

**`npm run check` says "Missing script: check"**
The script was not added. Run `npm pkg set scripts.check="node src/toolkit/check.js"` from the repo root, and look for `"check"` under `scripts` in `package.json`.

**`npm run check` hangs and never finishes**
A promise in one of your functions never settles. Check that `sleep` calls `resolve`, and that `retry` and `mapLimit` use `await`. Press `Ctrl+C` to stop it.

**`TypeError: fetch failed`**
The network request could not be made: you are offline, the site is blocked, or a proxy is in the way. Check you can open `https://jsonplaceholder.typicode.com/posts/1` in a browser. If you cannot, part 1 of `fetch-timing.js` (the `sleep` part) still proves the idea, and you can come back to part 2 later.

**The parallel `fetch` is not much faster than the sequential one**
That can be normal. On a fast connection to a nearby server each request is quick, and setting up connections takes a share of the time. Run it twice, as the first run is slower. The `sleep` numbers show the idea clearly: about 1000 ms against about 200 ms.

**The script crashes with an error and the word "unhandled" or `[ERR_UNHANDLED_REJECTION]`**
A promise was rejected and nobody handled it. Find the call that was not `await`ed or has no `.catch`, and put it inside `try/catch`.

**`ENOENT: no such file or directory` in the `fs` lab**
`notes.txt` is not in `src/labs/`, or has a different name. Create it there, and check the spelling.

## You're done when

- [ ] `npm run check` prints `All checks passed`.
- [ ] You predicted the output order of `event-loop.js` before running it, and can explain it.
- [ ] You have your own numbers showing parallel faster than sequential, and can say why.
- [ ] `fs-promises.js` works and gives the same result as `fs-callbacks.js`.
- [ ] Everything is committed and pushed to your repo.

Keep `src/toolkit/toolkit.js` as it is. M04 converts it to TypeScript, and later modules reuse its helpers.

Next: [M03, Node.js Runtime & npm](../m03-nodejs-runtime-npm/index.md).
