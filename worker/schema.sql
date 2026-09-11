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
