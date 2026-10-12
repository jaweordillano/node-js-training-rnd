# Retro: M04 training module page (index.html + index.md, solution.html + solution.md)

## Criteria results (2026-10-12)

- Exactly one `<h1>` on each page, no `<script>`/`onclick`, no external links or CDN: PASS
- Every relative link and in-page anchor resolves (including the cross-page links to `index.html#s5` and `#s6`); ids unique; every checkbox has a label: PASS
- Only classes that exist in `assets/style.css`: PASS
- HTML and Markdown: the same sections and the same code blocks (52 on the index page, 6 on the solution page). Markdown links to `.md`, not `.html`: PASS
- Time plan sums to 180 min: PASS
- Samples run on Node v24.21.0 and TypeScript 7.0.2, and the lab rebuilt from the page's own code blocks in a fresh folder, including the 16-error exercise start state: PASS
- Scope: 3 h, my assumption, against the brief's 8 h. Brief unchanged: NEEDS USER CONFIRMATION
- Rendered in a browser: NOT CHECKED

## Issues found and fixed

- Sections 2 to 4 ask for about 190 lines of typing in 95 min. Added a line to the overview allowing the student to paste the practice files, and to type section 5 themselves (FIX NOW).
- Earlier, while building: `types` was missing from `tsconfig.json`, `--rootDir` was needed for a build, `export type` was used inside a callback, and "bad line" instructions did not say to add a blank line first, so error line numbers did not match. All fixed from real runs.
- A troubleshooting entry said a step was "untested on my machine". Reworded for a student working alone.

## Backlog

- Windows and macOS untested. `mv` and `GREETING=hi cmd` assume Git Bash on Windows. The VS Code "Select TypeScript Version" step was not run.
- Time per section is an estimate. Sections 2 to 4 and section 5 (40 min for three typed functions, working alone) are the likeliest to overrun. Have a real student time them.
- Not viewed in a browser.
- Hours: `brief.md`, `tasks.md`, the PRD and arch doc still say 8 h and a PR habit. The home page still says about 80 hours in total.
- `brief.md` asks for a "utility-types guide" write-up and a PR; the page replaces both.
- M02's and M03's Google Docs are stale (pager links changed). M04 has none.
- `AGENTS.md` and the `/create-training` command describe one page pair per module. If solution pages stay, add them there.
- The page generator (`gen.mjs`) and the page sources live in the session scratchpad. Move a cleaned copy into `knowledge/patterns/` if M05 needs it.
- Cut but possible later: `satisfies` beyond one example, declaration files, a native-stripping failure on a version other than 24.

## Patterns worth reusing

- Make a porting or coding task an exercise with a machine-checkable finish: here `tsc` plus a type-test file that rejects `any`.
- Put the full answer on a separate page, collapsed hints on the exercise page, and the real compiler output of wrong answers in a table.
- Test a hint by actually writing the wrong answer and pasting the error, not by predicting it.
- Read code samples into the page from files that were run, so the page cannot drift from what works.
- Do not use `rm -rf *` after a `cd` in a scratch folder: the shell's working directory can reset, and the safety check blocks it. Make a fresh folder instead.
