# freejoey.com

An unofficial, unnecessary "Free Joey" campaign site — a Windows 3.1 /
90s-BBS-styled fan tribute to Joey Pardella from *Hackers* (1995), in the
spirit of the real "Free Kevin" movement.

## Stack

A deliberately simple, dependency-free static site:

- `index.html` (manifesto), `evidence.html` (case log), `merch.html`
  (fake store + prank donate button), `faq.html`
- `styles.css` — Windows 3.1 Program Manager chrome, no webfonts, no CDN
- `script.js` — clock, cosmetic hit counter, the donate-button gag. No
  network calls, nothing collected.
- `404.html`, `favicon.svg`
- `wrangler.jsonc` — Cloudflare Workers static-assets config, no build step

No framework, npm, backend, analytics, third-party scripts, or tracking.
The "donate" button on the merch page is pure client-side theater; it never
submits a form or contacts a server.

## Content notes

This is satire/parody of a fictional film character. Every page carries a
disclaimer that it's unaffiliated with MGM/United Artists and that no real
person is being held anywhere. Keep that disclaimer intact on any future
page you add.

## Local preview

```bash
cd ~/Documents/Projects/freejoey.com
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Deploy with Cloudflare

1. In Cloudflare dashboard: **Workers & Pages → Create application → Pages
   → Connect to Git**, and select the `freejoey.com` GitHub repo.
   - Framework preset: `None`
   - Build command: *(leave blank)*
   - Build output directory: `/`
2. Deploy. Cloudflare gives you a `*.pages.dev` preview URL.
3. In the project, add the custom domain `freejoey.com` (and `www` if
   wanted).
4. Point the domain's nameservers at Cloudflare (same as sageschiller.com —
   in your registrar, switch nameservers to the two Cloudflare provides).

No environment variables or secrets are needed; there's no backend.
