const PROVIDER_RE=/^[a-z0-9][a-z0-9-]{0,63}$/;
const OFFER_RE=/^[A-Z0-9]{1,64}$/;
const OFFER_VARIANT='provider_50_two_months';
const DEFAULT_LIMIT=25000;

function clean(value,max=500){return String(value??'').trim().slice(0,max)}
function providerCode(value){const s=String(value||'').trim().toLowerCase();return s.length<=64&&PROVIDER_RE.test(s)?s:null}
function offerCode(value){const s=String(value||'').trim().toUpperCase();return s.length<=64&&OFFER_RE.test(s)?s:null}
function bytesToBase64Url(bytes){let binary='';for(const b of new Uint8Array(bytes))binary+=String.fromCharCode(b);return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function utf8Base64Url(value){return bytesToBase64Url(new TextEncoder().encode(value))}
function pemBytes(pem){const b64=String(pem||'').replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s+/g,'');if(!b64)throw new Error('ASC_PRIVATE_KEY is empty or not PKCS8 PEM');const raw=atob(b64),out=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out.buffer}
async function sha256Hex(value){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('')}

export function appleOfferConfigured(env){return Boolean(env?.ASC_ISSUER_ID&&env?.ASC_KEY_ID&&env?.ASC_PRIVATE_KEY&&env?.ASC_PROVIDER_OFFER_ID)}

export async function customOfferCodeForProvider(rawCode){
  const code=providerCode(rawCode);if(!code)throw new Error('invalid_provider_code');
  const stem=code.replace(/[^a-z0-9]/g,'').toUpperCase().slice(0,36);
  const digest=(await sha256Hex(code)).slice(0,10).toUpperCase();
  return offerCode(`BLD${stem}${digest}`.slice(0,64));
}

export async function makeAppStoreConnectToken(env,nowSeconds=Math.floor(Date.now()/1000)){
  if(!appleOfferConfigured(env))throw new Error('app_store_connect_not_configured');
  const key=await crypto.subtle.importKey('pkcs8',pemBytes(String(env.ASC_PRIVATE_KEY).replace(/\\n/g,'\n')),{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
  const header=utf8Base64Url(JSON.stringify({alg:'ES256',kid:String(env.ASC_KEY_ID),typ:'JWT'}));
  const payload=utf8Base64Url(JSON.stringify({iss:String(env.ASC_ISSUER_ID),iat:nowSeconds,exp:nowSeconds+600,aud:'appstoreconnect-v1'}));
  const input=`${header}.${payload}`;
  const signature=await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,new TextEncoder().encode(input));
  return `${input}.${bytesToBase64Url(signature)}`;
}

async function ascFetch(env,url,init={}){
  const response=await fetch(url,{...init,headers:{Authorization:`Bearer ${await makeAppStoreConnectToken(env)}`,...(init.headers||{})}});
  const text=await response.text();let body={};try{body=text?JSON.parse(text):{}}catch{body={raw:text}}
  return{response,body,text};
}

export async function findExistingAppleCustomCode(env,rawCustomCode){
  const customCode=offerCode(rawCustomCode);if(!customCode||!appleOfferConfigured(env))return null;
  let url=`https://api.appstoreconnect.apple.com/v1/subscriptionOfferCodes/${encodeURIComponent(String(env.ASC_PROVIDER_OFFER_ID))}/customCodes?fields%5BsubscriptionOfferCodeCustomCodes%5D=customCode%2Cactive%2CnumberOfCodes&limit=200`;
  for(let page=0;url&&page<20;page++){
    const {response,body,text}=await ascFetch(env,url,{headers:{accept:'application/json'}});
    if(!response.ok){const error=new Error(`app_store_connect_${response.status}`);error.status=response.status;error.detail=clean(body?.errors?.[0]?.detail||body?.errors?.[0]?.title||text,500);throw error}
    const match=Array.isArray(body?.data)?body.data.find(item=>offerCode(item?.attributes?.customCode)===customCode):null;
    if(match)return{customCode,active:match?.attributes?.active!==false,id:clean(match?.id,120)||null,numberOfCodes:Number(match?.attributes?.numberOfCodes||0)||null};
    url=typeof body?.links?.next==='string'?body.links.next:null;
  }
  return null;
}

export async function createAppleCustomCode(env,customCode,redemptionLimit=DEFAULT_LIMIT){
  const limit=Number.isInteger(redemptionLimit)?Math.max(1,Math.min(25000,redemptionLimit)):DEFAULT_LIMIT;
  const {response,body,text}=await ascFetch(env,'https://api.appstoreconnect.apple.com/v1/subscriptionOfferCodeCustomCodes',{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({data:{type:'subscriptionOfferCodeCustomCodes',attributes:{customCode,numberOfCodes:limit},relationships:{offerCode:{data:{type:'subscriptionOfferCodes',id:String(env.ASC_PROVIDER_OFFER_ID)}}}}})
  });
  if(response.ok)return{body,reconciled:false};
  if(response.status===409){
    const existing=await findExistingAppleCustomCode(env,customCode);
    if(existing?.active)return{body:{data:{id:existing.id,type:'subscriptionOfferCodeCustomCodes',attributes:{customCode:existing.customCode,active:true,numberOfCodes:existing.numberOfCodes}}},reconciled:true};
  }
  const error=new Error(`app_store_connect_${response.status}`);error.status=response.status;error.detail=clean(body?.errors?.[0]?.detail||body?.errors?.[0]?.title||text,500);throw error;
}

async function markProvisionError(env,code,error){
  await env.DB.prepare(`UPDATE providers SET offer_provision_status='error',offer_provision_error=?,offer_provision_updated_at=CURRENT_TIMESTAMP WHERE code=?`).bind(clean(error?.detail||error?.message||error,500),code).run();
}

export async function provisionProviderOffer(env,rawCode,{redemptionLimit=DEFAULT_LIMIT}={}){
  const code=providerCode(rawCode);if(!code)return{ok:false,status:400,error:'invalid_provider_code'};
  const provider=await env.DB.prepare(`SELECT id,code,name,apple_offer_code,offer_variant,offer_provision_status,offer_provision_updated_at FROM providers WHERE code=? LIMIT 1`).bind(code).first();
  if(!provider)return{ok:false,status:404,error:'provider_not_found'};
  if(offerCode(provider.apple_offer_code))return{ok:true,status:200,alreadyProvisioned:true,providerCode:code,appleOfferCode:offerCode(provider.apple_offer_code),offerVariant:clean(provider.offer_variant,80)||OFFER_VARIANT};
  if(!appleOfferConfigured(env))return{ok:false,status:503,error:'app_store_connect_not_configured'};

  const lock=await env.DB.prepare(`UPDATE providers SET offer_provision_status='provisioning',offer_provision_error=NULL,offer_provision_updated_at=CURRENT_TIMESTAMP WHERE code=? AND apple_offer_code IS NULL AND (offer_provision_status IS NULL OR offer_provision_status IN ('unconfigured','error','missing_config') OR offer_provision_updated_at IS NULL OR offer_provision_updated_at < datetime('now','-10 minutes'))`).bind(code).run();
  if(Number(lock.meta?.changes||0)===0){
    const current=await env.DB.prepare(`SELECT apple_offer_code,offer_variant,offer_provision_status FROM providers WHERE code=? LIMIT 1`).bind(code).first();
    if(offerCode(current?.apple_offer_code))return{ok:true,status:200,alreadyProvisioned:true,providerCode:code,appleOfferCode:offerCode(current.apple_offer_code),offerVariant:clean(current.offer_variant,80)||OFFER_VARIANT};
    return{ok:false,status:409,error:'offer_provision_in_progress',state:clean(current?.offer_provision_status,40)||'provisioning'};
  }

  const customCode=await customOfferCodeForProvider(code);
  try{
    const created=await createAppleCustomCode(env,customCode,redemptionLimit);
    await env.DB.prepare(`UPDATE providers SET apple_offer_code=?,offer_variant=?,offer_provision_status='ready',offer_provision_error=NULL,offer_provisioned_at=COALESCE(offer_provisioned_at,CURRENT_TIMESTAMP),offer_provision_updated_at=CURRENT_TIMESTAMP WHERE code=?`).bind(customCode,OFFER_VARIANT,code).run();
    return{ok:true,status:created.reconciled?200:201,reconciled:Boolean(created.reconciled),providerCode:code,appleOfferCode:customCode,offerVariant:OFFER_VARIANT};
  }catch(error){
    await markProvisionError(env,code,error);
    return{ok:false,status:Number(error?.status)||502,error:'offer_provision_failed',detail:clean(error?.detail||error?.message,500)};
  }
}
