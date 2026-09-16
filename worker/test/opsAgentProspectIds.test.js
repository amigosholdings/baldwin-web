import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const appPath = path.resolve(here, '../../trackmyhairloss-pages/ops-agent/app.js');
const htmlPath = path.resolve(here, '../../trackmyhairloss-pages/ops-agent/index.html');

test('ops-agent exposes canonical outreach IDs after prospect storage', async () => {
  const [app, html] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(htmlPath, 'utf8')
  ]);

  assert.match(app, /LAST_PROSPECT_RESULTS/);
  assert.match(app, /x\.outreach_id/);
  assert.match(app, /canonicalProspectMapping\(\)/);
  assert.match(app, /prospectResultJson/);
  assert.match(app, /prospectRows/);
  assert.match(app, /canonical outreach IDs exposed below/);

  assert.match(html, /Stored prospects \/ canonical IDs/);
  assert.match(html, /id="prospectResultJson"/);
  assert.match(html, /id="prospectRows"/);
  assert.match(html, /outreach_id/);
});
