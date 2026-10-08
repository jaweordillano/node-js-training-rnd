# M01 Write-Up — Dev Environment, Git & GitHub

> Fill this in as you go, not after the fact. Write it so a trainee starting this stage next cohort
> could follow your path on their own.

## What I built

- Branch `feat/hello-node` in my fork, with a `hello-node/` folder at the repo root.
- `hello-node/hello.js`, a script that prints a greeting (optionally for a name passed on the
  command line).
- Still to do: `.gitignore`, `.env.example`, `.nvmrc`, PR, peer review, planted merge conflict, merge.

## Why it's built this way (key decisions)

- Why did you structure your branches and commits the way you did?
- The repo is public, by program convention — what would have changed if it had been private with
  a no-direct-push rule instead?
- How did you and your pair actually resolve the merge conflict, and would a different approach
  (merge vs rebase) have changed what happened?

**My notes**
- Did the lab inside my public fork instead of a separate repo, so the work and write-up live together.
- Branch name `feat/hello-node` (type prefix + short description).
- Node version manager: nvm, Node 24 LTS as pinned in the root README.

## How to build it (teach it to the next trainee)

Write a guide to taking a change through branch → PR → review → merge, including a real conflict,
using your own example to show the reasoning, not just the Git commands.

## Concepts worth explaining

Pick 1-2 ideas — the working-tree/staging/commit model, `revert` vs `reset`, or merge vs rebase —
and explain each in your own words.

## What tripped me up

Anything that didn't behave the way you expected the first time.

**My notes**
- I first built the lab in a separate repo, then moved it into the fork once it was clear the work
  belongs there.
- Pulling `upstream/main` wiped my uncommitted write-up notes, so write them up and commit sooner.
- Open questions for my trainer: should the write-up reach you as a PR to upstream or a link to my
  fork? Who is my pairing partner for the review and merge-conflict exercise?

## Checkpoint evidence

Show the merged PR link, your `.gitignore`/`.env.example`, and your own explanation of
`git revert` vs `git reset`.

## What I'd do differently

If you started this module over, what would you do differently?
