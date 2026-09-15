const MODEL = '@cf/zai-org/glm-5.3';
const SITE = 'https://trackmyhairloss.com';
const MIN_PUBLISH_GAP_MS = 46 * 60 * 60 * 1000;
const MAX_EXISTING_CONTEXT = 80;
const DEFAULT_SCHEDULED_ATTEMPTS = 4;
const SCHEDULED_TYPE_FALLBACKS = [null, 'tracking_guide', 'question', 'treatment_comparison', 'treatment_profile'];

// Boundaries, not exact topics. The planner decides the actual query/title each run.
const EDITORIAL_PILLARS = [
  'measuring hair change accurately with repeatable photographs',
  'visual comparison methods, camera geometry, lighting, framing and image consistency',
  'hair-loss and hair-regrowth treatment comparisons for an informed discussion with a clinician',
  'evidence-based treatment explainers, including regulatory status, evidence quality, tradeoffs and limitations',
  'treatment timelines and how to interpret a longitudinal record without over-reading short-term noise',
  'questions people ask while deciding how to track or discuss hair-loss treatment',
  'organizing a photo and treatment timeline for a dermatology or hair-restoration appointment',
  'decision frameworks that help readers compare options without pretending to diagnose or prescribe'
];

const TOOLS = [
  { path: '/comparator/', name: 'Comparison Studio', intent: 'align and compare two progress photos' },
  { path: '/photo-audit/', name: 'Photo Consistency Audit', intent: 'check whether two photos are comparable' },
  { path: '/contact-sheet/', name: 'Contact Sheet Builder', intent: 'turn several progress photos into a timeline' },
  { path: '/framing-grid/', name: 'Framing Reference Maker', intent: 'create a repeatable baseline composition' },
  { path: '/check-in-log/', name: 'Private Check-in Log', intent: 'keep dates and setup changes locally' },
  { path: '/photo-guide/', name: 'Photo Protocol', intent: 'take repeatable progress photos' },
  { path: '/timeline/', name: 'Check-in Schedule', intent: 'plan neutral progress-photo dates' }
];

const ALLOWED_BODY_TAGS = new Set(['p','h2','h3','ul','ol','li','strong','em','table','thead','tbody','tr','th','td']);
const MEDICAL_HINT = /\b(finasteride|minoxidil|dutasteride|prp|platelet|transplant|microneedl|laser|lllt|treatment|therapy|drug|medication|dose|dosing|side effect|adverse|efficacy|safety|alopecia|baldness|receding|recession|mature hairline|diagnosis|diagnose|shedding|thinning)\b/i;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,84);
const safeJson = (s, fallback = []) => { try { return JSON.parse(s || ''); } catch { return fallback; } };
const clamp = (n, min, max) => Math.max(min, Math.min(max, Number(n) || 0));
const nowIso = () => new Date().toISOString();
const baseUrl = (env) => (env.SITE_URL || SITE).replace(/\/$/, '');
const adminOk = (req, env) => Boolean(env.ADMIN_TOKEN) && req.headers.get('x-admin-token') === env.ADMIN_TOKEN;
const words = (html) => String(html || '').replace(/<[^>]+>/g,' ').trim().split(/\s+/).filter(Boolean).length;
const SEO_MIN_IMPRESSIONS = 20;
const SEO_MIN_REFRESH_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const HUMAN_STYLE_RULES = `Reader-facing style rules:
- Never use em dashes. Prefer a clean period or comma.
- Keep most sentences between roughly 10 and 20 words. Split sentences that carry several independent clauses.
- Make the direct answer genuinely short: normally 2 to 4 sentences.
- Keep titles focused on one search intent. Prefer roughly 55 to 75 characters and avoid cramming secondary promises into the H1.
- Avoid canned transitions such as "The key is", "The most reliable way", "Here's how", and "It's important to note".
- Do not stack hedges such as "typically", "usually", "often", and "generally". Use one only when the distinction matters.
- Avoid repetitive symmetrical constructions and polished-sounding filler. Vary sentence and paragraph length naturally.
- Do not use quantitative precision unless it is supported by supplied evidence or explicit factual input.
- Do not use words such as "sourced", "evidence-based", "comprehensive", "landscape", "navigate", or "important limitations" as generic credibility signals.
- Do not write category descriptions as lists of abstract nouns. Say plainly what the reader will find or learn.
- Avoid title formulas such as "what the evidence actually shows", "everything you need to know", and "the ultimate guide".
- If a draft sounds machine-written, rewrite it rather than commenting on the problem.`;

function b64url(input) {
  const bytes = input instanceof Uint8Array ? input : new TextEncoder().encode(String(input));
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

function pemToPkcs8(pem) {
  const clean = String(pem || '').replace(/-----BEGIN PRIVATE KEY-----/g,'').replace(/-----END PRIVATE KEY-----/g,'').replace(/\s+/g,'');
  const bin = atob(clean);
  const bytes = new Uint8Array(bin.length);
  for (let i=0;i<bin.length;i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

async function googleAccessToken(env) {
  if (!env.GSC_SERVICE_ACCOUNT_JSON) throw new Error('GSC_SERVICE_ACCOUNT_JSON is not configured');
  const creds = JSON.parse(env.GSC_SERVICE_ACCOUNT_JSON);
  if (!creds.client_email || !creds.private_key) throw new Error('GSC service account JSON is missing client_email/private_key');
  const now = Math.floor(Date.now()/1000);
  const header = b64url(JSON.stringify({alg:'RS256',typ:'JWT'}));
  const claims = b64url(JSON.stringify({
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  }));
  const unsigned = `${header}.${claims}`;
  const key = await crypto.subtle.importKey('pkcs8', pemToPkcs8(creds.private_key), {name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'}, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned)));
  const assertion = `${unsigned}.${b64url(sig)}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method:'POST',
    headers:{'content-type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion}).toString()
  });
  const data = await res.json().catch(()=>({}));
  if (!res.ok || !data.access_token) throw new Error(`Google OAuth ${res.status}: ${JSON.stringify(data).slice(0,600)}`);
  return data.access_token;
}

function isoDay(date) { return date.toISOString().slice(0,10); }
function daysAgo(n) { const d = new Date(); d.setUTCDate(d.getUTCDate()-n); return d; }

async function syncGoogleSearchConsole(env) {
  if (!env.GSC_SERVICE_ACCOUNT_JSON) return {ok:true,skipped:'gsc_not_configured'};
  const lag = clamp(env.GSC_DATA_LAG_DAYS || 3, 2, 10);
  const lookback = clamp(env.GSC_LOOKBACK_DAYS || 28, 7, 90);
  const end = daysAgo(lag);
  const start = new Date(end); start.setUTCDate(start.getUTCDate() - (lookback - 1));
  const windowStart = isoDay(start), windowEnd = isoDay(end);
  const siteUrl = env.GSC_SITE_URL || 'sc-domain:trackmyhairloss.com';
  const token = await googleAccessToken(env);
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  const res = await fetch(endpoint, {
    method:'POST',
    headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},
    body:JSON.stringify({
      startDate:windowStart,
      endDate:windowEnd,
      dimensions:['query','page'],
      type:'web',
      dataState:'final',
      rowLimit:5000,
      aggregationType:'auto'
    })
  });
  const data = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error(`Search Console ${res.status}: ${JSON.stringify(data).slice(0,900)}`);
  const rows = data.rows || [];
  let written = 0;
  for (const r of rows) {
    const query = String(r.keys?.[0] || '').trim();
    const page = String(r.keys?.[1] || '').trim();
    if (!query || !page) continue;
    const id = await sha256(`gsc|${windowStart}|${windowEnd}|${query}|${page}`);
    await env.DB.prepare(`INSERT INTO seo_query_snapshots
      (id,source,window_start,window_end,query,page,clicks,impressions,ctr,position,observed_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)
      ON CONFLICT(source,window_start,window_end,query,page) DO UPDATE SET
        clicks=excluded.clicks, impressions=excluded.impressions, ctr=excluded.ctr, position=excluded.position, observed_at=CURRENT_TIMESTAMP`)
      .bind(id,'google_search_console',windowStart,windowEnd,query,page,Number(r.clicks||0),Number(r.impressions||0),Number(r.ctr||0),r.position==null?null:Number(r.position)).run();
    written++;
  }
  await env.DB.prepare(`INSERT INTO seo_state(key,value,updated_at) VALUES('gsc_last_sync',?,CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP`).bind(JSON.stringify({windowStart,windowEnd,rows:written})).run();
  return {ok:true,window_start:windowStart,window_end:windowEnd,rows:written};
}

function expectedCtr(position) {
  const p = Number(position || 99);
  if (p <= 3) return 0.12;
  if (p <= 5) return 0.07;
  if (p <= 10) return 0.035;
  if (p <= 20) return 0.015;
  return 0.008;
}

async function latestGscRows(env, limit=250) {
  const latest = await env.DB.prepare(`SELECT MAX(window_end) AS d FROM seo_query_snapshots WHERE source='google_search_console'`).first();
  if (!latest?.d) return [];
  return (await env.DB.prepare(`SELECT source,window_start,window_end,query,page,clicks,impressions,ctr,position,observed_at
    FROM seo_query_snapshots WHERE source='google_search_console' AND window_end=? ORDER BY impressions DESC LIMIT ?`).bind(latest.d,limit).all()).results || [];
}

async function analyzeSeoFeedback(env) {
  const rows = await latestGscRows(env,500);
  if (!rows.length) return {ok:true,skipped:'no_gsc_data',actions:0};
  const pages = (await env.DB.prepare(`SELECT slug,title,target_query,content_type,safety_tier,status,updated_at FROM content_pages WHERE status='published'`).all()).results || [];
  const byPath = new Map(pages.map(p=>[new URL(contentPath(p),baseUrl(env)).toString(),p]));
  let proposed = 0;
  for (const r of rows) {
    const page = byPath.get(r.page.replace(/\/$/,'')) || byPath.get(r.page) || null;
    if (!page || Number(r.impressions||0) < SEO_MIN_IMPRESSIONS) continue;
    const ctr = Number(r.ctr||0), pos = Number(r.position||99), exp = expectedCtr(pos);
    const stale = !page.updated_at || Date.now() - Date.parse(page.updated_at) >= SEO_MIN_REFRESH_AGE_MS;
    if (!stale) continue;
    let actionType = null, score = 0, reason = '';
    if (pos >= 3 && pos <= 15 && ctr < exp * 0.65) {
      actionType = 'snippet_refresh';
      score = Math.min(10, (Number(r.impressions||0)/40) + Math.max(0,15-pos)/3 + (exp-Math.max(ctr,0))*40);
      reason = `High-impression near-page-one query with CTR ${ctr.toFixed(3)} below expected ${exp.toFixed(3)} at avg position ${pos.toFixed(1)}.`;
    } else if (pos > 10 && pos <= 30 && Number(r.impressions||0) >= 35) {
      actionType = 'content_refresh';
      score = Math.min(10, Number(r.impressions||0)/35 + (30-pos)/5);
      reason = `Meaningful impressions at avg position ${pos.toFixed(1)} suggest the page is relevant but not yet competitive.`;
    }
    if (!actionType) continue;
    const existing = await env.DB.prepare(`SELECT 1 FROM seo_actions WHERE page=? AND query=? AND action_type=? AND status IN ('proposed','executed','review') AND created_at > datetime('now','-14 days') LIMIT 1`).bind(r.page,r.query,actionType).first();
    if (existing) continue;
    await env.DB.prepare(`INSERT INTO seo_actions(id,page,slug,query,action_type,score,reason,details_json,status)
      VALUES (?,?,?,?,?,?,?,?,?)`).bind(crypto.randomUUID(),r.page,page.slug,r.query,actionType,score,reason,JSON.stringify({clicks:r.clicks,impressions:r.impressions,ctr:r.ctr,position:r.position,window_start:r.window_start,window_end:r.window_end}),page.safety_tier==='medical'?'review':'proposed').run();
    proposed++;
  }
  return {ok:true,actions:proposed,rows_considered:rows.length};
}

function seoRefreshSchema() {
  return {type:'object',properties:{title:{type:'string'},description:{type:'string'},answer_summary:{type:'string'},notes:{type:'string'}},required:['title','description','answer_summary','notes']};
}

async function executeOneSeoRefresh(env) {
  if (String(env.SEO_AUTOPILOT).toLowerCase() !== 'true') return {ok:true,skipped:'seo_autopilot_off'};
  const lastState = await env.DB.prepare(`SELECT value FROM seo_state WHERE key='last_auto_refresh' LIMIT 1`).first();
  if (lastState?.value && Date.now() - Date.parse(lastState.value) < 7*24*60*60*1000) return {ok:true,skipped:'weekly_refresh_not_due'};
  const action = await env.DB.prepare(`SELECT * FROM seo_actions WHERE status='proposed' ORDER BY score DESC,created_at ASC LIMIT 1`).first();
  if (!action) return {ok:true,skipped:'no_action'};
  const page = await env.DB.prepare(`SELECT * FROM content_pages WHERE slug=? AND status='published' LIMIT 1`).bind(action.slug).first();
  if (!page) {
    await env.DB.prepare(`UPDATE seo_actions SET status='skipped',executed_at=CURRENT_TIMESTAMP WHERE id=?`).bind(action.id).run();
    return {ok:false,skipped:'page_missing'};
  }
  if (page.safety_tier==='medical' && String(env.SEO_REFRESH_MEDICAL).toLowerCase()!=='true') {
    await env.DB.prepare(`UPDATE seo_actions SET status='review' WHERE id=?`).bind(action.id).run();
    return {ok:true,skipped:'medical_requires_review',action_id:action.id};
  }
  const system = `You are the search editor for TrackMyHairLoss.com. Improve a published page's search snippet and direct-answer framing using real Search Console feedback. Do not invent new facts. Preserve the article's actual meaning. Do not add medical claims that are absent from the supplied page. Avoid clickbait, keyword stuffing, and title changes that make the body less accurate.`;
  const user = `SEARCH CONSOLE OPPORTUNITY:\nQuery: ${action.query}\nReason: ${action.reason}\nMetrics: ${action.details_json}\n\nCURRENT PAGE:\nTitle: ${page.title}\nTarget query: ${page.target_query}\nDescription: ${page.description}\nDirect answer: ${page.answer_summary}\nBody text excerpt: ${String(page.body_html||'').replace(/<[^>]+>/g,' ').slice(0,6500)}\n\nReturn a revised title, meta description (<=155 chars), and direct answer that better satisfy the observed query while remaining faithful to this exact page. A title change is optional; keep the current title if already strong.`;
  const out = await aiJson(env,seoRefreshSchema(),system,user,{maxTokens:1800,temperature:0.1,reasoningEffort:'high'});
  const newTitle = String(out.title||page.title).trim().slice(0,180);
  const newDescription = String(out.description||page.description).trim().slice(0,155);
  const newAnswer = String(out.answer_summary||page.answer_summary).trim().slice(0,1200);
  await env.DB.prepare(`UPDATE content_pages SET title=?,description=?,answer_summary=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(newTitle,newDescription,newAnswer,page.id).run();
  await env.DB.prepare(`UPDATE seo_actions SET status='executed',details_json=?,executed_at=CURRENT_TIMESTAMP WHERE id=?`).bind(JSON.stringify({...safeJson(action.details_json,{}),editor_notes:out.notes,before:{title:page.title,description:page.description,answer_summary:page.answer_summary},after:{title:newTitle,description:newDescription,answer_summary:newAnswer}}),action.id).run();
  await env.DB.prepare(`INSERT INTO seo_state(key,value,updated_at) VALUES('last_auto_refresh',?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP`).bind(nowIso()).run();
  await afterPublish(env,contentPath(page));
  return {ok:true,action_id:action.id,slug:page.slug,query:action.query,title:newTitle};
}

async function runSeoFeedbackLoop(env) {
  const sync = await syncGoogleSearchConsole(env).catch(e=>({ok:false,error:e?.message||String(e)}));
  const analysis = await analyzeSeoFeedback(env).catch(e=>({ok:false,error:e?.message||String(e)}));
  const refresh = await executeOneSeoRefresh(env).catch(e=>({ok:false,error:e?.message||String(e)}));
  return {ok:Boolean(sync.ok && analysis.ok && refresh.ok),sync,analysis,refresh};
}

async function enqueueOperatorJob(env, mode, payload={}) {
  const id = `operator:${crypto.randomUUID()}`;
  await env.DB.prepare(`INSERT INTO content_runs (id,mode,stage,status,details_json) VALUES (?,?,?,?,?)`)
    .bind(id,mode,'queued','queued',JSON.stringify({requested_at:nowIso(),payload})).run();
  return {id,mode,status:'queued'};
}

async function recentOperatorJobs(env, limit=8) {
  const rows = (await env.DB.prepare(`SELECT id,mode,stage,status,details_json,created_at
    FROM content_runs WHERE mode IN ('operator_generate','operator_seo')
    ORDER BY created_at DESC LIMIT ?`).bind(limit).all()).results || [];
  return rows.map(r=>({...r,details:safeJson(r.details_json,{})}));
}

async function recentSeoActions(env, limit=25) {
  const rows = (await env.DB.prepare(`SELECT id,page,slug,query,action_type,score,reason,status,details_json,created_at,executed_at
    FROM seo_actions ORDER BY created_at DESC LIMIT ?`).bind(limit).all()).results || [];
  return rows.map(r=>({...r,details:safeJson(r.details_json,{})}));
}

async function claimOperatorJob(env, jobId=null) {
  const job = jobId
    ? await env.DB.prepare(`SELECT id,mode,details_json FROM content_runs
        WHERE id=? AND mode IN ('operator_generate','operator_seo') AND status='queued' LIMIT 1`).bind(jobId).first()
    : await env.DB.prepare(`SELECT id,mode,details_json FROM content_runs
        WHERE mode IN ('operator_generate','operator_seo') AND status='queued'
        ORDER BY created_at ASC LIMIT 1`).first();
  if (!job) return null;
  const claimed = await env.DB.prepare(`UPDATE content_runs SET stage='running',status='running'
    WHERE id=? AND status='queued'`).bind(job.id).run();
  return claimed?.meta?.changes ? job : null;
}

async function runOperatorJob(env, job) {
  const details = safeJson(job.details_json,{});
  try {
    let result;
    if (job.mode === 'operator_generate') {
      const p = details.payload || {};
      result = await generateOne(env,{mode:'manual',preferredType:p.preferredType||null,brief:p.brief||'',forcePublish:false});
    } else {
      result = await runSeoFeedbackLoop(env);
    }
    await env.DB.prepare(`UPDATE content_runs SET stage='complete',status=?,details_json=? WHERE id=?`)
      .bind(result?.ok===false?'error':'ok',JSON.stringify({...details,completed_at:nowIso(),result}),job.id).run();
    return {ok:result?.ok!==false,job_id:job.id,result};
  } catch (error) {
    await env.DB.prepare(`UPDATE content_runs SET stage='error',status='error',details_json=? WHERE id=?`)
      .bind(JSON.stringify({...details,completed_at:nowIso(),error:error?.message||String(error)}),job.id).run();
    return {ok:false,job_id:job.id,error:error?.message||String(error)};
  }
}

async function drainOperatorJobs(env, jobId=null) {
  const job = await claimOperatorJob(env,jobId);
  if (!job) return {ok:true,skipped:jobId?'already_claimed':'no_operator_jobs'};
  return runOperatorJob(env,job);
}

function decodeXml(s='') {
  return String(s)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&')
    .replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
}

function sanitizeHtml(html='') {
  // Drop scripts/styles/comments first.
  let out = String(html)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
  // Keep only a tiny semantic tag set and remove every attribute.
  out = out.replace(/<\/?([a-z0-9]+)(?:\s[^>]*)?>/gi, (m, tag) => {
    const t = String(tag).toLowerCase();
    if (!ALLOWED_BODY_TAGS.has(t)) return '';
    return m.startsWith('</') ? `</${t}>` : `<${t}>`;
  });
  return out;
}

function unwrapAI(resp) {
  // Workers AI has two common response shapes. Older/native JSON-mode models
  // return { response: <object|string> }; OpenAI-compatible chat models such
  // as GLM-5.3 return { choices:[{message:{content|parsed}}] }. Support both.
  if (resp?.response !== undefined) {
    const v = resp.response;
    return typeof v === 'string' ? JSON.parse(v) : v;
  }
  const message = resp?.choices?.[0]?.message;
  if (message?.parsed && typeof message.parsed === 'object') return message.parsed;
  if (typeof message?.content === 'string' && message.content.trim()) return JSON.parse(message.content);
  if (typeof resp === 'string') return JSON.parse(resp);
  if (resp && typeof resp === 'object' && !resp.choices) return resp;
  throw new Error(`Unexpected Workers AI response shape: ${JSON.stringify(resp).slice(0,1200)}`);
}

async function aiJson(env, schema, system, user, options={}) {
  try {
    const result = await env.AI.run(MODEL, {
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      response_format: { type: 'json_schema', json_schema: schema },
      max_completion_tokens: options.maxTokens || 5000,
      temperature: options.temperature ?? 0.35,
      reasoning_effort: options.reasoningEffort || 'high'
    });
    return unwrapAI(result);
  } catch (error) {
    const msg = error?.stack || error?.message || String(error);
    console.error('workers_ai_error', msg);
    throw new Error(`Workers AI (${MODEL}) failed: ${error?.message || String(error)}`);
  }
}

async function aiJsonObject(env, system, user, options={}) {
  try {
    const result = await env.AI.run(MODEL, {
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: options.maxTokens || 5000,
      temperature: options.temperature ?? 0.25,
      reasoning_effort: options.reasoningEffort || 'high'
    });
    return unwrapAI(result);
  } catch (error) {
    const msg = error?.stack || error?.message || String(error);
    console.error('workers_ai_json_object_error', msg);
    throw new Error(`Workers AI (${MODEL}) JSON-object fallback failed: ${error?.message || String(error)}`);
  }
}

function normalizePlanCandidate(c={}) {
  const allowedTypes = new Set(['tracking_guide','treatment_comparison','treatment_profile','question']);
  const title = String(c.suggested_title || c.title || '').trim();
  const query = String(c.target_query || c.query || '').trim();
  if (!title || !query) return null;
  let contentType = allowedTypes.has(c.content_type) ? c.content_type : (MEDICAL_HINT.test(`${title} ${query}`) ? 'treatment_comparison' : 'question');
  const forcedMedical = ['treatment_comparison','treatment_profile'].includes(contentType) || MEDICAL_HINT.test(`${title} ${query}`);
  const rq = Array.isArray(c.research_queries) ? c.research_queries.map(String).map(x=>x.trim()).filter(Boolean).slice(0,4) : [];
  if (!rq.length) rq.push(query);
  const rawTerms = Array.isArray(c.drug_terms) ? c.drug_terms : [];
  const drugTerms = rawTerms.slice(0,4).map(t => {
    if (typeof t === 'string') return {name:t.trim(), route:'none'};
    const route = ['oral','topical','procedural','other','none'].includes(t?.route) ? t.route : 'none';
    return {name:String(t?.name || '').trim(), route};
  }).filter(t=>t.name);
  return {
    suggested_title:title,
    target_query:query,
    content_type:contentType,
    safety_tier:forcedMedical ? 'medical' : 'standard',
    rationale:String(c.rationale || '').trim(),
    research_queries:rq,
    drug_terms:drugTerms,
    score_utility:clamp(c.score_utility ?? 7,0,10),
    score_search:clamp(c.score_search ?? 7,0,10),
    score_originality:clamp(c.score_originality ?? 7,0,10),
    score_product_fit:clamp(c.score_product_fit ?? 6,0,10),
    score_evidence:clamp(c.score_evidence ?? 7,0,10)
  };
}

function plannerSchema() {
  const candidate = {
    type: 'object',
    properties: {
      suggested_title: { type: 'string' },
      target_query: { type: 'string' },
      content_type: { type: 'string', enum: ['tracking_guide','treatment_comparison','treatment_profile','question'] },
      safety_tier: { type: 'string', enum: ['standard','medical'] },
      rationale: { type: 'string' },
      research_queries: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 4 },
      drug_terms: { type: 'array', items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          route: { type: 'string', enum: ['oral','topical','procedural','other','none'] }
        },
        required: ['name','route']
      }, maxItems: 4 },
      score_utility: { type: 'number' },
      score_search: { type: 'number' },
      score_originality: { type: 'number' },
      score_product_fit: { type: 'number' },
      score_evidence: { type: 'number' }
    },
    required: ['suggested_title','target_query','content_type','safety_tier','rationale','research_queries','drug_terms','score_utility','score_search','score_originality','score_product_fit','score_evidence']
  };
  return { type: 'object', properties: { candidates: { type: 'array', minItems: 8, maxItems: 12, items: candidate } }, required: ['candidates'] };
}

function writerSchema() {
  return {
    type: 'object',
    properties: {
      title: { type: 'string' },
      slug: { type: 'string' },
      dek: { type: 'string' },
      description: { type: 'string' },
      answer_summary: { type: 'string' },
      body_html: { type: 'string' },
      faq: { type: 'array', minItems: 3, maxItems: 6, items: {
        type: 'object', properties: { q: { type: 'string' }, a: { type: 'string' } }, required: ['q','a']
      }},
      related_tool_paths: { type: 'array', minItems: 1, maxItems: 3, items: { type: 'string' } },
      source_ids_used: { type: 'array', items: { type: 'string' } }
    },
    required: ['title','slug','dek','description','answer_summary','body_html','faq','related_tool_paths','source_ids_used']
  };
}

function editorSchema() {
  return {
    type: 'object',
    properties: {
      verdict: { type: 'string', enum: ['publish','revise','reject'] },
      notes: { type: 'string' },
      title: { type: 'string' },
      dek: { type: 'string' },
      description: { type: 'string' },
      answer_summary: { type: 'string' },
      body_html: { type: 'string' },
      faq: { type: 'array', minItems: 3, maxItems: 6, items: {
        type: 'object', properties: { q: { type: 'string' }, a: { type: 'string' } }, required: ['q','a']
      }},
      source_ids_used: { type: 'array', items: { type: 'string' } }
    },
    required: ['verdict','notes','title','dek','description','answer_summary','body_html','faq','source_ids_used']
  };
}

async function loadEditorialContext(env) {
  const posts = (await env.DB.prepare(`
    SELECT slug,title,target_query,content_type,published_at,status,updated_at
    FROM content_pages
    ORDER BY created_at DESC LIMIT ?
  `).bind(MAX_EXISTING_CONTEXT).all()).results || [];
  const manualSignals = (await env.DB.prepare(`
    SELECT source,query,page,clicks,impressions,position,citations,observed_at
    FROM search_signals
    ORDER BY observed_at DESC, impressions DESC LIMIT 40
  `).all()).results || [];
  let gsc = [];
  try {
    const latest = await latestGscRows(env,80);
    gsc = latest.map(r=>({source:'google_search_console',query:r.query,page:r.page,clicks:r.clicks,impressions:r.impressions,position:r.position,citations:0,observed_at:r.window_end,ctr:r.ctr}));
  } catch {}
  const signals = [...gsc,...manualSignals].slice(0,100);
  const recentCandidates = (await env.DB.prepare(`
    SELECT suggested_title,target_query,content_type,safety_tier,status,created_at
    FROM topic_candidates
    ORDER BY created_at DESC LIMIT 80
  `).all()).results || [];
  return { posts, signals, recentCandidates };
}

async function plan(env, preferredType=null, brief='') {
  const context = await loadEditorialContext(env);
  const system = `You are the managing editor and search strategist for TrackMyHairLoss.com, a useful hair-progress utility site connected to the Baldwin iPhone app. You choose what to publish; you do not write the article yet. Optimize for user satisfaction, information gain, traditional search, and citation-worthiness in AI answers. Do not create keyword permutations, doorway pages, thin listicles, or near-duplicates. Treatment topics are allowed, including direct comparisons, but must be framed as evidence-based educational comparisons rather than personalized prescribing.`;
  const user = `EDITORIAL TERRITORY (broad boundaries, not a topic list):\n${EDITORIAL_PILLARS.map(x=>'- '+x).join('\n')}\n\nAVAILABLE TOOLS:\n${TOOLS.map(t=>`- ${t.name} (${t.path}): ${t.intent}`).join('\n')}\n\nEXISTING/RECENT CONTENT:\n${JSON.stringify(context.posts)}\n\nRECENTLY PROPOSED/SELECTED/REJECTED TOPICS (do not recycle these):\n${JSON.stringify(context.recentCandidates)}\n\nSEARCH + AI VISIBILITY SIGNALS (may be empty early on):\n${JSON.stringify(context.signals)}\n\n${preferredType ? `Preferred content type for this run: ${preferredType}.` : ''}\n${brief ? `Additional editorial brief from the operator: ${brief}` : ''}\n\nGenerate EXACTLY 10 genuinely distinct candidates even if search-signal data is empty. Empty candidates are invalid. Prefer a concrete question a real user would ask. For treatment comparisons, propose neutral research queries suitable for PubMed and list drug/procedure terms separately. Mark all treatment_comparison and treatment_profile candidates safety_tier=medical. Standard tracking/process pieces are safety_tier=standard. Score each dimension 0-10. Search score should reflect plausible intent, not made-up volume. Evidence score should reflect how likely the question is to be answerable from credible primary/authoritative sources. Avoid topics substantially covered by existing content.`;

  const attempts = [];
  const first = await aiJson(env, plannerSchema(), system, user, {maxTokens:5200, temperature:0.35, reasoningEffort:'high'});
  attempts.push({mode:'schema', count:Array.isArray(first?.candidates) ? first.candidates.length : 0});
  let rawCandidates = Array.isArray(first?.candidates) ? first.candidates : [];

  if (rawCandidates.length < 8) {
    const retryUser = `${user}\n\nCRITICAL RETRY: Your previous plan contained only ${rawCandidates.length} candidates. Return exactly 10 candidate objects now. Do not return an empty array. Do not explain your answer outside the JSON.`;
    const retry = await aiJson(env, plannerSchema(), system, retryUser, {maxTokens:6200, temperature:0.18, reasoningEffort:'high'});
    attempts.push({mode:'schema_retry', count:Array.isArray(retry?.candidates) ? retry.candidates.length : 0});
    if (Array.isArray(retry?.candidates) && retry.candidates.length > rawCandidates.length) rawCandidates = retry.candidates;
  }

  if (rawCandidates.length < 5) {
    const looseUser = `${user}\n\nReturn one JSON object with a "candidates" array containing exactly 10 objects. Each object must include: suggested_title, target_query, content_type, safety_tier, rationale, research_queries, drug_terms, score_utility, score_search, score_originality, score_product_fit, score_evidence. This is mandatory; an empty array is not acceptable.`;
    const loose = await aiJsonObject(env, system, looseUser, {maxTokens:6500, temperature:0.15, reasoningEffort:'high'});
    attempts.push({mode:'json_object_fallback', count:Array.isArray(loose?.candidates) ? loose.candidates.length : 0});
    if (Array.isArray(loose?.candidates) && loose.candidates.length > rawCandidates.length) rawCandidates = loose.candidates;
  }

  const seen = new Set();
  const normalized = [];
  for (const raw of rawCandidates) {
    const c = normalizePlanCandidate(raw);
    if (!c) continue;
    const key = `${c.target_query.toLowerCase()}|${c.suggested_title.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const scores = ['score_utility','score_search','score_originality','score_product_fit','score_evidence'].map(k=>clamp(c[k],0,10));
    const total = scores[0]*0.28 + scores[1]*0.20 + scores[2]*0.20 + scores[3]*0.12 + scores[4]*0.20;
    normalized.push({...c,total_score:Math.round(total*100)/100});
  }
  const candidates = normalized.sort((a,b)=>b.total_score-a.total_score).slice(0,12);
  if (!candidates.length) {
    console.error('planner_empty_after_retries', JSON.stringify(attempts));
    throw new Error(`Planner returned no usable candidates after retries: ${JSON.stringify(attempts)}`);
  }

  for (const c of candidates) {
    await env.DB.prepare(`INSERT INTO topic_candidates
      (id,suggested_title,target_query,content_type,safety_tier,rationale,research_queries_json,drug_terms_json,
       score_utility,score_search,score_originality,score_product_fit,score_evidence,total_score,status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,'proposed')`)
      .bind(crypto.randomUUID(), c.suggested_title, c.target_query, c.content_type, c.safety_tier, c.rationale || '',
        JSON.stringify(c.research_queries || []), JSON.stringify(c.drug_terms || []),
        c.score_utility,c.score_search,c.score_originality,c.score_product_fit,c.score_evidence,c.total_score).run();
  }
  console.log('planner_ok', JSON.stringify({attempts, final_count:candidates.length, top:candidates[0]?.target_query}));
  return candidates;
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'TrackMyHairLoss research worker/3.0',
      'accept': 'application/json'
    }
  });
  if (!res.ok) {
    const body = (await res.text().catch(()=>'' )).slice(0,500);
    throw new Error(`Fetch ${res.status}: ${url}${body ? ` :: ${body}` : ''}`);
  }
  return res.json();
}

function cleanResearchText(value) {
  return decodeXml(String(value || '').replace(/<[^>]*>/g,' '))
    .replace(/\s+/g,' ')
    .trim();
}

async function europePmcSources(query, max=6) {
  // Europe PMC exposes PubMed-indexed (SRC:MED) records and abstracts without an API key.
  // It is the primary literature transport because Cloudflare egress can be rate-limited
  // unpredictably by NCBI when no NCBI API key is supplied.
  const term = encodeURIComponent(`SRC:MED AND (${query})`);
  const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${term}&format=json&resultType=core&pageSize=${max}`;
  const data = await fetchJson(url);
  const rows = data?.resultList?.result || [];
  return rows.map(r => {
    const pmid = String(r.pmid || (r.source === 'MED' ? r.id || r.extId || '' : '')).trim();
    if (!pmid) return null;
    const pubTypes = r.pubTypeList?.pubType || [];
    return {
      kind:'pubmed',
      transport:'europe_pmc',
      pmid,
      title:cleanResearchText(r.title) || `PubMed ${pmid}`,
      journal:cleanResearchText(r.journalTitle || r.journalInfo?.journal?.title || ''),
      published:r.firstPublicationDate || r.firstIndexDate || r.pubYear || '',
      doi:r.doi || '',
      url:`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      excerpt:cleanResearchText(r.abstractText).slice(0,7000),
      publication_types:Array.isArray(pubTypes) ? pubTypes.slice(0,12) : [],
      cited_by_count:Number(r.citedByCount || 0)
    };
  }).filter(Boolean);
}

async function pubmedSources(query, env, max=5) {
  const tool = encodeURIComponent(env.NCBI_TOOL || 'trackmyhairloss');
  const email = encodeURIComponent(env.NCBI_EMAIL || 'publisher@example.com');
  const apiKey = env.NCBI_API_KEY ? `&api_key=${encodeURIComponent(env.NCBI_API_KEY)}` : '';
  const evidenceQuery = `(${query}) AND (systematic review[pt] OR meta-analysis[pt] OR randomized controlled trial[pt] OR clinical trial[pt] OR review[pt])`;
  const doSearch = async (term) => {
    const q = encodeURIComponent(term);
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=${max}&sort=relevance&tool=${tool}&email=${email}${apiKey}&term=${q}`;
    const sr = await fetchJson(searchUrl);
    await sleep(env.NCBI_API_KEY ? 120 : 400);
    return sr?.esearchresult?.idlist || [];
  };
  let ids = await doSearch(evidenceQuery);
  if (ids.length < 2) ids = [...new Set([...ids, ...(await doSearch(query))])].slice(0,max);
  if (!ids.length) return [];
  const idCsv = ids.join(',');
  const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&tool=${tool}&email=${email}${apiKey}&id=${idCsv}`;
  const summaries = await fetchJson(summaryUrl);
  await sleep(env.NCBI_API_KEY ? 120 : 400);
  const abstractUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&rettype=abstract&retmode=xml&tool=${tool}&email=${email}${apiKey}&id=${idCsv}`;
  const abstractRes = await fetch(abstractUrl, { headers: { 'user-agent':'TrackMyHairLoss research worker/3.0' } });
  if (!abstractRes.ok) throw new Error(`NCBI EFetch ${abstractRes.status}: ${(await abstractRes.text().catch(()=>'' )).slice(0,300)}`);
  const xml = await abstractRes.text();
  const blocks = [...xml.matchAll(/<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g)];
  const abstractById = new Map();
  for (const m of blocks) {
    const block = m[1];
    const pmid = (block.match(/<PMID[^>]*>([^<]+)<\/PMID>/) || [])[1];
    const abs = [...block.matchAll(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g)]
      .map(x=>cleanResearchText(x[1])).filter(Boolean).join(' ');
    if (pmid) abstractById.set(pmid, abs.slice(0,7000));
  }
  return ids.map(id => {
    const s = summaries?.result?.[id] || {};
    const articleIds = s.articleids || [];
    const doi = articleIds.find(x=>x.idtype==='doi')?.value || '';
    return {
      kind:'pubmed', transport:'ncbi_eutils', pmid:id, title:s.title || `PubMed ${id}`, journal:s.fulljournalname || s.source || '',
      published:s.pubdate || '', doi, url:`https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      excerpt: abstractById.get(id) || ''
    };
  }).filter(x=>x.excerpt || x.title);
}

async function fdaSource(term) {
  const name = String(term?.name || '').trim();
  if (!name) return null;
  const route = term?.route && !['none','procedural','other'].includes(term.route) ? term.route.toUpperCase() : '';
  const pieces = [`openfda.generic_name:\"${name.replace(/\"/g,'')}\"`];
  if (route) pieces.push(`openfda.route:\"${route}\"`);
  const query = encodeURIComponent(pieces.join(' AND '));
  const api = `https://api.fda.gov/drug/label.json?search=${query}&limit=1`;
  try {
    const data = await fetchJson(api);
    const r = data?.results?.[0];
    if (!r) return null;
    const setid = r.set_id || r.openfda?.spl_set_id?.[0] || '';
    const fields = {
      indications_and_usage: (r.indications_and_usage || []).join(' ').slice(0,5000),
      purpose: (r.purpose || []).join(' ').slice(0,3000),
      warnings: [...(r.boxed_warning||[]), ...(r.warnings||[]), ...(r.warnings_and_cautions||[])].join(' ').slice(0,6500),
      adverse_reactions: (r.adverse_reactions || []).join(' ').slice(0,5000),
      dosage_and_administration: (r.dosage_and_administration || []).join(' ').slice(0,3500),
      route: r.openfda?.route || [],
      brand: r.openfda?.brand_name || [],
      generic: r.openfda?.generic_name || []
    };
    return {
      kind:'fda', title:`Current U.S. labeling: ${name}${route ? ` (${route.toLowerCase()})` : ''}`,
      url:setid ? `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${encodeURIComponent(setid)}` : 'https://open.fda.gov/apis/drug/label/',
      published:r.effective_time || '', setid, excerpt:JSON.stringify(fields)
    };
  } catch { return null; }
}

async function research(env, candidate) {
  if (candidate.safety_tier !== 'medical') return [];
  const collected = [];
  const queries = [...new Set((candidate.research_queries || []).filter(Boolean))].slice(0,3);
  for (const q of queries) {
    let epmc = [];
    try {
      epmc = await europePmcSources(q, 6);
      collected.push(...epmc);
    } catch (e) {
      console.log('europe_pmc_error', q, String(e));
    }
    // NCBI is redundant. Prefer calling it when Europe PMC is thin or an API key is configured.
    if (epmc.length < 3 || env.NCBI_API_KEY) {
      try { collected.push(...await pubmedSources(q, env, 5)); }
      catch (e) { console.log('pubmed_error', q, String(e)); }
    }
  }
  for (const term of (candidate.drug_terms || []).slice(0,4)) {
    const s = await fdaSource(term);
    if (s) collected.push(s);
  }
  const seen = new Set();
  const deduped = [];
  for (const x of collected) {
    const key = x.kind === 'pubmed' ? `p:${x.pmid}` : `f:${x.setid || x.title}`;
    if (seen.has(key)) continue;
    seen.add(key); deduped.push(x);
  }
  // Prefer literature records with abstracts, then higher citation counts, while preserving FDA labels.
  deduped.sort((a,b)=>{
    if (a.kind !== b.kind) return a.kind === 'pubmed' ? -1 : 1;
    if (a.kind === 'pubmed') return Number(Boolean(b.excerpt))-Number(Boolean(a.excerpt)) || Number(b.cited_by_count||0)-Number(a.cited_by_count||0);
    return 0;
  });
  return deduped.slice(0,16).map((x,i)=>({ ...x, id: `${x.kind==='pubmed'?'P':'F'}${i+1}` }));
}

async function researchProbe(env, query) {
  const diagnostics = {};
  let europe = [], ncbi = [];
  try { europe = await europePmcSources(query, 8); diagnostics.europe_pmc = {ok:true,count:europe.length}; }
  catch (e) { diagnostics.europe_pmc = {ok:false,error:String(e)}; }
  try { ncbi = await pubmedSources(query, env, 8); diagnostics.ncbi_eutils = {ok:true,count:ncbi.length,api_key:Boolean(env.NCBI_API_KEY)}; }
  catch (e) { diagnostics.ncbi_eutils = {ok:false,error:String(e),api_key:Boolean(env.NCBI_API_KEY)}; }
  const merged = []; const seen = new Set();
  for (const x of [...europe,...ncbi]) { if (!seen.has(x.pmid)) { seen.add(x.pmid); merged.push(x); } }
  return {ok:true,query,diagnostics,sources:publicSources(merged.slice(0,12))};
}

function evidenceForModel(sources) {
  return sources.map(s=>({ id:s.id, kind:s.kind, title:s.title, journal:s.journal, published:s.published, url:s.url, excerpt:s.excerpt })).map(x=>JSON.stringify(x)).join('\n');
}

function publicSources(sources) {
  return sources.map(({id,kind,title,journal,published,url,pmid,doi})=>({id,kind,title,journal,published,url,pmid,doi}));
}

async function writeDraft(env, candidate, sources) {
  const medical = candidate.safety_tier === 'medical';
  const system = `You are a rigorous consumer-health editor writing for TrackMyHairLoss.com. Produce original, useful, direct prose. Do not write SEO filler. The first paragraph and answer_summary should answer the target query plainly enough to stand alone in a search or AI answer. ${medical ? 'This is medical-adjacent consumer education. Every claim about efficacy, adverse effects, indications, regulatory status, comparative outcomes, or treatment timelines must be supported by one or more supplied evidence IDs in square brackets, e.g. [P1] or [F3]. Never rely on unstated medical knowledge. Never prescribe a treatment to an individual.' : 'Stay within tracking, photography, organization, and comparison methodology; do not drift into treatment efficacy or diagnosis.'}\n\n${HUMAN_STYLE_RULES}`;
  const user = `TARGET QUERY: ${candidate.target_query}\nPROPOSED ANGLE: ${candidate.suggested_title}\nCONTENT TYPE: ${candidate.content_type}\nRATIONALE: ${candidate.rationale}\n\nTOOLS YOU MAY LINK TO BY PATH:\n${TOOLS.map(t=>`${t.path} — ${t.name}: ${t.intent}`).join('\n')}\n\n${medical ? `EVIDENCE PACKET — THIS IS THE ONLY MEDICAL EVIDENCE YOU MAY USE:\n${evidenceForModel(sources)}` : ''}\n\nREQUIREMENTS:\n- 1,100-1,800 useful words unless the question is answered better with less.\n- Avoid generic introductions. Start with the answer.\n- Use descriptive H2/H3 headings that match actual reader subquestions.\n- For comparisons, include a compact HTML table near the top comparing the decision dimensions that the evidence supports. Do not force a winner.\n- Explain evidence quality/limitations when relevant.\n- Distinguish FDA-approved indications from off-label use when evidence packet allows that conclusion.\n- Do not tell a reader to start, stop, increase, decrease, combine, or switch a drug.\n- Do not create dosing instructions beyond accurately describing supplied label information when directly necessary.\n- Do not invent statistics, trial outcomes, mechanisms, side effects, timelines, citations, or expert quotes.\n- Use citation markers exactly like [P1] [F2] immediately after supported medical claims. Multiple markers are allowed.\n- Include a short section explaining what a reader could track over time if relevant.\n- Link selection is returned separately in related_tool_paths; do not write external links into body_html.\n- body_html may use only p,h2,h3,ul,ol,li,strong,em,table,thead,tbody,tr,th,td. No attributes.\n- FAQ answers must be concise and directly answer the question.\n- description <= 155 characters. dek <= 240 characters.\n- Title should be specific, natural and non-clickbait. No year suffix unless recency is intrinsically relevant.
- Do not mention AI, an evidence packet, an editor, our methodology, our publishing process, or phrases such as 'source-grounded' in reader-facing copy. Present the information and citations directly.
- Never use title formulas such as 'what the evidence actually shows', 'everything you need to know', or 'the ultimate guide'.`;
  return aiJson(env, writerSchema(), system, user, {maxTokens:7000, temperature:0.32, reasoningEffort:'high'});
}

async function editDraft(env, candidate, sources, draft) {
  const medical = candidate.safety_tier === 'medical';
  const system = `You are the final hostile editor for TrackMyHairLoss.com. Your job is to reject unsupported, repetitive, vague, manipulative or medically overconfident copy. Preserve useful specificity. ${medical ? 'Audit every medical claim against the evidence packet. A claim without support in the packet must be removed or softened to a non-medical statement. Citation markers must identify evidence that actually supports the immediately preceding claim.' : 'Reject drift into diagnosis or treatment recommendations.'}\n\n${HUMAN_STYLE_RULES}
Act as a line editor, not a scorer. Rewrite synthetic cadence, awkward punctuation, bloated sentences, and keyword-stuffed titles before returning the cleaned full version. A publish verdict means the returned copy itself follows these style rules.`;
  const user = `${medical ? `EVIDENCE PACKET:\n${evidenceForModel(sources)}\n\n` : ''}CANDIDATE:\n${JSON.stringify(candidate)}\n\nDRAFT:\n${JSON.stringify(draft)}\n\nEDITORIAL CHECKS:\n1. Does the page answer its target query immediately and clearly?\n2. Is there meaningful information gain beyond generic search-result paraphrase?\n3. Does every medical efficacy/safety/regulatory claim have an evidence marker whose source actually supports it?\n4. Does the copy avoid individualized treatment recommendations?\n5. Does it avoid invented numbers, fake certainty, filler, keyword repetition and boilerplate?\n6. Are headings useful as standalone retrieval chunks for search/AI systems?\n7. Are FAQs non-duplicative and actually useful?\n8. For a comparison, is the table neutral and supported rather than declaring an unsupported winner?\n\nReturn a cleaned full version. verdict=publish only if it is safe and supportable; verdict=revise if useful but still requires human review; verdict=reject if evidence is inadequate or the premise is misleading.`;
  return aiJson(env, editorSchema(), system, user, {maxTokens:7600, temperature:0.15, reasoningEffort:'high'});
}

function normalizeToolPaths(paths=[]) {
  const allowed = new Set(TOOLS.map(t=>t.path));
  const clean = paths.filter(p=>allowed.has(p));
  return clean.length ? [...new Set(clean)].slice(0,3) : ['/comparator/'];
}

async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');
}

async function uniqueSlug(env, base) {
  let s = slugify(base) || `field-note-${Date.now()}`;
  for (let i=0;i<5;i++) {
    const hit = await env.DB.prepare('SELECT 1 FROM content_pages WHERE slug=? LIMIT 1').bind(s).first();
    if (!hit) return s;
    s = `${slugify(base)}-${new Date().toISOString().slice(0,10)}${i ? `-${i+1}` : ''}`;
  }
  return `${slugify(base)}-${crypto.randomUUID().slice(0,8)}`;
}

function contentPath(p) {
  if (p.content_type === 'treatment_comparison') return `/compare/${p.slug}`;
  if (p.content_type === 'treatment_profile') return `/treatments/${p.slug}`;
  return `/blog/${p.slug}`;
}

async function selectRelated(env, page) {
  const rows = (await env.DB.prepare(`SELECT slug,title,dek,content_type FROM content_pages WHERE status='published' AND slug<>? ORDER BY published_at DESC LIMIT 24`).bind(page.slug).all()).results || [];
  // Keep this deterministic and crawlable; semantic selection can be added later without blocking publication.
  return rows.slice(0,3).map(x=>({ ...x, path: contentPath(x) }));
}

async function savePage(env, candidate, draft, edited, sources, status) {
  const slug = await uniqueSlug(env, edited.title || draft.slug || candidate.suggested_title);
  const body = sanitizeHtml(edited.body_html || draft.body_html);
  const faq = (edited.faq || draft.faq || []).slice(0,6).map(x=>({q:String(x.q||'').slice(0,220),a:String(x.a||'').slice(0,600)}));
  const used = new Set(edited.source_ids_used || draft.source_ids_used || []);
  const sourceList = publicSources(sources).filter(s=>!used.size || used.has(s.id));
  const fingerprint = await sha256(JSON.stringify(sourceList.map(s=>[s.id,s.title,s.url])));
  const id = crypto.randomUUID();
  const publishedAt = status === 'published' ? nowIso() : null;
  const toolPaths = normalizeToolPaths(draft.related_tool_paths || []);
  await env.DB.prepare(`INSERT INTO content_pages
    (id,slug,title,dek,description,answer_summary,body_html,content_type,safety_tier,target_query,
     source_json,faq_json,related_slugs_json,evidence_fingerprint,status,generated_by,editor_verdict,editor_notes,published_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)`)
    .bind(id,slug,String(edited.title||draft.title).slice(0,180),String(edited.dek||draft.dek).slice(0,280),
      String(edited.description||draft.description).slice(0,170),String(edited.answer_summary||draft.answer_summary).slice(0,1200),body,
      candidate.content_type,candidate.safety_tier,String(candidate.target_query).slice(0,260),JSON.stringify(sourceList),JSON.stringify(faq),
      JSON.stringify({tools:toolPaths,content:[]}),fingerprint,status,MODEL,edited.verdict,String(edited.notes||'').slice(0,1800),publishedAt).run();
  return { id, slug, status, title: edited.title || draft.title, path: contentPath({slug,content_type:candidate.content_type}), sources:sourceList.length, words:words(body) };
}

async function generateOne(env, opts={}) {
  const runId = crypto.randomUUID();
  const log = async(stage,status,details={}) => env.DB.prepare('INSERT INTO content_runs (id,mode,stage,status,details_json) VALUES (?,?,?,?,?)')
    .bind(`${runId}:${stage}`, opts.mode || 'manual', stage, status, JSON.stringify(details)).run();
  await log('start','ok',opts);
  const candidates = await plan(env, opts.preferredType || null, opts.brief || '');
  let candidate = candidates.find(c=>!opts.preferredType || c.content_type===opts.preferredType) || candidates[0];
  if (!candidate) throw new Error('Planner returned no usable candidates');
  await log('plan','ok',{candidate});
  const sources = await research(env,candidate);
  if (candidate.safety_tier === 'medical' && sources.filter(s=>s.kind==='pubmed').length < 3) {
    await log('research','rejected',{reason:'insufficient_pubmed_evidence',sources:publicSources(sources)});
    await env.DB.prepare("UPDATE topic_candidates SET status='rejected', selected_at=CURRENT_TIMESTAMP WHERE target_query=? AND status='proposed'").bind(candidate.target_query).run();
    return {ok:false,stage:'research',reason:'insufficient_pubmed_evidence',candidate,sources:publicSources(sources)};
  }
  await log('research','ok',{source_count:sources.length});
  const draft = await writeDraft(env,candidate,sources);
  await log('writer','ok',{title:draft.title,source_ids:draft.source_ids_used});
  const edited = await editDraft(env,candidate,sources,draft);
  await log('editor',edited.verdict,{notes:edited.notes});
  const autoMedical = String(env.AUTO_PUBLISH_MEDICAL).toLowerCase()==='true';
  const autoStandard = String(env.AUTO_PUBLISH_STANDARD).toLowerCase()!=='false';
  const usedIds = new Set(edited.source_ids_used || draft.source_ids_used || []);
  const usedSources = sources.filter(s=>usedIds.has(s.id));
  const medicalEvidenceOk = candidate.safety_tier !== 'medical' || (usedSources.length >= 3 && usedSources.filter(s=>s.kind==='pubmed').length >= 2);
  const canPublish = edited.verdict==='publish' && medicalEvidenceOk && (candidate.safety_tier==='medical' ? autoMedical : autoStandard);
  const forcePublish = Boolean(opts.forcePublish) && edited.verdict==='publish' && medicalEvidenceOk;
  const status = forcePublish || canPublish ? 'published' : 'draft';
  const saved = await savePage(env,candidate,draft,edited,sources,status);
  await env.DB.prepare("UPDATE topic_candidates SET status='selected', selected_at=CURRENT_TIMESTAMP WHERE target_query=? AND status='proposed'").bind(candidate.target_query).run();
  if (saved.status==='published') await afterPublish(env,saved.path);
  return {ok:true,candidate,editor:{verdict:edited.verdict,notes:edited.notes},...saved};
}

async function due(env) {
  const last = await env.DB.prepare("SELECT published_at FROM content_pages WHERE status='published' AND published_at IS NOT NULL ORDER BY published_at DESC LIMIT 1").first();
  return !last || Date.now() - Date.parse(last.published_at) >= MIN_PUBLISH_GAP_MS;
}

async function scheduledSeoRun(env) {
  const state = await env.DB.prepare("SELECT value FROM seo_state WHERE key='last_scheduled_seo_run' LIMIT 1").first();
  if (state?.value && Date.now() - Date.parse(state.value) < 20 * 60 * 60 * 1000) return {ok:true,skipped:'not_due'};
  const result = await runSeoFeedbackLoop(env).catch(e=>({ok:false,error:e?.message||String(e)}));
  await env.DB.prepare("INSERT INTO seo_state(key,value,updated_at) VALUES('last_scheduled_seo_run',?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP").bind(nowIso()).run();
  return result;
}

async function scheduledRun(env) {
  const seo = await scheduledSeoRun(env);
  if (String(env.AUTO_WRITER || 'true').toLowerCase() === 'false') return {ok:true,seo,content:{skipped:'auto_writer_off'}};
  if (!(await due(env))) return {ok:true,seo,content:{skipped:'not_due'}};

  const maxAttempts = clamp(env.AUTO_CONTENT_MAX_ATTEMPTS || DEFAULT_SCHEDULED_ATTEMPTS, 1, 6);
  const attempts = [];
  for (let i = 0; i < maxAttempts; i++) {
    const preferredType = SCHEDULED_TYPE_FALLBACKS[i % SCHEDULED_TYPE_FALLBACKS.length];
    try {
      const result = await generateOne(env, {
        mode: i === 0 ? 'scheduled' : `scheduled_retry_${i + 1}`,
        preferredType,
        brief: i === 0 ? '' : 'Choose a distinct publishable topic not covered by any candidate or page generated earlier in this scheduled run.'
      });
      attempts.push({attempt:i+1,preferredType,ok:result.ok,status:result.status||null,stage:result.stage||null,reason:result.reason||null,title:result.title||result.candidate?.suggested_title||null});
      if (result.ok && result.status === 'published') return {ok:true,seo,content:result,attempts};
    } catch (error) {
      attempts.push({attempt:i+1,preferredType,ok:false,error:error?.message||String(error)});
    }
  }
  return {ok:false,seo,content:{error:'no_publishable_article_after_retries'},attempts};
}

async function notifyIndexNow(env, paths) {
  if (!env.INDEXNOW_KEY) return {skipped:'no_key'};
  const host = new URL(baseUrl(env)).host;
  const urls = paths.map(p=>new URL(p,baseUrl(env)).toString());
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method:'POST', headers:{'content-type':'application/json; charset=utf-8'},
    body:JSON.stringify({host,key:env.INDEXNOW_KEY,keyLocation:`${baseUrl(env)}/indexnow-key.txt`,urlList:urls})
  });
  return {status:res.status};
}

async function afterPublish(env, path) {
  try { await notifyIndexNow(env,[path,'/sitemap.xml']); } catch(e) { console.log('indexnow_error',String(e)); }
}

function typeLabel(t) {
  return ({tracking_guide:'Tracking guide',treatment_comparison:'Treatment comparison',treatment_profile:'Treatment evidence',question:'Explainer'})[t] || 'Field note';
}

const PUBLIC_COPY_OVERRIDES = {
  'mature-hairline-or-receding-hairline-how-to-tell-the-difference-and-how-to-photograp': {
    title:'Mature hairline or receding hairline?',
    dek:'One photo may not tell you. Match the angle, lighting, and distance, then compare the same views over several months.',
    description:'How to photograph your hairline consistently and check whether it keeps changing over time.',
    answer_summary:'A single photo cannot reliably distinguish a stable hairline from ongoing change. Match the angle, lighting, distance, and hair state across several check-ins, then take the dated originals to a qualified clinician if you are concerned.'
  },
  'how-to-take-consistent-hair-progress-photos-lighting-angle-and-distance': {
    title:'How to take consistent hair progress photos',
    dek:'Keep the lighting, angle, distance, and hair state the same each time.',
    description:'A practical setup for taking hair progress photos that are easier to compare.'
  },
  'finasteride-vs-minoxidil-for-hair-loss-what-the-evidence-actually-shows': {
    title:'Finasteride vs. minoxidil',
    dek:'How oral finasteride, topical minoxidil, and oral minoxidil differ in approved use, study results, and side effects.',
    description:'Compare finasteride and minoxidil by form, approved use, study results, and reported side effects.'
  }
};

const PUBLIC_BODY_OVERRIDES = {
  'mature-hairline-or-receding-hairline-how-to-tell-the-difference-and-how-to-photograp': `<p>A single photo cannot tell you why a hairline looks different. It can show position and shape, but not whether the cause is normal variation, patterned hair loss, styling, or the camera setup. A useful home check is simpler: take matched photos over several months and look for a repeatable visible change.</p>
<h2>What matched photos can tell you</h2>
<p>Photos can help you answer one narrow question: does the hairline look stable when the setup stays the same? They cannot diagnose the cause of a change or measure follicle density.</p>
<table><thead><tr><th>Check</th><th>Keep consistent</th><th>Why it matters</th></tr></thead><tbody><tr><td>Position</td><td>Camera height and head angle</td><td>A small tilt can move the hairline within the frame.</td></tr><tr><td>Scale</td><td>Camera distance and lens</td><td>A closer phone changes facial proportions.</td></tr><tr><td>Contrast</td><td>Light source and exposure</td><td>Shadow can make the edge look thinner.</td></tr><tr><td>Hair state</td><td>Dryness, part, length, and product</td><td>Wet or styled hair exposes different areas of scalp.</td></tr></tbody></table>
<h2>Set up a baseline you can repeat</h2>
<ol><li>Choose one room and one fixed light source. Avoid changing between daylight and artificial light.</li><li>Stand in a marked position and keep the phone at eye level.</li><li>Include stable facial landmarks, such as the eyebrows and both ears, so later photos can be aligned.</li><li>Keep your hair dry and arranged the same way.</li><li>Capture a front view and both corners. Save the unedited originals.</li></ol>
<h2>Compare a series, not a single pair</h2>
<p>Two frames can disagree because one session was different. A sequence is more useful. If the same apparent shift appears across several well-matched check-ins, you have a clearer record to discuss with a dermatologist. If it disappears when the images are aligned, the camera setup was probably doing most of the work.</p>
<p>Check every few months rather than every few days. Hairline photos are noisy, and frequent checking makes small changes in light or styling feel more important than they are.</p>
<h2>Do not use photos as a diagnosis</h2>
<p>The terms people use online for hairline shape are not a substitute for an examination. If you are concerned about a change, bring the dated originals to a qualified clinician. The value of the photo series is that it shows what changed and when, without asking memory to do the work.</p>`
};

function publicCopy(row) {
  return row ? {...row,...(PUBLIC_COPY_OVERRIDES[row.slug]||{})} : row;
}

function pathForType(t) {
  return t==='treatment_comparison'?'/compare':t==='treatment_profile'?'/treatments':'/blog';
}

function htmlShell({title,description,canonical,body,jsonLd='',robots='index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="${esc(robots)}"><meta name="referrer" content="strict-origin-when-cross-origin"><meta name="theme-color" content="#ffffff"><link rel="canonical" href="${esc(canonical)}"><link rel="alternate" type="application/atom+xml" title="Track My Hair Loss" href="${esc(baseUrl({SITE_URL:SITE}))}/feed.xml"><script async src="https://www.googletagmanager.com/gtag/js?id=G-6FX9XXF3JK"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-6FX9XXF3JK');</script><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&display=swap" rel="stylesheet"><meta property="og:type" content="article"><meta property="og:site_name" content="Track My Hair Loss"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${esc(canonical)}"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}">${jsonLd?`<script type="application/ld+json">${jsonLd.replace(/<\/script/gi,'<\\/script')}</script>`:''}<style>
:root{--bone:#ffffff;--paper:#ffffff;--ink:#101417;--navy:#14324a;--blue:#315f8c;--mist:#f1f5f7;--oxide:#b6533f;--muted:#5d666b;--quiet:#8d9497;--line:#d9dee1;--lineDark:#bcc4c8;--ui:"IBM Plex Sans",ui-sans-serif,system-ui,sans-serif;--serif:"Source Serif 4",Georgia,serif;--mono:"IBM Plex Mono",monospace;--max:1280px;--reading:760px}*{box-sizing:border-box}html{background:#fff;scroll-behavior:smooth}body{margin:0;background:#fff;color:var(--ink);font-family:var(--ui);-webkit-font-smoothing:antialiased}a{color:inherit;text-decoration-thickness:1px;text-underline-offset:3px}.wrap{width:min(calc(100% - 42px),var(--max));margin:auto}.nav{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.96);backdrop-filter:blur(16px);border-bottom:1px solid var(--ink)}.navin{min-height:72px;display:flex;align-items:center;justify-content:space-between;gap:24px}.brand{display:grid;grid-template-columns:18px 1fr;gap:11px;align-items:center;text-decoration:none;font-weight:700;letter-spacing:-.025em}.mark{width:18px;height:18px;background:var(--oxide)}.brand small{display:block;font:500 9px/1.2 var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-top:2px}.links{display:flex;gap:21px;align-items:center;font-size:13px}.links>a:not(.app){text-decoration:none;padding:25px 0;border-bottom:2px solid transparent}.links>a:not(.app):hover{border-color:var(--oxide)}.app{background:var(--navy);border:1px solid var(--navy);color:#fff;padding:10px 13px;text-decoration:none;font-weight:650}.app:hover{background:var(--oxide);border-color:var(--oxide)}
.pageHero{padding:74px 0 42px;border-bottom:1px solid var(--ink)}.ey{font:600 10px/1.2 var(--mono);letter-spacing:.13em;text-transform:uppercase;color:var(--oxide)}h1,h2,h3{font-family:var(--serif);font-weight:550}h1{font-size:clamp(48px,6.8vw,90px);line-height:.92;letter-spacing:-.052em;max-width:1040px;margin:16px 0 18px}.dek{font-size:clamp(19px,2vw,23px);line-height:1.55;color:var(--muted);max-width:820px;margin:0}.meta{display:flex;gap:0;flex-wrap:wrap;margin-top:27px;border-top:1px solid var(--lineDark);width:max-content;max-width:100%}.meta span{font:600 10px/1.2 var(--mono);text-transform:uppercase;letter-spacing:.08em;padding:10px 12px;border-right:1px solid var(--lineDark);border-bottom:1px solid var(--lineDark)}
.answerGrid{display:grid;grid-template-columns:145px minmax(0,1fr);gap:24px;max-width:940px;margin-top:34px;padding-top:22px;border-top:3px solid var(--navy)}.answerLabel{font:600 10px/1.3 var(--mono);text-transform:uppercase;letter-spacing:.12em;color:var(--navy)}.answerText{font-family:var(--serif);font-size:clamp(20px,2.2vw,27px);line-height:1.5;color:#263238}.answerText p{margin:0}
.content{display:grid;grid-template-columns:minmax(0,var(--reading)) minmax(250px,1fr);gap:76px;padding:48px 0 92px}.article p,.article li,.article td{font-family:var(--serif);font-size:18.5px;line-height:1.82;color:#30383c}.article p{margin:0 0 22px}.article h2{font-size:clamp(31px,3.5vw,46px);line-height:1.04;letter-spacing:-.035em;margin:54px 0 16px;padding-top:8px;border-top:1px solid var(--lineDark)}.article h3{font-size:24px;line-height:1.15;letter-spacing:-.025em;margin:31px 0 10px}.article ul,.article ol{padding-left:24px;margin:16px 0 25px}.article li+li{margin-top:8px}.article strong{font-weight:600;color:var(--ink)}.article table{width:100%;border-collapse:collapse;margin:28px 0 36px;border-top:2px solid var(--navy);border-bottom:1px solid var(--ink);background:transparent}.article th,.article td{text-align:left;vertical-align:top;padding:13px 12px;border-bottom:1px solid var(--line);font-size:15px;line-height:1.55}.article th{font-family:var(--ui);font-weight:650;background:var(--mist);color:var(--navy)}.cite{text-decoration:none;color:var(--oxide);font:600 10px/1 var(--mono);margin-left:2px}
.aside{position:sticky;top:96px;height:max-content;border-top:3px solid var(--navy)}.ledger{padding:16px 0;border-bottom:1px solid var(--lineDark)}.ledger h3{font-family:var(--ui);font-size:12px;text-transform:uppercase;letter-spacing:.08em;margin:0 0 9px}.ledger p,.ledger li{font-size:13px;line-height:1.55;color:var(--muted)}.ledger p{margin:0}.tool{display:block;padding:12px 0;border-bottom:1px solid var(--line);font-size:13px;font-weight:600;text-decoration:none}.tool:hover{color:var(--oxide)}
.sources{margin-top:56px;padding-top:20px;border-top:3px solid var(--navy)}.sources h2{border:0;margin:0 0 20px;padding:0;font-size:34px}.source{display:grid;grid-template-columns:36px minmax(0,1fr);gap:10px;font-family:var(--ui)!important;font-size:13px!important;line-height:1.5!important;color:var(--muted)!important;margin:0!important;padding:13px 0;border-top:1px solid var(--line)}.source strong{font-family:var(--mono);font-size:10px;color:var(--oxide)}.source a{font-weight:600;color:var(--ink)}
.faq{margin-top:54px}.faq>h2{border-top:3px solid var(--navy);margin:0;padding:20px 0 4px}.faq details{border-top:1px solid var(--lineDark);padding:16px 0}.faq summary{cursor:pointer;font-family:var(--serif);font-size:20px;font-weight:550}.faq details p{margin:12px 0 0;font-size:16px}
.indexHero{padding:82px 0 46px;border-bottom:1px solid var(--ink)}.indexHero h1{max-width:900px}.indexDeck{padding:0 0 88px}.post{display:grid;grid-template-columns:130px minmax(0,1fr) 160px;gap:30px;padding:29px 0;border-bottom:1px solid var(--lineDark);text-decoration:none}.post:hover{background:rgba(49,95,140,.045)}.post time,.kind{font:600 10px/1.35 var(--mono);text-transform:uppercase;letter-spacing:.08em;color:var(--quiet)}.post h2{font-size:clamp(25px,3vw,38px);line-height:1.04;letter-spacing:-.03em;margin:0 0 8px}.post p{margin:0;color:var(--muted);line-height:1.55;max-width:700px}.kind{justify-self:end;color:var(--oxide)}.empty{padding:34px 0;color:var(--muted)}
.foot{border-top:1px solid var(--ink);padding:25px 0 44px;color:var(--muted);font-size:12px}.footin{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap}
@media(max-width:900px){.links a:not(.app){display:none}.content{grid-template-columns:1fr;gap:38px}.aside{position:static}.answerGrid{grid-template-columns:1fr;gap:9px}.post{grid-template-columns:1fr;gap:8px}.kind{justify-self:start}}
@media(max-width:620px){.wrap{width:min(calc(100% - 24px),var(--max))}.navin{min-height:64px}.pageHero,.indexHero{padding-top:55px}h1{font-size:clamp(45px,14vw,68px)}.article p,.article li{font-size:17.5px}.content{padding-top:34px}.meta{width:100%}.meta span{flex:1 1 auto}}
</style></head><body><nav class="nav"><div class="wrap navin"><a class="brand" href="/"><span class="mark"></span><span>Track My Hair Loss<small>Hair tracking tools</small></span></a><div class="links"><a href="/compare">Comparisons</a><a href="/treatments">Treatments</a><a href="/blog">Guides</a><a href="/#tools">Tools</a><a class="app" href="https://getbaldwin.app/download?c=tmhl_content">Get Baldwin</a></div></div></nav>${body}<footer class="foot"><div class="wrap footin"><span>© 2026 Track My Hair Loss</span><span><a href="/providers/">For providers</a> · <a href="https://getbaldwin.app/">Baldwin</a></span></div></footer><script>(function(){const A="https://baldwin-growth-api.threeamigosholdings.workers.dev";const id=localStorage.getItem("baldwin_anon_id")||(crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2));localStorage.setItem("baldwin_anon_id",id);function send(event,meta){try{if(typeof gtag==="function")gtag("event",event,{...meta,site:"trackmyhairloss",campaign:"organic_content"})}catch(_){}fetch(A+"/v1/events",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({event,anonymousId:id,source:"trackmyhairloss",campaign:"organic_content",metadata:meta})}).catch(()=>{})}send("blog_view",{page:location.pathname});document.querySelectorAll('a[href*="getbaldwin.app"]').forEach(a=>a.addEventListener("click",()=>send("blog_cta_click",{page:location.pathname,href:a.href})));})();</script></body></html>`;
}

function decorateCitations(html, sources) {
  const index = new Map(sources.map((s,i)=>[s.id,i+1]));
  return String(html)
    .replace(/\[([PF]\d+)\]/g,(m,id)=> index.has(id) ? `<sup><a class="cite" href="#ref-${esc(id)}">[${index.get(id)}]</a></sup>` : '')
    .replace(/\s+([,.;:!?])/g,'$1');
}

function schemaForPage(p, canonical, sources, faq) {
  const medical = p.safety_tier==='medical';
  const article = {
    '@type': medical ? ['Article','MedicalWebPage'] : 'Article',
    '@id': `${canonical}#article`, headline:p.title, description:p.description,
    datePublished:p.published_at, dateModified:p.updated_at || p.published_at,
    mainEntityOfPage:canonical, inLanguage:'en-US', isAccessibleForFree:true,
    author:{'@type':'Organization','name':'Track My Hair Loss','url':`${SITE}/`},
    publisher:{'@id':`${SITE}/#organization`},
    citation:sources.map(s=>s.url), about:p.target_query || p.title
  };
  const graph = [
    {'@type':'WebSite','@id':`${SITE}/#website`,name:'Track My Hair Loss',url:`${SITE}/`,inLanguage:'en-US'},
    {'@type':'Organization','@id':`${SITE}/#organization`,name:'Track My Hair Loss',url:`${SITE}/`},
    {'@type':'BreadcrumbList','@id':`${canonical}#breadcrumb`,itemListElement:[
      {'@type':'ListItem',position:1,name:'Home',item:`${SITE}/`},
      {'@type':'ListItem',position:2,name:typeLabel(p.content_type),item:`${SITE}${pathForType(p.content_type)}`},
      {'@type':'ListItem',position:3,name:p.title,item:canonical}
    ]}, article
  ];
  // FAQ markup stays visible for users, but FAQ rich-result structured data is intentionally omitted.
  return JSON.stringify({'@context':'https://schema.org','@graph':graph});
}

async function getPage(env, slug, contentType=null, includeDraft=false) {
  const statusClause = includeDraft ? '' : " AND status='published'";
  const sql = contentType ? `SELECT * FROM content_pages WHERE slug=? AND content_type=?${statusClause} LIMIT 1` : `SELECT * FROM content_pages WHERE slug=?${statusClause} LIMIT 1`;
  const row = contentType ? await env.DB.prepare(sql).bind(slug,contentType).first() : await env.DB.prepare(sql).bind(slug).first();
  return publicCopy(row);
}

async function renderArticle(env, slug, contentType=null, preview=false) {
  const p = await getPage(env,slug,contentType,preview);
  if (!p) return new Response('Not found',{status:404,headers:{'content-type':'text/plain;charset=utf-8'}});
  const sources = safeJson(p.source_json,[]);
  const faq = safeJson(p.faq_json,[]);
  const relatedMeta = safeJson(p.related_slugs_json,{tools:[],content:[]});
  const related = await selectRelated(env,p);
  const canonical = `${baseUrl(env)}${contentPath(p)}`;
  const rawBody = PUBLIC_BODY_OVERRIDES[p.slug] || p.body_html;
  const body = decorateCitations(rawBody,sources);
  const sourceHtml = sources.length ? `<section class="sources"><h2>Sources</h2>${sources.map((s,i)=>`<p class="source" id="ref-${esc(s.id)}"><strong>${String(i+1).padStart(2,'0')}</strong><span><a href="${esc(s.url)}" rel="nofollow noopener" target="_blank">${esc(s.title)}</a>${s.journal?` · ${esc(s.journal)}`:''}${s.published?` · ${esc(s.published)}`:''}</span></p>`).join('')}</section>` : '';
  const bodyHasFaq = /<h[23]>\s*(?:faq|frequently asked questions|common questions)\s*<\/h[23]>/i.test(rawBody);
  const visibleFaq = PUBLIC_BODY_OVERRIDES[p.slug] || bodyHasFaq ? [] : faq;
  const faqHtml = visibleFaq.length ? `<section class="faq"><h2>Common questions</h2>${visibleFaq.map(x=>`<details><summary>${esc(x.q)}</summary><p>${decorateCitations(esc(x.a),sources)}</p></details>`).join('')}</section>` : '';
  const toolPaths = Array.isArray(relatedMeta.tools)?relatedMeta.tools:['/comparator/'];
  const toolHtml = toolPaths.map(path=>TOOLS.find(t=>t.path===path)).filter(Boolean).map(t=>`<a class="tool" href="${esc(t.path)}">${esc(t.name)} →</a>`).join('');
  const relatedHtml = related.map(r=>`<a class="tool" href="${esc(r.path)}">${esc(r.title)} →</a>`).join('');
  const date = p.published_at ? new Date(p.published_at).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}) : '';
  const modified = p.updated_at ? new Date(p.updated_at).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}) : date;
  const jsonLd = schemaForPage(p,canonical,sources,faq);
  const bodyHtml = `<main>
    <section class="pageHero"><div class="wrap">
      <div class="ey">${esc(typeLabel(p.content_type))}</div>
      <h1>${esc(p.title)}</h1>
      <p class="dek">${esc(p.dek)}</p>
      <div class="answerGrid"><div class="answerLabel">Short answer</div><div class="answerText"><p>${decorateCitations(esc(p.answer_summary),sources)}</p></div></div>
      <div class="meta"><span>${esc(date)}</span><span>${words(rawBody).toLocaleString()} words</span>${p.safety_tier==='medical'?`<span>${sources.length} sources</span>`:'<span>Guide</span>'}<span>Updated ${esc(modified)}</span></div>
    </div></section>
    <section><div class="wrap content"><article class="article">${body}${sourceHtml}${faqHtml}</article><aside class="aside">
      ${toolHtml?`<div class="ledger"><h3>Tools</h3>${toolHtml}</div>`:''}
      ${relatedHtml?`<div class="ledger"><h3>Related</h3>${relatedHtml}</div>`:''}
    </aside></div></section>
  </main>`;
  const rendered = htmlShell({title:`${preview ? '[DRAFT] ' : ''}${p.title} | Track My Hair Loss`,description:p.description,canonical,body:bodyHtml,jsonLd,robots:preview?'noindex, nofollow':'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'});
  return new Response(rendered,{headers:{'content-type':'text/html;charset=utf-8','cache-control':preview?'private, no-store':'public, max-age=300'}});
}

async function indexRows(env, types) {
  const placeholders = types.map(()=>'?').join(',');
  const rows = (await env.DB.prepare(`SELECT slug,title,dek,content_type,published_at FROM content_pages WHERE status='published' AND content_type IN (${placeholders}) ORDER BY published_at DESC LIMIT 100`).bind(...types).all()).results || [];
  return rows.map(publicCopy);
}

async function recentArticlesJson(env) {
  const rows = (await env.DB.prepare(`SELECT slug,title,dek,content_type,published_at
    FROM content_pages WHERE status='published' ORDER BY published_at DESC LIMIT 6`).all()).results || [];
  return Response.json({articles:rows.map(publicCopy).map(p=>({
    title:p.title,
    dek:p.dek,
    content_type:p.content_type,
    published_at:p.published_at,
    path:contentPath(p)
  }))},{headers:{'cache-control':'public, max-age=120'}});
}

async function renderIndex(env, kind) {
  const map = {
    articles:{types:['tracking_guide','question','treatment_comparison','treatment_profile'],title:'Articles',h1:'All articles.',dek:'Photo guides, answers to common questions, and research on hair-loss treatments.'},
    blog:{types:['tracking_guide','question'],title:'Guides',h1:'Take better progress photos.',dek:'How to keep your lighting, angle, distance, and framing consistent from one check-in to the next.'},
    compare:{types:['treatment_comparison'],title:'Treatment comparisons',h1:'How do treatments compare?',dek:'See how hair-loss treatments differ, what studies found, and where the evidence is still thin.'},
    treatments:{types:['treatment_profile','treatment_comparison'],title:'Treatments',h1:'Hair-loss treatments.',dek:'Start with the treatment guides below. See how options differ, what studies found, and which side effects were reported.'}
  }[kind];
  const rows = await indexRows(env,map.types);
  const items = rows.map(p=>`<a class="post" href="${esc(contentPath(p))}"><time>${p.published_at?esc(new Date(p.published_at).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})):''}</time><div><h2>${esc(p.title)}</h2><p>${esc(p.dek)}</p></div><span class="kind">${esc(typeLabel(p.content_type))}</span></a>`).join('');
  const canonical = `${baseUrl(env)}/${kind==='blog'?'blog':kind}`;
  return new Response(htmlShell({title:`${map.title} | Track My Hair Loss`,description:map.dek,canonical,body:`<main><section class="indexHero"><div class="wrap"><div class="ey">${esc(map.title)}</div><h1>${esc(map.h1)}</h1><p class="dek">${esc(map.dek)}</p></div></section><section class="indexDeck"><div class="wrap">${items||'<p class="empty">No published pages yet.</p>'}</div></section></main>`}),{headers:{'content-type':'text/html;charset=utf-8','cache-control':'public, max-age=180'}});
}

async function feedXml(env) {
  const rows = ((await env.DB.prepare("SELECT slug,title,description,content_type,published_at,updated_at FROM content_pages WHERE status='published' ORDER BY published_at DESC LIMIT 30").all()).results || []).map(publicCopy);
  const base = baseUrl(env);
  const items = rows.map(p=>`<entry><title>${esc(p.title)}</title><id>${esc(base+contentPath(p))}</id><link href="${esc(base+contentPath(p))}"/><updated>${esc(new Date(p.updated_at||p.published_at).toISOString())}</updated><summary>${esc(p.description)}</summary></entry>`).join('');
  const updated = rows[0] ? new Date(rows[0].updated_at||rows[0].published_at).toISOString() : new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>Track My Hair Loss</title><id>${esc(base)}/</id><link href="${esc(base)}/feed.xml" rel="self"/><link href="${esc(base)}/"/><updated>${esc(updated)}</updated>${items}</feed>`;
  return new Response(xml,{headers:{'content-type':'application/atom+xml;charset=utf-8','cache-control':'public, max-age=300'}});
}

async function sitemap(env) {
  const rows = (await env.DB.prepare("SELECT slug,content_type,published_at,updated_at FROM content_pages WHERE status='published' ORDER BY published_at DESC").all()).results || [];
  const base = baseUrl(env);
  const staticUrls = ['/', '/comparator/','/photo-audit/','/contact-sheet/','/framing-grid/','/check-in-log/','/photo-guide/','/timeline/','/providers/','/articles','/blog','/compare','/treatments'];
  const urls = staticUrls.map(path=>({loc:`${base}${path}`,lastmod:null})).concat(rows.map(p=>({loc:`${base}${contentPath(p)}`,lastmod:p.updated_at||p.published_at})));
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${esc(u.loc)}</loc>${u.lastmod?`<lastmod>${esc(new Date(u.lastmod).toISOString())}</lastmod>`:''}</url>`).join('')}</urlset>`;
  return new Response(xml,{headers:{'content-type':'application/xml;charset=utf-8','cache-control':'public, max-age=300'}});
}

async function llmsTxt(env) {
  const rows = ((await env.DB.prepare("SELECT slug,title,description,content_type FROM content_pages WHERE status='published' ORDER BY published_at DESC LIMIT 40").all()).results || []).map(publicCopy);
  const base = baseUrl(env);
  const text = `# Track My Hair Loss\n\nTrack My Hair Loss provides browser-based hair-progress tools and sourced pages about hair-loss treatments and tracking.\n\n## Tools\n${TOOLS.map(t=>`- [${t.name}](${base}${t.path}): ${t.intent}`).join('\n')}\n\n## Content\n- [Treatment comparisons](${base}/compare)\n- [Treatments](${base}/treatments)\n- [Guides](${base}/blog)\n\n## Recent pages\n${rows.map(p=>`- [${p.title}](${base}${contentPath(p)}): ${p.description}`).join('\n')}\n`;
  return new Response(text,{headers:{'content-type':'text/plain;charset=utf-8','cache-control':'public, max-age=300'}});
}

async function listAdmin(env) {
  const rows = (await env.DB.prepare(`SELECT id,slug,title,content_type,safety_tier,target_query,status,editor_verdict,editor_notes,published_at,created_at FROM content_pages ORDER BY created_at DESC LIMIT 100`).all()).results || [];
  return rows.map(r=>({...r,path:contentPath(r)}));
}

async function publishDraft(env, slug) {
  const p = await env.DB.prepare("SELECT * FROM content_pages WHERE slug=? LIMIT 1").bind(slug).first();
  if (!p) return {ok:false,error:'not_found'};
  if (p.editor_verdict !== 'publish') return {ok:false,error:'editor_not_publish',verdict:p.editor_verdict};
  if (p.safety_tier==='medical' && safeJson(p.source_json,[]).length<3) return {ok:false,error:'insufficient_sources'};
  await env.DB.prepare("UPDATE content_pages SET status='published',published_at=COALESCE(published_at,CURRENT_TIMESTAMP),updated_at=CURRENT_TIMESTAMP WHERE slug=?").bind(slug).run();
  await afterPublish(env,contentPath(p));
  return {ok:true,slug,path:contentPath(p)};
}

async function ingestSignals(env, payload) {
  const rows = Array.isArray(payload)?payload:(payload?.rows||[]);
  let n=0;
  for (const r of rows.slice(0,1000)) {
    if (!r?.query || !r?.source) continue;
    await env.DB.prepare(`INSERT INTO search_signals (id,source,query,page,clicks,impressions,position,citations,observed_at) VALUES (?,?,?,?,?,?,?,?,?)`)
      .bind(crypto.randomUUID(),String(r.source).slice(0,40),String(r.query).slice(0,500),String(r.page||'').slice(0,800),Number(r.clicks||0),Number(r.impressions||0),r.position==null?null:Number(r.position),Number(r.citations||0),r.observed_at||nowIso()).run();
    n++;
  }
  return {ok:true,inserted:n};
}

export default {
  async fetch(req, env, ctx) {
    try {
      const u = new URL(req.url);
      const path = u.pathname.replace(/\/+$/,'') || '/';
    if (path==='/articles.json') return recentArticlesJson(env);
    if (path==='/sitemap.xml') return sitemap(env);
    if (path==='/feed.xml') return feedXml(env);
    if (path==='/llms.txt') return llmsTxt(env);
    if (path==='/indexnow-key.txt') return new Response(env.INDEXNOW_KEY || '',{headers:{'content-type':'text/plain;charset=utf-8'}});
    if (path==='/articles') return renderIndex(env,'articles');
    if (path==='/blog') return renderIndex(env,'blog');
    if (path==='/compare') return renderIndex(env,'compare');
    if (path==='/treatments') return renderIndex(env,'treatments');
    if (path.startsWith('/blog/')) return renderArticle(env,decodeURIComponent(path.slice(6)),null);
    if (path.startsWith('/compare/')) return renderArticle(env,decodeURIComponent(path.slice(9)),'treatment_comparison');
    if (path.startsWith('/treatments/')) return renderArticle(env,decodeURIComponent(path.slice(12)),'treatment_profile');

    if (path.startsWith('/__') && !adminOk(req,env)) return new Response('Unauthorized',{status:401});
    if (path==='/__status') {
      const last=await env.DB.prepare("SELECT published_at FROM content_pages WHERE status='published' AND published_at IS NOT NULL ORDER BY published_at DESC LIMIT 1").first();
      const lastRuns=(await env.DB.prepare("SELECT mode,stage,status,details_json,created_at FROM content_runs ORDER BY created_at DESC LIMIT 12").all()).results||[];
      return Response.json({ok:true,model:MODEL,due:await due(env),auto_writer:String(env.AUTO_WRITER||'true').toLowerCase()!=='false',publish_gap_hours:MIN_PUBLISH_GAP_MS/3600000,last_published_at:last?.published_at||null,workers_ai_configured:Boolean(env.AI),indexnow_configured:Boolean(env.INDEXNOW_KEY),auto_publish_standard:env.AUTO_PUBLISH_STANDARD,auto_publish_medical:env.AUTO_PUBLISH_MEDICAL,seo_autopilot:env.SEO_AUTOPILOT,seo_refresh_medical:env.SEO_REFRESH_MEDICAL,gsc_configured:Boolean(env.GSC_SERVICE_ACCOUNT_JSON),recent_runs:lastRuns,jobs:await recentOperatorJobs(env),seo_actions:await recentSeoActions(env),posts:await listAdmin(env)});
    }
    if (path==='/__ai-test' && req.method==='POST') {
      const result = await env.AI.run(MODEL, {
        messages:[{role:'user',content:'Reply with exactly the word OK.'}],
        max_completion_tokens:32,
        reasoning_effort:'low'
      });
      return Response.json({ok:true,model:MODEL,result});
    }
    if (path.startsWith('/__preview/')) return renderArticle(env,decodeURIComponent(path.slice(11)),null,true);
    if (path==='/__plan' && req.method==='POST') {
      const body = await req.json().catch(()=>({}));
      return Response.json({ok:true,candidates:await plan(env,body.preferredType||null,body.brief||'')});
    }
    if (path==='/__research-test' && req.method==='POST') {
      const body = await req.json().catch(()=>({}));
      const query = String(body.query || '').trim();
      if (!query) return Response.json({ok:false,error:'query_required'},{status:400});
      return Response.json(await researchProbe(env,query));
    }
    if (path==='/__generate' && req.method==='POST') {
      const body = await req.json().catch(()=>({}));
      const job = await enqueueOperatorJob(env,'operator_generate',{preferredType:body.preferredType||null,brief:body.brief||''});
      const claimed = await claimOperatorJob(env,job.id);
      if (!claimed) return Response.json({ok:false,error:'job_claim_failed',job},{status:500});
      ctx.waitUntil(runOperatorJob(env,claimed).catch(e=>console.log('operator_job_error',e?.stack||String(e))));
      return Response.json({ok:true,started:true,job:{...job,status:'running'}},{status:202});
    }
    if (path.startsWith('/__publish/') && req.method==='POST') return Response.json(await publishDraft(env,decodeURIComponent(path.slice(11))));
    if (path==='/__signals' && req.method==='POST') return Response.json(await ingestSignals(env,await req.json()));
    if (path==='/__seo-sync' && req.method==='POST') return Response.json(await syncGoogleSearchConsole(env));
    if (path==='/__seo-analyze' && req.method==='POST') return Response.json(await analyzeSeoFeedback(env));
    if (path==='/__seo-run' && req.method==='POST') {
      const job = await enqueueOperatorJob(env,'operator_seo',{});
      const claimed = await claimOperatorJob(env,job.id);
      if (!claimed) return Response.json({ok:false,error:'job_claim_failed',job},{status:500});
      ctx.waitUntil(runOperatorJob(env,claimed).catch(e=>console.log('operator_job_error',e?.stack||String(e))));
      return Response.json({ok:true,started:true,job:{...job,status:'running'}},{status:202});
    }
    if (path==='/__seo-actions') {
      const rows = (await env.DB.prepare(`SELECT id,page,slug,query,action_type,score,reason,status,created_at,executed_at FROM seo_actions ORDER BY created_at DESC LIMIT 100`).all()).results || [];
      return Response.json({ok:true,actions:rows});
    }
    if (path==='/__run-scheduled' && req.method==='POST') return Response.json(await scheduledRun(env));
      return new Response('Not found',{status:404});
    } catch (error) {
      const message = error?.message || String(error);
      console.error('request_error', error?.stack || message);
      return Response.json({ok:false,error:message,model:MODEL},{status:500});
    }
  },
  async scheduled(controller, env, ctx) {
    const cron=controller?.cron||'';
    if (cron==='*/5 * * * *') {
      ctx.waitUntil(drainOperatorJobs(env).catch(e=>console.log('operator_job_error',e?.stack||String(e))));
      return;
    }
    ctx.waitUntil(scheduledRun(env).catch(e=>console.log('scheduled_error',e?.stack||String(e))));
  }
};
