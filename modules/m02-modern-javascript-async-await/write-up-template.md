# M02 Write-Up — Modern JavaScript & Async/Await

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own.

## What I built

The Async toolkit module (`sleep`, `retry`, `withTimeout`, `mapLimit`), its self-checks, and your
actual sequential-vs-parallel timing numbers.

**Training module page (authored, 2026-10-12).** A student-facing page for M02 as twin files,
`index.html` and `index.md`, beside the brief. It is about 2 hours (120 min): modern JavaScript 25,
how async code runs 20, build the toolkit 45, fetch sequential vs parallel 15, callbacks to promises
10, check your understanding 5. The lab is built inside the M01 `node-js-training` repo:
`src/toolkit/toolkit.js` (`sleep`, `TimeoutError`, `withTimeout`, `retry`, `mapLimit`, named exports),
`src/toolkit/check.js` (`node:assert` self-checks, `npm run check`), and `src/labs/` with
`essentials.js`, `event-loop.js`, `fetch-timing.js`, `fs-callbacks.js`, `fs-promises.js` and
`notes.txt`. The repo state in is M01's; out is those files plus a `check` script. The home page row
now links to M02, and M01's pager links forward. The lab itself (building and pushing in a real
student repo) is still to be done by a student.

## Why it's built this way (key decisions)

- Why did you implement `retry` and `mapLimit` the way you did?
- What would have changed if you'd fetched sequentially instead of in parallel, or vice versa?
- Which of the brief's pitfalls (forgotten `await`, `await` in loops, unhandled rejections) did you
  specifically design around?

**Decisions on the training page (2026-10-12)**

- **2 hours, not 10.** You said M02 is absolutely not 10 hours. The page is cut to what the toolkit and
  later modules need. The brief and tasks still say 10 hours; I did not edit them. I changed M02's
  hours in `modules/README.md` and the home page row to 2.
- **Cut from the brief:** `Map`/`Set` (incl. the new `Set` methods), `#private` fields, getters/setters,
  `Promise.withResolvers`, `Promise.try`, `Array.fromAsync` and Temporal are in one "exists, but not
  needed yet" table, not practised. Also cut: the research tasks (the page teaches instead), and
  closures/`this` depth (one closure example, no `this` lesson).
- **No branch/PR/review.** The brief's "branch → PR → review → merge" is replaced with
  `git add .`, `git commit`, `git push`, matching the simplified M01.
- **Reusable on purpose:** the toolkit is one dependency-free ES module with named exports in
  `src/toolkit/`, so M04 can port it to TypeScript as-is. `TimeoutError` and the custom `AppError`
  example set up M05's error classes. Labs live apart in `src/labs/`.
- **Timing demo has two parts.** Real `fetch` gave only a small gap (about 340 vs 260 ms; the first run
  was 3 s for both). So part 1 uses `sleep` (about 1000 vs 200 ms), which proves the idea on any
  connection, and part 2 uses JSONPlaceholder as the brief decides.
- **Self-checks run on short real delays** (10-300 ms) and include a step where the student breaks
  `retry` and watches the check fail.
- **Page generated from one script** (kept in the session scratchpad, not the repo), reading the code
  from files I ran, so HTML and Markdown and the sample output cannot drift.

## How to build it (teach it to the next trainee)

Write a guide to building one of these utilities (your choice), using your own example to show the
reasoning, not just the syntax.

## Concepts worth explaining

Pick 1-2 ideas — the event loop/microtask queue, closures, or `Promise.all` vs `allSettled`/`race`/
`any` — and explain each in your own words.

## What tripped me up

Anything that didn't behave the way you expected the first time.

- (2026-10-12) My time plan summed to 115 min, not 120. Caught by the VALIDATE sum check; section 1
  became 25 min, then I moved 5 min from the closing questions to section 3 (45 / 5).
- First real `fetch` run: sequential 3255 ms vs parallel 279 ms, then sequential 386 vs 301 on the next
  run. Cold connection setup distorts a single run. Timings from memory would have been wrong, and
  the page now tells students to run it twice.
- Gave the first draft a claim that M03 uses the toolkit. M03's brief only says it reuses the async
  patterns, so I reworded it.
- The `forEach(async ...)` demo had nowhere to run, and `git add .` would have committed a stray file.
  The page now names `scratch.js` and tells students to delete it.
- `Temporal` is `undefined` in Node 24, so the page says it is not available yet.

## Checkpoint evidence

Show your self-checks passing, your actual sequential-vs-parallel timing numbers, and your
explanation of the `setTimeout`/promise/`await` output order.

(2026-10-12, page author, Linux/WSL, Node v24.21.0.) Every file was run in a scratch folder and the
page's "You should see" blocks come from those runs: `npm run check` prints four `ok` lines and
`All checks passed`; breaking `retry` fails with `4 !== 3`; `event-loop.js` prints
`1 start, 4 async function starts, 6 end, 3 promise, 5 after await, 2 timeout`; `fetch-timing.js` gave
about 1003 / 201 ms (`sleep`) and 375 / 259 ms (`fetch`). The toolkit was also rebuilt from the page's
own code blocks in a fresh folder and passed. Still student evidence to collect: their own numbers.

## What I'd do differently

If you started this module over, what would you do differently?

(2026-10-12) Ask the hour budget before the EVALUATE summary: I proposed 7 hours and you wanted 2.
Start from the smallest page that reaches the success mark (the passing `npm run check`).

Still open: Windows and macOS were not run (commands are plain Node and `git`, but `rm` and `cat` in
the page assume Git Bash); not viewed in a browser; the time plan is an estimate and section 3 (45 min)
and section 1 (25 min) are the likeliest to overrun; M01's Google Doc is stale (its pager changed);
`brief.md`, `tasks.md` and the PRD/arch doc still say 10 hours, peer review and research steps; the
home page still says about 80 hours in total and about 4 hours a day.
