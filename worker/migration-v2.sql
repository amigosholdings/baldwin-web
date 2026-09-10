-- Run ONCE against an existing Baldwin growth D1 database created before 2026-09-09.
ALTER TABLE outreach ADD COLUMN priority INTEGER;
ALTER TABLE outreach ADD COLUMN source_url TEXT;
ALTER TABLE outreach ADD COLUMN source_type TEXT;
CREATE INDEX IF NOT EXISTS idx_outreach_priority ON outreach(priority);
