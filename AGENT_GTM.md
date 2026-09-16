# Baldwin ChatGPT GTM Autopilot

This layer makes ChatGPT the GTM decision-maker while keeping Cloudflare deterministic.

## Architecture

ChatGPT decides:

- which clinics to research
- what data to collect
- which clinics qualify
- why they qualify
- message subject/body and experiment variant
- whether to hold/reject/follow up
- how the next run should change based on outcomes

The Growth Worker only:

- stores research and run state
- deduplicates providers
- enforces suppression / bounce / complaint state
- blocks duplicate initial sends
- blocks replies marked `needs_human`
- enforces a rolling safety ceiling (`AGENT_MAX_DAILY_SENDS`, default 40)
- executes exact copy already chosen by the agent
- records outcomes for the next run

The legacy `/v1/admin/outreach/send-batch` endpoint still exists for backwards compatibility. The ChatGPT agent must not use it because it chooses recipients using static priority rules.

## Deploy once

The new tables are migration v5. Existing production D1 databases must run it once before deploying the Worker:

```bash
cd worker
npm install
npm run db:migrate:v5:remote
```

Then deploy normally through Cloudflare Git or:

```bash
npm run deploy
```

The Worker entrypoint is now `src/agentIndex.js`, which intercepts only `/v1/admin/agent/*` and delegates every other request to the existing `src/index.js` router.

## Sender isolation

The repo already sends provider outreach as:

```text
Sean from Baldwin <sean@trybaldwin.app>
```

and uses `trybaldwin.app` for replies. That keeps prospecting separate from the main `getbaldwin.app` product domain without using an obviously disposable `outreach.` subdomain. Keep SPF, DKIM and DMARC configured for the sending domain in Resend.

## Agent console

Open:

```text
https://trackmyhairloss.com/ops-agent/
```

Use the same `ADMIN_TOKEN` as `/ops/`.

The page is intentionally machine-friendly: ChatGPT Work can paste one batch of research and one batch of decisions instead of clicking through dozens of individual rows.

## Agent API

All routes require `x-admin-token: ADMIN_TOKEN`.

### Load complete GTM context

```http
GET /v1/admin/agent/context
```

Returns:

- rolling send/reply summary
- all recently researched prospects
- pending reply messages
- exact message queue
- recent run ledger
- 30-day performance by message variant
- 30-day performance by provider segment
- full referral/app funnel event counts
- recent agent audit events
- sender readiness and guardrails

### Start a run

```http
POST /v1/admin/agent/runs
```

Example:

```json
{
  "agent_name": "ChatGPT GTM",
  "hypothesis": "Independent physician-owned FUE clinics with meaningful patient education will convert better than broad medspas.",
  "target_discovery": 50,
  "target_research": 30,
  "target_send": 20,
  "strategy": {
    "primary_segment": "physician-owned hair restoration",
    "objective": "provider activation and referred paid users"
  },
  "experiment": {
    "variable": "opening personalization",
    "control_share": 0.8,
    "test_share": 0.2
  }
}
```

### Store researched prospects

```http
POST /v1/admin/agent/prospects
```

```json
{
  "run_id": "RUN_ID",
  "prospects": [
    {
      "practice_name": "Example Hair Restoration",
      "website": "https://example.com",
      "email": "office@example.com",
      "city": "New York",
      "state": "NY",
      "category": "FUE / hair restoration",
      "contact_name": "Dr. Example",
      "contact_role": "Founder",
      "source_url": "https://example.com/team",
      "fit_score": 88,
      "email_confidence": "high",
      "research": {
        "procedures": ["FUE", "PRP"],
        "locations": 1,
        "online_booking": true,
        "education_quality": "strong",
        "why_baldwin_fits": "Longitudinal treatment patients and strong before/after workflow"
      }
    }
  ]
}
```

The server deduplicates by email, stored domain, existing website, and practice-name/city. It never clears an existing suppression flag.

### Record decisions and exact copy

```http
POST /v1/admin/agent/decisions
```

Allowed decisions:

- `send_initial`
- `follow_up`
- `reply`
- `hold`
- `reject`

Example initial decision:

```json
{
  "run_id": "RUN_ID",
  "decisions": [
    {
      "outreach_id": "OUTREACH_ID",
      "decision": "send_initial",
      "rationale": "High-fit physician-owned FUE practice with strong patient education and one decision-maker.",
      "fit_score": 91,
      "personalization": "The clinic explicitly asks patients to track regrowth over time.",
      "message": {
        "variant": "fue-founder-v2",
        "subject": "A simpler way to keep FUE progress consistent",
        "body": "Hi ..."
      }
    }
  ]
}
```

A `send_initial` cannot be queued after any prior outbound message for that outreach record.

For `reply`, include `source_message_id` from `pending_replies`. If that inbound message has `needs_human=1`, the server refuses to queue or send it.

### Execute the agent-selected queue

```http
POST /v1/admin/agent/send
```

Send the current run:

```json
{
  "run_id": "RUN_ID"
}
```

Or send explicit queue rows:

```json
{
  "queue_ids": ["QUEUE_ID_1", "QUEUE_ID_2"]
}
```

The endpoint sends only already-queued exact messages. It does not rank, select, rewrite, or generate copy.

### Complete the run

```http
POST /v1/admin/agent/runs/RUN_ID/complete
```

```json
{
  "strategy_summary": "Tested physician-owned FUE clinics with practice-specific first lines.",
  "next_strategy": "Keep the segment; shorten the CTA and test clinical-director contacts against founders.",
  "observations": {
    "notes": "Replies were concentrated in single-location practices."
  }
}
```

The server calculates enriched/selected/sent/replied/positive/progressed counts and stores them in the run ledger.

## Recommended daily ChatGPT Work instruction

Use a dedicated scheduled Work chat with this operating instruction:

> Operate Baldwin provider GTM for today. Open the Baldwin GTM Agent console and load the current context before doing anything. Evaluate prior runs, replies, variant performance, segment performance, referral activity, installs and paid conversion. Form one explicit targeting/message hypothesis for today. Discover roughly 50 net-new U.S. hair-restoration or hair-loss practices, deeply research about 30, and record source-backed enrichment for every prospect you keep. Deduplicate against the Baldwin context. Prefer reliable practice-owned sources and identify an appropriate decision-maker and business email when possible. Do not contact suppressed, bounced, complained, previously contacted initial prospects, or low-confidence junk records. Select only the best prospects and write each email using factual personalization derived from the research. Keep one controlled experiment at a time and label every message variant. Queue approximately 15–25 initial emails unless the evidence supports a different number, never exceeding the server ceiling. Review unhandled replies; queue straightforward replies only when the dashboard marks them agent-safe and leave needs-human replies untouched. Execute the current run queue, then complete the run with observations and a concrete hypothesis for tomorrow. Optimize for positive replies, demos/pilots, referral usage, installs and paid conversion—not opens. Never use the legacy static-priority send-batch control.

The discovery pool can be larger than the send count. That is intentional: the agent should have enough candidates to reject aggressively rather than lower the bar to hit an arbitrary send quota.

## Volume

The default Worker ceiling is 40 agent messages in a rolling 24-hour window. The daily Work instruction should normally start below that ceiling and allow the agent to increase volume only after it sees adequate data quality and acceptable bounce/complaint behavior.

Change the ceiling in `worker/wrangler.toml` only when you deliberately want a higher maximum:

```toml
AGENT_MAX_DAILY_SENDS = "40"
```

The ceiling is a safety limit, not a targeting rule. ChatGPT still decides the actual daily send count.
