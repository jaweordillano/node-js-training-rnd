# Retro — M01 Dev Environment, Git & GitHub

Work lives in the fork (`jaweordillano/node-js-training-rnd`), branch `feat/hello-node`, folder
`hello-node/`.

## Criteria

- [ ] Merged PR with 3+ Conventional Commits — NOT YET (2 commits so far)
- [x] `.gitignore` covering the Node list — PASS
- [ ] `.env.example` present — NOT YET
- [ ] Narrate `git revert` vs `git reset` — NOT CHECKED
- [ ] Peer review and resolved merge conflict — NOT DONE

## Issues

- [BACKLOG] Bruno not installed.
- [BACKLOG] Confirm with the lead how the write-up is delivered (PR to upstream vs fork link).
- [BACKLOG] An earlier retro and write-up draft disappeared from the working tree after
      `git pull upstream main`; they were rewritten.

## Patterns and surprises

- The generic `/scaffold` skill targets a Next.js/Figma scaffold and does not fit a Node lab.
- The lab started in a separate repo and was moved into the fork so work and write-up sit together.
- Node 24 LTS is the cohort pin (root README), so `.nvmrc` contains `24`.
- Stage files by name; the fork can carry unrelated uncommitted changes (e.g. `.mcp.json`).
