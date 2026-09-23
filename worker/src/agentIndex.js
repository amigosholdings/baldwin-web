import base from './index.js';
import { handleGrowthOs } from './growthOs.js';

const DECISIONS = new Set(['send_initial','follow_up','reply','hold','reject']);
const MESSAGE_KINDS = new Set(['initial','follow_up','reply']);

function uuid() { return crypto.randomUUID(); }
function clean(value, max = 4000) { return String(value ?? '').trim().slice(0, max); }
function extractEmail(value = '') {
  const match = String(value).match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0].toLowerCase() : '';
}
function safeJson(value, fallback = {}) {
  if (value == null || value === '') return JSON.stringify(fallback);
  if (typeof value === 'string') {
    try { JSON.parse(value); return value; } catch { return JSON.stringify({ text: clean(value, 12000) }); }
  }
  try { return JSON.stringify(value); } catch { return JSON.stringify(fallback); }
}
function domainFromWebsite(value = '') {
  const raw = clean(value, 500);
  if (!raw) return '';
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return url.hostname.toLowerCase().replace(/^www\./, '');
  } catch { return raw.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].split(':')[0]; }
}
function allowedOrigin(request, env) {
  const origin = request.headers.get('Origin');
  if (!origin) return '*';
  const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean);
  return allowed.includes(origin) ? origin : 'null';
}
function responseHeaders(request, env, extra = {}) {
  return {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': allowedOrigin(request, env),
    'access-control-allow-methods': 'GET,POST,PATCH,OPTIONS',
    'access-control-allow-headers': 'content-type,x-admin-token',
    'vary': 'Origin',
    ...extra
  };
}
function json(request, env, body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders(request, env) });
}
function isAdmin(request, env) {
  const token = request.headers.get('x-admin-token') || '';
  return Boolean(env.ADMIN_TOKEN) && token === env.ADMIN_TOKEN;
}
async function bodyJson(request) { try { return await request.json(); } catch { return null; } }
function maxDailySends(env) {
  const n = Number(env.AGENT_MAX_DAILY_SENDS || 40);
  return Math.max(1, Math.min(100, Number.isFinite(n) ? Math.trunc(n) : 40));
}
function replyAddress(env, outreachId) {
  const domain = clean(env.REPLY_DOMAIN, 180).replace(/^@/, '');
  return domain ? `reply+${outreachId}@${domain}` : extractEmail(env.OUTREACH_FROM || '');
}
async function resendRequest(env, path, init = {}) {
  if (!env.RESEND_API_KEY) throw new Error('RESEND_API_KEY_not_configured');
  const response = await fetch(`https://api.resend.com${path}`, {
    ...init,
    headers: { 'authorization': `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json', ...(init.headers || {}) }
  });
  const raw = await response.text();
  let payload = {};
  try { payload = raw ? JSON.parse(raw) : {}; } catch { payload = { raw }; }
  if (!response.ok) throw new Error(`Resend ${response.status}: ${clean(payload?.message || payload?.raw || raw, 500)}`);
  return payload;
}
async function sendEmail(env, { outreachId, to, subject, body, inReplyTo = '', idempotencyKey }) {
  if (!env.OUTREACH_FROM) throw new Error('OUTREACH_FROM_not_configured');
  if (!env.REPLY_DOMAIN) throw new Error('REPLY_DOMAIN_not_configured');
  const replyTo = replyAddress(env, outreachId);
  const customHeaders = {};
  if (inReplyTo) {
    customHeaders['In-Reply-To'] = inReplyTo;
    customHeaders['References'] = inReplyTo;
  }
  if (replyTo) customHeaders['List-Unsubscribe'] = `<mailto:${replyTo}?subject=unsubscribe>`;
  return resendRequest(env, '/emails', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify({
      from: env.OUTREACH_FROM,
      to: [to],
      subject,
      text: body,
      reply_to: replyTo || undefined,
      headers: Object.keys(customHeaders).length ? customHeaders : undefined
    })
  });
}

async function findOutreach(env, prospect) {
  const email = extractEmail(prospect.email || prospect.work_email || prospect.contact_email || '');
  if (email) {
    const row = await env.DB.prepare('SELECT * FROM outreach WHERE lower(email)=lower(?) LIMIT 1').bind(email).first();
    if (row) return row;
  }
  const website = clean(prospect.website || prospect.url, 500);
  const domain = clean(prospect.domain, 240) || domainFromWebsite(website);
  if (domain) {
    const profile = await env.DB.prepare('SELECT o.* FROM agent_profiles p JOIN outreach o ON o.id=p.outreach_id WHERE lower(p.domain)=lower(?) LIMIT 1').bind(domain).first();
    if (profile) return profile;
    const byWebsite = await env.DB.prepare('SELECT * FROM outreach WHERE website IS NOT NULL AND lower(website) LIKE ? LIMIT 1').bind(`%${domain.toLowerCase()}%`).first();
    if (byWebsite) return byWebsite;
  }
  const name = clean(prospect.practice_name || prospect.practiceName || prospect.name || prospect.clinic, 160);
  const city = clean(prospect.city, 120);
  if (name) {
    const row = await env.DB.prepare(`SELECT * FROM outreach WHERE lower(practice_name)=lower(?) AND lower(COALESCE(city,''))=lower(?) LIMIT 1`).bind(name, city).first();
    if (row) return row;
  }
  return null;
}

async function upsertProspect(env, runId, prospect) {
  const practiceName = clean(prospect.practice_name || prospect.practiceName || prospect.name || prospect.clinic, 160);
  if (!practiceName) throw new Error('practice_name_required');
  const email = extractEmail(prospect.email || prospect.work_email || prospect.contact_email || '');
  const website = clean(prospect.website || prospect.url, 500);
  const domain = clean(prospect.domain, 240) || domainFromWebsite(website);
  const phone = clean(prospect.phone, 80);
  const city = clean(prospect.city, 120);
  const category = clean(prospect.category || prospect.type, 120);
  const sourceUrl = clean(prospect.source_url || prospect.sourceUrl || website, 700);
  const sourceType = clean(prospect.source_type || prospect.sourceType || 'chatgpt_agent', 100);
  const priorityRaw = Number(prospect.priority);
  const priority = Number.isFinite(priorityRaw) && priorityRaw >= 1 && priorityRaw <= 3 ? Math.trunc(priorityRaw) : null;
  let outreach = await findOutreach(env, { ...prospect, practice_name: practiceName, email, website, domain, city });
  let action = 'updated';
  if (!outreach) {
    const id = uuid();
    await env.DB.prepare(`
      INSERT INTO outreach(id,practice_name,website,email,phone,city,category,priority,source_url,source_type,stage,notes)
      VALUES(?,?,?,?,?,?,?,?,?,?,'identified',?)
    `).bind(id, practiceName, website, email, phone, city, category, priority, sourceUrl, sourceType, clean(prospect.notes, 1600)).run();
    outreach = await env.DB.prepare('SELECT * FROM outreach WHERE id=?').bind(id).first();
    action = 'inserted';
  } else {
    await env.DB.prepare(`
      UPDATE outreach SET practice_name=?, website=COALESCE(NULLIF(?,''),website), email=COALESCE(NULLIF(?,''),email),
        phone=COALESCE(NULLIF(?,''),phone), city=COALESCE(NULLIF(?,''),city), category=COALESCE(NULLIF(?,''),category),
        priority=COALESCE(?,priority), source_url=COALESCE(NULLIF(?,''),source_url), source_type=COALESCE(NULLIF(?,''),source_type),
        updated_at=CURRENT_TIMESTAMP WHERE id=?
    `).bind(practiceName, website, email, phone, city, category, priority, sourceUrl, sourceType, outreach.id).run();
  }
  const fitScoreRaw = Number(prospect.fit_score ?? prospect.fitScore);
  const fitScore = Number.isFinite(fitScoreRaw) ? Math.max(0, Math.min(100, fitScoreRaw)) : null;
  const decision = clean(prospect.decision_status || prospect.decisionStatus, 32);
  const decisionStatus = ['selected','hold','rejected','unreviewed'].includes(decision) ? decision : 'unreviewed';
  await env.DB.prepare(`
    INSERT INTO agent_profiles(outreach_id,domain,state,contact_name,contact_role,fit_score,email_confidence,decision_status,decision_reason,personalization,research_json,last_run_id,researched_at,selected_at,updated_at)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,CASE WHEN ?='selected' THEN CURRENT_TIMESTAMP ELSE NULL END,CURRENT_TIMESTAMP)
    ON CONFLICT(outreach_id) DO UPDATE SET
      domain=COALESCE(NULLIF(excluded.domain,''),agent_profiles.domain),
      state=COALESCE(NULLIF(excluded.state,''),agent_profiles.state),
      contact_name=COALESCE(NULLIF(excluded.contact_name,''),agent_profiles.contact_name),
      contact_role=COALESCE(NULLIF(excluded.contact_role,''),agent_profiles.contact_role),
      fit_score=COALESCE(excluded.fit_score,agent_profiles.fit_score),
      email_confidence=COALESCE(NULLIF(excluded.email_confidence,''),agent_profiles.email_confidence),
      decision_status=CASE WHEN excluded.decision_status='unreviewed' THEN agent_profiles.decision_status ELSE excluded.decision_status END,
      decision_reason=COALESCE(NULLIF(excluded.decision_reason,''),agent_profiles.decision_reason),
      personalization=COALESCE(NULLIF(excluded.personalization,''),agent_profiles.personalization),
      research_json=CASE WHEN excluded.research_json='{}' THEN agent_profiles.research_json ELSE excluded.research_json END,
      last_run_id=COALESCE(NULLIF(excluded.last_run_id,''),agent_profiles.last_run_id),
      researched_at=CURRENT_TIMESTAMP,
      selected_at=CASE WHEN excluded.decision_status='selected' THEN CURRENT_TIMESTAMP ELSE agent_profiles.selected_at END,
      updated_at=CURRENT_TIMESTAMP
  `).bind(
    outreach.id, domain, clean(prospect.state, 120), clean(prospect.contact_name || prospect.contactName, 160),
    clean(prospect.contact_role || prospect.contactRole, 160), fitScore, clean(prospect.email_confidence || prospect.emailConfidence, 40),
    decisionStatus, clean(prospect.decision_reason || prospect.decisionReason, 1600), clean(prospect.personalization, 2000),
    safeJson(prospect.research || prospect.research_json || {}), runId || '', decisionStatus
  ).run();
  await env.DB.prepare(`INSERT INTO agent_events(id,run_id,outreach_id,action,rationale,payload_json) VALUES(?,?,?,?,?,?)`)
    .bind(uuid(), runId || null, outreach.id, action === 'inserted' ? 'prospect_discovered' : 'prospect_refreshed', clean(prospect.decision_reason || '', 1600), safeJson({ domain, source_url: sourceUrl })).run();
  return { outreach_id: outreach.id, action, practice_name: practiceName, email, domain, suppressed: Boolean(Number(outreach.do_not_contact)) };
}

async function queueDecision(env, runId, decision) {
  const outreachId = clean(decision.outreach_id || decision.outreachId, 80);
  if (!outreachId) throw new Error('outreach_id_required');
  const action = clean(decision.decision || decision.action, 32);
  if (!DECISIONS.has(action)) throw new Error('invalid_decision');
  const outreach = await env.DB.prepare('SELECT * FROM outreach WHERE id=? LIMIT 1').bind(outreachId).first();
  if (!outreach) throw new Error('outreach_not_found');
  if (Number(outreach.do_not_contact) && ['send_initial','follow_up','reply'].includes(action)) throw new Error('prospect_is_suppressed');
  const rationale = clean(decision.rationale || decision.decision_reason, 2000);
  const fitScoreRaw = Number(decision.fit_score ?? decision.fitScore);
  const fitScore = Number.isFinite(fitScoreRaw) ? Math.max(0, Math.min(100, fitScoreRaw)) : null;
  const profileStatus = action === 'reject' ? 'rejected' : action === 'hold' ? 'hold' : 'selected';
  await env.DB.prepare(`
    INSERT INTO agent_profiles(outreach_id,fit_score,decision_status,decision_reason,personalization,research_json,last_run_id,researched_at,selected_at,updated_at)
    VALUES(?,?,?,?,?,'{}',?,CURRENT_TIMESTAMP,CASE WHEN ?='selected' THEN CURRENT_TIMESTAMP ELSE NULL END,CURRENT_TIMESTAMP)
    ON CONFLICT(outreach_id) DO UPDATE SET
      fit_score=COALESCE(excluded.fit_score,agent_profiles.fit_score), decision_status=excluded.decision_status,
      decision_reason=excluded.decision_reason, personalization=COALESCE(NULLIF(excluded.personalization,''),agent_profiles.personalization),
      last_run_id=COALESCE(NULLIF(excluded.last_run_id,''),agent_profiles.last_run_id),
      selected_at=CASE WHEN excluded.decision_status='selected' THEN CURRENT_TIMESTAMP ELSE agent_profiles.selected_at END,
      updated_at=CURRENT_TIMESTAMP
  `).bind(outreachId, fitScore, profileStatus, rationale, clean(decision.personalization, 2000), runId || '', profileStatus).run();

  if (action === 'hold' || action === 'reject') {
    await env.DB.prepare(`INSERT INTO agent_events(id,run_id,outreach_id,action,rationale,payload_json) VALUES(?,?,?,?,?,'{}')`)
      .bind(uuid(), runId || null, outreachId, action === 'hold' ? 'prospect_held' : 'prospect_rejected', rationale).run();
    return { outreach_id: outreachId, decision: action, queued: false };
  }

  const kind = action === 'send_initial' ? 'initial' : action;
  if (!MESSAGE_KINDS.has(kind)) throw new Error('invalid_message_kind');
  if (!extractEmail(outreach.email) && kind !== 'reply') throw new Error('valid_email_required');
  if (kind === 'initial') {
    const prior = await env.DB.prepare(`SELECT COUNT(*) AS n FROM email_messages WHERE outreach_id=? AND direction='outbound'`).bind(outreachId).first();
    if (Number(prior?.n || 0) > 0) throw new Error('initial_already_sent');
  }
  const sourceMessageId = clean(decision.source_message_id || decision.sourceMessageId, 80);
  let inbound = null;
  if (kind === 'reply') {
    if (!sourceMessageId) throw new Error('source_message_id_required');
    inbound = await env.DB.prepare(`SELECT * FROM email_messages WHERE id=? AND outreach_id=? AND direction='inbound' LIMIT 1`).bind(sourceMessageId, outreachId).first();
    if (!inbound) throw new Error('inbound_message_not_found');
    if (Number(inbound.needs_human)) throw new Error('reply_requires_human');
    if (inbound.handled_at) throw new Error('reply_already_handled');
  }
  const message = decision.message || {};
  const subject = clean(message.subject || decision.subject || (kind === 'reply' ? (inbound?.subject || 'Re: Baldwin') : ''), 300);
  const body = clean(message.body || decision.body, 8000);
  if (!subject || !body) throw new Error('subject_and_body_required');
  const variant = clean(message.variant || decision.variant || 'agent-v1', 100);
  const scheduledFor = clean(decision.scheduled_for || decision.scheduledFor, 64);
  const idempotency = clean(decision.idempotency_key || decision.idempotencyKey, 180) || `${kind}:${outreachId}:${runId || 'adhoc'}:${variant}:${sourceMessageId || 'none'}`;
  const queueId = uuid();
  await env.DB.prepare(`
    INSERT INTO agent_message_queue(id,run_id,outreach_id,kind,source_message_id,subject,body,variant,rationale,scheduled_for,status,idempotency_key)
    VALUES(?,?,?,?,?,?,?,?,?,?, 'queued', ?)
    ON CONFLICT(idempotency_key) DO NOTHING
  `).bind(queueId, runId || null, outreachId, kind, sourceMessageId || null, subject, body, variant, rationale, scheduledFor || null, idempotency).run();
  const queued = await env.DB.prepare('SELECT * FROM agent_message_queue WHERE idempotency_key=?').bind(idempotency).first();
  await env.DB.prepare(`INSERT INTO agent_events(id,run_id,outreach_id,action,rationale,payload_json) VALUES(?,?,?,?,?,?)`)
    .bind(uuid(), runId || null, outreachId, 'message_queued', rationale, safeJson({ queue_id: queued?.id, kind, variant })).run();
  return { outreach_id: outreachId, decision: action, queued: true, queue_id: queued?.id, kind, variant };
}

async function sendQueuedMessage(env, item) {
  const outreach = item;
  if (Number(outreach.do_not_contact)) throw new Error('prospect_is_suppressed');
  let to = extractEmail(outreach.email || '');
  let inReplyTo = '';
  let inbound = null;
  if (item.kind === 'reply') {
    inbound = await env.DB.prepare(`SELECT * FROM email_messages WHERE id=? AND outreach_id=? AND direction='inbound' LIMIT 1`).bind(item.source_message_id, item.outreach_id).first();
    if (!inbound) throw new Error('inbound_message_not_found');
    if (Number(inbound.needs_human)) throw new Error('reply_requires_human');
    if (inbound.handled_at) throw new Error('reply_already_handled');
    to = extractEmail(inbound.from_email || outreach.email || '');
    inReplyTo = clean(inbound.provider_message_id, 300);
  }
  if (!to) throw new Error('valid_recipient_required');
  if (item.kind === 'initial') {
    const prior = await env.DB.prepare(`SELECT COUNT(*) AS n FROM email_messages WHERE outreach_id=? AND direction='outbound'`).bind(item.outreach_id).first();
    if (Number(prior?.n || 0) > 0) throw new Error('initial_already_sent');
  }
  const sent = await sendEmail(env, {
    outreachId: item.outreach_id,
    to,
    subject: item.subject,
    body: item.body,
    inReplyTo,
    idempotencyKey: `baldwin-agent-${item.id}`
  });
  const messageId = uuid();
  const statements = [
    env.DB.prepare(`INSERT INTO email_messages(id,outreach_id,direction,provider,provider_email_id,from_email,to_email,subject,text_body,status) VALUES(?,?,'outbound','resend',?,?,?,?,?,'sent')`)
      .bind(messageId, item.outreach_id, clean(sent.id,180), extractEmail(env.OUTREACH_FROM), to, item.subject, item.body),
    env.DB.prepare(`UPDATE agent_message_queue SET status='sent',provider_email_id=?,sent_at=CURRENT_TIMESTAMP,error=NULL WHERE id=?`).bind(clean(sent.id,180), item.id),
    env.DB.prepare(`UPDATE outreach SET stage=CASE WHEN stage='identified' THEN 'contacted' ELSE stage END,email_status='sent',last_contacted_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(item.outreach_id),
    env.DB.prepare(`INSERT INTO agent_events(id,run_id,outreach_id,action,rationale,payload_json) VALUES(?,?,?,?,?,?)`)
      .bind(uuid(), item.run_id || null, item.outreach_id, 'message_sent', clean(item.rationale,2000), safeJson({ queue_id:item.id, kind:item.kind, variant:item.variant, provider_email_id:sent.id }))
  ];
  if (inbound) statements.push(env.DB.prepare(`UPDATE email_messages SET handled_at=CURRENT_TIMESTAMP WHERE id=?`).bind(inbound.id));
  await env.DB.batch(statements);
  return { queue_id: item.id, outreach_id: item.outreach_id, practice_name: item.practice_name, kind: item.kind, variant: item.variant, provider_email_id: sent.id };
}

async function agentContext(env) {
  const [summary, runs, prospects, queue, replies, variants, segments, funnel, recentEvents] = await Promise.all([
    env.DB.prepare(`
      SELECT
        (SELECT COUNT(*) FROM outreach) AS outreach_total,
        (SELECT COUNT(*) FROM outreach WHERE stage='identified' AND COALESCE(do_not_contact,0)=0) AS identified,
        (SELECT COUNT(*) FROM outreach WHERE COALESCE(do_not_contact,0)=1) AS suppressed,
        (SELECT COUNT(*) FROM email_messages WHERE direction='outbound') AS outbound_total,
        (SELECT COUNT(*) FROM email_messages WHERE direction='outbound' AND created_at>=datetime('now','-24 hours')) AS outbound_24h,
        (SELECT COUNT(*) FROM email_messages WHERE direction='inbound') AS replies_total,
        (SELECT COUNT(*) FROM email_messages WHERE direction='inbound' AND created_at>=datetime('now','-7 days')) AS replies_7d,
        (SELECT COUNT(*) FROM outreach WHERE reply_category IN ('interested','demo','question')) AS positive_replies,
        (SELECT COUNT(*) FROM outreach WHERE stage IN ('pilot','active')) AS pilots_or_active,
        (SELECT COUNT(*) FROM outreach WHERE email_status='bounced') AS bounced,
        (SELECT COUNT(*) FROM outreach WHERE email_status='complained') AS complained,
        (SELECT COUNT(*) FROM agent_message_queue WHERE status='sent' AND sent_at>=datetime('now','-24 hours')) AS agent_sent_24h,
        (SELECT COUNT(*) FROM agent_message_queue WHERE status='queued' AND (scheduled_for IS NULL OR datetime(scheduled_for)<=datetime('now'))) AS agent_ready
    `).first(),
    env.DB.prepare(`SELECT * FROM agent_runs ORDER BY created_at DESC LIMIT 30`).all(),
    env.DB.prepare(`
      SELECT o.*, p.domain,p.state,p.contact_name,p.contact_role,p.fit_score,p.email_confidence,p.decision_status,p.decision_reason,p.personalization,p.research_json,p.last_run_id,p.researched_at,p.selected_at,
        (SELECT COUNT(*) FROM email_messages m WHERE m.outreach_id=o.id AND m.direction='outbound') AS outbound_count,
        (SELECT COUNT(*) FROM email_messages m WHERE m.outreach_id=o.id AND m.direction='inbound') AS inbound_count
      FROM outreach o LEFT JOIN agent_profiles p ON p.outreach_id=o.id
      ORDER BY COALESCE(p.researched_at,o.updated_at,o.created_at) DESC LIMIT 500
    `).all(),
    env.DB.prepare(`
      SELECT q.*,o.practice_name,o.email,o.city,o.category,o.stage,o.email_status,o.do_not_contact,p.fit_score,p.decision_reason,p.personalization
      FROM agent_message_queue q JOIN outreach o ON o.id=q.outreach_id LEFT JOIN agent_profiles p ON p.outreach_id=o.id
      WHERE q.status IN ('queued','failed') ORDER BY CASE q.status WHEN 'queued' THEN 0 ELSE 1 END,COALESCE(q.scheduled_for,q.created_at),q.created_at LIMIT 250
    `).all(),
    env.DB.prepare(`
      SELECT m.*,o.practice_name,o.email AS practice_email,o.stage,o.reply_category,o.reply_summary
      FROM email_messages m JOIN outreach o ON o.id=m.outreach_id
      WHERE m.direction='inbound' AND m.handled_at IS NULL
      ORDER BY m.created_at DESC LIMIT 100
    `).all(),
    env.DB.prepare(`
      SELECT q.variant,
        COUNT(*) AS queued_or_sent,
        SUM(CASE WHEN q.status='sent' THEN 1 ELSE 0 END) AS sent,
        COUNT(DISTINCT CASE WHEN o.last_reply_at IS NOT NULL THEN o.id END) AS replies,
        COUNT(DISTINCT CASE WHEN o.reply_category IN ('interested','demo','question') THEN o.id END) AS positive_replies,
        COUNT(DISTINCT CASE WHEN o.stage IN ('demo','pilot','active') THEN o.id END) AS progressed
      FROM agent_message_queue q JOIN outreach o ON o.id=q.outreach_id
      WHERE q.created_at>=datetime('now','-30 days') GROUP BY q.variant ORDER BY sent DESC
    `).all(),
    env.DB.prepare(`
      SELECT COALESCE(o.category,'unknown') AS segment,COUNT(DISTINCT q.outreach_id) AS contacted,
        COUNT(DISTINCT CASE WHEN o.last_reply_at IS NOT NULL THEN o.id END) AS replies,
        COUNT(DISTINCT CASE WHEN o.reply_category IN ('interested','demo','question') THEN o.id END) AS positive_replies,
        COUNT(DISTINCT CASE WHEN o.stage IN ('demo','pilot','active') THEN o.id END) AS progressed
      FROM agent_message_queue q JOIN outreach o ON o.id=q.outreach_id
      WHERE q.status='sent' AND q.sent_at>=datetime('now','-30 days') GROUP BY COALESCE(o.category,'unknown') ORDER BY contacted DESC LIMIT 30
    `).all(),
    env.DB.prepare(`SELECT event_name,COUNT(*) AS n FROM events GROUP BY event_name ORDER BY event_name`).all(),
    env.DB.prepare(`SELECT * FROM agent_events ORDER BY created_at DESC LIMIT 150`).all()
  ]);
  return {
    generated_at: new Date().toISOString(),
    guardrails: {
      max_agent_sends_rolling_24h: maxDailySends(env),
      suppression_enforced: true,
      duplicate_initial_send_blocked: true,
      needs_human_replies_blocked: true,
      worker_decides_targeting: false,
      worker_writes_copy: false
    },
    sender: { from: env.OUTREACH_FROM || '', reply_domain: env.REPLY_DOMAIN || '', resend_ready: Boolean(env.RESEND_API_KEY) },
    summary: summary || {},
    recent_runs: runs.results || [],
    prospects: prospects.results || [],
    message_queue: queue.results || [],
    pending_replies: replies.results || [],
    variant_performance_30d: variants.results || [],
    segment_performance_30d: segments.results || [],
    funnel_events: funnel.results || [],
    recent_agent_events: recentEvents.results || []
  };
}

async function handleAgent(request, env, path) {
  if (!isAdmin(request, env)) return json(request, env, { error: 'unauthorized' }, 401);

  if (request.method === 'GET' && path === '/v1/admin/agent/context') {
    return json(request, env, await agentContext(env));
  }

  if (request.method === 'POST' && path === '/v1/admin/agent/runs') {
    const body = await bodyJson(request) || {};
    const targetSend = Math.max(0, Number(body.target_send ?? body.targetSend ?? 0) || 0);
    if (targetSend > maxDailySends(env)) return json(request, env, { error: 'target_send_exceeds_guardrail', max: maxDailySends(env) }, 400);
    const id = uuid();
    await env.DB.prepare(`
      INSERT INTO agent_runs(id,status,agent_name,hypothesis,strategy_json,experiment_json,target_discovery,target_research,target_send,strategy_summary)
      VALUES(?,'running',?,?,?,?,?,?,?,?,?)
    `).bind(
      id, clean(body.agent_name || body.agentName || 'ChatGPT GTM', 120), clean(body.hypothesis, 2000), safeJson(body.strategy || body.strategy_json || {}),
      safeJson(body.experiment || body.experiment_json || {}), Math.max(0,Number(body.target_discovery ?? body.targetDiscovery ?? 0)||0),
      Math.max(0,Number(body.target_research ?? body.targetResearch ?? 0)||0), targetSend, clean(body.strategy_summary || body.strategySummary, 3000)
    ).run();
    return json(request, env, { ok: true, run_id: id, max_daily_sends: maxDailySends(env) }, 201);
  }

  if (request.method === 'POST' && path === '/v1/admin/agent/prospects') {
    const body = await bodyJson(request) || {};
    const runId = clean(body.run_id || body.runId, 80);
    const prospects = Array.isArray(body.prospects) ? body.prospects.slice(0, 200) : [];
    if (!prospects.length) return json(request, env, { error: 'prospects_required' }, 400);
    const results = [];
    for (let i = 0; i < prospects.length; i++) {
      try { results.push({ index: i, ok: true, ...(await upsertProspect(env, runId, prospects[i] || {})) }); }
      catch (error) { results.push({ index: i, ok: false, error: clean(error?.message, 400) }); }
    }
    return json(request, env, { ok: true, received: prospects.length, succeeded: results.filter(x=>x.ok).length, results }, 201);
  }

  if (request.method === 'POST' && path === '/v1/admin/agent/decisions') {
    const body = await bodyJson(request) || {};
    const runId = clean(body.run_id || body.runId, 80);
    const decisions = Array.isArray(body.decisions) ? body.decisions.slice(0, 200) : [];
    if (!decisions.length) return json(request, env, { error: 'decisions_required' }, 400);
    const results = [];
    for (let i = 0; i < decisions.length; i++) {
      try { results.push({ index: i, ok: true, ...(await queueDecision(env, runId, decisions[i] || {})) }); }
      catch (error) { results.push({ index: i, ok: false, error: clean(error?.message, 400), outreach_id: clean(decisions[i]?.outreach_id || decisions[i]?.outreachId,80) }); }
    }
    return json(request, env, { ok: true, received: decisions.length, succeeded: results.filter(x=>x.ok).length, results }, 201);
  }

  if (request.method === 'POST' && path === '/v1/admin/agent/send') {
    const body = await bodyJson(request) || {};
    const runId = clean(body.run_id || body.runId, 80);
    const queueIds = Array.isArray(body.queue_ids || body.queueIds) ? (body.queue_ids || body.queueIds).map(x=>clean(x,80)).filter(Boolean).slice(0,100) : [];
    const sent24 = await env.DB.prepare(`SELECT COUNT(*) AS n FROM agent_message_queue WHERE status='sent' AND sent_at>=datetime('now','-24 hours')`).first();
    const remaining = Math.max(0, maxDailySends(env) - Number(sent24?.n || 0));
    if (!remaining) return json(request, env, { error: 'rolling_24h_send_cap_reached', max: maxDailySends(env) }, 429);
    const requestedLimit = Math.max(1, Math.min(100, Number(body.limit || remaining) || remaining));
    const limit = Math.min(requestedLimit, remaining);
    let sql = `
      SELECT q.*,o.practice_name,o.email,o.do_not_contact,o.stage,o.email_status
      FROM agent_message_queue q JOIN outreach o ON o.id=q.outreach_id
      WHERE q.status='queued' AND (q.scheduled_for IS NULL OR datetime(q.scheduled_for)<=datetime('now'))`;
    const bindings = [];
    if (queueIds.length) {
      sql += ` AND q.id IN (${queueIds.map(()=>'?').join(',')})`;
      bindings.push(...queueIds);
    } else if (runId) {
      sql += ' AND q.run_id=?'; bindings.push(runId);
    } else {
      return json(request, env, { error: 'run_id_or_queue_ids_required' }, 400);
    }
    sql += ' ORDER BY COALESCE(q.scheduled_for,q.created_at),q.created_at LIMIT ?'; bindings.push(limit);
    const rows = await env.DB.prepare(sql).bind(...bindings).all();
    const results = [];
    for (const item of rows.results || []) {
      try { results.push({ ok: true, ...(await sendQueuedMessage(env, item)) }); }
      catch (error) {
        const message = clean(error?.message, 400);
        await env.DB.prepare(`UPDATE agent_message_queue SET status='failed',error=? WHERE id=?`).bind(message,item.id).run();
        await env.DB.prepare(`INSERT INTO agent_events(id,run_id,outreach_id,action,rationale,payload_json) VALUES(?,?,?,?,?,?)`)
          .bind(uuid(), item.run_id || null, item.outreach_id, 'message_failed', message, safeJson({ queue_id:item.id, kind:item.kind })).run();
        results.push({ ok: false, queue_id: item.id, outreach_id: item.outreach_id, practice_name: item.practice_name, error: message });
      }
    }
    return json(request, env, { ok: true, cap: maxDailySends(env), remaining_before_send: remaining, attempted: results.length, sent: results.filter(x=>x.ok).length, results });
  }

  const completeMatch = path.match(/^\/v1\/admin\/agent\/runs\/([^/]+)\/complete$/);
  if (request.method === 'POST' && completeMatch) {
    const runId = clean(completeMatch[1], 80);
    const body = await bodyJson(request) || {};
    const counts = await env.DB.prepare(`
      SELECT
        (SELECT COUNT(*) FROM agent_profiles WHERE last_run_id=?) AS enriched,
        (SELECT COUNT(DISTINCT outreach_id) FROM agent_message_queue WHERE run_id=?) AS selected,
        (SELECT COUNT(*) FROM agent_message_queue WHERE run_id=? AND status='sent') AS sent,
        (SELECT COUNT(DISTINCT o.id) FROM agent_message_queue q JOIN outreach o ON o.id=q.outreach_id WHERE q.run_id=? AND o.last_reply_at IS NOT NULL) AS replied,
        (SELECT COUNT(DISTINCT o.id) FROM agent_message_queue q JOIN outreach o ON o.id=q.outreach_id WHERE q.run_id=? AND o.reply_category IN ('interested','demo','question')) AS positive,
        (SELECT COUNT(DISTINCT o.id) FROM agent_message_queue q JOIN outreach o ON o.id=q.outreach_id WHERE q.run_id=? AND o.stage IN ('demo','pilot','active')) AS progressed
    `).bind(runId,runId,runId,runId,runId,runId).first();
    const result = await env.DB.prepare(`
      UPDATE agent_runs SET status='completed',enriched_count=?,selected_count=?,sent_count=?,reply_count=?,positive_reply_count=?,progressed_count=?,
        strategy_summary=COALESCE(NULLIF(?,''),strategy_summary),next_strategy=?,observations_json=?,completed_at=CURRENT_TIMESTAMP
      WHERE id=?
    `).bind(Number(counts?.enriched||0),Number(counts?.selected||0),Number(counts?.sent||0),Number(counts?.replied||0),Number(counts?.positive||0),Number(counts?.progressed||0),
      clean(body.strategy_summary || body.strategySummary,3000),clean(body.next_strategy || body.nextStrategy,4000),safeJson(body.observations || body.observations_json || {}),runId).run();
    if (!result.meta?.changes) return json(request, env, { error: 'run_not_found' }, 404);
    return json(request, env, { ok: true, run_id: runId, counts });
  }

  if (path.startsWith('/v1/admin/agent/growth')) {
    try { return json(request, env, await handleGrowthOs(request, env, path)); }
    catch (error) { return json(request, env, { error: clean(error?.message, 400) || 'growth_os_failed' }, 400); }
  }

  return json(request, env, { error: 'agent_route_not_found' }, 404);
}

export { domainFromWebsite };

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: responseHeaders(request, env) });
    const path = new URL(request.url).pathname;
    if (path.startsWith('/v1/admin/agent/')) return handleAgent(request, env, path);
    return base.fetch(request, env, ctx);
  }
};
