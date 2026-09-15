# Baldwin — tonight launch runbook

This repo is designed to run the 30-day distribution experiment without adding another paid SaaS product.

## 1. Deploy the Growth Worker

```bash
cd worker
npm install
# If this D1 database already existed before this repo update, run this ONCE:
npm run db:migrate:v2:remote
# If v3 is already live, apply the new attribution/offer schema once:
npm run db:migrate:v4:remote

# For a brand-new database, use db:migrate:remote instead.
# Then load/refresh the verified outreach list:
npm run db:seed:outreach
npm run deploy
```

Set the Growth Worker secrets once if they are not already present:

```bash
npx wrangler secret put ADMIN_TOKEN
npx wrangler secret put ASC_ISSUER_ID
npx wrangler secret put ASC_KEY_ID
npx wrangler secret put ASC_PRIVATE_KEY
npx wrangler secret put ASC_PROVIDER_OFFER_ID
```

The App Store Connect secrets are used only to provision clinic custom offer codes. Provider creation still succeeds if they are missing or Apple is temporarily unavailable; `/ops/` will show offer status and allow retry.

The verified seed loads the 100-practice outreach list into D1.

## 2. Deploy TrackMyHairLoss Pages

Cloudflare Pages root: `trackmyhairloss-pages/`.

New surfaces:

- `/providers/` — public provider-pilot landing page and lead form
- `https://trybaldwin.app/?ref=CODE` — practice-specific patient landing page (separate Pages root in this repo)
- `/provider-kit/?ref=CODE` — printable QR/referral handout generator
- `/ops/` — private-by-token operator console (noindex; requires `ADMIN_TOKEN`)

The existing free tools remain live and attribution-aware.

## 3. Deploy GetBaldwin Pages

Cloudflare Pages root: `getbaldwin-pages/`. Move the existing `getbaldwin.app` custom domain to this Git-connected project after validating its `*.pages.dev` deployment. The `/download` Pages Function records the server-side handoff and redirects valid provider referrals to Apple offer-code redemption.

Before moving the custom domain, configure these Pages variables:

- `APP_STORE_PROVIDER_TOKEN` — the `pt` value from any Baldwin App Store Connect campaign link
- `APP_STORE_PROVIDER_CAMPAIGN_TOKEN` — the `ct` value from the provider-referral campaign
- `APP_STORE_WEBSITE_CAMPAIGN_TOKEN` — optional `ct` value for direct website downloads

Use one App Store campaign for the provider channel rather than one per clinic. D1 + each clinic's unique custom offer code remain the clinic-level attribution layers.

## 4. Confirm the web-to-app flow

1. Open `/ops/`, paste `ADMIN_TOKEN`.
2. Click **Make pilot** on one practice; the referral URL is copied.
3. Open the copied `https://trybaldwin.app/?ref=...` URL in a private browser window.
4. Click **Get Baldwin**.
5. Reload `/ops/` and confirm `referral_view`, `download_click`, and `app_store_redirect` increment for that provider. If its Apple code is ready, `provider_offer_redirect` should also increment.

Provider-attributed `tool_used` events work immediately on TrackMyHairLoss, so a referred patient who uses the comparator or another free tool is measurable tonight.

Downstream `app_signup`, `baseline_complete`, `second_session`, and `subscription_started` require the iOS app/backend to POST those same event names to `/v1/events` with the provider code or a linked anonymous/user id. The web repo cannot invent those app events.

## 5. Start outreach without buying another tool

Use `/ops/`:

- Work priority practices first.
- **Copy email** gives you the base message.
- Personalize the first line where you know the doctor/clinic focus.
- Send small batches from your normal business mailbox rather than blasting 100 at once.
- Immediately set `identified -> contacted`; update replies to `responded`, then `demo`, then `pilot`.
- When a practice agrees, click **Make pilot** and send/print its `/provider-kit/`.

## 6. App attribution contract

When the app learns a provider code (deep link, universal link, deferred-link bridge, or backend mapping), preserve it through signup and send:

```json
{"event":"app_signup","providerCode":"practice-code","anonymousId":"same-or-linked-id","userId":"app-user-id","source":"ios","campaign":"provider_referral"}
```

Later send `baseline_complete`, `second_session`, and `subscription_started` using the same user id and installation id. The Growth Worker preserves the original provider association from signup rather than trusting later provider parameters. Do not send health details or photo metadata in analytics events.

## 7. Domain roles

- `trackmyhairloss.com`: search acquisition, free tools, provider acquisition, provider kit, ops.
- `trybaldwin.app`: patient-facing provider referral landing (`/?ref=CODE`).
- `getbaldwin.app`: app conversion/download destination.
- `regrowth.app`: keep parked/redirected for now. Do not split the first experiment across multiple acquisition domains.

## 8. $300 budget

Spend $0 on new software tonight. Cloudflare + the existing email list already cover the infrastructure required to test the loop.

Hold the $300 until the first 20–30 provider contacts and initial comparator traffic produce a baseline. Then spend only against the bottleneck:

- If providers reply but do not distribute: print high-quality referral cards / physically visit local practices.
- If provider outreach is weak: use the budget to acquire a fresh, tightly targeted second batch rather than buying a bulk-send platform.
- If the comparator converts to app clicks: put a small test budget behind high-intent search traffic to that tool and stop quickly if cost per qualified click is poor.

Do not spend the budget on more product features or bulk commodity SEO. Use the on-demand content generator only for genuinely useful pages that support the search loop.

## Email operator / reply agent

After the existing growth database is live, run the v3 email migration and configure Resend + the reply agent before sending outreach:

```bash
cd worker
npm run db:migrate:v3:remote
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put RESEND_WEBHOOK_SECRET
npx wrangler secret put OPENROUTER_API_KEY
npm run deploy
```

Set `REPLY_DOMAIN` in `worker/wrangler.toml` first. Full setup and test instructions are in `EMAIL_OPERATOR.md`. The `/ops/` page can send one prospect, send the next 5/10 P1 prospects, receive/classify replies, and approve agent-drafted responses.


## Search/content operator

Deploy `trackmyhairloss-content` before redeploying the Growth Worker, because the Growth Worker now binds to it as the `CONTENT` service. Run the content D1 migrations if needed and set the same `ADMIN_TOKEN` secret on the content Worker. Then `/ops/` can generate one page on demand, preview drafts, publish editor-approved drafts, and run the Search Console feedback loop. See `CONTENT_OPERATOR.md`.
