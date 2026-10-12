# M03 Write-Up — Node.js Runtime & npm

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own.

## What I built

The `log-report` CLI and the bare `node:http` server, both merged by PR.

**Training module page (authored, 2026-10-12).** A student-facing page for M03 as twin files, `index.html` and `index.md`, beside the brief. About 3 hours (180 min): what Node.js is and modules 20, core APIs and `process` 25, build the `log-report` CLI 50, build the bare HTTP server 35, npm and supply-chain hygiene 25, debugging 10, merge by pull request 10, check your understanding 5. The lab is built inside the M01/M02 `node-js-training` repo. Repo state in is M02's. Out: `src/labs/` gains `runtime.js`, `core-apis.js` and `debug.js`; new `src/log-report/` (`generate-log.js`, `read-all.js`, `log-report.js`) and `src/server/server.js`; `data/` in `.gitignore` (the ~93 MB `access.log` and `report.json`); scripts `report`, `server` and `dev`; `engines` in `package.json`; `prettier` as a dev dependency with a lockfile; a `README.md` list of what Express removes. The home page row links to M03 and M02's pager links forward. The lab has not been done by a real student yet.

## Why it's built this way (key decisions)

- Why this streaming approach for the log file, specifically?
- What would have changed — and broken — if you'd loaded the file fully into memory instead of
  streaming it?
- How did you hand-roll routing and body parsing, and which design did you pick where more than
  one way was possible?

**Decisions on the training page (2026-10-12)**

- **3 hours, not 6. This was my assumption.** The three open questions (hours, PR step, npm hands-on) were not answered, so I planned on 3 h, a short branch/PR/merge at the end, and one small dev dependency. The brief, tasks, PRD and README still say 6 h; I did not edit them, and the home page row now says 3 h.
- **No trainer, so the page supplies the log file.** The brief says to get a ~100 MB file from the trainer. The page gives a seeded generator (2,000,000 lines, ~93 MB, identical for everyone, so the report numbers in the page match). Students paste it, not write it.
- **Memory check is built in.** `process.resourceUsage().maxRSS` works on all three OSes, unlike `/usr/bin/time -v`. A deliberate `read-all.js` gives a number to compare (321 MB against 73 MB on my run), so the student sees why streaming matters instead of being told.
- **Streaming design:** `createReadStream` + `node:readline` + `for await`, counting by status and path in a `Map`. Malformed lines are counted, not fatal. Exit codes: 0 ok, 1 unreadable file, 2 bad option.
- **Server design:** one `createServer` handler, routing by `if` on method and path, hand-written body collection, `sendJson`, 400/404/405 and a catch-all 500, SIGINT/SIGTERM shutdown. In-memory notes. `GET /health`, `GET /notes`, `POST /notes` are my choice; the brief only says three JSON endpoints.
- **The Express answer is the student's own.** They write 3+ pain points into `README.md` first, then compare with a sample, because the brief wants their own explanation.
- **npm hands-on with `prettier@3.0.0`:** an old version on purpose, so `npm outdated` and `npm update` have something to do. It has no dependencies and no install scripts.
- **Cut:** worker threads, `node:test`/`node:sqlite` (one-line note), CJS demo (a table and a troubleshooting entry only), a separate `node:stream` lesson (taught through the lab), `npm audit fix` hands-on, publishing.
- **Page generated from one source file** (in the session scratchpad, not the repo), so HTML and Markdown cannot drift.

## How to build it (teach it to the next trainee)

Write a guide to streaming a large file through a CLI, using your own example to show the
reasoning, not just the code.

## Concepts worth explaining

Pick 1-2 ideas — streams, the event loop/thread pool, or ESM vs CommonJS — and explain each in
your own words.

## What tripped me up

Anything that didn't behave the way you expected the first time (especially: what made the bare
`node:http` server painful — that's the point of this lab).

- (2026-10-12) I wrote the `git diff --stat` expected output from memory (8 lines changed). A real run gave 6 (3 insertions, 3 deletions). VALIDATE caught it, and the page now shows the real numbers.
- `npm view prettier scripts.postinstall dependencies license` prints just `MIT` when only one field has a value, not `license = 'MIT'` as I first wrote. Fixed from a real run.
- The first draft's section 7 used a numbered list broken by code blocks, so the HTML and Markdown restarted at 1. It is now a `.steps` list.
- A `pkill -f` pattern in my own test command matched the shell running it and killed it. Use `[s]` in the pattern.
- Ctrl+C under `npm run dev` (which wraps `node --watch`) needed a process-group SIGINT to test. It does print `SIGINT received, closing`.
- `npm update` leaves `^3.0.0` in `package.json` and only changes the lockfile. I had assumed it would bump the range, so the page explains it.

## Checkpoint evidence

Show both programs merged to `main` by PR, the CLI's memory behavior on the full log file, and the
bare server's three endpoints responding.

(2026-10-12, page author, Linux/WSL, Node v24.21.0.) Every file was run in a scratch folder and the page's "You should see" blocks come from those runs. The generator wrote 2,000,000 lines (93 MB). `log-report` took about 1 s and reported peak memory 73 MB; `read-all.js` reported 321 MB. All seven `curl` calls returned the statuses on the page, and SIGINT printed `SIGINT received, closing`. The npm commands (install, outdated, update, ci, ls, audit, view) were run against the real registry (prettier 3.9.10). The lab was also rebuilt from the page's own code blocks in a fresh folder and gave the same output. Still student evidence to collect: their own numbers and the merged PR.

## What I'd do differently

If you started this module over, what would you do differently?

(2026-10-12) Get the hour budget before planning. I assumed 3 h after M01 and M02 were cut; ask again before the next module.

Still open: Windows and macOS were not run (Git Bash assumed; PowerShell notes only for `$LASTEXITCODE` and `curl`); the VS Code debugger steps (6.3) and the GitHub pull request steps (7) were not run; `npm run dev` was run through a process group, not a real terminal; not viewed in a browser; the 3 h plan is an estimate and section 3 (50 min, about 200 lines of typing) is the likeliest to overrun; `brief.md`, `tasks.md`, the PRD and arch doc still say 6 h, a trainer-supplied log file and a "streaming-CLI guide" write-up; the home page still says about 80 hours in total; M02's Google Doc is stale (its pager changed) and M03 has no Doc.
