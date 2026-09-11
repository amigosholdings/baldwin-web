ALTER TABLE outreach ADD COLUMN email_status TEXT;
ALTER TABLE outreach ADD COLUMN do_not_contact INTEGER NOT NULL DEFAULT 0;
ALTER TABLE outreach ADD COLUMN last_reply_at TEXT;
ALTER TABLE outreach ADD COLUMN reply_category TEXT;
ALTER TABLE outreach ADD COLUMN reply_summary TEXT;
ALTER TABLE outreach ADD COLUMN draft_reply TEXT;

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
