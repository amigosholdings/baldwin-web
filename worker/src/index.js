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

function uuid() {
  return crypto.randomUUID();
}

function slug(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function allowedOrigin(request, env) {
  const origin = request.headers.get('Origin');
  if (!origin) return '*';
  const allowed = String(env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(x => x.trim())
    .filter(Boolean);
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
  return new Response(body, {
    status,
    headers: {
      ...headers(request, env),
      'content-type': contentType
    }
  });
}

function isAdmin(request, env) {
  const token = request.headers.get('x-admin-token') || '';
  return Boolean(env.ADMIN_TOKEN) && token === env.ADMIN_TOKEN;
}

async function bodyJson(request) {
  try { return await request.json(); } catch { return null; }
}

async function providerByCode(env, rawCode) {
  const code = slug(rawCode);
  if (!code) return null;
  return env.DB.prepare(
    `SELECT id, code, name, website, city, state, status
     FROM providers WHERE code = ? LIMIT 1`
  ).bind(code).first();
}

async function dashboard(env) {
  const [totals, providers, leads, outreach] = await Promise.all([
    env.DB.prepare(`
      SELECT event_name, COUNT(*) AS n
      FROM events
      GROUP BY event_name
      ORDER BY event_name
    `).all(),
    env.DB.prepare(`
      SELECT
        p.id, p.code, p.name, p.website, p.city, p.state, p.status, p.created_at,
        SUM(CASE WHEN e.event_name='referral_view' THEN 1 ELSE 0 END) AS referral_views,
        SUM(CASE WHEN e.event_name='download_click' THEN 1 ELSE 0 END) AS download_clicks,
        COUNT(DISTINCT CASE WHEN e.event_name='tool_used' THEN COALESCE(e.user_id,e.anonymous_id,e.id) END) AS tool_activations,
        COUNT(DISTINCT CASE WHEN e.event_name='app_signup' THEN COALESCE(e.user_id,e.anonymous_id,e.id) END) AS app_signups,
        COUNT(DISTINCT CASE WHEN e.event_name='baseline_complete' THEN COALESCE(e.user_id,e.anonymous_id,e.id) END) AS baselines,
        COUNT(DISTINCT CASE WHEN e.event_name='second_session' THEN COALESCE(e.user_id,e.anonymous_id,e.id) END) AS second_sessions,
        COUNT(DISTINCT CASE WHEN e.event_name='subscription_started' THEN COALESCE(e.user_id,e.anonymous_id,e.id) END) AS subscriptions
      FROM providers p
      LEFT JOIN events e ON e.provider_code = p.code
      GROUP BY p.id, p.code, p.name, p.website, p.city, p.state, p.status, p.created_at
      ORDER BY p.created_at DESC
    `).all(),
    env.DB.prepare(`
      SELECT * FROM provider_leads
      ORDER BY created_at DESC
      LIMIT 500
    `).all(),
    env.DB.prepare(`
      SELECT * FROM outreach
      ORDER BY
        CASE stage
          WHEN 'responded' THEN 0
          WHEN 'demo' THEN 1
          WHEN 'pilot' THEN 2
          WHEN 'identified' THEN 3
          WHEN 'contacted' THEN 4
          WHEN 'active' THEN 5
          ELSE 6
        END,
        COALESCE(priority, 9) ASC,
        created_at DESC
      LIMIT 1000
    `).all()
  ]);

  return {
    totals: totals.results || [],
    providers: providers.results || [],
    leads: leads.results || [],
    outreach: outreach.results || []
  };
}

function csvEscape(value) {
  const s = String(value ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: headers(request, env) });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'GET' && path === '/health') {
      return json(request, env, { ok: true, service: 'baldwin-growth-api' });
    }

    if (request.method === 'GET' && path.startsWith('/v1/providers/')) {
      const code = decodeURIComponent(path.slice('/v1/providers/'.length));
      const provider = await providerByCode(env, code);
      if (!provider) return json(request, env, { error: 'not_found' }, 404);
      return json(request, env, provider);
    }

    if (request.method === 'POST' && path === '/v1/events') {
      const body = await bodyJson(request);
      if (!body || !EVENT_NAMES.has(body.event)) {
        return json(request, env, { error: 'invalid_event' }, 400);
      }

      const providerCode = body.providerCode ? slug(body.providerCode) : null;
      const anonymousId = body.anonymousId ? String(body.anonymousId).slice(0, 128) : null;
      const userId = body.userId ? String(body.userId).slice(0, 128) : null;
      const source = body.source ? String(body.source).slice(0, 80) : null;
      const campaign = body.campaign ? String(body.campaign).slice(0, 120) : null;
      const metadata = body.metadata && typeof body.metadata === 'object'
        ? JSON.stringify(body.metadata).slice(0, 4000)
        : null;

      await env.DB.prepare(`
        INSERT INTO events
          (id,event_name,provider_code,anonymous_id,user_id,source,campaign,metadata_json)
        VALUES (?,?,?,?,?,?,?,?)
      `).bind(uuid(), body.event, providerCode, anonymousId, userId, source, campaign, metadata).run();

      return json(request, env, { ok: true }, 201);
    }

    if (request.method === 'POST' && path === '/v1/provider-leads') {
      const body = await bodyJson(request);
      if (!body?.practice_name || !body?.email) {
        return json(request, env, { error: 'practice_name_and_email_required' }, 400);
      }
      if (body.company_site) return json(request, env, { ok: true }, 201);
      const email = String(body.email).trim().slice(0, 180);
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return json(request, env, { error: 'invalid_email' }, 400);
      }
      const duplicate = await env.DB.prepare(
        `SELECT id FROM provider_leads WHERE lower(email)=lower(?) AND created_at >= datetime('now','-1 day') LIMIT 1`
      ).bind(email).first();
      if (duplicate) return json(request, env, { ok: true, duplicate: true }, 200);
      await env.DB.prepare(`
        INSERT INTO provider_leads
          (id,practice_name,contact_name,email,phone,website,city,state,notes,stage)
        VALUES (?,?,?,?,?,?,?,?,?,'new')
      `).bind(
        uuid(),
        String(body.practice_name).slice(0, 160),
        String(body.contact_name || '').slice(0, 160),
        email,
        String(body.phone || '').slice(0, 80),
        String(body.website || '').slice(0, 240),
        String(body.city || '').slice(0, 120),
        String(body.state || '').slice(0, 80),
        String(body.notes || '').slice(0, 1000)
      ).run();
      return json(request, env, { ok: true }, 201);
    }

    if (path.startsWith('/v1/admin/')) {
      if (!isAdmin(request, env)) {
        return json(request, env, { error: 'unauthorized' }, 401);
      }

      if (request.method === 'GET' && path === '/v1/admin/dashboard') {
        return json(request, env, await dashboard(env));
      }

      if (request.method === 'POST' && path === '/v1/admin/providers') {
        const body = await bodyJson(request);
        if (!body?.name) return json(request, env, { error: 'name_required' }, 400);
        let code = slug(body.code || body.name);
        if (!code) code = `provider-${Math.random().toString(36).slice(2,8)}`;
        const collision = await env.DB.prepare('SELECT 1 FROM providers WHERE code=?').bind(code).first();
        if (collision) code = `${code}-${Math.random().toString(36).slice(2,6)}`;
        const id = uuid();
        await env.DB.prepare(`
          INSERT INTO providers (id,code,name,website,city,state,status)
          VALUES (?,?,?,?,?,?,'pilot')
        `).bind(
          id, code, String(body.name).slice(0,160), String(body.website || '').slice(0,240),
          String(body.city || '').slice(0,120), String(body.state || '').slice(0,80)
        ).run();
        return json(request, env, {
          ok: true,
          provider: { id, code, name: body.name, referral_url: `https://trybaldwin.app/?ref=${encodeURIComponent(code)}` }
        }, 201);
      }

      if (request.method === 'POST' && path === '/v1/admin/outreach') {
        const body = await bodyJson(request);
        if (!body?.practiceName) return json(request, env, { error: 'practice_name_required' }, 400);
        const id = uuid();
        await env.DB.prepare(`
          INSERT INTO outreach (id,practice_name,city,category,stage)
          VALUES (?,?,?,?, 'identified')
        `).bind(
          id,
          String(body.practiceName).slice(0,160),
          String(body.city || '').slice(0,120),
          String(body.category || '').slice(0,100)
        ).run();
        return json(request, env, { ok: true, id }, 201);
      }

      const promoteMatch = path.match(/^\/v1\/admin\/outreach\/([^/]+)\/promote$/);
      if (request.method === 'POST' && promoteMatch) {
        const outreachId = promoteMatch[1];
        const lead = await env.DB.prepare('SELECT * FROM outreach WHERE id=? LIMIT 1').bind(outreachId).first();
        if (!lead) return json(request, env, { error: 'not_found' }, 404);

        let existing = await env.DB.prepare(
          'SELECT id, code, name, website, city, state, status FROM providers WHERE lower(name)=lower(?) LIMIT 1'
        ).bind(lead.practice_name).first();

        if (!existing) {
          let code = slug(lead.practice_name);
          if (!code) code = `provider-${Math.random().toString(36).slice(2,8)}`;
          const collision = await env.DB.prepare('SELECT 1 FROM providers WHERE code=?').bind(code).first();
          if (collision) code = `${code}-${Math.random().toString(36).slice(2,6)}`;
          const id = uuid();
          await env.DB.prepare(`
            INSERT INTO providers (id,code,name,website,city,email,status)
            VALUES (?,?,?,?,?,?,'pilot')
          `).bind(
            id, code, lead.practice_name, lead.website || '', lead.city || '', lead.email || ''
          ).run();
          existing = { id, code, name: lead.practice_name, website: lead.website || '', city: lead.city || '', state: '', status: 'pilot' };
        }

        await env.DB.prepare(
          `UPDATE outreach SET stage='pilot', updated_at=CURRENT_TIMESTAMP WHERE id=?`
        ).bind(outreachId).run();

        return json(request, env, {
          ok: true,
          provider: {
            ...existing,
            referral_url: `https://trybaldwin.app/?ref=${encodeURIComponent(existing.code)}`,
            kit_url: `https://trackmyhairloss.com/provider-kit/?ref=${encodeURIComponent(existing.code)}`
          }
        });
      }

      const providerStatusMatch = path.match(/^\/v1\/admin\/providers\/([^/]+)\/status$/);
      if (request.method === 'PATCH' && providerStatusMatch) {
        const body = await bodyJson(request);
        const status = String(body?.status || '');
        if (!PROVIDER_STATUSES.has(status)) return json(request, env, { error: 'invalid_status' }, 400);
        const result = await env.DB.prepare('UPDATE providers SET status=? WHERE id=?').bind(status, providerStatusMatch[1]).run();
        if (!result.meta?.changes) return json(request, env, { error: 'not_found' }, 404);
        return json(request, env, { ok: true });
      }

      const stageMatch = path.match(/^\/v1\/admin\/(leads|outreach)\/([^/]+)\/stage$/);
      if (request.method === 'PATCH' && stageMatch) {
        const [, type, id] = stageMatch;
        const body = await bodyJson(request);
        const stage = String(body?.stage || '');
        if (!STAGES.has(stage)) return json(request, env, { error: 'invalid_stage' }, 400);
        const table = type === 'leads' ? 'provider_leads' : 'outreach';
        const result = await env.DB.prepare(
          `UPDATE ${table} SET stage=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`
        ).bind(stage, id).run();
        if (!result.meta?.changes) return json(request, env, { error: 'not_found' }, 404);
        return json(request, env, { ok: true });
      }

      if (request.method === 'GET' && path === '/v1/admin/export.csv') {
        const data = await dashboard(env);
        const lines = [['type','id','practice_name','email','city','state','category','priority','stage','code','created_at']];
        for (const x of data.providers) lines.push(['provider',x.id,x.name,'',x.city,x.state,'','',x.status,x.code,x.created_at]);
        for (const x of data.leads) lines.push(['lead',x.id,x.practice_name,x.email,x.city,x.state,'','',x.stage,'',x.created_at]);
        for (const x of data.outreach) lines.push(['outreach',x.id,x.practice_name,x.email,x.city,'',x.category,x.priority,x.stage,'',x.created_at]);
        const csv = lines.map(row => row.map(csvEscape).join(',')).join('\n');
        return text(request, env, csv, 200, 'text/csv; charset=utf-8');
      }
    }

    return json(request, env, { error: 'not_found' }, 404);
  }
};
