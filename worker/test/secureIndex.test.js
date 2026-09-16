import test from 'node:test';
import assert from 'node:assert/strict';
import { issueCapability, validateCapability } from '../src/secureIndex2.js';

const SECRET = 'test-admin-secret-that-is-not-used-in-production';
const NOW = 1_800_000_000;

test('issued GTM capability validates and is scoped by signature', async () => {
  const issued = await issueCapability(SECRET, 24, NOW);
  assert.match(issued.token, /^agt1\./);
  assert.equal(await validateCapability(SECRET, issued.token, NOW + 10), true);
  assert.equal(await validateCapability('different-secret', issued.token, NOW + 10), false);
});

test('tampered GTM capability is rejected', async () => {
  const issued = await issueCapability(SECRET, 24, NOW);
  const parts = issued.token.split('.');
  parts[2] = '0'.repeat(32);
  assert.equal(await validateCapability(SECRET, parts.join('.'), NOW + 10), false);
});

test('expired GTM capability is rejected', async () => {
  const issued = await issueCapability(SECRET, 1, NOW);
  assert.equal(await validateCapability(SECRET, issued.token, NOW + 3599), true);
  assert.equal(await validateCapability(SECRET, issued.token, NOW + 3601), false);
});

test('capability lifetime is capped at 90 days', async () => {
  const issued = await issueCapability(SECRET, 99999, NOW);
  assert.equal(issued.ttl_hours, 2160);
  assert.equal(await validateCapability(SECRET, issued.token, NOW + 2160 * 3600 - 1), true);
});
