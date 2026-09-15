# Baldwin Web v0

Monorepo for Baldwin's public growth/acquisition web stack.

## Deployable applications

| Directory | Cloudflare target | Production surface |
|---|---|---|
| `getbaldwin-pages/` | Pages project + `/download` Function | `getbaldwin.app` (product site + tracked App Store/offer handoff) |
| `trackmyhairloss-pages/` | Pages project | `trackmyhairloss.com` (tools, provider acquisition, provider kit, ops) |
| `trybaldwin-pages/` | Pages project | `trybaldwin.app` patient referral landing |
| `content-worker/` | Worker `trackmyhairloss-content` | Dynamic `/blog`, `/compare`, `/treatments`, sitemap/feed/llms routes |
| `worker/` | Worker `baldwin-growth-api` | Growth/referral/event API |

The current Google Analytics tag is `G-6FX9XXF3JK`.

## Cloudflare native Git setup

Use this same GitHub repository for all five Cloudflare applications.


### GetBaldwin Pages

Create/connect a Pages project for the product site:

- Production branch: `main`
- Root directory: `getbaldwin-pages`
- Framework preset: None
- Build command: leave blank
- Build output directory: `.`
- Custom domain: `getbaldwin.app`
- Optional env: `GROWTH_API_URL=https://baldwin-growth-api.threeamigosholdings.workers.dev`
- Env: `APP_STORE_PROVIDER_TOKEN=<App Store campaign pt token>`
- Env: `APP_STORE_PROVIDER_CAMPAIGN_TOKEN=provider_referral`
- Optional env: `APP_STORE_WEBSITE_CAMPAIGN_TOKEN=website`

The Pages Function at `/download` records the handoff server-side. Valid provider referrals with an Apple custom offer code are redirected to Apple's prefilled offer-code redemption flow; all failures fall open to the normal App Store listing.

### TrackMyHairLoss Pages

Create a new Git-connected Pages project (the old Direct Upload project cannot be converted in place):

- Production branch: `main`
- Root directory: `trackmyhairloss-pages`
- Framework preset: None
- Build command: leave blank
- Build output directory: `.`

Test its `*.pages.dev` URL, then move `trackmyhairloss.com` from the old Direct Upload project to the new Git-connected project.

### Legacy TryBaldwin Pages (optional)

The current experiment does not require this surface. If you already operate it and want to keep it deployed:

- Production branch: `main`
- Root directory: `trybaldwin-pages`
- Framework preset: None
- Build command: leave blank
- Build output directory: `.`

Test its `*.pages.dev` URL, then move `trybaldwin.app` from the old Direct Upload project to the new Git-connected project.

### Content Worker

On the existing `trackmyhairloss-content` Worker:

- Settings -> Builds -> Connect repository
- Repository: this repo
- Production branch: `main`
- Root directory: `content-worker`
- Build command: `npm install`
- Deploy command: `npx wrangler deploy`

Runtime secrets remain in Cloudflare and are not committed to Git. Existing relevant secrets include `ADMIN_TOKEN`, `INDEXNOW_KEY`, and `GSC_SERVICE_ACCOUNT_JSON` if Search Console has been connected.

The Worker uses D1 database `baldwin-growth` (`48fcce74-b672-40aa-8080-9a04021cd5b9`) and Workers AI with GLM-5.3.

### Growth Worker

On the existing `baldwin-growth-api` Worker:

- Settings -> Builds -> Connect repository
- Repository: this repo
- Production branch: `main`
- Root directory: `worker`
- Build command: `npm install`
- Deploy command: `npx wrangler deploy`

`ADMIN_TOKEN` remains stored as a Cloudflare Worker secret. The Growth Worker also has a Cloudflare Service Binding named `CONTENT` to `trackmyhairloss-content`, so `/ops/` can drive the content engine without exposing its admin endpoints directly to the browser.

For automatic provider offer-code provisioning, also store `ASC_ISSUER_ID`, `ASC_KEY_ID`, `ASC_PRIVATE_KEY`, and `ASC_PROVIDER_OFFER_ID` as Growth Worker secrets. The existing provider form / Ops promotion flow schedules provisioning asynchronously; failed provisioning never blocks provider creation and can be retried from `/ops/`.

## Distribution surfaces

- `https://getbaldwin.app/` — canonical product site; every App Store CTA routes through `/download`

- `https://trackmyhairloss.com/providers/` — provider pilot landing + lead capture
- `https://trybaldwin.app/?ref=CODE` — attributed patient referral landing
- `https://getbaldwin.app/download?...` — authoritative download/offer handoff and server-side click event
- `https://trackmyhairloss.com/provider-kit/?ref=CODE` — printable referral card/QR kit
- `https://trackmyhairloss.com/ops/` — admin-token growth dashboard, email operator, and content generator

See `TONIGHT.md` for the launch sequence.

## Database migrations

Do **not** add D1 migrations to automatic Git deployments. Run migrations manually only when the schema changes.

Growth API schema:

For an existing database upgraded from v3, run `npm run db:migrate:v4:remote` once.

```bash
cd worker
npm install
npm run db:migrate:remote
```

Content schema (only when a new migration is required):

```bash
cd content-worker
npm install
npm run migrate
npm run migrate:v4
```

## Local Git setup

```bash
git init
git branch -M main
git add .
git commit -m "Initialize Baldwin web"
```

Create/connect the GitHub repo and push:

```bash
git remote add origin git@github.com:amigosholdings/baldwin-web.git
git push -u origin main
```

After Cloudflare Git builds are connected, normal deployments are simply:

```bash
git pull --rebase
git add .
git commit -m "Describe change"
git push
```

Cloudflare handles deployment from `main`.

## Content publishing defaults

The content Worker currently keeps medical content review-gated:

- `AUTO_PUBLISH_STANDARD = true`
- `AUTO_PUBLISH_MEDICAL = false`
- `SEO_AUTOPILOT = true`
- `SEO_REFRESH_MEDICAL = false`

Do not commit runtime secrets or Google service-account JSON files.

## Growth operator

`trackmyhairloss-pages/ops/` is the internal control room for both acquisition loops. Provider email/reply setup is documented in `EMAIL_OPERATOR.md`; article generation, preview/publish, and Search Console feedback setup are documented in `CONTENT_OPERATOR.md`.

### Final integration setup

After Resend is configured, run `scripts/setup-gtm-integrations.sh` to finish IndexNow, Search Console, OpenRouter, the content Worker, and the Growth Worker. See `FINAL_SETUP.md`.
