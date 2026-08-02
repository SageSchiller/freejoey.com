// FREE JOEY BBS - a fake dial-up board you can actually type at.
// Entirely client-side. Nothing you type is stored, logged, or transmitted.

const SCREEN = () => document.getElementById("bbs-screen");

function esc(s) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

function write(html) {
  const s = SCREEN();
  s.insertAdjacentHTML("beforeend", html + "\n");
  s.scrollTop = s.scrollHeight;
}

function writeLines(lines, cls) {
  const open = cls ? `<span class="${cls}">` : "";
  const close = cls ? "</span>" : "";
  write(open + lines.map(esc).join("\n") + close);
}

/* ---------------- fake filesystem ---------------- */

const FILES = {
  "README.TXT": [
    "FREE JOEY BBS -- node 1 of 1",
    "",
    "You have reached a board that exists to argue, at length, that a",
    "fictional teenager from a 1995 movie deserved better. That is the",
    "entire charter. There is no warez here. There is no carding here.",
    "There is a lot of opinion here.",
  ],
  "JOEY.NFO": [
    "HANDLE    : none, and it ate him up",
    "STATUS    : IN CUSTODY. U.S. Secret Service.",
    "CHARGES   : not announced",
    "RELEASED  : no date given",
    "EQUIPMENT : one computer, named Lucy. Seized.",
    "SKILL     : contested",
    "NERVE     : underrated",
    "NOTE      : Downloaded the garbage file that broke the whole case",
    "            open, then hid the disk while they were carrying his",
    "            monitor down the stairs. It is the only hard evidence",
    "            anyone has. He is the only one they took in for it.",
  ],
  "RULES.TXT": [
    "1. No flooding.",
    "2. No trading anything you shouldn't have.",
    "3. Do not ask the sysop what he does for a living.",
    "4. Joey did nothing wrong. This is not up for debate on this board.",
    "5. Rule 4 is, in fact, slightly up for debate. See MANIFESTO.",
  ],
  "GIBSON.NFO": [
    "TARGET    : Ellingson Mineral Company",
    "SYSTEM    : Gibson supercomputer",
    "ACCESS    : had it, briefly, by accident",
    "OUTCOME   : still standing",
    "",
    "Beautiful machine. Genuinely. You should see the way the",
    "filesystem renders. Nobody talks about that part because",
    "everyone is too busy talking about the part where a kid",
    "pulled a junk file off it and lost everything he owned",
    "before breakfast.",
  ],
  "GILL.NFO": [
    "NAME      : Richard Gill",
    "TITLE     : Special Agent, U.S. Secret Service",
    "ROLE      : ran the raid personally",
    "STATEMENT : none given, ever",
    "",
    "Took a kid's computer out of a bedroom before sunrise and has",
    "not, to this day, explained what he thought was on it.",
    "",
    "Shortly afterwards his credit rating collapsed, a personal",
    "advertisement ran in his name, and a federal database briefly",
    "recorded him as deceased. This board keeps no records of who",
    "arranged that and has never been in a position to arrange",
    "anything.",
  ],
  "LEGAL.TXT": [
    "LEGAL DEFENSE FUND",
    "==================",
    "",
    "Balance         : $0.00",
    "Contributions   : 0",
    "Administered by : nobody",
    "Bank            : none identified",
    "",
    "The fund was announced before it was opened, which is the",
    "order in which most things happened around here.",
  ],
  "PHRACK.TXT": [
    "                    == THE CONSCIENCE OF A NOOB ==",
    "",
    "Another one got caught today, it's all over the papers. 'Teenager",
    "Arrested in Computer Crime Scandal', 'Hacker Arrested after Bank",
    "Tampering'...",
    "",
    "Damn kids. They're all alike.",
    "",
    "                          -- with apologies to The Mentor, 1986",
  ],
};

/* ---------------- commands ---------------- */

const HISTORY = [];
let histIdx = -1;

const COMMANDS = {
  HELP() {
    writeLines([
      "",
      "AVAILABLE COMMANDS",
      "==================",
      "  HELP            This list.",
      "  DIR             List files in the message base.",
      "  TYPE <file>     Read a file. Example: TYPE JOEY.NFO",
      "  WHO             Who else is online right now.",
      "  FINGER JOEY     Look up a user.",
      "  TRACE           Run a traceroute on the blame.",
      "  SYSOP           Page the system operator.",
      "  DONATE          Contribute to the cause.",
      "  DATE            Current system date and time.",
      "  BANNER          Redraw the welcome screen.",
      "  CLS             Clear the screen.",
      "  EXIT            Hang up.",
      "",
      "There are a few commands not on this list. There always are.",
      "",
    ]);
  },

  DIR() {
    writeLines(["", " Volume in drive C is JUSTICE", " Directory of C:\\FREEJOEY", ""]);
    Object.keys(FILES).forEach((f) => {
      const size = String(FILES[f].join("\n").length).padStart(6, " ");
      write(esc(`  ${f.padEnd(14)} ${size}  09-15-95   2:14a`));
    });
    writeLines(["", `  ${Object.keys(FILES).length} file(s)      1 nagging conscience`, ""]);
  },

  TYPE(arg) {
    if (!arg) { writeLines(["Usage: TYPE <filename>   (try DIR first)"], "warn"); return; }
    const key = arg.toUpperCase();
    if (!FILES[key]) { writeLines([`File not found: ${arg}`], "warn"); return; }
    writeLines([""].concat(FILES[key]).concat([""]));
  },

  WHO() {
    writeLines([
      "",
      " NODE  HANDLE            ACTION",
      " ----  ----------------  ----------------------------------",
      "    1  YOU               reading this",
      "    2  CerealKiller      eating something unidentifiable",
      "    3  LordNikon         memorizing your password over your shoulder",
      "    4  AcidBurn          out-typing everyone, as usual",
      "    5  [REDACTED]        definitely not federal law enforcement",
      "",
      " 5 users online. One of them is lying about something.",
      "",
    ]);
  },

  FINGER(arg) {
    if ((arg || "").toUpperCase() !== "JOEY") {
      writeLines([`No such user: ${arg || "(nobody)"}`], "warn");
      return;
    }
    writeLines([""].concat(FILES["JOEY.NFO"]).concat([""]));
  },

  TRACE() {
    writeLines(["", "Tracing route to BLAME over a maximum of 6 hops:", ""]);
    const hops = [
      "  1   <1 ms   ELLINGSON MINERAL CO.",
      "  2    4 ms   GARBAGE FILE (UNMONITORED)",
      "  3   11 ms   UNKNOWN LOGIN, UNLISTED  ",
      "  4   29 ms   LOCAL BBS SCENE (ENTIRE)",
      "  5   61 ms   JOEY",
      "  6  timeout  ACTUAL EMBEZZLER",
    ];
    let i = 0;
    const step = () => {
      if (i >= hops.length) {
        writeLines(["", "Trace complete. Draw your own conclusions.", ""], "dim");
        return;
      }
      write(esc(hops[i]));
      i++;
      setTimeout(step, 320);
    };
    step();
  },

  SYSOP() {
    writeLines(["", "Paging sysop", ""]);
    let dots = 0;
    const step = () => {
      if (dots++ < 6) { write("."); setTimeout(step, 400); return; }
      writeLines([
        "",
        "Sysop is away from the keyboard.",
        "He is, and this is a direct quote, 'not ready to build this out yet.'",
        "",
      ], "amber");
    };
    step();
  },

  DONATE() {
    writeLines([
      "",
      "The donation terminal is on the MERCH page.",
      "Fair warning: it does not take money. It never has.",
      "",
    ]);
  },

  DATE() {
    const d = new Date();
    writeLines(["", "Current date is " + d.toDateString(), "Current time is " + d.toLocaleTimeString(), ""]);
  },

  BANNER() { banner(); },

  CLS() { SCREEN().innerHTML = ""; },
  CLEAR() { COMMANDS.CLS(); },

  EXIT() {
    writeLines([
      "",
      "NO CARRIER",
      "",
      "...you know you can just close the tab, right?",
      "",
    ], "warn");
  },
  LOGOFF() { COMMANDS.EXIT(); },
  BYE() { COMMANDS.EXIT(); },

  /* ---- undocumented ---- */

  FREE(arg) {
    if ((arg || "").toUpperCase() === "JOEY") {
      writeLines([
        "",
        "  *** F R E E   J O E Y ***",
        "",
        "  One garbage file. One raid. One kid in custody.",
        "  He did not write the virus. He is the reason you can prove",
        "  who did.",
        "",
      ], "amber");
    } else {
      writeLines(["Free what, exactly? Be specific."], "warn");
    }
  },

  HACK(arg) {
    if ((arg || "").toUpperCase().replace(/^THE\s+/, "") !== "PLANET") {
      writeLines(["Hack what? There is only one correct answer."], "warn");
      return;
    }
    writeLines([
      "",
      "  #  #   #   ###  #  #     ####  #   #  ####",
      "  #  #  # #  #    # #      #  #  #   #  #",
      "  ####  ###  #    ##       ####  #####  ###",
      "  #  #  # #  #    # #      #     #   #  #",
      "  #  #  # #   ### #  #     #     #   #  ####",
      "",
      "        P L A N E T",
      "",
      "  Mess with the best, die like the rest.",
      "",
    ], "amber");
  },

  ROOT() { writeLines(["Permission denied. You are not, and have never been, root."], "warn"); },
  SU() { COMMANDS.ROOT(); },

  SUDO(arg) {
    if (!arg) { writeLines(["usage: sudo <command>"], "warn"); return; }
    writeLines([
      "",
      "guest is not in the sudoers file.",
      "This incident has been reported to nobody, because nobody",
      "is running this board anymore.",
      "",
    ], "warn");
  },

  GIBSON() { COMMANDS.TYPE("GIBSON.NFO"); },

  GILL() {
    COMMANDS.TYPE("GILL.NFO");
    writeLines([
      "This board has one node and no capability. Whatever you are",
      "considering, we cannot help, and he is a character in a film.",
      "",
    ], "warn");
  },

  COOKIE() {
    writeLines([
      "",
      "There is no cookie. This site sets no cookies at all.",
      "The one time somebody around here went looking for a cookie",
      "it cost us fifty points and most of our dignity.",
      "",
    ]);
  },

  POOL() {
    writeLines([
      "",
      "  The pool on the roof must have a leak.",
      "",
    ], "amber");
    writeLines(["If you know, you know. If you do not, ask around.", ""], "dim");
  },

  GARBAGE() {
    writeLines([
      "",
      "THE GARBAGE FILE",
      "================",
      "",
      "Unmonitored. Unremarkable. Sitting on a system nobody",
      "was watching, holding the only proof that the people",
      "watching were the ones stealing.",
      "",
      "One kid opened it. One kid went away for it.",
      "",
    ], "amber");
  },

  RABBIT() {
    writeLines([
      "",
      "Searching for the rabbit...",
      "",
      "The rabbit is not on this board. The rabbit was never",
      "on this board. Stop asking this board about the rabbit.",
      "",
    ], "warn");
  },

  PLAGUE() {
    writeLines([
      "",
      "Record sealed at the request of a corporate security officer",
      "who assures us he is on our side.",
      "",
      "We have some notes on that.",
      "",
    ], "warn");
  },

  WHOAMI() {
    writeLines([
      "",
      "guest",
      "",
      "No handle on file. Do not feel bad about it. Neither did he,",
      "and look how invested we all got.",
      "",
    ]);
  },

  PWD() { writeLines(["", "C:\\FREEJOEY", ""]); },
  LS(arg) { COMMANDS.DIR(arg); },

  CD() {
    writeLines([
      "",
      "There is nowhere else to go. This is one node. This is the",
      "whole board. This is it.",
      "",
    ], "dim");
  },

  UPTIME() {
    writeLines([
      "",
      " 02:14a  up 11314 days,  3 users,  load average: 0.02, 0.01, 0.00",
      "",
      "Nobody has rebooted this since 1995. Nobody dares.",
      "",
    ]);
  },

  PING(arg) {
    const host = (arg || "GIBSON").toUpperCase();
    writeLines(["", `PING ${host}: 56 data bytes`, ""]);
    let i = 0;
    const step = () => {
      if (i >= 4) {
        writeLines([
          "",
          `--- ${host} ping statistics ---`,
          "4 packets transmitted, 4 received, 0% packet loss",
          "It is up. It is fine. It has always been fine.",
          "",
        ], "dim");
        return;
      }
      const ms = (28 + Math.random() * 40).toFixed(1);
      write(esc(`64 bytes from ${host}: icmp_seq=${i} ttl=51 time=${ms} ms`));
      i++;
      setTimeout(step, 420);
    };
    step();
  },

  NETSTAT() {
    writeLines([
      "",
      "Active Connections",
      "",
      "  Proto  Local Address      Foreign Address     State",
      "  TCP    FREEJOEY:23        YOU                 ESTABLISHED",
      "  TCP    FREEJOEY:23        [REDACTED]          ESTABLISHED",
      "  TCP    FREEJOEY:23        ELLINGSON.COM       TIME_WAIT",
      "  TCP    FREEJOEY:1337      0.0.0.0             LISTENING",
      "",
      "That second one has been connected for thirty-one years",
      "and has never typed anything. We have stopped asking.",
      "",
    ]);
  },

  FORTUNE() {
    const picks = [
      "Mess with the best, die like the rest.",
      "There is no right and wrong. There's only fun and boring.",
      "Never send a boy to do a woman's job.",
      "The flag was in the page source. It is always in the page source.",
      "Any sufficiently advanced incompetence is indistinguishable from a raid.",
      "Read the man page. You will not, but you should.",
      "Somebody is always watching the port you forgot about.",
      "Back up the disk. Hide the disk. Especially hide the disk.",
    ];
    writeLines(["", "  " + picks[Math.floor(Math.random() * picks.length)], ""], "amber");
  },

  COFFEE() {
    writeLines([
      "",
      "HTCPCP/1.0 418 I'm a teapot",
      "",
      "This board cannot brew coffee. This board can barely hold",
      "a carrier signal.",
      "",
    ], "warn");
  },

  PIZZA() {
    writeLines(["", "Dialing the pizza place...", ""]);
    setTimeout(() => {
      writeLines([
        "ORDER CONFIRMED.",
        "",
        "One large, delivered to a residence currently containing",
        "zero teenagers and four federal agents. Someone will sign",
        "for it. Nobody will enjoy it.",
        "",
      ], "amber");
    }, 900);
  },

  MOM() {
    writeLines([
      "",
      "Your mother called. She needs the phone line.",
      "",
      "She has needed the phone line this entire time. Every single",
      "one of us has had this exact conversation.",
      "",
    ], "amber");
  },

  VIRUS() {
    writeLines(["", "Scanning...", ""]);
    let i = 0;
    const rows = [
      "  C:\\FREEJOEY\\README.TXT ......... clean",
      "  C:\\FREEJOEY\\JOEY.NFO ........... clean",
      "  C:\\FREEJOEY\\RULES.TXT .......... clean",
      "  C:\\FREEJOEY\\LEGAL.TXT .......... empty",
      "  C:\\FREEJOEY\\GARBAGE ............ <span class=\"warn\">DO NOT OPEN</span>",
    ];
    const step = () => {
      if (i >= rows.length) {
        writeLines(["", "Scan complete. 1 item flagged. We are not opening it again.", ""], "dim");
        return;
      }
      write(rows[i]);
      i++;
      setTimeout(step, 320);
    };
    step();
  },

  MATRIX() {
    writeLines(["", "Wrong movie. Off by four years. But fine.", ""], "dim");
    const glyphs = "01" + "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄ";
    let n = 0;
    const step = () => {
      if (n >= 12) {
        writeLines(["", "There is no spoon. There is a floppy disk. Focus.", ""], "amber");
        return;
      }
      let row = "";
      for (let i = 0; i < 46; i++) {
        row += Math.random() < 0.25 ? " " : glyphs[Math.floor(Math.random() * glyphs.length)];
      }
      write('<span class="dim">' + esc(row) + "</span>");
      n++;
      setTimeout(step, 90);
    };
    step();
  },

  LEET() {
    writeLines(["", "1337", "", "Yes. Very good. Everyone is impressed.", ""], "amber");
  },

  NUKE() {
    writeLines([
      "",
      "No.",
      "",
      "This board is a joke about a movie. Go outside.",
      "",
    ], "warn");
  },

  SPOON() { writeLines(["", "There is no spoon.", "There is, however, a garbage file.", ""], "amber"); },
};

// Aliases that read better as typed phrases than as single tokens.
COMMANDS["1337"] = COMMANDS.LEET;
COMMANDS.ELITE = COMMANDS.LEET;
COMMANDS["?"] = COMMANDS.HELP;
COMMANDS.MAN = COMMANDS.HELP;
COMMANDS.ZEROCOOL = COMMANDS.GIBSON;
COMMANDS.CRASH = COMMANDS.GIBSON;
COMMANDS.HACKTHEPLANET = function () { COMMANDS.HACK("PLANET"); };

function runCommand(raw) {
  const line = raw.trim();
  if (!line) return;
  const parts = line.split(/\s+/);
  const cmd = parts[0].toUpperCase();
  const arg = parts.slice(1).join(" ");

  // "FREE JOEY" and "HACK THE PLANET" read better as whole phrases.
  if (COMMANDS[cmd]) { COMMANDS[cmd](arg); return; }

  writeLines([
    `Unrecognized command: ${line}`,
    "Type HELP for a list. Type it correctly this time.",
  ], "warn");
}

/* ---------------- banner ---------------- */

function banner() {
  write(`<span class="amber">` + esc(
`+==========================================================+
|                                                          |
|   F R E E   J O E Y   B B S          established 1995    |
|   "the only board that still cares"                      |
|                                                          |
|   1 node . 28.8k . no ratio . no warez . strong opinions |
|                                                          |
+==========================================================+`) + `</span>`);
  writeLines([
    "",
    "CONNECT 28800/ARQ/V34/LAPM/V42BIS",
    "",
    "Welcome, guest. You are caller number 31,338.",
    "Type HELP to see what this board can do.",
    "",
  ]);
}

/* ---------------- modem audio (opt-in, generated locally) ---------------- */

let audioCtx = null;

function tone(ctx, freqs, start, dur, gain) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(gain, start + 0.01);
  g.gain.setValueAtTime(gain, start + dur - 0.01);
  g.gain.linearRampToValueAtTime(0, start + dur);
  g.connect(ctx.destination);
  freqs.forEach((f) => {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = f;
    o.connect(g);
    o.start(start);
    o.stop(start + dur);
  });
}

function noise(ctx, start, dur, gain) {
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filt = ctx.createBiquadFilter();
  filt.type = "bandpass";
  filt.frequency.value = 1800;
  filt.Q.value = 0.7;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, start);
  g.gain.linearRampToValueAtTime(0, start + dur);
  src.connect(filt); filt.connect(g); g.connect(ctx.destination);
  src.start(start);
  src.stop(start + dur);
}

const DTMF = {
  "1": [697, 1209], "2": [697, 1336], "3": [697, 1477],
  "4": [770, 1209], "5": [770, 1336], "6": [770, 1477],
  "7": [852, 1209], "8": [852, 1336], "9": [852, 1477],
  "0": [941, 1336],
};

function dialUp() {
  const btn = document.getElementById("dial-btn");
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    writeLines(["", "Your browser declined to make modem noises. Probably for the best.", ""], "warn");
    return;
  }
  const ctx = audioCtx;
  if (ctx.state === "suspended") ctx.resume();

  if (btn) { btn.disabled = true; setTimeout(() => { btn.disabled = false; }, 9000); }
  writeLines(["", "ATDT 5551995", ""], "dim");

  let t = ctx.currentTime + 0.1;
  tone(ctx, [350, 440], t, 1.0, 0.06);          // dial tone
  t += 1.15;
  "5551995".split("").forEach((d) => {          // dial the digits
    tone(ctx, DTMF[d], t, 0.09, 0.07);
    t += 0.15;
  });
  t += 0.5;
  tone(ctx, [440], t, 1.0, 0.05); t += 1.2;     // ring
  tone(ctx, [440], t, 1.0, 0.05); t += 1.4;
  tone(ctx, [2100], t, 0.55, 0.05); t += 0.55;  // answer tone
  tone(ctx, [1270, 1070], t, 0.5, 0.04); t += 0.5;
  noise(ctx, t, 1.5, 0.05);                     // the screech
  tone(ctx, [1800, 2250], t, 1.5, 0.03);
  t += 1.6;

  setTimeout(() => {
    writeLines(["CONNECT 28800/ARQ/V34/LAPM/V42BIS", ""], "amber");
  }, (t - ctx.currentTime) * 1000);
}

/* ---------------- wire up ---------------- */

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("bbs-input");
  const dialBtn = document.getElementById("dial-btn");
  if (dialBtn) dialBtn.addEventListener("click", dialUp);
  if (!input) return;

  banner();

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const val = input.value;
      write(`<span class="dim">` + esc("C:\\FREEJOEY> " + val) + `</span>`);
      if (val.trim()) { HISTORY.push(val); histIdx = HISTORY.length; }
      input.value = "";
      runCommand(val);
    } else if (e.key === "ArrowUp") {
      if (histIdx > 0) { histIdx--; input.value = HISTORY[histIdx]; }
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      if (histIdx < HISTORY.length - 1) { histIdx++; input.value = HISTORY[histIdx]; }
      else { histIdx = HISTORY.length; input.value = ""; }
      e.preventDefault();
    }
  });

  // Clicking anywhere in the console focuses the prompt.
  const screen = document.getElementById("bbs-screen");
  if (screen) screen.addEventListener("click", () => {
    if (!window.getSelection().toString()) input.focus();
  });
});
