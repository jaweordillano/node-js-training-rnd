// Fetch the same JSONPlaceholder posts sequentially, then in parallel, and compare timings.
const BASE = 'https://jsonplaceholder.typicode.com/posts';
const COUNT = 20;
const ids = Array.from({ length: COUNT }, (_, i) => i + 1);

async function fetchPost(id) {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error(`GET ${id} failed: ${res.status}`);
  return res.json();
}

async function sequential() {
  const posts = [];
  for (const id of ids) {
    posts.push(await fetchPost(id)); // one request at a time, on purpose
  }
  return posts;
}

async function parallel() {
  return Promise.all(ids.map(fetchPost)); // all requests in flight together
}

async function time(label, fn) {
  const start = performance.now();
  const posts = await fn();
  const ms = performance.now() - start;
  console.log(`${label.padEnd(10)} ${ms.toFixed(0).padStart(6)} ms  (${posts.length} posts)`);
  return ms;
}

await fetchPost(1); // warm-up so DNS/TLS setup isn't charged to the first run

const seqMs = await time('sequential', sequential);
const parMs = await time('parallel', parallel);
console.log(`parallel was ${(seqMs / parMs).toFixed(1)}x faster`);
