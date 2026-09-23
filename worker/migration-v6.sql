PRAGMA foreign_keys = ON;

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
