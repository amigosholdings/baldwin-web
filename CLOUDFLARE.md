# Cloudflare application roots

- Worker / GetBaldwin: `getbaldwin-pages` (`baldwin-getbaldwin`)
- Pages / TrackMyHairLoss: `trackmyhairloss-pages`
- Pages / TryBaldwin: `trybaldwin-pages`
- Worker / Content: `content-worker`
- Worker / Growth API: `worker`

Both Workers bind the existing D1 database named `baldwin-growth`.

## GetBaldwin Worker variables

Configure these on the `baldwin-getbaldwin` Worker serving `getbaldwin.app`:

- `APP_STORE_PROVIDER_TOKEN` — App Store Connect `pt` token
- `APP_STORE_PROVIDER_CAMPAIGN_TOKEN` — `ct` for provider referrals
- `APP_STORE_WEBSITE_CAMPAIGN_TOKEN` — optional `ct` for direct website acquisition
- `GROWTH_API_URL` — optional override for the Baldwin Growth API

The `/download` Worker route fails open to the normal App Store listing if provider lookup/Growth API is unavailable. Static assets are restricted to `getbaldwin-pages/public` by `wrangler.jsonc`.

## Growth Worker provider-offer secrets

Configure these as Worker secrets on `baldwin-growth-api`:

- `ASC_ISSUER_ID`
- `ASC_KEY_ID`
- `ASC_PRIVATE_KEY`
- `ASC_PROVIDER_OFFER_ID`

These let the existing provider onboarding flow provision clinic-specific Apple custom codes asynchronously. They must never be committed or exposed to web/mobile clients.
