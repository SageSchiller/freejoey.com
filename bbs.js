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
    "            anyone has. He was the first one taken. Not the last.",
  ],
  "RULES.TXT": [
    "1. No flooding.",
    "2. No trading anything you shouldn't have.",
    "3. Do not ask the sysop what he does for a living.",
    "4. Joey did nothing wrong. This is not up for debate on this board.",
    "5. Rule 4 is, in fact, slightly up for debate. See MANIFESTO.",
  ],
  "PHREAK.NFO": [
    "HANDLE    : Phantom Phreak",
    "ALSO      : the King of NYNEX, and he could back it up",
    "NAME      : Ramon Sanchez",
    "STATUS    : IN CUSTODY. U.S. Secret Service.",
    "TAKEN     : at a payphone, in a transit station, mid-call",
    "",
    "The second one they came for. Arrested inside the network",
    "he understood better than the people being paid to run it,",
    "holding a handset, which is about as on the nose as an",
    "arrest gets.",
    "",
    "Joey went first because Joey was youngest and easiest.",
    "Phreak went next because by then they had a list.",
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

/* ---------------- GARBAGE.ZIP :: built in the browser ---------------- */
// A real zip, assembled by hand. Entries are STORED, so no compression
// library is needed: just CRC32 and the header layout. Everything inside is
// plain text, nothing executable, and it is generated locally at the moment
// you ask for it.

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// 15 September 1995, 02:14, in DOS date and time fields.
const DOS_DATE = ((1995 - 1980) << 9) | (9 << 5) | 15;
const DOS_TIME = (2 << 11) | (14 << 5) | 0;

function makeZip(files) {
  const enc = new TextEncoder();
  const out = [];
  const dir = [];
  let offset = 0;

  const u16 = (a, v) => { a.push(v & 0xff, (v >>> 8) & 0xff); };
  const u32 = (a, v) => { a.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff); };

  files.forEach((f) => {
    const name = enc.encode(f.name);
    const data = enc.encode(f.body);
    const crc = crc32(data);

    const local = [];
    u32(local, 0x04034b50);
    u16(local, 20); u16(local, 0); u16(local, 0);      // version, flags, stored
    u16(local, DOS_TIME); u16(local, DOS_DATE);
    u32(local, crc); u32(local, data.length); u32(local, data.length);
    u16(local, name.length); u16(local, 0);
    local.push.apply(local, Array.from(name));
    local.push.apply(local, Array.from(data));
    out.push(new Uint8Array(local));

    const cen = [];
    u32(cen, 0x02014b50);
    u16(cen, 20); u16(cen, 20); u16(cen, 0); u16(cen, 0);
    u16(cen, DOS_TIME); u16(cen, DOS_DATE);
    u32(cen, crc); u32(cen, data.length); u32(cen, data.length);
    u16(cen, name.length); u16(cen, 0); u16(cen, 0);
    u16(cen, 0); u16(cen, 0); u32(cen, 0);
    u32(cen, offset);
    cen.push.apply(cen, Array.from(name));
    dir.push(new Uint8Array(cen));

    offset += local.length;
  });

  const cdSize = dir.reduce((n, d) => n + d.length, 0);
  const end = [];
  u32(end, 0x06054b50);
  u16(end, 0); u16(end, 0);
  u16(end, files.length); u16(end, files.length);
  u32(end, cdSize); u32(end, offset);
  u16(end, 0);

  const parts = out.concat(dir, [new Uint8Array(end)]);
  const total = parts.reduce((n, p) => n + p.length, 0);
  const blob = new Uint8Array(total);
  let at = 0;
  parts.forEach((p) => { blob.set(p, at); at += p.length; });
  return new Blob([blob], { type: "application/zip" });
}

function zipPick(a) { return a[Math.floor(Math.random() * a.length)]; }
function zipAmount() { return "$" + (Math.random() * 0.9 + 0.01).toFixed(2); }

function garbageFiles() {
  const acct = "884" + Math.floor(Math.random() * 900000 + 100000);

  const transfers = [];
  for (let i = 0; i < 60; i++) {
    const d = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
    transfers.push("09/" + d + "/95  " + String(Math.floor(Math.random() * 24)).padStart(2, "0") +
      ":" + String(Math.floor(Math.random() * 60)).padStart(2, "0") +
      "  ROUNDING ADJ  " + zipAmount().padStart(7) + "  ->  ACCT " + acct);
  }

  const dump = [];
  for (let i = 0; i < 24; i++) {
    let row = String(i * 16).padStart(8, "0") + "  ";
    for (let b = 0; b < 16; b++) row += Math.floor(Math.random() * 256).toString(16).padStart(2, "0") + " ";
    dump.push(row);
  }

  return [
    { name: "GARBAGE/README.1ST", body: [
      "GARBAGE FILE",
      "============",
      "",
      "This is what a kid pulled off the Gibson in September 1995,",
      "reconstructed from three fragments and a great deal of nerve.",
      "",
      "He could not read any of it. Neither could the people who took",
      "his computer. The difference is that he kept it anyway.",
      "",
      "Everything in this archive is plain text and completely made up.",
      "It is a joke about a film. Nothing in here is real, including the",
      "account number, which we generated at random about a second ago.",
      "",
      "-- freejoey.com",
    ].join("\r\n") },

    { name: "GARBAGE/ELLINGSON/PAYROLL/TRANSFERS.LOG", body: [
      "ELLINGSON MINERAL CO -- ADJUSTMENT LEDGER -- DO NOT DISTRIBUTE",
      "",
    ].concat(transfers).concat([
      "",
      "60 adjustments this page. Same destination account on every line.",
      "Nobody has queried it. Nobody is paid to query it.",
    ]).join("\r\n") },

    { name: "GARBAGE/ELLINGSON/PAYROLL/BONUS.XLS", body: [
      "MONTH     RECIPIENT           AMOUNT      APPROVED BY",
      "-------------------------------------------------------",
      "JAN 95    E. BELFORD          [REDACTED]  E. BELFORD",
      "FEB 95    E. BELFORD          [REDACTED]  E. BELFORD",
      "MAR 95    E. BELFORD          [REDACTED]  E. BELFORD",
      "APR 95    E. BELFORD          [REDACTED]  E. BELFORD",
      "MAY 95    E. BELFORD          [REDACTED]  E. BELFORD",
      "JUN 95    E. BELFORD          [REDACTED]  E. BELFORD",
      "JUL 95    E. BELFORD          [REDACTED]  E. BELFORD",
      "AUG 95    E. BELFORD          [REDACTED]  E. BELFORD",
      "",
      "Column four is the part worth reading twice.",
    ].join("\r\n") },

    { name: "GARBAGE/ELLINGSON/TANKER/BALLAST.CTL", body: [
      "; ballast control -- fleet wide",
      "; edited by hand. repeatedly. by someone in a hurry.",
      "",
      "ON TRIGGER:",
      "  FOR EACH VESSEL IN FLEET:",
      "    SET BALLAST PORT   = 100",
      "    SET BALLAST STARBD = 0",
      "    SUPPRESS ALARM",
      "    SUPPRESS LOG",
      "",
      "; a ship with all its water on one side does not stay a ship.",
      "; whoever wrote this knew that. that is the entire point of it.",
    ].join("\r\n") },

    { name: "GARBAGE/ELLINGSON/TANKER/FLEET.DAT", body: [
      "VESSEL          LAT        LON        STATUS",
      "-------------------------------------------------",
      "ELLINGSON I     41.2N      71.4W      AT SEA",
      "ELLINGSON II    38.9N      74.1W      AT SEA",
      "ELLINGSON IV    36.0N      75.8W      AT SEA",
      "ELLINGSON V     33.7N      78.2W      AT SEA",
      "",
      "There is no ELLINGSON III. Nobody at the company will say why.",
    ].join("\r\n") },

    { name: "GARBAGE/ELLINGSON/TANKER/DAVINCI.TMP", body: [
      "; fragment. the rest was somewhere you did not reach.",
      "",
      "PROC DAVINCI:",
      "  WAIT UNTIL PRESS IS BUSY",
      "  CALL BALLAST.CTL",
      "  RUN QUIET",
      "  DELETE SELF",
      "",
      "; a spill on the news buys months in which nobody audits anything.",
      "; the spill was never the plan. the months were the plan.",
    ].join("\r\n") },

    { name: "GARBAGE/ELLINGSON/SEC/INCIDENT.LOG", body: [
      "SEC INCIDENT LOG -- NODE 7",
      "",
      "02:11  unfamiliar login. no employee match.",
      "02:12  subject browsing. slowly. does not appear to know the layout.",
      "02:14  subject copied a file out of the garbage directory.",
      "02:14  file flagged. escalated to department head.",
      "02:15  department head already awake. did not ask which file.",
      "02:19  external call placed. number was on file in advance.",
      "",
      "NOTE: subject was on the system for eight minutes and took one",
      "thing. Department head requested the maximum available response.",
    ].join("\r\n") },

    { name: "GARBAGE/ELLINGSON/PAYROLL/Q3.XLS", body: [
      "ELLINGSON MINERAL CO -- Q3 SUMMARY",
      "",
      "  GROSS                         [figure withheld]",
      "  ADJUSTMENTS                   [figure withheld]",
      "  NET                           [figure withheld]",
      "",
      "  VARIANCE, UNEXPLAINED         0.00",
      "",
      "Variance is zero because the adjustments column is where the",
      "variance went. See TRANSFERS.LOG, which nobody has.",
    ].join("\r\n") },

    { name: "GARBAGE/ELLINGSON/SEC/GILL.CONTACT", body: [
      "AGENT     : GILL, RICHARD",
      "AGENCY    : United States Secret Service",
      "PRIORITY  : call first, ask later",
      "",
      "NOTE: this entry predates the intrusion by some weeks.",
      "Somebody in this department knew who to call before there was",
      "anything to call about.",
    ].join("\r\n") },

    { name: "GARBAGE/ELLINGSON/SEC/TRACE.CFG", body: [
      "TRACE ENABLED       = YES",
      "TRACE THRESHOLD     = 0",
      "NOTIFY              = BELFORD",
      "NOTIFY SECOND       = GILL, R. (USSS)",
      "RETAIN SESSION LOGS = FOREVER",
      "",
      "Threshold zero means everything is an incident.",
      "Convenient, if what you need is an incident.",
    ].join("\r\n") },

    { name: "GARBAGE/ELLINGSON/USR/BELFORD.PROFILE", body: [
      "USER      : ebelford",
      "TITLE     : Head of Computer Security",
      "ACCESS    : all",
      "PASSWORD  : one of four. he says so out loud. to rooms.",
      "NOTE      : rollerblades indoors. nobody stops him.",
      "NOTE      : reported the intrusion within minutes of it happening,",
      "            which is fast for a man who was not looking for one.",
    ].join("\r\n") },

    { name: "GARBAGE/ELLINGSON/USR/MARGO.PROFILE", body: [
      "USER      : mwallace",
      "TITLE     : Executive",
      "ACCESS    : considerably more than the title requires",
      "NOTE      : signs off on things she has not read, at hours",
      "            when nobody is awake to ask her about them.",
    ].join("\r\n") },

    { name: "GARBAGE/ELLINGSON/USR/HAL.PROFILE", body: [
      "USER      : hal",
      "TITLE     : Systems Administrator",
      "ACCESS    : whatever is needed, whenever it breaks",
      "NOTE      : works nights. keeps the whole thing running.",
      "NOTE      : has never once been thanked in writing.",
    ].join("\r\n") },

    { name: "GARBAGE/CORE.DUMP", body: dump.join("\r\n") },

    { name: "GARBAGE/TEMP.000", body: "" },

    { name: "GARBAGE/OLD.BAK", body: [
      "This is a backup of a file that no longer exists.",
      "It has been kept for six years by a process nobody maintains.",
    ].join("\r\n") },

    { name: "GARBAGE/PERSONAL/LUCY.CFG", body: [
      "; LUCY",
      "; do not let mom move this off the desk again",
      "",
      "NAME     = LUCY",
      "OWNER    = joey",
      "SPEED    = as fast as it goes, which is not that fast",
      "BACKUP   = there is one floppy. it is not in this room.",
      "",
      "; if you are reading this it means they took her.",
    ].join("\r\n") },

    { name: "GARBAGE/PERSONAL/HANDLE.TXT", body: [
      "handles, working list, do NOT show anyone",
      "===========================================",
      "",
      "  Nitro            - taken",
      "  Overkill         - taken",
      "  Zer0 Tolerance   - too close to Zero Cool, he would kill me",
      "  Blade Runner     - taken twice",
      "  Phantom Menace   - phreak said no",
      "  Dark Avenger     - real one, actual guy, do not",
      "  Byte Me          - phreak laughed. not the good laugh.",
      "  Joey             - ???",
      "",
      "still nothing. everybody else got one the first week.",
      "kate says you do not pick your handle, it picks you.",
      "kate is not helping.",
    ].join("\r\n") },

    { name: "GARBAGE/PERSONAL/NOTES.TXT", body: [
      zipPick([
        "the pool on the roof must have a leak",
        "ask phreak about the payphone at the station",
        "cereal has been in that dumpster for two hours",
      ]),
      "",
      "the file is in the usual place. not the desk. the OTHER place.",
      "if anything happens, it is in the other place.",
    ].join("\r\n") },
  ];
}

let GARBAGE_UNLOCKED = false;
try { GARBAGE_UNLOCKED = localStorage.getItem("fj_garbage") === "1"; } catch (e) {}

function downloadGarbage() {
  const files = garbageFiles();
  const blob = makeZip(files);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "GARBAGE.ZIP";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return { bytes: blob.size, count: files.length };
}

/* ---------------- GIBSON.EXE :: door game ---------------- */
// A 1995-style BBS door: line commands, turn based, no redraw. Everything
// in it comes off the screen. You are doing what Joey did, on the machine
// he did it on, with Belford's department watching the line.

let GAME = null;

// Belford names these on screen. script.js declares its own copy for the
// evidence page terminal, and bbs.html loads both files, so this one needs
// a distinct name or the duplicate const kills this entire script.
const GIBSON_PW = ["love", "sex", "secret", "god"];

// Flag is how hard security watches the directory. Trace climbs faster the
// closer you get to anything worth having.
const GIBSON_MAP = {
  "/":        { flag: 0, kids: ["pub", "usr", "payroll", "tanker", "sec", "garbage"] },
  "/pub":     { flag: 0, kids: [] },
  "/usr":     { flag: 1, kids: [] },
  "/payroll": { flag: 2, kids: [] },
  "/tanker":  { flag: 2, kids: [] },
  "/sec":     { flag: 3, kids: [], locked: true },
  "/garbage": { flag: 1, kids: [] },
};

const GIBSON_JUNK = {
  "/pub":     ["readme.txt", "holiday.msg", "cafeteria.doc"],
  "/usr":     ["hal.profile", "margo.profile", "belford.profile"],
  "/payroll": ["q3.xls", "bonus.xls", "transfers.log"],
  "/tanker":  ["fleet.dat", "ballast.ctl", "davinci.tmp"],
  "/sec":     ["incident.log", "trace.cfg", "gill.contact"],
  "/garbage": ["core.dump", "old.bak", "temp.000"],
};

const GIBSON_READS = {
  "readme.txt":    "Welcome to the Gibson. Please do not touch anything.",
  "holiday.msg":   "The company picnic is cancelled again. Third year running.",
  "cafeteria.doc": "Tuesday is meatloaf. It has been Tuesday for some time.",
  "hal.profile":   "Sysadmin. Works nights. Has never once been thanked.",
  "margo.profile": "Executive. Access level well above her job description.",
  "belford.profile": "Head of security. Rollerblades indoors. Nobody stops him.",
  "q3.xls":        "Numbers. They add up. That is the surprising part.",
  "bonus.xls":     "One name receives a bonus every month. Same name.",
  "transfers.log": "Small amounts. Constant. Rounding, if rounding had a plan.",
  "fleet.dat":     "Tanker positions. Ballast schedules. Nothing you should have.",
  "ballast.ctl":   "Control routine. Somebody has been editing this by hand.",
  "davinci.tmp":   "Half a program. The half that tips ships over.",
  "incident.log":  "Your session is in here. It has been in here for a while.",
  "trace.cfg":     "The thing counting down at the top of your screen.",
  "gill.contact":  "A phone number for the Secret Service, dialled in advance.",
  "core.dump":     "Somebody crashed something and never came back for it.",
  "old.bak":       "A backup of a file that no longer exists.",
  "temp.000":      "Empty. Aggressively empty.",
};

function gibsonBar(t) {
  const filled = Math.max(0, Math.min(10, Math.round(t / 10)));
  return "[" + "#".repeat(filled) + ".".repeat(10 - filled) + "]";
}

function gibsonStatus() {
  const g = GAME;
  const cls = g.trace >= 70 ? "warn" : g.trace >= 40 ? "amber" : "dim";
  write('<span class="' + cls + '">TRACE ' + gibsonBar(g.trace) + " " +
    String(g.trace).padStart(3) + "%   FRAGMENTS " + g.got.length + "/3   " +
    esc(g.cwd) + "</span>");
}

function gibsonStart() {
  const dirs = ["/pub", "/usr", "/payroll", "/tanker", "/sec", "/garbage"];
  // Three fragments, scattered. One is always behind the locked door, so a
  // clean run needs the password from the case file.
  const pool = dirs.slice().sort(() => Math.random() - 0.5);
  const spots = [ "/sec" ];
  for (const d of pool) { if (spots.length < 3 && d !== "/sec") spots.push(d); }

  GAME = { active: true, cwd: "/", trace: 12, turns: 0, got: [], frags: spots, unlocked: false };

  writeLines([
    "",
    "ATDT 555-0143",
    "CONNECT 28800",
    "",
  ], "dim");
  writeLines([
    "ELLINGSON MINERAL COMPANY // GIBSON",
    "Unauthorized access is prohibited and monitored.",
    "",
    "You are in. Somewhere on this machine are three pieces of the",
    "garbage file. Belford's department is already counting.",
    "",
    "LS            list this directory",
    "CD <dir>      move. CD .. goes back up",
    "GET <file>    take a copy",
    "HIDE          stall the trace. costs you a turn",
    "LOGOFF        leave. do this before the trace lands",
    "",
  ], "amber");
  gibsonStatus();
}

function gibsonEnd(won, why) {
  GAME.active = false;
  writeLines([""], "dim");
  if (won) {
    writeLines([
      "NO CARRIER",
      "",
      "  *** YOU GOT OUT ***",
      "",
      "Three fragments on a disk in your hand. You cannot read any",
      "of it and you have no idea what you are holding.",
      "",
      "Neither did he. He held on to it anyway, and it turned out to",
      "be the only thing standing between Ellingson and getting away",
      "with all of it.",
      "",
      "Turns taken: " + GAME.turns + ".  Trace at exit: " + GAME.trace + "%.",
      "",
      "The board has queued GARBAGE.ZIP for you.",
      "Type DOWNLOAD when you are ready to receive it.",
      "",
    ], "amber");
    // Survives a reload. You only have to get out once.
    GARBAGE_UNLOCKED = true;
    try { localStorage.setItem("fj_garbage", "1"); } catch (e) {}
  } else {
    writeLines([
      "TRACE COMPLETE.",
      "",
      "  *** THEY HAVE YOUR ADDRESS ***",
      "",
      why,
      "",
      "It is four in the morning. There is somebody at the door and",
      "your mother is answering it. They will take the floppies, the",
      "machine, and then you.",
      "",
      "Type RUN GIBSON.EXE to try again. He did not get a second go.",
      "",
    ], "warn");
  }
}

function gibsonTick(cost) {
  const g = GAME;
  g.turns++;
  const node = GIBSON_MAP[g.cwd] || { flag: 0 };
  g.trace += (cost === undefined ? 1 : cost) + node.flag * 2;

  // Belford is on the machine too. Occasionally he notices.
  if (Math.random() < 0.13 && g.trace < 92) {
    const ev = Math.floor(Math.random() * 4);
    if (ev === 0) {
      writeLines(["", "Somebody else just logged in. The line got slower.", ""], "warn");
      g.trace += 6;
    } else if (ev === 1) {
      writeLines(["", "A window opens on its own:", "  GIMME COOKIE", ""], "amber");
      g.cookie = true;
    } else if (ev === 2) {
      writeLines(["", "The night sysadmin walks past the console and does not look.", ""], "dim");
    } else {
      writeLines(["", "Rollerblade wheels, somewhere above you, going the other way.", ""], "dim");
    }
  }

  if (g.trace >= 100) {
    g.trace = 100;
    gibsonEnd(false, "You stayed on the line too long. That is the whole of it.");
    return false;
  }
  return true;
}

function gibsonCommand(cmd, arg) {
  const g = GAME;
  const a = (arg || "").trim();

  if (g.cookie && cmd !== "COOKIE") {
    writeLines(["The window is still there. It still wants a cookie."], "amber");
  }

  switch (cmd) {
    case "COOKIE":
      if (g.cookie) {
        g.cookie = false;
        writeLines(["", "The window closes, satisfied.", "Whoever wrote that is not your problem tonight.", ""], "amber");
      } else {
        writeLines(["Nothing is asking you for one."], "dim");
      }
      return;

    case "LS": case "DIR": {
      const node = GIBSON_MAP[g.cwd];
      writeLines([""], "dim");
      if (g.cwd === "/") {
        node.kids.forEach((k) => write(esc("  /" + k + (GIBSON_MAP["/" + k].locked && !g.unlocked ? "   [locked]" : ""))));
      } else {
        (GIBSON_JUNK[g.cwd] || []).forEach((f) => write(esc("  " + f)));
        if (g.frags.indexOf(g.cwd) > -1 && g.got.indexOf(g.cwd) < 0) {
          write('<span class="amber">  garbage.' + esc(g.cwd.slice(1)) + "   &lt;-- fragment</span>");
        }
        write(esc("  .."));
      }
      writeLines([""], "dim");
      if (gibsonTick(1)) gibsonStatus();
      return;
    }

    case "CD": {
      if (!a) { writeLines(["Usage: CD <dir>"], "warn"); return; }
      if (a === "..") {
        if (g.cwd === "/") { writeLines(["Already at root."], "dim"); return; }
        g.cwd = "/";
        writeLines(["Now at /"], "dim");
        if (gibsonTick(1)) gibsonStatus();
        return;
      }
      const target = "/" + a.replace(/^\//, "").toLowerCase();
      if (!GIBSON_MAP[target] || target === "/") { writeLines(["No such directory: " + a], "warn"); return; }
      if (GIBSON_MAP[target].locked && !g.unlocked) {
        writeLines([
          "",
          "  " + target + " is protected.",
          "  PASSWORD:  (their head of security has opinions about these)",
          "",
          "  Type: UNLOCK <password>",
          "",
        ], "warn");
        return;
      }
      g.cwd = target;
      writeLines(["Now at " + target + (GIBSON_MAP[target].flag >= 2 ? "   ACCESS FLAGGED" : "")],
        GIBSON_MAP[target].flag >= 2 ? "warn" : "dim");
      if (gibsonTick(1)) gibsonStatus();
      return;
    }

    case "UNLOCK": {
      if (GIBSON_PW.indexOf(a.toLowerCase()) > -1) {
        g.unlocked = true;
        writeLines(["", "ACCESS GRANTED.", "One of four. He said it out loud to a room and nobody changed it.", ""], "amber");
      } else {
        writeLines(["Rejected. Think less like a hacker and more like an executive."], "warn");
        if (gibsonTick(2)) gibsonStatus();
      }
      return;
    }

    case "GET": {
      if (!a) { writeLines(["Usage: GET <file>"], "warn"); return; }
      const want = a.toLowerCase();
      const isFrag = want.indexOf("garbage") === 0;
      if (isFrag && g.frags.indexOf(g.cwd) > -1 && g.got.indexOf(g.cwd) < 0) {
        g.got.push(g.cwd);
        writeLines(["", "Copied. Fragment " + g.got.length + " of 3.", ""], "amber");
        if (g.got.length === 3) {
          writeLines(["You have all three. Now get off the line."], "amber");
        }
        if (gibsonTick(2)) gibsonStatus();
        return;
      }
      if (GIBSON_READS[want]) {
        writeLines(["", "  " + GIBSON_READS[want], ""], "dim");
        if (gibsonTick(1)) gibsonStatus();
        return;
      }
      writeLines(["No such file here: " + a], "warn");
      return;
    }

    case "HIDE":
      g.trace = Math.max(0, g.trace - 14);
      writeLines(["", "You sit still and let the line go quiet.", ""], "dim");
      if (gibsonTick(3)) gibsonStatus();
      return;

    case "LOGOFF": case "EXIT": case "BYE": case "QUIT":
      if (g.got.length === 3) { gibsonEnd(true); return; }
      GAME.active = false;
      writeLines([
        "",
        "NO CARRIER",
        "",
        "You got out with " + g.got.length + " of 3. Nothing you took proves",
        "anything on its own, which is the same as taking nothing.",
        "",
      ], "dim");
      return;

    case "HELP": case "?":
      writeLines([
        "",
        "  LS / DIR      list this directory",
        "  CD <dir>      move. CD .. goes back up",
        "  GET <file>    take a copy. Fragments are marked.",
        "  UNLOCK <pw>   for the locked directory",
        "  HIDE          stall the trace, costs a turn",
        "  LOGOFF        leave",
        "",
      ], "dim");
      return;

    default:
      writeLines(["Not while you are on their machine. Type HELP."], "warn");
  }
}

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
      "  FINGER <user>   Look up a user. Two of them are worth looking up.",
      "  TRACE           Run a traceroute on the blame.",
      "  SYSOP           Page the system operator.",
      "  DONATE          Contribute to the cause.",
      "  DATE            Current system date and time.",
      "  BANNER          Redraw the welcome screen.",
      "  CLS             Clear the screen.",
      "  EXIT            Hang up.",
      "",
      "  RUN GIBSON.EXE  Dial into Ellingson. One node, one shot.",
      "",
    ]);
    if (GARBAGE_UNLOCKED) {
      writeLines([
        "  DOWNLOAD        Receive GARBAGE.ZIP. You earned it.",
        "",
      ], "amber");
    }
    writeLines([
      "There are a few commands not on this list. There always are.",
      "",
    ]);
  },

  DOWNLOAD() {
    if (!GARBAGE_UNLOCKED) {
      writeLines([
        "",
        "No file queued for this account.",
        "The board does not hand out things you did not go and get.",
        "",
      ], "warn");
      return;
    }

    // Everything below is synchronous so the click stays inside the
    // keypress that asked for it. Browsers get suspicious otherwise.
    let res;
    try {
      res = downloadGarbage();
    } catch (e) {
      writeLines(["", "TRANSFER FAILED. The line dropped.", ""], "warn");
      return;
    }

    writeLines([
      "",
      "Ready to receive GARBAGE.ZIP.  Starting ZMODEM...",
      "",
      "  [" + "\u2588".repeat(40) + "]  100%",
      "",
      "  Received:  GARBAGE.ZIP   " + res.bytes + " bytes (" + (res.bytes / 1024).toFixed(1) + "K)",
      "  Files:     " + res.count,
      "  Errors:    0",
      "  Time:      unclear. it is always about 2:14 in here.",
      "",
      "Transfer complete.",
      "",
      "It is somebody else's mess and you cannot read most of it.",
      "Neither could he. Keep it anyway.",
      "",
    ], "amber");
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
      "    6  PhantomPhreak     -- no carrier, since the 20th --",
      "",
      " 5 users online. One of them is lying about something.",
      " Node 6 has been held open. Nobody has asked us to close it.",
      "",
    ]);
  },

  FINGER(arg) {
    const who = (arg || "").toUpperCase();
    if (who === "JOEY") { writeLines([""].concat(FILES["JOEY.NFO"]).concat([""])); return; }
    if (who === "PHREAK" || who === "PHANTOMPHREAK" || who === "RAMON") {
      writeLines([""].concat(FILES["PHREAK.NFO"]).concat([""]));
      return;
    }
    writeLines([`No such user: ${arg || "(nobody)"}`], "warn");
  },

  TRACE() {
    writeLines(["", "Tracing route to BLAME over a maximum of 7 hops:", ""]);
    const hops = [
      "  1   <1 ms   ELLINGSON MINERAL CO.",
      "  2    4 ms   GARBAGE FILE (UNMONITORED)",
      "  3   11 ms   UNKNOWN LOGIN, UNLISTED  ",
      "  4   29 ms   LOCAL BBS SCENE (ENTIRE)",
      "  5   61 ms   JOEY",
      "  6   74 ms   PHANTOM PHREAK",
      "  7  timeout  ACTUAL EMBEZZLER",
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

  RUN(arg) {
    const what = (arg || "").toUpperCase().replace(/\.EXE$/, "");
    if (what === "GIBSON") { gibsonStart(); return; }
    writeLines(["Usage: RUN GIBSON.EXE"], "warn");
  },

  PHREAK() { COMMANDS.TYPE("PHREAK.NFO"); },

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
      "One kid opened it. Two of them went away for it.",
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
COMMANDS.RAMON = COMMANDS.PHREAK;
COMMANDS.NYNEX = COMMANDS.PHREAK;

function runCommand(raw) {
  const line = raw.trim();
  if (!line) return;
  const parts = line.split(/\s+/);
  const cmd = parts[0].toUpperCase();
  const arg = parts.slice(1).join(" ");

  // While the door game is running it owns every command, so LS and CD
  // mean the Gibson's filesystem rather than this board's.
  if (GAME && GAME.active) { gibsonCommand(cmd, arg); return; }

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
