PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS providers (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  website TEXT,
  city TEXT,
  state TEXT,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'pilot',
  apple_offer_code TEXT,
  offer_variant TEXT NOT NULL DEFAULT 'provider_50_two_months',
  offer_provision_status TEXT NOT NULL DEFAULT 'unconfigured',
  offer_provision_error TEXT,
  offer_provisioned_at TEXT,
  offer_provision_updated_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_providers_code ON providers(code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_providers_apple_offer_code ON providers(apple_offer_code) WHERE apple_offer_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS provider_leads (
  id TEXT PRIMARY KEY,
  practice_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  city TEXT,
  state TEXT,
  notes TEXT,
  stage TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_provider_leads_stage ON provider_leads(stage);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  provider_code TEXT,
  anonymous_id TEXT,
  user_id TEXT,
  source TEXT,
  campaign TEXT,
  metadata_json TEXT,
  installation_id TEXT,
  idempotency_key TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_events_name_date ON events(event_name, created_at);
CREATE INDEX IF NOT EXISTS idx_events_provider_date ON events(provider_code, created_at);
CREATE INDEX IF NOT EXISTS idx_events_anon ON events(anonymous_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_idempotency ON events(idempotency_key) WHERE idempotency_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS attribution_subjects (
  subject_key TEXT PRIMARY KEY,
  user_id TEXT,
  installation_id TEXT,
  anonymous_id TEXT,
  provider_code TEXT,
  source TEXT,
  campaign TEXT,
  first_event TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (provider_code) REFERENCES providers(code) ON DELETE SET NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_attribution_user ON attribution_subjects(user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_attribution_install ON attribution_subjects(installation_id) WHERE installation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_attribution_provider ON attribution_subjects(provider_code);

CREATE TABLE IF NOT EXISTS outreach (
  id TEXT PRIMARY KEY,
  practice_name TEXT NOT NULL,
  website TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  category TEXT,
  priority INTEGER,
  source_url TEXT,
  source_type TEXT,
  stage TEXT NOT NULL DEFAULT 'identified',
  last_contacted_at TEXT,
  next_action_at TEXT,
  notes TEXT,
  email_status TEXT,
  do_not_contact INTEGER NOT NULL DEFAULT 0,
  last_reply_at TEXT,
  reply_category TEXT,
  reply_summary TEXT,
  draft_reply TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_outreach_stage ON outreach(stage);
CREATE INDEX IF NOT EXISTS idx_outreach_priority ON outreach(priority);

CREATE TABLE IF NOT EXISTS email_messages (
  id TEXT PRIMARY KEY,
  outreach_id TEXT NOT NULL,
  direction TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'resend',
  provider_email_id TEXT,
  provider_message_id TEXT,
  from_email TEXT,
  to_email TEXT,
  subject TEXT,
  text_body TEXT,
  status TEXT,
  classification TEXT,
  summary TEXT,
  draft_reply TEXT,
  needs_human INTEGER NOT NULL DEFAULT 0,
  handled_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (outreach_id) REFERENCES outreach(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_messages_provider_email_id ON email_messages(provider_email_id) WHERE provider_email_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_messages_outreach_date ON email_messages(outreach_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_messages_direction_date ON email_messages(direction, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_messages_handled ON email_messages(handled_at, created_at DESC);

CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  event_type TEXT,
  received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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


-- Consumer acquisition Growth OS (kept in sync with migration-v6.sql)
-- Baldwin consumer acquisition / Growth OS.
-- This migration is channel-neutral: Apple Ads, owned web, creators, community,
-- SEO/content, App Store experiments, and provider referrals all write into the
-- same experiment + metric ledger.

CREATE TABLE IF NOT EXISTS growth_budget_authorizations (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  authorized_cents INTEGER NOT NULL CHECK (authorized_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','exhausted','revoked')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS growth_experiments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  channel TEXT NOT NULL,
  objective TEXT NOT NULL DEFAULT 'baseline_complete',
  hypothesis TEXT NOT NULL,
  audience TEXT,
  offer TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','ready','running','paused','won','lost','completed')),
  budget_authorization_id TEXT,
  spend_cap_cents INTEGER NOT NULL DEFAULT 0 CHECK (spend_cap_cents >= 0),
  auto_pause_zero_activation_cents INTEGER,
  started_at TEXT,
  ended_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (budget_authorization_id) REFERENCES growth_budget_authorizations(id)
);
CREATE INDEX IF NOT EXISTS idx_growth_experiments_channel_status
  ON growth_experiments(channel,status,created_at DESC);

CREATE TABLE IF NOT EXISTS growth_variants (
  id TEXT PRIMARY KEY,
  experiment_id TEXT NOT NULL,
  label TEXT NOT NULL,
  message TEXT,
  destination_url TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  allocation_weight REAL NOT NULL DEFAULT 1.0 CHECK (allocation_weight >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','retired')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (experiment_id) REFERENCES growth_experiments(id) ON DELETE CASCADE,
  UNIQUE(experiment_id,label)
);
CREATE INDEX IF NOT EXISTS idx_growth_variants_experiment
  ON growth_variants(experiment_id,status);

CREATE TABLE IF NOT EXISTS growth_daily_metrics (
  experiment_id TEXT NOT NULL,
  variant_id TEXT NOT NULL DEFAULT '',
  metric_date TEXT NOT NULL,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  landing_views INTEGER NOT NULL DEFAULT 0,
  app_store_clicks INTEGER NOT NULL DEFAULT 0,
  app_signups INTEGER NOT NULL DEFAULT 0,
  baseline_completes INTEGER NOT NULL DEFAULT 0,
  second_sessions INTEGER NOT NULL DEFAULT 0,
  subscription_starts INTEGER NOT NULL DEFAULT 0,
  spend_cents INTEGER NOT NULL DEFAULT 0,
  revenue_cents INTEGER NOT NULL DEFAULT 0,
  source_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (experiment_id,variant_id,metric_date),
  FOREIGN KEY (experiment_id) REFERENCES growth_experiments(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_growth_metrics_date
  ON growth_daily_metrics(metric_date DESC,experiment_id);

CREATE TABLE IF NOT EXISTS growth_spend_ledger (
  id TEXT PRIMARY KEY,
  budget_authorization_id TEXT NOT NULL,
  experiment_id TEXT,
  channel TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  vendor TEXT,
  external_reference TEXT,
  memo TEXT,
  occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (budget_authorization_id) REFERENCES growth_budget_authorizations(id),
  FOREIGN KEY (experiment_id) REFERENCES growth_experiments(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_growth_spend_budget
  ON growth_spend_ledger(budget_authorization_id,occurred_at DESC);

-- Public creators/businesses only. Do not store inferred health status.
CREATE TABLE IF NOT EXISTS creator_prospects (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  display_name TEXT NOT NULL,
  public_profile_url TEXT NOT NULL,
  public_business_email TEXT,
  niche TEXT,
  audience_size INTEGER,
  fit_score REAL,
  status TEXT NOT NULL DEFAULT 'identified'
    CHECK (status IN ('identified','researched','queued','contacted','responded','partner','declined','suppressed')),
  do_not_contact INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  last_contacted_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(platform,public_profile_url)
);
CREATE INDEX IF NOT EXISTS idx_creator_prospects_status_score
  ON creator_prospects(status,fit_score DESC);

-- Thread/topic opportunities only: intentionally no username/person profile field.
CREATE TABLE IF NOT EXISTS community_opportunities (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  community TEXT,
  source_url TEXT NOT NULL UNIQUE,
  topic TEXT NOT NULL,
  intent TEXT,
  discovered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'identified'
    CHECK (status IN ('identified','drafted','approved','posted','skipped','expired')),
  reply_draft TEXT,
  approval_required INTEGER NOT NULL DEFAULT 1,
  experiment_id TEXT,
  notes TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (experiment_id) REFERENCES growth_experiments(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_community_opportunities_status
  ON community_opportunities(platform,status,discovered_at DESC);

-- Exactly the authorization given on 2026-09-22. New money requires a new row.
INSERT OR IGNORE INTO growth_budget_authorizations
  (id,label,authorized_cents,currency,status,notes)
VALUES
  ('consumer-acquisition-2026-09-22',
   'Initial Baldwin consumer acquisition test',
   20000,
   'USD',
   'active',
   'Hard aggregate cap authorized by founder on 2026-09-22. Do not exceed without new explicit authorization.');
