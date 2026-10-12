# M04 — Solution: Port the Async toolkit

**Module M04 · Solution for the section 5 exercise**

The complete answer to the toolkit exercise, and why each type is what it is. Try the exercise first, because you learn most from the errors you work through yourself.

## Before you read

> **Try the exercise first.** This page has the full answer. You learn more from the compiler errors you fix yourself, so go back to [section 5](index.md) and use the hints first. Come here when you are stuck, or when you have finished and want to compare your answer with this one.

The goal was zero errors from `npm run typecheck`, and `All checks passed` from `npm run check`. If yours does both, with no `any`, your answer is right even if it looks different from this one. There are several correct ways to write most of these types.

## 1. The full toolkit.ts

```ts
// The Async toolkit: four small helpers for reliable async code.

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Timed out after ${ms} ms`);
    this.name = "TimeoutError";
  }
}

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(ms)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export interface RetryOptions {
  retries?: number;
  delayMs?: number;
}

export async function retry<T>(
  fn: (attempt: number) => Promise<T>,
  { retries = 3, delayMs = 100 }: RetryOptions = {},
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn(attempt);
    } catch (err: unknown) {
      if (attempt >= retries) throw err;
      await sleep(delayMs);
    }
  }
}

export async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker(): Promise<void> {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index] as T, index);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}
```

`sleep` and `TimeoutError` were given in the exercise. The rest is explained below, one function at a time.

## 2. withTimeout

```ts
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(ms)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
```

- **`<T>`.** Whatever the wrapped promise resolves with, `withTimeout` gives back the same. `withTimeout(fetchUser(), 500)` is a `Promise<User>`. Without `T`, the caller would lose the type.
- **`ReturnType<typeof setTimeout>`.** In Node.js, `setTimeout` returns an object (`Timeout`), and in a browser it returns a number. Asking TypeScript for "whatever `setTimeout` returns" is correct on both, so you never guess.
- **`new Promise<never>`.** The timeout promise never resolves with a value. It can only reject. `never` means "no value ever". That matters for `Promise.race`: the race of a `Promise<T>` and a `Promise<never>` is a `Promise<T>`. With a plain `new Promise(...)`, its type is `Promise<unknown>`, and the race becomes `Promise<unknown>`, which is not a `Promise<T>`.

## 3. retry

```ts
export interface RetryOptions {
  retries?: number;
  delayMs?: number;
}

export async function retry<T>(
  fn: (attempt: number) => Promise<T>,
  { retries = 3, delayMs = 100 }: RetryOptions = {},
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn(attempt);
    } catch (err: unknown) {
      if (attempt >= retries) throw err;
      await sleep(delayMs);
    }
  }
}
```

- **One `T`, in two places.** `fn` returns a `Promise<T>`, and `retry` returns a `Promise<T>`. TypeScript works `T` out from the function you pass: `retry(async () => 42)` is a `Promise<number>`. That is exactly what the first two type tests check.
- **`RetryOptions`.** Both fields are optional (`?`), so a caller can pass `{ retries: 5 }` or nothing. The defaults, `= 3` and `= 100`, are in the destructuring, and the `= {}` after the type lets the whole object be left out.
- **`fn: (attempt: number) => Promise<T>`.** A function type: the shape of a function you receive. Callers whose function ignores `attempt` can still pass `async () => 42`, because a function with fewer parameters fits.
- **`catch (err: unknown)`.** A caught value can be anything, because JavaScript lets you `throw` any value. `unknown` is honest. You do not need to look inside `err` to rethrow it. (Under `strict` this is already the default, so writing it is optional.)

## 4. mapLimit

```ts
export async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker(): Promise<void> {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index] as T, index);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}
```

- **Two generics.** `T` is the type of each item going in, and `R` is the type of each result coming out. They can differ: `mapLimit([1, 2, 3], 2, async (n) => String(n))` has `T = number` and `R = string`, so the result is a `Promise<string[]>`.
- **`readonly T[]`.** The function never changes the list, so it accepts a read-only list too. A normal array also fits, so callers lose nothing.
- **`const results: R[] = new Array(items.length)`.** A list for the answers, typed from `R`, so each `results[index] = ...` is checked.
- **`items[index] as T`.** With `noUncheckedIndexedAccess`, `items[index]` is `T | undefined`, because TypeScript cannot know that `index` is in range. The `while` loop guarantees it is, so `as T` tells the compiler what you know. An assertion like this is a promise that the compiler cannot check, so keep them rare and keep them where, as here, the code right above proves it. A check like `if (item === undefined)` would be wrong here, because `T` itself might include `undefined`.
- **`worker(): Promise<void>`.** An async function that returns nothing is a `Promise<void>`.

## 5. Common wrong answers

These are the answers that compile, or nearly do, and what the compiler said when I tried them. Your line numbers will differ.

| You wrote | What the compiler said |
| --- | --- |
| `Promise<any>` as the return type of `withTimeout` | `types.check.ts(16,28): error TS2344: Type 'false' does not satisfy the constraint 'true'.` The type test notices `any`: the result should be exactly `Promise<boolean>`. |
| `Promise<any>` in the type of `fn` in `retry` | Two `TS2344` errors in `types.check.ts`, for the `number` and `string` results. |
| `items: readonly any[]` in `mapLimit` | `check.ts(49,12): error TS18046: 'n' is of type 'unknown'.` plus `TS2344` and an `Unused '@ts-expect-error' directive` error, because `any` accepts the call that should have been refused. |
| `new Promise(...)` without `<never>` | `toolkit.ts(18,3): error TS2322: Type 'Promise<unknown>' is not assignable to type 'Promise<T>'.` |
| `let timer: number` | `toolkit.ts(16,5): error TS2322: Type 'Timeout' is not assignable to type 'number'.` |
| `fn(items[index], index)` with no `as T` | `toolkit.ts(51,33): error TS2345: Argument of type 'T | undefined' is not assignable to parameter of type 'T'.` |
| `Promise<unknown[]>` as the return type of `mapLimit` | `types.check.ts(23,28): error TS2344: ...` The caller would get `unknown[]` instead of `string[]`. |
| No `= {}` after `RetryOptions` | `types.check.ts(9,12): error TS2554: Expected 2 arguments, but got 1.` The options object stops being optional. |

The pattern: if the compiler can only say "this type is `unknown`", something has no type of its own. If it says `any` is fine and the type test still fails, you made a type too loose.

## 6. Check it

```bash
npm run typecheck
npm run check
```

*You should see:*

```text
> js-training@1.0.0 typecheck
> tsc --noEmit

> js-training@1.0.0 check
> tsx src/toolkit/check.ts

ok  sleep
ok  withTimeout
ok  retry
ok  mapLimit
All checks passed
```

Then commit it as the exercise says, and carry on with [section 6](index.md).

Back to [the exercise](index.md). Next: [6. Running TypeScript on Node.js](index.md).
