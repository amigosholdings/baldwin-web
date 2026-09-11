import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,verify as verifySignature} from 'node:crypto';
import {appleOfferConfigured,customOfferCodeForProvider,makeAppStoreConnectToken} from '../src/appleOffers.js';

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
