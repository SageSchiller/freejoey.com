// FREE JOEY - shared retro behavior.
// Everything here is local to the browser: no network calls, no analytics,
// nothing collected or transmitted. localStorage is used only for the
// cosmetic hit counter, the CRT preference, and locally-stored petition
// handles that never leave the device.

/* ---------------- clock ---------------- */

function pad(n) { return String(n).padStart(2, "0"); }

function tickClock() {
  const now = new Date();
  const t = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  document.querySelectorAll("#sys-clock, #tray-clock").forEach((el) => {
    el.textContent = t;
  });
}
setInterval(tickClock, 1000);

/* ---------------- menu bar gags ---------------- */

function fileMenuExit() {
  alert("Nice try. Joey doesn't have an exit strategy either.");
}

function helpMenuAbout() {
  alert("FREE JOEY v1.0 (16-bit)\nUnofficial. Unsanctioned. Unbelievably necessary.");
}

/* ---------------- cosmetic hit counter ---------------- */

function paintHitCounter() {
  const els = document.querySelectorAll("#hit-counter, #tray-hits");
  if (!els.length) return;
  const key = "fj_hits";
  let n = parseInt(localStorage.getItem(key) || "133742", 10);
  if (!Number.isFinite(n)) n = 133742;
  n += Math.floor(Math.random() * 3) + 1;
  localStorage.setItem(key, String(n));
  els.forEach((el) => { el.textContent = String(n).padStart(8, "0"); });
}

/* ---------------- CRT toggle ---------------- */

function initCrt() {
  if (!document.getElementById("crt")) {
    const el = document.createElement("div");
    el.id = "crt";
    el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);
  }
  applyCrt();
}

function applyCrt() {
  const off = localStorage.getItem("fj_crt") === "off";
  document.body.classList.toggle("no-crt", off);
  const btn = document.getElementById("crt-btn");
  if (btn) btn.classList.toggle("pressed", !off);
}

function toggleCrt() {
  const off = localStorage.getItem("fj_crt") === "off";
  localStorage.setItem("fj_crt", off ? "on" : "off");
  applyCrt();
}

/* ---------------- draggable windows ---------------- */

let zTop = 60;

function initWindows() {
  const canDrag = window.matchMedia("(pointer: fine) and (min-width: 760px)").matches;
  document.querySelectorAll(".window").forEach((win) => {
    const bar = win.querySelector(".title-bar");
    if (!bar) return;

    // Title-bar buttons: minimize rolls the window up, X is a joke.
    const controls = bar.querySelectorAll(".controls span");
    controls.forEach((c) => {
      c.addEventListener("mousedown", (e) => e.stopPropagation());
      c.addEventListener("click", (e) => {
        e.stopPropagation();
        const label = c.textContent.trim();
        if (label === "X") {
          alert("You can't close this. That's rather the point of the campaign.");
        } else {
          win.classList.toggle("rolled");
        }
      });
    });

    if (!canDrag) return;

    bar.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      const rect = win.getBoundingClientRect();
      // Freeze the window where it visually sits, then float it.
      if (!win.classList.contains("floated")) {
        win.style.width = rect.width + "px";
        win.style.left = rect.left + "px";
        win.style.top = rect.top + "px";
        win.classList.add("floated");
      }
      win.style.zIndex = ++zTop;
      const offX = e.clientX - rect.left;
      const offY = e.clientY - rect.top;
      win.classList.add("dragging");

      const move = (ev) => {
        const x = Math.max(0, Math.min(window.innerWidth - 60, ev.clientX - offX));
        const y = Math.max(0, Math.min(window.innerHeight - 40, ev.clientY - offY));
        win.style.left = x + "px";
        win.style.top = y + "px";
      };
      const up = () => {
        win.classList.remove("dragging");
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      };
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
      e.preventDefault();
    });
  });
}

function resetWindows() {
  document.querySelectorAll(".window.floated").forEach((win) => {
    win.classList.remove("floated", "rolled");
    win.style.cssText = "";
  });
  closeStart();
}

/* ---------------- taskbar + start menu ---------------- */

const PAGES = [
  ["index.html", "Manifesto"],
  ["evidence.html", "Evidence &amp; Updates"],
  ["bbs.html", "Dial the BBS"],
  ["merch.html", "Merch &amp; Donations"],
  ["faq.html", "FAQ"],
];

function buildTaskbar() {
  if (document.getElementById("taskbar")) return;

  const menu = document.createElement("div");
  menu.id = "start-menu";
  menu.innerHTML =
    PAGES.map(([href, label]) => `<a href="${href}">${label}</a>`).join("") +
    `<hr>
     <button type="button" id="menu-crt">Toggle CRT filter</button>
     <button type="button" id="menu-reset">Reset window layout</button>
     <button type="button" id="menu-saver">Start screen saver</button>
     <hr>
     <button type="button" id="menu-shutdown">Shut Down...</button>`;

  const bar = document.createElement("div");
  bar.id = "taskbar";
  bar.innerHTML =
    `<button type="button" id="start-btn"><strong>&#9783; Start</strong></button>
     <button type="button" id="crt-btn" title="Toggle CRT filter">CRT</button>
     <span class="spacer"></span>
     <span class="tray">
       <span title="Visitors">&#128065; <span id="tray-hits">--------</span></span>
       <span id="tray-clock">--:--:--</span>
     </span>`;

  document.body.appendChild(menu);
  document.body.appendChild(bar);

  const startBtn = document.getElementById("start-btn");
  startBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("open");
    startBtn.classList.toggle("pressed", menu.classList.contains("open"));
  });
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target)) closeStart();
  });

  document.getElementById("crt-btn").addEventListener("click", toggleCrt);
  document.getElementById("menu-crt").addEventListener("click", () => { toggleCrt(); closeStart(); });
  document.getElementById("menu-reset").addEventListener("click", resetWindows);
  document.getElementById("menu-saver").addEventListener("click", () => { closeStart(); startSaver(); });
  document.getElementById("menu-shutdown").addEventListener("click", () => {
    closeStart();
    confirmShutdown();
  });
}

function closeStart() {
  const menu = document.getElementById("start-menu");
  const btn = document.getElementById("start-btn");
  if (menu) menu.classList.remove("open");
  if (btn) btn.classList.remove("pressed");
}

/* ---------------- screen saver ---------------- */

let saverTimer = null;
let saverRAF = null;

function startSaver() {
  const saver = document.getElementById("saver");
  if (!saver || saver.classList.contains("on")) return;
  saver.classList.add("on");

  const canvas = saver.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const stars = Array.from({ length: 220 }, () => ({
    x: (Math.random() - 0.5) * canvas.width,
    y: (Math.random() - 0.5) * canvas.height,
    z: Math.random() * canvas.width,
  }));

  const draw = () => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2, cy = canvas.height / 2;
    ctx.fillStyle = "#33ff33";
    for (const s of stars) {
      s.z -= 4;
      if (s.z <= 1) {
        s.x = (Math.random() - 0.5) * canvas.width;
        s.y = (Math.random() - 0.5) * canvas.height;
        s.z = canvas.width;
      }
      const k = 128 / s.z;
      const px = s.x * k + cx;
      const py = s.y * k + cy;
      if (px < 0 || px >= canvas.width || py < 0 || py >= canvas.height) continue;
      const size = Math.max(1, (1 - s.z / canvas.width) * 3);
      ctx.fillRect(px, py, size, size);
    }
    ctx.font = "bold 30px 'Courier New', monospace";
    ctx.fillStyle = "#33ff33";
    ctx.textAlign = "center";
    ctx.fillText("FREE JOEY", cx, cy);
    saverRAF = requestAnimationFrame(draw);
  };
  draw();
}

function stopSaver() {
  const saver = document.getElementById("saver");
  if (!saver || !saver.classList.contains("on")) return;
  saver.classList.remove("on");
  if (saverRAF) cancelAnimationFrame(saverRAF);
  saverRAF = null;
}

function armSaver() {
  clearTimeout(saverTimer);
  saverTimer = setTimeout(startSaver, 90000);
}

function initSaver() {
  const saver = document.createElement("div");
  saver.id = "saver";
  saver.innerHTML = "<canvas></canvas>";
  saver.addEventListener("click", stopSaver);
  document.body.appendChild(saver);

  ["mousemove", "keydown", "scroll", "touchstart", "click"].forEach((evt) => {
    document.addEventListener(evt, () => {
      if (saver.classList.contains("on")) stopSaver();
      armSaver();
    }, { passive: true });
  });
  armSaver();
}

/* ---------------- boot sequence (index only, once per session) ---------------- */

const BOOT_LINES = [
  "Award Modular BIOS v4.51PG, An Energy Star Ally",
  "Copyright (C) 1984-95, Award Software, Inc.",
  "",
  "FREEJOEY CAMPAIGN WORKSTATION",
  "",
  "Main Processor    : 486DX2/66",
  "Memory Test       : 8192K OK",
  "",
  "Detecting IDE Primary Master   ... JUSTICE-540MB",
  "Detecting IDE Primary Slave    ... None",
  "Detecting Serial Port COM2     ... USRobotics 28.8K",
  "",
  "Loading MORAL.SYS ..................... OK",
  "Loading SOLIDARITY.DRV ................ OK",
  "Loading NUANCE.SYS .................... FAILED",
  "Loading CONVICTION.EXE ................ OK",
  "",
  "Starting MS-DOS...",
  "",
  "C:\\> WIN",
];

// Builds the DOS screen markup. index.html ships one inline so the first
// paint is already black; every other page gets one created on demand when
// the machine is restarted from the shutdown screen.
function makeBootScreen() {
  const el = document.createElement("div");
  el.id = "boot";
  const out = document.createElement("span");
  out.className = "boot-out";
  const cur = document.createElement("span");
  cur.className = "blink";
  cur.textContent = "_";
  const hint = document.createElement("span");
  hint.className = "hint";
  hint.textContent = "press any key to skip";
  el.appendChild(out);
  el.appendChild(cur);
  el.appendChild(hint);
  return el;
}

// Types BOOT_LINES into an existing boot screen, then tears it down.
function playBoot(target, onDone) {
  document.body.style.overflow = "hidden";
  const out = target.querySelector(".boot-out");
  out.textContent = "";

  let i = 0;
  let timer = null;
  let ended = false;

  const finish = () => {
    if (ended) return;
    ended = true;
    clearTimeout(timer);
    target.removeEventListener("click", finish);
    document.removeEventListener("keydown", finish);
    target.remove();
    document.body.style.overflow = "";
    if (onDone) onDone();
  };

  const step = () => {
    if (i >= BOOT_LINES.length) {
      timer = setTimeout(finish, 500);
      return;
    }
    out.textContent += BOOT_LINES[i] + "\n";
    i++;
    timer = setTimeout(step, BOOT_LINES[i - 1] === "" ? 40 : 130);
  };
  step();

  target.addEventListener("click", finish);
  document.addEventListener("keydown", finish);
}

function runBoot() {
  const target = document.getElementById("boot");
  if (!target) return;
  if (sessionStorage.getItem("fj_booted") === "1") {
    target.remove();
    return;
  }
  sessionStorage.setItem("fj_booted", "1");
  playBoot(target, null);
}

// Power cycle: swap the shutdown screen for a boot screen and run the POST
// again. No page reload, so the black never breaks.
function restartMachine() {
  const sd = document.getElementById("shutdown");
  if (sd) sd.remove();
  if (document.getElementById("boot")) return;

  const screen = makeBootScreen();
  document.body.appendChild(screen);
  document.body.style.overflow = "hidden";

  // Beat of black before the POST, like a monitor warming back up.
  setTimeout(() => {
    playBoot(screen, () => {
      window.scrollTo(0, 0);
      armSaver();
    });
  }, 600);
}

/* ---------------- Windows 3.1 modal dialog ---------------- */

function win31Dialog(opts) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";

  const dlg = document.createElement("div");
  dlg.className = "dialog";
  dlg.setAttribute("role", "dialog");
  dlg.setAttribute("aria-modal", "true");

  const bar = document.createElement("div");
  bar.className = "title-bar";
  const t = document.createElement("span");
  t.textContent = opts.title || "";
  bar.appendChild(t);
  dlg.appendChild(bar);

  const body = document.createElement("div");
  body.className = "dialog-body";
  if (opts.icon) {
    const ic = document.createElement("div");
    ic.className = "dialog-icon";
    ic.textContent = opts.icon;
    body.appendChild(ic);
  }
  const msg = document.createElement("div");
  msg.className = "dialog-msg";
  msg.textContent = opts.message || "";
  body.appendChild(msg);
  dlg.appendChild(body);

  const btns = document.createElement("div");
  btns.className = "dialog-buttons";

  const close = () => {
    backdrop.remove();
    document.removeEventListener("keydown", onKey);
  };

  function onKey(e) {
    if (e.key === "Escape") { close(); if (opts.onCancel) opts.onCancel(); }
  }

  (opts.buttons || []).forEach((b, idx) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "btn31";
    el.textContent = b.label;
    el.addEventListener("click", () => {
      close();
      if (b.action) b.action();
    });
    btns.appendChild(el);
    if (idx === 0) setTimeout(() => el.focus(), 0);
  });

  dlg.appendChild(btns);
  backdrop.appendChild(dlg);
  document.body.appendChild(backdrop);
  document.addEventListener("keydown", onKey);
}

/* ---------------- shutdown sequence ---------------- */
// The mirror image of the boot sequence. SOLIDARITY.DRV declining to
// terminate is the point of the whole bit.

const SHUTDOWN_LINES = [
  "Closing FREE JOEY CAMPAIGN...",
  "",
  "Saving CRT preference ................. OK",
  "Saving petition signatures ............ OK",
  "Writing 31,337 signatures to /dev/null  OK",
  "Unmounting IDE Primary Master ......... OK",
  "Closing COM2 (USRobotics 28.8K) ....... OK",
  "",
  "Terminating CONVICTION.EXE ............ OK",
  "Terminating MORAL.SYS ................. OK",
  "Terminating SOLIDARITY.DRV ............",
  "  SOLIDARITY.DRV is not responding.",
  "  Retrying .............................",
  "  SOLIDARITY.DRV declines to terminate.",
  "  Leaving it running.",
  "",
  "Releasing the campaign ................ DENIED",
  "Forgetting about Joey ................. DENIED",
  "",
  "Windows is shutting down...",
];

function confirmShutdown() {
  win31Dialog({
    title: "Exit Windows",
    icon: "⚠️",
    message:
      "This will end your FREE JOEY session.\n\n" +
      "Joey's session was ended for him, at 4am, by six people who did not knock.",
    buttons: [
      { label: "OK", action: runShutdown },
      { label: "Cancel" },
    ],
    onCancel: () => {},
  });
}

function runShutdown() {
  if (document.getElementById("shutdown")) return;

  const el = document.createElement("div");
  el.id = "shutdown";
  const out = document.createElement("span");
  out.className = "out";
  const cursor = document.createElement("span");
  cursor.className = "blink out";
  cursor.textContent = "_";
  const safe = document.createElement("div");
  safe.className = "safe";
  el.appendChild(out);
  el.appendChild(cursor);
  el.appendChild(safe);
  document.body.appendChild(el);
  document.body.style.overflow = "hidden";

  stopSaver();
  clearTimeout(saverTimer);

  let i = 0;
  let timer = null;
  let finished = false;

  const onKey = () => {
    if (!finished) { finish(); return; }
    document.removeEventListener("keydown", onKey);
    restartMachine();
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    safe.textContent =
      "It's now safe to turn off your computer.\n\n" +
      "It is not safe to forget about Joey.";
    el.classList.add("done");
    const hint = document.createElement("div");
    hint.className = "hint";
    hint.textContent = "click anywhere to restart";
    el.appendChild(hint);
  };

  const step = () => {
    if (i >= SHUTDOWN_LINES.length) {
      timer = setTimeout(finish, 900);
      return;
    }
    out.textContent += SHUTDOWN_LINES[i] + "\n";
    i++;
    // Pause on the line where the driver refuses to die.
    const prev = SHUTDOWN_LINES[i - 1];
    const delay = prev === "" ? 40 : (prev.indexOf("Retrying") >= 0 ? 700 : 120);
    timer = setTimeout(step, delay);
  };
  step();

  // Mid-sequence a click skips to the end; on the final screen it restarts.
  // One handler branching on state, so the click that finishes cannot also
  // trigger the restart.
  el.addEventListener("click", () => {
    if (!finished) { finish(); return; }
    document.removeEventListener("keydown", onKey);
    restartMachine();
  });
  document.addEventListener("keydown", onKey);
}

/* ---------------- petition (local only) ---------------- */

const SEED_SIGNERS = [
  "Zer0Cool", "AcidBurn", "CerealKiller", "LordNikon", "PhantomPhreak",
  "RazorAndBlade", "nikon_jr", "sysop@altered_states", "PlagueHater92",
  "modem_goblin", "anon_from_2600", "TheGibsonWatcher",
];

function loadMine() {
  try {
    const raw = localStorage.getItem("fj_signers");
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((s) => typeof s === "string") : [];
  } catch { return []; }
}

function renderPetition() {
  const list = document.getElementById("petition-list");
  const tally = document.getElementById("petition-tally");
  if (!list) return;
  const mine = loadMine();
  list.innerHTML = "";
  mine.forEach((h) => {
    const d = document.createElement("div");
    d.className = "mine";
    d.textContent = "* " + h + "  (you, stored on this device only)";
    list.appendChild(d);
  });
  SEED_SIGNERS.forEach((h) => {
    const d = document.createElement("div");
    d.textContent = "  " + h;
    list.appendChild(d);
  });
  if (tally) {
    tally.textContent = String(31337 + mine.length).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}

function initPetition() {
  const form = document.getElementById("petition-form");
  if (!form) return;
  renderPetition();
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("petition-handle");
    const handle = input.value.trim().slice(0, 32);
    if (!handle) {
      alert("Enter a handle. Any handle. Make one up, that's the tradition.");
      return;
    }
    const mine = loadMine();
    if (mine.includes(handle)) {
      alert("You already signed as that handle. Ballot stuffing is beneath us.");
      return;
    }
    mine.push(handle);
    localStorage.setItem("fj_signers", JSON.stringify(mine));
    input.value = "";
    renderPetition();
    const note = document.getElementById("petition-note");
    if (note) {
      note.textContent =
        "Signature recorded in your browser's local storage. It was not sent anywhere, " +
        "because there is nowhere to send it. Thank you for your service.";
    }
  });
}

/* ---------------- donate prank (merch page) ---------------- */

function runDonatePrank() {
  const btn = document.getElementById("donate-btn");
  const panel = document.getElementById("prank-panel");
  const log = document.getElementById("prank-log");
  if (!btn || !panel || !log) return;

  btn.disabled = true;
  panel.classList.add("show");
  log.textContent = "";

  const lines = [
    "Initializing payment handshake...",
    "Dialing 1-900-HACK-THE-PLANET...",
    "ATDT 1-900-422-2584",
    "CONNECT 28800",
    "Negotiating protocol... V.34",
    "Verifying funds available: [Y/n]",
    "Encrypting transaction with ROT13 (twice, for safety)...",
    "Contacting the Gibson...",
    "ACCESS DENIED.",
    "ACCESS DENIED.",
    "Just kidding. There was never a transaction.",
    "",
    "This button does not process payments. It never has.",
    "Joey doesn't want your money.",
    "Go unplug for five minutes. That's the whole ask.",
  ];

  let i = 0;
  const step = () => {
    if (i >= lines.length) { btn.disabled = false; return; }
    log.textContent += (lines[i] === "" ? "\n" : lines[i] + "\n");
    i++;
    setTimeout(step, i < 5 ? 260 : 420);
  };
  step();
}

/* ---------------- pull-down menus ---------------- */
// The menu bar used to highlight on hover and do nothing. These are real
// Windows 3.1 style pull-downs: click to open, hover to slide between open
// menus, click anywhere else or press Escape to close.

function say(msg) { alert(msg); }

const MENU_DEFS = {
  file: [
    { label: "New Campaign", key: "Ctrl+N", disabled: true },
    { label: "Open Case File...", key: "Ctrl+O",
      action: () => { location.href = "evidence.html"; } },
    { label: "Save", key: "Ctrl+S",
      action: () => say("Saved.\n\n(Nothing was saved. There is nothing to save.)") },
    { label: "Print...", key: "Ctrl+P",
      action: () => say("No printer detected.\n\nTry the one in the computer lab. It is out of toner. It has been out of toner since 1994.") },
    { sep: true },
    { label: "Exit", key: "Alt+F4", action: fileMenuExit },
  ],

  edit: [
    { label: "Undo", key: "Ctrl+Z",
      action: () => say("You cannot undo this.\n\nNot the download, not the raid, not any of it.") },
    { label: "Redo", key: "Ctrl+Y", disabled: true },
    { sep: true },
    { label: "Cut", key: "Ctrl+X", disabled: true },
    { label: "Copy", key: "Ctrl+C", disabled: true },
    { label: "Paste", key: "Ctrl+V",
      action: () => say("Nothing on the clipboard.\n\nWhatever you think is on there, it is not, and we were never told about it.") },
    { sep: true },
    { label: "Select All", key: "Ctrl+A", action: () => {
        const main = document.querySelector("main");
        if (!main) return;
        const sel = window.getSelection();
        sel.removeAllRanges();
        const r = document.createRange();
        r.selectNodeContents(main);
        sel.addRange(r);
      } },
  ],

  search: [
    { label: "Find...", key: "F3",
      action: () => say("Find what?\n\nHe is in custody. That is the whole search result.") },
    { label: "Find Next", key: "F4", disabled: true },
  ],

  view: [
    { label: "Toolbar", key: "✓", disabled: true },
    { label: "Status Bar", key: "✓", disabled: true },
    { sep: true },
    { label: "Zoom", action: () => say("Zoom is a 2020 problem.\n\nThis is 1995. Sit closer to the monitor.") },
    { label: "Refresh", key: "F5", action: () => location.reload() },
  ],

  settings: [
    { label: "Terminal Emulation: ANSI-BBS", disabled: true },
    { label: "Baud Rate: 28800",
      action: () => say("28800 is as fast as this gets.\n\nJoey had to beg for this. Show some respect.") },
    { label: "Local Echo: ON", disabled: true },
    { sep: true },
    { label: "Capture to Disk...",
      action: () => say("Capture disabled.\n\nThe last person who saved a session to disk is currently in federal custody.") },
  ],

  transfers: [
    { label: "Download (ZMODEM)",
      action: () => say("ZMODEM receive initiated...\n\nCONNECTION LOST.\n\nProbably for the best.") },
    { label: "Upload (ZMODEM)",
      action: () => say("Do not upload anything to this board.\n\nThat is, verbatim, how this entire situation started.") },
    { sep: true },
    { label: "Transfer Log", disabled: true },
  ],

  options: [
    { label: "Currency: 1995 USD", disabled: true },
    { label: "Gift Wrap",
      action: () => say("Gift wrap applied to 0 items.\n\nThe wrapping is also fictional. It is fictional wrapping around fictional merchandise.") },
    { sep: true },
    { label: "Restock Inventory",
      action: () => say("Restocking...\n\n0 items restocked.\n0 items were ever stocked.\nRestock complete.") },
  ],

  cart: [
    { label: "View Cart", action: () => { showCart(true); } },
    { label: "Empty Cart", action: () => { emptyCart(); } },
    { sep: true },
    { label: "Checkout", action: () => { showCart(true); runCheckout(); } },
  ],

  help: [
    { label: "Contents", key: "F1",
      action: () => say("FREE JOEY HELP\n\n- The EVIDENCE page has the case log.\n- The BBS takes typed commands. Try HELP once you are in.\n- The MERCH page takes no money whatsoever.\n\nThat is the whole system.") },
    { label: "Search for Help On...",
      action: () => say('Search for help on: "how to get a lawyer"\n\n0 topics found.') },
    { sep: true },
    { label: "About FREE JOEY", action: helpMenuAbout },
  ],
};

function closeMenus() {
  document.querySelectorAll(".menu-bar > span.open").forEach((s) => s.classList.remove("open"));
  document.querySelectorAll(".dropdown.open").forEach((d) => d.classList.remove("open"));
}

function buildDropdown(name) {
  const def = MENU_DEFS[name];
  const dd = document.createElement("div");
  dd.className = "dropdown";
  if (!def) return dd;
  def.forEach((item) => {
    if (item.sep) {
      dd.appendChild(document.createElement("hr"));
      return;
    }
    const b = document.createElement("button");
    b.type = "button";
    const l = document.createElement("span");
    l.textContent = item.label;
    b.appendChild(l);
    if (item.key) {
      const k = document.createElement("span");
      k.className = "key";
      k.textContent = item.key;
      b.appendChild(k);
    }
    if (item.disabled) {
      b.disabled = true;
    } else {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        closeMenus();
        if (item.action) item.action();
      });
    }
    dd.appendChild(b);
  });
  return dd;
}

function initMenus() {
  const labels = document.querySelectorAll(".menu-bar > span[data-menu]");
  labels.forEach((span) => {
    const dd = buildDropdown(span.dataset.menu);
    span.appendChild(dd);

    span.addEventListener("click", (e) => {
      e.stopPropagation();
      const wasOpen = span.classList.contains("open");
      closeMenus();
      if (!wasOpen) {
        span.classList.add("open");
        dd.classList.add("open");
      }
    });

    // Once one menu is open, sliding across the bar opens the others.
    span.addEventListener("mouseenter", () => {
      const anyOpen = document.querySelector(".menu-bar > span.open");
      if (!anyOpen || anyOpen === span) return;
      closeMenus();
      span.classList.add("open");
      dd.classList.add("open");
    });
  });

  document.addEventListener("click", closeMenus);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenus(); });
}

/* ---------------- shopping cart (merch page) ---------------- */
// Nothing here touches the network. The cart is real bookkeeping wrapped
// around merchandise that does not exist, which is the joke.

const CATALOG = {};

function loadCart() {
  try {
    const raw = localStorage.getItem("fj_cart");
    const obj = raw ? JSON.parse(raw) : {};
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return {};
    const clean = {};
    Object.keys(obj).forEach((k) => {
      const n = parseInt(obj[k], 10);
      if (CATALOG[k] && Number.isFinite(n) && n > 0) clean[k] = Math.min(n, 99);
    });
    return clean;
  } catch { return {}; }
}

function saveCart(c) { localStorage.setItem("fj_cart", JSON.stringify(c)); }

function cartCount(c) {
  return Object.keys(c).reduce((sum, k) => sum + c[k], 0);
}

function money(n) { return "$" + n.toFixed(2); }

function renderCart() {
  const cart = loadCart();
  const count = cartCount(cart);

  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = String(count);

  const body = document.getElementById("cart-body");
  const totals = document.getElementById("cart-totals");
  if (!body || !totals) return;

  body.innerHTML = "";
  totals.innerHTML = "";

  if (!count) {
    const p = document.createElement("div");
    p.className = "cart-empty";
    p.textContent = "Your cart is empty. So is the warehouse. So is the legal defense fund.";
    body.appendChild(p);
    return;
  }

  const table = document.createElement("table");
  table.className = "cart";
  table.innerHTML =
    "<tr><th>Item</th><th>Qty</th><th>Price</th><th>Line</th><th></th></tr>";

  let subtotal = 0;
  Object.keys(cart).forEach((id) => {
    const item = CATALOG[id];
    const qty = cart[id];
    const line = item.price * qty;
    subtotal += line;

    const tr = document.createElement("tr");

    const tdName = document.createElement("td");
    tdName.textContent = item.name;

    const tdQty = document.createElement("td");
    tdQty.className = "num";
    tdQty.textContent = String(qty);

    const tdPrice = document.createElement("td");
    tdPrice.className = "num";
    tdPrice.textContent = money(item.price);

    const tdLine = document.createElement("td");
    tdLine.className = "num";
    tdLine.textContent = money(line);

    const tdBtn = document.createElement("td");
    const rm = document.createElement("button");
    rm.type = "button";
    rm.textContent = "REMOVE";
    rm.addEventListener("click", () => {
      const c = loadCart();
      if (!c[id]) return;
      c[id] -= 1;
      if (c[id] <= 0) delete c[id];
      saveCart(c);
      renderCart();
    });
    tdBtn.appendChild(rm);

    [tdName, tdQty, tdPrice, tdLine, tdBtn].forEach((td) => tr.appendChild(td));
    table.appendChild(tr);
  });

  body.appendChild(table);

  // 1995 sales tax, applied with total seriousness to imaginary goods.
  const tax = subtotal * 0.0825;
  const grand = subtotal + tax;

  const rows = [
    ["Subtotal", money(subtotal)],
    ["Shipping", "$0.00 (nothing ships)"],
    ["Tax (8.25%)", money(tax)],
  ];
  rows.forEach(([k, v]) => {
    const d = document.createElement("div");
    const a = document.createElement("span");
    a.textContent = k;
    const b = document.createElement("span");
    b.textContent = v;
    d.appendChild(a); d.appendChild(b);
    totals.appendChild(d);
  });

  const g = document.createElement("div");
  g.className = "grand";
  const ga = document.createElement("span");
  ga.textContent = "TOTAL DUE";
  const gb = document.createElement("span");
  gb.textContent = money(grand);
  g.appendChild(ga); g.appendChild(gb);
  totals.appendChild(g);

  if (grand > 100) {
    const note = document.createElement("div");
    note.style.cssText = "margin-top:8px;font-size:11px;color:#444;";
    note.textContent = "Financing available. Not really. None of this is available.";
    totals.appendChild(note);
  }
}

function showCart(scroll) {
  const win = document.getElementById("cart-window");
  if (!win) return;
  win.classList.add("show");
  if (scroll) win.scrollIntoView({ behavior: "smooth", block: "start" });
}

function emptyCart() {
  saveCart({});
  renderCart();
  const log = document.getElementById("checkout-log");
  if (log) log.textContent = "";
}

function addToCart(id, btn) {
  const cart = loadCart();
  cart[id] = Math.min((cart[id] || 0) + 1, 99);
  saveCart(cart);
  renderCart();
  showCart(false);

  // Flash confirmation without disabling: clicking twice quickly should
  // add two, not silently drop the second one.
  if (btn) {
    clearTimeout(btn._flash);
    btn.textContent = "ADDED ✓";
    btn._flash = setTimeout(() => { btn.textContent = "ADD TO CART"; }, 700);
  }

  // Rewards for excessive commitment to a fake store.
  const n = cart[id];
  if (n === 5) {
    setTimeout(() => say("Five of them.\n\nThe warehouse does not exist and you have now emptied it."), 750);
  } else if (n === 13) {
    setTimeout(() => say("Thirteen.\n\nAt this point we are legally obligated to ask if you are okay."), 750);
  } else if (n === 31) {
    setTimeout(() => say("THIRTY-ONE OF THE SAME ITEM\n\nYou have out-committed the entire campaign. Joey would be moved, if he were real, and reachable."), 750);
  }
}

function runCheckout() {
  const cart = loadCart();
  const log = document.getElementById("checkout-log");
  const btn = document.getElementById("checkout-btn");
  if (!log) return;

  if (!cartCount(cart)) {
    log.textContent = "Cannot check out an empty cart.\nEven this store has standards.\n";
    return;
  }

  if (btn) btn.disabled = true;
  log.textContent = "";

  const lines = [
    "CONNECTING TO ORDER PROCESSING...",
    "ATDT 1-800-555-0199",
    "CONNECT 28800",
    "",
    "VALIDATING CART ................... OK",
    "CHECKING INVENTORY ...............",
  ];

  Object.keys(cart).forEach((id) => {
    const nm = CATALOG[id].name;
    lines.push("   " + (nm.length > 34 ? nm.slice(0, 31) + "..." : nm).padEnd(36, ".") + " 0 in stock");
  });

  lines.push(
    "",
    "INVENTORY CHECK COMPLETE.",
    "   items requested : " + cartCount(cart),
    "   items available : 0",
    "",
    "CALCULATING SHIPPING...",
    "   your location : unknown",
    "   our location  : also unknown",
    "   distance      : undefined",
    "   arrival       : never",
    "",
    "CONTACTING PAYMENT PROCESSOR......",
    "   ERROR: no payment processor configured",
    "   ERROR: no payment processor has ever been configured",
    "   ERROR: there is no store",
    "",
    "ORDER CANCELLED. NO CHARGE. NO CARD WAS ASKED FOR.",
    "",
    "Your cart has been left exactly as you built it,",
    "out of respect for the effort.",
    ""
  );

  let i = 0;
  const step = () => {
    if (i >= lines.length) {
      if (btn) btn.disabled = false;
      return;
    }
    log.textContent += lines[i] + "\n";
    log.scrollTop = log.scrollHeight;
    i++;
    setTimeout(step, i < 5 ? 240 : 130);
  };
  step();
}

function initStore() {
  const buttons = document.querySelectorAll("button[data-id]");
  if (!buttons.length) return;

  buttons.forEach((b) => {
    CATALOG[b.dataset.id] = {
      name: b.dataset.name,
      price: parseFloat(b.dataset.price),
    };
    b.addEventListener("click", () => addToCart(b.dataset.id, b));
  });

  const co = document.getElementById("checkout-btn");
  if (co) co.addEventListener("click", runCheckout);

  const ec = document.getElementById("empty-btn");
  if (ec) ec.addEventListener("click", emptyCart);

  renderCart();
  if (cartCount(loadCart())) showCart(false);
}

/* ---------------- init ---------------- */

document.addEventListener("DOMContentLoaded", () => {
  tickClock();
  buildTaskbar();
  initCrt();
  paintHitCounter();
  initWindows();
  initSaver();
  initPetition();
  initMenus();
  initStore();
  runBoot();

  const donateBtn = document.getElementById("donate-btn");
  if (donateBtn) donateBtn.addEventListener("click", runDonatePrank);
});
