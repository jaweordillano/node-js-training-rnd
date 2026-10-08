# M02 Write-Up — Modern JavaScript & Async/Await

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own.

> **Draft status:** first draft. Read it, rewrite anything in your own words, and fix anything that
> doesn't match what you actually experienced.

**Code:** [`m02-async-toolkit/`](../../m02-async-toolkit/) in this repo.

## What I built

**The starting point.** Real programs spend a lot of time waiting: for the network, for files, for
timers. The goal of this stage was to write code that waits *correctly*. That's harder than it
sounds, because waiting code can look right and still break in small ways.

So I built four small tools. Each one answers an everyday question:

| Question | Tool | What it does |
| --- | --- | --- |
| "I need to pause for a bit." | **`sleep`** | Waits a number of milliseconds, then carries on. |
| "This sometimes fails. Can I just try again?" | **`retry`** | Re-runs a task if it fails, up to a set number of times, with a pause in between. |
| "What if this never finishes?" | **`withTimeout`** | Gives up waiting on a task after a set time. |
| "I have a long list of tasks, but I can't run them all at once." | **`mapLimit`** | Runs a task for every item, but only a few at the same time. |

All four live in [`async-toolkit.js`](../../m02-async-toolkit/async-toolkit.js).

Then I used and tested them:

- **Self-checks** ([`async-toolkit.test.js`](../../m02-async-toolkit/async-toolkit.test.js)) — 17 checks that prove the four tools work.
- **Timing test** ([`timing.js`](../../m02-async-toolkit/timing.js)) — fetches 20 posts one by one, then all at once, and compares the time.
- **File refactor** ([`fs-refactor/`](../../m02-async-toolkit/fs-refactor/)) — the same file task written with callbacks, then with `async`/`await`.
- **Event loop demo** ([`event-loop.js`](../../m02-async-toolkit/event-loop.js)) — shows the order in which different kinds of code run.

## Why it's built this way (key decisions)

For each tool I started from the problem, looked at the options, and picked one.

**`retry` — "this sometimes fails"**

- *Problem:* network calls fail at random, and trying again often works.
- *Option A:* start all the attempts at once. That wastes effort, and defeats the point: we only want to
  try again *after* a failure.
- *Option B:* try, wait for the result, and only if it failed, pause and try again.
- *Picked B.* This is a rare case where `await` inside a loop is the right call, because each attempt
  depends on the one before it. If every try fails, it reports the last error, since that's the most
  recent clue about what's wrong.

**`withTimeout` — "what if this never finishes?"**

- *Problem:* a request that never answers would make the program wait forever.
- *Option A:* cancel the task. A plain promise can't be cancelled from outside.
- *Option B:* start a timer and a task together, and listen to whichever finishes first (a race).
- *Picked B.* The catch: we stop *waiting*, but the task keeps running in the background. It also
  cleans up its timer, so a fast task doesn't leave a timer behind.

**`mapLimit` — "a long list, but not all at once"**

- *Problem:* 1,000 requests. Fire all at once and we flood the server.
- *Option A:* all at once (`Promise.all`). Fast, but floods.
- *Option B:* one by one. Safe, but slow.
- *Option C:* batches of a few. Better, but each batch waits for its slowest task, so workers sit idle.
- *Option D:* a small team of workers. Each grabs the next item the moment it finishes its current one.
- *Picked D.* Results are saved by position, so they come back in the original order even when tasks
  finish at different times.

**Fetching one by one vs all at once**

- One by one, the waits add up. All at once, the waits overlap, so the total is about the slowest single
  request. That's why parallel wins in the timing test.
- All at once is wrong when tasks depend on each other, or when the list is huge. That's where
  `mapLimit` comes in.

**Pitfalls I avoided**

- Forgetting `await`: every task is awaited or returned.
- `forEach(async …)`: `forEach` doesn't wait for the tasks, so I didn't use it.
- Errors disappearing: nothing catches an error without either handling it or passing it on.

## How to build it (teach it to the next trainee)

**The roadmap.** Build in this order. Each step leans on the one before it.

1. **Set up.** Make a folder and a `package.json` with `"type": "module"` so you can use modern
   `import`/`export`. Create a test file that uses `node:assert`. Make it fail on purpose until you
   have real checks, because an empty test file "passes" and fools you.
2. **Build `sleep` first.** It's the simplest, and `retry` needs it for its pauses. Check it: after
   `sleep(50)`, at least 50 ms have passed.
3. **Build `retry` next.** Use `sleep` for the pause between attempts. Check it: it succeeds on the 3rd
   try, and it gives up with an error after too many failures.
4. **Build `withTimeout`.** Check it: a quick task returns its value, and a slow one fails with a
   timeout error.
5. **Build `mapLimit` last.** It's the trickiest (details below). Check it: results stay in order, and
   never more than the limit run at once.
6. **Use the tools.** Do the timing test, rewrite the file task from callbacks to `async`/`await`, and
   run the event loop demo.
7. **Prove it.** Run everything (see "How to check everything manually"). Then break the code on
   purpose to be sure the checks catch it.

**Deep dive: building `mapLimit`**

1. Running everything at once (`Promise.all`) can flood a server. Running one by one is too slow. We
   want something in between.
2. Create a few workers (`limit` of them). Each worker repeats: take the next item, wait for it to
   finish, take another, until the list runs out.
3. The workers share one counter: "next item number". JavaScript only runs one piece of code at a time,
   so two workers can't grab the same item.
4. Save each result at its own position, not at the end of the list. Tasks finish in a different order
   than they started, and this keeps the results in order.
5. Wait for all the workers to finish. If one fails, stop handing out new items.
6. Check the edges: an empty list, and a limit bigger than the list.
7. To test it, count how many tasks run at once and check it never goes above the limit.

## Concepts worth explaining

**The event loop.** JavaScript runs the code you wrote first, line by line. Things that happen "later"
wait in two lines:

- A **fast lane** for promises (`.then`, and everything after an `await`).
- A **slow lane** for timers like `setTimeout`.

When the main code finishes, JavaScript empties the whole fast lane first, then takes one thing from
the slow lane. That's why `setTimeout(…, 0)` still runs after every promise: "0" doesn't mean "right
now", it means "after the current work is done". In `event-loop.js` the order is
`A, E, G, C, D, F, B`: all the normal lines first (an `async` function runs normally until its first
`await`), then the promises, then the timer.

**`Promise.all`, `allSettled`, `race`, `any`.**

- `all` — waits for everything, but fails as soon as one fails.
- `allSettled` — waits for everything and reports what happened to each, never failing.
- `race` — the first one to finish wins, success or failure. `withTimeout` is a race between the task
  and a timer.
- `any` — the first one to succeed wins. It only fails if all of them fail.

## What tripped me up

- **A test that passed with nothing in it.** An empty test file "passes", so the first run looked fine.
  I made it fail on purpose until real checks existed.
- **Uneven timing.** The first run took 6.8 seconds, but later runs took about half a second. I
  don't know the exact cause. The test already makes a warm-up request first, so it wasn't just
  connection setup. It was most likely a one-off network delay. Because of this, I ran the test several
  times instead of trusting one number.
- **`withTimeout` doesn't cancel anything.** It's easy to assume the task stops. It doesn't. We just
  stop waiting for it.

## How to check everything manually

No servers to start. You need Node 24 and internet (for the timing test). Run these from inside the
`m02-async-toolkit` folder:

```bash
cd m02-async-toolkit
```

| What | Command | What you should see |
| --- | --- | --- |
| Self-checks | `pnpm test` | 17 `ok` lines, then `all 17 self-checks passed` |
| Timing | `pnpm timing` | the "parallel" time is lower than "sequential" (run it a few times) |
| Event loop | `pnpm event-loop` | the order `A, E, G, C, D, F, B` |
| File task (callbacks) | `node fs-refactor/callbacks.js` | the text in capitals, then `wrote 89 bytes` |
| File task (async/await) | `node fs-refactor/async-await.js` | the exact same output |

Running `pnpm` from the main repo folder gives "No package.json found". Move into
`m02-async-toolkit` first.

Want to see the tests catch a bug? Break the code on purpose (in `mapLimit`, change
`Math.min(limit, list.length)` to `list.length`), run `pnpm test`, and watch a check fail. Then undo it.

## Checkpoint evidence

**Self-checks:** all 17 pass. To make sure the checks really catch bugs, I broke the code on purpose
and ran them again each time:

| What I broke | Check that failed |
| --- | --- |
| `mapLimit`: started one worker per item instead of `limit` workers | "never exceeds the concurrency limit" and "stops starting work after an error" |
| `retry`: removed the pause between attempts | "waits `delayMs` between attempts" |
| `withTimeout`: removed the timer cleanup | "clears its timer when the promise wins" |
| `sleep`: removed the timer cleanup on abort | "clears its timer when aborted" |

**Timing** (20 posts, 3 runs, results vary with the network):

| Run | One by one | All at once | Faster by |
| --- | --- | --- | --- |
| 1 | 6832 ms | 827 ms | 8.3x |
| 2 | 539 ms | 391 ms | 1.4x |
| 3 | 785 ms | 499 ms | 1.6x |

All at once won every time. Run 1 was an unexplained slow outlier (the warm-up request was already in
place). Runs 2 and 3 are more typical. It's not 20x faster because the time is limited by the slowest request, plus connection
overhead.

**Event loop order:** I predicted `A, E, G, C, D, F, B` before running it, and the real output matched.

**File task:** the callback version and the `async`/`await` version print identical output.

> Still yours to do: explain the event-loop order out loud, without notes.

## What I'd do differently

- Write the tricky tests first ("never more than the limit", "stops after an error") before the code.
- Time the fetches more times and report the middle value.
- Make `withTimeout` actually cancel the task, not just stop waiting.
