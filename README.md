# freejoey.com

An unofficial, unnecessary "Free Joey" campaign site — a Windows 3.1 /
90s-BBS-styled fan tribute to Joey Pardella from *Hackers* (1995), in the
spirit of the real "Free Kevin" movement.

## Stack

A deliberately simple, dependency-free static site:

- `index.html` (manifesto + petition), `evidence.html` (case log),
  `bbs.html` (interactive terminal), `merch.html` (fake store + prank
  donate button), `faq.html`
- `styles.css` — Windows 3.1 Program Manager chrome, CRT overlay, taskbar.
  No webfonts, no CDN.
- `script.js` — shared chrome: boot sequence, draggable windows, taskbar +
  Start menu, CRT toggle, starfield screen saver, petition, donate gag
- `bbs.js` — the BBS command interpreter and Web Audio modem handshake
- `404.html`, `favicon.svg`
- `wrangler.jsonc` — Cloudflare Workers static-assets config, no build step

No framework, npm, backend, analytics, third-party scripts, or tracking.

## Interactive bits

- **Boot sequence** — fake BIOS POST on the homepage, once per session
  (`sessionStorage`), skippable with any key or click
- **Draggable windows** — grab any title bar on a pointer device. Minimize
  rolls a window up; the X button is a joke. Start → "Reset window layout"
  puts everything back.
- **CRT filter** — scanlines, vignette, and flicker. Toggle in the taskbar
  or Start menu; preference persists. Respects `prefers-reduced-motion`.
- **Screen saver** — starfield after 90 seconds idle, click to dismiss
- **BBS terminal** (`bbs.html`) — a real command parser with command
  history. Try `HELP`, `DIR`, `TYPE JOEY.NFO`, `WHO`, `TRACE`, `MITNICK`.
  Undocumented: `FREE JOEY`, `HACK THE PLANET`, `GIBSON`, `ROOT`, `COOKIE`.
- **Modem dial-in** — the DIAL button synthesizes dial tone, DTMF digits,
  ring, and handshake screech with the Web Audio API. User-triggered only,
  never autoplayed.

## Privacy

Nothing on this site collects, stores, or transmits user data. There is no
backend, no form that POSTs anywhere, and no cookies at all. `localStorage`
is used for exactly three cosmetic things, all of which stay on the device:
the fake visitor counter, the CRT on/off preference, and petition handles.
The "donate" button and the store's "add to cart" buttons are pure theater
and never touch the network.

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
