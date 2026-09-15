# Baldwin GTM consolidation patch

## Architecture after this patch

`baldwin-growth-api` / D1 `baldwin-growth` remains the canonical provider registry and growth-event store.

- Web/referral/download events write to Growth API.
- `baldwin-api` should relay authenticated app lifecycle events to `POST /v1/internal/app-event` with `x-app-event-secret`.
- The existing `attribution_subjects` first-touch logic is preserved. It can carry attribution across app events when the app supplies an installation/provider context. It does not claim to recover a provider ref from a completely vanilla fresh App Store install with no attribution context.
- Provider offer: `provider_50_two_months` (50% off the first two monthly billing periods).
- `getbaldwin.app/download` remains the provider offer/App Store handoff and keeps the newer Apple campaign-tag logic already present in this repo.

## Provider creation

The normal provider/pilot paths now synchronously provision the deterministic Apple custom offer before committing the canonical provider row. The D1 provider/outreach/event writes are then committed in one D1 batch.

Because App Store Connect is external, this is not a distributed ACID transaction. The Apple code is deterministic and the existing helper reconciles Apple's duplicate-code `409`, so retrying after a D1 failure is safe.

Paths using the atomic flow:

- Ops **Create provider**
- Outreach **Make pilot**
- Public provider pilot form

The existing manual/backfill offer endpoints remain available for already-created providers.

## Required Growth API secrets

```bash
cd worker
npx wrangler secret put ADMIN_TOKEN
npx wrangler secret put APP_EVENT_SECRET
npx wrangler secret put ASC_ISSUER_ID
npx wrangler secret put ASC_KEY_ID
npx wrangler secret put ASC_PRIVATE_KEY
npx wrangler secret put ASC_PROVIDER_OFFER_ID
```

`APP_EVENT_SECRET` must match the value configured on `baldwin-api`.

## App-event relay

The mobile API should POST app lifecycle events to:

```text
POST https://baldwin-growth-api.threeamigosholdings.workers.dev/v1/internal/app-event
x-app-event-secret: <shared secret>
```

Protected lifecycle events are:

```text
attributed_install
attributed_open
app_signup
baseline_complete
second_session
subscription_started
```

These events are rejected on the public `/v1/events` route so outside callers cannot forge paid/activation conversions.

## CSV provider/prospect import

Open `/ops/` and use **Import CSV**. The downloadable template is at:

```text
/ops/provider-import-template.csv
```

Recognized columns include:

```text
practice_name,email,website,phone,city,category,priority,source_url,source_type,notes
```

The API accepts up to 1,000 rows per import, dedupes by email first and then practice name + city, enriches existing rows, and creates new rows at stage `identified`.

## Autonomous content writer

The content Worker now checks four times per day while preserving the 46-hour publication gap. When publication is due it retries several distinct topic/content-type choices instead of silently stopping after one rejected candidate. `/__status` exposes `auto_writer`, `due`, `last_published_at`, and recent run logs. Ops displays these states.

Relevant vars in `content-worker/wrangler.toml`:

```toml
AUTO_WRITER = "true"
AUTO_CONTENT_MAX_ATTEMPTS = "4"
```

## Deploy

```bash
cd worker
npm test
npm run deploy

cd ../content-worker
npm run check
npm run deploy
```

Then deploy the static Pages projects using your existing Git/Cloudflare flow, including the updated `/ops/` assets.
