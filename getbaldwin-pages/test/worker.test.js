import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

test('non-download requests fall through to the static asset binding', async () => {
  let seen;
  const env = {
    ASSETS: {
      async fetch(request) {
        seen = request.url;
        return new Response('asset', { status: 200 });
      },
    },
  };
  const response = await worker.fetch(
    new Request('https://getbaldwin.app/assets/base.css'),
    env,
    { waitUntil() {} },
  );
  assert.equal(await response.text(), 'asset');
  assert.equal(seen, 'https://getbaldwin.app/assets/base.css');
});

test('/download reuses the existing referral handoff and fails open to App Store', async () => {
  const originalFetch = globalThis.fetch;
  const pending = [];
  globalThis.fetch = async (input, init = {}) => {
    const url = String(input);
    if (url.includes('/v1/providers/')) return new Response('not found', { status: 404 });
    if (url.endsWith('/v1/events') && init.method === 'POST') return new Response('', { status: 202 });
    throw new Error(`unexpected fetch: ${url}`);
  };
  try {
    const env = {
      ASSETS: { async fetch() { throw new Error('asset binding should not handle /download'); } },
      GROWTH_API_URL: 'https://growth.example',
    };
    const response = await worker.fetch(
      new Request('https://getbaldwin.app/download?c=website_hero&utm_source=getbaldwin'),
      env,
      { waitUntil(promise) { pending.push(promise); } },
    );
    assert.equal(response.status, 302);
    assert.match(response.headers.get('location'), /apps\.apple\.com\/us\/app\/baldwin-hair-loss-growth-ai\/id6760326527/);
    assert.equal(response.headers.get('x-frame-options'), 'DENY');
    await Promise.allSettled(pending);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
