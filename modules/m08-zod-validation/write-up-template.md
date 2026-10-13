# M08 Write-Up — Zod Validation & Type Inference (Task API v3)

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own.

## What I built

Task API v3 — the Zod schemas, the typed `validate` middleware, and your env validation.

**Training module page (authored, 2026-10-13).** A student-facing page for M08 as twin files, `index.html` and `index.md`, beside the brief. About 3 hours (180 min): why validate at runtime and install 10, Zod 4 basics 25, parsing and errors 15, refine, transform and pipe 10, the Task schemas and type inference 30, the `validate` middleware and removing the old validation 45, Zod and Prisma plus environment validation 35, check your understanding 10. The lab is built inside the `node-js-training` repo, on top of M07's API. Repo state in is M07's. Out: `zod@4`; `src/schemas/task.ts` (`taskStatus`, create, update, params, list-query and response schemas, with the types derived by `z.infer`/`z.output`); `src/middleware/validate.ts` (`validate` and a typed `valid` reader, parsed values on `res.locals.valid`); `src/config.ts` (fails fast); a `ZodError` branch in `src/middleware/errors.ts` that returns the same `ValidationError`; `routes/tasks.ts`, `services/tasks.ts`, `db.ts` and `server.ts` updated; `src/validation.ts` deleted; practice files in `src/labs/`. The home page row links to M08 and M07's pager links forward. The lab has not been done by a real student yet.

## Why it's built this way (key decisions)

- Why this schema shape for create vs update, specifically — what did `.partial`/`.pick`/`.omit`
  let you avoid repeating?
- How did you work around `req.query` being read-only in Express 5?
- How did you keep your Zod schema and your Prisma type aligned, and what would drift if you
  hadn't?

**Decisions on the training page (2026-10-13)**

- **3 hours, not 6.** Every module so far was trimmed, so I planned 3 h after the user asked to trim. The brief, tasks, PRD and README still say 6 h. I did not edit them (the user said not to).
- **No pull request.** The brief and tasks ask for "v3 merged by pull request". The page uses the add, commit and push loop, as M07 did.
- **No "teach it to the next trainee" write-up.** The page replaces it; the checkpoints and the `grep`/`tsc` proofs cover the brief's "build and capture" items.
- **Create is derived from one `taskFields` object** with `.partial({...})` and `.extend({ status: default })`; update is `.partial()` plus a `refine` for "at least one field". `status` has its default only on create, because `.partial()` on a field with a default would risk filling a PATCH with `todo` (not tested; avoided by design).
- **`z.strictObject` for bodies.** An unknown field such as `id` is a `400`, not silently dropped. This is a change from M07's validation, which ignored unknown fields, and the page says so.
- **Parsed values go on `res.locals.valid`,** read back with a typed `valid<typeof schemas>(res)`. I first tried typing `res.locals` on each handler; the helper was simpler and compiles. The student first sees the real `req.query` getter error.
- **`validate` calls `parse` and lets the `ZodError` travel** to the central handler, as the brief says. The handler maps it to the existing `ValidationError`, so the M05 envelope cannot change. The student first sees a `500`, then adds the branch.
- **Empty `path` becomes `"body"`,** as M05 did, so Bruno's `details[0].path` of `title` still holds. All 15 requests and 35 assertions pass without a change to the collection.
- **`taskParamsSchema` uses `z.uuid()`.** A malformed id is now a `400`. The Bruno `404` request uses a real deleted id, so it still passes.
- **Response schema (`taskViewSchema`) replaces the hand-written `toView`,** so Zod shapes responses and strips `titleKey`/`userId`, as the brief asks. `satisfies Prisma.TaskCreateInput` is on an object written field by field, because `satisfies` does not check keys that arrive through a spread.
- **`src/domain/task.ts` is left as it is.** M04 says to keep it and `src/labs/task-demo.ts` still uses it. The API no longer imports it. This is a deviation from "no hand-written interface left" for that one file.
- **The service migration is split across sections 6 and 7** so the repo compiles at each checkpoint.
- **Cut:** Zod Mini and `z.toJSONSchema` hands-on (one note), custom error maps, async refinements, branded types, tests (M09).
- **Page generated from one source** (in the session scratchpad, not the repo), reading code and output from files that were run.

## How to build it (teach it to the next trainee)

Write a guide to deriving a typed validation middleware from a single schema, using your own
example to show the reasoning, not just the syntax.

## Concepts worth explaining

Pick 1-2 ideas — `z.infer` vs hand-written types, `parse` vs `safeParse`, or why Zod is the request
contract and Prisma is the persistence contract — and explain each in your own words.

## What tripped me up

Anything that didn't behave the way you expected the first time.

- (2026-10-13) The temp disk filled up when I copied the old M07 lab repo (627 MB of `node_modules`). I copied again with hard links for `node_modules` and real copies for everything else.
- My first "You should see" block for the create request was captured after the whole API was finished, so the key order (`tags` before `createdAt`) did not match the code at that point in the page. The rebuild check caught it, and the block now shows the order of that moment.
- Running the page's curls twice gives a `409` on the last one, because the title rule from M07 lives in the database. The page says so.
- The rebuild check itself had two false alarms (a port still held by my own earlier server, and a path in `npm ls`). Both were in my checker, not the page.
- `satisfies` on an object with a spread checks nothing for the spread keys, so I wrote the Prisma input field by field.
- In Zod 4 the `unrecognized_keys` issue has an empty path, so the unknown field shows as `body` in `details`.

## Checkpoint evidence

Show v3 merged by PR, `tsc --noEmit` proving your handler types come from `z.infer`, confirmation
no manual `if (!body.title)` checks remain, invalid input never reaching Prisma, and a 400 response
carrying `details` in the exact envelope shape fixed in M05.

(2026-10-13, page author, Linux/WSL, Node v24.21.0, Zod 4.6.7, Express 5.3.0, TypeScript 7.0.2, Prisma 7.10.0.) The whole lab was rebuilt from a copy of the finished M07 repo using the page's own code blocks, in page order, and each "You should see" block was compared with the real output: 17 of 17 checks match. The finished repo is identical to the hand-built one. `npm run typecheck` is clean; bad input gives a `400` in the M05 envelope with a `details` entry per problem; `npm run bruno` passes with 15 requests and 35 assertions; the `grep` for hand-written checks finds nothing (outside the M04 practice files in `src/labs/`); adding `"blocked"` to the Zod status makes `tsc` fail in `src/services/tasks.ts`; a bad `PORT` or `DATABASE_URL` stops the app with a readable message. Still student evidence to collect: their own run, and the branch/PR the brief asks for.

## What I'd do differently

If you started this module over, what would you do differently?

(2026-10-13) Capture each "You should see" block at the point in the page where it is shown, not at the end. Ask for the hours before planning, as the M07 notes said (I did not, and the user trimmed to 3 h after the plan).

Still open: Windows and macOS were not run (the commands are plain npm, curl and grep, used from Git Bash); not viewed in a browser; the 3 h plan is an estimate, and sections 5 (30 min, a 59-line schema file plus a practice file) and 6 (45 min, three files and a long handler) are the likeliest to overrun; `brief.md`, `tasks.md`, the PRD, arch doc and README still say 6 h and a pull request, and the brief asks for a "teach it" guide the page replaces; the home page still says about 80 hours in total; there is no Google Doc for M08 (none was created); `src/domain/task.ts` still holds hand-written types for the M04 practice file.
