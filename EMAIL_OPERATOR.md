# Baldwin email operator

The Growth Ops page now sends provider outreach and turns inbound replies into an approval queue.

## What it does

- Sends one prospect at a time or the next 5/10 unsent Priority 1 prospects.
- Prevents accidental duplicate initial sends.
- Tracks sent/delivered/opened/clicked/bounced/complained/suppressed states when Resend webhooks are enabled.
- Gives every outreach thread a tagged reply address so an inbound reply can be matched back to the correct D1 prospect.
- On `email.received`, retrieves the full email from Resend, classifies it, updates the outreach stage, and drafts a reply.
- Replies are never auto-sent. `/ops/` shows the draft for review/editing and an **Approve & send** button.
- Explicit rejections/unsubscribes and bounce/complaint/suppression events set `do_not_contact=1`.
- If no OpenAI key is configured, a deterministic fallback classifier/drafter still works.

## 1. Migrate D1

From `worker/`:

```bash
npm run db:migrate:v3:remote
```

Run this once. It adds email state to `outreach` plus `email_messages` and webhook idempotency tables.

## 2. Configure Resend sending

Create a Resend account and verify `trybaldwin.app` as a sending domain. The Worker defaults to:

```toml
OUTREACH_FROM = "Shaun from Baldwin <shaun@trybaldwin.app>"
```

Change that in `worker/wrangler.toml` if you want another sender.

Add the API key as a Worker secret:

```bash
npx wrangler secret put RESEND_API_KEY
```

Do not send the provider batch until the sending domain shows as verified in Resend.

## 3. Configure inbound replies

Fastest test: use the Resend-provided receiving domain shown in **Receiving Emails**, which looks like `<id>.resend.app`. Put only the domain portion in `worker/wrangler.toml`:

```toml
REPLY_DOMAIN = "<id>.resend.app"
```

The Worker will generate addresses such as:

```text
reply+OUTREACH_ID@<id>.resend.app
```

Later you can use a branded receiving subdomain such as `reply.trybaldwin.app` after adding the MX record Resend gives you. Using a subdomain avoids changing mail routing for the root domain.

In Resend, create a webhook pointed at:

```text
https://baldwin-growth-api.threeamigosholdings.workers.dev/v1/webhooks/resend
```

Subscribe at minimum to `email.received`. For delivery state in `/ops/`, also enable the email delivery events you care about (sent/delivered/opened/clicked/bounced/complained/failed/suppressed).

Copy the webhook signing secret and add it to the Worker:

```bash
npx wrangler secret put RESEND_WEBHOOK_SECRET
```

The Worker validates the Svix signature, rejects stale webhook timestamps, and deduplicates webhook deliveries by `svix-id`.

## 4. Configure the response agent

Reuse your existing OpenRouter API key:

```bash
npx wrangler secret put OPENROUTER_API_KEY
```

The default model is set in `wrangler.toml`:

```toml
OPENROUTER_MODEL = "openai/gpt-5.6-luna:floor"
# Existing OPENAI_MODEL = "gpt-5.6-luna" also works as a backward-compatible fallback.
```

The agent only classifies and drafts. It does not auto-send. Replies involving substantive medical, legal, privacy, security, contract, pricing-negotiation, or other questions outside the known Baldwin pitch are marked `needs_human` rather than guessed at.

## 5. Deploy

```bash
npm run deploy
```

Then open:

```text
https://trackmyhairloss.com/ops/
```

If the Pages project is Git-connected, push the repo so the updated `/ops/` frontend deploys too.

## 6. Test before real outreach

In `/ops/`:

1. Load the dashboard with `ADMIN_TOKEN`.
2. Confirm the four connection pills are green: Resend, inbound webhook, reply agent, reply domain.
3. Click **Send test** and send to an address you control.
4. Click **Test agent** and use a sample reply.
5. Reply to the test thread only after you have tested a real provider-thread address; the generic send test intentionally does not create an outreach record.
6. Send one real Priority 1 prospect first. Reply handling for a real outreach email can then be tested end-to-end because that send has a tagged Reply-To address.
7. Only after that works use **Send next 5 P1**.

## Sending policy built into the operator

The batch endpoint is capped at 10 per click. It selects only `identified`, unsent, non-suppressed prospects and marks them `contacted` only after Resend accepts the message. The initial 100-contact list remains in D1; the operator is intended to learn from the first Priority 1 batch before broadening the message.
