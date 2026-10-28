import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const sql = readFileSync(new URL('../growth-budget-reconciliation.sql', import.meta.url), 'utf8');
const AUTH = 'consumer-acquisition-2026-09-22';

function fixture() {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE growth_budget_authorizations (
      id TEXT PRIMARY KEY, authorized_cents INTEGER, status TEXT, currency TEXT);
    CREATE TABLE growth_experiments (
      id TEXT PRIMARY KEY, budget_authorization_id TEXT, spend_cap_cents INTEGER);
    CREATE TABLE growth_spend_ledger (
      id TEXT PRIMARY KEY, budget_authorization_id TEXT,
      experiment_id TEXT, amount_cents INTEGER);
  `);
  return db;
}

function seed(db) {
  db.prepare('INSERT INTO growth_budget_authorizations VALUES (?,?,?,?)')
    .run(AUTH, 20000, 'active', 'USD');
  db.prepare('INSERT INTO growth_experiments VALUES (?,?,?)')
    .run('apple', AUTH, 15000);
}

test('missing authorization fails closed and exposes no row-level data', () => {
  const db = fixture();
  const row = db.prepare(sql).get();
  assert.equal(row.original_authorization_rows, 0);
  assert.equal(row.theoretical_unspent_cents, 0);
  assert.equal(row.ledger_policy_consistent, 0);
  assert.ok(!Object.keys(row).some(k => /user_id|external_reference|vendor/.test(k)));
  db.close();
});

test('valid $200 policy reports only aggregate spend and theoretical headroom', () => {
  const db = fixture();
  seed(db);
  db.prepare('INSERT INTO growth_spend_ledger VALUES (?,?,?,?)')
    .run('charge-1', AUTH, 'apple', 2500);
  const row = db.prepare(sql).get();
  assert.equal(row.hard_cap_cents, 20000);
  assert.equal(row.spent_all_cents, 2500);
  assert.equal(row.theoretical_unspent_cents, 17500);
  assert.equal(row.ledger_policy_consistent, 1);
  db.close();
});

test('overspend, unlinked charges and alternate authorizations fail closed', () => {
  const db = fixture();
  seed(db);
  db.prepare('INSERT INTO growth_budget_authorizations VALUES (?,?,?,?)')
    .run('unauthorized', 10000, 'active', 'USD');
  db.prepare('INSERT INTO growth_spend_ledger VALUES (?,?,?,?)')
    .run('charge-1', AUTH, 'apple', 16000);
  db.prepare('INSERT INTO growth_spend_ledger VALUES (?,?,?,?)')
    .run('charge-2', 'unauthorized', null, 5000);
  const row = db.prepare(sql).get();
  assert.equal(row.spent_all_cents, 21000);
  assert.equal(row.spent_other_cents, 5000);
  assert.equal(row.theoretical_unspent_cents, 0);
  assert.equal(row.missing_experiment_rows, 1);
  assert.equal(row.other_authorization_rows, 1);
  assert.equal(row.experiments_over_cap, 1);
  assert.equal(row.ledger_policy_consistent, 0);
  db.close();
});

test('a modified authorization or unknown experiment fails closed', () => {
  const db = fixture();
  seed(db);
  db.prepare('UPDATE growth_budget_authorizations SET authorized_cents=30000 WHERE id=?').run(AUTH);
  db.prepare('INSERT INTO growth_spend_ledger VALUES (?,?,?,?)')
    .run('charge-1', AUTH, 'missing-experiment', 100);
  const row = db.prepare(sql).get();
  assert.equal(row.stored_authorization_cents, 30000);
  assert.equal(row.theoretical_unspent_cents, 0);
  assert.equal(row.unknown_experiment_rows, 1);
  assert.equal(row.ledger_policy_consistent, 0);
  db.close();
});
