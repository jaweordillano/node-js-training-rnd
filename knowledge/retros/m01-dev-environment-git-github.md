# Retro: M01 training module page (index.html + index.md)

## Criteria results

- Both pages are well-formed (tags balanced, one `<h1>`, no images without alt): PASS
- Every relative link and in-page anchor resolves, in the home page and both module files: PASS
- `index.html` and `index.md` have the same 11 sections in the same order: PASS
- Content stays within the M01 brief scope (superseded: the page now gives steps and answers, see the update below): PASS
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

## Update: course reframe (async, student-facing)

The user clarified that they run the build-to-teach, and students only follow the finished course.
The first version of the M01 page withheld answers (e.g. `revert` vs `reset`), which was right for
a trainee-builds model and wrong here.

- Root `index.html` rewritten as the course front door; M01 page rewritten as a full lesson with a
  time plan, steps, expected output, checkpoints, OS tabs, troubleshooting and a done checklist.
- `AGENTS.md` now says: teach fully, write for the student, no pairs or trainer. `modules/README.md`
  and `README.md` now describe briefs and write-ups as the author's workflow.
- Defaults assumed without the user's answers: root page is a hub, students create their own public
  repo, the merge conflict is made solo with two branches, no Friday gates, review is self-review.
- Linux checked by running the Git flow in a scratch repo (revert, reset, stash, branch, conflict).
  Not run here: Windows, macOS, `gh` commands, nvm installs.

## Validation of the reframe

- Linux: the page's full command sequence (practice repo, then repo, branch, competing change,
  conflict, resolve with `git commit --no-edit`) ran in a scratch repo with a local bare remote. The
  output matched the page, including the conflict markers. `npm` ships as 11.x with Node 24.
- Pages well-formed, no duplicate ids, no broken links or labels; HTML and Markdown sections match;
  time plan sums to 240 minutes; no Bruno on either page.
- Fixed: home page claimed M01 covers native build tools (it doesn't); READMEs still spoke to a
  trainee building the stage, now labelled as the author workflow.

### Backlog

- Not run: Windows, macOS, nvm/nvm-windows installs, `winget`/`brew`, and the `gh` commands
  (`auth login`, `repo create`, `pr create`, `pr merge`). Dry-run them before students see the page.
- Not checked in a browser (none available here): OS tabs, dark mode, print, phone width.
- `modules/README.md` and `README.md` still mention `/trainee-task-planner`, which doesn't exist;
  `.claude/commands/` has `dev-tasks-planner`.
- `brief.md` and `tasks.md` still mention Bruno; the page doesn't.
- Possible pattern worth adding to `knowledge/patterns/`: run the lesson's commands in a scratch repo
  with a local bare remote before publishing a Git lesson.
