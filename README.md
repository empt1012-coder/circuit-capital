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

The IndexNow key file `fa0dbeb168f8be4d7b78c8a611a89d05.txt` lives at the publish root (served at https://circuits.fit/fa0dbeb168f8be4d7b78c8a611a89d05.txt). After deploying new content, run:

```
./scripts/indexnow.sh            # submits every <loc> in sitemap.xml
```

It POSTs the URLs to https://api.indexnow.org/indexnow; HTTP 200 or 202 means success.
