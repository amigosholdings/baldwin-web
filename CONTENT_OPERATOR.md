# Baldwin search/content operator

The `/ops/` page can now drive the existing `trackmyhairloss-content` Worker through a Cloudflare Service Binding. No separate content SaaS or browser-exposed content admin token is required.

## What the button does

**Generate article** calls the content planner -> evidence retrieval -> writer -> editor pipeline once. Leave the brief blank to let the planner choose the strongest non-duplicate opportunity, or enter a topic/search query to steer it.

- Standard tracking/explainer pages can auto-publish when the editor verdict is `publish` and `AUTO_PUBLISH_STANDARD=true`.
- Medical/treatment pages remain drafts by default because `AUTO_PUBLISH_MEDICAL=false`.
- Medical pages require the evidence thresholds already enforced by the content Worker; insufficient evidence stops generation rather than manufacturing claims.
- Drafts can be previewed in `/ops/`. Only editor-approved drafts expose the **Publish** button.
- **Run SEO feedback** syncs Search Console when configured, proposes refresh actions, and executes the safe subset allowed by the content Worker.

## Required Cloudflare setup

### 1. Deploy the content Worker first

```bash
cd content-worker
npm install
npm run migrate       # once if content schema is not present
npm run migrate:v4    # once if SEO feedback tables are not present
npx wrangler secret put ADMIN_TOKEN
npm run deploy
```

Use the same `ADMIN_TOKEN` value as the Growth Worker. `content-worker/wrangler.toml` already contains the Workers AI binding:

```toml
[ai]
binding = "AI"
```

### 2. Recommended search feedback/indexing secrets

```bash
npx wrangler secret put INDEXNOW_KEY
npx wrangler secret put GSC_SERVICE_ACCOUNT_JSON
```

`INDEXNOW_KEY` lets the content Worker notify supported search engines after publishing. `GSC_SERVICE_ACCOUNT_JSON` powers the Search Console feedback loop. Generation itself can run without Search Console; the feedback loop cannot.

For Search Console, add the service account email from that JSON as a user on the `sc-domain:trackmyhairloss.com` property with read access.

### 3. Deploy the Growth Worker second

`worker/wrangler.toml` contains:

```toml
[[services]]
binding = "CONTENT"
service = "trackmyhairloss-content"
```

Cloudflare Service Bindings do not add an extra network hop or separate service-binding charge. Then:

```bash
cd ../worker
npm run deploy
```

Finally push/deploy `trackmyhairloss-pages/` so the new `/ops/` UI is live.

## Test

1. Open `https://trackmyhairloss.com/ops/` and load with `ADMIN_TOKEN`.
2. In **Search & content**, confirm **Content worker** and **Workers AI** are green.
3. Leave topic blank, choose **Auto-pick best topic**, and click **Generate article**.
4. The new row should appear. If it is published, use **Open**. If it is a draft, use **Preview**; editor-approved drafts also get **Publish**.
5. Configure Search Console and IndexNow, then confirm those pills turn green and test **Run SEO feedback**.

The objective remains distribution: use this to create genuinely useful pages around the tracking problem and treatment decision questions, not to manufacture a large article count.
