# Circuit & Capital

Sourced business and technology briefing at [https://circuits.fit](https://circuits.fit). Static HTML. Edited by Emilio Santos.

Circuit & Capital is a business and technology publication. It is not a fitness brand.

## Run locally

```powershell
python -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080). Search and section lists fetch `data/articles.json`, so they need HTTP.

## Config

Set emails, domain, analytics, and ads in `js/config.js`. Leave `ads.provider` as `"off"` until AdSense issues a `ca-pub-` ID. Then set `provider: "adsense"`, paste the client, fill slot IDs, and uncomment the matching line in `ads.txt`.

## Forms

Contact is a Netlify Form on the live site. The newsletter signup is off until there is more traffic. Desk: circuits50capital@circuits.fit.

## IndexNow

The IndexNow key file `fa0dbeb168f8be4d7b78c8a611a89d05.txt` lives at the publish root (served at https://circuits.fit/fa0dbeb168f8be4d7b78c8a611a89d05.txt). A Netlify build plugin pings https://api.indexnow.org/indexnow after a successful deploy, submitting new or lastmod-changed URLs from `sitemap.xml`. If the previous sitemap cannot be fetched, it submits the full list. A failed ping does not fail the deploy.

To submit the full list yourself after a deploy:

```
./scripts/indexnow.sh            # submits every <loc> in sitemap.xml
```

HTTP 200 or 202 means success.

## RSS full content

Netlify runs `python3 scripts/feed-content.py` on every deploy so each `feed.xml` item gets a full `<content:encoded>` body. After adding an item to `feed.xml`, you can also run the script locally (idempotent; needs beautifulsoup4):

```
python3 -m pip install -r requirements-feed.txt
python3 scripts/feed-content.py
```

Tool pages get the heading, dek and explanation, not the interactive form.
