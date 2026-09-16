PRAGMA foreign_keys = ON;

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
