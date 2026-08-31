# Circuit & Capital

An ad-supported business and technology briefing. Static HTML so you can host it anywhere (Netlify, Cloudflare Pages, GitHub Pages, a $5 VPS).

## Run locally

On the Desktop, double-click **Open Circuit and Capital.bat**, or from this folder:

```powershell
python -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080).

Search and category listings fetch `data/articles.json`, so they need HTTP — do not double-click the HTML files.

## Go live (public URL)

Double-click **Go Live - Circuit and Capital.bat** on the Desktop. It uses the Netlify CLI: sign in once in the browser, then it prints an `https://….netlify.app` address. Contact and newsletter forms are Netlify Forms (check the site’s Forms tab).

## What you have

- Home, six sections, eight sample stories, search
- Ad slots: leaderboard, sidebar, in-article, mobile sticky, native card
- About, advertise/rate card, contact, privacy, terms (AdSense-style pages)
- `ads.txt`, `robots.txt`, `sitemap.xml`
- Newsletter and contact forms (demo only — they do not send yet)

## Put your name on it

1. Replace “Circuit & Capital” copy if you want a different brand.
2. Set emails and domain in `js/config.js`.
3. Swap sample stories for your reporting. Keep pages long enough that an ad network will not treat the site as thin content.
4. Point `sitemap.xml` and `robots.txt` at your real domain.

## Turn on ads

1. Ship the site on a real domain with original articles, About, Contact, and Privacy.
2. Apply to [Google AdSense](https://www.google.com/adsense/) (or Media.net / a B2B network).
3. When you have a publisher ID, edit `js/config.js`:

```js
ads: {
  enabled: true,
  provider: "adsense",
  adsenseClient: "ca-pub-yourid",
  slots: { leaderboard: "slot-id", sidebar: "slot-id", inarticle: "slot-id", mobileSticky: "slot-id" }
}
```

4. Put the matching `data-ad-slot` values on the `.ad-slot` elements (or keep auto ads).
5. Uncomment and fill `ads.txt` at the site root — required for authorized sellers.

Direct-sold native units and the newsletter usually pay better than remnant display for a B2B audience. Keep those even after a network is live.

## Newsletter and contact

Wire `data-newsletter` and `data-contact` forms to Buttondown, Beehiiv, Mailchimp, Formspree, or Netlify Forms before launch.

## Deploy

Drag the folder onto [Netlify](https://www.netlify.com/) or [Cloudflare Pages](https://pages.cloudflare.com/), or:

```powershell
npx --yes wrangler pages deploy .
```

Add a custom domain, HTTPS, and Search Console. Submit `sitemap.xml`.
