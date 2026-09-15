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
  const details = JSON.stringify({ requested_at: new Date().toISOString(), payload });

  await env.DB.prepare(
    `INSERT INTO content_runs (id,mode,stage,status,details_json) VALUES (?,?,?,?,?)`
  ).bind(id, mode, 'queued', 'queued', details).run();

  return Response.json({
    ok: true,
    started: false,
    queued: true,
    job: { id, mode, status: 'queued' }
  }, { status: 202 });
}

async function recoverStaleOperatorJobs(env) {
  // Cron-triggered jobs have a 15-minute wall-time limit. Anything still marked
  // running after 16 minutes cannot be a healthy in-flight cron invocation.
  await env.DB.prepare(`UPDATE content_runs
    SET stage='queued', status='queued'
    WHERE mode IN ('operator_generate','operator_seo')
      AND status='running'
      AND created_at < datetime('now','-16 minutes')`).run();
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

  async scheduled(controller, env, ctx) {
    const nextEnv = withPromptOverrides(env);
    if (controller?.cron === OPERATOR_CRON) {
      await recoverStaleOperatorJobs(env);
      // index.js already contains the durable operator-job drain path keyed to
      // the old five-minute cron string. Normalize the one-minute trigger so we
      // can reuse that implementation without running long AI work in HTTP waitUntil().
      return worker.scheduled({
        cron: BASE_OPERATOR_CRON,
        scheduledTime: controller.scheduledTime,
        type: controller.type
      }, nextEnv, ctx);
    }
    return worker.scheduled(controller, nextEnv, ctx);
  }
};
