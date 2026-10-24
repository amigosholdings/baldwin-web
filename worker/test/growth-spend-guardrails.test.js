import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { growthOsContext, handleGrowthOs } from '../src/growthOs.js';

const BUDGET_ID = 'consumer-acquisition-2026-09-22';

function makeEnv() {
  // SQLite executes the same single-statement cap guard used by Cloudflare D1.
  // No network access, external charge, or production database is involved.
  const raw = new DatabaseSync(':memory:');
  raw.exec(readFileSync(new URL('../migration-v6.sql', import.meta.url), 'utf8'));
  const DB = {
    prepare(sql) {
      return {
        bind(...args) {
          const statement = raw.prepare(sql);
          return {
            async first() { return statement.get(...args) ?? null; },
            async all() { return { results: statement.all(...args) }; },
            async run() {
              const result = statement.run(...args);
              return { meta: { changes: Number(result.changes) } };
            },
          };
        },
      };
    },
  };
  return { DB, raw };
}

function experiment(env, id, cap, budgetId = BUDGET_ID) {
  env.raw.prepare(`INSERT INTO growth_experiments
    (id,name,channel,hypothesis,status,budget_authorization_id,spend_cap_cents)
    VALUES(?,?,?,?,'running',?,?)`)
    .run(id, id, 'apple_ads', 'Synthetic guardrail test', budgetId, cap);
}

function totalSpent(env) {
  return env.raw.prepare('SELECT COALESCE(SUM(amount_cents),0) AS n FROM growth_spend_ledger').get().n;
}

function spend(env, experimentId, amount) {
  const request = new Request('https://example.test/v1/admin/agent/growth/spend', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ experiment_id: experimentId, amount_cents: amount, channel: 'test', vendor: 'synthetic' }),
  });
  return handleGrowthOs(request, env, '/v1/admin/agent/growth/spend');
}

test('rejects missing experiment IDs and invalid amounts without writing ledger rows', async () => {
  const env = makeEnv();
  experiment(env, 'alpha', 20000);
  await assert.rejects(spend(env, null, 100), /experiment_id_required/);
  await assert.rejects(spend(env, 'alpha', 0), /positive_amount_cents_required/);
  await assert.rejects(spend(env, 'alpha', -1), /positive_amount_cents_required/);
  assert.equal(totalSpent(env), 0);
});

test('checks experiment and aggregate caps inside the ledger INSERT', async () => {
  const env = makeEnv();
  experiment(env, 'alpha', 12000);
  experiment(env, 'beta', 12000);
  assert.equal((await spend(env, 'alpha', 12000)).remaining_cents, 8000);
  await assert.rejects(spend(env, 'alpha', 1), /spend_rejected_by_budget_guardrails/);
  assert.equal((await spend(env, 'beta', 8000)).remaining_cents, 0);
  await assert.rejects(spend(env, 'beta', 1), /spend_rejected_by_budget_guardrails/);
  assert.equal(totalSpent(env), 20000);
});

test('never switches to a newer active authorization or accepts foreign experiments', async () => {
  const env = makeEnv();
  env.raw.prepare(`INSERT INTO growth_budget_authorizations
    (id,label,authorized_cents,status,created_at)
    VALUES('other-budget','Unapproved extra funds',100000,'active','2099-01-01')`).run();
  experiment(env, 'foreign', 100000, 'other-budget');
  const context = await growthOsContext(env);
  assert.equal(context.budget.id, BUDGET_ID);
  assert.equal(context.budget.authorized_cents, 20000);
  await assert.rejects(spend(env, 'foreign', 1), /spend_rejected_by_budget_guardrails/);
  assert.equal(totalSpent(env), 0);
});

test('fails closed if canonical authorization is increased above $200', async () => {
  const env = makeEnv();
  experiment(env, 'alpha', 30000);
  env.raw.prepare('UPDATE growth_budget_authorizations SET authorized_cents=30000 WHERE id=?').run(BUDGET_ID);
  assert.equal((await growthOsContext(env)).budget, null);
  await assert.rejects(spend(env, 'alpha', 1), /spend_rejected_by_budget_guardrails/);
  assert.equal(totalSpent(env), 0);
});

test('two competing ledger writes cannot jointly exceed the $200 aggregate cap', async () => {
  const env = makeEnv();
  experiment(env, 'alpha', 15000);
  experiment(env, 'beta', 15000);
  const results = await Promise.allSettled([spend(env, 'alpha', 15000), spend(env, 'beta', 15000)]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(results.filter(result => result.status === 'rejected').length, 1);
  assert.equal(totalSpent(env), 15000);
});
