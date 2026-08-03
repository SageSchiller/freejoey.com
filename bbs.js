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

// Same as writeLines, but turns citations into working links. The pattern is
// an explicit allowlist of exact URLs rather than anything resembling a URL
// matcher: it runs over already-escaped text, and none of these contain a
// character esc() rewrites, so nothing can be smuggled through it.
// textfiles.com serves no TLS at all, so its entry is http on purpose. A top
// level cross origin navigation is not mixed content and is not upgraded by
// the upgrade-insecure-requests directive, so the link works as written.
const CITED_URL = /(?:https:\/\/(?:phrack\.org\/issues\/\d+\/\d+|www\.eff\.org)|http:\/\/(?:textfiles\.com|www\.catb\.org\/jargon\/))/g;

function writeCited(lines, cls) {
  const open = cls ? `<span class="${cls}">` : "";
  const close = cls ? "</span>" : "";
  const body = lines.map(esc).join("\n").replace(CITED_URL, (u) =>
    `<a class="ext" href="${u}" target="_blank" rel="noopener noreferrer">${u}</a>`);
  write(open + body + close);
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
    "",
    "Boards like this one did not get archived. The sysop went to",
    "college, the line got cancelled, and everything anybody ever",
    "typed on it went with it. Somebody went and saved what was",
    "left of the rest: http://textfiles.com",
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
    "",
    "------------------------------------------------------------",
    "",
    "There is a real one, and it is not a joke.",
    "",
    "In 1990 federal agents seized the computers of people who had",
    "not done anything. One of them was a games publisher who lost",
    "his business for months over a manuscript. The people it",
    "happened to went and founded an organisation to make sure",
    "somebody turned up next time, because nobody had turned up",
    "for them.",
    "",
    "  https://www.eff.org",
    "",
    "That fund has a balance. This one does not.",
  ],
  "BOOKS.TXT": [
    "THE COLOUR BOOKS",
    "================",
    "",
    "Two completely different traditions, both named after their",
    "covers, permanently confused for one another. This board would",
    "like to clear that up and will probably fail.",
    "",
    "",
    "THE RAINBOW SERIES",
    "------------------",
    "Real United States government publications, issued by the",
    "Department of Defense and the National Computer Security",
    "Center through the eighties. Named for the colour of the cover",
    "because nobody was ever going to remember the document",
    "numbers. They were free if you wrote in and asked for them.",
    "",
    "  ORANGE BOOK    Trusted Computer System Evaluation Criteria.",
    "                 DoD 5200.28-STD, 1985. The famous one. It",
    "                 defines the ratings, D through A1, and it is",
    "                 the reason anybody has ever said the words",
    "                 \"C2 compliant\" out loud in a meeting.",
    "",
    "  RED BOOK       The Trusted Network Interpretation, 1987.",
    "                 The Orange Book applied to networks, which",
    "                 turned out to be very much harder than",
    "                 applying it to one machine in one room.",
    "",
    "  GREEN BOOK     The Password Management Guideline, 1985. An",
    "                 entire government standard about choosing a",
    "                 password. Ellingson's head of security has",
    "                 evidently not read it. Neither has anybody",
    "                 else. See the terminal on the EVIDENCE page.",
    "",
    "There are dozens more, in colours the printer clearly selected",
    "under duress.",
    "",
    "",
    "THE ONES NAMED AFTER THEIR COVERS",
    "---------------------------------",
    "Not government anything. Textbooks that picked up nicknames",
    "from the picture on the front, and the nickname stuck harder",
    "than the actual title ever did.",
    "",
    "  DRAGON BOOK    Compilers: Principles, Techniques and Tools.",
    "                 Aho, Sethi and Ullman. A knight with a sword",
    "                 marked LALR PARSER GENERATOR, fighting a",
    "                 dragon marked COMPLEXITY OF COMPILER DESIGN.",
    "                 Editions are told apart by the colour of the",
    "                 dragon.",
    "",
    "  DEVIL BOOK     The Design and Implementation of the 4.3BSD",
    "                 UNIX Operating System. The thing on the cover",
    "                 is the BSD daemon, which is a pun about the",
    "                 sort of program that waits in the background",
    "                 and is not a theological position.",
    "",
    "  PINK-SHIRT     The Peter Norton Programmer's Guide to the",
    "  BOOK           IBM PC. Norton on the front, arms folded,",
    "                 sleeves rolled up, in a pink shirt. The book",
    "                 is genuinely excellent. Nobody alive has ever",
    "                 called it by its title.",
    "",
    "Also in circulation: the WIZARD BOOK (Abelson and Sussman),",
    "the CAMEL BOOK (Perl), the CINDERELLA BOOK (operating",
    "systems), and the WHITE BOOK, which is Kernighan and Ritchie",
    "and never needed a picture at all.",
  ],
  "LODMOD.NFO": [
    "THE WAR",
    "=======",
    "",
    "Before any of this, two crews spent about two years taking",
    "each other apart. It is worth knowing about, because one of",
    "them was from here.",
    "",
    "LEGION OF DOOM. Started 1984. National, loose, and by the end",
    "of the decade the most written about crew in the country. The",
    "Mentor was one of them, which is why PHRACK.TXT reads the way",
    "it does.",
    "",
    "MASTERS OF DECEPTION. Started 1989, New York, and the name is",
    "a straight shot at the other lot. Phiber Optik had been in",
    "LOD and then was not. He and Acid Phreak built MOD out of kids",
    "who knew the New York switches better than the people being",
    "paid to run them.",
    "",
    "That is the part worth saying twice. MOD were NYNEX kids. They",
    "lived inside the same network Phreak calls his own, and they",
    "were better at it than anybody was comfortable with.",
    "",
    "What the war actually consisted of: lines cut, each other's",
    "machines taken, conference calls hijacked, and an enormous",
    "amount of shouting. Some of it was funny. Some of it was two",
    "teenagers disconnecting a man's home telephone for a month.",
    "",
    "How it ended: a federal grand jury in Manhattan, July 1992.",
    "The war stopped being a war the moment it became an exhibit.",
    "Phiber Optik got a year and a day.",
    "",
    "NOBODY WON. That is not a moral, it is the outcome. Both crews",
    "ended up in front of the same kind of judge a couple of years",
    "apart. Being on the winning side of the feud turned out not to",
    "be a category that existed.",
    "",
    "Somebody wrote a whole book about it while it was still going",
    "on. Ask an adult who was there. They will have opinions and",
    "about half of them will be wrong.",
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
    "",
    "The real one is four paragraphs long, was written a week after",
    "its author was arrested, and has outlived every system it was",
    "typed on. Read that instead of this.",
    "",
    "  https://phrack.org/issues/7/3",
    "",
    "There is a newer one. This board should not have it.",
  ],
  "SJG.NFO": [
    "THE RAID THAT WAS NOT ABOUT A GAME",
    "==================================",
    "",
    "1 March 1990. Austin, Texas.",
    "",
    "The Secret Service went through the offices of Steve Jackson",
    "Games and took the computers. Jackson published board games",
    "and role playing games. He was not a suspect. He was never",
    "charged with anything at all.",
    "",
    "What they were interested in was a manuscript. GURPS",
    "Cyberpunk, a rulebook for a game about hackers, written by",
    "Loyd Blankenship, who you have already met in PHRACK.TXT. It",
    "was described publicly as a handbook for computer crime. It",
    "was a book of dice tables.",
    "",
    "They also took the company's bulletin board, and with it every",
    "private message on it, belonging to people who had nothing to",
    "do with any of it.",
    "",
    "The equipment came back months later. Some was damaged and",
    "some of the data was gone. The company nearly folded and laid",
    "off half its staff to survive the year.",
    "",
    "NO CHARGES WERE EVER FILED.",
    "",
    "Jackson sued and Jackson won. The court found the seizure",
    "broke the law protecting publishers and the law protecting",
    "stored mail. It is one of the reasons the Electronic Frontier",
    "Foundation exists. See LEGAL.TXT.",
    "",
    "NOTE FOR THE FILE: read the first four lines of this file",
    "again, then read LOG 002 on the EVIDENCE page.",
  ],
  "414S.NFO": [
    "THE 414s",
    "========",
    "",
    "1983. Milwaukee. Named after their own area code, because",
    "they were not trying especially hard to be mysterious.",
    "",
    "Six of them, the youngest sixteen. Cheap home computers,",
    "ordinary modems, and default passwords nobody had ever",
    "changed. They got into something like sixty systems.",
    "",
    "It was the list that caused the trouble: Los Alamos National",
    "Laboratory. Sloan-Kettering, the cancer hospital. A bank.",
    "",
    "At Sloan-Kettering they deleted billing records by accident",
    "while tidying up after themselves. Nobody was harmed. It was",
    "still a hospital.",
    "",
    "One of them ended up on the cover of a national magazine and",
    "then in front of a Congressional committee, aged seventeen,",
    "being asked what ought to be done about people like him.",
    "",
    "WHAT HAPPENED TO THEM: very little. Two pleaded to",
    "misdemeanours. Five hundred dollars each.",
    "",
    "WHAT HAPPENED NEXT: Congress wrote the Computer Fraud and",
    "Abuse Act.",
    "",
    "NOTE FOR THE FILE: the kids got a fine and a magazine cover.",
    "The law they caused is the one being used on the subject of",
    "this case. That is the entire shape of it, and it took about",
    "three years.",
  ],
  "CUCKOO.NFO": [
    "SEVENTY FIVE CENTS",
    "==================",
    "",
    "1986. Lawrence Berkeley Laboratory, California.",
    "",
    "Clifford Stoll was an astronomer who had been handed the",
    "computers when his grant ran out. He was asked to account for",
    "a seventy five cent discrepancy in the billing for machine",
    "time.",
    "",
    "Most people would have written it off. It was seventy five",
    "cents.",
    "",
    "The reason the books did not balance was that somebody was on",
    "the system who had not paid for it. That person was in West",
    "Germany. That person was going through Berkeley and into",
    "military networks. That person was selling what he found to",
    "the KGB.",
    "",
    "It took about a year, a line printer wired to the connection",
    "so that every keystroke came out on paper, and a set of",
    "invented documents left where they would be found and then",
    "watched.",
    "",
    "NOTE FOR THE FILE: nobody was looking for espionage. One",
    "person declined to round a number off. Compare the ledger in",
    "the garbage file, where every single line is under a dollar",
    "and not one of them has ever been queried.",
  ],
  "MORRIS.NFO": [
    "THE WORM",
    "========",
    "",
    "2 November 1988.",
    "",
    "A graduate student released a program that copied itself from",
    "machine to machine across the network. It used a debug feature",
    "left switched on in the mail software, a buffer it could",
    "overflow in another service, and a list of the passwords",
    "people were actually using.",
    "",
    "It was not written to destroy anything and it deleted nothing.",
    "It had one flaw: it reinfected machines it had already taken,",
    "again and again, until they could do nothing else.",
    "",
    "Roughly six thousand machines. Somewhere near a tenth of the",
    "entire network as it then was.",
    "",
    "First felony conviction under the Computer Fraud and Abuse",
    "Act. Probation, community service and a fine.",
    "",
    "His father was a chief scientist at the National Computer",
    "Security Center, which is the outfit that publishes the Orange",
    "Book. See BOOKS.TXT.",
    "",
    "It is also the reason CERT exists.",
    "",
    "NOTE FOR THE FILE: a worm written with no intent to harm still",
    "took down a tenth of the network by accident. See JARGON WORM.",
    "Then consider that the one in the garbage file was written on",
    "purpose, by an adult, to move money.",
  ],
  "BLUEBOX.NFO": [
    "THE WHISTLE AND THE BOX",
    "=======================",
    "",
    "The telephone network used to signal in the same channel it",
    "carried your voice in. Whatever the switches said to one",
    "another you could hear, and whatever you could hear you could",
    "imitate.",
    "",
    "JOE ENGRESSIA was blind from birth and had perfect pitch. As a",
    "small child he worked out that whistling one particular note",
    "into a telephone made it do something. He was about seven. He",
    "told the phone company what he was doing more than once before",
    "anybody there understood him.",
    "",
    "The note was 2600 Hz.",
    "",
    "A bosun whistle packed into boxes of Cap'n Crunch produced the",
    "same tone with one hole covered, which is where JOHN DRAPER",
    "got the handle Captain Crunch.",
    "",
    "A blue box generated the whole signalling set rather than the",
    "single tone, and could route a call anywhere at all.",
    "",
    "A magazine article in 1971 explained the entire thing to the",
    "general public. Two of its readers in California built and",
    "sold boxes for a while before moving into other work. You have",
    "heard of the company they started.",
    "",
    "It is all gone now. The signalling moved onto its own channel,",
    "where the person on the call cannot reach it.",
    "",
    "See JARGON BLUE BOX. Then type 2600.",
  ],
  "CCC.NFO": [
    "CHAOS COMPUTER CLUB",
    "===================",
    "",
    "Founded 1981 in Berlin, and still running, which makes it",
    "older and considerably more durable than most of the",
    "organisations it has embarrassed.",
    "",
    "In 1984 they found a flaw in Bildschirmtext, the German post",
    "office's online service, which the post office had publicly",
    "insisted was secure. They used it to move a hundred and thirty",
    "four thousand marks out of a Hamburg bank overnight.",
    "",
    "Then they gave all of it back the next morning and held a",
    "press conference.",
    "",
    "That is the part worth understanding. The money was never the",
    "point. The point was that a flaw cannot be denied once there",
    "is a number attached to it and a room full of journalists",
    "holding the number.",
    "",
    "They run a congress every year between Christmas and New Year,",
    "and they added a line to the hacker ethic that the American",
    "version never had: make public data available, and protect",
    "private data.",
    "",
    "NOTE FOR THE FILE: Ellingson's head of security found a flaw",
    "in his own company and did not hold a press conference.",
  ],
  "CDC.NFO": [
    "CULT OF THE DEAD COW",
    "====================",
    "",
    "Founded 1984 in Lubbock, Texas, in a disused slaughterhouse,",
    "which is the sort of detail that sounds invented and is not.",
    "",
    "What they actually did, for years, was write. They published",
    "text files, monthly, numbered, and they treated the form as",
    "something worth being good at. Most groups put out phone",
    "numbers and bragging. Theirs were funny on purpose, and some",
    "of them were genuinely strange.",
    "",
    "If you have ever read something on a board that made you laugh",
    "and then made you think, the shape of it probably came from",
    "here.",
    "",
    "SYSOP NOTE, ADDED LATER: they went on to coin the word",
    "hacktivism, and to release a tool at a conference that made a",
    "very large software company stand up and explain itself in",
    "public.",
    "",
    "Almost none of this was written down anywhere official. Type",
    "ARCHIVE.",
  ],
};

/* ---------------- the jargon file, abridged ---------------- */
// Definitions are written here rather than copied. The real file has roughly
// two thousand entries and a great deal of argument attached to each one.

const JARGON_FILE = {
  HACK: [
    "The original sense: a clever solution nobody expected, arrived",
    "at by somebody who understood the system better than its",
    "designers. The real file spends several paragraphs refusing to",
    "settle on one meaning, which is itself the answer.",
  ],
  HACKER: [
    "Someone who enjoys taking things apart to find out how they",
    "work. The file has argued since the 1970s that the press took",
    "this word and used it to mean the other thing. The press won.",
    "The file is still arguing.",
  ],
  CRACKER: [
    "The word the file wanted the press to use for people who break",
    "in to cause harm. It never caught on with anybody outside the",
    "file.",
  ],
  PHREAKING: [
    "Doing to the telephone network what hacking does to computers.",
    "Predates it by a decade and change. See also: 2600.",
  ],
  KLUDGE: [
    "Pronounced klooj. A solution that works, should not, and now",
    "cannot be removed because three other things depend on it.",
  ],
  CRUFT: [
    "Accumulated residue in a system. Files, code, and settings that",
    "nobody can account for and nobody dares delete.",
  ],
  BOGON: [
    "The hypothetical elementary particle of wrongness. Emitted by",
    "broken code, bad documentation, and certain people. Measured",
    "in bogosity.",
  ],
  "BIT ROT": [
    "The observed tendency of a program to stop working over time",
    "despite nobody having touched it. Officially impossible.",
    "Universally experienced.",
  ],
  LUSER: [
    "A user, said with feeling. Blend of loser and user, and the",
    "person who coined it was having a bad shift.",
  ],
  RTFM: [
    "Read the manual. The F is not optional and is doing most of",
    "the work.",
  ],
  GROK: [
    "To understand a thing so completely that you have stopped",
    "having to think about it. Borrowed from a Heinlein novel in",
    "1961 and never given back.",
  ],
  FOO: [
    "The universal placeholder. When an example needs a name and the",
    "name does not matter, it is foo, then bar, then baz. Nobody",
    "agrees where it came from and everybody has a theory.",
  ],
  WETWARE: [
    "The human being operating the machine. Slower than the",
    "hardware, harder to patch, and the component that gets social",
    "engineered.",
  ],
  FLAME: [
    "To post at length, in anger, and at a volume out of all",
    "proportion to the disagreement. A sustained exchange is a flame",
    "war. This board has hosted several.",
  ],
  LURKER: [
    "Somebody who reads everything and posts nothing. Most of any",
    "board is lurkers. They are not the problem.",
  ],
  MUNGE: [
    "To transform data, usually destructively, usually while trying",
    "to do something else.",
  ],
  WIZARD: [
    "Somebody who genuinely knows how the thing works, as opposed to",
    "somebody who knows which commands to type. The difference shows",
    "up the moment anything breaks.",
  ],
  HEISENBUG: [
    "A bug that changes behaviour or disappears entirely as soon as",
    "you try to observe it. Related: the Bohr bug, which is the",
    "honest kind that shows up every time.",
  ],
  "SALAMI ATTACK": [
    "Theft by slicing. Take a fraction of a cent off an enormous",
    "number of transactions and the total is a fortune while no",
    "single line on any statement looks wrong. Named for the only",
    "sensible way to eat a salami.",
    "See also: the entire reason this board exists.",
  ],
  WORM: [
    "A program that moves through a network on its own. A virus",
    "needs something to attach itself to. A worm does not, which is",
    "the whole distinction and it gets ignored constantly.",
  ],
  VIRUS: [
    "Code that copies itself into other programs and travels when",
    "they do. Needs a host. See WORM for the thing it keeps getting",
    "confused with.",
  ],
  "TROJAN HORSE": [
    "A program that does exactly what it advertises, and also does",
    "something else. The advertised part is what gets it installed.",
  ],
  "BACK DOOR": [
    "A way in that the designer left deliberately and mentioned to",
    "nobody. Also trapdoor. Distinct from a bug in that somebody",
    "meant it.",
  ],
  "SOCIAL ENGINEERING": [
    "Getting what you want by asking a person instead of attacking a",
    "machine. The oldest technique, the cheapest, and the only one",
    "no patch has ever addressed. See WETWARE.",
  ],
  SNEAKERNET: [
    "Moving data by picking it up and walking. Enormous bandwidth,",
    "dreadful latency, and completely impossible to wiretap.",
    "Occasionally the only thing that still works.",
  ],
  HANDLE: [
    "The name you are known by. The convention is that you do not",
    "choose your own, and everybody who has tried has had to live",
    "with the result.",
  ],
  DAEMON: [
    "A program that sits in the background waiting for something to",
    "happen. Not spelled demon, and people will correct you.",
  ],
  "CORE DUMP": [
    "A copy of memory written out when a program dies, so somebody",
    "can work out what it was thinking. Also used of a person who",
    "answers a small question at catastrophic length.",
  ],
  MAGIC: [
    "A feature that works for reasons nobody present can explain,",
    "occasionally including its author. Escalates to deep magic, and",
    "then to more magic, which was a real label somebody at MIT put",
    "on a switch nobody could account for.",
  ],
  FROB: [
    "To adjust something aimlessly. The gradations matter: frobbing",
    "is random, twiddling is a small deliberate change, and tweaking",
    "is a careful one. People will die on this hill.",
  ],
  SNARF: [
    "To grab a copy of something, usually the whole thing, usually",
    "without having asked first.",
  ],
  DWIM: [
    "Do What I Mean. A system that tries to work out your intention",
    "and fix your input for you. Adored when it guesses right and",
    "unbearable the rest of the time.",
  ],
  CANONICAL: [
    "The standard, approved, correct form of a thing. Borrowed from",
    "mathematics and now used far more heavily by hackers than by",
    "the people who invented the sense.",
  ],
  MOBY: [
    "Large. Immense. Originally MIT, originally about address space,",
    "and originally about a whale.",
  ],
  RANDOM: [
    "Not the statistical sense. Assorted, unmotivated, or simply",
    "wrong. A random person is somebody with no business being",
    "there.",
  ],
  CHAD: [
    "The confetti punched out of cards and paper tape. Clearing it",
    "out was somebody's actual job.",
  ],
  UTSL: [
    "Use the Source, Luke. The answer is in the code, the code is",
    "right there, and you are capable of reading it.",
  ],
  "HACK VALUE": [
    "The reason for doing something completely pointless extremely",
    "well. It accounts for most of what is on this board and very",
    "nearly all of the good parts of the field.",
  ],
  "THE STORY OF MEL": [
    "A legend posted in 1983 about a programmer who timed his code",
    "to the physical rotation of a drum memory so each instruction",
    "arrived exactly when the drum did, and who refused to rig a",
    "game in the house's favour because it would be dishonest.",
    "Usually passed around set as free verse.",
  ],

  /* the board and the era it is pretending to come from */
  BBS: [
    "Bulletin Board System. One computer, one or more phone lines,",
    "and whoever could get through. You dialled it directly. There",
    "was no in between and no company standing in the middle.",
  ],
  SYSOP: [
    "System operator. Ran the board, paid for the line, set the",
    "rules, and deleted your account personally if you were tedious",
    "about it.",
  ],
  DOOR: [
    "A separate program a board could hand you off to, usually a",
    "game. You were still connected to the board and the board was",
    "no longer listening. See GIBSON.EXE.",
  ],
  RATIO: [
    "Upload to download. Take three files, contribute one. Boards",
    "that enforced it had better libraries and fewer friends.",
  ],
  WAREZ: [
    "Cracked commercial software, traded. Spelled that way on",
    "purpose. Not carried here, as RULES.TXT says twice.",
  ],
  LAMER: [
    "Somebody who wants the standing without doing any of it. Asks",
    "for the answer, never the method. The insult of choice on every",
    "board that ever existed.",
  ],
  LEET: [
    "Elite. Compressed, then respelled, then respelled again until",
    "the vowels were numbers. Started as a real distinction on real",
    "boards and ended up as a font.",
  ],
  "ANSI ART": [
    "Pictures drawn in coloured text characters, because that is",
    "what a terminal could do. Some of it was genuinely beautiful",
    "and almost all of it is gone.",
  ],
  ZMODEM: [
    "A file transfer protocol, and the good one. It could resume an",
    "interrupted transfer instead of starting the whole thing again,",
    "which on a metered line was the difference that mattered.",
  ],
  "NO CARRIER": [
    "The modem lost the far end. Printed by the modem itself, not by",
    "anything you were talking to, which is why it is the last thing",
    "in so many transcripts.",
  ],
  BAUD: [
    "Signalling rate on the line. Frequently misused for bits per",
    "second, including by people who knew better and had stopped",
    "caring.",
  ],
  FIDONET: [
    "A network of boards that passed mail to each other overnight by",
    "dialling each other up, one hop at a time. Store and forward,",
    "run by volunteers, and it worked.",
  ],
  NFO: [
    "An information file, shipped alongside something else, usually",
    "with more effort spent on the ASCII header than on the",
    "contents. This board has several.",
  ],
  CARDING: [
    "Using card numbers that are not yours. Distinct from everything",
    "else on a board like this in that it is straightforwardly",
    "theft. Not carried here either.",
  ],
  WARDIALING: [
    "Calling every number in a range to find out which ones answer",
    "with a modem. Slow, extremely noisy, and it worked because",
    "nobody was listening for it.",
  ],

  /* phreaking and the adjacent trades */
  "BLUE BOX": [
    "A box that generated the phone company's own signalling tones,",
    "2600 Hz among them, and told the network what to do in its own",
    "language. See the whistle in the store.",
  ],
  "RED BOX": [
    "Reproduced the sounds a payphone made when you fed it coins, so",
    "the far end believed it had been paid. Worked on the exact",
    "machines Phreak was arrested next to.",
  ],
  "DUMPSTER DIVING": [
    "Going through an organisation's rubbish for manuals, printouts,",
    "phone lists and internal memos. Legal, filthy, and historically",
    "one of the highest yield techniques there is.",
  ],
  "SHOULDER SURFING": [
    "Reading a password off somebody by standing where you can see",
    "their hands. No equipment, no skill, and no fix that is not a",
    "person changing their behaviour.",
  ],
  "LOGIC BOMB": [
    "Code left in a system that waits for a condition and then does",
    "damage. The condition is often a date, and often the author",
    "no longer being employed there.",
  ],
  ROT13: [
    "Shift every letter thirteen places. Applying it twice gives you",
    "back what you started with, which is elegant. It is not",
    "encryption and was never offered as any, only a way to keep a",
    "punchline from being read by accident.",
  ],
  "RUBBER HOSE": [
    "Short for rubber-hose cryptanalysis. The observation that the",
    "cheapest attack on a strong cipher is not mathematical, and is",
    "applied to the person holding the key rather than the key.",
  ],
  SPOOF: [
    "To pretend convincingly to be some other machine or person. The",
    "network was built by people who assumed everyone would say who",
    "they actually were.",
  ],
  "SCRIPT KIDDIE": [
    "Somebody running an attack they could not have written and",
    "cannot explain. Worth noting that the term arrived after all",
    "this, so anybody using it about Joey in 1995 was ahead of",
    "schedule and still wrong.",
  ],

  /* the many ways a thing can stop working */
  BUG: [
    "A defect. Grace Hopper's team taped an actual moth into a log",
    "book in 1947 and the story is true, but engineers were calling",
    "faults bugs decades before that, Edison included.",
  ],
  FEATURE: [
    "A property somebody intended. The joke writes itself and has",
    "been written approximately nine million times.",
  ],
  CRASH: [
    "To stop working suddenly and completely, usually taking",
    "whatever was not saved with it.",
  ],
  HOSED: [
    "Comprehensively broken. Not failing in one place, failing",
    "generally.",
  ],
  WEDGED: [
    "Stuck in a state it cannot get out of, still running, doing",
    "nothing, and not admitting it.",
  ],
  HUNG: [
    "Waiting forever for something that is never going to arrive.",
    "Distinct from crashed in that it still looks alive.",
  ],
  THRASH: [
    "To spend so much effort moving work around that no work gets",
    "done. Applies to machines and to organisations equally.",
  ],
  GLITCH: [
    "A brief, transient fault that fixes itself before anybody can",
    "look at it. Closely related to HEISENBUG.",
  ],
  BARF: [
    "To reject input noisily. A program that barfs is at least",
    "telling you.",
  ],
  GRONK: [
    "To break something, or to clear it out entirely. Gronked is",
    "past the point of repair.",
  ],

  /* judgements of quality, freely given */
  "BRAIN-DAMAGED": [
    "So badly designed that the design itself is the problem. The",
    "strongest available criticism and not used lightly.",
  ],
  BOGUS: [
    "Wrong, fake, or useless. The adjective form of BOGON.",
  ],
  ELEGANT: [
    "The highest praise available. Solves the problem completely",
    "while appearing to do almost nothing.",
  ],
  "SPAGHETTI CODE": [
    "Control flow so tangled that following it requires a finger on",
    "the screen. Usually the result of six people being in a hurry",
    "at different times.",
  ],
  "VOODOO PROGRAMMING": [
    "Including something because it worked once, without knowing",
    "why, and being unwilling to remove it in case it stops.",
  ],
  OBFUSCATED: [
    "Deliberately made unreadable. There are competitions for it and",
    "the winners are genuinely impressive.",
  ],
  "WORSE IS BETTER": [
    "The argument that a simple thing that ships and spreads beats a",
    "correct thing that does not. Advanced in 1989 and the field has",
    "been arguing about it ever since.",
  ],
  BLETCH: [
    "An expression of disgust at something technical. Bletcherous is",
    "the adjective and is worse.",
  ],

  /* mistakes with names */
  "FENCEPOST ERROR": [
    "Off by one. A hundred feet of fence with a post every ten feet",
    "needs eleven posts. Counting the gaps instead of the posts has",
    "cost more money than most exploits.",
  ],
  "PHASE OF THE MOON": [
    "The last thing left to blame. Occasionally correct: there is a",
    "documented case where a program's behaviour genuinely depended",
    "on it, because somebody printed it in a header line and the",
    "line got too long.",
  ],
  "BIG-ENDIAN": [
    "Which end of a number you store first. The names come from",
    "Gulliver's Travels, where the same argument is about eggs, and",
    "the joke was the entire point of choosing them.",
  ],
  "SMOKE TEST": [
    "Switch it on and see whether smoke comes out. Hardware term,",
    "borrowed by software, still the first test worth running.",
  ],

  /* the net, and the people on it */
  SPAM: [
    "Unwanted bulk messages. Named after the Monty Python sketch in",
    "which the word drowns out the conversation, which is a precise",
    "description of the problem.",
  ],
  TROLL: [
    "Somebody posting to provoke rather than to say anything. From",
    "the fishing sense, dragging bait, not the bridge creature.",
  ],
  PLONK: [
    "The noise of a user landing at the bottom of your killfile.",
    "Posted as a single word, as a reply, and as the last word.",
  ],
  SIG: [
    "The block at the bottom of your posts. Four lines was the",
    "convention, everybody broke it, and quoting somebody's entire",
    "sig back at them was its own minor crime.",
  ],
  NETIQUETTE: [
    "The unwritten rules. Do not shout, do not quote the whole",
    "message to add one line, read the group before posting to it.",
    "All still true and all still ignored.",
  ],
  "SNAIL MAIL": [
    "Physical post. Coined by people who had just realised how slow",
    "it had been all along.",
  ],
  MEATSPACE: [
    "The physical world. Where your body is while you are somewhere",
    "else.",
  ],
  CYBERSPACE: [
    "Coined by William Gibson, who had barely used a computer at the",
    "time and got it right anyway. The supercomputer in this case",
    "file is named after him.",
  ],
  VAPORWARE: [
    "Software announced, promoted, dated, and never shipped.",
    "Occasionally announced specifically so nobody buys the thing",
    "that does exist.",
  ],
  FUD: [
    "Fear, Uncertainty and Doubt. Selling against a competitor by",
    "making buyers nervous rather than by being better.",
  ],
  SUIT: [
    "Somebody in management, particularly one making technical",
    "decisions on non-technical grounds. Ellingson is full of them",
    "and one of them signed off on the tanker code.",
  ],

  /* leftovers worth keeping */
  "HELLO WORLD": [
    "The first program. Prints two words and proves the entire",
    "toolchain works. From Kernighan, and now the first thing",
    "written in every language ever made.",
  ],
  "DEEP MAGIC": [
    "A technique that depends on knowledge very few people have.",
    "Distinct from MAGIC in that somebody, somewhere, does actually",
    "understand it.",
  ],
  "MAGIC COOKIE": [
    "An opaque token handed to you to hand back later. You are not",
    "meant to look inside it and it means nothing to you if you do.",
  ],
  GNU: [
    "GNU's Not Unix. The acronym contains itself, which is the joke",
    "and also a working definition of the culture that produced it.",
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

// Offset, hex, and an ASCII column, the way every hex editor of the period
// laid it out. Printable bytes show through on the right, which is the whole
// reason a fragment like this is worth carrying out of a building.
function hexDump(bytes) {
  const rows = [];
  for (let i = 0; i < bytes.length; i += 16) {
    const slice = bytes.slice(i, i + 16);
    let hex = "", asc = "";
    for (let b = 0; b < 16; b++) {
      if (b < slice.length) {
        hex += slice[b].toString(16).padStart(2, "0") + " ";
        asc += slice[b] >= 32 && slice[b] < 127 ? String.fromCharCode(slice[b]) : ".";
      } else { hex += "   "; asc += " "; }
      if (b === 7) hex += " ";
    }
    rows.push(i.toString(16).padStart(8, "0") + "  " + hex + " |" + asc + "|");
  }
  return rows;
}

// Mostly noise, with a handful of strings left intact. Nobody strips their
// symbol table when they are in a hurry.
function wormBytes(strings, len) {
  const b = new Uint8Array(len);
  for (let i = 0; i < len; i++) b[i] = Math.floor(Math.random() * 256);
  let at = 24;
  strings.forEach((s) => {
    if (at + s.length + 4 >= len) return;
    for (let i = 0; i < s.length; i++) b[at + i] = s.charCodeAt(i);
    b[at + s.length] = 0;
    at += s.length + 4 + Math.floor(Math.random() * 40);
  });
  return b;
}

function garbageFiles() {
  const acct = "884" + Math.floor(Math.random() * 900000 + 100000);

  // Sorted, because a ledger that is not in date order is not a ledger.
  const transfers = [];
  for (let i = 0; i < 60; i++) {
    transfers.push({
      d: Math.floor(Math.random() * 28) + 1,
      h: Math.floor(Math.random() * 24),
      m: Math.floor(Math.random() * 60),
      amt: zipAmount(),
    });
  }
  transfers.sort((a, b) => a.d - b.d || a.h - b.h || a.m - b.m);
  const ledger = transfers.map((t) =>
    "09/" + String(t.d).padStart(2, "0") + "/95  " +
    String(t.h).padStart(2, "0") + ":" + String(t.m).padStart(2, "0") +
    "  ROUNDING ADJ  " + t.amt.padStart(7) + "  ->  ACCT " + acct);

  const dump = hexDump(wormBytes([
    "MEMDUMP", "no symbols", "??", "free(): invalid pointer",
  ], 384));

  const worm = hexDump(wormBytes([
    "da Vinci",
    "ELLINGSON MINERAL CO",
    "BALLAST.CTL",
    "ebelford",
    "ROUNDING ADJ",
    "ACCT " + acct,
    "SUPPRESS LOG",
    "run quiet",
    "delete self",
    "LEONARDO",
  ], 512));

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
    ].concat(ledger).concat([
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

    { name: "GARBAGE/DAVINCI.FRG", body: [
      "; three fragments, concatenated in the order they came off the",
      "; machine. this is the file. this is the whole reason any of it",
      "; happened. it is 512 bytes and it is not even the whole worm.",
      ";",
      "; you cannot read it. nobody who took it could read it either.",
      "; look at the right hand column anyway.",
      "",
    ].concat(worm).concat([
      "",
      "; ends mid instruction. the rest was in a directory you did not",
      "; reach, on a machine you are no longer on.",
    ]).join("\r\n") },

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

    { name: "GARBAGE/PERSONAL/READING.TXT", body: [
      "phreak's list. he says stop asking about handles and read these.",
      "",
      "  PHRACK 7, PHILE 3",
      "  https://phrack.org/issues/7/3",
      "  some guy wrote it the week after they arrested him. 1986.",
      "  phreak has it printed out. it is four paragraphs. he can",
      "  do the last one from memory and he does, constantly.",
      "",
      "i have read it four times. i still do not have a handle.",
      "",
      "the part that gets me is that he wrote it AFTER. sitting",
      "there with nothing left to lose and he still typed it up",
      "and sent it in. that is the part nobody quotes.",
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
  // Fisher-Yates. A comparator returning random values is not a shuffle: it
  // left /pub and /usr holding fragments about half the time while /payroll
  // and /garbage sat near 31%, so whole directories rarely came up.
  const pool = dirs.filter((d) => d !== "/sec");
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const spots = ["/sec", pool[0], pool[1]];

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
        writeLines([
          "",
          "ACCESS GRANTED.  /sec is open.",
          "One of four. He said it out loud to a room and nobody changed it.",
          "",
        ], "amber");
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
      "  JARGON <word>   Look a word up. JARGON on its own lists them.",
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
    writeCited([""].concat(FILES[key]).concat([""]));
  },

  JARGON(arg) {
    const keys = Object.keys(JARGON_FILE);
    if (!arg) {
      writeLines(["", "JARGON.DAT  " + keys.length + " entries loaded", ""], "amber");
      // Column width comes from the longest key, so adding an entry cannot
      // quietly break the alignment of the whole listing.
      const w = Math.max.apply(null, keys.map((k) => k.length)) + 2;
      for (let i = 0; i < keys.length; i += 3) {
        write(esc(("  " + keys.slice(i, i + 3).map((k) => k.padEnd(w)).join("")).replace(/\s+$/, "")));
      }
      writeCited([
        "",
        "Usage: JARGON <word>",
        "",
        "The real file has about two thousand of these and an",
        "argument attached to every one:",
        "",
        "  http://www.catb.org/jargon/",
        "",
      ], "dim");
      return;
    }
    const key = arg.trim().toUpperCase();
    if (!JARGON_FILE[key]) {
      writeCited([
        "",
        "No entry for " + key + ".",
        "",
        "This board carries " + keys.length + " of them. The real file",
        "carries about two thousand: http://www.catb.org/jargon/",
        "",
      ], "warn");
      return;
    }
    writeLines(["", key], "amber");
    writeLines(JARGON_FILE[key].map((l) => "  " + l).concat([""]));
  },

  // Not in HELP. The board runs on a phone line and the King of NYNEX is in
  // custody, so the tone that used to own that line belongs on it somewhere.
  "2600"() {
    writeLines(["", "Pursing lips.", ""], "dim");
    const ok = typeof blow2600 === "function" && blow2600(1.6);
    if (!ok) {
      writeLines(["Your browser declined to make the noise.", ""], "warn");
      return;
    }
    writeCited([
      "",
      "2600 Hz.",
      "",
      "That was the tone AT&T put on a long distance trunk to say",
      "the line was idle. Blow it down an open call and the far end",
      "believed you had hung up. The line stayed open. It was yours,",
      "and it went anywhere you asked it to.",
      "",
      "It came free in a box of Cap'n Crunch. A plastic bosun",
      "whistle, one hole covered, dead on 2600. A man took his",
      "handle from the cereal. Somebody else could do it by mouth.",
      "",
      "The phone company spent years and a great deal of money",
      "moving its signalling somewhere a child could not whistle at",
      "it. This does nothing now. Blow it anyway.",
      "",
    ], "amber");
  },

  WHISTLE(arg) { COMMANDS["2600"](arg); },

  // Not in HELP either. The board is a forgery. That one is the real thing.
  TEXTFILES() {
    writeCited([
      "",
      "THE ARCHIVE",
      "===========",
      "",
      "Every board like this one went dark, and almost none of it",
      "was written down anywhere else. Philes, g-philes, ANSI art,",
      "flame wars, door games, and an enormous quantity of nonsense",
      "typed by teenagers at two in the morning.",
      "",
      "Somebody spent years pulling what survived off dying disks",
      "and put it somewhere it cannot be switched off:",
      "",
      "  http://textfiles.com",
      "",
      "Still no padlock on it after thirty years, which is either",
      "an oversight or the single most consistent thing on the",
      "internet.",
      "",
      "This board is a forgery of something that was real. That is",
      "the real one. Go and read an actual one.",
      "",
    ], "amber");
  },

  ARCHIVE(arg) { COMMANDS.TEXTFILES(arg); },

  // Not in HELP. PHRACK.TXT says the board should not have the newer one,
  // which is the whole hook: this entry postdates the board by thirty years
  // and nobody on it will say who added it.
  PHRACK() {
    writeCited([
      "",
      "PHRACK MAGAZINE :: pointers kept by this board",
      "==============================================",
      "",
      "  VOL 1, ISSUE 7, PHILE 3                        1986",
      "  The Conscience of a Hacker",
      "  https://phrack.org/issues/7/3",
      "",
      "    Written by a kid the week after they arrested him.",
      "    Four paragraphs. It has outlived every system it",
      "    was ever typed on.",
      "",
      "  ISSUE 72, PHILE 19                             2025",
      "  The Hacker's Renaissance: A Manifesto Reborn",
      "  https://phrack.org/issues/72/19",
      "",
      "    The same argument made again, forty years on, by",
      "    somebody checking whether any of it survived.",
      "",
    ], "amber");
    writeLines([
      "SYSOP NOTE: the second entry postdates this board by thirty",
      "years. It was not here last time anyone looked. The domain is",
      "paid up through next year and the records do not show by whom.",
      "",
    ], "dim");
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
