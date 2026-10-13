// HQ's morning prospect research, the part around the research itself.
// prospects.yml runs it in three steps for one campaign (arctos or vowmotion):
//
//   node scripts/prospects.mjs plan <campaign> <prompt-out>
//       How many new businesses today's sends need (the daily cap minus what
//       is still queued), and the research prompt: the campaign's brief plus
//       every business and domain already on a list, so none is found twice.
//       Prints the number; 0 means skip the research.
//   (Claude Code researches, with web search and page reads only, and
//    answers with a JSON array of prospects.)
//   node scripts/prospects.mjs check <campaign> <claude.json>
//       Checks every prospect, writes the email for each one that passes, and
//       saves them as a new batch file the sender picks up on its next run.
//   node scripts/prospects.mjs report <campaign> [error]
//       Texts Aldo what was found (through the HQ bot).
//
// The research only ever supplies facts (who, where the address came from,
// one true detail); the email around them, the footer and the case studies
// are fixed here, so the copy rules in outreach/README.md hold for every row.
// Public repository: nothing here prints an email address to the log.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolveMx } from "node:dns/promises";
import { join } from "node:path";
import { CAMPAIGNS, batchFiles, localTime, norm, queueFor, readList, report } from "./send-outreach.mjs";

const FOOTER = {
  arctos: "—\nAldo Ortiz · Arctos, Calgary\n2011 Ulster Rd NW, Calgary, AB  T2N 4C4\nPrefer no more emails from me? Reply \"unsubscribe\" and I'll take you off.",
  vowmotion: "—\nAldo Ortiz · Arctos, marketing for Vow Motion\n2011 Ulster Rd NW, Calgary, AB  T2N 4C4\nPrefer no more emails from me? Reply \"unsubscribe\" and I'll take you off.",
};

// The only Arctos work an email may cite (outreach/README.md).
export const WORK = {
  truenorth: "a case-intake website for True North Kromes, a dental lab that 3D-prints cobalt-chrome frameworks, so labs can submit work directly instead of by phone and email.",
  nicsdelite: "a multi-order dessert order form for Nicsdelite, a Calgary dessert business, plus an admin view that shows every order in one place.",
  freshprep: "an internal reporting tool for Fresh Prep, so the team sees the numbers it needs without pulling them together by hand.",
};

// Vow Motion's subject lines and bodies, from docs/PLANNER-OUTREACH.md in
// Aldo140/vow-motion. Rotated so no two in a row look alike.
const VM_SUBJECTS = [
  (p) => `A cleaner RSVP handoff for ${p.business}`,
  (p) => `${p.firstName === "there" ? "Quick one" : p.firstName} — the guest list part, done once`,
  () => "Kitchen sheet, shuttle manifest, place cards — from the replies",
  () => "Built the guest side so you don't rebuild it in four spreadsheets",
];
const VM_BODIES = [
  (p) => `I came across ${p.business} and saw ${p.detail}.\n\nI work with Vow Motion — the guest-facing side of a wedding. Each household opens one private invitation to only their events, RSVPs by person, and every reply becomes a working guest list: covers by meal with dietary notes, a shuttle manifest from your own transport question, place cards with table and meal.\n\nIt sits next to whatever you plan on today — lists in by spreadsheet, documents out. Happy to send a link to a live sample-guest demo if it sounds useful — would it be, for any of your couples?`,
  (p) => `I came across ${p.business} and saw ${p.detail}.\n\nI work with Vow Motion — private household invitations, RSVP by person and event, seating/meal counts built straight from the replies.\n\nWant me to send a quick demo link? Just reply "yes" — no pitch, just a look.`,
];

// Shared mail providers: many unrelated businesses use them, so only the address itself counts as "already contacted".
const SHARED_DOMAINS = new Set(["gmail.com", "googlemail.com", "yahoo.com", "yahoo.ca", "hotmail.com", "hotmail.ca", "outlook.com", "live.com", "live.ca", "msn.com", "icloud.com", "me.com", "mac.com", "aol.com", "shaw.ca", "telus.net", "protonmail.com", "proton.me", "rogers.com", "sympatico.ca", "comcast.net", "att.net", "verizon.net", "ymail.com", "gmx.com"]);

const campaign = (id) => {
  const c = CAMPAIGNS.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown campaign: ${id}`);
  return c;
};
const domainOf = (email) => norm(email).split("@")[1] ?? "";
// "Casa Flores Custom Cabinetry Ltd." and "casa flores custom cabinetry" are the same business.
export const nameKey = (s) => String(s ?? "").toLowerCase().replace(/&/g, "and").replace(/\b(ltd|inc|llc|corp|co|the|company|limited)\b/g, "").replace(/[^a-z0-9]/g, "");

/** Everyone this sender has ever emailed or listed, in both campaigns, plus suppressions. */
export function known() {
  const emails = new Set();
  const names = { arctos: new Set(), vowmotion: new Set() };
  const domains = { arctos: new Set(), vowmotion: new Set() };
  for (const c of CAMPAIGNS) {
    const rows = batchFiles(c).flatMap(([d, f]) => {
      try { return JSON.parse(readFileSync(join(d, f), "utf8")); } catch { return []; }
    });
    const sent = existsSync(c.sentFile) ? JSON.parse(readFileSync(c.sentFile, "utf8")) : [];
    for (const r of [...rows, ...sent]) {
      if (!r?.email) continue;
      emails.add(norm(r.email));
      if (!SHARED_DOMAINS.has(domainOf(r.email))) domains[c.id].add(domainOf(r.email));
      if (r.business) names[c.id].add(nameKey(r.business));
    }
    for (const e of c.suppression.flatMap(readList)) emails.add(e);
  }
  return { emails, names, domains };
}

/** What the sender will still send today and on coming days. */
function queued(c, now = new Date()) {
  const sent = existsSync(c.sentFile) ? JSON.parse(readFileSync(c.sentFile, "utf8")) : [];
  const suppressed = new Set(c.suppression.flatMap(readList));
  return queueFor(c, { sent, suppressed, today: localTime(now, c.window.tz).date }).length;
}

export function plan(id, promptOut, now = new Date()) {
  const c = campaign(id);
  const need = Math.max(0, c.dailyCap - queued(c, now));
  if (!need) return 0;
  const k = known();
  // A few extra, since some won't pass the checks; the batch keeps at most `need`.
  const ask = need + Math.ceil(need / 5);
  const brief = readFileSync(`outreach/prospect-brief-${id}.md`, "utf8");
  const names = [...new Set(batchFiles(c).flatMap(([d, f]) => {
    try { return JSON.parse(readFileSync(join(d, f), "utf8")).map((r) => r?.business).filter(Boolean); } catch { return []; }
  }))].sort();
  writeFileSync(promptOut, [
    brief.replaceAll("{{count}}", String(ask)),
    "",
    "## Already contacted — do not include any of these businesses, or anyone at these domains",
    "",
    `Businesses: ${names.join("; ")}`,
    "",
    `Domains: ${[...k.domains[id]].sort().join(", ")}`,
    "",
  ].join("\n"));
  return need;
}

/** The JSON array in Claude's answer, wherever it sits in the text. */
export function parseAnswer(text) {
  const start = text.indexOf("["), end = text.lastIndexOf("]");
  if (start < 0 || end <= start) throw new Error("the research didn't return a list");
  const rows = JSON.parse(text.slice(start, end + 1));
  if (!Array.isArray(rows)) throw new Error("the research didn't return a list");
  return rows;
}

const str = (v, max) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "").slice(0, max);
const LINK = /https?:\/\/|www\.|\b[a-z0-9-]+\.(com|ca|net|org|co|io)\b/i;
const EMAIL = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/;
const URL_RE = /^https?:\/\/\S+$/;

/**
 * One prospect from the research, checked and turned into a row the sender
 * takes ({business, email, greeting, subject, body}), or the reason it can't be.
 * Mail-server lookups happen in check(), not here.
 */
export function compose(id, p, i, seen) {
  const business = str(p.business, 100);
  const email = norm(str(p.email, 200));
  const first = str(p.firstName ?? p.greeting, 60) || "there";
  if (!business) return { reason: "no business name" };
  if (!EMAIL.test(email)) return { reason: "not a valid email address" };
  if (!URL_RE.test(str(p.emailSource, 400))) return { reason: "no page showing where the email address came from" };
  if (!URL_RE.test(str(p.detailSource, 400))) return { reason: "no page backing the detail" };
  if (seen.emails.has(email)) return { reason: "already emailed, listed or unsubscribed" };
  if (seen.names[id].has(nameKey(business))) return { reason: "business already on a list" };
  if (!SHARED_DOMAINS.has(domainOf(email)) && seen.domains[id].has(domainOf(email))) return { reason: "someone at that domain is already on a list" };
  if (/[^\p{L}\p{M} '.&-]/u.test(first) || first.split(" ").length > 4) return { reason: "greeting isn't a name" };

  let subject, text;
  if (id === "arctos") {
    const opening = str(p.opening, 500), question = str(p.question, 300), pain = str(p.pain, 160).replace(/^if\s+/i, "");
    if (!WORK[p.work]) return { reason: "cites work that isn't one of the three real projects" };
    if (opening.length < 40) return { reason: "no specific detail about the business" };
    if (!/\?$/.test(question)) return { reason: "the question doesn't end in a question mark" };
    if (pain.length < 10 || /[.?!]$/.test(pain)) return { reason: "the closing phrase doesn't fit the sentence" };
    if ([opening, question, pain].some((s) => LINK.test(s))) return { reason: "contains a link" };
    subject = str(p.subject, 70);
    if (subject.length < 10) return { reason: "no subject" };
    text = `${opening} ${question.startsWith("Quick question") ? question : `Quick question: ${question}`}\n\nI'm Aldo — I run Arctos, a small Calgary studio that builds intake forms, job tracking and reporting around how a shop already works. Recently: ${WORK[p.work]}\n\nIf ${pain} takes more of your week than it should, I'm happy to look at how it runs today and tell you honestly whether anything is worth changing. No cost — just reply.`;
  } else {
    const detail = str(p.detail, 220).replace(/[.!]+$/, "");
    if (detail.length < 25) return { reason: "no specific detail about the business" };
    if (LINK.test(detail)) return { reason: "contains a link" };
    // The detail continues "I came across X and saw …".
    const q = { business, firstName: first, detail: /^[A-Z][a-z]/.test(detail) && !/^[A-Z][a-z]+ [A-Z]/.test(detail) ? detail[0].toLowerCase() + detail.slice(1) : detail };
    subject = VM_SUBJECTS[i % VM_SUBJECTS.length](q);
    text = VM_BODIES[(i + Math.floor(i / VM_SUBJECTS.length)) % VM_BODIES.length](q);
  }
  const words = text.split(/\s+/).length;
  if (words > 190) return { reason: "email too long" };
  return { row: { business, email, greeting: first, subject, body: `Hi ${first},\n\n${text}\n\n${FOOTER[id]}`, emailSource: str(p.emailSource, 400), detailSource: str(p.detailSource, 400) } };
}

const hasMailServer = async (domain) => {
  try { return (await resolveMx(domain)).some((r) => r.exchange); } catch { return false; }
};

export async function check(id, answerFile, now = new Date(), { mx = hasMailServer } = {}) {
  const c = campaign(id);
  const need = Math.max(0, c.dailyCap - queued(c, now));
  const answer = JSON.parse(readFileSync(answerFile, "utf8"));
  const rows = parseAnswer(String(answer.result ?? ""));
  const seen = known();
  const keep = [], dropped = [];
  for (const [i, p] of rows.entries()) {
    if (keep.length >= need) break;
    const out = compose(id, p ?? {}, keep.length, seen);
    if (out.row && !(await mx(domainOf(out.row.email)))) { out.reason = "that domain can't receive email"; delete out.row; }
    if (!out.row) { dropped.push({ business: str(p?.business, 100) || `#${i + 1}`, reason: out.reason }); continue; }
    keep.push(out.row);
    // Nothing twice in one batch either.
    seen.emails.add(out.row.email);
    seen.names[id].add(nameKey(out.row.business));
    if (!SHARED_DOMAINS.has(domainOf(out.row.email))) seen.domains[id].add(domainOf(out.row.email));
  }
  let file = null;
  if (keep.length) {
    const dir = id === "arctos" ? "outreach" : "outreach/vow-motion";
    mkdirSync(dir, { recursive: true });
    const date = localTime(now, c.window.tz).date;
    const base = id === "arctos" ? `batch-${date}-hq` : `batch-${date}`;
    file = join(dir, `${base}.json`);
    for (let n = 2; existsSync(file); n++) file = join(dir, `${base}-${n}.json`);
    writeFileSync(file, `${JSON.stringify(keep, null, 2)}\n`);
  }
  return { found: keep.length, dropped, file, left: queued(c, now) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [cmd, id, arg] = process.argv.slice(2);
  const summary = process.env.RUNNER_TEMP ? join(process.env.RUNNER_TEMP, `prospects-${id}.json`) : null;
  if (cmd === "plan") {
    console.log(plan(id, arg));
  } else if (cmd === "check") {
    let result;
    try {
      result = await check(id, arg);
    } catch (e) {
      result = { error: e instanceof Error ? e.message : String(e), found: 0, dropped: [], left: queued(campaign(id)) };
    }
    console.log(`${campaign(id).label}: ${result.found} new prospects${result.file ? ` in ${result.file}` : ""}, ${result.dropped.length} dropped, ${result.left} queued.${result.error ? ` Error: ${result.error}` : ""}`);
    for (const d of result.dropped) console.log(`  dropped ${d.business}: ${d.reason}`);
    if (summary) writeFileSync(summary, JSON.stringify(result));
    if (result.error) process.exitCode = 1;
  } else if (cmd === "report") {
    const result = summary && existsSync(summary) ? JSON.parse(readFileSync(summary, "utf8")) : null;
    const error = arg || result?.error;
    await report({ event: "prospects", campaign: id, found: result?.found ?? 0, dropped: result?.dropped.length ?? 0, left: result?.left ?? queued(campaign(id)), ...(error ? { error } : {}) });
  } else {
    console.error("usage: node scripts/prospects.mjs plan|check|report <arctos|vowmotion> [file|error]");
    process.exitCode = 2;
  }
}
