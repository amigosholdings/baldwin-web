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
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_providers_code ON providers(code);

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
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_events_name_date ON events(event_name, created_at);
CREATE INDEX IF NOT EXISTS idx_events_provider_date ON events(provider_code, created_at);
CREATE INDEX IF NOT EXISTS idx_events_anon ON events(anonymous_id);

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
