import test from 'node:test';
import assert from 'node:assert/strict';
import { recordGrowthEvent } from '../src/growth.js';

function makeEnv() {
  const subjects = new Map();
  const events = [];
  const DB = {
    prepare(sql) {
      return {
        bind(...args) {
          return {
            async first() {
              if (sql.startsWith('SELECT * FROM attribution_subjects')) {
                return subjects.get(args[0]) ?? null;
              }
              throw new Error(`Unexpected query: ${sql}`);
            },
            async run() {
              if (sql.includes('INTO attribution_subjects(')) {
                const [subject_key, user_id, installation_id, anonymous_id,
                  provider_code, source, campaign, first_event, created_at] = args;
                if (!subjects.has(subject_key)) {
                  subjects.set(subject_key, { subject_key, user_id, installation_id,
                    anonymous_id, provider_code, source, campaign, first_event, created_at });
                  return { meta: { changes: 1 } };
                }
                return { meta: { changes: 0 } };
              }
              if (sql.includes('INTO events(')) {
                const [id, event_name, provider_code, anonymous_id, user_id,
                  source, campaign] = args;
                events.push({ id, event_name, provider_code, anonymous_id,
                  user_id, source, campaign });
                return { meta: { changes: 1 } };
              }
              throw new Error(`Unexpected mutation: ${sql}`);
            },
          };
        },
      };
    },
  };
  return { DB, subjects, events };
}

test('organic first touch persists and reaches downstream events when identifiers are shared', async () => {
  const env = makeEnv();
  const anonymousId = 'organic-visit-1';
  const userId = 'test-user-1';
  const firstTouch = { source: 'trackmyhairloss', campaign: 'photo_consistency' };

  assert.equal((await recordGrowthEvent(env, {
    event: 'download_click', anonymousId, ...firstTouch,
  })).status, 201);
  assert.equal(env.subjects.get(`anon:${anonymousId}`)?.source, firstTouch.source);
  assert.equal(env.subjects.get(`anon:${anonymousId}`)?.campaign, firstTouch.campaign);

  await recordGrowthEvent(env, {
    event: 'app_store_redirect', anonymousId,
    source: 'another_site', campaign: 'later_campaign',
  });
  assert.equal(env.subjects.get(`anon:${anonymousId}`)?.campaign, firstTouch.campaign);

  await recordGrowthEvent(env, { event: 'app_signup', userId, anonymousId });
  await recordGrowthEvent(env, { event: 'baseline_complete', userId });
  await recordGrowthEvent(env, { event: 'subscription_started', userId });

  assert.equal(env.subjects.get(`user:${userId}`)?.source, firstTouch.source);
  for (const event of env.events.filter(e =>
    ['app_signup', 'baseline_complete', 'subscription_started'].includes(e.event_name))) {
    assert.equal(event.source, firstTouch.source);
    assert.equal(event.campaign, firstTouch.campaign);
  }
});

test('unattributed anonymous handoff is not persisted', async () => {
  const env = makeEnv();
  await recordGrowthEvent(env, { event: 'download_click', anonymousId: 'unattributed-visit' });
  assert.equal(env.subjects.has('anon:unattributed-visit'), false);
});
