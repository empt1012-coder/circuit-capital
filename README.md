# Circuit & Capital

Independent business and technology briefing at [https://circuits.fit](https://circuits.fit). Static HTML.

Circuit & Capital is a business and technology publication. It is not a fitness brand.

## Run locally

```powershell
python -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080). Search and section lists fetch `data/articles.json`, so they need HTTP.

## Config

Set emails, domain, analytics, and ads in `js/config.js`. Leave `ads.provider` as `"off"` until AdSense issues a `ca-pub-` ID. Then set `provider: "adsense"`, paste the client, fill slot IDs, and uncomment the matching line in `ads.txt`.

## Forms

Contact and newsletter are Netlify Forms on the live site. Desk: circuit50capital@circuits.fit.
