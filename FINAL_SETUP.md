# Final GTM integration setup

## OpenRouter

The reply agent uses OpenRouter with `openai/gpt-5.6-luna:floor`. If your existing `wrangler.toml` still has `OPENAI_MODEL = "gpt-5.6-luna"`, the Worker now accepts that as a backward-compatible alias and routes it through OpenRouter.

```bash
cd worker
npx wrangler secret put OPENROUTER_API_KEY
```

Paste the existing OpenRouter key. Do not commit it. The Worker calls OpenRouter's OpenAI-compatible Chat Completions endpoint with strict JSON schema output and no reasoning effort.

## IndexNow

There is no dashboard key to obtain. Generate a random 8-128 character key and store it as the content Worker secret. The included setup script does this automatically and the content Worker exposes it at `/indexnow-key.txt`, which it supplies as `keyLocation` when notifying IndexNow.

Manual equivalent:

```bash
cd content-worker
python3 - <<'PY'
import secrets
print(secrets.token_hex(16))
PY
npx wrangler secret put INDEXNOW_KEY
```

Paste the generated value into Wrangler.

## Google Search Console

`GSC_SERVICE_ACCOUNT_JSON` is the full JSON private-key file downloaded for a Google Cloud service account, not a string shown in Search Console.

1. Create/select a Google Cloud project.
2. Enable the Google Search Console API for that project.
3. IAM & Admin -> Service Accounts -> Create service account, e.g. `baldwin-search-console`.
4. Open the service account -> Keys -> Add key -> Create new key -> JSON. Save the downloaded JSON securely.
5. Open that JSON locally and copy the `client_email` value.
6. In Google Search Console, select the `trackmyhairloss.com` domain property -> Settings -> Users and permissions -> Add user. Add the service account's `client_email`. Restricted access is sufficient for Performance data; Full is also fine.
7. Store the whole JSON file in Cloudflare:

```bash
cd content-worker
npx wrangler secret put GSC_SERVICE_ACCOUNT_JSON < ~/Downloads/YOUR-SERVICE-ACCOUNT.json
```

The content Worker requests only the `webmasters.readonly` OAuth scope.

## Recommended one-command route

From repo root:

```bash
export ADMIN_TOKEN='YOUR_EXISTING_GROWTH_ADMIN_TOKEN'
export OPENROUTER_API_KEY='YOUR_EXISTING_OPENROUTER_KEY' # optional; script will prompt if omitted
export GSC_JSON_PATH="$HOME/Downloads/YOUR-SERVICE-ACCOUNT.json" # optional; script will prompt
./scripts/setup-gtm-integrations.sh
./scripts/verify-gtm-integrations.sh
```

The setup script leaves existing Resend secrets alone, generates IndexNow if absent, stores GSC credentials, stores/reuses OpenRouter, deploys the content Worker, then redeploys the growth Worker so its `CONTENT` service binding is live.
