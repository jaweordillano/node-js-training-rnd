# Retro: M02 training module page (index.html + index.md)

## Criteria results (2026-10-12)

- Exactly one `<h1>`, no `<script>`/`onclick`, no CDN; the only external link is JSONPlaceholder: PASS
- Every relative link and in-page anchor resolves; ids unique; every checkbox has a label: PASS
- Only classes that exist in `assets/style.css`: PASS
- HTML and Markdown have the same 9 sections, the same 43 code blocks and the same inline code: PASS
- Time plan sums to 120 min in the plan list, the headings and the Markdown: PASS (after a fix)
- Samples run on Node v24.21.0 (Linux/WSL), output matches the page; toolkit rebuilt from the page's
  own code blocks in a fresh folder and passed: PASS
- Scope: matches the user's 2-hour cut, not the brief's 10 hours: ALIGNED WITH THE USER, brief unchanged
- Rendered in a browser (dark mode, print, phone width): NOT CHECKED

## Issues found and fixed

- Time plan summed to 115, not 120 (fixed, then rebalanced to 25 / 20 / 45 / 15 / 10 / 5).
- Page said M03 uses the toolkit; M03's brief only reuses the async patterns (reworded).
- `npm run check` prints extra lines first (note added).
- The `forEach` demo could have left a stray file for `git add .` (now `scratch.js`, deleted).

## Backlog

- Windows and macOS untested. `rm` and `cat` in the page assume Git Bash (PowerShell note exists for `cat`).
- Time per section is an estimate. Have a real student time sections 1 and 3, then rebalance.
- Not viewed in a browser.
- `brief.md`, `tasks.md`, `docs/prd/` and the arch doc still say 10 hours, peer review and a research
  step. `modules/README.md` hours were changed to 2.
- Home page still says about 80 hours in total and about 4 hours a day; both are stale after the M01 and
  M02 cuts.
- M01's Google Doc is stale (pager link changed).
- The page generator lives in the session scratchpad. If more modules need it, move a cleaned version
  into `knowledge/patterns/`.
- Practice for `Promise.withResolvers`, `Promise.try`, `Array.fromAsync`, `Map`/`Set` and `#private` was
  cut to one table; the brief lists them.

## Patterns worth reusing

- Run every sample first, and paste real output. Real `fetch` timings differed a lot from run to run.
- Generate the HTML and Markdown twins from one source, so code and output cannot drift.
- Rebuild the lab from the page's own code blocks in a fresh folder as the final test.
- Break a self-check on purpose in the lesson so students see one fail.
