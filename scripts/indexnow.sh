#!/usr/bin/env bash
# Submit all URLs in sitemap.xml to IndexNow.
set -euo pipefail
cd "$(dirname "$0")/.."
HOST="circuits.fit"
KEY="$(basename "$(ls [0-9a-f]*.txt | grep -E '^[0-9a-f]{32}\.txt$' | head -1)" .txt)"
SITEMAP="${1:-sitemap.xml}"
URLS=$(grep -o '<loc>[^<]*</loc>' "$SITEMAP" | sed 's#</\?loc>##g')
COUNT=$(echo "$URLS" | grep -c .)
JSON=$(printf '%s\n' "$URLS" | python3 -c 'import sys,json;u=[l.strip() for l in sys.stdin if l.strip()];print(json.dumps({"host":sys.argv[1],"key":sys.argv[2],"keyLocation":f"https://{sys.argv[1]}/{sys.argv[2]}.txt","urlList":u}))' "$HOST" "$KEY")
echo "Submitting $COUNT URLs to IndexNow..."
CODE=$(curl -s -o /dev/stderr -w '%{http_code}' -X POST https://api.indexnow.org/indexnow -H 'Content-Type: application/json; charset=utf-8' -d "$JSON")
echo "HTTP $CODE"
[[ "$CODE" == 200 || "$CODE" == 202 ]]
