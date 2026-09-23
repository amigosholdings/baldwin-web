import test from 'node:test';import assert from 'node:assert/strict';import {GROWTH_EVENT_NAMES,normalizeAppleOfferCode,normalizeProviderCode,sanitizeGrowthMetadata} from '../src/growth.js';
test('provider codes validate',()=>{assert.equal(normalizeProviderCode('new-jersey-hair-restoration-center'),'new-jersey-hair-restoration-center');assert.equal(normalizeProviderCode('Bad Code'),null);assert.equal(normalizeProviderCode('a'.repeat(65)),null)});
test('apple offer codes validate',()=>{assert.equal(normalizeAppleOfferCode('njhair50'),'NJHAIR50');assert.equal(normalizeAppleOfferCode('bad-code'),null);assert.equal(normalizeAppleOfferCode('A'.repeat(65)),null)});
test('sensitive metadata is removed',()=>{assert.deepEqual(sanitizeGrowthMetadata({placement:'hero',photo_url:'x',medicalNote:'x',count:2}),{placement:'hero',count:2})});
test('full funnel event names are supported',()=>{for(const e of ['referral_view','download_click','provider_offer_redirect','app_store_redirect','attributed_install','attributed_open','app_signup','baseline_complete','second_session','subscription_started'])assert.equal(GROWTH_EVENT_NAMES.has(e),true)});


test('experiment_exposure is an allowed growth event', async () => {
  assert.equal(GROWTH_EVENT_NAMES.has('experiment_exposure'), true);
});
