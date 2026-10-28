-- Read-only acquisition ledger reconciliation; returns aggregate financial counts only.
-- $200 is the original lifetime authorization, not a renewable allowance.
-- Theoretical headroom is NOT permission to spend: external charges and production
-- ledger completeness must be verified independently before any paid activity.
WITH
policy AS (SELECT 'consumer-acquisition-2026-09-22' AS id, 20000 AS cap_cents),
authorized AS (
  SELECT COUNT(*) AS row_count, MAX(authorized_cents) AS stored_cap,
         MAX(status) AS stored_status, MAX(currency) AS stored_currency
  FROM growth_budget_authorizations WHERE id=(SELECT id FROM policy)
),
ledger AS (
  SELECT COUNT(*) AS ledger_rows,
         COALESCE(SUM(amount_cents),0) AS spent_all_cents,
         COALESCE(SUM(CASE WHEN budget_authorization_id=(SELECT id FROM policy)
                           THEN amount_cents ELSE 0 END),0) AS spent_original_cents,
         COALESCE(SUM(CASE WHEN budget_authorization_id<>(SELECT id FROM policy)
                           THEN amount_cents ELSE 0 END),0) AS spent_other_cents,
         COALESCE(SUM(CASE WHEN experiment_id IS NULL OR TRIM(experiment_id)=''
                           THEN 1 ELSE 0 END),0) AS missing_experiment_rows
  FROM growth_spend_ledger
),
experiment_spend AS (
  SELECT e.id, e.spend_cap_cents,
         COALESCE(SUM(s.amount_cents),0) AS spent_cents
  FROM growth_experiments e
  LEFT JOIN growth_spend_ledger s ON s.experiment_id=e.id
  GROUP BY e.id
),
flags AS (
  SELECT
    (SELECT COUNT(*) FROM growth_budget_authorizations
      WHERE id<>(SELECT id FROM policy)) AS other_authorization_rows,
    (SELECT COUNT(*) FROM growth_experiments
      WHERE COALESCE(budget_authorization_id,'')<>(SELECT id FROM policy)) AS other_budget_experiments,
    (SELECT COUNT(*) FROM experiment_spend
      WHERE spent_cents>spend_cap_cents) AS experiments_over_cap,
    (SELECT COUNT(*) FROM growth_spend_ledger s
      LEFT JOIN growth_experiments e ON e.id=s.experiment_id
      WHERE s.experiment_id IS NOT NULL AND TRIM(s.experiment_id)<>''
        AND e.id IS NULL) AS unknown_experiment_rows,
    (SELECT COUNT(*) FROM growth_spend_ledger s
      JOIN growth_experiments e ON e.id=s.experiment_id
      WHERE s.budget_authorization_id<>COALESCE(e.budget_authorization_id,'')) AS cross_budget_spend_rows
)
SELECT p.cap_cents AS hard_cap_cents,
       a.row_count AS original_authorization_rows,
       COALESCE(a.stored_cap,0) AS stored_authorization_cents,
       COALESCE(a.stored_status,'missing') AS authorization_status,
       COALESCE(a.stored_currency,'missing') AS authorization_currency,
       l.ledger_rows, l.spent_all_cents, l.spent_original_cents,
       l.spent_other_cents,
       CASE WHEN a.row_count=1 AND a.stored_cap=p.cap_cents
            THEN MAX(0,p.cap_cents-l.spent_all_cents)
            ELSE 0 END AS theoretical_unspent_cents,
       l.missing_experiment_rows,
       f.other_authorization_rows, f.other_budget_experiments,
       f.experiments_over_cap, f.unknown_experiment_rows,
       f.cross_budget_spend_rows,
       CASE WHEN a.row_count=1 AND a.stored_cap=p.cap_cents
                  AND a.stored_status='active' AND a.stored_currency='USD'
                  AND l.spent_all_cents<=p.cap_cents
                  AND l.missing_experiment_rows=0
                  AND f.other_authorization_rows=0
                  AND f.other_budget_experiments=0
                  AND f.experiments_over_cap=0
                  AND f.unknown_experiment_rows=0
                  AND f.cross_budget_spend_rows=0
            THEN 1 ELSE 0 END AS ledger_policy_consistent
FROM policy p CROSS JOIN authorized a CROSS JOIN ledger l CROSS JOIN flags f;
