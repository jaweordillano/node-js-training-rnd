# M01 — Dev Environment, Git & GitHub

**Module M01 · Week 1 · Day 1 · about 90 minutes**

Install your tools, learn the five Git commands you need, and push your `node-js-training` project
to GitHub.

## Overview & time plan

**Builds on:** nothing. This is the first module.

This course is about Node.js, and Git is only the tool that saves your work. You learn the few Git
commands you will use every day, and nothing more.

By the end you will have a public GitHub repo called `node-js-training` with a small Node.js project
in it. **You will keep building in this one project for the whole course.** Every later module adds
to it.

1. Set up your tools: 30 min
2. Git crash course: 15 min
3. Create your project: 40 min

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

## 2. Git crash course (15 min)

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

From now on, finish every piece of work the same way: `git add .`, `git commit -m "..."`,
`git push`. You will use it in the next stage.

> **What we skip.** Git can do much more, such as branches, pull requests and undoing commits. You
> don't need any of it for this course, so we leave it out. Learn it later on a real team.

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

## Check your understanding

Answer each one in your head, then compare.

**What are the three commands you run to save and upload a change?**
`git add .`, `git commit -m "message"`, then `git push`.

**What is the difference between `git commit` and `git push`?**
`commit` saves a snapshot on your own machine only. `push` uploads your commits to GitHub.

**What does `git status` tell you?**
Which files are changed but not staged, which are staged for the next commit, and which are new and
untracked. Use it whenever you are unsure what state you are in.

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

**A warning about "LF will be replaced by CRLF" on Windows**
It's harmless. Git is adjusting line endings between Windows and the repo. Ignore it.

## You're done when

- [ ] Git, Node.js 24 and the GitHub CLI work from your terminal.
- [ ] A **public** `node-js-training` repo on GitHub shows your files.
- [ ] `npm start` prints your hello message.
- [ ] The repo has at least two commits.
- [ ] `.gitignore` and `.env.example` are in the repo, and no `.env` is.
- [ ] You can say what `git add`, `git commit` and `git push` each do.

Keep this repo. You build the rest of the course in it.

Next: M02, Modern JavaScript & Async/Await (coming soon).
