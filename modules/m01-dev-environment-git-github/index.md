# M01 — Dev Environment, Git & GitHub

**Module M01 · Week 1 · Day 1 · about 4 hours**

Set up your tools, learn the everyday Git workflow, and take a change through a GitHub pull request,
including a real merge conflict.

## Overview & time plan

**Builds on:** nothing. This is the first module.

By the end you will have a public GitHub repo with a `hello-node` script, merged through a pull
request that has at least three Conventional Commits and a merge conflict that you resolved
yourself.

1. Set up your tools: 45 min
2. Git, hands-on: 60 min
3. Your repo & project files: 20 min
4. Branch, commit & PR: 45 min
5. Merge conflict: 40 min
6. Review, merge & wrap up: 30 min

> **How to read this page.** Type the commands yourself. A block labelled *You should see* shows
> what to expect. Your output may differ in small ways, such as commit hashes and version numbers.
> If it differs in a bigger way, stop and check [Troubleshooting](#troubleshooting).

> **Working alone.** Nobody is assigned to review your work, so this module is built to be done on
> your own. Where a partner would normally help, the page gives you a way to do the same thing
> solo. If you do have someone to ask, use them.

## 1. Set up your tools (45 min)

You need an editor, Git, a way to install Node.js, and a GitHub account. You also need to be
comfortable in a terminal.

### 1.1 Install VS Code

Download VS Code from [code.visualstudio.com](https://code.visualstudio.com/) and install it. It is
the editor used throughout the course, and it has a built-in terminal (*Terminal → New Terminal*).

### 1.2 Install Git

**Windows.** Download **Git for Windows** from
[git-scm.com/download/win](https://git-scm.com/download/win) and run the installer. The defaults
are fine. It also installs **Git Bash**, a terminal that behaves like the macOS and Linux ones. The
commands on this page work in Git Bash. In VS Code, open the terminal and choose *Git Bash* from the
dropdown next to the `+` button.

**macOS.** Open Terminal and run `git --version`. If Git is missing, macOS offers to install the
Xcode command-line tools. Accept, or run:

```bash
xcode-select --install
```

Or install it with [Homebrew](https://brew.sh/): `brew install git`.

**Linux.** Install Git with your package manager. For Debian and Ubuntu:

```bash
sudo apt update
sudo apt install git
```

On Fedora use `sudo dnf install git`.

Now tell Git who you are and make `main` the default branch name. Use the email address on your
GitHub account.

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
```

**You should see.** Running `git --version` prints a version number such as:

```
git version 2.53.0
```

Any recent 2.x version is fine.

### 1.3 Install Node.js with a version manager

A version manager installs Node.js for you and lets each project use its own version. This course
uses **Node.js 24 LTS**. We pin that version in a file called `.nvmrc`, so anyone who clones your
project knows which version it needs.

**Windows.** Install **nvm-windows** from its
[releases page](https://github.com/coreybutler/nvm-windows) (the installer is `nvm-setup.exe`). Then
open a *new* terminal as Administrator and run:

```bash
nvm install 24
nvm use 24
```

nvm-windows does not read `.nvmrc` for you, so you run `nvm use 24` yourself in each new terminal if
the version changes. [Volta](https://volta.sh/) is an alternative if you prefer one.

**macOS.** Install **nvm** using the install command in the
[nvm README](https://github.com/nvm-sh/nvm#installing-and-updating). Then open a *new* terminal and
run:

```bash
nvm install 24
nvm use 24
```

If you prefer, `brew install fnm` is an alternative with similar commands.

**Linux.** Install **nvm** using the install command in the
[nvm README](https://github.com/nvm-sh/nvm#installing-and-updating). Then open a *new* terminal and
run:

```bash
nvm install 24
nvm use 24
```

**You should see.**

```
$ node --version
v24.x.x
$ npm --version
11.x.x
```

The exact numbers will differ. The node version should start with `v24`.

### 1.4 Create a GitHub account and sign in from the terminal

Create a free account at [github.com/signup](https://github.com/signup) if you don't have one. Then
install the **GitHub CLI** (`gh`). It handles signing in and gives you commands for pull requests.

- **Windows:** `winget install --id GitHub.cli` (open a new terminal afterwards so the command is
  found).
- **macOS:** `brew install gh`
- **Linux:** follow the instructions for your distribution in the
  [GitHub CLI install guide](https://github.com/cli/cli/blob/trunk/docs/install_linux.md).

Then sign in. Choose *GitHub.com*, then *HTTPS*, say yes to authenticating Git with your GitHub
credentials, and sign in through the browser.

```bash
gh auth login
```

**You should see.**

```
$ gh auth status
github.com
  ✓ Logged in to github.com account your-username
```

> **Other ways to sign in.** You can also use a credential manager or SSH keys. The GitHub CLI is the
> quickest for a first day, so this page uses it. The steps for SSH are in
> [GitHub's SSH guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh).

### 1.5 Terminal basics

You need six commands to move around. Try each one.

| Command | What it does |
| --- | --- |
| `pwd` | Print the folder you are in. |
| `ls` | List the files in this folder. |
| `cd folder-name` | Move into a folder. `cd ..` moves up one level. |
| `mkdir folder-name` | Create a folder. |
| `cat file-name` | Print a file's contents. |
| `code .` | Open the current folder in VS Code. |

If `code .` isn't found, open the folder from VS Code with *File → Open Folder* instead.

**Checkpoint 1**

- [ ] `git --version` prints a version.
- [ ] `node --version` starts with `v24`.
- [ ] `gh auth status` says you're logged in.
- [ ] You can open a terminal in VS Code.

## 2. Git, hands-on (60 min)

Git records snapshots of your project. Most confusion comes from not knowing *where* a change is, so
start with the three places.

```
Working tree  --git add-->  Staging area  --git commit-->  Commit history
```

You edit files in the working tree, choose what goes into the next snapshot with `git add` (the
staging area), and record it with `git commit`.

### 2.1 A practice repo

Practise in a throwaway repo so mistakes cost nothing. Create it somewhere outside your real
project.

1. Make a folder and turn it into a Git repo.

   ```bash
   mkdir git-practice
   cd git-practice
   git init
   ```

   **You should see.** `Initialized empty Git repository in .../git-practice/.git/`

2. Create a file called `notes.txt` in VS Code containing the single line `line one`. Then check
   where Git thinks it is.

   ```bash
   git status
   ```

   **You should see.**

   ```
   On branch main
   Untracked files:
     (use "git add <file>..." to include in what will be committed)
           notes.txt

   nothing added to commit but untracked files present (use "git add" to track)
   ```

   The file is in the working tree, and Git is not tracking it yet.

3. Stage the file, check again, then commit it.

   ```bash
   git add notes.txt
   git status
   git commit -m "docs: add notes"
   ```

   After `git add`, `git status` lists `notes.txt` under *Changes to be committed*. That means it is
   in the staging area. After the commit, it is in the history.

4. See your history.

   ```bash
   git log --oneline
   ```

   **You should see.** `586d019 docs: add notes`. Your hash, the seven characters at the start, will
   be different.

### 2.2 Looking at and undoing changes

1. Add a second line, `line two`, to `notes.txt` and save. See exactly what changed.

   ```bash
   git diff
   ```

   **You should see.**

   ```
   diff --git a/notes.txt b/notes.txt
   --- a/notes.txt
   +++ b/notes.txt
   @@ -1 +1,2 @@
    line one
   +line two
   ```

   Lines starting with `+` were added and lines starting with `-` were removed.

2. Throw that change away with `git restore`.

   ```bash
   git restore notes.txt
   cat notes.txt
   ```

   The file is back to just `line one`. If you had staged it first, `git restore --staged notes.txt`
   would unstage it without losing your edit.

   > **Restore can't be undone.** An uncommitted change that you restore is gone. Commit or stash
   > anything you want to keep.

3. Set work aside with `git stash`. Add a line `work in progress`, then:

   ```bash
   git stash
   cat notes.txt
   git stash pop
   cat notes.txt
   ```

   The stash hides your uncommitted edit so you have a clean tree, and `git stash pop` brings it
   back. Use it when you need to switch tasks before you are ready to commit. Run
   `git restore notes.txt` to drop the line again.

### 2.3 Undoing a commit: `revert` vs `reset`

Both undo a commit, in very different ways.

| | `git revert` | `git reset` |
| --- | --- | --- |
| What it does | Adds a *new* commit that does the opposite of an earlier one. | Moves the branch pointer back, so later commits drop out of the history. |
| History | Kept. The bad commit and its undo both stay visible. | Rewritten. The commits you reset past disappear from the branch. |
| Safe on shared branches? | Yes. Other people can pull it normally. | No. Others who already have those commits get a diverged history. |
| Use it when | The commit is already pushed or shared. | The commit is only on your machine and you want it gone. |

Try both. First, `revert`:

```bash
echo "line two" >> notes.txt
git commit -am "docs: add line two"
echo "oops" >> notes.txt
git commit -am "docs: add oops"
git revert --no-edit HEAD
git log --oneline
cat notes.txt
```

**You should see.**

```
5816cf0 Revert "docs: add oops"
c80fa8f docs: add oops
0b2e519 docs: add line two
586d019 docs: add notes
```

and `notes.txt` has `line one` and `line two` only. The bad commit is still in the log, and the
revert is a new commit on top.

Now `reset`. Make another mistake and remove it from the history entirely:

```bash
echo "another oops" >> notes.txt
git commit -am "docs: add another oops"
git reset --hard HEAD~1
git log --oneline
```

**You should see.** The "another oops" commit is gone from the log, and `notes.txt` no longer has
that line.

> **Careful with `--hard`.** `git reset --hard` also throws away uncommitted changes. Never use it
> on commits you have already pushed and shared. If you reset too far, `git reflog` lists where your
> branch has been, and `git reset --hard <hash>` takes you back.

### 2.4 Branching and merging

A branch is a separate line of work. You make changes on a branch so `main` stays in a good state,
then bring them back with a merge.

```bash
git switch -c try-branch
echo "from the branch" >> notes.txt
git commit -am "docs: add a line on a branch"
git switch main
git merge try-branch
git log --oneline
```

Because `main` had no new commits of its own, Git simply moves it forward. This is called a
*fast-forward* merge. When both branches have new commits, Git creates a *merge commit* that joins
them, and when both edited the same lines, it asks you to settle it. That is a conflict, and you
cause one in stage 5.

### 2.5 Merge vs rebase (concept only)

Both combine work from two branches. **Merge** keeps the history as it really happened and joins
the lines with a merge commit. **Rebase** replays your commits on top of the other branch, which
gives a straight line but rewrites your commits. You only use merge in this module. Rebase comes
later, once you are comfortable with history. Like `reset`, don't rebase commits that others already
have.

**Checkpoint 2**

- [ ] You can say which of the three places a change is in by reading `git status`.
- [ ] Your practice log shows a *Revert* commit, and the reset commit is gone.
- [ ] You merged `try-branch` into `main`.

## 3. Your repo & project files (20 min)

Now the real repo. It is the one you'll use for the whole course, so pick a name you'll be happy
with. This page uses `node-training`.

1. Make the folder, enter it, and initialise Git. Go up out of `git-practice` first.

   ```bash
   cd ..
   mkdir node-training
   cd node-training
   git init
   code .
   ```

2. In VS Code, create these four files. Creating them in the editor works the same on every
   operating system.

   `.nvmrc` pins the Node version:

   ```
   24
   ```

   `.gitignore` lists what Git should never track:

   ```
   node_modules/
   .env
   .env.test
   *.db
   src/generated/
   dist/
   coverage/
   ```

   `.env.example` is a template for settings, committed in place of the real `.env`:

   ```
   # Copy this file to .env and fill in real values.
   # There is nothing to configure yet.
   # PORT=3000
   ```

   `README.md`:

   ```
   # node-training

   Status: draft
   ```

3. Commit them as your first commit.

   ```bash
   git add .
   git commit -m "chore: add project scaffolding"
   ```

4. Create the public repo on GitHub from here and push in one go.

   ```bash
   gh repo create node-training --public --source=. --remote=origin --push
   ```

   **You should see.** Messages ending with the repo being created, and your files at
   `https://github.com/<your-username>/node-training` when you open it in the browser.

### Why each line of `.gitignore`

- `node_modules/`: installed packages. They are rebuilt from `package.json` and are large.
- `.env` and `.env.test`: real settings and secrets. Never commit them.
- `*.db`: local database files.
- `src/generated/`: code the Prisma tool generates later in the course. It is rebuilt, not written
  by hand.
- `dist/` and `coverage/`: build output and test reports. Both are rebuilt.

> **Never commit secrets.** On a public repo anyone can read your history, and deleting a secret
> from a later commit doesn't remove it from the earlier ones. That is why you commit `.env.example`
> with placeholder values and keep the real `.env` out of Git. If a secret ever does get committed,
> treat it as leaked: revoke it and create a new one.

**Checkpoint 3**

- [ ] Your repo is on GitHub and shows the four files.
- [ ] `git status` says *nothing to commit, working tree clean*.

## 4. Branch, commit & pull request (45 min)

### GitHub Flow

This is the everyday way teams work with GitHub. The same five steps apply to every change you will
make in this course.

1. Branch from `main`.
2. Commit your work on the branch.
3. Open a pull request (a PR).
4. Get it reviewed and respond to comments.
5. Merge it, then delete the branch.

### Conventional Commits

Commit messages follow a pattern: a **type**, a colon, and a short description in the imperative
mood. The pattern makes history easy to scan.

| Type | Use it for | Example |
| --- | --- | --- |
| `feat` | A new feature | `feat: add hello-node script` |
| `fix` | A bug fix | `fix: handle a missing name` |
| `docs` | Documentation only | `docs: explain how to run it` |
| `chore` | Maintenance and setup | `chore: add .gitignore` |

### Make the change

1. Create a feature branch. Never work directly on `main`.

   ```bash
   git switch -c feat/hello-node
   ```

2. Create `hello-node.js` in VS Code:

   ```js
   const name = process.argv[2] ?? "world";
   console.log(`Hello, ${name}!`);
   ```

   `process.argv` is the list of command-line arguments, and `??` supplies a default when none is
   given. Run it, then commit:

   ```bash
   node hello-node.js
   node hello-node.js Ana
   git add hello-node.js
   git commit -m "feat: add hello-node script"
   ```

   **You should see.**

   ```
   Hello, world!
   Hello, Ana!
   ```

3. In `README.md`, change the status line to `Status: runs with node hello-node.js`, then commit.

   ```bash
   git commit -am "docs: say how to run the script"
   ```

4. Add a line at the end of `README.md`: `Run: node hello-node.js [name]`, then commit.

   ```bash
   git commit -am "docs: add usage line"
   git log --oneline
   ```

   **You should see.** Three new commits on top of `chore: add project scaffolding`, all with a
   Conventional Commits type.

5. Push the branch and open a pull request.

   ```bash
   git push -u origin feat/hello-node
   gh pr create --title "feat: add hello-node script" --body "Adds a hello-node script and a usage line in the README."
   ```

   You can also open your repo on GitHub and click *Compare & pull request*. Leave this PR open. You
   merge it in stage 6.

   **You should see.** A link to the new PR. On GitHub the *Commits* tab lists your three commits.

**Checkpoint 4**

- [ ] An open PR on GitHub with 3 commits.
- [ ] `node hello-node.js Ana` prints `Hello, Ana!`.

## 5. Merge conflict (40 min)

A conflict happens when two branches change the same lines and Git can't pick for you. On a team it
happens when two people work at once. Here you play both people, so the first conflict you meet is
a safe one.

### 5.1 Make a competing change

While your PR is open, a second change lands on `main` that edits the same status line.

1. Go back to `main` and branch off it.

   ```bash
   git switch main
   git switch -c docs/readme-status
   ```

2. In `README.md`, change `Status: draft` to `Status: work in progress`, then commit and push.

   ```bash
   git commit -am "docs: mark status as in progress"
   git push -u origin docs/readme-status
   ```

3. Open a PR for it and merge it. This is a normal, small PR, so *Create a merge commit* is fine.

   ```bash
   gh pr create --fill
   gh pr merge --merge --delete-branch
   ```

   You can do the same on GitHub in the browser. Then update your local `main`:

   ```bash
   git switch main
   git pull
   ```

### 5.2 Meet the conflict

Your open PR changes the same line, so it is now out of date. Bring `main` into your feature branch
to see it.

```bash
git switch feat/hello-node
git merge main
```

**You should see.**

```
Auto-merging README.md
CONFLICT (content): Merge conflict in README.md
Automatic merge failed; fix conflicts and then commit the result.
```

and `git status` lists `README.md` under *Unmerged paths*.

Open `README.md`. Git has marked the clash:

```
# node-training

<<<<<<< HEAD
Status: runs with node hello-node.js
Run: node hello-node.js [name]
=======
Status: work in progress
>>>>>>> main
```

The part between `<<<<<<< HEAD` and `=======` is your branch, and the part below it up to
`>>>>>>> main` is the other side. Git won't guess which to keep, and it might need both.

### 5.3 Resolve it

1. Edit the file to the text you want. Here, keep the status from `main` and your usage line, and
   delete all three marker lines (`<<<<<<<`, `=======`, `>>>>>>>`):

   ```
   # node-training

   Status: work in progress. Runs with node hello-node.js
   Run: node hello-node.js [name]
   ```

2. Tell Git it's resolved by staging the file, then finish the merge.

   ```bash
   git add README.md
   git commit --no-edit
   git push
   ```

   **You should see.** A merge commit in `git log --oneline --graph` that joins the two lines of
   work. On GitHub, your PR now says *This branch has no conflicts with the base branch*.

> **Check before you commit.** Search the file for `<<<<<<<` before you commit. Leftover markers are
> the most common conflict mistake. If you get lost, `git merge --abort` returns you to before the
> merge.

**Checkpoint 5**

- [ ] You saw the `CONFLICT` message and the markers.
- [ ] The final `README.md` has no markers.
- [ ] A merge commit is in your branch history, and the PR is mergeable.

## 6. Review, merge & wrap up (30 min)

### 6.1 Review your PR

A review is a second look before code reaches `main`. If you have someone to ask, send them the PR
link and ask them to review it. If you are working alone, review it yourself, as if it were someone
else's.

1. Open the PR on GitHub and go to the *Files changed* tab.
2. Hover a line and click the `+` to leave a comment. Leave at least one, for example a question or
   a suggestion about wording.
3. Click *Review changes*, add a summary, and choose *Comment*. GitHub doesn't let you approve your
   own PR, so a comment is the right choice.

### 6.2 Merge it

Your PR needs 3 or more Conventional Commits, and the merge style matters here.

> **Choose "Create a merge commit".** The *Squash and merge* option folds all your commits into one,
> which erases the history this module asks for. Choose *Create a merge commit* instead.

```bash
gh pr merge --merge --delete-branch
```

You can also click the green button on GitHub. Then bring your local copy up to date and tidy up.

```bash
git switch main
git pull
git log --oneline --graph
```

**You should see.** Your three Conventional Commits, the conflict-resolving merge commit and the
merge of the PR in the history on `main`.

### 6.3 Wrap up

- Check that `.gitignore` and `.env.example` show on GitHub, and that no `.env` file is committed.
- Say the difference between `git revert` and `git reset` out loud, without looking, in your own
  words.
- Keep this repo. You'll keep working in it for the rest of the course.

## Check your understanding

Answer each one in your head, then compare.

**Where is a change after you edit a file but before `git add`?** In the working tree only.
`git status` lists it under *Changes not staged for commit*. It is not in the staging area or the
history yet.

**Why work on a feature branch instead of `main`?** So `main` always holds work that has been
reviewed and works. A branch lets you experiment, and the PR gives others a chance to review before
anything lands on `main`.

**Why is `.env.example` committed when `.env` is not?** A new person needs to know which settings
the project expects, and the example shows that without any real values. The real `.env` holds
secrets, and anything committed to a public repo is public for good.

**What do you do when Git reports a conflict?** Open the marked file, decide what the final text
should be, delete the three marker lines, run `git add` on the file, and commit.
`git merge --abort` backs out if you want to start again.

**Explain `git revert` vs `git reset`.** `revert` adds a new commit that undoes an earlier one, so
history is kept and it is safe on shared branches. `reset` moves the branch back and drops commits
from history, so use it only on commits that exist just on your machine.

**Why choose a merge commit over squash for this module's PR?** Squashing folds the commits into
one, so the PR wouldn't show 3 or more Conventional Commits, and the conflict-resolving merge would
be lost from the history.

## Troubleshooting

**`git` or `node` says "command not found".** Close the terminal and open a new one. A terminal only
learns about newly installed tools when it starts. If it still fails, rerun the installer, and on
Windows make sure you're using Git Bash.

**`node --version` isn't v24.** Run `nvm use 24`. If it says 24 isn't installed, run
`nvm install 24` first. On Windows, run these in a terminal opened as Administrator.

**"Please tell me who you are" or "Author identity unknown".** Set your name and email with the
`git config --global` commands from stage 1.2.

**The commit message editor opened and I can't leave it.** It is probably Vim. Press `Esc`, then
type `:wq` and press Enter to save, or `:q!` to quit without saving. Using `-m "message"` avoids the
editor.

**`git push` is rejected or asks for a password.** Rejected with "fetch first" or "non-fast-forward"
means the remote has commits you don't. Run `git pull`, resolve any conflict, then push again. If it
asks for a password or fails to authenticate, run `gh auth login` again and choose HTTPS.

**The branch is called `master`, not `main`.** Set `git config --global init.defaultBranch main`,
then rename this repo's branch with `git branch -M main`.

**I committed on `main` by mistake.** If you haven't pushed yet, move the commits to a new branch
and put `main` back:

```bash
git switch -c feat/my-change
git branch -f main origin/main
```

**A warning about "LF will be replaced by CRLF" on Windows.** It's harmless. Git is adjusting line
endings between Windows and the repo. You can ignore it for this course.

**I got lost in the middle of a conflict.** Run `git merge --abort` to return to the state before
the merge, then start stage 5.2 again.

## You're done when

- [ ] You have a merged pull request on a **public** repo with 3 or more Conventional Commits.
- [ ] The repo contains a `hello-node` script.
- [ ] A merge conflict that you resolved is in the history.
- [ ] `.gitignore` is in the repo and covers `node_modules`, `.env`, `*.db`, the generated Prisma
  client, `dist` and `coverage`.
- [ ] `.env.example` is in the repo, even though there is nothing to configure yet.
- [ ] You can explain, in your own words, the difference between `git revert` and `git reset`.

Tick everything before you start the next module.

## Further reading

- [GitHub Docs: Get started](https://docs.github.com/en/get-started)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Pro Git](https://git-scm.com/book)

---

[← All modules](../../index.html) · Next: M02, Modern JavaScript & Async/Await (coming soon)
