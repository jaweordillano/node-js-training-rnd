# AGENTS.md

Guidance for AI coding agents working in this repository.

## Who you are working with

The user is a **contributor to this training repo**. The repo is a scaffolded training R&D project
that is being refined into a training programme for **intermediate Node.js users**. The current
work is turning each stage in `modules/` into a **training module delivered as HTML documents**.

Work module by module: each stage in `modules/` gets its own training module.

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
| `docs/build-to-teach-framework.md` | The build-to-teach cycle the programme follows |
| `knowledge/` | Reusable patterns, prompts and rules (currently empty scaffolding) |
| `.claude/` | Claude Code agents, commands and settings (gitignored) |
| `graphify-out/` | Generated knowledge graph (gitignored; do not edit) |

Stages in order: M01 Dev Environment/Git/GitHub → M02 Modern JS & Async/Await → M03 Node Runtime &
npm → M04 TypeScript on Node → M05 Express Task API v1 → M06 SQL/SQLite → M07 Prisma & Migrations →
M08 Zod Validation → M09 Integration Testing (Jest + Supertest) → M10 Capstone. The Task API carries
forward v1 → v4 across M05–M09. Later stages build on earlier ones; keep content consistent with
the "Builds on" column in `modules/README.md`.

## Source of truth

Before writing a training module, read, in this order:

1. The stage's `brief.md` (objective, scope, stack constraints, deliverable, lab, definition of
   done).
2. The stage's `tasks.md` and `write-up-template.md`.
3. `modules/README.md` for sequencing and dependencies.
4. `docs/prd/` and `docs/arch-docs/` for programme-level intent and constraints.

If the brief and your content disagree, the brief wins. If a brief seems wrong, tell the user
rather than silently diverging.

## Build-to-teach principles

The programme is **build-to-teach**: trainees build toward a deliverable from a brief, then write up
how they did it so the next cohort can follow with no trainer. Training module content should
respect that:

- Match the stage's scope and stack constraints exactly. Do not introduce tools, libraries or
  topics outside the brief.
- Teach the *reasoning and decisions*, not just commands or steps.
- Briefs intentionally contain **no solutions**. Do not edit `brief.md` to add answers, steps or
  code unless the user explicitly asks.
- Respect the stage's definition of done and the deliverable it names.
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
- Every module should cover: objective, prerequisites ("builds on"), concepts, a guided lab or
  exercise, a check-your-understanding section, and the stage's definition of done.
- Code samples must be correct for the pinned Node version (see the module's `.nvmrc` guidance in
  M01) and the stage's stack. Run or verify samples when feasible rather than assuming they work.
- Keep a shared look and feel across modules; reuse stylesheet and structure instead of copying
  one-off styles per file.
- **Every module page has two twin files, `index.html` and `index.md`, with the same content and
  section order. Update both in the same change on every revision; never leave one stale.**
- Layout: `index.html` (home page and table of contents) and `assets/style.css` (the one shared
  stylesheet) at the repo root; each module page is `modules/<stage>/index.html` (with its `index.md` twin), beside the brief.
  Never edit `brief.md` while doing so.
  Link a module from the home page table when its page exists; until then it shows "Coming soon".

## Git workflow

- Branch per module, named like `feat/mNN-<slug>` (e.g. `feat/m01-dev-environment-git-github`).
  The default branch is `main`; do not commit directly to it.
- Use **Conventional Commits** (`feat:`, `docs:`, `fix:`, `chore:`), matching existing history.
- Commit or push only when the user asks.
- Never commit secrets, `.env*` files, `*.db`, `node_modules/`, `dist/`, `coverage/`,
  `graphify-out/` or `.claude/` (all gitignored).

## Working style

- Make focused, minimal changes scoped to the module being worked on.
- Match the tone and formatting of the existing Markdown docs (plain, direct, second person for
  trainee-facing text).
- Prefer editing existing files over creating new ones; do not create extra documentation unless
  asked.
- When requirements are ambiguous (structure, location, depth of a module), ask a short question
  rather than guessing.
