window.BALDWIN_GROWTH_API=window.BALDWIN_GROWTH_API||'https://baldwin-growth-api.threeamigosholdings.workers.dev';
(function(){
  const anonKey='baldwin_anon_id',providerKey='baldwin_provider_ref';
  const params=new URLSearchParams(location.search);
  const validProvider=s=>/^[a-z0-9][a-z0-9-]{0,63}$/.test(s||'');
  let id=localStorage.getItem(anonKey);
  if(!id){id=(crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2));localStorage.setItem(anonKey,id)}
  const existing=localStorage.getItem(providerKey),incoming=params.get('ref');
  if(!validProvider(existing)&&validProvider(incoming))localStorage.setItem(providerKey,incoming);
  const providerCode=validProvider(localStorage.getItem(providerKey))?localStorage.getItem(providerKey):null;
  const source=(params.get('utm_source')||'getbaldwin').slice(0,80);
  const campaign=(params.get('utm_campaign')||params.get('c')||location.pathname).slice(0,120);
  const experiments={};
  function cleanMeta(metadata){const safe={};for(const [k,v] of Object.entries(metadata||{}).slice(0,20)){if(/photo|image|treatment|medical|health|diagnos|symptom|note|history|email|name|token|receipt|password|secret/i.test(k))continue;if(v===null||typeof v==='boolean'||typeof v==='number'||typeof v==='string')safe[k]=typeof v==='string'?v.slice(0,120):v}return safe}
  function assignExperiment(key,variants){
    const k=String(key||'').trim().replace(/[^a-z0-9_-]/gi,'_').slice(0,64);
    const arms=Array.from(new Set((variants||[]).map(v=>String(v||'').trim()).filter(Boolean))).slice(0,12);
    if(!k||arms.length<2)throw new Error('experiment_key_and_two_variants_required');
    const storageKey='baldwin_exp_'+k;
    let choice=localStorage.getItem(storageKey);
    if(!arms.includes(choice)){
      let r=Math.random();
      try{if(crypto.getRandomValues){const a=new Uint32Array(1);crypto.getRandomValues(a);r=a[0]/4294967296}}catch(_){}
      choice=arms[Math.min(arms.length-1,Math.floor(r*arms.length))];
      localStorage.setItem(storageKey,choice);
    }
    experiments[k]=choice;
    return choice;
  }
  function experimentMeta(){const out={};for(const [k,v] of Object.entries(experiments).slice(0,6))out['exp_'+k]=v;return out}
  function event(name,metadata={}){
    const safe=cleanMeta({...experimentMeta(),...metadata});
    try{if(typeof window.gtag==='function')window.gtag('event',name,{...safe,site:'getbaldwin',page_path:location.pathname,provider_ref:providerCode||undefined,utm_source:source,utm_campaign:campaign})}catch(_){}
    return fetch(window.BALDWIN_GROWTH_API+'/v1/events',{method:'POST',keepalive:true,headers:{'content-type':'application/json'},body:JSON.stringify({event:name,providerCode,anonymousId:id,source,campaign,metadata:safe})}).catch(()=>{});
  }
  function decorateLinks(){document.querySelectorAll('a[href^="/download"],a[href*="getbaldwin.app/download"]').forEach(a=>{try{const u=new URL(a.href,location.origin);if(providerCode&&!u.searchParams.get('ref'))u.searchParams.set('ref',providerCode);if(!u.searchParams.get('aid'))u.searchParams.set('aid',id);if(!u.searchParams.get('utm_source'))u.searchParams.set('utm_source',source);if(!u.searchParams.get('utm_campaign'))u.searchParams.set('utm_campaign',campaign==='/'?'website':campaign.replace(/^\/+|\/+$/g,'').replaceAll('/','_')||'website');a.href=u.toString()}catch(_){}})}
  function bindDownloadTracking(){document.querySelectorAll('a[href*="/download"]').forEach(a=>{if(a.dataset.baldwinTracked)return;a.dataset.baldwinTracked='1';a.addEventListener('click',()=>event('download_click',{placement:(new URL(a.href,location.origin)).searchParams.get('c')||'website'}))})}
  function init(){decorateLinks();bindDownloadTracking()}
  window.BaldwinGrowth={id,providerCode,source,campaign,event,decorateLinks,assignExperiment,experiments};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
