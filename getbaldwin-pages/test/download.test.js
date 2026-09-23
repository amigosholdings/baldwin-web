import test from 'node:test';
import assert from 'node:assert/strict';
import {appStoreUrl,appleCampaignToken,appleProviderToken,campaignFor,offerCode,providerCode,redemptionUrl} from '../functions/download.js';

test('download bridge validates provider and offer',()=>{
  assert.equal(providerCode('new-jersey-hair-restoration-center'),'new-jersey-hair-restoration-center');
  assert.equal(providerCode('BAD CODE'),null);
  assert.equal(providerCode('a'.repeat(65)),null);
  assert.equal(offerCode('njhair50'),'NJHAIR50');
  assert.equal(offerCode('NJ-HAIR'),null);
  assert.equal(offerCode('A'.repeat(65)),null);
});

test('Apple campaign inputs are bounded and conservative',()=>{
  assert.equal(appleProviderToken('123456'),'123456');
  assert.equal(appleProviderToken('abc'),null);
  assert.equal(appleCampaignToken('provider_referral'),'provider_referral');
  assert.equal(appleCampaignToken('x'.repeat(31)),null);
});


test('acquisition sources map to configured App Store campaign tokens',()=>{
  const env={
    APP_STORE_WEBSITE_CAMPAIGN_TOKEN:'website',
    APP_STORE_REDDIT_CAMPAIGN_TOKEN:'reddit',
    APP_STORE_CREATOR_CAMPAIGN_TOKEN:'creators',
    APP_STORE_SEO_CAMPAIGN_TOKEN:'seo',
    APP_STORE_PROVIDER_CAMPAIGN_TOKEN:'provider_referral'
  };
  assert.equal(campaignFor(env,false,'reddit'),'reddit');
  assert.equal(campaignFor(env,false,'reddit_organic'),'reddit');
  assert.equal(campaignFor(env,false,'youtube'),'creators');
  assert.equal(campaignFor(env,false,'instagram'),'creators');
  assert.equal(campaignFor(env,false,'seo'),'seo');
  assert.equal(campaignFor(env,false,'trackmyhairloss'),'seo');
  assert.equal(campaignFor(env,false,'unknown'),'website');
  assert.equal(campaignFor(env,true,'reddit'),'provider_referral');
});

test('provider redemption URL is prefilled and carries configured App Store campaign tags',()=>{
  const url=redemptionUrl('NJHAIR50',{APP_STORE_PROVIDER_TOKEN:'123456'},'provider_referral');
  assert.equal(url,'https://apps.apple.com/redeem?ctx=offercodes&id=6760326527&code=NJHAIR50&pt=123456&ct=provider_referral&mt=8');
});

test('ordinary App Store URL uses the configured Apple campaign',()=>{
  const url=appStoreUrl({APP_STORE_PROVIDER_TOKEN:'123456'},'website');
  assert.equal(url,'https://apps.apple.com/us/app/baldwin-hair-loss-growth-ai/id6760326527?pt=123456&ct=website&mt=8');
});

test('Apple campaign params fail closed when provider token is absent',()=>{
  assert.equal(appStoreUrl({},'website'),'https://apps.apple.com/us/app/baldwin-hair-loss-growth-ai/id6760326527');
});

import {onRequest} from '../functions/download.js';

test('validated provider download redirects to its prefilled offer and records handoff',async()=>{
  const originalFetch=globalThis.fetch,calls=[];
  globalThis.fetch=async(url,init={})=>{calls.push([String(url),init]);if(String(url).includes('/v1/providers/'))return new Response(JSON.stringify({code:'clinic-a',appleOfferCode:'CLINICA50',offerVariant:'provider_50_two_months'}),{status:200,headers:{'content-type':'application/json'}});return new Response(JSON.stringify({ok:true}),{status:201,headers:{'content-type':'application/json'}})};
  try{
    const waits=[];const response=await onRequest({request:new Request('https://getbaldwin.app/download?c=provider_referral&ref=clinic-a&utm_source=trybaldwin&utm_campaign=provider_referral'),env:{APP_STORE_PROVIDER_TOKEN:'123456',APP_STORE_PROVIDER_CAMPAIGN_TOKEN:'provider_referral'},waitUntil:p=>waits.push(p)});await Promise.all(waits);
    assert.equal(response.status,302);assert.match(response.headers.get('location'),/apps\.apple\.com\/redeem/);assert.match(response.headers.get('location'),/code=CLINICA50/);assert.ok(calls.some(([u])=>u.includes('/v1/events')));
  }finally{globalThis.fetch=originalFetch}
});

test('unknown provider fails open to ordinary App Store campaign',async()=>{
  const originalFetch=globalThis.fetch;globalThis.fetch=async(url)=>String(url).includes('/v1/providers/')?new Response('{}',{status:404}):new Response('{}',{status:201});
  try{const response=await onRequest({request:new Request('https://getbaldwin.app/download?ref=unknown&utm_source=trybaldwin&utm_campaign=provider_referral'),env:{APP_STORE_PROVIDER_TOKEN:'123456',APP_STORE_PROVIDER_CAMPAIGN_TOKEN:'provider_referral',APP_STORE_WEBSITE_CAMPAIGN_TOKEN:'website'},waitUntil:()=>{}});assert.equal(response.status,302);assert.match(response.headers.get('location'),/id6760326527/);assert.match(response.headers.get('location'),/ct=website/);}
  finally{globalThis.fetch=originalFetch}
});


test('reddit source redirects with reddit App Store campaign when configured',async()=>{
  const originalFetch=globalThis.fetch;
  globalThis.fetch=async()=>new Response('{}',{status:201});
  try{
    const response=await onRequest({
      request:new Request('https://getbaldwin.app/download?utm_source=reddit&utm_campaign=organic_progress&utm_medium=community'),
      env:{APP_STORE_PROVIDER_TOKEN:'123456',APP_STORE_WEBSITE_CAMPAIGN_TOKEN:'website',APP_STORE_REDDIT_CAMPAIGN_TOKEN:'reddit'},
      waitUntil:()=>{}
    });
    assert.equal(response.status,302);
    assert.match(response.headers.get('location'),/ct=reddit/);
  }finally{globalThis.fetch=originalFetch}
});
