-- V4 autonomous search-feedback tables. Safe to run repeatedly.
CREATE TABLE IF NOT EXISTS seo_query_snapshots (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  window_start TEXT NOT NULL,
  window_end TEXT NOT NULL,
  query TEXT NOT NULL,
  page TEXT NOT NULL,
  clicks REAL NOT NULL DEFAULT 0,
  impressions REAL NOT NULL DEFAULT 0,
  ctr REAL NOT NULL DEFAULT 0,
  position REAL,
  observed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(source, window_start, window_end, query, page)
);
CREATE INDEX IF NOT EXISTS idx_seo_query_snapshots_window
  ON seo_query_snapshots(source, window_end DESC, impressions DESC);
CREATE INDEX IF NOT EXISTS idx_seo_query_snapshots_page
  ON seo_query_snapshots(page, window_end DESC, impressions DESC);

CREATE TABLE IF NOT EXISTS seo_actions (
  id TEXT PRIMARY KEY,
  page TEXT,
  slug TEXT,
  query TEXT,
  action_type TEXT NOT NULL,
  score REAL NOT NULL DEFAULT 0,
  reason TEXT NOT NULL,
  details_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'proposed',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  executed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_seo_actions_status_score
  ON seo_actions(status, score DESC, created_at DESC);

CREATE TABLE IF NOT EXISTS seo_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
