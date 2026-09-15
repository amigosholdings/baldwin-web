#!/usr/bin/env node
const argv=process.argv.slice(2);
function arg(name){const i=argv.indexOf(`--${name}`);return i>=0?argv[i+1]:null}
function has(name){return argv.includes(`--${name}`)}
function validCode(value){const s=String(value||'').trim().toLowerCase();return s.length<=64&&/^[a-z0-9][a-z0-9-]{0,63}$/.test(s)?s:null}
const base=String(process.env.GROWTH_API_URL||'https://baldwin-growth-api.threeamigosholdings.workers.dev').replace(/\/+$/,'');
const token=String(process.env.ADMIN_TOKEN||'').trim();
if(!token){console.error('ADMIN_TOKEN is required.');process.exit(1)}
async function api(path,init={}){const r=await fetch(base+path,{...init,headers:{'x-admin-token':token,'content-type':'application/json',...(init.headers||{})}});const text=await r.text();let body={};try{body=text?JSON.parse(text):{}}catch{body={raw:text}}if(!r.ok){throw new Error(`${path} failed (${r.status}): ${body.error||body.detail||text}`)}return body}
async function provision(code,limit){const result=await api(`/v1/admin/providers/${encodeURIComponent(code)}/provision-offer`,{method:'POST',body:JSON.stringify({limit})});console.log(JSON.stringify(result,null,2));return result}
async function main(){
  const limit=Number.parseInt(arg('limit')||'25000',10);if(!Number.isInteger(limit)||limit<1||limit>25000)throw new Error('--limit must be 1-25000');
  if(has('all')){const d=await api('/v1/admin/dashboard');const pending=(d.providers||[]).filter(p=>!p.apple_offer_code);for(const p of pending){try{console.error(`Provisioning ${p.code}…`);await provision(p.code,limit)}catch(e){console.error(e.message)}}return}
  const code=validCode(arg('code'));if(!code)throw new Error('Use --code provider-code or --all.');
  await provision(code,limit);
}
main().catch(e=>{console.error(e.message||e);process.exitCode=1});
