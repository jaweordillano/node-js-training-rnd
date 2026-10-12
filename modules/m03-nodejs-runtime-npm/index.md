# M03 — Node.js Runtime & npm

**Module M03 · Week 1 · Days 4-5 · about 3 hours**

Learn what Node.js is and how it runs your code, use its built-in modules, manage dependencies with npm, and build two small programs: a CLI that streams a 100 MB log file, and an HTTP server with no framework.

## Overview & time plan

**Builds on:** M01 and M02. You need the `node-js-training` repo, Node.js 24, `"type": "module"` in `package.json`, and the branch and pull request steps from M01. Everything you write here goes into that same repo. This module teaches what a *JavaScript/Node.js module* is (ESM vs CommonJS), so the word "module" in section 1 means that. The course "modules" (M01, M02, M03) are the lessons.

You already write JavaScript. This module is about the **runtime** that runs it: what Node.js gives you beyond the language (files, networking, processes), and how to pull in other people's code safely with npm. You build two things:

- **`log-report`**, a command-line tool that reads a log file of about 100 MB and writes a JSON report, without loading the whole file into memory.
- **A bare HTTP server** with three JSON endpoints, written with only Node.js's built-in `node:http` module. It is meant to be a little painful. After it, you will know exactly what Express (M05) fixes.

You finish by merging both to `main` with a pull request. Nothing from this module is ported later. The Task API starts again in M05, but you will reuse the ideas.

1. What Node.js is, and modules: 20 min
2. Core APIs and process: 25 min
3. Build the log-report CLI: 50 min
4. Build the bare HTTP server: 35 min
5. npm and supply-chain hygiene: 25 min
6. Debugging: 10 min
7. Merge by pull request: 10 min
8. Check your understanding: 5 min

This page moves quickly. Type each code block yourself, run it, and compare with the *You should see* box. Commands are written for Git Bash on Windows, and for macOS and Linux Terminal. Your file paths, UUIDs, timings and memory numbers will differ from the examples. If anything else differs, check [Troubleshooting](#troubleshooting).

Start from a branch, so the pull request at the end is easy. Inside `node-js-training`, on `main` with a clean `git status`:

```bash
git switch -c feat/m03-runtime-npm
mkdir -p src/log-report src/server
```

## 1. What Node.js is, and modules (20 min)

### 1.1 What Node.js is

Node.js is a program that runs JavaScript outside the browser. It is made of three parts:

| Part | What it does |
| --- | --- |
| **V8** | Google's JavaScript engine (the same one as Chrome). It compiles and runs your JavaScript. |
| **libuv** | A C library that gives Node.js its **event loop**, the **thread pool**, and non-blocking access to files, timers and the network. |
| **Core APIs** | Built-in modules such as `node:fs`, `node:http` and `node:path`, and globals such as `fetch`. They connect your JavaScript to the operating system. |

Your JavaScript runs on **one thread**. When it asks for something slow (read a file, call an API), Node.js hands that job to libuv and keeps running other code. The network is handled by the operating system. Some jobs, such as file access, hashing and compression, run on a small **thread pool** of 4 worker threads. When the job finishes, its callback goes into the event loop's queue, which you met in M02. This is **non-blocking** I/O: while one request waits, your program serves another.

The opposite is **blocking**: code that holds the single thread so nothing else can run. That is fine for a one-off script and fatal for a busy server.

> **Where Node.js fits.** Node.js is a good fit for programs that spend most of their time **waiting**: web servers and APIs, command-line tools, anything that talks to files, databases and other services. It is a poor fit for long CPU-heavy work (video encoding, big maths) on the main thread, because that blocks everything. Node.js has **worker threads** for that work, which this course does not cover.

### 1.2 See blocking for yourself

Create `src/labs/runtime.js`. A timer asks for 100 ms, but the program then blocks for 500 ms.

```js
// Blocking vs non-blocking
console.log("1 start");

const started = Date.now();
setTimeout(() => {
  console.log(`3 timer fired after ${Date.now() - started} ms (asked for 100)`);
}, 100);

while (Date.now() - started < 500) {
  // busy-wait: nothing else can run during this loop
}

console.log(`2 blocked for ${Date.now() - started} ms`);

// Where am I?
console.log("file:", import.meta.filename);
console.log("folder:", import.meta.dirname);
```

```bash
node src/labs/runtime.js
```

*You should see:*

```text
1 start
2 blocked for 500 ms
file: /home/you/node-js-training/src/labs/runtime.js
folder: /home/you/node-js-training/src/labs
3 timer fired after 500 ms (asked for 100)
```

Your two paths are your own (on Windows they start with `C:\`). The timer is late because a timer can only run when the one thread is free.

### 1.3 Modules: ESM and CommonJS

A **JavaScript module** is a file that shares values with other files. Node.js has two systems:

|  | ES modules (ESM) | CommonJS (CJS) |
| --- | --- | --- |
| Share | `export const x = 1` | `module.exports = { x }` |
| Use | `import { x } from "./a.js"` | `const { x } = require("./a.js")` |
| This file's path | `import.meta.filename`, `import.meta.dirname` | `__filename`, `__dirname` |
| Relative imports | Need the extension (`./a.js`) | Extension optional |
| Top-level `await` | Yes | No |

ESM is the standard that browsers and TypeScript use, so this course uses it. Node.js decides which system a `.js` file uses from the nearest `package.json`: `"type": "module"` (set in M01) means ESM. You will meet CommonJS in older tutorials and packages, so be able to recognise `require` and `module.exports`.

Always import built-in modules with the **`node:` prefix**: `import path from "node:path"`. It tells readers (and Node.js) that this is a built-in and not a package from npm with a similar name.

**Checkpoint 1**

- [ ] You saw `3 timer fired` print last, after about 500 ms.
- [ ] You can say, in one sentence, why a blocked thread delays a timer.
- [ ] You can say what `"type": "module"` changes.

## 2. Core APIs and process (25 min)

Create `src/labs/core-apis.js` and add each block to the **end** of the file. Each block is one small tour of a core API.

```js
import path from "node:path";
import os from "node:os";
import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import { setTimeout as sleep } from "node:timers/promises";
import { promisify } from "node:util";

// path: build paths without worrying about / or \
const file = path.join(import.meta.dirname, "notes.txt");
console.log(path.basename(file), path.extname(file), path.basename(path.dirname(file)));

// os: facts about the machine
console.log(os.platform(), os.cpus().length > 0, typeof os.homedir());

// crypto: a random id
console.log(randomUUID().length);

// events: one thing announces, others listen
const bus = new EventEmitter();
bus.on("greet", (name) => console.log(`hello, ${name}`));
bus.emit("greet", "Ada");

// timers/promises: sleep without writing your own
await sleep(50);

// util.promisify: turn a callback function into a promise function
const legacy = (n, callback) => setTimeout(() => callback(null, n * 2), 10);
console.log(await promisify(legacy)(21));
```

Why these? `path.join` builds paths that work on every operating system. `os` tells you about the machine. `randomUUID` makes ids you will use for the server's notes. `EventEmitter` is the "one thing announces, others listen" pattern that streams and servers are built on. `node:timers/promises` is the built-in version of your M02 `sleep`. `promisify` wraps an old callback-style function, like the ones in M02's last section.

Now the globals. These need no import:

```js
// Globals: no import needed
const url = new URL("https://example.com/tasks?status=done&limit=5");
console.log(url.pathname, url.searchParams.get("limit"));

const original = { tags: ["a"], nested: { n: 1 } };
const copy = structuredClone(original);
copy.nested.n = 2;
console.log(original.nested.n, copy.nested.n);

const controller = new AbortController();
const waiting = sleep(5000, null, { signal: controller.signal }).catch((e) => e.name);
controller.abort();
console.log(await waiting);
```

`URL` parses addresses (you will use it in the server). `structuredClone` makes a deep copy, so changing `copy` leaves `original` alone. An `AbortController` cancels work: you pass its `signal` to the work, and `abort()` stops it. `fetch` is also a global, and you used it in M02.

Last, the `process` object, which describes the running program:

```js
// process: argv, env, exit code
console.log(process.argv.slice(2));
console.log(process.env.GREETING ?? "(GREETING not set)");
process.exitCode = 3;
```

`process.argv` is the list of command-line words (the first two are Node.js and your script, so `slice(2)` gives yours). `process.env` holds **environment variables**: settings from outside the program, such as a port or a password, so they stay out of your code. The **exit code** tells whatever ran your program if it worked: `0` means success and anything else means failure. Run it:

```bash
node src/labs/core-apis.js hello --flag
echo $?
```

*You should see:*

```text
notes.txt .txt labs
linux true string
36
hello, Ada
42
/tasks 5
1 2
AbortError
[ 'hello', '--flag' ]
(GREETING not set)
3
```

The second line starts with `win32` on Windows and `darwin` on macOS. The last `3` comes from `echo $?`. In PowerShell, use `$LASTEXITCODE` instead.

### 2.1 Configuration with .env

Set a variable for one run, then keep settings in a file:

```bash
GREETING=hi node src/labs/core-apis.js | tail -1
```

That form works on macOS, Linux and Git Bash. Better, put settings in a `.env` file (it is already in `.gitignore`, from M01, so it never reaches GitHub) and tell Node.js to load it with `--env-file`:

```bash
echo "GREETING=from the file" > .env
node --env-file=.env src/labs/core-apis.js | tail -2
```

*You should see:*

```text
[]
from the file
```

No packages needed. Keep `.env` for section 4. Use `--env-file-if-exists=.env` when the file is optional.

> **Awareness only.** Node.js also has a built-in test runner (`node:test`) and a built-in SQLite module (`node:sqlite`). This course uses Jest (M09) and Prisma (M07) instead, so you do not need either. Streams (`node:stream`) are the next section, and `node:http` is section 4.

**Checkpoint 2**

- [ ] `core-apis.js` prints the output above, and `echo $?` shows `3`.
- [ ] You loaded `GREETING` from `.env` with `--env-file`.
- [ ] You can say why a secret belongs in `.env` and not in your code.

Commit your work so far:

```bash
git add .
git commit -m "docs: add runtime and core API labs"
```

## 3. Build the log-report CLI (50 min)

The goal: read a log file of about 100 MB, count requests by status code and by path, and write a JSON report. The point: do it **without holding the file in memory**.

### 3.1 Make the log file

Each line of the log is one request: a timestamp, a status code, a method, a path, and how many milliseconds it took.

```text
2026-03-01T00:00:00.000Z 200 GET /api/users/me 111
```

You will not write the generator, so copy it as it is. It makes 2,000,000 lines. Create `src/log-report/generate-log.js`:

```js
// Writes a fake access log, one line per request:
//   2026-03-01T00:00:00.000Z 200 GET /api/tasks 42
// Run it once: node src/log-report/generate-log.js
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { once } from "node:events";
import path from "node:path";

const LINES = 2_000_000;
const output = path.join(import.meta.dirname, "../../data/access.log");

const statuses = [200, 200, 200, 200, 200, 201, 204, 301, 304, 400, 401, 404, 404, 500, 503];
const methods = ["GET", "GET", "GET", "POST", "PUT", "DELETE"];
const paths = ["/", "/login", "/api/tasks", "/api/tasks/1", "/api/tasks/2", "/api/users",
  "/api/users/me", "/health", "/static/app.js", "/static/style.css", "/favicon.ico", "/search"];

// A tiny seeded random generator, so everyone gets the same file
let seed = 42;
const random = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const pick = (list) => list[Math.floor(random() * list.length)];

await mkdir(path.dirname(output), { recursive: true });
const out = createWriteStream(output);
const start = Date.parse("2026-03-01T00:00:00Z");

for (let i = 0; i < LINES; i++) {
  const time = new Date(start + i * 40).toISOString();
  const line = `${time} ${pick(statuses)} ${pick(methods)} ${pick(paths)} ${Math.floor(random() * 500)}\n`;
  // write() returns false when the buffer is full: wait until it drains
  if (!out.write(line)) await once(out, "drain");
}

out.end();
await once(out, "finish");
console.log(`Wrote ${LINES} lines to ${output}`);
```

The file goes in a `data/` folder. It is about 100 MB, so it must **never** be committed. Add `data` to `.gitignore`, then run the generator (a few seconds):

```bash
printf '\ndata\n' >> .gitignore
node src/log-report/generate-log.js
```

*You should see:*

```text
Wrote 2000000 lines to /home/you/node-js-training/data/access.log
```

Check the file:

```bash
ls -lh data/access.log
wc -l data/access.log
head -3 data/access.log
git status
```

You should see a file of about 93 MB, 2000000 lines, lines that look like the example above, and `git status` listing only `.gitignore` (not `data/`). On Windows Git Bash, `ls`, `wc` and `head` work the same way.

Notice what the generator does: it writes with a **stream**, and `write()` returns `false` when its buffer is full, so it waits for the `drain` event. That waiting is called **backpressure**. A stream never needs the whole file at once, and it slows down a fast producer for a slow consumer. Keep that idea for the next steps.

### 3.2 The wrong way, on purpose

The easy way to count lines is to read the whole file into a string. Create `src/log-report/read-all.js`:

```js
// The wrong way, on purpose: load the whole file, then count lines
import { readFile } from "node:fs/promises";
import path from "node:path";

const file = path.join(import.meta.dirname, "../../data/access.log");
const text = await readFile(file, "utf8");
const lines = text.split("\n");

const peakMb = Math.round(process.resourceUsage().maxRSS / 1024);
console.log(`${lines.length - 1} lines, peak memory ${peakMb} MB`);
```

```bash
node src/log-report/read-all.js
```

*You should see:*

```text
2000000 lines, peak memory 321 MB
```

Your number will differ by machine and operating system, but it will be several times the size of the file.

It works, but Node.js held the whole file in memory (as a string, and then as an array of lines). With a 100 MB file that is wasteful. With a 5 GB file it crashes, and a web server that did this for every request would run out of memory. Keep the number. You will compare it.

### 3.3 The right way: stream it

A **stream** gives you a file in small chunks, one at a time. `createReadStream` reads chunks, and `node:readline` turns chunks into lines. `for await` takes the lines one by one. Only the running counts stay in memory.

Create `src/log-report/log-report.js`. Read it in three parts after the code.

```js
import { createReadStream } from "node:fs";
import { writeFile, mkdir } from "node:fs/promises";
import { createInterface } from "node:readline";
import path from "node:path";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    input: { type: "string", short: "i", default: "data/access.log" },
    output: { type: "string", short: "o", default: "data/report.json" },
    top: { type: "string", short: "t", default: "5" },
  },
});
const top = Number(values.top);

if (!Number.isInteger(top) || top < 1) {
  console.error(`--top must be a whole number of 1 or more, got "${values.top}"`);
  process.exit(2);
}

const byStatus = {};
const pathCounts = new Map();
let totalLines = 0;
let malformed = 0;

try {
  const lines = createInterface({
    input: createReadStream(values.input),
    crlfDelay: Infinity,
  });

  // Lines arrive one at a time. Only the counts stay in memory.
  for await (const line of lines) {
    totalLines++;
    const parts = line.split(" ");
    if (parts.length !== 5) {
      malformed++;
      continue;
    }
    const [, status, , requestPath] = parts;
    byStatus[status] = (byStatus[status] ?? 0) + 1;
    pathCounts.set(requestPath, (pathCounts.get(requestPath) ?? 0) + 1);
  }
} catch (error) {
  console.error(`Could not read ${values.input}: ${error.message}`);
  process.exit(1);
}

const topPaths = [...pathCounts]
  .sort((a, b) => b[1] - a[1])
  .slice(0, top)
  .map(([requestPath, count]) => ({ path: requestPath, count }));

const report = { input: values.input, totalLines, malformed, byStatus, topPaths };

await mkdir(path.dirname(values.output), { recursive: true });
await writeFile(values.output, JSON.stringify(report, null, 2));

const peakMb = Math.round(process.resourceUsage().maxRSS / 1024);
console.log(`Read ${totalLines} lines, wrote ${values.output}, peak memory ${peakMb} MB`);
```

- **Options.** `parseArgs` (from `node:util`) reads the command line for you. Each option has a type, an optional one-letter `short` form and a default. Values from the command line are always strings, so `--top` is converted with `Number` and checked.
- **The loop.** Each line is split on spaces into five parts: time, status, method, path, milliseconds. The code counts the status and the path. A line that does not have five parts is counted as `malformed` instead of crashing the program.
- **Failing well.** A bad option exits with code `2`, and a file that cannot be read exits with code `1`, both with a message on stderr (`console.error`). Exit `0` stays for success, so scripts and other tools can tell what happened.

Run it:

```bash
node src/log-report/log-report.js
head -12 data/report.json
```

*You should see:*

```text
Read 2000000 lines, wrote data/report.json, peak memory 73 MB
{
  "input": "data/access.log",
  "totalLines": 2000000,
  "malformed": 0,
  "byStatus": {
    "200": 667365,
    "201": 133486,
    "204": 132975,
    "301": 133509,
    "304": 133565,
    "400": 133145,
```

The counts are exactly these if you used the generator unchanged (its random numbers are seeded). The peak memory is far below `read-all.js`. About 45 MB of it is Node.js itself. The gap gets bigger as the file gets bigger, because the streaming version does not grow with the file.

Now try the options and the failures:

```bash
node src/log-report/log-report.js --top 2 -o data/small.json
node src/log-report/log-report.js -i nope.log
echo $?
node src/log-report/log-report.js --top abc
echo $?
```

*You should see:*

```text
Read 2000000 lines, wrote data/small.json, peak memory 73 MB
Could not read nope.log: ENOENT: no such file or directory, open 'nope.log'
1
--top must be a whole number of 1 or more, got "abc"
2
```

> **Streaming means no JSON.parse of the whole file.** The trick only works if each line can be handled alone. Counting and filtering do. Sorting the whole file, or parsing one big JSON file, needs all of it at once. That is when you reach for a database (M06).

### 3.4 A script for it

Add scripts so you do not type long commands. `npm pkg set` edits `package.json` for you:

```bash
npm pkg set scripts.report="node src/log-report/log-report.js"
npm run report -- --top 3
node --run report
```

`npm run report -- --top 3` passes `--top 3` to your script (the `--` separates npm's own options from yours). `node --run` runs a script from `package.json` too, faster than npm, but it does not pass through npm features. Both print the same line you saw above.

**Checkpoint 3**

- [ ] The report shows 2000000 lines and the counts above.
- [ ] You saw your own numbers: `read-all.js` used several times more memory than `log-report.js`.
- [ ] `git status` does not list `data/`.
- [ ] You can say, in your own words, what would break if `log-report.js` loaded the whole file first.

Commit:

```bash
git add .
git commit -m "feat: add streaming log-report cli"
```

## 4. Build the bare HTTP server (35 min)

Now the second program. You will build a small notes API with only `node:http`. Every convenience you would expect is missing on purpose. Pay attention to what is annoying, because you will use that list at the end of the section.

The three endpoints:

| Request | Result |
| --- | --- |
| `GET /health` | `200` with `{ "status": "ok" }` |
| `GET /notes` | `200` with a list of notes |
| `POST /notes` | `201` with the new note. Body: `{ "text": "..." }` |

### 4.1 Write the server

Create `src/server/server.js`:

```js
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.PORT ?? 3000);
const notes = [];

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

// A request body arrives in chunks. You collect them yourself.
async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  return JSON.parse(text); // throws on bad JSON
}

const server = createServer(async (req, res) => {
  // Routing by hand: match the method and the path yourself
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (pathname === "/health") {
      if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed" });
      return sendJson(res, 200, { status: "ok" });
    }

    if (pathname === "/notes") {
      if (req.method === "GET") return sendJson(res, 200, notes);

      if (req.method === "POST") {
        const body = await readJson(req);
        if (typeof body?.text !== "string" || body.text.trim() === "") {
          return sendJson(res, 400, { error: "text must be a non-empty string" });
        }
        const note = { id: randomUUID(), text: body.text.trim() };
        notes.push(note);
        return sendJson(res, 201, note);
      }

      return sendJson(res, 405, { error: "Method not allowed" });
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    if (error instanceof SyntaxError) return sendJson(res, 400, { error: "Body is not valid JSON" });
    console.error(error);
    sendJson(res, 500, { error: "Internal server error" });
  }
});

server.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));

// Stop cleanly on Ctrl+C or a kill signal
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    console.log(`${signal} received, closing`);
    server.close(() => process.exit(0));
  });
}
```

What each part does, and why it is awkward:

- **`createServer`** gives you a function that runs once per request, with a request (`req`) and a response (`res`). That is all you get.
- **Routing** is `if` on `req.method` and the path. You also write the 404 and 405 answers.
- **The body** arrives as a stream of chunks. You gather them, join them and parse the JSON yourself, and handle the bad-JSON case yourself.
- **`sendJson`** exists because `res` does not know about JSON. You set the status and the header every time.
- **`PORT`** comes from `process.env`, as in section 2.
- **Signals.** `Ctrl+C` sends `SIGINT`, and a stop request from a hosting service sends `SIGTERM`. Your handler closes the server, so it stops taking new requests and finishes the ones it has, then exits with `0`.

### 4.2 Run it with .env and --watch

Put a port in `.env`, add two scripts, and start the server in development mode:

```bash
echo "PORT=4000" > .env
npm pkg set scripts.server="node --env-file-if-exists=.env src/server/server.js"
npm pkg set scripts.dev="node --watch --env-file-if-exists=.env src/server/server.js"
npm run dev
```

`--watch` restarts the server each time you save a file, so you do not stop and start it by hand. Leave it running.

*You should see:*

```text
> js-training@1.0.0 dev
> node --watch --env-file-if-exists=.env src/server/server.js

Listening on http://localhost:4000
```

The first line shows the `name` in your `package.json`.

### 4.3 Call it

Open a **second terminal** in the same folder and call the three endpoints. `curl` comes with Git Bash, macOS and Linux. `-i` prints the status line, and `-d` sends a body.

```bash
curl -i localhost:4000/health
curl -i -X POST localhost:4000/notes -H "Content-Type: application/json" -d '{"text":"first note"}'
curl -i localhost:4000/notes
```

*You should see:*

```text
HTTP/1.1 200 OK
{"status":"ok"}

HTTP/1.1 201 Created
{"id":"0f102a55-c552-4fe3-aaca-4736e067054c","text":"first note"}

HTTP/1.1 200 OK
[{"id":"0f102a55-c552-4fe3-aaca-4736e067054c","text":"first note"}]
```

Each response also has headers between the status line and the body. Your `id` is different. The notes live in memory, so they vanish when the server restarts.

Now break it on purpose, to see the error answers:

```bash
curl -i -X POST localhost:4000/notes -H "Content-Type: application/json" -d '{oops'
curl -i -X POST localhost:4000/notes -H "Content-Type: application/json" -d '{"text":""}'
curl -i localhost:4000/nope
curl -i -X DELETE localhost:4000/notes
```

*You should see:*

```text
HTTP/1.1 400 Bad Request
{"error":"Body is not valid JSON"}

HTTP/1.1 400 Bad Request
{"error":"text must be a non-empty string"}

HTTP/1.1 404 Not Found
{"error":"Not found"}

HTTP/1.1 405 Method Not Allowed
{"error":"Method not allowed"}
```

Go back to the first terminal and press `Ctrl+C`.

*You should see:*

```text
SIGINT received, closing
```

You get your prompt back. Without the signal handler, the process would be killed on the spot, in the middle of any request.

### 4.4 What hurt?

This is the point of the lab. Before you read on, write down **three or more things** that were awkward or repetitive in `server.js`, in your own words. Add them to your project `README.md` under a heading `## What Express would remove`. You will commit that file with the rest. Then open the list below and compare.

**What a framework like Express removes**
- **Routing by hand.** The `if (pathname === ...)` and `if (req.method === ...)` chain grows with every endpoint. There are no route patterns, so something like `/notes/:id` would need string splitting. Express gives you `app.get("/notes", handler)` and `req.params.id`.
- **Reading the body.** Collecting chunks, joining them and calling `JSON.parse` is code you would repeat for every route. Express has one line of middleware for it.
- **JSON responses.** `sendJson` sets the header and the status every time. Express has `res.status(201).json(note)`.
- **Errors in one place.** The `try/catch` handles every failure for every route, and the 404 and 405 answers are written by hand. Express has error-handling middleware and a built-in 404 path.
- **Shared steps (middleware).** Logging, authentication and body parsing for every request would mean calling extra functions at the top of your one big handler. Express lets you add a step once, for all routes or some.
- **Query strings and validation.** `new URL` does the parsing, but checking `text` is still your own `if`. M08 replaces that with Zod.

**Checkpoint 4**

- [ ] All seven `curl` calls gave the status codes above.
- [ ] `Ctrl+C` printed `SIGINT received, closing` and stopped the server.
- [ ] You wrote your own three-or-more-item list in `README.md` before reading the sample.

Commit:

```bash
git add .
git commit -m "feat: add bare node:http server"
```

## 5. npm and supply-chain hygiene (25 min)

So far your program has **no dependencies**: you used only Node.js's built-in modules. Most real projects also install packages from the npm registry. That saves time, and it also means running other people's code on your machine. This section is about doing it safely.

### 5.1 package.json

Open `package.json`. The parts that matter:

| Field | What it is |
| --- | --- |
| `name`, `version` | What the project is called, and its version. |
| `type` | `"module"` makes `.js` files ESM (section 1). |
| `scripts` | Named commands: `npm run <name>`. `start` and `test` can be run as `npm start` and `npm test`. |
| `dependencies` | Packages your program needs when it runs. |
| `devDependencies` | Packages you need only while building: formatters, test tools. |
| `engines` | The Node.js versions the project supports. npm only warns unless you turn on `engine-strict`. |

Add `engines`, to match the `.nvmrc` from M01:

```bash
npm pkg set engines.node=">=24"
```

### 5.2 Install a package and read the version

You will install one well-known package, `prettier` (a code formatter), at an **old** version on purpose, so you have something to update.

```bash
npm install -D prettier@3.0.0
```

`-D` (short for `--save-dev`) records it under `devDependencies`. Check `package.json`:

```json
"devDependencies": {
  "prettier": "^3.0.0"
}
```

That `^3.0.0` is a **semver range**. A version has three parts, `major.minor.patch`:

| Range | Allows | Means |
| --- | --- | --- |
| `^3.0.0` | `3.0.0` up to (not including) `4.0.0` | New features and fixes, no breaking changes. The default. |
| `~3.0.0` | `3.0.0` up to (not including) `3.1.0` | Bug fixes only. |
| `3.0.0` | exactly `3.0.0` | No movement. |

Two new things now exist: a `node_modules/` folder (the installed code, already in `.gitignore`) and **`package-lock.json`**. The lockfile records the **exact** version of every package, including packages that your package needs, so everyone gets the same code. **Commit the lockfile, never `node_modules`.**

### 5.3 Outdated, update, and ci

```bash
npm outdated
```

*You should see:*

```text
Package   Current  Wanted  Latest  Location               Depended by
prettier    3.0.0  3.9.10  3.9.10  node_modules/prettier  node-js-training
```

Your Wanted and Latest versions will be newer than these, and the last column shows your folder name. *Wanted* is the highest version your range allows, and *Latest* is the newest that exists. They match here because `^3.0.0` allows everything up to 4.0.0.

```bash
npm update
git diff --stat
```

`npm update` moves to *Wanted* and edits the lockfile. It leaves the range in `package.json` alone.

*You should see:*

```text
 package-lock.json | 6 +++---
 1 file changed, 3 insertions(+), 3 deletions(-)
```

The numbers will vary a little. `package.json` is not listed, because `^3.0.0` already allowed the new version. If your new version is a **major** version, update with `npm install prettier@latest` instead, and read its release notes first.

**`npm install` and `npm ci` are different.** `npm install` can change the lockfile. **`npm ci`** (clean install) deletes `node_modules` and installs *exactly* what the lockfile says, and fails if `package.json` and the lockfile disagree. Use `npm ci` on servers and in CI, so a build is the same every time. Try it:

```bash
npm ci
npm ls
```

*You should see:*

```text
js-training@1.0.0 /home/you/node-js-training
└── prettier@3.9.10
```

### 5.4 npx and audit

`npx` runs a package's command without installing it globally. Since `prettier` is now in your project, `npx` finds it there:

```bash
npx prettier --version
npm audit
```

*You should see:*

```text
3.9.10
found 0 vulnerabilities
```

`npm audit` checks your installed versions against a list of known security problems. If it reports problems, `npm audit fix` applies safe fixes. Read what it changes. Do not use `npm audit fix --force`, because it may install breaking major versions.

### 5.5 Before you install anything

Anyone can publish to npm, and an install can run code on your machine. **Lifecycle scripts** (`preinstall`, `install`, `postinstall`) in a package run automatically during `npm install`. Attacks use them, and use look-alike names (`expres` for `express`) too. Before you add a package:

- **Check the name** letter by letter against the package's own documentation.
- **Look at the page** on npmjs.com: weekly downloads, last publish date, the linked repository, the maintainers.
- **Read what it pulls in.** `npm view <name> dependencies` lists its dependencies. Fewer is better.
- **Look for install scripts:** `npm view <name> scripts` (look for `preinstall`, `install` and `postinstall`). To install without running scripts, add `--ignore-scripts`.
- **Do you need it?** A built-in module (this module is full of them) has no supply chain at all.
- **Review the lockfile diff** in every pull request that changes `package-lock.json`. New packages, a changed `resolved` address, or a surprising number of changes deserve a question.

Try the check on the package you installed:

```bash
npm view prettier scripts.postinstall dependencies license
```

*You should see:*

```text
MIT
```

Prettier has no dependencies and no `postinstall` script, so those two lines do not print.

**Checkpoint 5**

- [ ] `package.json` lists `prettier` under `devDependencies`, and `engines`.
- [ ] `npm ci`, `npm ls` and `npm audit` all work.
- [ ] You can say the difference between `^3.0.0` and `~3.0.0`, and between `npm install` and `npm ci`.
- [ ] You can name two things you check before installing a package.

Commit:

```bash
git add .
git commit -m "chore: add prettier as a dev dependency"
```

## 6. Debugging (10 min)

### 6.1 Console methods

`console.log` is not the only one. Create `src/labs/debug.js` and run it:

```js
const rows = [
  { status: 200, count: 3 },
  { status: 404, count: 1 },
];
console.table(rows);

console.dir({ a: { b: { c: { d: 1 } } } }, { depth: null });

console.time("sum");
let sum = 0;
for (let i = 0; i < 1e7; i++) sum += i;
console.timeEnd("sum");

console.error("this line goes to stderr");
```

```bash
node src/labs/debug.js
```

*You should see:*

```text
┌─────────┬────────┬───────┐
│ (index) │ status │ count │
├─────────┼────────┼───────┤
│ 0       │ 200    │ 3     │
│ 1       │ 404    │ 1     │
└─────────┴────────┴───────┘
{
  a: { b: { c: { d: 1 } } }
}
sum: 6.44ms
this line goes to stderr
```

Your `sum` time will differ. `console.table` draws a table, `console.dir` with `depth: null` prints nested objects in full (`console.log` stops at depth 2), `console.time` measures, and `console.error` writes to **stderr**, a separate stream from normal output. Try `node src/labs/debug.js 2>/dev/null` to hide it.

### 6.2 Read a stack trace

Make an error on purpose, using an option `log-report` does not know:

```bash
node src/log-report/log-report.js --bogus
```

*You should see:*

```text
node:internal/util/parse_args/parse_args:102
      throw new ERR_PARSE_ARGS_UNKNOWN_OPTION(
            ^

TypeError [ERR_PARSE_ARGS_UNKNOWN_OPTION]: Unknown option '--bogus'
    at checkOptionUsage (node:internal/util/parse_args/parse_args:102:13)
    at ...
    at parseArgs (node:internal/util/parse_args/parse_args:374:3)
    at file:///home/you/node-js-training/src/log-report/log-report.js:7:20
    ...
```

The middle lines are trimmed here, and yours show more.

Read it **top to bottom**: the first line says what and where Node.js stopped, the error line gives the type, the code and the message (this tells you the problem), and the `at` lines are the **call stack**, newest first. Skip lines starting with `node:` (that is Node.js's own code) and find the first line with *your* file. Here, it is `log-report.js:7:20`: line 7, column 20, which is the `parseArgs(` call. The fix is in your code, even though the error started deeper.

### 6.3 The debugger

A **breakpoint** pauses your program so you can look at its variables. In VS Code:

1. Open `src/server/server.js` and click in the margin left of the line `const { pathname } = ...` to set a red dot.
2. Open the command palette (`Ctrl+Shift+P`, or `Cmd+Shift+P` on macOS), run **Debug: JavaScript Debug Terminal**, and in that terminal run `npm run server`.
3. In another terminal, run `curl localhost:4000/health`.
4. VS Code stops on your line. Hover over `req.method` and `req.url`, or open the Variables panel. Use the toolbar to step over (F10) or continue (F5).

That works because VS Code starts Node.js with `--inspect`, which opens a port a debugger can connect to. You can also run `node --inspect src/server/server.js` and attach any debugger.

**Checkpoint 6**

- [ ] You ran `debug.js` and saw the table.
- [ ] You can find the first line of your own code in a stack trace.
- [ ] VS Code stopped at your breakpoint in `server.js` and you saw `req.method`.

## 7. Merge by pull request (10 min)

You work alone, so you review your own pull request. That still helps: the diff view shows what you are about to merge, and you will notice mistakes you did not see while writing. You have not been on `main` since section 1, so your branch holds everything.

1. Push the branch. The first push needs the upstream flag:

   ```bash
   git status
   git push -u origin feat/m03-runtime-npm
   ```

2. Open your repo on GitHub and click **Compare & pull request**, as in M01. Set the title to `feat: add log-report cli and bare http server`.

3. Open the **Files changed** tab and read it once. Check you see **no** `data/` folder, no `.env` and no `node_modules`. You should see `package-lock.json`: scroll to it and look at what was added. This is the lockfile diff review from section 5.

4. Click **Merge pull request**, then confirm.

5. Update your local `main`:

   ```bash
   git switch main
   git pull
   git log --oneline -3
   ```

   *You should see:*

   ```text
   a1b2c3d (HEAD -> main, origin/main) Merge pull request #2 from you/feat/m03-runtime-npm
   ...
   ```

   Your hashes and PR number will differ.

## Check your understanding (5 min)

Answer each one in your head, then open it to compare.

**In `runtime.js`, a 100 ms timer fired after about 500 ms. Why?**
Node.js runs your JavaScript on one thread. The `while` loop kept that thread busy, so the event loop could not run the timer's callback until the loop finished. A timer is a minimum delay, not a promise.

**Why does `log-report` use a stream, and what breaks if it uses `readFile`?**
A stream hands over the file in small chunks, so memory use stays about the same whatever the file size. `readFile` puts the whole file in memory first (about 321 MB against 73 MB for you), and for a file bigger than about half a gigabyte it fails outright (a string has a maximum length). The same mistake in a web server multiplies by the number of requests.

**What does `^1.4.2` allow, and why commit `package-lock.json`?**
`^1.4.2` allows any `1.x.y` version from `1.4.2` up, but not `2.0.0`. The lockfile pins the exact version of every package, so everyone (and the server) installs the same code. `npm ci` installs exactly from it.

**Why use the `node:` prefix, and why `import.meta.dirname` in an ES module?**
`node:path` says plainly that it is a built-in, and it cannot be confused with an npm package of a similar name. ES modules have no `__dirname`, so `import.meta.dirname` gives the folder of the current file, which makes paths work no matter where you run the command from.

**Name two things about a package that make you stop before running `npm install` on it.**
Examples: the name is one letter away from a popular package; it has a `postinstall` script you do not understand; it has few downloads, no repository or a very recent first publish; it pulls in a large tree of dependencies for a small job; or a built-in module already does the job.

**From the bare server, name two things Express removes.**
Any two from the list in section 4.4: route matching, reading and parsing the body, a JSON response helper, one place for errors, middleware for shared steps.

## Troubleshooting

**`ERR_MODULE_NOT_FOUND` or `Cannot find module`**
Check the path and the file name in your `import`, and that a relative import ends in `.js` (`./a.js`). Check you run the command from the `node-js-training` folder. For a package, run `npm ci` and try again.

**`ReferenceError: require is not defined in ES module scope`**
You used CommonJS in an ES module. Replace `const x = require("node:fs")` with `import x from "node:fs"`. `"type": "module"` in `package.json` makes every `.js` file an ES module.

**`EADDRINUSE: address already in use :::4000`**
Another program (often your earlier server) is using the port. Stop it with `Ctrl+C`, or change `PORT` in `.env`. To find the process on macOS and Linux, run `lsof -i :4000`, then `kill <pid>`. On Windows, run `netstat -ano | findstr :4000`, then `taskkill /PID <pid> /F`.

**`node: .env: not found`**
The `.env` file is not in the folder where you ran the command. Create it in the repo root, or use `--env-file-if-exists=.env` as in the scripts.

**`curl` shows `Could not resolve host` or a connection error**
Check the server is running in the other terminal and prints `Listening on http://localhost:4000` (or your `PORT`). In Windows PowerShell, `curl` is an alias for another command: use Git Bash, or write `curl.exe`.

**`curl` says `{"error":"Body is not valid JSON"}` for a body that looks right**
Quotes got changed by the terminal. Use single quotes around the JSON in Git Bash, macOS and Linux (`-d '{"text":"hi"}'`). Windows PowerShell and cmd need different escaping, so use Git Bash.

**`Ctrl+C` does not stop the server or it stays open for a while**
After `Ctrl+C`, the handler waits for open connections to finish. Press `Ctrl+C` again to force it, and make sure no `curl` call is still running.

**`git status` shows `data/access.log` as a new file**
The `data` line is missing from `.gitignore`, or was added on the same line as another entry. Open `.gitignore` and put `data` on its own line. If you already staged it, run `git rm --cached -r data`.

**`npm ci` says `package.json and package-lock.json are not in sync`**
You edited `package.json` by hand without updating the lockfile. Run `npm install`, then commit both files.

**`npm error EACCES` or permission errors during install**
You may have installed Node.js with `sudo`, or into a system folder. Reinstall Node.js with `nvm`, as in M01, so npm writes to your own folders. Do not use `sudo npm`.

**The VS Code debugger never stops at the breakpoint**
Start the server from the **JavaScript Debug Terminal** (not a normal terminal), check the red dot is solid and not grey, and call the endpoint again. If your VS Code labels things differently, search the command palette for "JavaScript Debug Terminal".

**The memory numbers are very different from the page**
The numbers depend on your machine and operating system. What matters is the gap: the streaming version should use a small fraction of what `read-all.js` uses. If both are about the same, check you ran `log-report.js` and not `read-all.js`.

## You're done when

- [ ] `node src/log-report/generate-log.js` made `data/access.log`, and `git status` never shows it.
- [ ] `npm run report` writes a valid `data/report.json` with 2000000 lines, and you have your own streaming vs `readFile` memory numbers.
- [ ] The bare server answers `GET /health`, `GET /notes` and `POST /notes`, and stops cleanly on `Ctrl+C`.
- [ ] Your `README.md` has your own list under `What Express would remove`.
- [ ] `npm ci` and `npm audit` finish cleanly, and `package.json` has `engines`.
- [ ] Both programs are merged to `main` by a pull request, and `main` is up to date on your machine.

Keep the repo as it is. M04 moves you to TypeScript, and M05 builds this kind of API again with Express.

Previous: [M02, Modern JavaScript & Async/Await](../m02-modern-javascript-async-await/index.md). Next: [M04, TypeScript Basics & TypeScript on Node.js](../m04-typescript-on-node/index.md).
