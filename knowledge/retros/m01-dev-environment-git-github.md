# Retro: M01 training module page (index.html + index.md)

## Criteria results

- Both pages are well-formed (tags balanced, one `<h1>`, no images without alt): PASS
- Every relative link and in-page anchor resolves, in the home page and both module files: PASS
- `index.html` and `index.md` have the same 11 sections in the same order: PASS
- Content stays within the M01 brief scope (superseded: the page now gives steps and answers, see the update below): PASS
- No JavaScript, build step or CDN: PASS
- Rendered in a real browser, including dark mode, print and phone width: NOT CHECKED

## Issues found and fixed

- Home page rows for M08–M10 said "TBC"; replaced with the values from `README.md`.
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
- `AGENTS.md` now says: teach fully, write for the student, no pairs or trainer. `README.md`
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
- `README.md` and `README.md` still mention `/trainee-task-planner`, which doesn't exist;
  `.claude/commands/` has `dev-tasks-planner`.
- `brief.md` and `tasks.md` still mention Bruno; the page doesn't.
- Possible pattern worth adding to `knowledge/patterns/`: run the lesson's commands in a scratch repo
  with a local bare remote before publishing a Git lesson.

## Update: simplified M01 (about 90 min)

The user found the page over-engineered. Git is minimised to `init`, `add`, `commit`, `remote`,
`push` and `status`; branches, PRs, conflicts, `revert`/`reset` and Conventional Commits were cut.
Students now build one `node-js-training` project (plain JS, `"type": "module"`, `src/`) that every
later module extends.

- `brief.md`, `tasks.md` and `write-up-template.md` are untouched and now disagree with the page
  (merged PR, resolved conflict, `revert` vs `reset`). Authoring notes only; the page decides.
- Linux: ran `npm init -y`, `npm pkg set`, `npm start` and the commit flow in a scratch repo, and
  fixed the sample output to match. Not run: `git push` to GitHub, Windows, macOS, nvm, `gh`.
- `google-doc.md` and the Google Doc itself are NOT updated and are now stale.
- Defaults assumed: `gh` is the only sign-in method; `.nvmrc` and `.env.example` kept.

### Validation of the simplified page

- Both M01 files and the root page: one `<h1>`, no scripts, no duplicate ids, every in-page anchor,
  relative link and `for=` label resolves. (The tag-balance check flags self-closed SVG `rect`/`path`;
  false positive.)
- Twin sync: the same 7 sections in the same order in `index.html` and `index.md`.
- Time plan 30 + 15 + 40 = 85 min, shown as "about 90 minutes"; matches the 1.5 h on the home page.
- Graph query showed no new cross-community links; `modules/README.md` and root `README.md` were
  already updated for the new hours and deliverable.

### Backlog

- Google Doc and `google-doc.md` are stale. Update the Doc in place (same link) after review.
- `brief.md` Definition of Done, `tasks.md` and `write-up-template.md` still describe the PR/conflict
  version. Left alone on request; the write-up template was not edited for the same reason.
- `docs/prd/` and `docs/arch-docs/` may still describe the old M01 deliverable. Not checked.
- Not run: `git push` to GitHub, Windows, macOS, nvm, `gh`. Not viewed in a browser.
- Pattern: use `npm pkg set` instead of hand-editing `package.json`; it behaves the same on every OS.

## Update: pull request exercise (2026-10-12)

Added section 4 (branch, PR on the GitHub website, deliberate conflict, merge) and Git concepts in
section 2. Time is now about 135 minutes.

### Criteria results

- One `<h1>`, no JavaScript, no external links, unique ids, every label matches a checkbox: PASS
- Every `#anchor` and relative link resolves; only classes in `assets/style.css` are used: PASS
- HTML and Markdown have the same sections, subsections, checkpoints, hashes and 22 questions: PASS
- Time plan 30 + 20 + 40 + 45 = 135 minutes: PASS
- Git commands and expected output run in a scratch repo (Git 2.53, Node 24): PASS
- GitHub web UI steps: NOT RUN

### Issues found and fixed

- Troubleshooting for "Already up to date" blamed the wrong step; reworded in both twins.
- Home page blurb still said "five Git commands"; updated.

### Backlog

- `README.md` stage table still says "five core Git commands" for M01.
- `revert` vs `reset` is still not taught, though the brief asks for it.
- Run the GitHub web steps once and check the button names. Check dark mode and phone width.
- Section 4 sits at about 42 minutes of work in a 45-minute slot, so it is tight for slow typists.

### Pattern

- Run the Git commands in a scratch repo with a local bare remote (`git init --bare`) to get real
  output without touching GitHub.
