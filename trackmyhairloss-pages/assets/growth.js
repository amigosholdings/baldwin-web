window.BALDWIN_GROWTH_API=window.BALDWIN_GROWTH_API||'https://baldwin-growth-api.threeamigosholdings.workers.dev';
(function(){
  const anonKey='baldwin_anon_id', providerKey='baldwin_provider_ref';
  const params=new URLSearchParams(location.search);
  const validProvider=s=>/^[a-z0-9][a-z0-9-]{0,63}$/.test(s||'');
  let id=localStorage.getItem(anonKey);
  if(!id){id=(crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2));localStorage.setItem(anonKey,id)}
  const incomingRef=params.get('ref');
  // Provider attribution is session-scoped. A prior clinic referral must never
  // turn a later direct Baldwin visit into a provider-offer visit.
  try{localStorage.removeItem(providerKey)}catch(_){}
  const existingRef=sessionStorage.getItem(providerKey);
  if(validProvider(incomingRef)) sessionStorage.setItem(providerKey,incomingRef);
  const providerCode=validProvider(incomingRef)
    ? incomingRef
    : (validProvider(existingRef)?existingRef:null);
  const source=(params.get('utm_source')||'trackmyhairloss').slice(0,80);
  const campaign=(params.get('utm_campaign')||location.pathname).slice(0,120);

  function event(name,metadata={}){
    try{
      if(typeof window.gtag==='function'){
        const safe={...metadata,site:'trackmyhairloss',page_path:location.pathname,provider_ref:providerCode||undefined,utm_source:source,utm_campaign:campaign};
        delete safe.notes;delete safe.email;delete safe.name;
        window.gtag('event',name,safe);
      }
    }catch(_){}
    return fetch(window.BALDWIN_GROWTH_API+'/v1/events',{
      method:'POST',headers:{'content-type':'application/json'},
      body:JSON.stringify({event:name,providerCode,anonymousId:id,source,campaign,metadata})
    }).catch(()=>{});
  }

  function decorateLinks(){
    document.querySelectorAll('a[href*="getbaldwin.app/download"]').forEach(a=>{
      try{
        const u=new URL(a.href);
        const direct=a.hasAttribute('data-direct-baldwin');
        if(direct){
          u.searchParams.delete('ref');
          if(!u.searchParams.get('aid'))u.searchParams.set('aid',id);
          if(!u.searchParams.get('utm_source'))u.searchParams.set('utm_source','trackmyhairloss');
          if(!u.searchParams.get('utm_campaign'))u.searchParams.set('utm_campaign','direct');
          a.href=u.toString();
          return;
        }
        if(providerCode&&!u.searchParams.get('ref'))u.searchParams.set('ref',providerCode);
        if(!u.searchParams.get('aid'))u.searchParams.set('aid',id);
        if(!u.searchParams.get('utm_source'))u.searchParams.set('utm_source',source);
        if(!u.searchParams.get('utm_campaign'))u.searchParams.set('utm_campaign',campaign==='/'?'tmhl_home':campaign.replace(/^\/+|\/+$/g,'').replaceAll('/','_')||'tmhl');
        a.href=u.toString();
      }catch(_){}
    });
  }

  window.BaldwinGrowth={id,providerCode,source,campaign,event,decorateLinks};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',decorateLinks);else decorateLinks();
})();
