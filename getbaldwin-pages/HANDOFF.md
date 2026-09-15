# getbaldwin.app handoff

This directory is the deployable Cloudflare Pages project for `getbaldwin.app`.

## What it owns

- The public Baldwin marketing homepage.
- Browser-side acquisition events via `assets/growth.js`.
- `/download` as a Pages Function (`functions/download.js`).
- Provider lookup before the App Store handoff.
- Provider custom-offer redemption when the Growth API reports an Apple offer code.
- App Store Campaign `pt` / `ct` tagging when configured.

It does **not** own provider records, attribution state, or Apple offer provisioning. Those remain in the Growth Worker under `../worker` and the shared `baldwin-growth` D1 database.

## Runtime contract

`functions/download.js` calls:

- `GET {GROWTH_API_URL}/v1/providers/:providerCode`
- `POST {GROWTH_API_URL}/v1/events`

The provider response may contain `appleOfferCode` and `offerVariant`. If a valid active provider has an Apple offer code, `/download` redirects to Apple's prefilled offer-code redemption URL. Otherwise it fails open to Baldwin's normal App Store listing.

Tracked web/handoff events include `landing_view`, `download_click`, `app_store_redirect`, and `provider_offer_redirect`. Later app events (`app_signup`, `baseline_complete`, `second_session`, `subscription_started`) are sent by the app/backend, not this Pages project.

## Required Pages variables

Set these for Production (and preferably Preview):

- `GROWTH_API_URL=https://baldwin-growth-api.threeamigosholdings.workers.dev`
- `APP_STORE_PROVIDER_TOKEN=<Apple provider token / pt>`
- `APP_STORE_PROVIDER_CAMPAIGN_TOKEN=provider_referral`
- `APP_STORE_WEBSITE_CAMPAIGN_TOKEN=website`

If the Apple campaign variables are absent or invalid, downloads still work; the `pt`/`ct` tags are simply omitted.

## Local verification

From the repository root:

```bash
cd worker && npm test
cd ../getbaldwin-pages && npm test
```

To exercise Pages Functions locally:

```bash
npx wrangler@latest pages dev getbaldwin-pages
```

## Cloudflare Pages Git deployment

Create/select a Pages project connected to this monorepo with:

- Production branch: `main`
- Root directory: `getbaldwin-pages`
- Framework preset: None
- Build command: `exit 0`
- Build output directory: `.`

Then configure the four variables above and attach `getbaldwin.app` under Custom domains.

Because this project contains a `functions/` directory, deploy through Git integration or Wrangler; do not use a static-only dashboard upload.

## CLI deployment

If the Pages project already exists:

```bash
npx wrangler@latest pages deploy getbaldwin-pages --project-name <YOUR_PAGES_PROJECT_NAME> --branch main
```

Configure production variables in the Cloudflare dashboard before relying on provider offers/campaign tags.

## Provider offer dependency

The Growth Worker requires these encrypted secrets to provision provider-specific custom codes under the shared Apple offer:

- `ASC_ISSUER_ID`
- `ASC_KEY_ID`
- `ASC_PRIVATE_KEY`
- `ASC_PROVIDER_OFFER_ID`

The shared App Store Connect offer is `BALDWIN_PROVIDER_50_2MO`: Pay As You Go, one-month duration, two periods, approximately 50% of the normal monthly price, then normal renewal.

Provider onboarding remains non-blocking. If Apple provisioning fails, the clinic remains usable and `/download` falls back to the ordinary App Store listing until the offer is ready.
