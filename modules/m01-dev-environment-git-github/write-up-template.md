# M01 Write-Up — Dev Environment, Git & GitHub

> Fill this in as you go, not after the fact. Write it so a trainee starting this stage next cohort
> could follow your path on their own.

## What I built

The repo you set up, the `hello-node` script, and the merged PR (link it).

**Training module page (authored, not yet the lab).** A document-style training page for this
stage, written as twin files: `index.html` (pure HTML and CSS, no JavaScript) and `index.md`, both
in this folder, plus a home page `index.html` and a shared `assets/style.css` at the repo root. It
covers the objective, toolchain, the Git mental model, branching and conflicts, `.gitignore` and
secrets, GitHub, the lab, check-your-understanding questions and the definition of done. The lab
itself (repo, `hello-node`, PR, conflict) is still to be done and written up below.

**Simplified page (2026-10-12).** The page was cut from about 4 hours to about 90 minutes. Git is
reduced to `init`, `add`, `commit`, `remote`, `push` and `status`. Students create one
`node-js-training` project (plain JavaScript, `"type": "module"`, code in `src/`, with `.gitignore`,
`.env.example`, `.nvmrc`, `package.json` and a README), push it to a public GitHub repo, and keep
building in it for every later module. The sections now are: set up tools, Git crash course, create
your project, check your understanding, troubleshooting and "you're done when".

## Why it's built this way (key decisions)

- Why did you structure your branches and commits the way you did?
- The repo is public, by program convention — what would have changed if it had been private with
  a no-direct-push rule instead?
- How did you actually resolve the merge conflict, and would a different approach (merge vs rebase)
  have changed what happened?

**Decisions on the training page**

- The page lives beside `brief.md` in this folder, not in a separate folder, so each stage's
  material stays together. `brief.md` was not edited; it stays the source of truth.
- Pure HTML and CSS, no JavaScript, no CDN: it opens by double-click, works offline and prints.
  Interactivity uses native elements (`<details>`, anchor links, checkboxes).
- Every page has an `index.html` and an `index.md` twin with the same sections, and both are
  updated together on revision.
- The page is written for students who follow it alone, not for trainees who build-to-teach, so it
  teaches fully: steps, commands, expected output, worked answers (including `revert` vs `reset`),
  checkpoints and troubleshooting. An earlier draft withheld the answers; that was reversed once it
  was clear the author does the build-to-teach and students only follow the page.
- With no partner or trainer, the merge conflict is made solo with two branches, and review is a
  self-review on the PR. Squash-merge is called out because it would erase the 3+ commit history.
- Node is pinned to 24 LTS, per `README.md`, which says that choice is already made.
- Bruno was removed from this page's toolchain list and lab step 1 at the trainer's request.

**Decisions on the simplification (2026-10-12)**

- The course is about Node.js, not Git, so M01 teaches only the commands needed to save and push
  work. Branches, PRs, merge conflicts, `revert`/`reset`, `stash`, rebase and Conventional Commits
  are cut, even though `brief.md` and `tasks.md` still ask for them. The page decides how it is
  taught; the brief was not edited.
- One `node-js-training` project for all modules, so students consume one repo, not one per stage.
  Plain JS now, with `src/` and a `.gitignore` that already covers `dist`, `*.db` and `coverage`, so
  TypeScript, Express and Prisma are additions, not rework.
- `"type": "module"` is set from the start so M02's ESM teaching is not a migration.
- `npm pkg set` edits `package.json` from the terminal, so it behaves the same on every OS.
- GitHub CLI is the only sign-in method, to avoid a choice between three.
- Students create the GitHub repo empty in the browser, then `git remote add origin` and
  `git push -u origin main`, so `remote` is practised, not skipped.

## How to build it (teach it to the next trainee)

Write a guide to taking a change through branch → PR → merge, including a real conflict, using your
own example to show the reasoning, not just the Git commands.

## Concepts worth explaining

Pick 1-2 ideas — the working-tree/staging/commit model, `revert` vs `reset`, or merge vs rebase —
and explain each in your own words.

## What tripped me up

Anything that didn't behave the way you expected the first time.

- The first draft's home page marked M08–M10 as "TBC" for week, day and hours. The real values were
  already in `README.md`; read the existing docs before leaving a placeholder.
- Pages were first placed in a separate `training/` folder, then moved back into the stage folder.
  Decide where generated pages live before writing them, since moving them means fixing every
  relative link.
- Bruno is still named in `brief.md` and `tasks.md`, so the page and the brief currently disagree.
- My sample `git status` and `git commit` output didn't match a real run ("No commits yet" line;
  25 insertions, not 28). Run the commands and paste real output instead of writing it from memory.
- Running the first plan's approval without answering its three questions meant defaults were used.
  Answer them, or the defaults stand.

## Checkpoint evidence

Show the merged PR link, your `.gitignore`/`.env.example`, and your own explanation of
`git revert` vs `git reset`.

## What I'd do differently

If you started this module over, what would you do differently?

For the training page: confirm the folder layout and the toolchain list with the trainer before
writing, and check links with a script after every move. Start from the smallest page that reaches
the success indicator (a repo on GitHub), instead of writing everything the brief lists and cutting
later.

Still open: Windows, macOS, nvm, `gh` and a real `git push` have not been run; the Google Doc is
stale; `brief.md`, `tasks.md` and possibly `docs/prd/` still describe the old deliverable.
