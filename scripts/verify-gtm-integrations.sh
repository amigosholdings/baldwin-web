#!/usr/bin/env bash
set -euo pipefail

GROWTH_URL="${GROWTH_URL:-https://baldwin-growth-api.threeamigosholdings.workers.dev}"
if [[ -z "${ADMIN_TOKEN:-}" ]]; then
  read -r -s -p "ADMIN_TOKEN: " ADMIN_TOKEN
  printf '\n'
fi

printf '\n==> Growth health\n'
curl -fsS "$GROWTH_URL/health"; printf '\n'

printf '\n==> Email/reply-agent configuration\n'
curl -fsS -H "x-admin-token: $ADMIN_TOKEN" "$GROWTH_URL/v1/admin/dashboard" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(json.dumps(d.get("email_config",{}), indent=2))'

printf '\n==> Reply-agent smoke test\n'
curl -fsS -H "x-admin-token: $ADMIN_TOKEN" -H 'content-type: application/json' \
  -d '{"text":"Sounds interesting. Can we schedule a quick call next week?"}' \
  "$GROWTH_URL/v1/admin/email/test-agent" | python3 -m json.tool

printf '\n==> Content configuration through service binding\n'
curl -fsS -H "x-admin-token: $ADMIN_TOKEN" "$GROWTH_URL/v1/admin/content/status" | python3 -c 'import json,sys; d=json.load(sys.stdin); keep=["ok","model","workers_ai_configured","indexnow_configured","gsc_configured","seo_autopilot","auto_publish_standard","auto_publish_medical"]; print(json.dumps({k:d.get(k) for k in keep}, indent=2))'

printf '\n==> Public IndexNow verification endpoint\n'
HTTP="$(curl -sS -o /tmp/baldwin-indexnow-key.txt -w '%{http_code}' https://trackmyhairloss.com/indexnow-key.txt || true)"
echo "HTTP $HTTP"
if [[ "$HTTP" == "200" ]]; then
  LEN="$(wc -c < /tmp/baldwin-indexnow-key.txt | tr -d ' ')"
  echo "Key endpoint is public ($LEN bytes)."
else
  echo "IndexNow key endpoint is not live yet. Deploy content Worker/routes first."
fi

printf '\n==> Manual final checks\n'
echo "1) Add the service-account client_email to Search Console if not already done."
echo "2) Submit https://trackmyhairloss.com/sitemap.xml in Search Console once."
echo "3) Open https://trackmyhairloss.com/ops/ and verify all desired status pills are green."
echo "4) Send a Resend test to yourself, reply to it, and confirm the reply appears in /ops/."
echo "5) Generate one standard article from /ops/, preview it, and verify its Baldwin CTA."
