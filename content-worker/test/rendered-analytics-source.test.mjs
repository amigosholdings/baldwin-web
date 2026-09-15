import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('generated content analytics selector is safe inside the HTML template literal', async () => {
  const source = await readFile(new URL('../src/index.js', import.meta.url), 'utf8');
  const safeSelector = String.raw`document.querySelectorAll('a[href*=\"getbaldwin.app\"]')`;
  const brokenSelector = String.raw`document.querySelectorAll("a[href*=\"getbaldwin.app\"]")`;

  assert.ok(source.includes(safeSelector), 'expected the single-quoted selector used by the generated page shell');
  assert.ok(!source.includes(brokenSelector), 'the old double-quoted selector would lose escaping when emitted into HTML');
});
