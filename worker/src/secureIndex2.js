import agent from './agentIndex.js';
import { ensureAgentSchema } from './agentSchema.js';

const AGENT_PREFIX = '/v1/admin/agent/';
const ISSUE_PATH = '/v1/admin/agent-token';
const encoder = new TextEncoder();

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

async function authenticateAdmin(request, env) {
  if (!env.ADMIN_TOKEN) return false;
  return constantTimeEqual(request.headers.get('x-admin-token') || '', env.ADMIN_TOKEN);
}

async function delegateAgent(request, env, ctx) {
  const schema = await ensureAgentSchema(env);
  const headers = new Headers(request.headers);
  headers.delete('x-agent-token');
  headers.set('x-admin-token', env.ADMIN_TOKEN || '');
  const delegatedRequest = new Request(request, { headers });
  const delegated = await agent.fetch(delegatedRequest, env, ctx);
  const out = new Headers(delegated.headers);
  for (const [key, value] of Object.entries(securityHeaders(request, env))) out.set(key, value);
  out.set('x-baldwin-agent-schema', schema.initialized ? 'initialized' : 'ready');
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
        if (request.method === 'GET' && path === '/v1/admin/agent/health') {
          const schema = await ensureAgentSchema(env);
          return json(request, env, { ok: true, gateway: 'ready', schema });
        }
        return await delegateAgent(request, env, ctx);
      } catch (error) {
        const detail = String(error?.message || error).slice(0, 500);
        console.error('Baldwin agent gateway failure', { path, detail });
        return json(request, env, { error: `agent_gateway_failed: ${detail}`, detail }, 503);
      }
    }

    return agent.fetch(request, env, ctx);
  }
};
