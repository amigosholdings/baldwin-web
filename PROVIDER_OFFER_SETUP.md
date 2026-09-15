# Baldwin provider offer + getbaldwin.app consolidation

## Offer structure

Create one Apple subscription Offer Code configuration on `v1monthly_pro`:

- Reference name: `BALDWIN_PROVIDER_50_2MO`
- Mode: Pay As You Go
- Duration: 1 month
- Number of periods: 2
- US price: Apple price point closest to 50% of the standard monthly price
- Auto-renew: enabled; after period 2 the subscription returns to the normal monthly price
- Eligibility: choose the subscriber states Baldwin wants to support; for acquisition, include new subscribers

Every clinic receives a unique Apple **custom code** under this one shared offer. Apple allows up to 10 active offers per subscription SKU, but custom codes are the scalable distribution layer and can be used for large campaigns.

## One-time Growth Worker configuration

Keep App Store Connect credentials only in the Growth Worker. Do not expose them to Pages or the mobile app.

```bash
cd worker
npx wrangler secret put ASC_ISSUER_ID
npx wrangler secret put ASC_KEY_ID
npx wrangler secret put ASC_PRIVATE_KEY
npx wrangler secret put ASC_PROVIDER_OFFER_ID
```

`ASC_PRIVATE_KEY` is the App Store Connect `.p8` private key. `ASC_PROVIDER_OFFER_ID` is the App Store Connect API resource ID for the shared `BALDWIN_PROVIDER_50_2MO` offer, not its human-readable reference name.

After v4 is deployed, the existing provider onboarding paths automatically schedule custom-code provisioning in the background:

- public `/providers/` pilot form
- Ops **Create provider**
- Ops **Make pilot** promotion

Provider creation never depends on Apple being available. If provisioning fails, the provider remains usable and `/ops/` shows the error/pending state with a **Provision** retry button. Until a code is ready, the patient download bridge fails open to the normal App Store listing rather than promising an unavailable discount.

You can also retry from the CLI without storing Apple credentials locally:

```bash
ADMIN_TOKEN=... node scripts/provision-provider-offer.mjs --code new-jersey-hair-restoration-center
ADMIN_TOKEN=... node scripts/provision-provider-offer.mjs --all
```

## Attribution contract

`getbaldwin.app/download` is the authoritative server handoff.

- browser CTA: `download_click`
- server handoff to Apple: `app_store_redirect`
- validated provider offer handoff: `provider_offer_redirect`

The mobile app continues to send:

- `app_signup`
- `baseline_complete`
- `second_session`
- `subscription_started`

Include stable installation/user IDs and non-sensitive source/campaign metadata. Do not send photos, treatment data, medical notes, health history, auth tokens, receipts, names, or email addresses to the Growth API.

The Growth Worker keeps first-touch provider attribution and makes conversion events idempotent.

## App Store campaign measurement

App Store Campaigns are an independent aggregate measurement layer; they are not clinic identity.

In App Store Connect -> Baldwin -> Analytics -> Acquisition -> Campaigns, create:

- `provider_referral`
- optionally `website`

Copy the Apple `pt` provider token from the generated campaign link. On the `baldwin-getbaldwin` Worker serving `getbaldwin.app`, configure:

- `APP_STORE_PROVIDER_TOKEN` = Apple `pt`
- `APP_STORE_PROVIDER_CAMPAIGN_TOKEN` = provider-referral `ct`
- `APP_STORE_WEBSITE_CAMPAIGN_TOKEN` = website `ct` (optional)
- `GROWTH_API_URL` = optional override

Normal App Store product-page redirects receive `pt`, `ct`, and `mt=8`. Provider custom codes remain the clinic-level Apple revenue/redemption signal; Baldwin D1 remains the clinic-level web/funnel ledger. Apple publicly documents Campaign attribution for product-page campaign links, so do not treat campaign parameters on an offer-code redemption URL as a substitute for custom-code reporting.

## iOS attribution limitation

Without an attribution SDK or App Clip, a fresh App Store install does not return the clinic's custom code to Baldwin as a per-user install referrer. App Store Connect can still report clinic custom-code redemptions and provider-channel campaign results. Baldwin must not fabricate user-level install attribution from an ordinary app launch.
