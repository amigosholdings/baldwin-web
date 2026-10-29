import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8');
const scriptMatch = source.match(/<script>\(function\(\)\{const A="https:\/\/baldwin-growth-api[\s\S]*?<\/script>/);
assert.ok(scriptMatch, 'article acquisition script must be present');
const articleScript = scriptMatch[0].slice('<script>'.length, -'</script>'.length);

function anchor(href) {
  const listeners = new Map();
  return {
    href,
    addEventListener(type, fn) { listeners.set(type, fn); },
    click() { listeners.get('click')?.(); },
  };
}

test('article App Store handoff forwards existing anonymous ID and preserves campaign', () => {
  const download = anchor('https://getbaldwin.app/download?c=tmhl_content');
  const home = anchor('https://getbaldwin.app/');
  const links = [download, home];
  const events = [];
  const storage = new Map([['baldwin_anon_id', 'synthetic-visitor-123']]);
  runInNewContext(articleScript, {
    URL,
    crypto: { randomUUID: () => 'unused-generated-id' },
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
    location: { pathname: '/blog/synthetic-article' },
    document: { querySelectorAll: () => links },
    fetch: (_url, options) => {
      events.push(JSON.parse(options.body));
      return Promise.resolve({ ok: true });
    },
  });
  const target = new URL(download.href);
  assert.equal(target.origin, 'https://getbaldwin.app');
  assert.equal(target.pathname, '/download');
  assert.equal(target.searchParams.get('c'), 'tmhl_content');
  assert.equal(target.searchParams.get('aid'), 'synthetic-visitor-123');
  assert.equal(home.href, 'https://getbaldwin.app/', 'non-download links stay unchanged');
  download.click();
  assert.equal(events[0].event, 'blog_view');
  assert.equal(events[1].event, 'blog_cta_click');
  assert.equal(events[1].anonymousId, 'synthetic-visitor-123');
  assert.equal(events[1].metadata.page, '/blog/synthetic-article');
  assert.equal(events[1].metadata.href, download.href);
  assert.ok(events.every(e => !Object.hasOwn(e, 'userId')), 'no personal health data is collected');
});

test('article download link creates an anonymous ID when one does not exist', () => {
  const download = anchor('https://getbaldwin.app/download?c=tmhl_content');
  const storage = new Map();
  runInNewContext(articleScript, {
    URL,
    crypto: { randomUUID: () => 'synthetic-new-visitor' },
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
    location: { pathname: '/treatments/example' },
    document: { querySelectorAll: () => [download] },
    fetch: () => Promise.resolve({ ok: true }),
  });
  assert.equal(storage.get('baldwin_anon_id'), 'synthetic-new-visitor');
  assert.equal(new URL(download.href).searchParams.get('aid'), 'synthetic-new-visitor');
});
