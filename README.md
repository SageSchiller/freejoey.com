# freejoey.com

An unofficial, unnecessary "Free Joey" campaign site: a Windows 3.1 /
90s-BBS-styled fan tribute to Joey Pardella from *Hackers* (1995).

## Stack

A deliberately simple, dependency-free static site:

- `index.html` (manifesto + petition), `evidence.html` (case log),
  `bbs.html` (interactive terminal), `merch.html` (fake store + prank
  donate button), `faq.html`
- `styles.css`: Windows 3.1 Program Manager chrome, CRT overlay, taskbar.
  No webfonts, no CDN.
- `script.js`: shared chrome. Boot sequence, draggable windows, taskbar +
  Start menu, CRT toggle, starfield screen saver, petition, donate gag.
- `bbs.js`: the BBS command interpreter and Web Audio modem handshake
- `404.html`, `favicon.svg`
- `wrangler.jsonc`: Cloudflare Workers static-assets config, no build step

No framework, npm, backend, analytics, third-party scripts, or tracking.

## Interactive bits

- **Boot sequence**: fake BIOS POST on the homepage, once per session
  (`sessionStorage`), skippable with any key or click
- **Shutdown sequence**: Start > Shut Down puts up a Win 3.1 confirm
  dialog, then runs the boot sequence in reverse and lands on the amber
  "It's now safe to turn off your computer." Clicking or pressing a key
  mid-sequence skips to the end; doing it on the final screen powers the
  machine back on and replays the POST, so the whole thing is a real
  cycle. Available on every page, since the taskbar is. `SOLIDARITY.DRV`
  declines to terminate, mirroring `NUANCE.SYS` failing to load on boot;
  keep those two paired if you edit either list.

The restart deliberately does not call `location.reload()`. It swaps the
shutdown overlay for a boot screen and replays the POST in place, so the
black never breaks and there is no white reload flash. `makeBootScreen()`
builds the screen on demand, which is why the cycle works on pages that
have no inline `#boot` (only `index.html` ships one, so its first paint is
already black). `playBoot()` is shared by both entry points, and
`restartMachine()` bails early if a boot screen already exists so repeated
clicks cannot stack two.
- **Draggable windows**: grab any title bar on a pointer device. Minimize
  rolls a window up; the X button is a joke. Start > "Reset window layout"
  puts everything back.
- **CRT filter**: scanlines, vignette, and flicker. Toggle in the taskbar
  or Start menu; preference persists. Respects `prefers-reduced-motion`.
- **Screen saver**: starfield after 90 seconds idle, click to dismiss
- **Pull-down menus**: the menu bars are real Windows 3.1 style menus.
  Click to open, hover to slide between them, Escape or an outside click
  closes. Definitions live in `MENU_DEFS` in `script.js`, keyed by the
  `data-menu` attribute on each `.menu-bar > span`. Most items are jokes;
  Open Case File, Refresh, and Select All actually do the thing.
- **Working cart** (`merch.html`): add and remove items, live quantity
  badge in the menu bar, running subtotal with 8.25% tax, persisted in
  `localStorage`. Checkout runs a dial-up order sequence that fails on the
  grounds that no payment processor exists and neither does the store. The
  cart survives checkout on purpose. Stacking the same item to 5, 13, or
  31 gets you something.
- **BBS terminal** (`bbs.html`): a real command parser with command
  history. Try `HELP`, `DIR`, `TYPE JOEY.NFO`, `WHO`, `TRACE`.
  Undocumented so far: `FREE JOEY`, `HACK THE PLANET`, `GIBSON`, `ROOT`,
  `SUDO`, `COOKIE`, `POOL`, `GARBAGE`, `RABBIT`, `PLAGUE`, `WHOAMI`,
  `PWD`, `CD`, `LS`, `UPTIME`, `PING`, `NETSTAT`, `FORTUNE`, `COFFEE`,
  `PIZZA`, `MOM`, `VIRUS`, `MATRIX`, `LEET`, `NUKE`, `SPOON`. Keep new
  ones out of the `HELP` list; finding them is the point.
- **Modem dial-in**: the DIAL button synthesizes dial tone, DTMF digits,
  ring, and handshake screech with the Web Audio API. User-triggered only,
  never autoplayed.

## Privacy

Nothing on this site collects, stores, or transmits user data. There is no
backend, no form that POSTs anywhere, and no cookies at all. `localStorage`
is used for exactly three cosmetic things, all of which stay on the device:
the fake visitor counter, the CRT on/off preference, and petition handles.
The "donate" button and the store's "add to cart" buttons are pure theater
and never touch the network.

The petition is deliberately local-only. Making it a shared list was
considered and rejected: it is easy to build (Workers KV, one key per
signature to avoid read-modify-write races), but a public unauthenticated
write endpoint brings bot spam, an ongoing moderation duty for whatever
strangers type onto this domain, and personal-data handling once people
enter real names. Not worth it for a placeholder. If that ever changes,
the shape is KV + Turnstile + a strict charset allowlist + a delete path.

Signatures and cart line items are rendered with `createElement` +
`textContent`, never `innerHTML`. Keep it that way. In `bbs.js`, terminal
output goes through `insertAdjacentHTML` with the manual `esc()` helper, so
any new text there must be passed through `esc()` too.

The cart lives in `localStorage` under `fj_cart` and is validated on read:
unknown item ids are dropped and quantities are clamped, so a hand-edited
value cannot inject anything or break the totals.

## Layout gotcha

`<marquee>` is `inline-block` by default, so `margin: 0 auto` does not
centre it. The news ticker on `evidence.html` needs `display: block` to
line up with the windows, which is what the `.ticker` class handles.

## Content notes

This is satire/parody of a fictional film character. Every page carries one
short footer disclaimer noting it's unaffiliated with MGM/United Artists.
Keep that footer on any future page you add, and keep it to the one line:
the copy elsewhere is deliberately free of repeated warnings.

## Local preview

```bash
cd ~/Documents/Projects/freejoey.com
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Deploy with Cloudflare

1. In Cloudflare dashboard: **Workers & Pages > Create application > Pages
   > Connect to Git**, and select the `freejoey.com` GitHub repo.
   - Framework preset: `None`
   - Build command: *(leave blank)*
   - Build output directory: `/`
2. Deploy. Cloudflare gives you a `*.pages.dev` preview URL.
3. In the project, add the custom domain `freejoey.com` (and `www` if
   wanted).
4. Point the domain's nameservers at Cloudflare, same as sageschiller.com:
   in your registrar, switch nameservers to the two Cloudflare provides.

No environment variables or secrets are needed; there's no backend.
