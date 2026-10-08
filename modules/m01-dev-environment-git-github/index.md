# M01 — Dev Environment, Git & GitHub

**Module M01 · Week 1 · Day 1 · 4 hours**

Set up the toolchain, use the everyday Git workflow, and collaborate through GitHub pull requests.

> **How to use this page.** This page explains the ideas you need. It does not give you the lab
> steps or the answers. You work out how to build the deliverable, and you write it up in
> `write-up-template.md` as you go. The [brief](brief.md)
> is the source of truth if the two ever disagree.

## 1. Objective

**Builds on:** nothing. This is the first stage.

By the end of the day you will have taken a change through the full branch, pull request, review
and merge cycle on a public repo, including a real merge conflict that you resolved.

> **Deliverable.** A merged pull request on a public repo containing a `hello-node` script, with a
> resolved merge conflict in its history.

## 2. Toolchain

Everyone on the cohort works in the same toolchain, so a problem on your machine is a problem
someone else can recognise.

| Tool | Why you need it |
| --- | --- |
| VS Code | The editor used through the programme, with an integrated terminal. |
| Git | Version control. Everything else on this page depends on it. |
| A Node version manager | nvm, fnm, nvm-windows or Volta. It lets you switch Node versions per project instead of living with whatever is installed system-wide. |
| A terminal | Where you run Git and Node. Know how to change directory, list files and read a path. |

### Pinning the Node version

The whole cohort runs one Node version, recorded in a `.nvmrc` file at the root of the project. The
version manager reads that file, so a new person who clones the project gets the same runtime as
everyone else. The cohort is pinned to **Node.js 24 LTS**.

```bash
node --version
git --version
```

Run both to confirm your install. Create the `.nvmrc` yourself as part of the lab.

> **Pick one version manager.** Which one you choose matters less than that you can explain how it
> picks the version. Windows users usually reach for nvm-windows or Volta.

## 3. The Git mental model

Most Git confusion comes from not knowing which of three places a change is in. Files move through
them in one direction.

```
Working tree  --git add-->  Staging area  --git commit-->  Commit history
```

A change is edited in the working tree, staged with `git add`, and recorded with `git commit`.

### The everyday commands

| Command | What it answers |
| --- | --- |
| `git init` / `git clone` | Start a repo, or copy an existing one. |
| `git status` | Which of the three places is each change in? |
| `git add` | Which changes go into the next commit? |
| `git commit` | Record the staged changes with a message. |
| `git log` | What has been recorded, and when? |
| `git diff` | What is different between two of the places? |
| `git restore` | Throw away or unstage a change. |
| `git stash` | Set work aside without committing it. |

Practise these on a throwaway repo before you touch the real one. `git status` after every step is
a good habit while the model is new.

### Undoing things: `revert` vs `reset`

Both undo work, and they are not interchangeable. Part of your checkpoint is explaining the
difference out loud. To prepare, compare them on three questions:

- What does each one do to the commit history?
- Which one is safe on a branch other people have already pulled?
- When would you reach for each?

Look this up and try both in your throwaway repo. Use your own words in the write-up.

## 4. Branching, merging & conflicts

A branch is a separate line of work. You make your change on a feature branch so `main` always
stays in a good state, and you bring the change back with a merge once it has been reviewed.

### Merge vs rebase

Both combine work from two branches, and they leave different histories behind. At this stage you
only need the concept: one preserves the shape of what happened, the other rewrites it into a
straight line. You will not be rebasing in the lab.

### What a conflict is

A conflict happens when Git cannot decide for you, usually because two branches changed the same
lines. Git stops and marks the file, and a person decides what the final text should be.

```
<<<<<<< HEAD
the version on your branch
=======
the version on the other branch
>>>>>>> other-branch
```

Resolving means editing the file to the text you want, removing the three marker lines, staging the
file and finishing the merge.

> **Conflicts are normal.** A conflict is not a sign that something broke. You will cause one on
> purpose with your pair in the lab, so that the first time you see one is in a safe place.

## 5. .gitignore & secrets

A `.gitignore` file lists what Git should never track. For a Node project it covers:

- `node_modules`
- `.env`
- `*.db`
- the generated Prisma client
- `dist`
- `coverage`

Think about why each of these should stay out of the repo. Some are rebuilt from other files, and
some are private.

> **Never commit secrets.** Once a secret is in the history it is hard to take back, and on a
> public repo anyone can read it. Commit a `.env.example` that lists the settings the project needs
> without their real values, and keep the real `.env` out of Git. There is nothing to configure
> yet, but the habit starts today.

## 6. GitHub

### Remotes and authentication

A *remote* is a copy of your repo hosted somewhere else, usually named `origin`. To push to it you
need to prove who you are. Pick one: the GitHub CLI, a credential manager, or SSH keys.

### GitHub Flow

1. Branch from `main`.
2. Commit your work on the branch.
3. Open a pull request.
4. Get a review and respond to the comments.
5. Merge, then delete the branch.

Issues are where you track the work, and a pull request is where the change is discussed before it
lands. Review comments can be attached to individual lines.

> **Public repos by convention.** The programme uses public training repos for every module. Branch
> protection on private repos depends on the GitHub plan, and a public repo avoids that dependency
> entirely.

### Conventional Commits

A commit message that follows a pattern is easier to scan and easier to review. The format is a
type, a colon and a short description.

```
feat: add hello-node script
fix: correct the greeting text
docs: explain how to run the script
chore: add .gitignore
```

Your pull request needs 3 or more commits written this way.

### README basics

A README tells a stranger what the project is and how to run it. Keep it short, and write it for
someone who has never seen your repo.

## 7. Lab

*Goal: prove you can take a change through the full branch, PR, review and merge cycle, including
resolving a real conflict.*

### You do

1. Set up your toolchain (VS Code, Git, a Node version manager) and create the public repo.
2. Write the `hello-node` script on a feature branch, committing with Conventional Commits as you
   go.
3. Add `.gitignore` and `.env.example`.
4. Open a pull request and get a peer review from your assigned partner.
5. With your pair, deliberately create a merge conflict, then resolve it together.
6. Merge once the PR carries 3 or more Conventional Commits.

### You build and capture

- The merged PR link.
- `.gitignore` and `.env.example` present in the repo.
- Your own explanation of `git revert` vs `git reset`.

> **Write as you go.** Fill in `write-up-template.md` while you work, not after the PR is merged.
> Note what tripped you up while it is still fresh. Write it for the next trainee, who will follow
> it with no trainer to ask.

## 8. Check your understanding

Try to answer each question aloud before you check your thinking.

- **Where is a change after you edit a file but before `git add`?** Think about the three places in
  the diagram, and how `git status` would describe the file.
- **Why do you work on a feature branch instead of `main`?** Think about what a reviewer and the
  rest of the team see on `main`.
- **Why is `.env.example` committed when `.env` is not?** Think about what a new person needs to run
  the project, and what must never be public.
- **What do you do when Git reports a conflict?** Think about who decides the final text, and what
  has to be removed from the file.
- **Explain `git revert` vs `git reset` without notes.** This one is yours to answer. It is part of
  the definition of done.

## 9. Definition of done

- [ ] A merged pull request with 3 or more Conventional Commits.
- [ ] `.gitignore` present and covering the Node-project list above.
- [ ] `.env.example` present (even though there's nothing to configure yet, this is about the habit).
- [ ] You can narrate, in your own words, the difference between `git revert` and `git reset`.

Bring the merged PR and your write-up to your trainer. They review both together.

## 10. Before you start

> **Ask your trainer.** Your trainer assigns pairs for the merge-conflict exercise at the start of
> the session. This is a per-cohort roster decision, so you cannot arrange it in advance.

## 11. Further reading

- [GitHub Docs: Get started](https://docs.github.com/en/get-started)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Pro Git](https://git-scm.com/book)

---

[← All modules](../../index.html) · Next: M02, Modern JavaScript & Async/Await (coming soon)
