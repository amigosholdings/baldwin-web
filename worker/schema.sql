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
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_outreach_stage ON outreach(stage);
CREATE INDEX IF NOT EXISTS idx_outreach_priority ON outreach(priority);
