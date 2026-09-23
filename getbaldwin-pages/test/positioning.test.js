import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('homepage uses one problem-first message during demand discovery', async () => {
  const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  assert.match(html, /See whether your hair-loss treatment is working\./);
  assert.match(html, /comparable evidence instead of memory/);
  assert.doesNotMatch(html, /homepage_positioning_v1/);
  assert.doesNotMatch(html, /assignExperiment\(/);
  assert.match(html, /landing_view/);
  assert.match(html, /demand_discovery/);
});
