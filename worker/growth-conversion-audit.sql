-- Read-only, aggregate conversion audit. Never returns user IDs or health information.
-- Two fully matured 7-day signup cohorts: days 7-14 ago vs 14-21 ago.
-- Counts are unique signups; outcomes must occur within 7 days of signup.
-- Source uses signup attribution; missing first-touch linkage appears as 'unattributed'.
-- This query measures signup-cohort conversion, not same-day event ratios.
WITH ranked_signups AS (
  SELECT user_id, created_at AS signup_at, source,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at, id) AS rn
  FROM events
  WHERE event_name = 'app_signup' AND user_id IS NOT NULL AND TRIM(user_id) <> ''
),
cohorts AS (
  SELECT user_id, signup_at,
    CASE WHEN signup_at >= datetime('now','-14 days') THEN 'latest_matured_7d'
         ELSE 'previous_matured_7d' END AS cohort,
    CASE
      WHEN LOWER(TRIM(COALESCE(source,''))) IN ('trackmyhairloss','trackmyhairloss.com') THEN 'trackmyhairloss'
      WHEN LOWER(TRIM(COALESCE(source,''))) IN ('getbaldwin','getbaldwin.app','website') THEN 'baldwin_site'
      WHEN LOWER(TRIM(COALESCE(source,''))) IN ('trybaldwin','trybaldwin.app') THEN 'provider_site'
      WHEN TRIM(COALESCE(source,'')) = '' THEN 'unattributed'
      ELSE 'other'
    END AS source_group
  FROM ranked_signups
  WHERE rn = 1
    AND signup_at >= datetime('now','-21 days')
    AND signup_at < datetime('now','-7 days')
),
outcomes AS (
  SELECT c.cohort, c.source_group,
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.event_name = 'baseline_complete' AND e.user_id = c.user_id
        AND e.created_at >= c.signup_at AND e.created_at < datetime(c.signup_at,'+7 days')
    ) AS baseline_7d,
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.event_name = 'subscription_started' AND e.user_id = c.user_id
        AND e.created_at >= c.signup_at AND e.created_at < datetime(c.signup_at,'+7 days')
    ) AS subscription_7d
  FROM cohorts c
),
rollup AS (
  SELECT cohort, source_group, COUNT(*) AS signups,
         SUM(baseline_7d) AS baseline_completes_7d,
         SUM(subscription_7d) AS subscription_starts_7d
  FROM outcomes GROUP BY cohort, source_group
  UNION ALL
  SELECT cohort, 'ALL_SOURCES', COUNT(*), SUM(baseline_7d), SUM(subscription_7d)
  FROM outcomes GROUP BY cohort
)
SELECT cohort, source_group, signups, baseline_completes_7d, subscription_starts_7d,
       ROUND(100.0 * baseline_completes_7d / signups, 1) AS baseline_rate_pct,
       ROUND(100.0 * subscription_starts_7d / signups, 1) AS subscription_rate_pct
FROM rollup ORDER BY cohort, source_group;

-- AUDIT_SECTION: recent_event_coverage
-- Instrumentation coverage is diagnostic; it is not a cohort conversion rate.
SELECT event_name,
       COUNT(*) AS event_rows_7d,
       SUM(CASE WHEN user_id IS NOT NULL AND TRIM(user_id) <> '' THEN 1 ELSE 0 END) AS rows_with_user_id,
       SUM(CASE WHEN source IS NOT NULL AND TRIM(source) <> '' THEN 1 ELSE 0 END) AS rows_with_source,
       SUM(CASE WHEN user_id IS NULL OR TRIM(user_id) = '' THEN 1 ELSE 0 END) AS rows_missing_user_id
FROM events
WHERE event_name IN ('app_signup','baseline_complete','subscription_started')
  AND created_at >= datetime('now','-7 days')
GROUP BY event_name ORDER BY event_name;
