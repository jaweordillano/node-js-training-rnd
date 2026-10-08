// Event-loop ordering: setTimeout (task queue) vs promises/await (microtask queue).
//
// PREDICTION (written before running):
//   A, E, G, C, D, F, B
//
// WHY:
//   1. A, E and G are synchronous. They run on the call stack in source order. Calling the async
//      function runs its body synchronously up to the first `await`, so E prints before G.
//   2. While the stack runs, three microtasks are queued in this order: the .then callback (C),
//      the queueMicrotask callback (D), and the continuation after `await` (F).
//   3. When the stack empties, the engine drains the ENTIRE microtask queue, in FIFO order:
//      C, D, F.
//   4. Only then does the event loop pick the next task from the task queue: the setTimeout(0)
//      callback (B). A 0ms timer still waits for the next loop turn, so promises always beat it.

console.log('A sync start');

setTimeout(() => console.log('B setTimeout 0'), 0);

Promise.resolve().then(() => console.log('C promise.then'));

queueMicrotask(() => console.log('D queueMicrotask'));

(async () => {
  console.log('E async fn body, before await (sync)');
  await null;
  console.log('F after await (microtask)');
})();

console.log('G sync end');
