-- Run ONCE against an existing Baldwin growth D1 database.
ALTER TABLE providers ADD COLUMN apple_offer_code TEXT;
ALTER TABLE providers ADD COLUMN offer_variant TEXT NOT NULL DEFAULT 'provider_50_two_months';
ALTER TABLE providers ADD COLUMN offer_provision_status TEXT NOT NULL DEFAULT 'unconfigured';
ALTER TABLE providers ADD COLUMN offer_provision_error TEXT;
ALTER TABLE providers ADD COLUMN offer_provisioned_at TEXT;
ALTER TABLE providers ADD COLUMN offer_provision_updated_at TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_providers_apple_offer_code ON providers(apple_offer_code) WHERE apple_offer_code IS NOT NULL;

ALTER TABLE events ADD COLUMN installation_id TEXT;
ALTER TABLE events ADD COLUMN idempotency_key TEXT;
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
