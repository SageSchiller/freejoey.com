// FREE JOEY — shared retro behavior. No tracking, no network calls.

function tickClock() {
  const el = document.getElementById("sys-clock");
  if (!el) return;
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  el.textContent = `${h}:${m}:${s}`;
}
setInterval(tickClock, 1000);
tickClock();

function fileMenuExit() {
  alert("Nice try. Joey doesn't have an exit strategy either.");
}

function helpMenuAbout() {
  alert("FREE JOEY v1.0 (16-bit)\nUnofficial. Unsanctioned. Unbelievably necessary.");
}

// Fake hit counter, stable per browser via localStorage, purely cosmetic.
function paintHitCounter() {
  const el = document.getElementById("hit-counter");
  if (!el) return;
  const key = "fj_hits";
  let n = parseInt(localStorage.getItem(key) || "133742", 10);
  n += Math.floor(Math.random() * 3) + 1;
  localStorage.setItem(key, String(n));
  el.textContent = String(n).padStart(8, "0");
}
paintHitCounter();

// The prank donate sequence. Purely client-side theater — no form fields,
// no network request, nothing is ever collected.
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
    if (i >= lines.length) {
      btn.disabled = false;
      return;
    }
    log.textContent += (lines[i] === "" ? "\n" : lines[i] + "\n");
    i++;
    setTimeout(step, i < 5 ? 260 : 420);
  };
  step();
}

document.addEventListener("DOMContentLoaded", () => {
  const donateBtn = document.getElementById("donate-btn");
  if (donateBtn) donateBtn.addEventListener("click", runDonatePrank);
});
