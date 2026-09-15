import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('generated content analytics selector is safe inside the HTML template literal', async () => {
  const source = await readFile(new URL('../src/index.js', import.meta.url), 'utf8');

  assert.ok(
    source.includes("document.querySelectorAll('a[href*="),
    'expected the generated analytics selector to use a single-quoted JavaScript string'
  );
  assert.ok(
    !source.includes('document.querySelectorAll("a[href*='),
    'the old double-quoted selector would lose quote escaping when emitted into HTML'
  );
});
