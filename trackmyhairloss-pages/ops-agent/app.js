const API = 'https://baldwin-growth-api.threeamigosholdings.workers.dev';
const $ = id => document.getElementById(id);
let TOKEN = localStorage.getItem('baldwin_agent_token') || '';
let DATA = null;

const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const pct = (a,b) => Number(b) ? `${Math.round(Number(a||0)/Number(b)*100)}%` : '—';

async function readResponse(r) {
  const raw = await r.text();
  let payload = {};
  try { payload = raw ? JSON.parse(raw) : {}; } catch { payload = { raw }; }
  if (!r.ok) {
    const err = new Error(payload.error || payload.detail || payload.raw || `HTTP ${r.status}`);
    err.status = r.status;
    throw err;
  }
  return payload;
}

async function api(path, opts = {}) {
  if (!TOKEN) throw new Error('Create an agent session first.');
  const r = await fetch(API + path, {
    ...opts,
    headers: {
      'content-type': 'application/json',
      'x-agent-token': TOKEN,
      ...(opts.headers || {})
    }
  });
  try { return await readResponse(r); }
  catch (error) {
    if (error.status === 401) {
      localStorage.removeItem('baldwin_agent_token');
      TOKEN = '';
      showBootstrap('Agent session expired. Create a new one.');
    }
    throw error;
  }
}

function status(message, bad = false) {
  $('status').textContent = message || '';
  $('status').classList.toggle('bad', Boolean(bad));
}

function showBootstrap(message = '') {
  $('bootstrap').classList.remove('hidden');
  $('app').classList.add('hidden');
  if (message) status(message, true);
}

function showApp() {
  $('bootstrap').classList.add('hidden');
  $('app').classList.remove('hidden');
}

async function createAgentSession() {
  const admin = $('adminToken').value.trim();
  if (!admin) throw new Error('ADMIN_TOKEN is required once to create a scoped agent session.');
  status('Creating restricted GTM agent session…');
  try {
    const r = await fetch(API + '/v1/admin/agent-token', {
      method: 'POST',
      headers: { 'content-type':'application/json', 'x-admin-token':admin },
      body: JSON.stringify({ ttl_hours: 720 })
    });
    const payload = await readResponse(r);
    TOKEN = payload.token;
    localStorage.setItem('baldwin_agent_token', TOKEN);
    localStorage.setItem('baldwin_agent_expires_at', payload.expires_at || '');
    $('adminToken').value = '';
    await load();
    status(`Restricted agent session created · expires ${new Date(payload.expires_at).toLocaleString()}`);
  } finally {
    $('adminToken').value = '';
  }
}

async function load() {
  status('Loading agent context…');
  DATA = await api('/v1/admin/agent/context');
  render();
  showApp();
  const expiry = localStorage.getItem('baldwin_agent_expires_at');
  status(`Loaded ${new Date(DATA.generated_at).toLocaleString()}${expiry ? ` · session expires ${new Date(expiry).toLocaleDateString()}` : ''}`);
}

function activeRun() { return $('runSelect').value || ''; }
function parseBatch(id, key) {
  const raw = $(id).value.trim();
  if (!raw) throw new Error('Paste a JSON batch first.');
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.[key])) return parsed[key];
  throw new Error(`Expected an array or {${key}:[...]}.`);
}

function render() {
  const s = DATA.summary || {}, g = DATA.guardrails || {};
  const items = [
    ['Outreach universe', s.outreach_total || 0], ['Identified', s.identified || 0],
    ['Outbound 24h', s.outbound_24h || 0], ['Replies · 7d', s.replies_7d || 0],
    ['Positive replies', s.positive_replies || 0], ['Pilots / active', s.pilots_or_active || 0],
    ['Agent ready', s.agent_ready || 0]
  ];
  $('kpis').innerHTML = items.map(([k,v]) => `<div class="kpi"><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('');
  $('guardrails').innerHTML = [
    `Max ${g.max_agent_sends_rolling_24h || 40} agent sends / rolling 24h`,
    'Scoped GTM credential',
    g.suppression_enforced ? 'Suppression enforced' : '',
    g.duplicate_initial_send_blocked ? 'Duplicate initials blocked' : '',
    g.needs_human_replies_blocked ? 'Risky replies blocked' : '',
    g.worker_decides_targeting === false ? 'Targeting = ChatGPT' : '',
    g.worker_writes_copy === false ? 'Copy = ChatGPT' : ''
  ].filter(Boolean).map(x => `<span class="guard">${esc(x)}</span>`).join('');

  const runs = DATA.recent_runs || [];
  $('runSelect').innerHTML = `<option value="">Select a run</option>` + runs.map(r => `<option value="${esc(r.id)}" ${r.status === 'running' ? 'selected' : ''}>${esc(r.created_at)} · ${esc(r.status)} · ${esc((r.hypothesis || '').slice(0,70))}</option>`).join('');

  const q = DATA.message_queue || [];
  $('queueCount').textContent = `${q.filter(x => x.status === 'queued').length} queued`;
  $('queueRows').innerHTML = q.length ? q.map(x => `<tr><td><span class="pill ${esc(x.status)}">${esc(x.status)}</span>${x.error ? `<div class="muted">${esc(x.error)}</div>` : ''}</td><td><b>${esc(x.practice_name)}</b><div class="muted">${esc(x.email || '')}</div></td><td>${esc(x.kind)}</td><td class="mono">${esc(x.variant)}</td><td>${esc(x.rationale || x.decision_reason || '')}</td><td>${esc(x.subject)}</td><td><div class="copy">${esc(x.body)}</div></td></tr>`).join('') : '<tr><td colspan="7">No queued agent messages.</td></tr>';

  const replies = DATA.pending_replies || [];
  $('replyCount').textContent = `${replies.length} open`;
  $('replyRows').innerHTML = replies.length ? replies.map(x => `<tr><td><b>${esc(x.practice_name)}</b><div class="muted">${esc(x.from_email || x.practice_email || '')}</div><div class="mono">outreach ${esc(x.outreach_id)}</div><div class="mono">message ${esc(x.id)}</div></td><td>${esc(x.classification || x.reply_category || '')}</td><td>${Number(x.needs_human) ? '<span class="pill failed">needs human</span>' : '<span class="pill positive">agent-safe</span>'}</td><td>${esc(x.subject || '')}</td><td><div class="copy">${esc(x.text_body || '')}</div></td><td><div class="copy">${esc(x.draft_reply || '')}</div></td></tr>`).join('') : '<tr><td colspan="6">No unhandled replies.</td></tr>';

  const vars = DATA.variant_performance_30d || [];
  $('variantRows').innerHTML = vars.length ? vars.map(x => `<tr><td class="mono">${esc(x.variant)}</td><td>${x.sent || 0}</td><td>${x.replies || 0} <span class="muted">${pct(x.replies,x.sent)}</span></td><td>${x.positive_replies || 0}</td><td>${x.progressed || 0}</td></tr>`).join('') : '<tr><td colspan="5">No agent variant data yet.</td></tr>';

  const seg = DATA.segment_performance_30d || [];
  $('segmentRows').innerHTML = seg.length ? seg.map(x => `<tr><td>${esc(x.segment)}</td><td>${x.contacted || 0}</td><td>${x.replies || 0} <span class="muted">${pct(x.replies,x.contacted)}</span></td><td>${x.positive_replies || 0}</td><td>${x.progressed || 0}</td></tr>`).join('') : '<tr><td colspan="5">No segment data yet.</td></tr>';

  $('runRows').innerHTML = runs.length ? runs.map(r => `<tr><td class="mono">${esc(r.created_at)}</td><td>${esc(r.status)}</td><td>${esc(r.hypothesis || '')}</td><td class="mono">${r.target_discovery || 0}/${r.target_research || 0}/${r.target_send || 0}</td><td>${r.enriched_count || 0}</td><td>${r.selected_count || 0}</td><td>${r.sent_count || 0}</td><td>${r.reply_count || 0}</td><td>${r.positive_reply_count || 0}</td><td>${r.progressed_count || 0}</td><td>${esc(r.next_strategy || '')}</td></tr>`).join('') : '<tr><td colspan="11">No runs yet.</td></tr>';
}

$('createSession').addEventListener('click', () => createAgentSession().catch(e => status(e.message, true)));
$('load').addEventListener('click', () => load().catch(e => status(e.message, true)));
$('forget').addEventListener('click', () => {
  localStorage.removeItem('baldwin_agent_token');
  localStorage.removeItem('baldwin_agent_expires_at');
  TOKEN = '';
  showBootstrap('Restricted agent session removed from this browser.');
});
$('clearProspects').addEventListener('click', () => { $('prospectsJson').value = ''; });
$('clearDecisions').addEventListener('click', () => { $('decisionsJson').value = ''; });

$('startRun').addEventListener('click', async () => {
  try {
    const body = {
      agent_name:'ChatGPT GTM', hypothesis:$('hypothesis').value.trim(),
      target_discovery:Number($('discover').value || 0), target_research:Number($('research').value || 0), target_send:Number($('sendTarget').value || 0),
      strategy:{objective:'maximize qualified provider activation, referral usage, and paid conversion; not opens'},
      experiment:{rule:'change one meaningful variable at a time'}
    };
    const r = await api('/v1/admin/agent/runs', { method:'POST', body:JSON.stringify(body) });
    await load(); $('runSelect').value = r.run_id; status(`Run ${r.run_id} started.`);
  } catch (e) { status(e.message, true); }
});

$('applyProspects').addEventListener('click', async () => {
  try {
    const prospects = parseBatch('prospectsJson','prospects'), run_id = activeRun();
    if (!run_id) throw new Error('Select an active run first.');
    const r = await api('/v1/admin/agent/prospects', { method:'POST', body:JSON.stringify({run_id,prospects}) });
    await load(); status(`Research stored: ${r.succeeded}/${r.received}.`);
  } catch (e) { status(e.message, true); }
});

$('applyDecisions').addEventListener('click', async () => {
  try {
    const decisions = parseBatch('decisionsJson','decisions'), run_id = activeRun();
    if (!run_id) throw new Error('Select an active run first.');
    const r = await api('/v1/admin/agent/decisions', { method:'POST', body:JSON.stringify({run_id,decisions}) });
    await load();
    const failures = (r.results || []).filter(x => !x.ok);
    status(`Decisions applied: ${r.succeeded}/${r.received}${failures.length ? ` · ${failures.map(x=>x.error).slice(0,3).join(', ')}` : ''}.`, failures.length > 0);
  } catch (e) { status(e.message, true); }
});

$('sendRun').addEventListener('click', async () => {
  try {
    const run_id = activeRun(); if (!run_id) throw new Error('Select a run first.');
    const r = await api('/v1/admin/agent/send', { method:'POST', body:JSON.stringify({run_id}) });
    await load(); status(`Sent ${r.sent}/${r.attempted}. Rolling cap: ${r.cap}.`);
  } catch (e) { status(e.message, true); }
});

$('completeRun').addEventListener('click', async () => {
  try {
    const run_id = activeRun(); if (!run_id) throw new Error('Select a run first.');
    const next = prompt('What should the next run change or keep?','') || '';
    const strategy = prompt('One-sentence summary of what this run tested?','') || '';
    await api(`/v1/admin/agent/runs/${encodeURIComponent(run_id)}/complete`, { method:'POST', body:JSON.stringify({strategy_summary:strategy,next_strategy:next,observations:{completed_from:'ops-agent'}}) });
    await load(); status('Run completed and ledger updated.');
  } catch (e) { status(e.message, true); }
});

if (TOKEN) load().catch(e => status(e.message, true)); else showBootstrap();
