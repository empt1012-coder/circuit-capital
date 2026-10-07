# Circuit & Capital

Sourced business and technology briefing at [https://circuits.fit](https://circuits.fit). Static HTML. Written by Emilio Santos.

Circuit & Capital is a business and technology publication. It is not a fitness brand.

## Run locally

```powershell
python -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080). Search and section lists fetch `data/articles.json`, so they need HTTP.

## Config

Set emails, domain, analytics, and ads in `js/config.js`. Leave `ads.provider` as `"off"` until AdSense issues a `ca-pub-` ID. Then set `provider: "adsense"`, paste the client, fill slot IDs, and uncomment the matching line in `ads.txt`.

## Forms

Contact is a Netlify Form on the live site. The newsletter signup is off until there is more traffic. Desk: circuit50capital@circuits.fit.
