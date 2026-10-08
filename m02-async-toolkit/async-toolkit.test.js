import assert from 'node:assert/strict';
import {
  sleep,
  retry,
  withTimeout,
  mapLimit,
  TimeoutError,
  RetryError,
} from './async-toolkit.js';

const checks = [];
const check = (name, fn) => checks.push({ name, fn });

// Number of timers currently keeping the process alive.
const activeTimers = () => process.getActiveResourcesInfo().filter((r) => r === 'Timeout').length;

// ---- sleep ----------------------------------------------------------------

check('sleep waits at least ms', async () => {
  const start = performance.now();
  await sleep(50);
  assert.ok(performance.now() - start >= 45, 'resolved too early');
});

check('sleep rejects early when aborted', async () => {
  const controller = new AbortController();
  const start = performance.now();
  setTimeout(() => controller.abort(new Error('stop')), 10);
  await assert.rejects(sleep(1000, { signal: controller.signal }), { message: 'stop' });
  assert.ok(performance.now() - start < 500, 'did not abort early');
});

check('sleep rejects immediately with an already-aborted signal', async () => {
  const signal = AbortSignal.abort(new Error('already'));
  await assert.rejects(sleep(1000, { signal }), { message: 'already' });
});

check('sleep clears its timer when aborted', async () => {
  const before = activeTimers();
  const controller = new AbortController();
  const pending = sleep(5000, { signal: controller.signal });
  controller.abort(new Error('stop'));
  await assert.rejects(pending, { message: 'stop' });
  assert.ok(activeTimers() <= before, 'sleep left a timer running');
});

// ---- retry ----------------------------------------------------------------

check('retry succeeds on attempt N and stops calling fn', async () => {
  let calls = 0;
  const result = await retry(
    async () => {
      calls++;
      if (calls < 3) throw new Error('flaky');
      return 'ok';
    },
    { retries: 5, delayMs: 1 },
  );
  assert.equal(result, 'ok');
  assert.equal(calls, 3);
});

check('retry exhausts retries, throws RetryError with last cause', async () => {
  let calls = 0;
  await assert.rejects(
    retry(
      async () => {
        calls++;
        throw new Error(`fail ${calls}`);
      },
      { retries: 2, delayMs: 1 },
    ),
    (err) => {
      assert.ok(err instanceof RetryError);
      assert.equal(err.attempts, 3);
      assert.equal(err.cause.message, 'fail 3');
      return true;
    },
  );
  assert.equal(calls, 3);
});

check('retry waits delayMs between attempts', async () => {
  const start = performance.now();
  await assert.rejects(
    retry(async () => { throw new Error('x'); }, { retries: 2, delayMs: 30 }),
  );
  assert.ok(performance.now() - start >= 55, 'delays were skipped');
});

check('retry rejects invalid retries', async () => {
  await assert.rejects(retry(async () => {}, { retries: -1 }), RangeError);
});

// ---- withTimeout ----------------------------------------------------------

check('withTimeout resolves when the promise is fast enough', async () => {
  const value = await withTimeout(sleep(10).then(() => 'done'), 200);
  assert.equal(value, 'done');
});

check('withTimeout rejects with TimeoutError when too slow', async () => {
  await assert.rejects(withTimeout(sleep(200), 20), (err) => {
    assert.ok(err instanceof TimeoutError);
    assert.equal(err.ms, 20);
    return true;
  });
});

check('withTimeout passes through the original rejection', async () => {
  await assert.rejects(withTimeout(Promise.reject(new Error('boom')), 200), { message: 'boom' });
});

check('withTimeout clears its timer when the promise wins', async () => {
  const before = activeTimers();
  await withTimeout(Promise.resolve('fast'), 5000);
  assert.ok(activeTimers() <= before, 'withTimeout left a timer running');
});

// ---- mapLimit -------------------------------------------------------------

check('mapLimit preserves input order', async () => {
  const out = await mapLimit([30, 5, 20, 1], 2, async (ms, i) => {
    await sleep(ms);
    return `${i}:${ms}`;
  });
  assert.deepEqual(out, ['0:30', '1:5', '2:20', '3:1']);
});

check('mapLimit never exceeds the concurrency limit', async () => {
  let running = 0;
  let peak = 0;
  await mapLimit(Array.from({ length: 10 }, (_, i) => i), 3, async () => {
    running++;
    peak = Math.max(peak, running);
    await sleep(10);
    running--;
  });
  assert.equal(peak, 3);
});

check('mapLimit rejects on the first error and stops starting work', async () => {
  const started = [];
  await assert.rejects(
    mapLimit([1, 2, 3, 4, 5, 6], 2, async (n) => {
      started.push(n);
      await sleep(5);
      if (n === 2) throw new Error('bad 2');
      return n;
    }),
    { message: 'bad 2' },
  );
  assert.ok(started.length < 6, 'kept starting work after a failure');
});

check('mapLimit handles empty input and limit > items', async () => {
  assert.deepEqual(await mapLimit([], 3, async (x) => x), []);
  assert.deepEqual(await mapLimit([1, 2], 10, async (x) => x * 2), [2, 4]);
});

check('mapLimit rejects an invalid limit', async () => {
  await assert.rejects(mapLimit([1], 0, async (x) => x), RangeError);
});

// ---- runner ---------------------------------------------------------------

let failures = 0;
for (const { name, fn } of checks) {
  try {
    await fn();
    console.log(`  ok   ${name}`);
  } catch (err) {
    failures++;
    console.log(`  FAIL ${name}\n       ${err.message}`);
  }
}

if (failures > 0) {
  console.log(`\n${failures} of ${checks.length} self-checks failed`);
  process.exitCode = 1;
} else {
  console.log(`\nall ${checks.length} self-checks passed`);
}
