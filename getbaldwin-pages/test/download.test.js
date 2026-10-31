import test from 'node:test';
import assert from 'node:assert/strict';
import {appStoreUrl,appleCampaignToken,appleProviderToken,offerCode,providerCode,redemptionUrl} from '../functions/download.js';

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


test('content download without utm_source records TrackMyHairLoss as source',async()=>{
  const originalFetch=globalThis.fetch,events=[];
  globalThis.fetch=async(_url,init={})=>{
    if(init.body)events.push(JSON.parse(init.body));
    return new Response(JSON.stringify({ok:true}),{status:201,headers:{'content-type':'application/json'}});
  };
  try{
    const waits=[];
    const response=await onRequest({
      request:new Request('https://getbaldwin.app/download?c=tmhl_content&aid=synthetic-content-visitor'),
      env:{},
      waitUntil:p=>waits.push(p)
    });
    await Promise.all(waits);
    assert.equal(response.status,302);
    const redirect=events.find(e=>e.event==='app_store_redirect');
    assert.ok(redirect,'App Store handoff must be recorded');
    assert.equal(redirect.anonymousId,'synthetic-content-visitor');
    assert.equal(redirect.source,'trackmyhairloss');
    assert.equal(redirect.campaign,'tmhl_content');
  }finally{globalThis.fetch=originalFetch}
});

test('all TrackMyHairLoss placements classify correctly without client-side UTM decoration',async()=>{
  const originalFetch=globalThis.fetch,events=[];
  globalThis.fetch=async(_url,init={})=>{
    if(init.body)events.push(JSON.parse(init.body));
    return new Response('{}',{status:201});
  };
  try{
    const cases=[
      ['https://getbaldwin.app/download?c=tmhl_home','trackmyhairloss','tmhl_home'],
      ['https://getbaldwin.app/download?c=tmhl_nav','trackmyhairloss','tmhl_nav'],
      ['https://getbaldwin.app/download?c=tmhl_content&utm_source=approved_partner','approved_partner','tmhl_content'],
      ['https://getbaldwin.app/download?c=tmhl_home&utm_campaign=homepage_test','trackmyhairloss','homepage_test'],
      ['https://getbaldwin.app/download?c=website','getbaldwin','website'],
      ['https://getbaldwin.app/download?c=tmhl','getbaldwin','tmhl'],
      ['https://getbaldwin.app/download?c=tmhl_%2Fmalformed','getbaldwin','tmhl_/malformed']
    ];
    for(const [url] of cases){
      const waits=[];
      const response=await onRequest({request:new Request(url),env:{},waitUntil:p=>waits.push(p)});
      await Promise.all(waits);
      assert.equal(response.status,302);
    }
    assert.equal(events.length,cases.length);
    for(let i=0;i<cases.length;i++){
      assert.equal(events[i].source,cases[i][1],cases[i][0]);
      assert.equal(events[i].campaign,cases[i][2],cases[i][0]);
    }
  }finally{globalThis.fetch=originalFetch}
});
