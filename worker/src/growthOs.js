function clean(value, max = 2000) {
  return String(value ?? '').trim().slice(0, max);
}
function safeJson(value, fallback = {}) {
  if (value == null || value === '') return JSON.stringify(fallback);
  if (typeof value === 'string') {
    try { JSON.parse(value); return value; } catch { return JSON.stringify({ text: clean(value, 12000) }); }
  }
  try { return JSON.stringify(value); } catch { return JSON.stringify(fallback); }
}
function uuid() { return crypto.randomUUID(); }
async function bodyJson(request) { try { return await request.json(); } catch { return {}; } }

async function requireSchema(env) {
  const row = await env.DB.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name IN ('growth_budget_authorizations','growth_experiments','growth_variants','growth_daily_metrics','growth_spend_ledger','community_opportunities')").first();
  if (Number(row?.n || 0) < 6) throw new Error('growth_os_schema_missing_run_migration_v6');
}

async function budgetSnapshot(env) {
  const row = await env.DB.prepare(`
    SELECT b.*,
      COALESCE((SELECT SUM(s.amount_cents) FROM growth_spend_ledger s WHERE s.budget_authorization_id=b.id),0) AS spent_cents
    FROM growth_budget_authorizations b
    WHERE b.status='active'
    ORDER BY b.created_at DESC LIMIT 1
  `).first();
  if (!row) return null;
  return { ...row, remaining_cents: Math.max(0, Number(row.authorized_cents || 0) - Number(row.spent_cents || 0)) };
}

export async function growthOsContext(env) {
  await requireSchema(env);
  const [budget, experiments, variants, metrics, spend, community] = await Promise.all([
    budgetSnapshot(env),
    env.DB.prepare(`
      SELECT e.*,
        COALESCE((SELECT SUM(s.amount_cents) FROM growth_spend_ledger s WHERE s.experiment_id=e.id),0) AS spent_cents
      FROM growth_experiments e ORDER BY created_at DESC LIMIT 100
    `).all(),
    env.DB.prepare('SELECT * FROM growth_variants ORDER BY created_at DESC LIMIT 250').all(),
    env.DB.prepare("SELECT * FROM growth_daily_metrics WHERE metric_date>=date('now','-30 days') ORDER BY metric_date DESC LIMIT 1000").all(),
    env.DB.prepare('SELECT * FROM growth_spend_ledger ORDER BY occurred_at DESC LIMIT 250').all(),
    env.DB.prepare(`
      SELECT * FROM community_opportunities
      ORDER BY CASE status WHEN 'approved' THEN 0 WHEN 'drafted' THEN 1 WHEN 'identified' THEN 2 ELSE 3 END, discovered_at DESC
      LIMIT 250
    `).all()
  ]);
  return {
    generated_at: new Date().toISOString(),
    budget,
    experiments: experiments.results || [],
    variants: variants.results || [],
    metrics_30d: metrics.results || [],
    spend_ledger: spend.results || [],
    community_opportunities: community.results || [],
    guardrails: {
      automatic_budget_expansion: false,
      community_individual_profiling: false,
      community_posting_requires_approval: true
    }
  };
}

async function createExperiment(env, body) {
  const budget = await budgetSnapshot(env);
  if (!budget) throw new Error('no_active_budget_authorization');
  const name = clean(body.name, 160), channel = clean(body.channel, 40), hypothesis = clean(body.hypothesis, 2000);
  if (!name || !channel || !hypothesis) throw new Error('name_channel_hypothesis_required');
  const cap = Math.max(0, Math.trunc(Number(body.spend_cap_cents ?? 0) || 0));
  const allocated = await env.DB.prepare(`
    SELECT COALESCE(SUM(spend_cap_cents),0) AS n FROM growth_experiments
    WHERE budget_authorization_id=? AND status IN ('draft','ready','running','paused')
  `).bind(budget.id).first();
  if (Number(allocated?.n || 0) + cap > Number(budget.authorized_cents || 0)) throw new Error('experiment_caps_exceed_authorized_budget');
  const id = clean(body.id, 80) || uuid();
  await env.DB.prepare(`
    INSERT INTO growth_experiments
      (id,name,channel,objective,hypothesis,audience,offer,status,budget_authorization_id,spend_cap_cents,auto_pause_zero_activation_cents)
    VALUES(?,?,?,?,?,?,?,'draft',?,?,?)
  `).bind(
    id,name,channel,clean(body.objective,80)||'baseline_complete',hypothesis,clean(body.audience,1000),clean(body.offer,1000),
    budget.id,cap,body.auto_pause_zero_activation_cents == null ? null : Math.max(0,Math.trunc(Number(body.auto_pause_zero_activation_cents)||0))
  ).run();
  const variants = Array.isArray(body.variants) ? body.variants.slice(0, 12) : [];
  for (const v of variants) {
    const label = clean(v.label, 120); if (!label) continue;
    await env.DB.prepare(`
      INSERT INTO growth_variants(id,experiment_id,label,message,destination_url,metadata_json,allocation_weight,status)
      VALUES(?,?,?,?,?,?,?,'active')
    `).bind(uuid(),id,label,clean(v.message,4000),clean(v.destination_url,1000),safeJson(v.metadata||{}),Math.max(0,Number(v.allocation_weight ?? 1)||0)).run();
  }
  return { ok:true, experiment_id:id, variants_created:variants.length };
}

async function addCommunityTopics(env, body) {
  const items = Array.isArray(body.items) ? body.items.slice(0,200) : [];
  if (!items.length) throw new Error('items_required');
  const results=[];
  for (const raw of items) {
    const platform=clean(raw.platform,50), sourceUrl=clean(raw.source_url,1200), topic=clean(raw.topic,500);
    if (!platform || !sourceUrl || !topic) { results.push({ok:false,error:'platform_source_url_topic_required'}); continue; }
    const id=uuid();
    await env.DB.prepare(`
      INSERT INTO community_opportunities(id,platform,community,source_url,topic,intent,status,reply_draft,approval_required,experiment_id,notes)
      VALUES(?,?,?,?,?,?,'identified',?,1,?,?)
      ON CONFLICT(source_url) DO UPDATE SET
        community=COALESCE(NULLIF(excluded.community,''),community),topic=excluded.topic,
        intent=COALESCE(NULLIF(excluded.intent,''),intent),reply_draft=COALESCE(NULLIF(excluded.reply_draft,''),reply_draft),
        experiment_id=COALESCE(NULLIF(excluded.experiment_id,''),experiment_id),
        notes=COALESCE(NULLIF(excluded.notes,''),notes),updated_at=CURRENT_TIMESTAMP
    `).bind(id,platform,clean(raw.community,160),sourceUrl,topic,clean(raw.intent,500),clean(raw.reply_draft,6000),clean(raw.experiment_id,80)||null,clean(raw.notes,2000)).run();
    results.push({ok:true,source_url:sourceUrl});
  }
  return {ok:true,received:items.length,succeeded:results.length,results};
}

async function recordSpend(env, body) {
  const budget=await budgetSnapshot(env); if(!budget) throw new Error('no_active_budget_authorization');
  const amount=Math.trunc(Number(body.amount_cents||0)); if(!Number.isFinite(amount)||amount<=0) throw new Error('positive_amount_cents_required');
  if(amount>Number(budget.remaining_cents||0)) throw new Error('aggregate_budget_cap_exceeded');
  const experimentId=clean(body.experiment_id,80)||null;
  if(experimentId){
    const exp=await env.DB.prepare(`SELECT e.*,COALESCE((SELECT SUM(amount_cents) FROM growth_spend_ledger WHERE experiment_id=e.id),0) AS spent_cents FROM growth_experiments e WHERE e.id=? LIMIT 1`).bind(experimentId).first();
    if(!exp) throw new Error('experiment_not_found');
    if(Number(exp.spent_cents||0)+amount>Number(exp.spend_cap_cents||0)) throw new Error('experiment_spend_cap_exceeded');
  }
  const id=uuid();
  await env.DB.prepare(`
    INSERT INTO growth_spend_ledger(id,budget_authorization_id,experiment_id,channel,amount_cents,vendor,external_reference,memo)
    VALUES(?,?,?,?,?,?,?,?)
  `).bind(id,budget.id,experimentId,clean(body.channel,40),amount,clean(body.vendor,160),clean(body.external_reference,240)||null,clean(body.memo,1000)).run();
  return {ok:true,id,remaining_cents:Number(budget.remaining_cents||0)-amount};
}

async function upsertMetrics(env, body) {
  const items=Array.isArray(body.items)?body.items.slice(0,500):[]; if(!items.length) throw new Error('items_required');
  for(const m of items){
    const exp=clean(m.experiment_id,80),variant=clean(m.variant_id,80),date=clean(m.metric_date,10);
    if(!exp||!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const n=k=>Math.max(0,Math.trunc(Number(m[k]||0)));
    await env.DB.prepare(`
      INSERT INTO growth_daily_metrics(experiment_id,variant_id,metric_date,impressions,clicks,landing_views,app_store_clicks,app_signups,baseline_completes,second_sessions,subscription_starts,spend_cents,revenue_cents,source_json)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(experiment_id,variant_id,metric_date) DO UPDATE SET
        impressions=excluded.impressions,clicks=excluded.clicks,landing_views=excluded.landing_views,app_store_clicks=excluded.app_store_clicks,
        app_signups=excluded.app_signups,baseline_completes=excluded.baseline_completes,second_sessions=excluded.second_sessions,
        subscription_starts=excluded.subscription_starts,spend_cents=excluded.spend_cents,revenue_cents=excluded.revenue_cents,
        source_json=excluded.source_json,updated_at=CURRENT_TIMESTAMP
    `).bind(exp,variant,date,n('impressions'),n('clicks'),n('landing_views'),n('app_store_clicks'),n('app_signups'),n('baseline_completes'),n('second_sessions'),n('subscription_starts'),n('spend_cents'),n('revenue_cents'),safeJson(m.source||{})).run();
  }
  return {ok:true,received:items.length};
}

export async function handleGrowthOs(request, env, path) {
  await requireSchema(env);
  if(request.method==='GET' && path==='/v1/admin/agent/growth') return growthOsContext(env);
  if(request.method==='POST' && path==='/v1/admin/agent/growth/experiments') return createExperiment(env,await bodyJson(request));
  if(request.method==='POST' && path==='/v1/admin/agent/growth/community') return addCommunityTopics(env,await bodyJson(request));
  if(request.method==='POST' && path==='/v1/admin/agent/growth/spend') return recordSpend(env,await bodyJson(request));
  if(request.method==='POST' && path==='/v1/admin/agent/growth/metrics') return upsertMetrics(env,await bodyJson(request));
  throw new Error('growth_os_route_not_found');
}
