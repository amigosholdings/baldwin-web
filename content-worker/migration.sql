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
CREATE INDEX IF NOT EXISTS idx_blog_posts_pub ON blog_posts(status,published_at DESC);
