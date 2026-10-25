import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

function auditFixture() {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE events (
      id TEXT PRIMARY KEY,
      event_name TEXT NOT NULL,
      user_id TEXT,
      source TEXT,
      created_at TEXT NOT NULL
    );
    INSERT INTO events VALUES
      ('signup-tmhl', 'app_signup', 'tmhl-user', 'trackmyhairloss', datetime('now','-10 days')),
      ('signup-tmhl-repeat', 'app_signup', 'tmhl-user', 'other', datetime('now','-9 days')),
      ('baseline-tmhl', 'baseline_complete', 'tmhl-user', 'trackmyhairloss', datetime('now','-9 days')),
      ('subscription-tmhl', 'subscription_started', 'tmhl-user', 'trackmyhairloss', datetime('now','-8 days')),
      ('signup-site', 'app_signup', 'site-user', 'getbaldwin', datetime('now','-10 days')),
      ('baseline-site', 'baseline_complete', 'site-user', 'getbaldwin', datetime('now','-9 days')),
      ('signup-prior', 'app_signup', 'prior-user', NULL, datetime('now','-17 days')),
      ('baseline-prior-too-late', 'baseline_complete', 'prior-user', NULL, datetime('now','-8 days')),
      ('orphan-subscription', 'subscription_started', NULL, NULL, datetime('now','-1 day'));
  `);
  const sql = readFileSync(new URL('../growth-conversion-audit.sql', import.meta.url), 'utf8');
  const parts = sql.split('-- AUDIT_SECTION: recent_event_coverage');
  assert.equal(parts.length, 2, 'expected two read-only audit queries');
  return { db, cohortSql: parts[0], coverageSql: parts[1] };
}

test('mature signup cohorts count unique users and outcomes within seven days', () => {
  const { db, cohortSql } = auditFixture();
  const rows = db.prepare(cohortSql).all();
  const latest = rows.find(row => row.cohort === 'latest_matured_7d' && row.source_group === 'ALL_SOURCES');
  const previous = rows.find(row => row.cohort === 'previous_matured_7d' && row.source_group === 'ALL_SOURCES');
  assert.deepEqual(
    [latest.signups, latest.baseline_completes_7d, latest.subscription_starts_7d, latest.baseline_rate_pct, latest.subscription_rate_pct],
    [2, 2, 1, 100, 50],
  );
  assert.deepEqual(
    [previous.signups, previous.baseline_completes_7d, previous.subscription_starts_7d],
    [1, 0, 0],
  );
  const tmhl = rows.find(row => row.cohort === 'latest_matured_7d' && row.source_group === 'trackmyhairloss');
  assert.deepEqual([tmhl.signups, tmhl.baseline_completes_7d, tmhl.subscription_starts_7d], [1, 1, 1]);
  assert.ok(rows.every(row => !Object.hasOwn(row, 'user_id')), 'audit must never expose user IDs');
  db.close();
});

test('coverage flags conversion events without a linked user, without returning identities', () => {
  const { db, coverageSql } = auditFixture();
  const rows = db.prepare(coverageSql).all();
  assert.deepEqual(rows, [{
    event_name: 'subscription_started',
    event_rows_7d: 1,
    rows_with_user_id: 0,
    rows_with_source: 0,
    rows_missing_user_id: 1,
  }]);
  db.close();
});
