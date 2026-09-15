import fs from 'node:fs';

function replaceBetween(source, startMarker, endMarker, replacement, label) {
  const start = source.indexOf(startMarker);
  if (start < 0) throw new Error(`Missing ${label} start marker`);
  const end = source.indexOf(endMarker, start);
  if (end < 0) throw new Error(`Missing ${label} end marker`);
  return source.slice(0, start) + replacement + source.slice(end);
}

const contentPath = 'content-worker/src/index.js';
let content = fs.readFileSync(contentPath, 'utf8');

if (!content.includes('const epmcResults = await Promise.all(queries.map(async q =>')) {
  const parallelResearch = `async function research(env, candidate) {
  if (candidate.safety_tier !== 'medical') return [];
  const collected = [];
  const queries = [...new Set((candidate.research_queries || []).filter(Boolean))].slice(0,3);
  const drugTerms = (candidate.drug_terms || []).slice(0,4);

  // Europe PMC queries and FDA label lookups are independent network I/O, so
  // run them together. This keeps the same source set and ranking logic while
  // removing avoidable serial latency before the writer starts.
  const [epmcResults, fdaResults] = await Promise.all([
    Promise.all(queries.map(async q => {
      try { return await europePmcSources(q, 6); }
      catch (e) { console.log('europe_pmc_error', q, String(e)); return []; }
    })),
    Promise.all(drugTerms.map(term => fdaSource(term)))
  ]);

  for (const rows of epmcResults) collected.push(...rows);
  for (const source of fdaResults) if (source) collected.push(source);

  // NCBI is redundant. With an API key we can safely parallelize fallbacks;
  // without one, preserve the existing serial pacing to avoid E-utilities
  // rate limits while still benefiting from parallel Europe PMC/FDA work.
  const ncbiQueries = queries.filter((q, i) => epmcResults[i].length < 3 || env.NCBI_API_KEY);
  if (env.NCBI_API_KEY) {
    const ncbiResults = await Promise.all(ncbiQueries.map(async q => {
      try { return await pubmedSources(q, env, 5); }
      catch (e) { console.log('pubmed_error', q, String(e)); return []; }
    }));
    for (const rows of ncbiResults) collected.push(...rows);
  } else {
    for (const q of ncbiQueries) {
      try { collected.push(...await pubmedSources(q, env, 5)); }
      catch (e) { console.log('pubmed_error', q, String(e)); }
    }
  }

  const seen = new Set();
  const deduped = [];
  for (const x of collected) {
    const key = x.kind === 'pubmed' ? \`p:\${x.pmid}\` : \`f:\${x.setid || x.title}\`;
    if (seen.has(key)) continue;
    seen.add(key); deduped.push(x);
  }
  // Prefer literature records with abstracts, then higher citation counts, while preserving FDA labels.
  deduped.sort((a,b)=>{
    if (a.kind !== b.kind) return a.kind === 'pubmed' ? -1 : 1;
    if (a.kind === 'pubmed') return Number(Boolean(b.excerpt))-Number(Boolean(a.excerpt)) || Number(b.cited_by_count||0)-Number(a.cited_by_count||0);
    return 0;
  });
  return deduped.slice(0,16).map((x,i)=>({ ...x, id: \`\${x.kind==='pubmed'?'P':'F'}\${i+1}\` }));
}
`;
  content = replaceBetween(content, 'async function research(env, candidate) {', '\nasync function researchProbe', parallelResearch, 'research function');
  fs.writeFileSync(contentPath, content);
}

const opsPath = 'trackmyhairloss-pages/ops/index.html';
let ops = fs.readFileSync(opsPath, 'utf8');

if (!ops.includes('function formatContentElapsed(')) {
  const progressCode = `function formatContentElapsed(value){const t=Date.parse(value||'');if(!Number.isFinite(t))return'';const s=Math.max(0,Math.floor((Date.now()-t)/1000));if(s<60)return \`\${s}s\`;const m=Math.floor(s/60),r=s%60;return m<60?\`\${m}m \${r}s\`:\`\${Math.floor(m/60)}h \${m%60}m\`}
function contentRunDetails(run){try{return typeof run?.details_json==='string'?JSON.parse(run.details_json||'{}'):(run?.details_json||{})}catch{return{}}}
function renderContentJob(){const jobs=contentData?.jobs||[];const j=(activeContentJobId&&jobs.find(x=>x.id===activeContentJobId))||jobs[0];if(!j){$('contentAction').textContent='';return}const result=j.details?.result,err=j.details?.error,label=j.mode==='operator_seo'?'SEO feedback':'Article generation',elapsed=formatContentElapsed(j.created_at);if(j.status==='queued'){$('contentAction').innerHTML=\`<div><b>\${esc(label)} queued</b>\${elapsed?\` · \${esc(elapsed)}\`:''}</div><div class="muted" style="margin-top:4px">Waiting for the content worker. Queue dispatch normally starts within seconds; the one-minute cron remains as fallback.</div>\`;return}if(j.status==='running'&&j.mode==='operator_generate'){const started=Date.parse(j.created_at||'')||0,runs=(contentData?.recent_runs||[]).filter(r=>String(r.mode||'').startsWith('manual')&&(!started||Date.parse(r.created_at||'')>=started-1500)),latest=runs[0]||null,stage=latest?.stage||'start',details=contentRunDetails(latest),rank={start:0,plan:1,research:2,writer:3,editor:4}[stage]??0,steps=['Plan','Research','Write','Edit','Publish'],active=Math.min(rank,4);let headline=['Planning topic','Researching sources','Writing draft','Editing draft','Saving and publishing'][active];if(stage==='plan'&&details?.candidate?.suggested_title)headline+=\`: \${details.candidate.suggested_title}\`;if(stage==='research'&&details?.source_count!=null)headline+=\` · \${details.source_count} sources\`;if(stage==='writer'&&details?.title)headline+=\`: \${details.title}\`;const pills=steps.map((name,i)=>{const done=i<active,now=i===active;return \`<span style="display:inline-block;margin:6px 6px 0 0;padding:4px 7px;border:1px solid \${done?'#176348':now?'#173b58':'#bcc4c8'};color:\${done?'#176348':now?'#173b58':'#687078'};font:600 9px var(--mono);text-transform:uppercase">\${done?'✓ ':now?'● ':'○ '}\${name}</span>\`}).join('');const last=latest?.created_at?new Date(latest.created_at).toLocaleTimeString():'';$('contentAction').innerHTML=\`<div><b>\${esc(headline)}</b>\${elapsed?\` · \${esc(elapsed)}\`:''}</div><div>\${pills}</div>\${last?\`<div class="muted" style="margin-top:5px">Last stage update \${esc(last)}</div>\`:''}\`;return}let text='';if(j.status==='running')text=\`\${label} is running now\${elapsed?\` · \${elapsed}\`:''}…\`;else if(j.status==='error')text=\`\${label} failed: \${err||result?.error||result?.reason||'unknown error'}\`;else if(j.status==='ok'){if(j.mode==='operator_seo')text='SEO feedback completed.';else text=result?.status==='published'?\`Published: \${result.title||result.candidate?.suggested_title||'article'}.\`:\`Article generation completed\${result?.title?\`: \${result.title}\`:'.'}\`}$('contentAction').textContent=text}
`;
  ops = replaceBetween(ops, 'function renderContentJob(){', '\nasync function loadContent', progressCode, 'operator progress function');
  ops = ops.replace('},4000)}', '},2000)}');
  fs.writeFileSync(opsPath, ops);
}

console.log('Applied Baldwin content speed/progress patch.');
