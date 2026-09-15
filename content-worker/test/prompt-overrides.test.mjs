import test from 'node:test';
import assert from 'node:assert/strict';
import { applyContentPromptOverrides } from '../src/prompt-overrides.js';

test('writer prompt uses evidence without treating it as a cage', () => {
  const messages = [
    {
      role: 'system',
      content: 'You are a rigorous consumer-health editor writing for TrackMyHairLoss.com. Produce original, useful, direct prose. This is medical-adjacent consumer education. Every claim about efficacy, adverse effects, indications, regulatory status, comparative outcomes, or treatment timelines must be supported by one or more supplied evidence IDs in square brackets, e.g. [P1] or [F3]. Never rely on unstated medical knowledge. Never prescribe a treatment to an individual.'
    },
    {
      role: 'user',
      content: 'EVIDENCE PACKET — THIS IS THE ONLY MEDICAL EVIDENCE YOU MAY USE:\n...\nREQUIREMENTS:\n- 1,100-1,800 useful words unless the question is answered better with less.\n- FAQ answers must be concise and directly answer the question.'
    }
  ];

  const out = applyContentPromptOverrides(messages);
  assert.match(out[0].content, /source set, not a cage/);
  assert.match(out[0].content, /stable general medical knowledge/);
  assert.match(out[0].content, /specific study findings, numerical outcomes/);
  assert.doesNotMatch(out[0].content, /Never rely on unstated medical knowledge/);
  assert.match(out[1].content, /PRIMARY EVIDENCE PACKET/);
  assert.match(out[1].content, /stable general domain knowledge/);
  assert.match(out[1].content, /not by a model trying to avoid making any factual statement/);
  assert.match(out[1].content, /1,300-2,200/);
});

test('editor catches high-specificity inventions without policing every sentence', () => {
  const messages = [
    {
      role: 'system',
      content: 'You are the final hostile editor for TrackMyHairLoss.com. Your job is to reject unsupported, repetitive, vague, manipulative or medically overconfident copy. Preserve useful specificity. Audit every medical claim against the evidence packet. A claim without support in the packet must be removed or softened to a non-medical statement. Citation markers must identify evidence that actually supports the immediately preceding claim.'
    },
    {
      role: 'user',
      content: 'EDITORIAL CHECKS:\n1. Check.\n\nReturn a cleaned full version.'
    }
  ];

  const out = applyContentPromptOverrides(messages);
  assert.match(out[0].content, /usefulness-first/);
  assert.match(out[0].content, /Ordinary, stable background knowledge/);
  assert.match(out[0].content, /do not flatten useful context/);
  assert.match(out[1].content, /clearer mental model/);
  assert.match(out[1].content, /competent human explainer/);
});

test('non-content AI prompts pass through unchanged', () => {
  const messages = [{ role: 'user', content: 'Reply with exactly the word OK.' }];
  assert.deepEqual(applyContentPromptOverrides(messages), messages);
});
