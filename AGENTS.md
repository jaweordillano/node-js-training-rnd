# AGENTS.md

Guidance for AI coding agents working in this repository.

## Who you are working with

The user is a **contributor and trainer** on this training repo. The repo is being refined into an
**asynchronous, self-paced course for intermediate Node.js students**, delivered as HTML documents.

The **user** does the build-to-teach: they build each stage and write it up (the briefs, tasks and
write-up templates in `modules/` are that authoring workflow). **Students do not build-to-teach.**
They follow the finished course pages and learn from them, with no trainer to ask. Write every
course page for the student.

Work module by module: each stage in `modules/` gets its own course page.

## Terminology

- A **module** here is a *training stage* (M01–M10), not a JavaScript/Node.js module. M02 and M03
  are where the JS/Node.js sense (ESM vs CommonJS, named vs default exports) is taught. Be explicit
  about which sense you mean in any content you write.
- **Brief** = `modules/<stage>/brief.md`. **Tasks** = `tasks.md`. **Write-up** =
  `write-up-template.md`.

## Repository map

| Path | What it is |
| --- | --- |
| `modules/mNN-<slug>/` | One folder per stage (M01–M10): `brief.md`, `tasks.md`, `write-up-template.md`, plus the training module twins `index.html` and `index.md` |
| `modules/README.md` | Stage table: week/day, hours, and which stages each builds on |
| `docs/prd/` | Product requirements for the training programme |
| `docs/arch-docs/` | Solution design for the programme |
| `docs/build-to-teach-framework.md` | The build-to-teach cycle the user follows to author the course |
| `knowledge/` | Reusable patterns, prompts and rules (currently empty scaffolding) |
| `.claude/` | Claude Code agents, commands and settings (gitignored) |
| `graphify-out/` | Generated knowledge graph (gitignored; do not edit) |

Stages in order: M01 Dev Environment/Git/GitHub → M02 Modern JS & Async/Await → M03 Node Runtime &
npm → M04 TypeScript on Node → M05 Express Task API v1 → M06 SQL/SQLite → M07 Prisma & Migrations →
M08 Zod Validation → M09 Integration Testing (Jest + Supertest) → M10 Capstone. The Task API carries
forward v1 → v4 across M05–M09. Later stages build on earlier ones; keep content consistent with
the "Builds on" column in `modules/README.md`.

## Source of truth

Before writing a course page, read, in this order:

1. The stage's `brief.md` (objective, scope, stack constraints, deliverable, lab, definition of
   done).
2. The stage's `tasks.md` and `write-up-template.md` (the user's authoring notes).
3. `modules/README.md` for sequencing and dependencies.
4. `docs/prd/` and `docs/arch-docs/` for programme-level intent and constraints.

The brief decides scope, stack and the deliverable; the course page decides how it is taught. If
the two disagree, tell the user rather than silently diverging. Do not edit `brief.md` unless the
user asks.

## Teaching principles (student-facing course pages)

Students learn by following the page, so it must be complete enough to follow alone:

- **Teach fully.** Give steps, commands, code, expected output and worked answers. The old
  "no solutions, no steps" rule applied to the briefs only and does not apply to course pages.
- **Explain why**, not just what, so students can adapt when something differs on their machine.
- Match the stage's scope and stack exactly. Do not introduce tools, libraries or topics outside
  the brief.
- Give a **time plan** (stages with minutes), a **checkpoint** after each stage ("you should see
  this"), **troubleshooting** for common failures, and a **"you're done when"** checklist.
- Cover **Windows, macOS and Linux** wherever commands differ. Mark commands you could not run
  yourself as untested and tell the user.
- Students have no assigned partner or trainer. Replace pair or review steps with something they
  can do alone, and say so.
- Leave the right things behind: some stages hand artifacts forward (e.g. the Async toolkit from
  M02, the Task API through M09). Keep those hand-offs consistent.

## Authoring HTML training modules

> These are defaults. Update this section as the team settles its conventions.

- One training module per stage, named to match the stage folder (e.g. `m01-dev-environment-git-github`).
- **Pure HTML and CSS. No JavaScript**, no build step, no framework, no CDN dependencies, so files
  open by double-click and work offline. Use native elements (`<details>`, anchor links,
  checkboxes) for interactivity.
- Semantic HTML: one `<h1>`, ordered headings, `<nav>` for in-page navigation, `<pre><code>` for
  code, `<figure>`/`<figcaption>` for diagrams. Accessible by default (alt text, sufficient
  contrast, keyboard navigable, responsive).
- Every module page should cover: objective and time plan, prerequisites ("builds on"), concepts,
  a guided lab with checkpoints, a check-your-understanding section, troubleshooting, and a
  "you're done when" checklist.
- Code samples must be correct for the pinned Node version (see the module's `.nvmrc` guidance in
  M01) and the stage's stack. Run or verify samples when feasible rather than assuming they work.
- Keep a shared look and feel across modules; reuse stylesheet and structure instead of copying
  one-off styles per file.
- **Every module page has two twin files, `index.html` and `index.md`, with the same content and
  section order. Update both in the same change on every revision; never leave one stale.**
- Layout: `index.html` (the course front door and table of contents) and `assets/style.css` (the
  one shared stylesheet) at the repo root; each module page is `modules/<stage>/index.html` (with
  its `index.md` twin), beside the brief. Link a module from the home page when its page exists;
  until then it shows "Coming soon".
- Use the shared components in `assets/style.css` (`.steps`, `.expect`, `.time`, `.tabs` for OS
  tabs, callouts, `<details>` for troubleshooting) instead of inventing new ones.

## Git workflow

- Branch per module, named like `feat/mNN-<slug>` (e.g. `feat/m01-dev-environment-git-github`).
  The default branch is `main`; do not commit directly to it.
- Use **Conventional Commits** (`feat:`, `docs:`, `fix:`, `chore:`), matching existing history.
- Commit or push only when the user asks.
- Never commit secrets, `.env*` files, `*.db`, `node_modules/`, `dist/`, `coverage/`,
  `graphify-out/` or `.claude/` (all gitignored).

## Working style

- Make focused, minimal changes scoped to the module being worked on.
- Plain, direct, second person ("you") for student-facing text.
- Prefer editing existing files over creating new ones; do not create extra documentation unless
  asked.
- When requirements are ambiguous (structure, location, depth of a module), ask a short question
  rather than guessing.
