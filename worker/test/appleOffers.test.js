import test from 'node:test';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {generateKeyPairSync,verify as verifySignature} from 'node:crypto';
import {appleOfferConfigured,customOfferCodeForProvider,makeAppStoreConnectToken} from '../src/appleOffers.js';
const { privateKey: TEST_PRIVATE_KEY_OBJECT } = crypto.generateKeyPairSync('ec',{namedCurve:'prime256v1'});
const TEST_PRIVATE_KEY = TEST_PRIVATE_KEY_OBJECT.export({type:'pkcs8',format:'pem'});


test('provider custom offer codes are deterministic and Apple-safe',async()=>{
  const a=await customOfferCodeForProvider('new-jersey-hair-restoration-center');
  const b=await customOfferCodeForProvider('new-jersey-hair-restoration-center');
  assert.equal(a,b);assert.match(a,/^[A-Z0-9]{1,64}$/);assert.ok(a.startsWith('BLD'));
});

test('App Store Connect JWT is ES256 and verifiable',async()=>{
  const {privateKey,publicKey}=generateKeyPairSync('ec',{namedCurve:'P-256'});
  const env={ASC_ISSUER_ID:'issuer',ASC_KEY_ID:'KEY123',ASC_PRIVATE_KEY:privateKey.export({type:'pkcs8',format:'pem'}),ASC_PROVIDER_OFFER_ID:'offer-id'};
  assert.equal(appleOfferConfigured(env),true);
  const token=await makeAppStoreConnectToken(env,1700000000),parts=token.split('.');assert.equal(parts.length,3);
  const header=JSON.parse(Buffer.from(parts[0],'base64url').toString());const payload=JSON.parse(Buffer.from(parts[1],'base64url').toString());
  assert.equal(header.alg,'ES256');assert.equal(header.kid,'KEY123');assert.equal(payload.iss,'issuer');assert.equal(payload.aud,'appstoreconnect-v1');assert.equal(payload.exp-payload.iat,600);
  assert.equal(verifySignature('sha256',Buffer.from(`${parts[0]}.${parts[1]}`),{key:publicKey,dsaEncoding:'ieee-p1363'},Buffer.from(parts[2],'base64url')),true);
});

test('Apple create conflict reconciles an existing active custom code under the shared offer', async () => {
  const originalFetch = globalThis.fetch;
  const env = {
    ASC_ISSUER_ID: 'issuer',
    ASC_KEY_ID: 'key',
    ASC_PRIVATE_KEY: TEST_PRIVATE_KEY,
    ASC_PROVIDER_OFFER_ID: 'offer-123'
  };
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), method: init.method || 'GET' });
    if ((init.method || 'GET') === 'POST') {
      assert.equal(String(url), 'https://api.appstoreconnect.apple.com/v1/subscriptionOfferCodeCustomCodes');
      return new Response(JSON.stringify({ errors: [{ detail: 'custom code already exists' }] }), {
        status: 409,
        headers: { 'content-type': 'application/json' }
      });
    }
    assert.match(String(url), /subscriptionOfferCodes\/offer-123\/customCodes/);
    return new Response(JSON.stringify({
      data: [{
        type: 'subscriptionOfferCodeCustomCodes',
        id: 'custom-1',
        attributes: { customCode: 'BLDCLINICABC123', active: true, numberOfCodes: 25000 }
      }],
      links: { next: null }
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  try {
    const { createAppleCustomCode } = await import('../src/appleOffers.js');
    const result = await createAppleCustomCode(env, 'BLDCLINICABC123');
    assert.equal(result.reconciled, true);
    assert.equal(result.body.data.attributes.customCode, 'BLDCLINICABC123');
    assert.deepEqual(calls.map(x => x.method), ['POST', 'GET']);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
