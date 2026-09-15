import fs from 'node:fs';

const path = 'trackmyhairloss-pages/ops/index.html';
let html = fs.readFileSync(path, 'utf8');

const old = `if(j.status==='queued'){$('contentAction').innerHTML=\`<div><b>\${esc(label)} queued</b>\${elapsed?\` · \${esc(elapsed)}\`:''}</div><div class="muted" style="margin-top:4px">Waiting for the content worker. Queue dispatch normally starts within seconds; the one-minute cron remains as fallback.</div>\`;return}`;
const next = `if(j.status==='queued'){const age=Math.max(0,Math.floor((Date.now()-(Date.parse(j.created_at||'')||Date.now()))/1000)),queueSent=j.stage==='dispatched'||j.details?.dispatch==='queue',dispatchError=j.details?.dispatch_error||'';let headline='',sub='';if(queueSent){headline=\`\${label} dispatched to queue\`;sub=age<10?'Sent to Cloudflare Queue. Waiting for the content worker to claim it.':age<60?'Queue claim is slower than expected. The one-minute cron fallback is also armed.':'Still waiting to be claimed. Cron fallback should pick this up on the next minute tick.'}else{headline=\`\${label} queued for cron fallback\`;sub=dispatchError?\`Queue dispatch failed: \${dispatchError}. The one-minute cron fallback will run it.\`:'Queue dispatch was unavailable. The one-minute cron fallback will run it.'}$('contentAction').innerHTML=\`<div><b>\${esc(headline)}</b>\${elapsed?\` · \${esc(elapsed)}\`:''}</div><div class="muted" style="margin-top:4px">\${esc(sub)}</div>\`;return}`;

if (!html.includes(old)) {
  if (html.includes("dispatched to queue")) {
    console.log('Queue status UI already patched.');
    process.exit(0);
  }
  throw new Error('Expected queued status block not found');
}

html = html.replace(old, next);
fs.writeFileSync(path, html);
console.log('Improved content queue status UI.');
