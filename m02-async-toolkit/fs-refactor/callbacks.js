// Callback-style node:fs (the "before"): read input.txt, uppercase it, write out/callbacks.txt.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.join(dir, 'input.txt');
const outDir = path.join(dir, 'out');
const outputPath = path.join(outDir, 'callbacks.txt');

fs.readFile(inputPath, 'utf8', (readErr, text) => {
  if (readErr) return fail(readErr);

  const upper = text.toUpperCase();
  fs.mkdir(outDir, { recursive: true }, (mkdirErr) => {
    if (mkdirErr) return fail(mkdirErr);

    fs.writeFile(outputPath, upper, (writeErr) => {
      if (writeErr) return fail(writeErr);

      fs.readFile(outputPath, 'utf8', (verifyErr, written) => {
        if (verifyErr) return fail(verifyErr);
        console.log(written.trimEnd());
        console.log(`wrote ${Buffer.byteLength(written)} bytes`);
      });
    });
  });
});

function fail(err) {
  console.error(err);
  process.exitCode = 1;
}
