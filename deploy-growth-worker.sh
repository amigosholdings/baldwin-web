#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/worker"
npm install
if [[ "${BALDWIN_EXISTING_DB:-1}" == "1" ]]; then
  echo "Existing D1 assumed. Running migration-v2 once; set BALDWIN_EXISTING_DB=0 for a fresh database."
  npm run db:migrate:v2:remote
else
  npm run db:migrate:remote
fi
npm run db:seed:outreach
npm run deploy
echo "Growth Worker deployed. Push this repo to main to deploy the Git-connected Pages project."
