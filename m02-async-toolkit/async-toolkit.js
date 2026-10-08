// Async toolkit — sleep, retry, withTimeout, mapLimit.

export class TimeoutError extends Error {
  constructor(ms, options) {
    super(`Timed out after ${ms}ms`, options);
    this.name = 'TimeoutError';
    this.ms = ms;
  }
}

export class RetryError extends Error {
  constructor(attempts, options) {
    super(`Failed after ${attempts} attempt${attempts === 1 ? '' : 's'}`, options);
    this.name = 'RetryError';
    this.attempts = attempts;
  }
}

// Resolves after `ms`. If `signal` aborts first, the timer is cleared and the promise
// rejects with signal.reason, so nothing is left running.
export function sleep(ms, { signal } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);

    const onAbort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

// Calls fn(attemptIndex) up to `retries + 1` times, sequentially, waiting `delayMs`
// between attempts. If every attempt fails, throws a RetryError whose `cause` is the
// last error.
export async function retry(fn, { retries = 3, delayMs = 0 } = {}) {
  if (!Number.isInteger(retries) || retries < 0) {
    throw new RangeError('retries must be an integer >= 0');
  }

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastError = err;
      if (attempt < retries) await sleep(delayMs);
    }
  }
  throw new RetryError(retries + 1, { cause: lastError });
}

// Races `promise` against a timer. The timer is always cleared so the process can exit.
// Promise.race handles both sides, so the loser can't cause an unhandled rejection.
// Note: this stops *waiting*; it does not cancel the underlying work.
export function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(ms)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// Maps `items` through async `fn(item, index)` with at most `limit` running at once.
// Results keep input order. The first error rejects and stops new work from starting.
export async function mapLimit(items, limit, fn) {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new RangeError('limit must be an integer >= 1');
  }

  const list = Array.from(items);
  const results = new Array(list.length);
  let next = 0;
  let failed = false;

  // Each worker pulls the next index until the list is drained. The await inside the
  // loop is deliberate: it is what keeps each worker to one task at a time.
  async function worker() {
    while (!failed && next < list.length) {
      const i = next++;
      try {
        results[i] = await fn(list[i], i);
      } catch (err) {
        failed = true;
        throw err;
      }
    }
  }

  const workers = Array.from({ length: Math.min(limit, list.length) }, worker);
  await Promise.all(workers);
  return results;
}
