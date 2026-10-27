import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
const sql = readFileSync(new URL('../growth-handoff-coverage.sql', import.meta.url), 'utf8');
function fixture() {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE events (id TEXT PRIMARY KEY, event_name TEXT NOT NULL,
      user_id TEXT, anonymous_id TEXT, installation_id TEXT, source TEXT,
      campaign TEXT, provider_code TEXT, created_at TEXT NOT NULL);
    CREATE TABLE attribution_subjects (subject_key TEXT PRIMARY KEY,
      source TEXT, campaign TEXT, provider_code TEXT);
    INSERT INTO attribution_subjects VALUES
      ('anon:anon-a','trackmyhairloss','photo_guide',NULL),
      ('install:install-a',NULL,NULL,NULL),
      ('anon:anon-b','trackmyhairloss','photo_guide',NULL),
      ('install:install-b',NULL,NULL,NULL),
      ('install:install-c',NULL,NULL,NULL),
      ('install:install-d','apple_search','search',NULL);
    INSERT INTO events VALUES
      ('a','app_signup','user-a','anon-a','install-a',NULL,NULL,NULL,datetime('now','-1 day')),
      ('b','app_signup','user-b','anon-b','install-b','trackmyhairloss','photo_guide',NULL,datetime('now','-2 days')),
      ('c','app_signup','user-c',NULL,'install-c',NULL,NULL,NULL,datetime('now','-3 days')),
      ('d','app_signup','user-d',NULL,'install-d','apple_search',NULL,NULL,datetime('now','-4 days')),
      ('b2','app_signup','user-b','anon-b','install-b',NULL,NULL,NULL,datetime('now','-1 day')),
      ('old','app_signup','user-old',NULL,NULL,NULL,NULL,NULL,datetime('now','-10 days')),
      ('old2','app_signup','user-old',NULL,NULL,NULL,NULL,NULL,datetime('now','-1 day'));
  `);
  return db;
}
test('aggregate handoff flags blank install shadow without exposing identifiers', () => {
  const db=fixture();
  const row=db.prepare(sql).get();
  assert.deepEqual({...row},{signups_7d:4,with_anonymous_id:2,with_installation_id:4,
    attributed_signups:2,with_known_anonymous_first_touch:2,with_known_install_first_touch:1,
    unattributed_despite_known_first_touch:1,blank_install_shadow_candidates:1});
  assert.ok(Object.values(row).every(value => typeof value === 'number'), 'only aggregate counts may be returned');
  db.close();
});
test('empty cohort returns zeros rather than nulls', () => {
  const db=fixture(); db.exec('DELETE FROM events;');
  const row=db.prepare(sql).get();
  assert.ok(Object.values(row).every(v=>v===0));
  db.close();
});
