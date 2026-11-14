#!/usr/bin/env bash
# Submit URLs from sitemap.xml to IndexNow (https://www.indexnow.org/documentation).
# Usage:
#   ./scripts/indexnow.sh                         # every <loc> in sitemap.xml
#   ./scripts/indexnow.sh --changed-from OLD.xml  # new or lastmod-changed URLs only
set -euo pipefail
cd "$(dirname "$0")/.."

HOST="circuits.fit"
KEYFILE="$(ls [0-9a-f]*.txt 2>/dev/null | grep -E '^[0-9a-f]{32}\.txt$' | head -1 || true)"
if [[ -z "$KEYFILE" ]]; then
  echo "IndexNow key file (32-hex.txt) not found at site root" >&2
  exit 1
fi
KEY="$(basename "$KEYFILE" .txt)"

PREV=""
SITEMAP="sitemap.xml"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --changed-from)
      if [[ -z "${2:-}" ]]; then
        echo "IndexNow: --changed-from needs a file path" >&2
        exit 2
      fi
      PREV="$2"
      shift 2
      if [[ ! -f "$PREV" ]]; then
        echo "IndexNow: previous sitemap not found; submitting the full list" >&2
        PREV=""
      fi
      ;;
    -h|--help)
      sed -n '2,6p' "$0"
      exit 0
      ;;
    -*)
      echo "unknown option: $1" >&2
      exit 2
      ;;
    *)
      SITEMAP="$1"
      shift
      ;;
  esac
done

if [[ ! -f "$SITEMAP" ]]; then
  echo "sitemap not found: $SITEMAP" >&2
  exit 1
fi

PAYLOAD="$(mktemp)"
trap 'rm -f "$PAYLOAD"' EXIT

COUNT="$(python3 - "$HOST" "$KEY" "$SITEMAP" "$PREV" "$PAYLOAD" <<'PY'
import json, sys, xml.etree.ElementTree as ET

def urls(path):
    tree = ET.parse(path)
    out = {}
    for url in tree.getroot():
        loc = last = None
        for child in url:
            tag = child.tag.split("}")[-1]
            if tag == "loc" and child.text:
                loc = child.text.strip()
            elif tag == "lastmod" and child.text:
                last = child.text.strip()
        if loc:
            out[loc] = last
    return out

host, key, sitemap, prev, dest = sys.argv[1:6]
current = urls(sitemap)
if prev:
    old = urls(prev)
    picked = [u for u, lm in current.items() if u not in old or old.get(u) != lm]
else:
    picked = list(current.keys())

payload = {
    "host": host,
    "key": key,
    "keyLocation": f"https://{host}/{key}.txt",
    "urlList": picked,
}
with open(dest, "w", encoding="utf-8") as fh:
    json.dump(payload, fh)
print(len(picked))
PY
)"

if [[ "$COUNT" -eq 0 ]]; then
  echo "IndexNow: no new or changed URLs to submit."
  exit 0
fi

echo "Submitting $COUNT URLs to IndexNow..."
BODY="$(mktemp)"
trap 'rm -f "$PAYLOAD" "$BODY"' EXIT
CODE="$(curl -s -o "$BODY" -w '%{http_code}' -X POST https://api.indexnow.org/indexnow \
  -H 'Content-Type: application/json; charset=utf-8' --data-binary "@$PAYLOAD")"
echo "HTTP $CODE"
cat "$BODY"
echo
[[ "$CODE" == 200 || "$CODE" == 202 ]]
