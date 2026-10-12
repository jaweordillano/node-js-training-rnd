# M01 — Dev Environment, Git & GitHub

**Module M01 · Week 1 · Day 1 · about 2 hours 15 minutes**

Install your tools, learn the Git commands you need, push your `node-js-training` project to
GitHub, and take a change through a pull request, including a merge conflict.

## Overview & time plan

**Builds on:** nothing. This is the first module.

This course is about Node.js, and Git is only the tool that saves your work. You learn the few Git
commands you will use every day, and nothing more. The last section is an exercise that takes one
change through a branch, a pull request, a merge conflict and a merge, the way teams work on GitHub.

By the end you will have a public GitHub repo called `node-js-training` with a small Node.js project
in it. **You will keep building in this one project for the whole course.** Every later module adds
to it.

1. Set up your tools: 30 min
2. Git crash course: 20 min
3. Create your project: 40 min
4. Exercise: your first pull request: 45 min

Type the commands yourself. A block labelled *You should see* shows what to expect. Your hashes and
version numbers will differ. If anything else differs, check [Troubleshooting](#troubleshooting).

## 1. Set up your tools (30 min)

You need an editor, Git, Node.js and a GitHub account.

### 1.1 Install VS Code

Download VS Code from [code.visualstudio.com](https://code.visualstudio.com/) and install it. It has
a built-in terminal (*Terminal → New Terminal*), and you will type every command in this course
there.

### 1.2 Install Git

**Windows.** Download **Git for Windows** from
[git-scm.com/download/win](https://git-scm.com/download/win) and run the installer. The defaults
are fine. It also installs **Git Bash**, a terminal that behaves like the macOS and Linux ones.
Every command in this course works in Git Bash. In VS Code, open the terminal and choose *Git Bash*
from the dropdown next to the `+` button.

**macOS.** Open Terminal and run `git --version`. If Git is missing, macOS offers to install it.
Accept the offer. Or use [Homebrew](https://brew.sh/): `brew install git`.

**Linux.** For Debian and Ubuntu:

```bash
sudo apt update
sudo apt install git
```

On Fedora use `sudo dnf install git`.

Tell Git who you are, and make `main` the default branch name. Use the email address on your GitHub
account.

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
```

*You should see:*

```text
$ git --version
git version 2.53.0
```

Any recent 2.x version is fine.

### 1.3 Install Node.js

This course uses **Node.js 24 LTS**. Install it through `nvm`, a tool that installs Node.js for you
and lets you switch versions later.

**Windows.** Install **nvm-windows** from its
[releases page](https://github.com/coreybutler/nvm-windows) (the installer is `nvm-setup.exe`). Then
open a *new* terminal as Administrator and run:

```bash
nvm install 24
nvm use 24
```

**macOS and Linux.** Install **nvm** using the install command in the
[nvm README](https://github.com/nvm-sh/nvm#installing-and-updating). Then open a *new* terminal and
run:

```bash
nvm install 24
nvm use 24
```

*You should see:*

```text
$ node --version
v24.x.x
$ npm --version
11.x.x
```

The exact numbers will differ. The Node version should start with `v24`.

### 1.4 GitHub account and sign-in

Create a free account at [github.com/signup](https://github.com/signup) if you don't have one. Then
install the **GitHub CLI** (`gh`). Its only job here is to sign you in, so that `git push` works
without asking for a password.

**Windows.**

```bash
winget install --id GitHub.cli
```

Open a new terminal afterwards so the command is found.

**macOS.**

```bash
brew install gh
```

**Linux.** Follow the steps for your distribution in the
[GitHub CLI install guide](https://github.com/cli/cli/blob/trunk/docs/install_linux.md).

Sign in. Choose *GitHub.com*, then *HTTPS*, say yes to authenticating Git with your GitHub
credentials, and finish in the browser.

```bash
gh auth login
```

*You should see:*

```text
$ gh auth status
github.com
  ✓ Logged in to github.com account your-username
```

### 1.5 Four terminal commands

That is all the terminal you need to start. Try each one.

| Command | What it does |
| --- | --- |
| `pwd` | Print the folder you are in. |
| `ls` | List the files in this folder. |
| `cd folder-name` | Move into a folder. `cd ..` moves up one level. |
| `mkdir folder-name` | Create a folder. |

**Checkpoint 1**

- [ ] `git --version` prints a version.
- [ ] `node --version` starts with `v24`.
- [ ] `gh auth status` says you're logged in.

## 2. Git crash course (20 min)

Git saves snapshots of your project, called **commits**, and GitHub keeps a copy online. Your work
moves through four places:

```text
Your folder --git add--> Staging area --git commit--> Local history --git push--> GitHub
```

You edit files in your folder, pick what goes into the next snapshot with `git add`, save the
snapshot with `git commit`, and upload it with `git push`.

| Command | What it does |
| --- | --- |
| `git init` | Turn the current folder into a Git repo. Run it once per project. |
| `git add .` | Stage every change in the folder for the next commit. |
| `git commit -m "message"` | Save a snapshot of what you staged, with a short message. |
| `git remote add origin URL` | Tell Git where your GitHub repo is. `origin` is just the usual name for it. Run it once per project. |
| `git push` | Upload your commits to GitHub. |
| `git status` | Show what is changed, staged or not saved yet. Run it whenever you are unsure. |
| `git switch -c name` | Create a new branch called `name` and move onto it. |
| `git switch name` | Move onto an existing branch. |
| `git merge name` | Bring the commits of branch `name` into the branch you are on. |
| `git pull` | Download new commits from GitHub into your branch. |

### 2.1 Branches

A **branch** is a separate line of commits. `main` is the branch that holds your working project.
When you want to try a change, you make a branch, commit there, and bring it back into `main` when it
is ready. If it goes wrong, `main` is untouched. Teams do this for every change, and the exercise in
section 4 follows the same steps, called **GitHub Flow**:

1. Create a branch from `main`.
2. Commit your change on that branch and push it.
3. Open a **pull request** (PR) on GitHub. A PR asks to merge your branch into `main` and shows the
   changes so they can be reviewed.
4. Merge the PR.

### 2.2 Merge vs rebase

There are two ways to bring one branch's work into another. **Merge** joins the two histories and
keeps what really happened, including a merge commit where they meet. **Rebase** replays your commits
on top of the other branch, so the history looks like one straight line, but it rewrites your
commits. You only use merge here. Rebase is worth reading about later, once you work in a team.

If two branches change the same line, Git cannot pick one, and it stops with a **merge conflict** for
you to resolve. You will make one on purpose in section 4.

### 2.3 Conventional Commits

From section 4 on, write commit messages as `type: short description`. The type says what kind of
change it is, so the history is easy to scan.

| Type | Use it for |
| --- | --- |
| `feat:` | A new feature or behaviour, such as `feat: print a greeting`. |
| `fix:` | A bug fix. |
| `docs:` | Documentation only, such as the README. |
| `chore:` | Housekeeping that changes no behaviour, such as config files. |

Outside the exercise, work on `main` and finish with `git add .`, `git commit -m "..."`,
`git push`. You use that loop in the next module.

> **What we skip.** Git can do much more, such as undoing commits (`revert` and `reset`), `stash`
> and rebase. You don't need them for this course, so we leave them out. Learn them later on a real
> team.

## 3. Create your project (40 min)

You will build `node-js-training`, the project you keep using in every module. It starts with plain
JavaScript. Later modules add TypeScript, Express and the other libraries, all in this same folder.

### 3.1 The files you will end up with

```text
node-js-training/
├── .gitignore        files Git must never save
├── .env.example      a template for secret settings
├── .nvmrc            the Node.js version for this project
├── package.json      the project's description and scripts
├── README.md         what the project is
└── src/
    └── hello.js      your first Node.js program
```

Your code lives in `src/`. Later modules put their code there too.

### 3.2 Build it

1. Make the folder, turn it into a Git repo, and open it in VS Code. Pick a place outside any other
   Git repo.

   ```bash
   mkdir node-js-training
   cd node-js-training
   git init
   code .
   ```

   If `code .` isn't found, use *File → Open Folder* in VS Code. Open its terminal from here on,
   which starts in this folder.

   *You should see:*

   ```text
   Initialized empty Git repository in .../node-js-training/.git/
   ```

2. Create the Node.js project file, then switch it to modern JavaScript modules and add a `start`
   script. M02 explains what `"type": "module"` means.

   ```bash
   npm init -y
   npm pkg set type=module scripts.start="node src/hello.js"
   ```

   The `package.json` file now exists. `npm` came with Node.js.

3. In VS Code, create the folder `src` and, inside it, the file `hello.js` with this line:

   ```js
   console.log("Hello, Node!");
   ```

   Run it two ways.

   ```bash
   node src/hello.js
   npm start
   ```

   *You should see:*

   ```text
   Hello, Node!
   ```

   `npm start` prints a couple of extra lines first. That is normal.

4. Create these three files in the project root (not inside `src`).

   `.gitignore` lists what Git must never save. `node_modules` is where installed libraries go and
   is large. `.env` will hold secrets. `*.db` are local databases. `dist` is built output.
   `coverage` is test reports.

   ```text
   node_modules
   .env
   *.db
   dist
   coverage
   ```

   `.env.example` shows which settings the project needs, with no real values. It is empty for now,
   so write a comment:

   ```text
   # Copy this file to .env and fill in real values. Never commit .env.
   ```

   `.nvmrc` pins the Node.js version, so anyone who opens the project knows which one to use:

   ```text
   24
   ```

5. Create `README.md`:

   ```markdown
   # node-js-training

   My project for the Node.js training course.
   ```

6. Check what Git sees.

   ```bash
   git status
   ```

   *You should see:*

   ```text
   On branch main

   No commits yet

   Untracked files:
           .env.example
           .gitignore
           .nvmrc
           README.md
           package.json
           src/
   ```

   Your list may differ slightly. These are not saved yet. If `node_modules` were here, it would be
   listed too, but it is already ignored.

7. Stage everything and make your first commit.

   ```bash
   git add .
   git commit -m "Add hello world project"
   ```

   *You should see:*

   ```text
   [main (root-commit) 3f2a1b9] Add hello world project
    6 files changed, 25 insertions(+)
   ```

   Your hash and counts will differ.

8. Create the empty repo on GitHub. Go to [github.com/new](https://github.com/new), then:

   - Name it `node-js-training`.
   - Choose **Public**.
   - Leave *Add a README*, *.gitignore* and *license* all **unchecked**. You already have your own
     files.
   - Click *Create repository*.

   The next page shows the repo's URL, which looks like
   `https://github.com/your-username/node-js-training.git`. Copy it.

   Public means anyone can read it. That is why secrets never go in it.

9. Connect your folder to that repo and push. Paste your own URL.

   ```bash
   git remote add origin https://github.com/your-username/node-js-training.git
   git push -u origin main
   ```

   `-u` remembers `origin main`, so from now on a plain `git push` is enough.

   *You should see:*

   ```text
   Writing objects: 100% (7/7), done.
   To https://github.com/your-username/node-js-training.git
    * [new branch]      main -> main
   branch 'main' set up to track 'origin/main'.
   ```

10. Reload your repo's page on GitHub. Your files and the commit message are there. That is your
    success mark for this module.

### 3.3 Practise the loop once

Do the save-and-upload loop one more time on a real change. Edit `src/hello.js` so it prints your
own name too:

```js
console.log("Hello, Node! I am Your Name.");
```

```bash
node src/hello.js
git status
git add .
git commit -m "Print my name"
git push
```

*You should see:* `git status` lists `src/hello.js` as *modified*. After `git push`, reload GitHub
and see the new line in `src/hello.js`, and two commits in the history.

**Checkpoint 2**

- [ ] `npm start` prints your hello message.
- [ ] `git log --oneline` shows two commits.
- [ ] GitHub shows all your files, and no `.env` or `node_modules`.

## 4. Exercise: your first pull request (45 min)

You will change the greeting on a branch, open a pull request on the GitHub website, make a merge
conflict on purpose, resolve it, and merge. You work alone, so you also play the teammate who causes
the conflict. Run every command inside `node-js-training`, and start from a clean `main`:
`git status` should say *nothing to commit*.

### 4.1 Make a branch with three commits

1. Create the branch and change the greeting.

   ```bash
   git switch -c feat/greeting
   ```

   Replace the contents of `src/hello.js` with:

   ```js
   console.log("Hello from my first branch!");
   ```

   ```bash
   git add .
   git commit -m "feat: change the greeting"
   ```

2. Add a line to the end of `README.md`, then commit it.

   ```markdown
   Run it with `npm start`.
   ```

   ```bash
   git add .
   git commit -m "docs: explain how to run the project"
   ```

3. Add a description to `package.json`, then commit it.

   ```bash
   npm pkg set description="My Node.js training project"
   git add .
   git commit -m "chore: add a project description"
   ```

4. Push the branch. `-u` remembers it, as before.

   ```bash
   git push -u origin feat/greeting
   ```

*You should see:*

```text
$ git log --oneline
ad3f5ed chore: add a project description
143ed6d docs: explain how to run the project
9b4c487 feat: change the greeting
f08fac5 Print my name
```

After the push, the last lines say `* [new branch] feat/greeting -> feat/greeting` and
`branch 'feat/greeting' set up to track 'origin/feat/greeting'`. Your hashes will differ, and the
last commit is whatever your previous commit was called.

**Checkpoint 3**

- [ ] You have three commits on `feat/greeting`, each starting with `feat:`, `docs:` or `chore:`.
- [ ] `git status` says the branch is up to date with `origin/feat/greeting`.

### 4.2 Open the pull request on GitHub

1. Open your `node-js-training` repo on GitHub and reload. A yellow banner says *feat/greeting had
   recent pushes*. Click **Compare & pull request**. If the banner is gone, open the *Pull requests*
   tab, click **New pull request**, leave *base* as `main`, and set *compare* to `feat/greeting`.
2. Give it a title such as `Change the greeting`. In the description, write one or two sentences
   about what changed and why. Leave everything else as it is.
3. Click **Create pull request**.
4. Open the *Commits* tab. Your three commits are listed. Then open *Files changed*, which shows every
   line you added or removed. This is where a teammate would review you. With no partner, read it
   yourself as if someone else wrote it.

**Do not merge yet.**

*You should see:* a page titled with your PR title and a number such as *#1*. A green **Merge pull
request** button appears near the bottom, and the *Commits* tab shows **3**.

**Checkpoint 4**

- [ ] The PR is open and its *Commits* tab lists three commits.

### 4.3 Make a merge conflict on purpose

Now play the teammate. They change the same line of `hello.js` on their own branch, and their change
reaches `main` before yours.

1. Make a second branch from `main` and change line 1 of `src/hello.js`.

   ```bash
   git switch main
   git switch -c feat/shout
   ```

   ```js
   console.log("HELLO, NODE!");
   ```

   ```bash
   git add .
   git commit -m "feat: shout the greeting"
   ```

2. Merge it into `main` and push. This is the one time you push straight to `main`, to pretend a
   teammate's PR was merged.

   ```bash
   git switch main
   git merge feat/shout
   git push
   ```

3. Go back to your PR page on GitHub and reload. It now says *This branch has conflicts that must be
   resolved*, because `main` and your branch both changed line 1. GitHub offers a *Resolve
   conflicts* button, but resolve it on your machine so you see what Git does.

*You should see:*

```text
$ git merge feat/shout
Updating f08fac5..5e8da2a
Fast-forward
 src/hello.js | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

Fast-forward just means `main` had no other changes, so Git moved it forward.

### 4.4 Resolve the conflict

1. Move back to your PR branch and bring `main` into it.

   ```bash
   git switch feat/greeting
   git merge main
   ```

   Git stops, because it cannot choose between the two versions of line 1.

   *You should see:*

   ```text
   Auto-merging src/hello.js
   CONFLICT (content): Merge conflict in src/hello.js
   Automatic merge failed; fix conflicts and then commit the result.
   ```

   `git status -s` shows `UU src/hello.js`: both sides changed it.

2. Open `src/hello.js` in VS Code. Git has written both versions into the file:

   ```text
   <<<<<<< HEAD
   console.log("Hello from my first branch!");
   =======
   console.log("HELLO, NODE!");
   >>>>>>> main
   ```

   Between `<<<<<<< HEAD` and `=======` is your branch's line. Between `=======` and
   `>>>>>>> main` is the one from `main`. VS Code also shows buttons above it: *Accept Current
   Change* (yours), *Accept Incoming Change* (from `main`) and *Accept Both Changes*.

3. Decide what the line should say and delete the three marker lines. For this exercise, make the
   file contain just one line, which combines both ideas:

   ```js
   console.log("HELLO FROM MY FIRST BRANCH!");
   ```

   You can click a button and then edit, or type it yourself. Either way, no `<<<<<<<`, `=======` or
   `>>>>>>>` line may be left. Check that it runs.

   ```bash
   node src/hello.js
   ```

4. Tell Git the conflict is resolved by committing, then push.

   ```bash
   git add .
   git commit -m "fix: resolve conflict with main"
   git push
   ```

*You should see:*

```text
$ node src/hello.js
HELLO FROM MY FIRST BRANCH!
$ git log --oneline --graph
*   939efef fix: resolve conflict with main
|\
| * 5e8da2a feat: shout the greeting
* | ad3f5ed chore: add a project description
* | 143ed6d docs: explain how to run the project
* | 9b4c487 feat: change the greeting
|/
* f08fac5 Print my name
```

The two lines that split and join again are the conflict in your history. Reload the PR on GitHub:
the conflict warning is gone.

**Checkpoint 5**

- [ ] No `<<<<<<<`, `=======` or `>>>>>>>` lines remain in `src/hello.js`, and `node src/hello.js`
      runs.
- [ ] `git log --oneline --graph` shows the branch splitting and joining.
- [ ] The PR on GitHub shows no conflicts.

### 4.5 Merge the pull request

1. On the PR page, click the green **Merge pull request** button, then **Confirm merge**. Click the
   button itself, not the small arrow beside it. The arrow offers *Squash and merge* and *Rebase and
   merge*, which would rewrite your three commits. Use the default, *Create a merge commit*.
2. The PR turns purple and says **Merged**. Click **Delete branch**. The work is safe in `main`.
3. Bring the merge into your own copy, and delete the local branches.

   ```bash
   git switch main
   git pull
   git branch -d feat/greeting feat/shout
   ```

*You should see:* `git pull` downloads the merge commit and updates `main`. `git branch` then lists
only `main`. On GitHub, the *Pull requests* tab, under *Closed*, shows your PR with the purple Merged
icon.

**Checkpoint 6**

- [ ] The PR says **Merged** and carries three or more Conventional Commits.
- [ ] Your local `main` is up to date and `npm start` prints your greeting.

## Check your understanding

Answer each one in your head, then compare.

**What are the three commands you run to save and upload a change?**
`git add .`, `git commit -m "message"`, then `git push`.

**What is the difference between `git commit` and `git push`?**
`commit` saves a snapshot on your own machine only. `push` uploads your commits to GitHub.

**What does `git status` tell you?**
Which files are changed but not staged, which are staged for the next commit, and which are new and
untracked. Use it whenever you are unsure what state you are in.

**Why make a branch instead of committing straight to `main`?**
`main` stays working while you try a change. The change is reviewed in a pull request, and it only
reaches `main` when you merge it.

**What is the difference between merge and rebase?**
Merge joins two histories and keeps what happened, with a merge commit. Rebase replays your commits
on top of another branch to make a straight line, which rewrites them. This course only uses merge.

**What is a merge conflict, and what do the `<<<<<<<`, `=======` and `>>>>>>>` lines mean?**
A conflict happens when two branches change the same lines and Git cannot choose. The markers fence
the two versions: yours above `=======` and the other branch's below. You edit the file to what you
want, delete the markers, then `git add .` and commit.

**Why is `.env.example` committed but `.env` is in `.gitignore`?**
The example shows what settings the project expects, with no real values. The real `.env` holds
secrets, and anything pushed to a public repo is public for good.

## Troubleshooting

**`git`, `node` or `gh` says "command not found"**
Close the terminal and open a new one. A terminal only learns about newly installed tools when it
starts. If it still fails, rerun the installer. On Windows, make sure you're using Git Bash.

**`node --version` isn't v24**
Run `nvm use 24`. If it says 24 isn't installed, run `nvm install 24` first. On Windows, run these
in a terminal opened as Administrator.

**"Please tell me who you are" or "Author identity unknown"**
Set your name and email with the `git config --global` commands from step 1.2, then commit again.

**The commit message editor opened and I can't leave it**
You left out `-m "message"`. The editor is probably Vim. Press `Esc`, type `:q!` and press Enter to
quit, then run the commit again with `-m`.

**`git push` asks for a password or says authentication failed**
Run `gh auth login` again, choose HTTPS, and say yes to authenticating Git. Check that the remote
URL is yours with `git remote -v`.

**`git push` says "remote contains work that you do not have"**
You ticked *Add a README* or another option when creating the GitHub repo, so it isn't empty. The
simplest fix is to delete the repo in its GitHub *Settings* (at the bottom of the page), create it
again with every option unticked, and push again.

**`git remote add` says "remote origin already exists"**
You added it already, possibly with a wrong URL. Fix the URL with
`git remote set-url origin YOUR-URL`.

**The branch is called `master`, not `main`**
Run `git branch -M main`, and set `git config --global init.defaultBranch main` so new repos use
`main`.

**A file I wanted to ignore is already on GitHub**
Adding a file to `.gitignore` doesn't remove it once it was committed. Run
`git rm --cached file-name` (add `-r` for a folder), commit, and push. If it held a secret, treat
the secret as leaked and replace it.

**There is no yellow "Compare & pull request" banner**
The branch isn't on GitHub yet, or the banner expired. Run `git push -u origin feat/greeting`, then
use *Pull requests → New pull request* and pick your branch under *compare*.

**Git says "You have unmerged paths" or I'm stuck in the middle of a merge**
You started `git merge` and a conflict is still open. Fix `src/hello.js` as in step 4.4, then
`git add .` and commit. To give up and start the merge again, run `git merge --abort`.

**I committed with the conflict markers still in the file**
Open `src/hello.js`, delete the marker lines, then run `git add .`,
`git commit -m "fix: remove conflict markers"` and `git push`.

**`git merge main` says "Already up to date"**
Step 4.3 didn't reach `main`. Check that you ran `git merge feat/shout` and `git push` while on `main`, then try again.

**I clicked *Squash and merge* or *Rebase and merge*, and the PR shows one commit**
It can't be undone on GitHub. Make a new branch, make three Conventional Commits and open a new PR,
then use the plain *Merge pull request* button.

**A warning about "LF will be replaced by CRLF" on Windows**
It's harmless. Git is adjusting line endings between Windows and the repo. Ignore it.

## You're done when

- [ ] Git, Node.js 24 and the GitHub CLI work from your terminal.
- [ ] A **public** `node-js-training` repo on GitHub shows your files.
- [ ] `npm start` prints your hello message.
- [ ] A pull request on the repo is **merged** and carries three or more Conventional Commits.
- [ ] `.gitignore` and `.env.example` are in the repo, and no `.env` is.
- [ ] You can say what `git add`, `git commit` and `git push` each do.
- [ ] `git log --oneline --graph` shows a resolved merge conflict.
- [ ] You can say what a branch, a pull request and a merge conflict are.

Keep this repo. You build the rest of the course in it.

Next: [M02, Modern JavaScript & Async/Await](../m02-modern-javascript-async-await/index.md).
