# Retro: M01 training module page (index.html + index.md)

## Criteria results

- Both pages are well-formed (tags balanced, one `<h1>`, no images without alt): PASS
- Every relative link and in-page anchor resolves, in the home page and both module files: PASS
- `index.html` and `index.md` have the same 11 sections in the same order: PASS
- Content stays within the M01 brief scope and gives no lab steps or answers: PASS
- No JavaScript, build step or CDN: PASS
- Rendered in a real browser, including dark mode, print and phone width: NOT CHECKED

## Issues found and fixed

- Home page rows for M08–M10 said "TBC"; replaced with the values from `modules/README.md`.
- Pages moved from `modules/` to `training/` and back; links and AGENTS.md updated each time.
- Bruno removed from the page at the trainer's request.

## Backlog

- Bruno is still in `brief.md` (lines 15, 43) and `tasks.md` (line 12). Awaiting a decision.
- A stray `graphify-out/` folder appeared inside the M01 stage folder (gitignored).
- Open the pages in a browser and check dark mode, print and a narrow viewport.
- Home page lists M02–M10 as "Coming soon"; add links as their pages are written.

## Patterns worth reusing

- Verify links with a short script after any file move.
- Keep HTML and Markdown twins in sync by comparing the `h2` lists.
