CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  dek TEXT NOT NULL,
  description TEXT NOT NULL,
  body_html TEXT NOT NULL,
  topic_key TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  generated_by TEXT,
  published_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_pages (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  dek TEXT NOT NULL,
  description TEXT NOT NULL,
  answer_summary TEXT,
  body_html TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'tracking_guide',
  safety_tier TEXT NOT NULL DEFAULT 'standard',
  target_query TEXT,
  source_json TEXT NOT NULL DEFAULT '[]',
  faq_json TEXT NOT NULL DEFAULT '[]',
  related_slugs_json TEXT NOT NULL DEFAULT '[]',
  evidence_fingerprint TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  generated_by TEXT,
  editor_verdict TEXT,
  editor_notes TEXT,
  published_at TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_content_pages_status_date
  ON content_pages(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_pages_type_status
  ON content_pages(content_type, status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_pages_query
  ON content_pages(target_query);

CREATE TABLE IF NOT EXISTS topic_candidates (
  id TEXT PRIMARY KEY,
  suggested_title TEXT NOT NULL,
  target_query TEXT NOT NULL,
  content_type TEXT NOT NULL,
  safety_tier TEXT NOT NULL,
  rationale TEXT,
  research_queries_json TEXT NOT NULL DEFAULT '[]',
  drug_terms_json TEXT NOT NULL DEFAULT '[]',
  score_utility REAL NOT NULL DEFAULT 0,
  score_search REAL NOT NULL DEFAULT 0,
  score_originality REAL NOT NULL DEFAULT 0,
  score_product_fit REAL NOT NULL DEFAULT 0,
  score_evidence REAL NOT NULL DEFAULT 0,
  total_score REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'proposed',
  selected_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_topic_candidates_status_score
  ON topic_candidates(status, total_score DESC, created_at DESC);

CREATE TABLE IF NOT EXISTS search_signals (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  query TEXT NOT NULL,
  page TEXT,
  clicks REAL NOT NULL DEFAULT 0,
  impressions REAL NOT NULL DEFAULT 0,
  position REAL,
  citations REAL NOT NULL DEFAULT 0,
  observed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_search_signals_query
  ON search_signals(query, observed_at DESC);

CREATE TABLE IF NOT EXISTS content_runs (
  id TEXT PRIMARY KEY,
  mode TEXT NOT NULL,
  stage TEXT NOT NULL,
  status TEXT NOT NULL,
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Carry forward any v1 blog posts without duplicating them.
INSERT OR IGNORE INTO content_pages (
  id, slug, title, dek, description, body_html,
  content_type, safety_tier, target_query, source_json, faq_json,
  related_slugs_json, status, generated_by, published_at, updated_at, created_at
)
SELECT
  id, slug, title, dek, description, body_html,
  'tracking_guide', 'standard', title, '[]', '[]', '[]',
  status, generated_by, published_at, created_at, created_at
FROM blog_posts;
