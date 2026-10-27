-- Read-only, aggregate diagnostic of signup attribution handoff, not conversion.
-- First signup per user in the last 7 days; no identifiers or health data returned.
-- Anonymous ID absence is NOT proof of a lost web-to-app visit: users may arrive directly.
-- Only first touches recorded no later than signup count as linkage-defect candidates.
WITH ranked_signups AS (
  SELECT user_id, anonymous_id, installation_id, source, campaign, provider_code, created_at,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at, id) AS rn
  FROM events
  WHERE event_name = 'app_signup' AND user_id IS NOT NULL AND TRIM(user_id) <> ''
),
signups AS (
  SELECT * FROM ranked_signups
  WHERE rn = 1 AND created_at >= datetime('now','-7 days') AND created_at < datetime('now')
),
flags AS (
  SELECT s.*,
    CASE WHEN TRIM(COALESCE(s.source,'')) <> '' OR TRIM(COALESCE(s.campaign,'')) <> ''
           OR TRIM(COALESCE(s.provider_code,'')) <> '' THEN 1 ELSE 0 END AS signup_attributed,
    EXISTS (
      SELECT 1 FROM attribution_subjects a
      WHERE a.subject_key = 'anon:' || s.anonymous_id
        AND datetime(a.created_at) <= datetime(s.created_at)
        AND (TRIM(COALESCE(a.source,'')) <> '' OR TRIM(COALESCE(a.campaign,'')) <> ''
             OR TRIM(COALESCE(a.provider_code,'')) <> '')
    ) AS anonymous_first_touch,
    EXISTS (
      SELECT 1 FROM attribution_subjects a
      WHERE a.subject_key = 'install:' || s.installation_id
        AND datetime(a.created_at) <= datetime(s.created_at)
    ) AS installation_record,
    EXISTS (
      SELECT 1 FROM attribution_subjects a
      WHERE a.subject_key = 'install:' || s.installation_id
        AND datetime(a.created_at) <= datetime(s.created_at)
        AND (TRIM(COALESCE(a.source,'')) <> '' OR TRIM(COALESCE(a.campaign,'')) <> ''
             OR TRIM(COALESCE(a.provider_code,'')) <> '')
    ) AS installation_first_touch
  FROM signups s
)
SELECT COUNT(*) AS signups_7d,
       COALESCE(SUM(CASE WHEN anonymous_id IS NOT NULL AND TRIM(anonymous_id) <> '' THEN 1 ELSE 0 END),0) AS with_anonymous_id,
       COALESCE(SUM(CASE WHEN installation_id IS NOT NULL AND TRIM(installation_id) <> '' THEN 1 ELSE 0 END),0) AS with_installation_id,
       COALESCE(SUM(signup_attributed),0) AS attributed_signups,
       COALESCE(SUM(anonymous_first_touch),0) AS with_known_anonymous_first_touch,
       COALESCE(SUM(installation_first_touch),0) AS with_known_install_first_touch,
       COALESCE(SUM(CASE WHEN signup_attributed=0 AND (anonymous_first_touch=1 OR installation_first_touch=1)
                         THEN 1 ELSE 0 END),0) AS unattributed_despite_known_first_touch,
       COALESCE(SUM(CASE WHEN signup_attributed=0 AND anonymous_first_touch=1
                          AND installation_record=1 AND installation_first_touch=0
                         THEN 1 ELSE 0 END),0) AS blank_install_shadow_candidates
FROM flags;
