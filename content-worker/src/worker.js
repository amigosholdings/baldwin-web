import worker from './index.js';
import { applyContentPromptOverrides } from './prompt-overrides.js';

const OPERATOR_CRON = '* * * * *';
const BASE_OPERATOR_CRON = '*/5 * * * *';

function withPromptOverrides(env) {
  if (!env?.AI?.run) return env;
  const ai = env.AI;
  return {
    ...env,
    AI: {
      run(model, input, ...rest) {
        const next = input && Array.isArray(input.messages)
          ? { ...input, messages: applyContentPromptOverrides(input.messages) }
          : input;
        return ai.run(model, next, ...rest);
      }
    }
  };
}

function adminOk(request, env) {
  return Boolean(env.ADMIN_TOKEN) && request.headers.get('x-admin-token') === env.ADMIN_TOKEN;
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
  const details = JSON.stringify({ requested_at: requestedAt, payload });

  await env.DB.prepare(
    `INSERT INTO content_runs (id,mode,stage,status,details_json) VALUES (?,?,?,?,?)`
  ).bind(id, mode, 'queued', 'queued', details).run();

  let dispatch = 'cron_fallback';
  if (env.CONTENT_JOBS?.send) {
    try {
      await env.CONTENT_JOBS.send({ version: 1, jobId: id, mode, requestedAt });
      dispatch = 'queue';
    } catch (error) {
      console.error('content_queue_send_failed', error?.stack || error?.message || String(error));
    }
  }

  return Response.json({
    ok: true,
    started: dispatch === 'queue',
    queued: true,
    dispatch,
    job: { id, mode, status: 'queued' }
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
