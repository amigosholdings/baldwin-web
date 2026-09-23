import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('homepage positioning experiment has three stable problem-first variants', async () => {
  const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  assert.match(html, /homepage_positioning_v1/);
  assert.match(html, /treatment_working/);
  assert.match(html, /track_without_guessing/);
  assert.match(html, /See whether your hair-loss treatment is working\./);
  assert.match(html, /Track hair progress without guessing\./);
  assert.match(html, /experiment_exposure/);
});

test('growth client persists assignments and attaches experiment metadata to events', async () => {
  const js = await readFile(new URL('../public/assets/growth.js', import.meta.url), 'utf8');
  assert.match(js, /function assignExperiment/);
  assert.match(js, /baldwin_exp_/);
  assert.match(js, /experimentMeta/);
  assert.match(js, /exp_/);
  assert.match(js, /window\.BaldwinGrowth=.*assignExperiment/);
});
