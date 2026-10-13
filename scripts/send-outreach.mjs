// Sends queued cold outreach through Brevo's transactional API as
// aldo@arctoslaunchpad.com, for two campaigns:
//
//   arctos     Calgary businesses, outreach/batch-*.json, weekdays 9:00-16:30 Calgary.
//   vowmotion  Wedding planners, vow-motion/outreach/batch-*.json (outreach.yml checks
//              out Aldo140/vow-motion there) and outreach/vow-motion/batch-*.json,
//              weekdays 9:30-17:00 US Eastern.
//
// New batches come from HQ's morning prospect research (prospects.yml,
// scripts/prospects.mjs).
//
// Run by .github/workflows/outreach.yml, which HQ's operations clock starts
// every half hour. Each run sends at most `perRun` emails per campaign inside
// its send window, up to `dailyCap` a day. Sent addresses are recorded in the
// campaign's sent file so nothing is sent twice. Before sending, hard bounces
// and spam complaints Brevo saw for the campaign are added to its suppression
// file, and a campaign with 3 or more hard bounces today stops for the day.
// A campaign with emails to send texts Aldo through the HQ bot when it starts
// and when it ends (/api/hq/alerts/outreach, signed in with the run's GitHub OIDC token).
//
//   BREVO_API_KEY=... node scripts/send-outreach.mjs          # send
//   node scripts/send-outreach.mjs --dry-run                  # show what would send
//   OUTREACH_CAMPAIGN=vowmotion node scripts/send-outreach.mjs  # one campaign only

import { readFileSync, writeFileSync, readdirSync, existsSync, appendFileSync } from "node:fs";
import { join } from "node:path";

const SENDER = { name: "Aldo Ortiz", email: "aldo@arctoslaunchpad.com" };
const WEEKDAYS = [1, 2, 3, 4, 5];
const BOUNCE_STOP = 3;

export const CAMPAIGNS = [
  {
    id: "arctos",
    label: "Arctos",
    batchDirs: ["outreach"],
    suppression: ["outreach/suppression.txt"],
    sentFile: "outreach/sent.json",
    perRun: 10,
    dailyCap: 50,
    window: { tz: "America/Edmonton", start: 9 * 60, end: 16 * 60 + 30 },
    tag: "arctos-outreach",
  },
  {
    id: "vowmotion",
    label: "Vow Motion",
    // The lists written by hand in the Vow Motion repo, then HQ's own research.
    batchDirs: ["vow-motion/outreach", "outreach/vow-motion"],
    // The Vow Motion repo's own list, plus bounces this script finds.
    suppression: ["vow-motion/outreach/suppression.txt", "outreach/vow-motion-suppression.txt"],
    sentFile: "outreach/vow-motion-sent.json",
    perRun: 6,
    dailyCap: 50,
    window: { tz: "America/New_York", start: 9 * 60 + 30, end: 17 * 60 },
    tag: "vowmotion-outreach",
    // Everything before this row (1-based, as the sending chat counted them) went
    // out by hand from Gmail before HQ took over on 2026-10-12, as did every
    // earlier batch file.
    startAt: { file: "batch-2026-10-08.json", row: 38 },
    // Copy fixes for rows in that repository: { "<batch file>": { "<row>": [[find, replace]] } }.
    edits: "outreach/vow-motion-edits.json",
  },
];

const dryRun = process.argv.includes("--dry-run");
// A manual run can send outside the window when Aldo asks for it now.
const sendNow = process.env.OUTREACH_SEND_NOW === "true";
const only = process.env.OUTREACH_CAMPAIGN && process.env.OUTREACH_CAMPAIGN !== "all" ? process.env.OUTREACH_CAMPAIGN : null;

export const localTime = (d, tz) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", weekday: "short", hourCycle: "h23",
    }).formatToParts(d).map((p) => [p.type, p.value]),
  );
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
  return { date: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute), day };
};

const REPORT_URL = "https://arctoslaunchpad.com/api/hq/alerts/outreach";

/** Tells HQ how the run is going. Never fails the run; does nothing outside GitHub Actions. */
export async function report(body) {
  const { ACTIONS_ID_TOKEN_REQUEST_URL: url, ACTIONS_ID_TOKEN_REQUEST_TOKEN: bearer, GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID } = process.env;
  if (!url || !bearer) return;
  try {
    const oidc = await fetch(`${url}&audience=arctos-hq-outreach`, { headers: { Authorization: `Bearer ${bearer}` } }).then((r) => r.json());
    const runUrl = GITHUB_RUN_ID ? `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}` : undefined;
    const r = await fetch(REPORT_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${oidc.value}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, runUrl }),
    });
    if (!r.ok) console.log(`::warning::Couldn't text Aldo (HTTP ${r.status}).`);
  } catch (e) {
    console.log(`::warning::Couldn't text Aldo: ${e instanceof Error ? e.message : e}`);
  }
}

export const norm = (email) => String(email).trim().toLowerCase();

export const readList = (file) => existsSync(file)
  ? readFileSync(file, "utf8").split("\n").map((l) => l.replace(/#.*/, "").trim()).filter(Boolean).map(norm)
  : [];

/** Applies a campaign's copy fixes, and starts every paragraph with a capital letter. */
export function polish(body, fixes = []) {
  let out = body;
  for (const [find, replace] of fixes) {
    if (out.includes(find)) out = out.replace(find, replace);
    else console.log(`::warning::copy fix not found: ${find.slice(0, 60)}`);
  }
  return out.replace(/(^|\n\n)([a-z])/g, (_, gap, ch) => gap + ch.toUpperCase());
}

/** Every batch file of a campaign, as [dir, file], oldest first. */
export const batchFiles = (c) => c.batchDirs.filter((d) => existsSync(d))
  .flatMap((d) => readdirSync(d).filter((f) => /^batch-.*\.json$/.test(f)).map((f) => [d, f]))
  .sort((a, b) => a[1].localeCompare(b[1]) || c.batchDirs.indexOf(a[0]) - c.batchDirs.indexOf(b[0]));

/** The campaign's unsent emails, oldest batch first. */
export function queueFor(c, { sent, suppressed, today }) {
  const sentEmails = new Set(sent.map((s) => norm(s.email)));
  const edits = c.edits && existsSync(c.edits) ? JSON.parse(readFileSync(c.edits, "utf8")) : {};
  return batchFiles(c)
    .filter(([, f]) => !c.startAt || f >= c.startAt.file)
    .flatMap(([d, f]) => {
      const rows = JSON.parse(readFileSync(join(d, f), "utf8"))
        .map((m, i) => (m && m.body ? { ...m, body: polish(m.body, edits[f]?.[String(i + 1)]) } : m));
      return c.startAt && f === c.startAt.file ? rows.slice(c.startAt.row - 1) : rows;
    })
    .filter((m) => m && m.email && m.subject && m.body)
    .filter((m) => !sentEmails.has(norm(m.email)) && !suppressed.has(norm(m.email)))
    // A batch can wait for a set day (YYYY-MM-DD, campaign time), e.g. to skip a holiday.
    .filter((m) => !m.notBefore || m.notBefore <= today)
    // The same address twice in the queue sends once.
    .filter((m, i, all) => all.findIndex((x) => norm(x.email) === norm(m.email)) === i);
}

/** Hard bounces and spam complaints Brevo recorded for this campaign in the last 30 days. */
async function brevoProblems(tag) {
  const out = [];
  for (const event of ["hardBounces", "spam"]) {
    const r = await fetch(`https://api.brevo.com/v3/smtp/statistics/events?event=${event}&tags=${encodeURIComponent(tag)}&days=30&limit=500`, {
      headers: { "api-key": process.env.BREVO_API_KEY, accept: "application/json" },
    });
    if (!r.ok) throw new Error(`Brevo ${event}: HTTP ${r.status}`);
    const body = await r.json();
    for (const e of body.events ?? []) if (e.email) out.push({ email: norm(e.email), event, date: e.date ?? "" });
  }
  return out;
}

async function runCampaign(c, now) {
  if (!c.batchDirs.some((d) => existsSync(d))) {
    console.log(`::warning::${c.label}: none of ${c.batchDirs.join(", ")} is here; skipping.`);
    return;
  }
  const local = localTime(now, c.window.tz);
  const suppressed = new Set(c.suppression.flatMap(readList));
  const sent = existsSync(c.sentFile) ? JSON.parse(readFileSync(c.sentFile, "utf8")) : [];
  const sentToday = sent.filter((s) => localTime(new Date(s.at), c.window.tz).date === local.date).length;
  const ownSuppression = c.suppression[c.suppression.length - 1];

  let bouncesToday = 0;
  if (process.env.BREVO_API_KEY && !dryRun) {
    try {
      for (const p of await brevoProblems(c.tag)) {
        if (p.event === "hardBounces" && localTime(new Date(p.date), c.window.tz).date === local.date) bouncesToday++;
        if (suppressed.has(p.email)) continue;
        suppressed.add(p.email);
        appendFileSync(ownSuppression, `${p.email}  # ${p.event === "spam" ? "spam complaint" : "hard bounce"} (Brevo) ${p.date.slice(0, 10)}\n`);
        console.log(`${c.label}: suppressed ${p.email} (${p.event})`);
      }
    } catch (e) {
      console.log(`::warning::${c.label}: couldn't read bounces from Brevo: ${e instanceof Error ? e.message : e}`);
    }
  }

  const queue = queueFor(c, { sent, suppressed, today: local.date });
  const inWindow = WEEKDAYS.includes(local.day) && local.minutes >= c.window.start && local.minutes < c.window.end;
  console.log(`${c.label}: ${queue.length} queued, ${sentToday}/${c.dailyCap} sent today, ${inWindow ? "inside" : "outside"} the send window.`);
  if (dryRun) {
    for (const m of queue) console.log(`  would send: ${m.email} | ${m.subject}`);
    return;
  }
  if (!inWindow && !sendNow) return;
  if (bouncesToday >= BOUNCE_STOP) {
    console.log(`${c.label}: ${bouncesToday} hard bounces today; stopping for the day.`);
    return;
  }

  const budget = Math.max(0, Math.min(c.perRun, c.dailyCap - sentToday));
  const batch = queue.slice(0, budget);
  if (!batch.length) return;
  if (!process.env.BREVO_API_KEY) {
    // Not an error: the queue simply waits until the key is added.
    console.log("BREVO_API_KEY is not set yet; nothing sent.");
    return;
  }

  await report({ event: "start", campaign: c.id, planned: batch.length });
  const sentNow = [];
  let failed = null;
  for (const m of batch) {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": process.env.BREVO_API_KEY, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: SENDER, replyTo: SENDER, to: [{ email: m.email, name: m.business }],
        subject: m.subject, textContent: m.body, tags: [c.tag],
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error(`${c.label}: send failed for ${m.email}: ${res.status} ${body.message ?? ""}`);
      failed = { business: m.business ?? m.email, error: `${res.status} ${body.message ?? ""}`.trim() };
      process.exitCode = 1;
      break;
    }
    sent.push({ email: m.email, business: m.business, subject: m.subject, at: new Date().toISOString(), messageId: body.messageId ?? null });
    sentNow.push(m.business ?? m.email);
    console.log(`${c.label}: sent ${m.business} (${m.email})`);
  }
  writeFileSync(c.sentFile, `${JSON.stringify(sent, null, 2)}\n`);
  await report({ event: "done", campaign: c.id, sent: sentNow, failed, sentToday: sentToday + sentNow.length, cap: c.dailyCap, left: queue.length - sentNow.length });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const now = new Date();
  for (const c of CAMPAIGNS) {
    if (only && c.id !== only) continue;
    await runCampaign(c, now);
  }
  // The workflow's crash text skips a run that got this far.
  if (process.env.RUNNER_TEMP) writeFileSync(join(process.env.RUNNER_TEMP, "outreach-reported"), "");
}
