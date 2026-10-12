# Retro: M05 training module page (index.html + index.md)

## Criteria results (2026-10-12)

- Exactly one `<h1>`, no `<script>`/`onclick`, no CDN; the only external links are the Express 5 migration guide and the Bruno download page: PASS
- Every relative link and in-page anchor resolves; ids unique; every checkbox has a label: PASS
- Only classes that exist in `assets/style.css`: PASS
- HTML and Markdown: the same sections in the same order, the same 77 code blocks: PASS
- Time plan sums to 300 min: PASS
- Every code block that is a file matches a file that was run in a scratch repo, stage by stage: PASS
- The finished API: `npm run typecheck` clean, five endpoints, the envelope on six error paths, graceful shutdown, `npm run bruno` 15 requests / 35 assertions, and a deliberate break fails with exit 1: PASS
- M04 `in_progress` fix applied in both twins and code re-checked: PASS
- Scope: 5 h, my assumption, against the brief's 12 h. Brief unchanged: NEEDS USER CONFIRMATION
- Rendered in a browser: NOT CHECKED

## Issues found and fixed

- M04 used `in-progress` against the brief's `in_progress` (fixed in M04 before writing M05).
- Stage-2 handler did not compile (TS2783) with a default spread. Rewritten to `createTask(req.body)`, which became a teaching point.
- The overview did not say which long files may be pasted (FIX NOW). It now allows `validation.ts` and the Bruno files.
- "Send three bad requests" had two commands. Corrected to two.

## Backlog

- Windows and macOS untested. The Bruno desktop app was not run; the CLI was.
- `pkill -TERM -f` was run on Linux only.
- Time per section is an estimate. Section 2 (60 min) and section 7 (45 min, fifteen files) are the likeliest to overrun. Have a real student time them.
- Not viewed in a browser.
- Hours: `brief.md`, `tasks.md`, the PRD, arch doc and README still say 12 h, a PR and `helmet`/`morgan`. The home page still says about 80 hours in total.
- `brief.md` asks for a "central-error-handler guide" write-up and a PR; the page replaces both.
- `createdAt` and `updatedAt` on `Task` are beyond the brief's fields.
- M02's, M03's and M04's Google Docs are stale. M05 has none.
- `AGENTS.md` and `/create-training` describe one page pair per module. M04 added a solution page; M05 has none.
- The page generator and sources live in the session scratchpad. Move a cleaned copy into `knowledge/patterns/` if M06 needs it.
- Cut but possible later: `helmet`, `morgan`/`pino-http`, rate limiting, API-key middleware, pagination, `express.urlencoded`.
- The Bruno CLI install is large (about 300 MB of `node_modules`) and prints an install-scripts warning.

## Patterns worth reusing

- Build the lab in stages so the student feels each problem before its fix (no validation, wrong middleware order).
- Make a deliberate break part of the lesson, then check it fails (Bruno with a changed code, middleware order).
- Check student-facing code by comparing every file-shaped code block with a file that was run, not by retyping.
- Never put a `pkill -f`/`pgrep -f` pattern in the same command as the text it matches. Use `[x]` and run servers from a subprocess.
- Run the finished API's checks through the CLI so they are repeatable, and keep GUI steps as "untested".
