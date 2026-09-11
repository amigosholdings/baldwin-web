const EVENT_NAMES = new Set([
  'referral_view',
  'download_click',
  'app_signup',
  'baseline_complete',
  'second_session',
  'subscription_started',
  'tool_used',
  'tool_open',
  'tool_cta_click',
  'blog_view',
  'blog_cta_click'
]);

const STAGES = new Set(['new','identified','contacted','responded','demo','pilot','active','lost']);
const PROVIDER_STATUSES = new Set(['pilot','active','paused','lost']);
const REPLY_CATEGORIES = new Set([
  'interested','question','demo','not_now','not_interested','unsubscribe','wrong_person','out_of_office','other'
]);
const EMAIL_STATUS_RANK = { sent: 1, delivery_delayed: 1, delivered: 2, opened: 3, clicked: 4, replied: 5, failed: 90, bounced: 91, suppressed: 92, complained: 93 };

function uuid() { return crypto.randomUUID(); }
function slug(value = '') {
  return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64);
}
function clean(value, max = 1000) { return String(value ?? '').trim().slice(0, max); }
function extractEmailAddress(value = '') {
  const match = String(value).match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0].toLowerCase() : '';
}
function allowedOrigin(request, env) {
  const origin = request.headers.get('Origin');
  if (!origin) return '*';
  const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean);
  return allowed.includes(origin) ? origin : 'null';
}
function headers(request, env, extra = {}) {
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
function json(request, env, body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), { status, headers: headers(request, env, extra) });
}
function text(request, env, body, status = 200, contentType = 'text/plain; charset=utf-8') {
  return new Response(body, { status, headers: { ...headers(request, env), 'content-type': contentType } });
}
function isAdmin(request, env) {
  const token = request.headers.get('x-admin-token') || '';
  return Boolean(env.ADMIN_TOKEN) && token === env.ADMIN_TOKEN;
}
async function bodyJson(request) { try { return await request.json(); } catch { return null; } }

async function providerByCode(env, rawCode) {
  const code = slug(rawCode);
  if (!code) return null;
  return env.DB.prepare(`SELECT id, code, name, website, city, state, status FROM providers WHERE code = ? LIMIT 1`).bind(code).first();
}

async function dashboard(env) {
  const [totals, providers, leads, outreach, messages] = await Promise.all([
    env.DB.prepare(`SELECT event_name, COUNT(*) AS n FROM events GROUP BY event_name ORDER BY event_name`).all(),
    env.DB.prepare(`
      SELECT p.id, p.code, p.name, p.website, p.city, p.state, p.status, p.created_at,
        SUM(CASE WHEN e.event_name='referral_view' THEN 1 ELSE 0 END) AS referral_views,
        SUM(CASE WHEN e.event_name='download_click' THEN 1 ELSE 0 END) AS download_clicks,
        COUNT(DISTINCT CASE WHEN e.event_name='tool_used' THEN COALESCE(e.user_id,e.anonymous_id,e.id) END) AS tool_activations,
        COUNT(DISTINCT CASE WHEN e.event_name='app_signup' THEN COALESCE(e.user_id,e.anonymous_id,e.id) END) AS app_signups,
        COUNT(DISTINCT CASE WHEN e.event_name='baseline_complete' THEN COALESCE(e.user_id,e.anonymous_id,e.id) END) AS baselines,
        COUNT(DISTINCT CASE WHEN e.event_name='second_session' THEN COALESCE(e.user_id,e.anonymous_id,e.id) END) AS second_sessions,
        COUNT(DISTINCT CASE WHEN e.event_name='subscription_started' THEN COALESCE(e.user_id,e.anonymous_id,e.id) END) AS subscriptions
      FROM providers p LEFT JOIN events e ON e.provider_code = p.code
      GROUP BY p.id, p.code, p.name, p.website, p.city, p.state, p.status, p.created_at
      ORDER BY p.created_at DESC
    `).all(),
    env.DB.prepare(`SELECT * FROM provider_leads ORDER BY created_at DESC LIMIT 500`).all(),
    env.DB.prepare(`
      SELECT * FROM outreach
      ORDER BY CASE stage WHEN 'responded' THEN 0 WHEN 'demo' THEN 1 WHEN 'pilot' THEN 2 WHEN 'identified' THEN 3 WHEN 'contacted' THEN 4 WHEN 'active' THEN 5 ELSE 6 END,
        COALESCE(priority, 9) ASC, created_at DESC
      LIMIT 1000
    `).all(),
    env.DB.prepare(`
      SELECT m.*, o.practice_name, o.email AS practice_email, o.stage AS outreach_stage
      FROM email_messages m JOIN outreach o ON o.id=m.outreach_id
      ORDER BY CASE WHEN m.direction='inbound' AND m.handled_at IS NULL THEN 0 ELSE 1 END, m.created_at DESC
      LIMIT 250
    `).all()
  ]);
  return {
    totals: totals.results || [], providers: providers.results || [], leads: leads.results || [],
    outreach: outreach.results || [], email_messages: messages.results || [],
    email_config: {
      resend: Boolean(env.RESEND_API_KEY),
      from: env.OUTREACH_FROM || '',
      reply_domain: env.REPLY_DOMAIN || '',
      ai: Boolean(env.OPENAI_API_KEY),
      model: env.OPENAI_MODEL || 'gpt-5.4-nano',
      webhook: Boolean(env.RESEND_WEBHOOK_SECRET)
    }
  };
}

function csvEscape(value) {
  const s = String(value ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function replyAddress(env, outreachId) {
  const domain = clean(env.REPLY_DOMAIN, 180).replace(/^@/, '');
  if (!domain) return extractEmailAddress(env.OUTREACH_FROM || '');
  return `reply+${outreachId}@${domain}`;
}

function outreachCopy(outreach) {
  const subject = 'A simpler way for patients to track hair progress';
  const body = `Hi ${outreach.practice_name} team —\n\nI built Baldwin, an iPhone app that gives hair-loss patients a consistent way to photograph and compare their progress between visits.\n\nI’m opening a small free pilot for independent hair-restoration practices. There’s no software for staff to learn: patients scan a practice-specific QR code at checkout, capture a baseline, and Baldwin handles the follow-up.\n\nWould you be open to a 10-minute look this week?\n\nBest,\nShaun\nBaldwin\nhttps://trackmyhairloss.com/providers/`;
  return { subject, body };
}

async function resendRequest(env, path, init = {}) {
  if (!env.RESEND_API_KEY) throw new Error('RESEND_API_KEY_not_configured');
  const response = await fetch(`https://api.resend.com${path}`, {
    ...init,
    headers: { 'authorization': `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json', ...(init.headers || {}) }
  });
  const raw = await response.text();
  let payload = null;
  try { payload = raw ? JSON.parse(raw) : {}; } catch { payload = { raw }; }
  if (!response.ok) throw new Error(`Resend ${response.status}: ${clean(payload?.message || payload?.raw || raw, 500)}`);
  return payload;
}

async function sendResendEmail(env, { outreach, to, subject, body, inReplyTo = '', references = '', idempotencyKey = '' }) {
  if (!env.OUTREACH_FROM) throw new Error('OUTREACH_FROM_not_configured');
  const replyTo = replyAddress(env, outreach.id);
  const customHeaders = {};
  if (inReplyTo) customHeaders['In-Reply-To'] = inReplyTo;
  if (references) customHeaders['References'] = references;
  if (replyTo) customHeaders['List-Unsubscribe'] = `<mailto:${replyTo}?subject=unsubscribe>`;
  const request = {
    from: env.OUTREACH_FROM,
    to: [to],
    subject,
    text: body,
    reply_to: replyTo || undefined,
    headers: Object.keys(customHeaders).length ? customHeaders : undefined
  };
  return resendRequest(env, '/emails', { method: 'POST', headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}, body: JSON.stringify(request) });
}

async function sendOutreach(env, outreach, { force = false } = {}) {
  if (!env.REPLY_DOMAIN) throw new Error('REPLY_DOMAIN_not_configured');
  if (!outreach?.email) throw new Error('prospect_has_no_email');
  if (Number(outreach.do_not_contact)) throw new Error('prospect_is_suppressed');
  if (!force && ['sent','delivered','opened','clicked','replied'].includes(String(outreach.email_status || ''))) {
    throw new Error('already_sent');
  }
  const copy = outreachCopy(outreach);
  const sent = await sendResendEmail(env, { outreach, to: outreach.email, subject: copy.subject, body: copy.body, idempotencyKey: `baldwin-initial-${outreach.id}` });
  const messageId = uuid();
  await env.DB.batch([
    env.DB.prepare(`
      INSERT INTO email_messages (id,outreach_id,direction,provider,provider_email_id,from_email,to_email,subject,text_body,status)
      VALUES (?,?,'outbound','resend',?,?,?,?,?,'sent')
    `).bind(messageId, outreach.id, clean(sent.id, 180), extractEmailAddress(env.OUTREACH_FROM), clean(outreach.email, 180), copy.subject, copy.body),
    env.DB.prepare(`
      UPDATE outreach SET stage=CASE WHEN stage='identified' THEN 'contacted' ELSE stage END,
        email_status='sent', last_contacted_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `).bind(outreach.id)
  ]);
  return { id: sent.id, message_id: messageId, subject: copy.subject };
}

function emailBody(email = {}) {
  if (email.text) return String(email.text);
  return String(email.html || '')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/p\s*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function stripQuotedReply(value = '') {
  let text = String(value).replace(/\r/g, '').trim();
  text = text.split(/\nOn .{0,180}wrote:\n/i)[0];
  text = text.split(/\nFrom:\s.+\nSent:\s.+/i)[0];
  text = text.split('\n').filter(line => !/^>/.test(line.trim())).join('\n').trim();
  return text.slice(0, 12000);
}

function heuristicReplyAnalysis(textBody) {
  const t = textBody.toLowerCase();
  let category = 'other';
  if (/unsubscribe|remove me|stop (emailing|contacting)|opt[ -]?out|do not (email|contact)/i.test(t)) category = 'unsubscribe';
  else if (/out of (the )?office|automatic reply|auto.?reply|away from (the )?office/i.test(t)) category = 'out_of_office';
  else if (/not interested|no thank|not a fit|we('re| are) all set|please pass/i.test(t)) category = 'not_interested';
  else if (/wrong person|not the right person|you should (email|contact|reach)|reach out to/i.test(t)) category = 'wrong_person';
  else if (/not now|circle back|follow up (in|next)|next (month|quarter|year)|later this/i.test(t)) category = 'not_now';
  else if (/demo|schedule|calendar|call|meet|availability|available (on|at|this|next)|10.?minute/i.test(t)) category = 'demo';
  else if (/interested|sounds good|open to|sure|yes[,!. ]|tell me more|learn more/i.test(t)) category = 'interested';
  else if (/\?|price|cost|how does|what does|does it|can you/i.test(t)) category = 'question';

  const drafts = {
    interested: 'Thanks for getting back to me. Happy to show you how it works — it’s deliberately lightweight for the practice and takes about 10 minutes to walk through. What does your availability look like this week?',
    demo: 'Absolutely — happy to show you. I can keep it to 10 minutes and work around your schedule. What time this week is easiest for you?',
    question: 'Thanks for getting back to me. The pilot is free for the practice and there’s no staff software to learn — patients simply use your practice-specific QR code and Baldwin handles the tracking flow. Happy to answer anything else or show you the workflow in 10 minutes.',
    not_now: 'Understood — thanks for letting me know. I’ll leave it there for now and can circle back later.',
    wrong_person: 'Thanks for pointing me in the right direction. Is there someone on the team who handles patient experience or hair-restoration follow-up that you’d suggest I contact?',
    not_interested: 'Understood — thanks for the reply. I won’t follow up further.',
    unsubscribe: 'Understood. I won’t contact you again.',
    out_of_office: '',
    other: 'Thanks for getting back to me. Happy to answer any questions or give you a quick look at the patient workflow.'
  };
  return {
    category,
    summary: clean(textBody.replace(/\s+/g, ' '), 220),
    draft_reply: drafts[category] || drafts.other,
    needs_human: ['question','other'].includes(category)
  };
}

function extractResponseText(response) {
  if (typeof response?.output_text === 'string') return response.output_text;
  const chunks = [];
  for (const item of response?.output || []) {
    for (const content of item?.content || []) if (typeof content?.text === 'string') chunks.push(content.text);
  }
  return chunks.join('\n');
}

async function analyzeReply(env, outreach, email) {
  const body = stripQuotedReply(emailBody(email));
  if (!env.OPENAI_API_KEY || !body) return heuristicReplyAnalysis(body || email.subject || '');
  const schema = {
    type: 'object', additionalProperties: false,
    properties: {
      category: { type: 'string', enum: [...REPLY_CATEGORIES] },
      summary: { type: 'string' },
      draft_reply: { type: 'string' },
      needs_human: { type: 'boolean' }
    },
    required: ['category','summary','draft_reply','needs_human']
  };
  const input = `Practice: ${outreach.practice_name}\nOriginal outreach purpose: offer a free pilot of Baldwin, an iPhone app that helps hair-loss patients take consistent progress photos between visits.\nInbound subject: ${email.subject || ''}\nInbound reply:\n${body}`;
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'authorization': `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || 'gpt-5.4-nano',
      store: false,
      reasoning: { effort: 'none' },
      text: { verbosity: 'low', format: { type: 'json_schema', name: 'baldwin_reply_analysis', strict: true, schema } },
      instructions: 'Classify this B2B clinic reply and draft a concise founder-style response. Never make medical efficacy claims. Never invent pricing, security, integrations, dates, or availability. If the sender asks a clinical, legal, privacy, security, contract, pricing-negotiation, or other substantive question that is not directly answered by the supplied context, set needs_human=true and draft a short acknowledgement rather than guessing. Keep the draft under 90 words. For unsubscribe or explicit rejection, confirm politely and do not sell further. Return only the requested schema.',
      input
    })
  });
  if (!response.ok) return heuristicReplyAnalysis(body);
  const payload = await response.json();
  try {
    const parsed = JSON.parse(extractResponseText(payload));
    if (!REPLY_CATEGORIES.has(parsed.category)) throw new Error('bad_category');
    return {
      category: parsed.category,
      summary: clean(parsed.summary, 500),
      draft_reply: clean(parsed.draft_reply, 3000),
      needs_human: Boolean(parsed.needs_human)
    };
  } catch {
    return heuristicReplyAnalysis(body);
  }
}

function categoryStage(category, currentStage) {
  if (['unsubscribe','not_interested'].includes(category)) return 'lost';
  if (category === 'demo') return 'demo';
  if (['interested','question','wrong_person','not_now','other'].includes(category) && ['identified','contacted'].includes(currentStage)) return 'responded';
  return currentStage;
}

function b64Bytes(value) {
  let s = String(value).replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const decoded = atob(s);
  return Uint8Array.from(decoded, c => c.charCodeAt(0));
}
function bytesEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}
async function verifyResendWebhook(request, env, payload) {
  if (!env.RESEND_WEBHOOK_SECRET) return false;
  const id = request.headers.get('svix-id');
  const timestamp = request.headers.get('svix-timestamp');
  const signatures = request.headers.get('svix-signature');
  if (!id || !timestamp || !signatures) return false;
  const epoch = Number(timestamp);
  if (!Number.isFinite(epoch) || Math.abs(Date.now() / 1000 - epoch) > 300) return false;
  let secret = String(env.RESEND_WEBHOOK_SECRET);
  if (secret.startsWith('whsec_')) secret = secret.slice(6);
  let keyBytes;
  try { keyBytes = b64Bytes(secret); } catch { return false; }
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signed = new TextEncoder().encode(`${id}.${timestamp}.${payload}`);
  const expected = new Uint8Array(await crypto.subtle.sign('HMAC', key, signed));
  for (const candidate of signatures.trim().split(/\s+/)) {
    const [version, sig] = candidate.split(',', 2);
    if (version !== 'v1' || !sig) continue;
    try { if (bytesEqual(expected, b64Bytes(sig))) return true; } catch {}
  }
  return false;
}

async function findOutreachForInbound(env, email) {
  for (const addr of email.to || []) {
    const m = String(addr).match(/reply\+([a-z0-9-]+)@/i);
    if (m) {
      const row = await env.DB.prepare('SELECT * FROM outreach WHERE id=? LIMIT 1').bind(m[1]).first();
      if (row) return row;
    }
  }
  const sender = extractEmailAddress(email.from || '');
  if (!sender) return null;
  return env.DB.prepare(`SELECT * FROM outreach WHERE lower(email)=lower(?) ORDER BY COALESCE(last_contacted_at, created_at) DESC LIMIT 1`).bind(sender).first();
}

async function processInboundEmail(env, event) {
  const emailId = clean(event?.data?.email_id, 180);
  if (!emailId) return;
  const existing = await env.DB.prepare('SELECT id FROM email_messages WHERE provider_email_id=? LIMIT 1').bind(emailId).first();
  if (existing) return;
  const email = await resendRequest(env, `/emails/receiving/${encodeURIComponent(emailId)}`);
  const outreach = await findOutreachForInbound(env, email);
  if (!outreach) return;
  const analysis = await analyzeReply(env, outreach, email);
  const incomingBody = stripQuotedReply(emailBody(email));
  const sender = extractEmailAddress(email.from || '');
  const newStage = categoryStage(analysis.category, outreach.stage);
  const suppress = ['unsubscribe','not_interested'].includes(analysis.category) ? 1 : Number(outreach.do_not_contact || 0);
  const messageId = uuid();
  await env.DB.batch([
    env.DB.prepare(`
      INSERT INTO email_messages
        (id,outreach_id,direction,provider,provider_email_id,provider_message_id,from_email,to_email,subject,text_body,status,classification,summary,draft_reply,needs_human)
      VALUES (?,?,'inbound','resend',?,?,?,?,?,?,'received',?,?,?,?)
    `).bind(
      messageId, outreach.id, emailId, clean(email.message_id, 500), sender,
      clean((email.to || [])[0], 180), clean(email.subject, 500), incomingBody,
      analysis.category, analysis.summary, analysis.draft_reply, analysis.needs_human ? 1 : 0
    ),
    env.DB.prepare(`
      UPDATE outreach SET stage=?, email_status='replied', last_reply_at=CURRENT_TIMESTAMP,
        reply_category=?, reply_summary=?, draft_reply=?, do_not_contact=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `).bind(newStage, analysis.category, analysis.summary, analysis.draft_reply, suppress, outreach.id)
  ]);
}

async function processResendWebhook(request, env) {
  const payload = await request.text();
  if (!(await verifyResendWebhook(request, env, payload))) return json(request, env, { error: 'invalid_signature' }, 401);
  let event;
  try { event = JSON.parse(payload); } catch { return json(request, env, { error: 'invalid_json' }, 400); }
  const svixId = request.headers.get('svix-id');
  const inserted = await env.DB.prepare(`INSERT OR IGNORE INTO webhook_events (id,event_type) VALUES (?,?)`).bind(svixId, clean(event.type, 120)).run();
  if (!inserted.meta?.changes) return json(request, env, { ok: true, duplicate: true });

  if (event.type === 'email.received') {
    try { await processInboundEmail(env, event); }
    catch (error) {
      await env.DB.prepare('DELETE FROM webhook_events WHERE id=?').bind(svixId).run();
      return json(request, env, { error: 'inbound_processing_failed', detail: clean(error?.message, 300) }, 500);
    }
    return json(request, env, { ok: true });
  }

  const providerEmailId = clean(event?.data?.email_id, 180);
  if (providerEmailId && /^email\.(sent|delivered|opened|clicked|bounced|complained|delivery_delayed|failed|suppressed)$/.test(event.type || '')) {
    const status = event.type.slice('email.'.length);
    const state = await env.DB.prepare(`SELECT m.outreach_id, m.status AS message_status, o.email_status AS outreach_email_status FROM email_messages m JOIN outreach o ON o.id=m.outreach_id WHERE m.provider_email_id=? LIMIT 1`).bind(providerEmailId).first();
    if (state) {
      const suppress = ['bounced','complained','suppressed'].includes(status);
      const messageShouldAdvance = (EMAIL_STATUS_RANK[status] || 0) >= (EMAIL_STATUS_RANK[state.message_status] || 0);
      const outreachShouldAdvance = state.outreach_email_status !== 'replied' && ((EMAIL_STATUS_RANK[status] || 0) >= (EMAIL_STATUS_RANK[state.outreach_email_status] || 0));
      const statements = [];
      if (messageShouldAdvance) statements.push(env.DB.prepare('UPDATE email_messages SET status=? WHERE provider_email_id=?').bind(status, providerEmailId));
      if (outreachShouldAdvance || suppress) statements.push(env.DB.prepare(`UPDATE outreach SET email_status=?, do_not_contact=CASE WHEN ? THEN 1 ELSE do_not_contact END, updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(status, suppress ? 1 : 0, state.outreach_id));
      if (statements.length) await env.DB.batch(statements);
    }
  }
  return json(request, env, { ok: true });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: headers(request, env) });
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'GET' && path === '/health') return json(request, env, { ok: true, service: 'baldwin-growth-api' });
    if (request.method === 'POST' && path === '/v1/webhooks/resend') return processResendWebhook(request, env);

    if (request.method === 'GET' && path.startsWith('/v1/providers/')) {
      const provider = await providerByCode(env, decodeURIComponent(path.slice('/v1/providers/'.length)));
      if (!provider) return json(request, env, { error: 'not_found' }, 404);
      return json(request, env, provider);
    }

    if (request.method === 'POST' && path === '/v1/events') {
      const body = await bodyJson(request);
      if (!body || !EVENT_NAMES.has(body.event)) return json(request, env, { error: 'invalid_event' }, 400);
      const metadata = body.metadata && typeof body.metadata === 'object' ? JSON.stringify(body.metadata).slice(0, 4000) : null;
      await env.DB.prepare(`INSERT INTO events (id,event_name,provider_code,anonymous_id,user_id,source,campaign,metadata_json) VALUES (?,?,?,?,?,?,?,?)`)
        .bind(uuid(), body.event, body.providerCode ? slug(body.providerCode) : null, body.anonymousId ? clean(body.anonymousId,128) : null,
          body.userId ? clean(body.userId,128) : null, body.source ? clean(body.source,80) : null, body.campaign ? clean(body.campaign,120) : null, metadata).run();
      return json(request, env, { ok: true }, 201);
    }

    if (request.method === 'POST' && path === '/v1/provider-leads') {
      const body = await bodyJson(request);
      if (!body?.practice_name || !body?.email) return json(request, env, { error: 'practice_name_and_email_required' }, 400);
      if (body.company_site) return json(request, env, { ok: true }, 201);
      const email = clean(body.email,180);
      if (!/^\S+@\S+\.\S+$/.test(email)) return json(request, env, { error: 'invalid_email' }, 400);
      const duplicate = await env.DB.prepare(`SELECT id FROM provider_leads WHERE lower(email)=lower(?) AND created_at >= datetime('now','-1 day') LIMIT 1`).bind(email).first();
      if (duplicate) return json(request, env, { ok: true, duplicate: true }, 200);
      await env.DB.prepare(`INSERT INTO provider_leads (id,practice_name,contact_name,email,phone,website,city,state,notes,stage) VALUES (?,?,?,?,?,?,?,?,?,'new')`)
        .bind(uuid(), clean(body.practice_name,160), clean(body.contact_name,160), email, clean(body.phone,80), clean(body.website,240), clean(body.city,120), clean(body.state,80), clean(body.notes,1000)).run();
      return json(request, env, { ok: true }, 201);
    }

    if (path.startsWith('/v1/admin/')) {
      if (!isAdmin(request, env)) return json(request, env, { error: 'unauthorized' }, 401);

      if (request.method === 'GET' && path === '/v1/admin/dashboard') return json(request, env, await dashboard(env));

      if (request.method === 'POST' && path === '/v1/admin/providers') {
        const body = await bodyJson(request);
        if (!body?.name) return json(request, env, { error: 'name_required' }, 400);
        let code = slug(body.code || body.name) || `provider-${Math.random().toString(36).slice(2,8)}`;
        if (await env.DB.prepare('SELECT 1 FROM providers WHERE code=?').bind(code).first()) code = `${code}-${Math.random().toString(36).slice(2,6)}`;
        const id = uuid();
        await env.DB.prepare(`INSERT INTO providers (id,code,name,website,city,state,status) VALUES (?,?,?,?,?,?,'pilot')`)
          .bind(id, code, clean(body.name,160), clean(body.website,240), clean(body.city,120), clean(body.state,80)).run();
        return json(request, env, { ok: true, provider: { id, code, name: body.name, referral_url: `https://trybaldwin.app/?ref=${encodeURIComponent(code)}` } }, 201);
      }

      if (request.method === 'POST' && path === '/v1/admin/outreach') {
        const body = await bodyJson(request);
        if (!body?.practiceName) return json(request, env, { error: 'practice_name_required' }, 400);
        const id = uuid();
        await env.DB.prepare(`INSERT INTO outreach (id,practice_name,city,category,stage) VALUES (?,?,?,?, 'identified')`)
          .bind(id, clean(body.practiceName,160), clean(body.city,120), clean(body.category,100)).run();
        return json(request, env, { ok: true, id }, 201);
      }

      const sendMatch = path.match(/^\/v1\/admin\/outreach\/([^/]+)\/send$/);
      if (request.method === 'POST' && sendMatch) {
        const body = await bodyJson(request) || {};
        const outreach = await env.DB.prepare('SELECT * FROM outreach WHERE id=? LIMIT 1').bind(sendMatch[1]).first();
        if (!outreach) return json(request, env, { error: 'not_found' }, 404);
        try { return json(request, env, { ok: true, ...(await sendOutreach(env, outreach, { force: Boolean(body.force) })) }, 201); }
        catch (error) { return json(request, env, { error: clean(error?.message,300) }, error?.message === 'already_sent' ? 409 : 400); }
      }

      if (request.method === 'POST' && path === '/v1/admin/email/test') {
        const body = await bodyJson(request) || {};
        const to = extractEmailAddress(body.to || '');
        if (!to) return json(request, env, { error: 'valid_to_required' }, 400);
        if (!env.OUTREACH_FROM) return json(request, env, { error: 'OUTREACH_FROM_not_configured' }, 400);
        try {
          const sent = await resendRequest(env, '/emails', {
            method: 'POST',
            headers: { 'Idempotency-Key': `baldwin-test-${Date.now()}` },
            body: JSON.stringify({ from: env.OUTREACH_FROM, to: [to], subject: 'Baldwin email operator test', text: 'Baldwin email sending is connected. This is a test from the Growth Ops dashboard.' })
          });
          return json(request, env, { ok: true, id: sent.id }, 201);
        } catch (error) { return json(request, env, { error: clean(error?.message, 400) }, 400); }
      }

      if (request.method === 'POST' && path === '/v1/admin/email/test-agent') {
        const body = await bodyJson(request) || {};
        const sample = clean(body.text, 6000);
        if (!sample) return json(request, env, { error: 'text_required' }, 400);
        const analysis = await analyzeReply(env, { practice_name: 'Test Practice', stage: 'contacted' }, { subject: 'Re: Baldwin', text: sample });
        return json(request, env, { ok: true, analysis });
      }

      if (request.method === 'POST' && path === '/v1/admin/outreach/send-batch') {
        const body = await bodyJson(request) || {};
        const priority = Math.max(1, Math.min(3, Number(body.priority || 1)));
        const limit = Math.max(1, Math.min(10, Number(body.limit || 5)));
        const candidates = await env.DB.prepare(`
          SELECT * FROM outreach WHERE priority=? AND stage='identified' AND COALESCE(do_not_contact,0)=0 AND email IS NOT NULL AND trim(email)<>''
            AND COALESCE(email_status,'') NOT IN ('sent','delivered','opened','clicked','replied')
          ORDER BY created_at ASC LIMIT ?
        `).bind(priority, limit).all();
        const results = [];
        for (const outreach of candidates.results || []) {
          try { results.push({ outreach_id: outreach.id, practice_name: outreach.practice_name, ok: true, ...(await sendOutreach(env, outreach)) }); }
          catch (error) { results.push({ outreach_id: outreach.id, practice_name: outreach.practice_name, ok: false, error: clean(error?.message,300) }); }
        }
        return json(request, env, { ok: true, requested: limit, sent: results.filter(x => x.ok).length, results });
      }

      const suppressMatch = path.match(/^\/v1\/admin\/outreach\/([^/]+)\/suppress$/);
      if (request.method === 'POST' && suppressMatch) {
        await env.DB.prepare(`UPDATE outreach SET do_not_contact=1, email_status='suppressed', updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(suppressMatch[1]).run();
        return json(request, env, { ok: true });
      }

      const promoteMatch = path.match(/^\/v1\/admin\/outreach\/([^/]+)\/promote$/);
      if (request.method === 'POST' && promoteMatch) {
        const lead = await env.DB.prepare('SELECT * FROM outreach WHERE id=? LIMIT 1').bind(promoteMatch[1]).first();
        if (!lead) return json(request, env, { error: 'not_found' }, 404);
        let existing = await env.DB.prepare('SELECT id, code, name, website, city, state, status FROM providers WHERE lower(name)=lower(?) LIMIT 1').bind(lead.practice_name).first();
        if (!existing) {
          let code = slug(lead.practice_name) || `provider-${Math.random().toString(36).slice(2,8)}`;
          if (await env.DB.prepare('SELECT 1 FROM providers WHERE code=?').bind(code).first()) code = `${code}-${Math.random().toString(36).slice(2,6)}`;
          const id = uuid();
          await env.DB.prepare(`INSERT INTO providers (id,code,name,website,city,email,status) VALUES (?,?,?,?,?,?,'pilot')`)
            .bind(id, code, lead.practice_name, lead.website || '', lead.city || '', lead.email || '').run();
          existing = { id, code, name: lead.practice_name, website: lead.website || '', city: lead.city || '', state: '', status: 'pilot' };
        }
        await env.DB.prepare(`UPDATE outreach SET stage='pilot', updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(lead.id).run();
        return json(request, env, { ok: true, provider: { ...existing, referral_url: `https://trybaldwin.app/?ref=${encodeURIComponent(existing.code)}`, kit_url: `https://trackmyhairloss.com/provider-kit/?ref=${encodeURIComponent(existing.code)}` } });
      }

      const replyMatch = path.match(/^\/v1\/admin\/email\/([^/]+)\/reply$/);
      if (request.method === 'POST' && replyMatch) {
        const body = await bodyJson(request) || {};
        const message = await env.DB.prepare(`SELECT m.id AS message_row_id, m.outreach_id, m.provider_message_id, m.from_email, m.subject, m.draft_reply AS message_draft_reply, o.email AS outreach_email, o.do_not_contact FROM email_messages m JOIN outreach o ON o.id=m.outreach_id WHERE m.id=? AND m.direction='inbound' LIMIT 1`).bind(replyMatch[1]).first();
        if (!message) return json(request, env, { error: 'not_found' }, 404);
        if (Number(message.do_not_contact) && !body.force) return json(request, env, { error: 'prospect_is_suppressed' }, 409);
        const replyBody = clean(body.body || message.message_draft_reply, 6000);
        if (!replyBody) return json(request, env, { error: 'reply_body_required' }, 400);
        const subject = /^re:/i.test(message.subject || '') ? message.subject : `Re: ${message.subject || 'Baldwin'}`;
        const target = message.from_email || message.outreach_email;
        const sent = await sendResendEmail(env, {
          outreach: { id: message.outreach_id }, to: target, subject, body: replyBody,
          inReplyTo: message.provider_message_id || '', references: message.provider_message_id || '', idempotencyKey: `baldwin-reply-${replyMatch[1]}`
        });
        const outId = uuid();
        await env.DB.batch([
          env.DB.prepare(`INSERT INTO email_messages (id,outreach_id,direction,provider,provider_email_id,from_email,to_email,subject,text_body,status) VALUES (?,?,'outbound','resend',?,?,?,?,?,'sent')`)
            .bind(outId, message.outreach_id, clean(sent.id,180), extractEmailAddress(env.OUTREACH_FROM), target, subject, replyBody),
          env.DB.prepare(`UPDATE email_messages SET handled_at=CURRENT_TIMESTAMP WHERE id=?`).bind(replyMatch[1]),
          env.DB.prepare(`UPDATE outreach SET draft_reply=NULL, updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(message.outreach_id)
        ]);
        return json(request, env, { ok: true, id: sent.id }, 201);
      }

      const redraftMatch = path.match(/^\/v1\/admin\/email\/([^/]+)\/redraft$/);
      if (request.method === 'POST' && redraftMatch) {
        const message = await env.DB.prepare(`SELECT m.*, o.practice_name, o.stage FROM email_messages m JOIN outreach o ON o.id=m.outreach_id WHERE m.id=? AND m.direction='inbound' LIMIT 1`).bind(redraftMatch[1]).first();
        if (!message) return json(request, env, { error: 'not_found' }, 404);
        const analysis = await analyzeReply(env, message, { subject: message.subject, text: message.text_body });
        await env.DB.batch([
          env.DB.prepare(`UPDATE email_messages SET classification=?,summary=?,draft_reply=?,needs_human=? WHERE id=?`).bind(analysis.category, analysis.summary, analysis.draft_reply, analysis.needs_human ? 1 : 0, message.id),
          env.DB.prepare(`UPDATE outreach SET reply_category=?,reply_summary=?,draft_reply=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(analysis.category, analysis.summary, analysis.draft_reply, message.outreach_id)
        ]);
        return json(request, env, { ok: true, analysis });
      }

      const handledMatch = path.match(/^\/v1\/admin\/email\/([^/]+)\/handled$/);
      if (request.method === 'POST' && handledMatch) {
        const result = await env.DB.prepare('UPDATE email_messages SET handled_at=CURRENT_TIMESTAMP WHERE id=?').bind(handledMatch[1]).run();
        if (!result.meta?.changes) return json(request, env, { error: 'not_found' }, 404);
        return json(request, env, { ok: true });
      }

      const providerStatusMatch = path.match(/^\/v1\/admin\/providers\/([^/]+)\/status$/);
      if (request.method === 'PATCH' && providerStatusMatch) {
        const body = await bodyJson(request); const status = String(body?.status || '');
        if (!PROVIDER_STATUSES.has(status)) return json(request, env, { error: 'invalid_status' }, 400);
        const result = await env.DB.prepare('UPDATE providers SET status=? WHERE id=?').bind(status, providerStatusMatch[1]).run();
        if (!result.meta?.changes) return json(request, env, { error: 'not_found' }, 404);
        return json(request, env, { ok: true });
      }

      const stageMatch = path.match(/^\/v1\/admin\/(leads|outreach)\/([^/]+)\/stage$/);
      if (request.method === 'PATCH' && stageMatch) {
        const [, type, id] = stageMatch; const body = await bodyJson(request); const stage = String(body?.stage || '');
        if (!STAGES.has(stage)) return json(request, env, { error: 'invalid_stage' }, 400);
        const table = type === 'leads' ? 'provider_leads' : 'outreach';
        const result = await env.DB.prepare(`UPDATE ${table} SET stage=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(stage, id).run();
        if (!result.meta?.changes) return json(request, env, { error: 'not_found' }, 404);
        return json(request, env, { ok: true });
      }

      if (request.method === 'GET' && path === '/v1/admin/export.csv') {
        const data = await dashboard(env);
        const lines = [['type','id','practice_name','email','city','state','category','priority','stage','email_status','reply_category','do_not_contact','code','created_at']];
        for (const x of data.providers) lines.push(['provider',x.id,x.name,'',x.city,x.state,'','',x.status,'','','',x.code,x.created_at]);
        for (const x of data.leads) lines.push(['lead',x.id,x.practice_name,x.email,x.city,x.state,'','',x.stage,'','','','',x.created_at]);
        for (const x of data.outreach) lines.push(['outreach',x.id,x.practice_name,x.email,x.city,'',x.category,x.priority,x.stage,x.email_status,x.reply_category,x.do_not_contact,'',x.created_at]);
        return text(request, env, lines.map(row => row.map(csvEscape).join(',')).join('\n'), 200, 'text/csv; charset=utf-8');
      }
    }

    return json(request, env, { error: 'not_found' }, 404);
  }
};
