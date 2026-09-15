const APPLE_APP_ID='6760326527';
const APP_STORE_URL=`https://apps.apple.com/us/app/baldwin-hair-loss-growth-ai/id${APPLE_APP_ID}`;
const DEFAULT_GROWTH_API='https://baldwin-growth-api.threeamigosholdings.workers.dev';
const PROVIDER_RE=/^[a-z0-9][a-z0-9-]{0,63}$/;
const OFFER_RE=/^[A-Z0-9]{1,64}$/;
const OPAQUE_RE=/^[A-Za-z0-9._:-]{1,128}$/;
const APPLE_PROVIDER_TOKEN_RE=/^[0-9]{1,20}$/;
const APPLE_CAMPAIGN_RE=/^[A-Za-z0-9._-]{1,30}$/;
function clean(v,max=120){return String(v||'').trim().slice(0,max)}
function providerCode(v){const s=String(v||'').trim().toLowerCase();return s.length<=64&&PROVIDER_RE.test(s)?s:null}
function offerCode(v){const s=String(v||'').trim().toUpperCase();return s.length<=64&&OFFER_RE.test(s)?s:null}
function opaque(v){const s=String(v||'').trim();return s.length<=128&&OPAQUE_RE.test(s)?s:null}
function appleProviderToken(v){const s=String(v||'').trim();return s.length<=20&&APPLE_PROVIDER_TOKEN_RE.test(s)?s:null}
function appleCampaignToken(v){const s=String(v||'').trim();return s.length<=30&&APPLE_CAMPAIGN_RE.test(s)?s:null}
function withAppleCampaign(url,env,campaignToken){const u=new URL(url),pt=appleProviderToken(env.APP_STORE_PROVIDER_TOKEN),ct=appleCampaignToken(campaignToken);if(pt&&ct){u.searchParams.set('pt',pt);u.searchParams.set('ct',ct);u.searchParams.set('mt','8')}return u.toString()}
function redemptionUrl(code,env={},campaignToken=null){const u=new URL('https://apps.apple.com/redeem');u.searchParams.set('ctx','offercodes');u.searchParams.set('id',APPLE_APP_ID);u.searchParams.set('code',offerCode(code)||'');return withAppleCampaign(u.toString(),env,campaignToken)}
function appStoreUrl(env={},campaignToken=null){return withAppleCampaign(APP_STORE_URL,env,campaignToken)}
async function apiFetch(env,path,init={}){const base=clean(env.GROWTH_API_URL||DEFAULT_GROWTH_API,240).replace(/\/+$/,'');const c=new AbortController(),t=setTimeout(()=>c.abort(),2200);try{return await fetch(base+path,{...init,signal:c.signal})}finally{clearTimeout(t)}}
async function lookupProvider(env,code){if(!code)return null;try{const r=await apiFetch(env,'/v1/providers/'+encodeURIComponent(code),{headers:{accept:'application/json'}});if(!r.ok)return null;const p=await r.json();return p&&providerCode(p.code)===code?p:null}catch{return null}}
async function record(env,payload){try{await apiFetch(env,'/v1/events',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)})}catch{}}
function campaignFor(env,isProviderTraffic){return isProviderTraffic?appleCampaignToken(env.APP_STORE_PROVIDER_CAMPAIGN_TOKEN):appleCampaignToken(env.APP_STORE_WEBSITE_CAMPAIGN_TOKEN)}
function isLikelyBot(request){return /bot|crawler|spider|preview|facebookexternalhit|twitterbot|slackbot|discordbot|whatsapp/i.test(request.headers.get('user-agent')||'')}
export async function onRequest(context){
  const {request,env}=context;
  if(request.method!=='GET'&&request.method!=='HEAD')return new Response('Method Not Allowed',{status:405,headers:{Allow:'GET, HEAD'}});
  const url=new URL(request.url),ref=providerCode(url.searchParams.get('ref')),anonymousId=opaque(url.searchParams.get('aid'));
  const source=clean(url.searchParams.get('utm_source')||'getbaldwin',80),campaign=clean(url.searchParams.get('utm_campaign')||url.searchParams.get('c')||'download',120);
  const rid=opaque(url.searchParams.get('rid'))||crypto.randomUUID();
  const provider=await lookupProvider(env,ref);
  const effectiveRef=provider?ref:null,isProviderTraffic=Boolean(provider)&&(source==='trybaldwin'||campaign==='provider_referral'),appleCampaign=campaignFor(env,isProviderTraffic);
  const destination=provider&&offerCode(provider.appleOfferCode)?'offer_code':'app_store';
  const shouldTrack=request.method==='GET'&&!isLikelyBot(request);
  if(shouldTrack)context.waitUntil(record(env,{event:'app_store_redirect',providerCode:effectiveRef,anonymousId,source,campaign,idempotencyKey:`app_store_redirect:${rid}`,metadata:{destination,placement:clean(url.searchParams.get('c'),80),apple_campaign:appleCampaign||null,apple_campaign_enabled:Boolean(appleProviderToken(env.APP_STORE_PROVIDER_TOKEN)&&appleCampaign)}}));
  if(provider&&offerCode(provider.appleOfferCode)){
    if(shouldTrack)context.waitUntil(record(env,{event:'provider_offer_redirect',providerCode:ref,anonymousId,source,campaign,idempotencyKey:`provider_offer_redirect:${rid}`,metadata:{offer_variant:clean(provider.offerVariant||'provider_50_two_months',80),apple_campaign:appleCampaign||null}}));
    return Response.redirect(redemptionUrl(offerCode(provider.appleOfferCode),env,appleCampaign),302);
  }
  return Response.redirect(appStoreUrl(env,appleCampaign),302);
}
export {appStoreUrl,appleCampaignToken,appleProviderToken,offerCode,opaque,providerCode,redemptionUrl,withAppleCampaign};
