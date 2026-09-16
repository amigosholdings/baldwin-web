import agent from './agentIndex.js';

const AGENT_PREFIX = '/v1/admin/agent/';
const ISSUE_PATH = '/v1/admin/agent-token';
const encoder = new TextEncoder();
let schemaReadyPromise = null;

const AGENT_SCHEMA = `
CREATE TABLE IF NOT EXISTS agent_runs (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'running',
  agent_name TEXT NOT NULL DEFAULT 'ChatGPT GTM',
  hypothesis TEXT,
  strategy_json TEXT NOT NULL DEFAULT '{}',
  experiment_json TEXT NOT NULL DEFAULT '{}',
  target_discovery INTEGER NOT NULL DEFAULT 0,
  target_research INTEGER NOT NULL DEFAULT 0,
  target_send INTEGER NOT NULL DEFAULT 0,
  discovered_count INTEGER NOT NULL DEFAULT 0,
  enriched_count INTEGER NOT NULL DEFAULT 0,
  selected_count INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  reply_count INTEGER NOT NULL DEFAULT 0,
  positive_reply_count INTEGER NOT NULL DEFAULT 0,
  progressed_count INTEGER NOT NULL DEFAULT 0,
  strategy_summary TEXT,
  next_strategy TEXT,
  observations_json TEXT NOT NULL DEFAULT '{}',
  started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_agent_runs_created ON agent_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_runs(status, created_at DESC);
CREATE TABLE IF NOT EXISTS agent_profiles (
  outreach_id TEXT PRIMARY KEY,
  domain TEXT,
  state TEXT,
  contact_name TEXT,
  contact_role TEXT,
  fit_score REAL,
  email_confidence TEXT,
  decision_status TEXT NOT NULL DEFAULT 'unreviewed',
  decision_reason TEXT,
  personalization TEXT,
  research_json TEXT NOT NULL DEFAULT '{}',
  last_run_id TEXT,
  researched_at TEXT,
  selected_at TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (outreach_id) REFERENCES outreach(id) ON DELETE CASCADE,
  FOREIGN KEY (last_run_id) REFERENCES agent_runs(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_agent_profiles_domain ON agent_profiles(domain);
CREATE INDEX IF NOT EXISTS idx_agent_profiles_decision ON agent_profiles(decision_status, fit_score DESC);
CREATE INDEX IF NOT EXISTS idx_agent_profiles_run ON agent_profiles(last_run_id, researched_at DESC);
CREATE TABLE IF NOT EXISTS agent_message_queue (
  id TEXT PRIMARY KEY,
  run_id TEXT,
  outreach_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  source_message_id TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variant TEXT NOT NULL DEFAULT 'agent-v1',
  rationale TEXT,
  scheduled_for TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  idempotency_key TEXT NOT NULL UNIQUE,
  provider_email_id TEXT,
  error TEXT,
  sent_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (run_id) REFERENCES agent_runs(id) ON DELETE SET NULL,
  FOREIGN KEY (outreach_id) REFERENCES outreach(id) ON DELETE CASCADE,
  FOREIGN KEY (source_message_id) REFERENCES email_messages(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_agent_queue_status ON agent_message_queue(status, scheduled_for, created_at);
CREATE INDEX IF NOT EXISTS idx_agent_queue_run ON agent_message_queue(run_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_agent_queue_outreach ON agent_message_queue(outreach_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_queue_sent ON agent_message_queue(status, sent_at DESC);
CREATE TABLE IF NOT EXISTS agent_events (
  id TEXT PRIMARY KEY,
  run_id TEXT,
  outreach_id TEXT,
  action TEXT NOT NULL,
  rationale TEXT,
  payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (run_id) REFERENCES agent_runs(id) ON DELETE SET NULL,
  FOREIGN KEY (outreach_id) REFERENCES outreach(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_agent_events_run ON agent_events(run_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_events_outreach ON agent_events(outreach_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_events_action ON agent_events(action, created_at DESC);
`;

function allowedOrigin(request, env) {
  const origin = request.headers.get('Origin');
  if (!origin) return '*';
  const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean);
  return allowed.includes(origin) ? origin : 'null';
}

function securityHeaders(request, env, extra = {}) {
  return {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store, max-age=0',
    'access-control-allow-origin': allowedOrigin(request, env),
    'access-control-allow-methods': 'GET,POST,PATCH,OPTIONS',
    'access-control-allow-headers': 'content-type,x-agent-token,x-admin-token',
    'access-control-max-age': '600',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer',
    'permissions-policy': 'camera=(), microphone=(), geolocation=()',
    'vary': 'Origin',
    ...extra
  };
}

function json(request, env, body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), { status, headers: securityHeaders(request, env, extra) });
}

function base64url(bytes) {
  let binary = '';
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function hmac(secret, value) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return base64url(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
}

async function constantTimeEqual(a = '', b = '') {
  const [ah, bh] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(String(a))),
    crypto.subtle.digest('SHA-256', encoder.encode(String(b)))
  ]);
  const av = new Uint8Array(ah), bv = new Uint8Array(bh);
  let diff = av.length ^ bv.length;
  for (let i = 0; i < Math.max(av.length, bv.length); i++) diff |= (av[i % av.length] || 0) ^ (bv[i % bv.length] || 0);
  return diff === 0;
}

export async function issueCapability(secret, ttlHours = 720, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (!secret) throw new Error('ADMIN_TOKEN_not_configured');
  const ttl = Math.max(1, Math.min(2160, Math.trunc(Number(ttlHours) || 720)));
  const exp = nowSeconds + ttl * 3600;
  const nonce = crypto.randomUUID().replace(/-/g, '');
  const message = `baldwin-agent:v1:${exp}:${nonce}`;
  const sig = await hmac(secret, message);
  return { token: `agt1.${exp}.${nonce}.${sig}`, expires_at: new Date(exp * 1000).toISOString(), ttl_hours: ttl };
}

export async function validateCapability(secret, token, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (!secret || !token) return false;
  const parts = String(token).split('.');
  if (parts.length !== 4 || parts[0] !== 'agt1') return false;
  const exp = Number(parts[1]);
  const nonce = parts[2];
  const sig = parts[3];
  if (!Number.isInteger(exp) || exp <= nowSeconds || exp > nowSeconds + 2160 * 3600 || !/^[a-f0-9]{32}$/.test(nonce)) return false;
  const expected = await hmac(secret, `baldwin-agent:v1:${exp}:${nonce}`);
  return constantTimeEqual(sig, expected);
}

async function ensureAgentSchema(env) {
  if (!env.DB?.exec) throw new Error('DB_not_configured');
  if (!schemaReadyPromise) {
    schemaReadyPromise = env.DB.exec(AGENT_SCHEMA).catch(error => {
      schemaReadyPromise = null;
      throw error;
    });
  }
  return schemaReadyPromise;
}

async function authenticateAdmin(request, env) {
  if (!env.ADMIN_TOKEN) return false;
  return constantTimeEqual(request.headers.get('x-admin-token') || '', env.ADMIN_TOKEN);
}

async function delegateAgent(request, env, ctx) {
  await ensureAgentSchema(env);
  const headers = new Headers(request.headers);
  headers.delete('x-agent-token');
  headers.set('x-admin-token', env.ADMIN_TOKEN || '');
  const delegated = await agent.fetch(new Request(request, { headers }), env, ctx);
  const out = new Headers(delegated.headers);
  for (const [key, value] of Object.entries(securityHeaders(request, env))) out.set(key, value);
  return new Response(delegated.body, { status: delegated.status, statusText: delegated.statusText, headers: out });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === ISSUE_PATH) {
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: securityHeaders(request, env) });
      if (request.method !== 'POST') return json(request, env, { error: 'method_not_allowed' }, 405);
      if (!(await authenticateAdmin(request, env))) return json(request, env, { error: 'unauthorized' }, 401);
      let body = {};
      try { body = await request.json(); } catch {}
      const issued = await issueCapability(env.ADMIN_TOKEN, body?.ttl_hours);
      return json(request, env, { ok: true, scope: 'gtm_agent_only', ...issued }, 201);
    }

    if (path.startsWith(AGENT_PREFIX)) {
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: securityHeaders(request, env) });
      const valid = await validateCapability(env.ADMIN_TOKEN || '', request.headers.get('x-agent-token') || '');
      if (!valid) return json(request, env, { error: 'agent_unauthorized' }, 401);
      try {
        return await delegateAgent(request, env, ctx);
      } catch (error) {
        return json(request, env, { error: 'agent_gateway_failed', detail: String(error?.message || error).slice(0, 300) }, 503);
      }
    }

    return agent.fetch(request, env, ctx);
  }
};
