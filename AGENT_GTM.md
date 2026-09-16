# Baldwin ChatGPT GTM Autopilot

ChatGPT is the GTM decision-maker; Cloudflare is the deterministic state and execution layer.

## Security model

The production Worker entrypoint is `worker/src/secureIndex.js`.

- `/v1/admin/agent/*` **does not accept `ADMIN_TOKEN` directly**.
- A scoped, expiring GTM capability is required in `x-agent-token`.
- The capability is HMAC-signed server-side using the existing `ADMIN_TOKEN`, but possession of the capability does not reveal or grant the master admin credential.
- Maximum capability lifetime is 90 days; the console requests 30 days.
- The browser stores only the restricted GTM capability. The master admin token is used once to mint the capability and is immediately cleared.
- Agent routes remain subject to suppression, bounce/complaint state, duplicate-initial protection, `needs_human` reply blocking, idempotency and the rolling send ceiling.
- The `/ops-agent/` page is served with no-store/noindex, frame denial, Permissions-Policy and a strict CSP that permits scripts/styles only from the same origin and API calls only to the Baldwin Growth Worker.
- Agent tables self-initialize through idempotent `CREATE TABLE IF NOT EXISTS` statements on the first authenticated agent request. Migration v5 remains available for explicit database administration, but it is no longer required before first use.

The legacy `/v1/admin/outreach/send-batch` route exists only for backwards compatibility. The ChatGPT agent must not use it because it selects recipients using static priority rules.

## One-time browser bootstrap

Open:

```text
https://trackmyhairloss.com/ops-agent/
```

If no valid agent capability is stored, the page asks for `ADMIN_TOKEN` once. It calls:

```http
POST /v1/admin/agent-token
x-admin-token: <ADMIN_TOKEN>
Content-Type: application/json

{"ttl_hours":720}
```

The response contains a restricted token with scope `gtm_agent_only`. The console clears the admin field and persists only the restricted token.

All subsequent agent requests use:

```http
x-agent-token: <scoped capability>
```

A 401 clears the expired/invalid agent session from the console.

## Decision boundary

ChatGPT decides:

- which clinics to discover and research
- what evidence to collect
- which clinics qualify and why
- exact outbound subject/body and experiment variant
- whether to send, hold, reject, follow up or safely reply
- how the next run should change based on downstream outcomes

The Growth Worker only:

- stores research, decisions and run state
- deduplicates providers
- enforces suppression / bounce / complaint state
- blocks duplicate initial sends
- blocks replies marked `needs_human`
- enforces `AGENT_MAX_DAILY_SENDS` (default 40 rolling 24h)
- sends exact copy already chosen by ChatGPT
- records outcomes for later agent analysis

## Agent API

All routes below require `x-agent-token`.

### Context

```http
GET /v1/admin/agent/context
```

Returns recent runs, prospect research, pending replies, exact-copy queue, referral/app funnel data, 30-day performance by message variant and provider segment, sender readiness, audit events and guardrails.

### Start run

```http
POST /v1/admin/agent/runs
```

Example:

```json
{
  "agent_name": "ChatGPT GTM",
  "hypothesis": "Physician-owned FUE practices with strong patient education may activate better than broad medspas.",
  "target_discovery": 50,
  "target_research": 30,
  "target_send": 20,
  "strategy": {"objective":"provider activation and referred paid users"},
  "experiment": {"rule":"change one meaningful variable at a time"}
}
```

### Store prospect research

```http
POST /v1/admin/agent/prospects
```

```json
{
  "run_id": "RUN_ID",
  "prospects": [
    {
      "practice_name": "Example Hair Clinic",
      "website": "https://example.com",
      "email": "office@example.com",
      "city": "New York",
      "state": "NY",
      "category": "FUE / hair restoration",
      "contact_name": "Dr. Example",
      "contact_role": "Founder",
      "fit_score": 88,
      "email_confidence": "high",
      "source_url": "https://example.com/team",
      "research": {"procedures":["FUE"],"locations":1}
    }
  ]
}
```

### Record decisions and exact copy

```http
POST /v1/admin/agent/decisions
```

Supported decisions are `send_initial`, `follow_up`, `reply`, `hold`, and `reject`. Sending decisions must include exact subject/body. Reply decisions must reference the inbound source message and are rejected if that message is marked `needs_human`.

```json
{
  "run_id": "RUN_ID",
  "decisions": [
    {
      "outreach_id": "OUTREACH_ID",
      "decision": "send_initial",
      "rationale": "High-fit physician-owned practice",
      "fit_score": 88,
      "message": {
        "variant": "fue-founder-v2",
        "subject": "A simpler follow-up for FUE patients",
        "body": "Hi …"
      }
    }
  ]
}
```

### Execute queued messages

```http
POST /v1/admin/agent/send
```

```json
{"run_id":"RUN_ID"}
```

Before every send the Worker rechecks suppression, duplicate initial status, reply safety, idempotency and the rolling 24-hour ceiling.

### Complete run

```http
POST /v1/admin/agent/runs/RUN_ID/complete
```

```json
{
  "strategy_summary":"What this run tested",
  "next_strategy":"What the next run should change or preserve",
  "observations":{"notes":"Outcome notes"}
}
```

## Sender isolation

Provider outreach currently sends as:

```text
Sean from Baldwin <sean@trybaldwin.app>
```

and uses `trybaldwin.app` for replies, keeping prospecting traffic separate from the main `getbaldwin.app` product domain. Maintain SPF, DKIM and DMARC for the sending domain in Resend.

## Scheduled ChatGPT Work instruction

Use the `/ops-agent/` control room or the agent API to perform one GTM run. Review cumulative and recent performance first; discover a broad candidate pool; verify each clinic from reliable public sources; enrich only evidence-backed fields; reject duplicates, weak fits, suppressed contacts and uncertain emails; select only qualified practices; write factual individualized outreach; queue exact decisions; execute only the queued messages; triage ordinary replies; never autonomously answer clinical, legal, privacy, security, contract or pricing-negotiation questions; optimize on positive replies, pilots, referral usage, app activation and paid conversion rather than opens; and record the run hypothesis, results and next strategy.
