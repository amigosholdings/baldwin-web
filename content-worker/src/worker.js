import worker from './index.js';
import { applyContentPromptOverrides } from './prompt-overrides.js';

const OPERATOR_CRON = '* * * * *';
const BASE_OPERATOR_CRON = '*/5 * * * *';
const CONTENT_ADMIN_ORIGINS = new Set([
  'https://trackmyhairloss.com',
  'https://www.trackmyhairloss.com'
]);
const CONTENT_TYPES = new Set(['tracking_guide','treatment_comparison','treatment_profile','question']);

function preferredTypeFromMessages(messages = []) {
  const text = messages.map(m => String(m?.content || '')).join('\n');
  const match = text.match(/Preferred content type for this run:\s*(tracking_guide|treatment_comparison|treatment_profile|question)\b/i);
  return match && CONTENT_TYPES.has(match[1].toLowerCase()) ? match[1].toLowerCase() : null;
}

function jsonTextFromResult(result) {
  if (typeof result?.response === 'string') return result.response;
  const content = result?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  if (typeof result === 'string') return result;
  return null;
}

function resultHasValidJson(result) {
  const text = jsonTextFromResult(result);
  if (text == null) return true;
  try { JSON.parse(text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')); return true; }
  catch { return false; }
}

function withPromptOverrides(env) {
  if (!env?.AI?.run) return env;
  const ai = env.AI;
  return {
    ...env,
    AI: {
      async run(model, input, ...rest) {
        let next = input && Array.isArray(input.messages)
          ? { ...input, messages: applyContentPromptOverrides(input.messages) }
          : input;

        const preferredType = next && Array.isArray(next.messages)
          ? preferredTypeFromMessages(next.messages)
          : null;
        if (preferredType) {
          next = {
            ...next,
            messages: [
              ...next.messages,
              {
                role: 'system',
                content: `Operator override: ${preferredType} is a HARD content-type constraint for this run, not a suggestion. Every proposed candidate must use content_type="${preferredType}". Do not return tracking guides, questions, or another type as a fallback. If the operator supplied a brief, satisfy that brief within ${preferredType}.`
              }
            ]
          };
        }

        let result = await ai.run(model, next, ...rest);
        const expectsJson = Boolean(next?.response_format && ['json_schema','json_object'].includes(next.response_format.type));
        if (!expectsJson || resultHasValidJson(result)) return result;

        console.warn('workers_ai_invalid_json_retry', JSON.stringify({ model, preferredType, maxTokens: next.max_completion_tokens || null }));
        const retryMax = Math.min(12000, Math.max(8000, Number(next.max_completion_tokens || 5000) + 3000));
        const retryInput = {
          ...next,
          temperature: Math.min(Number(next.temperature ?? 0.2), 0.12),
          max_completion_tokens: retryMax,
          messages: [
            ...(next.messages || []),
            {
              role: 'system',
              content: 'JSON RETRY: The previous response could not be parsed as JSON. Return one complete valid JSON object only. Do not use markdown fences. Escape all quotes and line breaks inside string values correctly. Do not truncate the object. Preserve the requested schema and content type.'
            }
          ]
        };
        result = await ai.run(model, retryInput, ...rest);
        return result;
      }
    }
  };
}

function adminOk(request, env) {
  return Boolean(env.ADMIN_TOKEN) && request.headers.get('x-admin-token') === env.ADMIN_TOKEN;
}

function contentAdminCors(request) {
  const origin = request.headers.get('Origin') || '';
  if (!origin || !CONTENT_ADMIN_ORIGINS.has(origin)) return {};
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'POST,OPTIONS',
    'access-control-allow-headers': 'content-type,x-admin-token',
    'access-control-max-age': '86400',
    'vary': 'Origin'
  };
}

function contentAdminJson(request, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...contentAdminCors(request)
    }
  });
}

async function deleteContentPage(request, env, rawSlug) {
  if (!adminOk(request, env)) return contentAdminJson(request, { error: 'unauthorized' }, 401);

  let slug = '';
  try { slug = decodeURIComponent(rawSlug || '').trim(); }
  catch { return contentAdminJson(request, { error: 'invalid_slug' }, 400); }
  if (!/^[a-z0-9][a-z0-9-]{0,99}$/.test(slug)) {
    return contentAdminJson(request, { error: 'invalid_slug' }, 400);
  }

  const page = await env.DB.prepare(
    `SELECT id,slug,title,content_type,status FROM content_pages WHERE slug=? LIMIT 1`
  ).bind(slug).first();
  if (!page) return contentAdminJson(request, { error: 'not_found' }, 404);

  await env.DB.batch([
    env.DB.prepare(`DELETE FROM seo_actions WHERE slug=?`).bind(slug),
    env.DB.prepare(`DELETE FROM content_pages WHERE slug=?`).bind(slug)
  ]);

  const prefix = page.content_type === 'treatment_comparison'
    ? '/compare/'
    : page.content_type === 'treatment_profile'
      ? '/treatments/'
      : '/blog/';

  return contentAdminJson(request, {
    ok: true,
    deleted: {
      slug: page.slug,
      title: page.title,
      status: page.status,
      path: `${prefix}${page.slug}`
    }
  });
}

async function enqueueOperatorJob(request, env, mode) {
  if (!adminOk(request, env)) return new Response('Unauthorized', { status: 401 });

  const body = mode === 'operator_generate'
    ? await request.json().catch(() => ({}))
    : {};
  const payload = mode === 'operator_generate'
    ? { preferredType: body.preferredType || null, brief: body.brief || '' }
    : {};
  const id = crypto.randomUUID();
  const requestedAt = new Date().toISOString();
  const initialDetails = { requested_at: requestedAt, payload };

  await env.DB.prepare(
    `INSERT INTO content_runs (id,mode,stage,status,details_json) VALUES (?,?,?,?,?)`
  ).bind(id, mode, 'queued', 'queued', JSON.stringify(initialDetails)).run();

  let dispatch = 'cron_fallback';
  let dispatchError = null;
  if (env.CONTENT_JOBS?.send) {
    try {
      await env.CONTENT_JOBS.send({ version: 1, jobId: id, mode, requestedAt });
      dispatch = 'queue';
    } catch (error) {
      dispatchError = error?.message || String(error);
      console.error('content_queue_send_failed', error?.stack || dispatchError);
    }
  }

  const dispatchedAt = dispatch === 'queue' ? new Date().toISOString() : null;
  const details = {
    ...initialDetails,
    dispatch,
    dispatched_at: dispatchedAt,
    ...(dispatchError ? { dispatch_error: dispatchError } : {})
  };
  // Only change the stage while the job is still waiting. A very fast queue
  // consumer may already have claimed it and moved status to running.
  await env.DB.prepare(`UPDATE content_runs SET stage=?, details_json=? WHERE id=? AND status='queued'`)
    .bind(dispatch === 'queue' ? 'dispatched' : 'queued', JSON.stringify(details), id).run();

  return Response.json({
    ok: true,
    started: dispatch === 'queue',
    queued: true,
    dispatch,
    job: { id, mode, status: 'queued', stage: dispatch === 'queue' ? 'dispatched' : 'queued' }
  }, { status: 202 });
}

async function recoverStaleOperatorJobs(env) {
  // Queue/cron executions have a 15-minute wall-time limit. Anything still
  // marked running after 16 minutes cannot be a healthy in-flight invocation.
  await env.DB.prepare(`UPDATE content_runs
    SET stage='queued', status='queued'
    WHERE mode IN ('operator_generate','operator_seo')
      AND status='running'
      AND created_at < datetime('now','-16 minutes')`).run();
}

async function runOneOperatorJob(env) {
  const pending = [];
  const capturedCtx = {
    waitUntil(promise) { pending.push(Promise.resolve(promise)); },
    passThroughOnException() {}
  };

  await worker.scheduled(
    { cron: BASE_OPERATOR_CRON, scheduledTime: Date.now(), type: 'scheduled' },
    withPromptOverrides(env),
    capturedCtx
  );
  await Promise.all(pending);
}

export default {
  async fetch(request, env, ctx) {
    const path = new URL(request.url).pathname;
    const deleteMatch = path.match(/^\/__delete\/([^/]+)$/);
    if (request.method === 'OPTIONS' && deleteMatch) {
      const origin = request.headers.get('Origin') || '';
      if (!CONTENT_ADMIN_ORIGINS.has(origin)) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: contentAdminCors(request) });
    }
    if (request.method === 'POST' && deleteMatch) {
      return deleteContentPage(request, env, deleteMatch[1]);
    }
    if (request.method === 'POST' && path === '/__generate') {
      return enqueueOperatorJob(request, env, 'operator_generate');
    }
    if (request.method === 'POST' && path === '/__seo-run') {
      return enqueueOperatorJob(request, env, 'operator_seo');
    }
    return worker.fetch(request, withPromptOverrides(env), ctx);
  },

  async queue(batch, env) {
    await recoverStaleOperatorJobs(env);
    for (const message of batch.messages) {
      try {
        await runOneOperatorJob(env);
        message.ack();
      } catch (error) {
        console.error('content_queue_consumer_failed', error?.stack || error?.message || String(error));
        message.retry({ delaySeconds: 15 });
      }
    }
  },

  async scheduled(controller, env, ctx) {
    const nextEnv = withPromptOverrides(env);
    if (controller?.cron === OPERATOR_CRON) {
      await recoverStaleOperatorJobs(env);
      // Keep the one-minute cron as a durable fallback if Queue delivery is
      // delayed or the Queue binding is unavailable.
      return worker.scheduled({
        cron: BASE_OPERATOR_CRON,
        scheduledTime: controller.scheduledTime,
        type: controller.type
      }, nextEnv, ctx);
    }
    return worker.scheduled(controller, nextEnv, ctx);
  }
};
