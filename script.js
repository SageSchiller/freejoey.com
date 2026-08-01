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
    alert("It is now safe to turn off your computer.\n\nIt is not, however, safe to forget about Joey.");
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

function runBoot() {
  const target = document.getElementById("boot");
  if (!target) return;
  if (sessionStorage.getItem("fj_booted") === "1") {
    target.remove();
    return;
  }
  sessionStorage.setItem("fj_booted", "1");
  document.body.style.overflow = "hidden";

  const out = target.querySelector(".boot-out");
  let i = 0;
  let timer = null;

  const finish = () => {
    clearTimeout(timer);
    target.remove();
    document.body.style.overflow = "";
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
  document.addEventListener("keydown", finish, { once: true });
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

/* ---------------- init ---------------- */

document.addEventListener("DOMContentLoaded", () => {
  tickClock();
  buildTaskbar();
  initCrt();
  paintHitCounter();
  initWindows();
  initSaver();
  initPetition();
  runBoot();

  const donateBtn = document.getElementById("donate-btn");
  if (donateBtn) donateBtn.addEventListener("click", runDonatePrank);
});
