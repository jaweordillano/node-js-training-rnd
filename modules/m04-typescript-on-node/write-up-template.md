# M04 Write-Up — TypeScript Basics & TypeScript on Node.js

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own.

## What I built

The M02 toolkit ported to TypeScript, the Task domain types, and your `tsc --noEmit` output.

**Training module page (authored, 2026-10-12).** A student-facing page for M04 as twin files, `index.html` and `index.md`, plus a second twin pair, `solution.html` and `solution.md`, for the exercise answer. About 3 hours (180 min): why TypeScript and set up the project 25, core types 30, functions, generics and narrowing 35, utility types and the Task domain 30, exercise: port the Async toolkit 40, running TypeScript on Node.js 15, check your understanding 5. The lab is built inside the `node-js-training` repo. Repo state in is M03's (plain JS, M02 toolkit). Out: `typescript@7`, `tsx`, `@types/node@24`, `tsconfig.json`, scripts `typecheck` and `check` (now `tsx`), `src/toolkit/toolkit.ts`, `check.ts` and `types.check.ts` (the `.js` files are renamed), `src/domain/task.ts`, and practice files in `src/labs/`. The home page row links to M04 and M03's pager links forward. The lab has not been done by a real student yet.

## Why it's built this way (key decisions)

- Which utility types did you use for `CreateTaskInput`/`UpdateTaskInput`, and why those over
  writing them by hand?
- How did you model `Result<T, E>`, and what would change if you'd modeled it differently?
- What specifically happened when you attempted native type stripping on Node 24?

**Decisions on the training page (2026-10-12)**

- **3 hours, not 8. This was my assumption.** The open questions (hours, replace vs keep the JS, PR step) were not answered, so I planned 3 h, replacing the JS files, and the plain add/commit/push loop with no PR. The brief, tasks and PRD still say 8 h and a PR habit, and I did not edit them.
- **The toolkit port is an exercise (your request).** `sleep` and `TimeoutError` are given as the worked example. The student ports `withTimeout`, `retry` and `mapLimit`, with two hint levels each, a list of likely compiler errors, and `types.check.ts` as the examiner. It fails to compile if a type is `any` or `unknown`, so a loose answer cannot pass.
- **Separate solution page (your request).** `solution.html` and `solution.md` hold the full `toolkit.ts`, a line-by-line explanation, and a table of wrong answers with the real compiler output. It is linked from the exercise "only after you have tried", and is not on the home page. This adds a second page pair per module, which `AGENTS.md` does not describe yet.
- **Task types:** `CreateTaskInput` is `Omit<Task, "id" | "createdAt" | "updatedAt">` and `UpdateTaskInput` is `Partial<CreateTaskInput>`, so they follow `Task`. `Result<T, E>` is a discriminated union with `ok()` and `err()` helpers. I used `interface` for `Task` and `type` for the unions and derived types, and the page states that rule.
- **tsconfig:** `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `erasableSyntaxOnly`, `rewriteRelativeImportExtensions`, `nodenext` and `noEmit`, with `.ts` import extensions so the same files run under `tsx`, native stripping and `tsc`. `rewriteRelativeImportExtensions` is not in the brief's list; it is what makes `.ts` imports work for all three.
- **Cut:** the research tasks (the page teaches instead), `enum` beyond showing it failing, declaration-file authoring, a full TypeScript 6 to 7 history, and a PR. Sections 2 to 4 say the practice files may be pasted, to fit the time.
- **Page generated from one source** (in the session scratchpad, not the repo). The code blocks are read from files I ran, so HTML, Markdown and sample output cannot drift.

## How to build it (teach it to the next trainee)

Write a guide to deriving input types from a domain type with utility types, using your own
example to show the reasoning, not just the syntax.

## Concepts worth explaining

Pick 1-2 ideas — `unknown` vs `any` vs `never`, `type` vs `interface`, or discriminated unions —
and explain each in your own words.

## What tripped me up

Compiler errors that confused you at first, and the difference between `tsx` and native type
stripping on Node 24.

- (2026-10-12) TypeScript 7 does not load `@types/node` on its own. `node:assert` failed with TS2591 until I added `"types": ["node"]`. My first scratch test passed only because it imported nothing from Node.js.
- `tsx` ran `greet(42)` and printed `Hello, 42`. It does not type-check, so the page teaches `npm run typecheck` as the real check.
- A `tsc` build failed with TS5011 until `--rootDir src` was set, which TypeScript 7 now requires.
- npm 11.19 printed an install-scripts warning about `esbuild` when installing `tsx`. `tsx` still worked, so the page notes it and ties it to M03.
- `export type` inside a callback in `types.check.ts` was a syntax error (TS1184). Fixed to a local `type`.
- My first plan counted a 5 min commit slot and a padded 60 min port. Making it an exercise brought the page to 180 min.
- A `rm -rf *` in a scratch folder was blocked by the safety check, because the working directory had been reset to the repo. I used a fresh scratch folder instead.

- (2026-10-12) While evaluating M05 I found that the brief's fixed Task contract uses `in_progress`, and this page used `in-progress`. I changed `types-core.ts`, `task.ts` and `task-demo.ts` and their outputs in both page twins, and re-ran the type check. The M04 `Task` still has `createdAt` and `updatedAt`, which go beyond the contract's field list; M05 keeps them.

## Checkpoint evidence

Show zero `tsc --noEmit` errors on your strict config, the toolkit running via `tsx`, and what
happened when you attempted native type stripping on Node 24.

(2026-10-12, page author, Linux/WSL, Node v24.21.0, TypeScript 7.0.2, tsx 4.23.15.) Every file was run in a scratch folder and the page's "You should see" blocks come from those runs, including every compiler error shown. The lab was rebuilt from the page's own code blocks in a fresh copy of the M02 repo, following the page's steps: the 16 errors in the exercise start state match the page exactly, the solution page's `toolkit.ts` gives zero `tsc --noEmit` errors, `npm run check` prints `All checks passed`, `node src/toolkit/check.ts` (native stripping) passes, an `enum` fails in strip-only mode, and a `tsc` build with `--rootDir src` runs. Ten wrong answers were tried to confirm `types.check.ts` catches loose types. Still student evidence to collect: their own explanation of `unknown` vs `any` and `type` vs `interface`, and what native stripping did on their machine.

## What I'd do differently

If you started this module over, what would you do differently?

(2026-10-12) Ask for the hour budget and the PR decision before the first plan: I assumed both again, as in M03. Write the type tests (`types.check.ts`) before the hints, since they set what the hints need to say.

Still open: Windows and macOS were not run (Git Bash assumed; `mv` and the `GREETING=hi` form need Git Bash); the VS Code "Select TypeScript Version" step was not run; not viewed in a browser; the 3 h plan is an estimate and sections 2 to 4 (about 190 lines of practice files) are the likeliest to overrun, which is why the page allows pasting them; `brief.md`, `tasks.md`, the PRD and arch doc still say 8 h, a PR habit and a "utility-types guide" write-up; the home page still says about 80 hours in total; M02's and M03's Google Docs are stale (pagers changed) and M04 has none; `AGENTS.md` does not mention the solution page pair.
