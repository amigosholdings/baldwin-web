#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONTENT="$ROOT/content-worker"
GROWTH="$ROOT/worker"

say(){ printf '\n==> %s\n' "$*"; }
need(){ command -v "$1" >/dev/null 2>&1 || { echo "Missing required command: $1" >&2; exit 1; }; }
need node
need npm
need python3

secret_names(){
  local dir="$1"
  (cd "$dir" && npx wrangler secret list --format json 2>/dev/null) | python3 -c 'import json,sys
try: d=json.load(sys.stdin)
except Exception: d=[]
print("\\n".join(str(x.get("name","")) for x in d if isinstance(x,dict)))'
}
has_secret(){ local dir="$1" name="$2"; secret_names "$dir" | grep -Fxq "$name"; }
put_secret_value(){ local dir="$1" name="$2" value="$3"; printf '%s' "$value" | (cd "$dir" && npx wrangler secret put "$name"); }

say "Installing Worker dependencies"
(cd "$CONTENT" && npm install)
(cd "$GROWTH" && npm install)

say "Ensuring content database schema"
(cd "$CONTENT" && npm run migrate)
(cd "$CONTENT" && npm run migrate:v4)

say "Admin token shared by both Workers"
if [[ -z "${ADMIN_TOKEN:-}" ]]; then
  read -r -s -p "Enter the SAME ADMIN_TOKEN used by baldwin-growth-api: " ADMIN_TOKEN
  printf '\n'
fi
[[ -n "$ADMIN_TOKEN" ]] || { echo "ADMIN_TOKEN cannot be blank" >&2; exit 1; }
put_secret_value "$CONTENT" ADMIN_TOKEN "$ADMIN_TOKEN"

say "IndexNow"
if has_secret "$CONTENT" INDEXNOW_KEY; then
  echo "INDEXNOW_KEY already exists; leaving it unchanged."
else
  INDEXNOW_KEY="$(python3 - <<'PY'
import secrets
print(secrets.token_hex(16))
PY
)"
  put_secret_value "$CONTENT" INDEXNOW_KEY "$INDEXNOW_KEY"
  echo "Generated and stored a 32-character IndexNow key."
fi

say "Google Search Console"
if has_secret "$CONTENT" GSC_SERVICE_ACCOUNT_JSON; then
  echo "GSC_SERVICE_ACCOUNT_JSON already exists; leaving it unchanged."
else
  GSC_JSON_PATH="${GSC_JSON_PATH:-}"
  if [[ -z "$GSC_JSON_PATH" ]]; then
    read -r -p "Path to downloaded Google service-account JSON (or press Enter to skip for now): " GSC_JSON_PATH
  fi
  if [[ -n "$GSC_JSON_PATH" ]]; then
    GSC_JSON_PATH="${GSC_JSON_PATH/#\~/$HOME}"
    [[ -f "$GSC_JSON_PATH" ]] || { echo "File not found: $GSC_JSON_PATH" >&2; exit 1; }
    CLIENT_EMAIL="$(python3 - "$GSC_JSON_PATH" <<'PY'
import json,sys
with open(sys.argv[1]) as f: d=json.load(f)
if d.get('type')!='service_account' or not d.get('client_email') or not d.get('private_key'):
    raise SystemExit('Not a valid Google service-account JSON file')
print(d['client_email'])
PY
)"
    (cd "$CONTENT" && npx wrangler secret put GSC_SERVICE_ACCOUNT_JSON < "$GSC_JSON_PATH")
    echo "Stored GSC credentials for: $CLIENT_EMAIL"
    echo "NEXT: add that exact email in Search Console -> trackmyhairloss.com -> Settings -> Users and permissions. Restricted is sufficient for Performance data; Full is also fine."
  else
    echo "Skipped Search Console. Article generation still works; SEO feedback remains disabled until configured."
  fi
fi

say "OpenRouter reply agent"
if has_secret "$GROWTH" OPENROUTER_API_KEY; then
  echo "OPENROUTER_API_KEY already configured."
else
  if [[ -n "${OPENROUTER_API_KEY:-}" ]]; then
    put_secret_value "$GROWTH" OPENROUTER_API_KEY "$OPENROUTER_API_KEY"
    echo "Reused OPENROUTER_API_KEY from your shell."
  else
    read -r -s -p "Paste your existing OpenRouter API key (or press Enter to skip): " OPENROUTER_API_KEY
    printf '\n'
    if [[ -n "$OPENROUTER_API_KEY" ]]; then
      put_secret_value "$GROWTH" OPENROUTER_API_KEY "$OPENROUTER_API_KEY"
      echo "OPENROUTER_API_KEY configured."
    else
      echo "Skipped. Reply classification falls back to heuristics until configured."
    fi
  fi
fi

say "Resend secret check"
for s in RESEND_API_KEY RESEND_WEBHOOK_SECRET; do
  if has_secret "$GROWTH" "$s"; then echo "$s configured."; else echo "$s MISSING."; fi
done

say "Deploying content Worker"
(cd "$CONTENT" && npm run deploy)

say "Deploying growth Worker"
(cd "$GROWTH" && npm run deploy)

say "Done"
echo "Run: ./scripts/verify-gtm-integrations.sh"
