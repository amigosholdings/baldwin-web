const PROVIDER_RE=/^[a-z0-9][a-z0-9-]{0,63}$/;
const OFFER_RE=/^[A-Z0-9]{1,64}$/;
const OPAQUE_RE=/^[A-Za-z0-9._:-]+$/;
const SENSITIVE_KEY=/(photo|image|treatment|medical|health|diagnos|symptom|note|history|email|name|token|receipt|password|secret)/i;
export const GROWTH_EVENT_NAMES=new Set(['landing_view','referral_view','download_click','provider_offer_redirect','app_store_redirect','attributed_install','attributed_open','app_signup','baseline_complete','second_session','subscription_started','tool_used','tool_open','tool_cta_click','blog_view','blog_cta_click']);
const CONVERSIONS=new Set(['app_signup','baseline_complete','second_session','subscription_started']);
function clean(v,max=120){if(typeof v!=='string')return null;const s=v.trim();return s?s.slice(0,max):null}
export function normalizeProviderCode(v){if(typeof v!=='string')return null;const s=v.trim().toLowerCase();return s.length<=64&&PROVIDER_RE.test(s)?s:null}
export function normalizeAppleOfferCode(v){if(typeof v!=='string')return null;const s=v.trim().toUpperCase();return s.length<=64&&OFFER_RE.test(s)?s:null}
function opaque(v,max=180){if(typeof v!=='string')return null;const s=v.trim();return s&&s.length<=max&&OPAQUE_RE.test(s)?s:null}
export function sanitizeGrowthMetadata(input){if(!input||typeof input!=='object'||Array.isArray(input))return{};const out={};for(const [rawKey,rawValue] of Object.entries(input).slice(0,20)){const key=String(rawKey).replace(/[^A-Za-z0-9_.-]/g,'_').slice(0,50);if(!key||SENSITIVE_KEY.test(key))continue;if(rawValue===null||typeof rawValue==='boolean')out[key]=rawValue;else if(typeof rawValue==='number'&&Number.isFinite(rawValue))out[key]=rawValue;else if(typeof rawValue==='string')out[key]=rawValue.slice(0,120)}return out}
export async function activeProvider(env,rawCode){const code=normalizeProviderCode(rawCode);if(!code)return null;const row=await env.DB.prepare(`SELECT id,code,name,website,city,state,status,apple_offer_code,offer_variant,offer_provision_status,offer_provision_error,offer_provisioned_at FROM providers WHERE code=? AND status IN ('pilot','active') LIMIT 1`).bind(code).first();if(!row)return null;return{...row,appleOfferCode:normalizeAppleOfferCode(row.apple_offer_code),offerVariant:clean(row.offer_variant,80)||null,offerProvisionStatus:clean(row.offer_provision_status,40)||'unconfigured',offerProvisionError:clean(row.offer_provision_error,500)||null,offerProvisionedAt:clean(row.offer_provisioned_at,80)||null}}
async function attribution(env,key){if(!key)return null;return env.DB.prepare('SELECT * FROM attribution_subjects WHERE subject_key=? LIMIT 1').bind(key).first()}
async function remember(env,{key,userId,installationId,anonymousId,providerCode,source,campaign,eventName}){if(!key)return null;const existing=await attribution(env,key);if(existing)return existing;const now=new Date().toISOString();await env.DB.prepare(`INSERT OR IGNORE INTO attribution_subjects(subject_key,user_id,installation_id,anonymous_id,provider_code,source,campaign,first_event,created_at) VALUES(?,?,?,?,?,?,?,?,?)`).bind(key,userId,installationId,anonymousId,providerCode,source,campaign,eventName,now).run();return attribution(env,key)}
export async function recordGrowthEvent(env,body){
  const event=clean(body?.event,80);if(!event||!GROWTH_EVENT_NAMES.has(event))return{status:400,body:{error:'invalid_event'}};
  const userId=opaque(body?.userId,128),installationId=opaque(body?.installationId,128),anonymousId=opaque(body?.anonymousId,128),source=clean(body?.source,80),campaign=clean(body?.campaign,120);
  let requestedProvider=null;if(body?.providerCode){requestedProvider=await activeProvider(env,body.providerCode)}
  let effectiveProvider=requestedProvider?.code||null,effectiveSource=source,effectiveCampaign=campaign;
  const userKey=userId?`user:${userId}`:null,installKey=installationId?`install:${installationId}`:null,anonKey=anonymousId?`anon:${anonymousId}`:null;
  if(event==='attributed_install'||event==='attributed_open'){
    if(installKey){const row=await remember(env,{key:installKey,userId:null,installationId,anonymousId,providerCode:effectiveProvider,source,campaign,eventName:event});effectiveProvider=row?.provider_code||null;effectiveSource=row?.source||source;effectiveCampaign=row?.campaign||campaign}
  }else if(event==='referral_view'||event==='download_click'||event==='provider_offer_redirect'||event==='app_store_redirect'){
    if(anonKey&&effectiveProvider){const row=await remember(env,{key:anonKey,userId:null,installationId:null,anonymousId,providerCode:effectiveProvider,source,campaign,eventName:event});effectiveProvider=row?.provider_code||effectiveProvider;effectiveSource=row?.source||source;effectiveCampaign=row?.campaign||campaign}
  }
  if(event==='app_signup'&&userKey){
    let seed=installKey?await attribution(env,installKey):null;if(!seed&&anonKey)seed=await attribution(env,anonKey);
    const row=await remember(env,{key:userKey,userId,installationId,anonymousId,providerCode:seed?.provider_code||effectiveProvider,source:seed?.source||source,campaign:seed?.campaign||campaign,eventName:event});
    effectiveProvider=row?.provider_code||null;effectiveSource=row?.source||source;effectiveCampaign=row?.campaign||campaign;
  }else if(CONVERSIONS.has(event)&&userKey){
    const row=await attribution(env,userKey);if(row){effectiveProvider=row.provider_code||null;effectiveSource=row.source||source;effectiveCampaign=row.campaign||campaign}else{effectiveProvider=null}
  }
  let idempotencyKey=opaque(body?.idempotencyKey,180);
  if(CONVERSIONS.has(event)){const subject=userId||installationId;if(subject)idempotencyKey=`${event}:${userId?'user':'install'}:${subject}`}
  if(event==='attributed_install'&&installationId)idempotencyKey=`attributed_install:${installationId}`;
  const metadata=JSON.stringify(sanitizeGrowthMetadata(body?.metadata));
  const id=crypto.randomUUID();
  if(idempotencyKey){const r=await env.DB.prepare(`INSERT OR IGNORE INTO events(id,event_name,provider_code,anonymous_id,user_id,source,campaign,metadata_json,installation_id,idempotency_key) VALUES(?,?,?,?,?,?,?,?,?,?)`).bind(id,event,effectiveProvider,anonymousId,userId,effectiveSource,effectiveCampaign,metadata,installationId,idempotencyKey).run();return{status:201,body:{ok:true,deduplicated:Number(r.meta?.changes||0)===0,providerCode:effectiveProvider}}}
  await env.DB.prepare(`INSERT INTO events(id,event_name,provider_code,anonymous_id,user_id,source,campaign,metadata_json,installation_id) VALUES(?,?,?,?,?,?,?,?,?)`).bind(id,event,effectiveProvider,anonymousId,userId,effectiveSource,effectiveCampaign,metadata,installationId).run();
  return{status:201,body:{ok:true,providerCode:effectiveProvider}};
}
export async function upsertProviderOffer(env,body){
  const code=normalizeProviderCode(body?.code),name=clean(body?.name,160),appleOfferCode=normalizeAppleOfferCode(body?.appleOfferCode),offerVariant=clean(body?.offerVariant,80)||'provider_50_two_months';
  if(!code||!appleOfferCode)return{status:400,body:{error:'valid_code_and_apple_offer_code_required'}};
  const existing=await env.DB.prepare('SELECT id,name FROM providers WHERE code=? LIMIT 1').bind(code).first();
  if(!existing&&!name)return{status:400,body:{error:'name_required_for_new_provider'}};
  const conflict=await env.DB.prepare('SELECT code FROM providers WHERE apple_offer_code=? AND code<>? LIMIT 1').bind(appleOfferCode,code).first();
  if(conflict)return{status:409,body:{error:'apple_offer_code_in_use'}};
  if(existing){
    await env.DB.prepare(`UPDATE providers SET apple_offer_code=?,offer_variant=?,offer_provision_status='ready',offer_provision_error=NULL,offer_provisioned_at=COALESCE(offer_provisioned_at,CURRENT_TIMESTAMP),offer_provision_updated_at=CURRENT_TIMESTAMP WHERE code=?`).bind(appleOfferCode,offerVariant,code).run();
    return{status:200,body:{ok:true,provider:{id:existing.id,code,name:existing.name,appleOfferCode,offerVariant}}};
  }
  const id=crypto.randomUUID();
  await env.DB.prepare(`INSERT INTO providers(id,code,name,status,apple_offer_code,offer_variant,offer_provision_status,offer_provisioned_at,offer_provision_updated_at) VALUES(?,?,?,'pilot',?,?,'ready',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`).bind(id,code,name,appleOfferCode,offerVariant).run();
  return{status:201,body:{ok:true,provider:{id,code,name,appleOfferCode,offerVariant}}};
}
