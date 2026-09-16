import test from 'node:test';
import assert from 'node:assert/strict';
import { agentSchemaStatements } from '../src/agentSchema.js';

test('agent schema is split into complete D1 statements', () => {
  const statements = agentSchemaStatements();
  assert.equal(statements.length, 16);
  for (const statement of statements) {
    assert.match(statement, /^CREATE (TABLE|INDEX) IF NOT EXISTS /);
    assert.doesNotMatch(statement, /;\s*$/);
  }
  assert.match(statements[0], /^CREATE TABLE IF NOT EXISTS agent_runs \([\s\S]*\)$/);
  assert.match(statements.at(-1), /^CREATE INDEX IF NOT EXISTS idx_agent_events_action /);
});
