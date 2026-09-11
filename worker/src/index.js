import { GROWTH_EVENT_NAMES, activeProvider, recordGrowthEvent, upsertProviderOffer } from './growth.js';
import { appleOfferConfigured, provisionProviderOffer } from './appleOffers.js';
const EVENT_NAMES = GROWTH_EVENT_NAMES;

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
function scheduleProviderOffer(ctx, env, code) {
  if (!ctx || !appleOfferConfigured(env) || !code) return;
  ctx.waitUntil(provisionProviderOffer(env, code).then(result => {
    if (!result.ok && result.error !== 'offer_provision_in_progress') console.warn('provider offer provisioning failed', code, result.error);
  }).catch(error => console.warn('provider offer provisioning failed', code, clean(error?.message, 300))));
}

async function contentService(env, path, { method = 'GET', body = null } = {}) {
  if (!env.CONTENT) throw new Error('CONTENT_service_binding_not_configured');
  const init = { method, headers: { 'x-admin-token': env.ADMIN_TOKEN } };
  if (body !== null) {
    init.headers['content-type'] = 'application/json';
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  const response = await env.CONTENT.fetch(new Request(`https://trackmyhairloss-content.internal${path}`, init));
  return response;
}

async function contentJson(env, path, opts = {}) {
  const response = await contentService(env, path, opts);
  const raw = await response.text();
  let payload = {};
  try { payload = raw ? JSON.parse(raw) : {}; } catch { payload = { raw }; }
  if (!response.ok) throw new Error(payload?.error || raw || `content_service_${response.status}`);
  return payload;
}

async function providerByCode(env, rawCode) {
  const provider = await activeProvider(env, rawCode);
  if (!provider) return null;
  return {
    id: provider.id, code: provider.code, name: provider.name, website: provider.website,
    city: provider.city, state: provider.state, status: provider.status,
    appleOfferCode: provider.appleOfferCode, offerVariant: provider.offerVariant,
    offerProvisionStatus: provider.offerProvisionStatus, offerProvisionError: provider.offerProvisionError, offerProvisionedAt: provider.offerProvisionedAt
  };
}

function openRouterModel(env) {
  const configured = String(env.OPENROUTER_MODEL || env.OPENAI_MODEL || 'gpt-5.6-luna').trim();
  if (!configured) return 'openai/gpt-5.6-luna:floor';
  if (configured.includes('/')) return configured;
  const withProvider = `openai/${configured}`;
  return withProvider.endsWith(':floor') ? withProvider : `${withProvider}:floor`;
}

async function dashboard(env) {
  const [totals, providers, leads, outreach, messages] = await Promise.all([
    env.DB.prepare(`SELECT event_name, COUNT(*) AS n FROM events GROUP BY event_name ORDER BY event_name`).all(),
    env.DB.prepare(`
      SELECT p.id, p.code, p.name, p.website, p.city, p.state, p.status, p.apple_offer_code, p.offer_variant, p.offer_provision_status, p.offer_provision_error, p.offer_provisioned_at, p.created_at,
        SUM(CASE WHEN e.event_name='referral_view' THEN 1 ELSE 0 END) AS referral_views,
        SUM(CASE WHEN e.event_name='download_click' THEN 1 ELSE 0 END) AS download_clicks,
        SUM(CASE WHEN e.event_name='app_store_redirect' THEN 1 ELSE 0 END) AS app_store_redirects,
        SUM(CASE WHEN e.event_name='provider_offer_redirect' THEN 1 ELSE 0 END) AS offer_redirects,
        COUNT(DISTINCT CASE WHEN e.event_name='attributed_install' THEN COALESCE(e.installation_id,e.anonymous_id,e.id) END) AS attributed_installs,
        COUNT(DISTINCT CASE WHEN e.event_name='attributed_open' THEN COALESCE(e.installation_id,e.anonymous_id,e.id) END) AS attributed_opens,
        COUNT(DISTINCT CASE WHEN e.event_name='tool_used' THEN COALESCE(e.user_id,e.anonymous_id,e.id) END) AS tool_activations,
        COUNT(DISTINCT CASE WHEN e.event_name='app_signup' THEN COALESCE(e.user_id,e.installation_id,e.anonymous_id,e.id) END) AS app_signups,
        COUNT(DISTINCT CASE WHEN e.event_name='baseline_complete' THEN COALESCE(e.user_id,e.installation_id,e.anonymous_id,e.id) END) AS baselines,
        COUNT(DISTINCT CASE WHEN e.event_name='second_session' THEN COALESCE(e.user_id,e.installation_id,e.anonymous_id,e.id) END) AS second_sessions,
        COUNT(DISTINCT CASE WHEN e.event_name='subscription_started' THEN COALESCE(e.user_id,e.installation_id,e.anonymous_id,e.id) END) AS subscriptions
      FROM providers p LEFT JOIN events e ON e.provider_code = p.code
      GROUP BY p.id, p.code, p.name, p.website, p.city, p.state, p.status, p.apple_offer_code, p.offer_variant, p.offer_provision_status, p.offer_provision_error, p.offer_provisioned_at, p.created_at
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
      ai: Boolean(env.OPENROUTER_API_KEY),
      ai_provider: 'openrouter',
      model: openRouterModel(env),
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

async function hashToken(value = '') {
  const bytes = new TextEncoder().encode(String(value));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map(x => x.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

async function ensureProviderForLead(env, lead) {
  let provider = await env.DB.prepare(`
    SELECT * FROM providers
    WHERE lower(email)=lower(?) OR lower(name)=lower(?)
    ORDER BY CASE WHEN lower(email)=lower(?) THEN 0 ELSE 1 END
    LIMIT 1
  `).bind(lead.email, lead.practice_name, lead.email).first();
  if (provider) {
    await env.DB.prepare(`
      UPDATE providers SET
        contact_name=COALESCE(NULLIF(?,''),contact_name),
        email=COALESCE(NULLIF(?,''),email),
        phone=COALESCE(NULLIF(?,''),phone),
        website=COALESCE(NULLIF(?,''),website),
        city=COALESCE(NULLIF(?,''),city),
        state=COALESCE(NULLIF(?,''),state),
        status=CASE WHEN status IN ('paused','lost') THEN 'pilot' ELSE status END
      WHERE id=?
    `).bind(lead.contact_name, lead.email, lead.phone, lead.website, lead.city, lead.state, provider.id).run();
    return env.DB.prepare('SELECT * FROM providers WHERE id=? LIMIT 1').bind(provider.id).first();
  }

  const base = slug(lead.practice_name) || `provider-${Math.random().toString(36).slice(2,8)}`;
  let code = base;
  for (let i = 0; i < 5 && await env.DB.prepare('SELECT 1 FROM providers WHERE code=?').bind(code).first(); i++) {
    code = `${base}-${Math.random().toString(36).slice(2,6)}`;
  }
  const id = uuid();
  await env.DB.prepare(`
    INSERT INTO providers (id,code,name,website,city,state,contact_name,email,phone,status)
    VALUES (?,?,?,?,?,?,?,?,?,'pilot')
  `).bind(id, code, lead.practice_name, lead.website, lead.city, lead.state, lead.contact_name, lead.email, lead.phone).run();
  return env.DB.prepare('SELECT * FROM providers WHERE id=? LIMIT 1').bind(id).first();
}

async function ensureOutreachForLead(env, lead) {
  let outreach = await env.DB.prepare('SELECT * FROM outreach WHERE lower(email)=lower(?) ORDER BY created_at DESC LIMIT 1').bind(lead.email).first();
  if (outreach) {
    if (!Number(outreach.do_not_contact)) {
      await env.DB.prepare(`
        UPDATE outreach SET practice_name=?, website=COALESCE(NULLIF(?,''),website), city=COALESCE(NULLIF(?,''),city),
          category='inbound provider lead', stage='pilot', source_url=COALESCE(NULLIF(?,''),source_url),
          source_type='provider_form', notes=COALESCE(notes || char(10),'') || 'Inbound provider pilot request.', updated_at=CURRENT_TIMESTAMP
        WHERE id=?
      `).bind(lead.practice_name, lead.website, lead.city, lead.website, outreach.id).run();
      outreach = await env.DB.prepare('SELECT * FROM outreach WHERE id=? LIMIT 1').bind(outreach.id).first();
    }
    return outreach;
  }

  const id = uuid();
  await env.DB.prepare(`
    INSERT INTO outreach (id,practice_name,website,email,city,category,priority,source_url,source_type,stage,notes)
    VALUES (?,?,?,?,?,'inbound provider lead',1,?,'provider_form','pilot','Inbound provider pilot request.')
  `).bind(id, lead.practice_name, lead.website, lead.email, lead.city, lead.website).run();
  return env.DB.prepare('SELECT * FROM outreach WHERE id=? LIMIT 1').bind(id).first();
}

function providerPilotCopy(lead, provider) {
  const referralUrl = `https://trybaldwin.app/?ref=${encodeURIComponent(provider.code)}`;
  const kitUrl = `https://trackmyhairloss.com/provider-kit/?ref=${encodeURIComponent(provider.code)}`;
  const hello = lead.contact_name ? `Hi ${lead.contact_name},` : `Hi ${lead.practice_name} team,`;
  const subject = 'Your Baldwin provider pilot is ready';
  const body = `${hello}

Thanks for requesting a Baldwin pilot. Your practice-specific setup is ready.

Patient link:
${referralUrl}

Printable QR / patient card:
${kitUrl}

There is no clinic login or patient upload workflow. Patients scan your link, take a guided baseline, and Baldwin handles their progress tracking.

If you would prefer physical cards for the front desk, reply with the best mailing address and I’ll send a small starter stack at no cost.

Best,
Shaun
Baldwin
https://trybaldwin.app/`;
  return { subject, body, referralUrl, kitUrl };
}

async function sendProviderPilot(env, outreach, lead, provider) {
  if (!env.REPLY_DOMAIN || !env.RESEND_API_KEY || !env.OUTREACH_FROM || Number(outreach.do_not_contact)) {
    return { sent: false, suppressed: Number(outreach.do_not_contact) === 1 };
  }
  const copy = providerPilotCopy(lead, provider);
  const sent = await sendResendEmail(env, {
    outreach,
    to: lead.email,
    subject: copy.subject,
    body: copy.body,
    idempotencyKey: `baldwin-provider-pilot-${outreach.id}`
  });
  await env.DB.batch([
    env.DB.prepare(`
      INSERT OR IGNORE INTO email_messages (id,outreach_id,direction,provider,provider_email_id,from_email,to_email,subject,text_body,status)
      VALUES (?,?,'outbound','resend',?,?,?,?,?,'sent')
    `).bind(uuid(), outreach.id, clean(sent.id,180), extractEmailAddress(env.OUTREACH_FROM), lead.email, copy.subject, copy.body),
    env.DB.prepare(`
      UPDATE outreach SET stage='pilot', email_status='sent', last_contacted_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP WHERE id=?
    `).bind(outreach.id)
  ]);
  return { sent: true, id: sent.id };
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
  if (!env.OPENROUTER_API_KEY || !body) return heuristicReplyAnalysis(body || email.subject || '');
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
  const instructions = 'Classify this B2B clinic reply and draft a concise founder-style response. Never make medical efficacy claims. Never invent pricing, security, integrations, dates, or availability. If the sender asks a clinical, legal, privacy, security, contract, pricing-negotiation, or other substantive question that is not directly answered by the supplied context, set needs_human=true and draft a short acknowledgement rather than guessing. Keep the draft under 90 words. For unsubscribe or explicit rejection, confirm politely and do not sell further. Return only the requested schema.';
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
      'content-type': 'application/json',
      'HTTP-Referer': 'https://trybaldwin.app',
      'X-Title': 'Baldwin Growth Operator'
    },
    body: JSON.stringify({
      model: openRouterModel(env),
      messages: [
        { role: 'system', content: instructions },
        { role: 'user', content: input }
      ],
      reasoning: { effort: 'none' },
      provider: { require_parameters: true, sort: 'price' },
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'baldwin_reply_analysis', strict: true, schema }
      }
    })
  });
  if (!response.ok) return heuristicReplyAnalysis(body);
  const payload = await response.json();
  try {
    const content = payload?.choices?.[0]?.message?.content;
    const parsed = JSON.parse(typeof content === 'string' ? content : '');
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
  async fetch(request, env, ctx) {
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
      const result = await recordGrowthEvent(env, body);
      return json(request, env, result.body, result.status);
    }

    if (request.method === 'POST' && path === '/v1/provider-leads') {
      const body = await bodyJson(request);
      if (!body?.practice_name || !body?.email) return json(request, env, { error: 'practice_name_and_email_required' }, 400);
      if (body.company_site) return json(request, env, { ok: true }, 201);

      const lead = {
        practice_name: clean(body.practice_name,160),
        contact_name: clean(body.contact_name,160),
        email: extractEmailAddress(clean(body.email,180)),
        phone: clean(body.phone,80),
        website: clean(body.website,240),
        city: clean(body.city,120),
        state: clean(body.state,80),
        notes: clean(body.notes,1000)
      };
      if (!lead.email) return json(request, env, { error: 'invalid_email' }, 400);

      // The public form can create a referral code and send one transactional pilot email,
      // but it never creates clinic credentials or grants access to patient data. Throttle
      // accepted submissions by source IP and suppress repeated email sends for 24 hours.
      const sourceIp = clean(request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || 'unknown', 160).split(',')[0].trim();
      const sourceHash = await hashToken(sourceIp);
      const recent = await env.DB.prepare(`
        SELECT COUNT(*) AS n FROM events
        WHERE event_name='provider_lead_submit' AND anonymous_id=? AND created_at >= datetime('now','-1 hour')
      `).bind(sourceHash).first();
      if (Number(recent?.n || 0) >= 5) return json(request, env, { error: 'rate_limited' }, 429);

      const duplicate = await env.DB.prepare(`
        SELECT id FROM provider_leads WHERE lower(email)=lower(?) AND created_at >= datetime('now','-1 day') LIMIT 1
      `).bind(lead.email).first();
      if (duplicate) {
        const provider = await env.DB.prepare(`SELECT * FROM providers WHERE lower(email)=lower(?) OR lower(name)=lower(?) LIMIT 1`).bind(lead.email, lead.practice_name).first();
        if (provider?.code) scheduleProviderOffer(ctx, env, provider.code);
        return json(request, env, {
          ok: true,
          duplicate: true,
          referral_url: provider ? `https://trybaldwin.app/?ref=${encodeURIComponent(provider.code)}` : null,
          kit_url: provider ? `https://trackmyhairloss.com/provider-kit/?ref=${encodeURIComponent(provider.code)}` : null
        }, 200);
      }

      const leadId = uuid();
      await env.DB.batch([
        env.DB.prepare(`INSERT INTO provider_leads (id,practice_name,contact_name,email,phone,website,city,state,notes,stage) VALUES (?,?,?,?,?,?,?,?,?,'pilot')`)
          .bind(leadId, lead.practice_name, lead.contact_name, lead.email, lead.phone, lead.website, lead.city, lead.state, lead.notes),
        env.DB.prepare(`INSERT INTO events (id,event_name,anonymous_id,source,metadata_json) VALUES (?, 'provider_lead_submit', ?, 'providers_form', ?)`)
          .bind(uuid(), sourceHash, JSON.stringify({ lead_id: leadId }))
      ]);

      const provider = await ensureProviderForLead(env, lead);
      scheduleProviderOffer(ctx, env, provider.code);
      const outreach = await ensureOutreachForLead(env, lead);
      const copy = providerPilotCopy(lead, provider);
      let emailResult = { sent: false, suppressed: Number(outreach.do_not_contact) === 1 };
      try { emailResult = await sendProviderPilot(env, outreach, lead, provider); }
      catch (error) { console.error('provider pilot email failed', clean(error?.message,300)); }

      await env.DB.prepare(`INSERT INTO events (id,event_name,provider_code,source,metadata_json) VALUES (?, 'provider_pilot_created', ?, 'providers_form', ?)`)
        .bind(uuid(), provider.code, JSON.stringify({ lead_id: leadId, email_sent: Boolean(emailResult.sent) })).run();

      return json(request, env, {
        ok: true,
        provider_code: provider.code,
        referral_url: copy.referralUrl,
        kit_url: copy.kitUrl,
        email_sent: Boolean(emailResult.sent),
        email_suppressed: Boolean(emailResult.suppressed)
      }, 201);
    }

    if (path.startsWith('/v1/admin/')) {
      if (!isAdmin(request, env)) return json(request, env, { error: 'unauthorized' }, 401);

      if (request.method === 'GET' && path === '/v1/admin/dashboard') return json(request, env, await dashboard(env));

      if (request.method === 'GET' && path === '/v1/admin/content/status') {
        try { return json(request, env, await contentJson(env, '/__status')); }
        catch (error) { return json(request, env, { ok: false, error: clean(error?.message, 400) }, 502); }
      }

      if (request.method === 'POST' && path === '/v1/admin/content/generate') {
        const body = await bodyJson(request) || {};
        try {
          return json(request, env, await contentJson(env, '/__generate', { method: 'POST', body: {
            preferredType: clean(body.preferredType, 80) || null,
            brief: clean(body.brief, 2000),
            forcePublish: false
          } }));
        } catch (error) { return json(request, env, { ok: false, error: clean(error?.message, 500) }, 502); }
      }

      const contentPublishMatch = path.match(/^\/v1\/admin\/content\/publish\/(.+)$/);
      if (request.method === 'POST' && contentPublishMatch) {
        try { return json(request, env, await contentJson(env, `/__publish/${encodeURIComponent(decodeURIComponent(contentPublishMatch[1]))}`, { method: 'POST', body: {} })); }
        catch (error) { return json(request, env, { ok: false, error: clean(error?.message, 500) }, 502); }
      }

      const contentPreviewMatch = path.match(/^\/v1\/admin\/content\/preview\/(.+)$/);
      if (request.method === 'GET' && contentPreviewMatch) {
        try {
          const response = await contentService(env, `/__preview/${encodeURIComponent(decodeURIComponent(contentPreviewMatch[1]))}`);
          const html = await response.text();
          return new Response(html, { status: response.status, headers: {
            'content-type': response.headers.get('content-type') || 'text/html; charset=utf-8',
            'cache-control': 'private, no-store',
            'access-control-allow-origin': allowedOrigin(request, env),
            'vary': 'Origin'
          } });
        } catch (error) { return text(request, env, clean(error?.message, 500), 502); }
      }

      if (request.method === 'POST' && path === '/v1/admin/content/seo-run') {
        try { return json(request, env, await contentJson(env, '/__seo-run', { method: 'POST', body: {} })); }
        catch (error) { return json(request, env, { ok: false, error: clean(error?.message, 500) }, 502); }
      }

      if (request.method === 'POST' && path === '/v1/admin/provider-offers') {
        const body = await bodyJson(request);
        const result = await upsertProviderOffer(env, body || {});
        if (result.body?.provider) {
          const p = result.body.provider;
          result.body.provider.referral_url = `https://trybaldwin.app/?ref=${encodeURIComponent(p.code)}`;
          result.body.provider.download_url = `https://getbaldwin.app/download?c=provider_referral&ref=${encodeURIComponent(p.code)}&utm_source=trybaldwin&utm_campaign=provider_referral`;
          result.body.provider.redemption_url = `https://apps.apple.com/redeem?ctx=offercodes&id=6760326527&code=${encodeURIComponent(p.appleOfferCode)}`;
        }
        return json(request, env, result.body, result.status);
      }

      const provisionOfferMatch = path.match(/^\/v1\/admin\/providers\/([^/]+)\/provision-offer$/);
      if (request.method === 'POST' && provisionOfferMatch) {
        const body = await bodyJson(request) || {};
        const code = decodeURIComponent(provisionOfferMatch[1]);
        const limit = Number.isInteger(Number(body.limit)) ? Number(body.limit) : 25000;
        const result = await provisionProviderOffer(env, code, { redemptionLimit: limit });
        return json(request, env, result, result.status || (result.ok ? 200 : 500));
      }

      if (request.method === 'POST' && path === '/v1/admin/providers') {
        const body = await bodyJson(request);
        if (!body?.name) return json(request, env, { error: 'name_required' }, 400);
        let code = slug(body.code || body.name) || `provider-${Math.random().toString(36).slice(2,8)}`;
        if (await env.DB.prepare('SELECT 1 FROM providers WHERE code=?').bind(code).first()) code = `${code}-${Math.random().toString(36).slice(2,6)}`;
        const id = uuid();
        await env.DB.prepare(`INSERT INTO providers (id,code,name,website,city,state,status) VALUES (?,?,?,?,?,?,'pilot')`)
          .bind(id, code, clean(body.name,160), clean(body.website,240), clean(body.city,120), clean(body.state,80)).run();
        scheduleProviderOffer(ctx, env, code);
        return json(request, env, { ok: true, provider: { id, code, name: body.name, referral_url: `https://trybaldwin.app/?ref=${encodeURIComponent(code)}`, offer_status: appleOfferConfigured(env) ? 'provisioning' : 'unconfigured' } }, 201);
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
        scheduleProviderOffer(ctx, env, existing.code);
        return json(request, env, { ok: true, provider: { ...existing, referral_url: `https://trybaldwin.app/?ref=${encodeURIComponent(existing.code)}`, kit_url: `https://trackmyhairloss.com/provider-kit/?ref=${encodeURIComponent(existing.code)}`, offer_status: appleOfferConfigured(env) ? 'provisioning' : 'unconfigured' } });
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
