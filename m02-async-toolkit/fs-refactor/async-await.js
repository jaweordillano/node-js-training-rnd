// Same behavior as callbacks.js using node:fs/promises + async/await (the "after").
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.join(dir, 'input.txt');
const outDir = path.join(dir, 'out');
const outputPath = path.join(outDir, 'async-await.txt');

try {
  const text = await fs.readFile(inputPath, 'utf8');
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(outputPath, text.toUpperCase());

  const written = await fs.readFile(outputPath, 'utf8');
  console.log(written.trimEnd());
  console.log(`wrote ${Buffer.byteLength(written)} bytes`);
} catch (err) {
  console.error(err);
  process.exitCode = 1;
}
