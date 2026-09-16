import test from 'node:test';
import assert from 'node:assert/strict';
import { domainFromWebsite } from '../src/agentIndex.js';

test('domainFromWebsite normalizes common provider URLs', () => {
  assert.equal(domainFromWebsite('https://www.ExampleClinic.com/team'), 'exampleclinic.com');
  assert.equal(domainFromWebsite('exampleclinic.com/providers'), 'exampleclinic.com');
  assert.equal(domainFromWebsite('http://sub.exampleclinic.com:8080/path'), 'sub.exampleclinic.com');
  assert.equal(domainFromWebsite(''), '');
});
