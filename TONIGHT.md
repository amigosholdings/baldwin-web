# Baldwin — tonight launch runbook

This repo is designed to run the 30-day distribution experiment without adding another paid SaaS product.

## 1. Deploy the Growth Worker

```bash
cd worker
npm install
# If this D1 database already existed before this repo update, run this ONCE:
npm run db:migrate:v2:remote

# For a brand-new database, use db:migrate:remote instead.
# Then load/refresh the verified outreach list:
npm run db:seed:outreach
npm run deploy
```

Set `ADMIN_TOKEN` once if it is not already present:

```bash
npx wrangler secret put ADMIN_TOKEN
```

The verified seed loads the 100-practice outreach list into D1.

## 2. Deploy TrackMyHairLoss Pages

Cloudflare Pages root: `trackmyhairloss-pages/`.

New surfaces:

- `/providers/` — public provider-pilot landing page and lead form
- `/start/?ref=CODE` — practice-specific patient landing page
- `/provider-kit/?ref=CODE` — printable QR/referral handout generator
- `/ops/` — private-by-token operator console (noindex; requires `ADMIN_TOKEN`)

The existing free tools remain live and attribution-aware.

## 3. Confirm the four-event web flow

1. Open `/ops/`, paste `ADMIN_TOKEN`.
2. Click **Make pilot** on one practice; the referral URL is copied.
3. Open the copied `/start/?ref=...` URL in a private browser window.
4. Click **Get Baldwin**.
5. Reload `/ops/` and confirm `referral_view` and `download_click` increment for that provider.

Provider-attributed `tool_used` events work immediately on TrackMyHairLoss, so a referred patient who uses the comparator or another free tool is measurable tonight.

Downstream `app_signup`, `baseline_complete`, `second_session`, and `subscription_started` require the iOS app/backend to POST those same event names to `/v1/events` with the provider code or a linked anonymous/user id. The web repo cannot invent those app events.

## 4. Start outreach without buying another tool

Use `/ops/`:

- Work priority practices first.
- **Copy email** gives you the base message.
- Personalize the first line where you know the doctor/clinic focus.
- Send small batches from your normal business mailbox rather than blasting 100 at once.
- Immediately set `identified -> contacted`; update replies to `responded`, then `demo`, then `pilot`.
- When a practice agrees, click **Make pilot** and send/print its `/provider-kit/`.

## 5. App attribution contract

When the app learns a provider code (deep link, universal link, deferred-link bridge, or backend mapping), preserve it through signup and send:

```json
{"event":"app_signup","providerCode":"practice-code","anonymousId":"same-or-linked-id","userId":"app-user-id","source":"ios","campaign":"provider_referral"}
```

Later send `baseline_complete`, `second_session`, and `subscription_started` using the same provider code/user id. Do not send health details or photo metadata in analytics events.

## 6. Domain roles

- `trackmyhairloss.com`: search acquisition, free tools, provider acquisition, provider kit, ops.
- `trybaldwin.app`: patient-facing provider referral landing (`/?ref=CODE`).
- `getbaldwin.app`: app conversion/download destination.
- `regrowth.app`: keep parked/redirected for now. Do not split the first experiment across multiple acquisition domains.

## 7. $300 budget

Spend $0 on new software tonight. Cloudflare + the existing email list already cover the infrastructure required to test the loop.

Hold the $300 until the first 20–30 provider contacts and initial comparator traffic produce a baseline. Then spend only against the bottleneck:

- If providers reply but do not distribute: print high-quality referral cards / physically visit local practices.
- If provider outreach is weak: use the budget to acquire a fresh, tightly targeted second batch rather than buying a bulk-send platform.
- If the comparator converts to app clicks: put a small test budget behind high-intent search traffic to that tool and stop quickly if cost per qualified click is poor.

Do not spend the budget on more product features, generic SEO article generation, or a clinic dashboard.
