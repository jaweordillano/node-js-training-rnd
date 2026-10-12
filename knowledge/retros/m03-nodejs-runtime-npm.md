# Retro: M03 training module page (index.html + index.md)

## Criteria results (2026-10-12)

- Exactly one `<h1>`, no `<script>`/`onclick`, no external links or CDN: PASS
- Every relative link and in-page anchor resolves; ids unique; every checkbox has a label: PASS
- Only classes that exist in `assets/style.css`: PASS
- HTML and Markdown: same sections in the same order, the same 59 code blocks (Markdown indents the ones inside steps): PASS
- Time plan sums to 180 min in the plan list, headings and Markdown: PASS
- Samples run on Node v24.21.0 (Linux/WSL), and the lab rebuilt from the page's own code blocks in a fresh folder: PASS
- Scope: 3 h, my assumption, against the brief's 6 h. Brief unchanged: NEEDS USER CONFIRMATION
- Rendered in a browser: NOT CHECKED

## Issues found and fixed

- `git diff --stat` expected output was from memory; replaced with the real run (6 lines, 3/3).
- `npm view` output for one field is `MIT`, not `license = 'MIT'`.
- Section 7 numbered list restarted at 1 around code blocks; now a `.steps` list.
- A debugger troubleshooting entry told students to "tell the author"; reworded for a student who works alone.
- Expected `npm ls` header used the wrong package name (`js-training` is what M01 created).
- Claim that a large `readFile` fails was vague; now "about half a gigabyte" with the reason.

## Backlog

- Windows and macOS untested. The VS Code debugger steps and the GitHub PR steps were not run.
- Time per section is an estimate. Section 3 (50 min, about 200 lines to type) is the likeliest to overrun; have a real student time it.
- Not viewed in a browser.
- Hours: `brief.md`, `tasks.md`, the PRD, arch doc and README still say 6 h; the home page still says about 80 hours in total.
- `brief.md` expects a streaming-CLI guide in the write-up and a trainer-supplied log file; the page replaces both.
- M02's Google Doc is stale (pager link changed). M03 has no Doc yet.
- The page generator and its source live in the session scratchpad. Move a cleaned copy into `knowledge/patterns/` if M04 needs it.
- Cut but possible later: a CommonJS demo, `npm audit fix` practice, worker threads.

## Patterns worth reusing

- Never write expected output from memory: two of this page's blocks were wrong until run.
- Give a deliberately wrong version (`read-all.js`) so the student measures the difference.
- Use a seeded generator so every student's report matches the page.
- Test signal handling with a process-group SIGINT, since that is what Ctrl+C sends.
