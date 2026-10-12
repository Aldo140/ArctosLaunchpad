// Sends queued Arctos outreach (outreach/batch-*.json) through Brevo's
// transactional API as aldo@arctoslaunchpad.com. Run by
// .github/workflows/outreach.yml every 30 minutes; each run sends at most
// PER_RUN emails inside the weekday send window, up to DAILY_CAP a day.
// Sent addresses are recorded in outreach/sent.json so nothing is sent twice.
// A run with emails to send texts Aldo through the HQ bot when it starts and
// when it ends (/api/hq/alerts/outreach, signed in with the run's GitHub OIDC token).
//
//   BREVO_API_KEY=... node scripts/send-outreach.mjs          # send
//   node scripts/send-outreach.mjs --dry-run                  # show what would send

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIR = "outreach";
const SENT_FILE = join(DIR, "sent.json");
const PER_RUN = 10;
const DAILY_CAP = 50;
const WINDOW = { start: 9 * 60, end: 16 * 60 + 30, days: [1, 2, 3, 4, 5] }; // Calgary time
const SENDER = { name: "Aldo Ortiz", email: "aldo@arctoslaunchpad.com" };
const dryRun = process.argv.includes("--dry-run");
// A manual run can send outside the window when Aldo asks for it now.
const sendNow = process.env.OUTREACH_SEND_NOW === "true";

const calgary = (d) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Edmonton", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", weekday: "short", hourCycle: "h23",
    }).formatToParts(d).map((p) => [p.type, p.value]),
  );
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
  return { date: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute), day };
};

const REPORT_URL = "https://arctoslaunchpad.com/api/hq/alerts/outreach";

/** Tells HQ how the run is going. Never fails the run; does nothing outside GitHub Actions. */
async function report(body) {
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
    // The workflow's crash text skips a run that already said how it ended.
    if (body.event === "done" && process.env.RUNNER_TEMP) writeFileSync(join(process.env.RUNNER_TEMP, "outreach-reported"), "");
  } catch (e) {
    console.log(`::warning::Couldn't text Aldo: ${e instanceof Error ? e.message : e}`);
  }
}

const norm = (email) => String(email).trim().toLowerCase();
const now = new Date();
const local = calgary(now);

const suppressed = new Set(
  readFileSync(join(DIR, "suppression.txt"), "utf8").split("\n")
    .map((l) => l.replace(/#.*/, "").trim()).filter(Boolean).map(norm),
);
const sent = existsSync(SENT_FILE) ? JSON.parse(readFileSync(SENT_FILE, "utf8")) : [];
const sentEmails = new Set(sent.map((s) => norm(s.email)));
const sentToday = sent.filter((s) => calgary(new Date(s.at)).date === local.date).length;

const queue = readdirSync(DIR).filter((f) => /^batch-.*\.json$/.test(f)).sort()
  .flatMap((f) => JSON.parse(readFileSync(join(DIR, f), "utf8")))
  .filter((m) => !sentEmails.has(norm(m.email)) && !suppressed.has(norm(m.email)))
  // A batch can wait for a set day (YYYY-MM-DD, Calgary time), e.g. to skip a holiday.
  .filter((m) => !m.notBefore || m.notBefore <= local.date);

const inWindow = WINDOW.days.includes(local.day) && local.minutes >= WINDOW.start && local.minutes < WINDOW.end;
console.log(`${queue.length} queued, ${sentToday}/${DAILY_CAP} sent today, ${inWindow ? "inside" : "outside"} the send window.`);
if (!inWindow && !dryRun && !sendNow) process.exit(0);

const budget = Math.max(0, Math.min(PER_RUN, DAILY_CAP - sentToday));
const batch = queue.slice(0, dryRun ? queue.length : budget);
if (dryRun) {
  for (const m of batch) console.log(`would send: ${m.email} | ${m.subject}`);
  process.exit(0);
}
if (!batch.length) process.exit(0);
if (!process.env.BREVO_API_KEY) {
  // Not an error: the queue simply waits until the key is added.
  console.log("BREVO_API_KEY is not set yet; nothing sent.");
  process.exit(0);
}

await report({ event: "start", planned: batch.length });

const sentNow = [];
let failed = null;
for (const m of batch) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": process.env.BREVO_API_KEY, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: SENDER, replyTo: SENDER, to: [{ email: m.email, name: m.business }],
      subject: m.subject, textContent: m.body, tags: ["arctos-outreach"],
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`send failed for ${m.email}: ${res.status} ${body.message ?? ""}`);
    failed = { business: m.business, error: `${res.status} ${body.message ?? ""}`.trim() };
    process.exitCode = 1;
    break;
  }
  sent.push({ email: m.email, business: m.business, subject: m.subject, at: now.toISOString(), messageId: body.messageId ?? null });
  sentNow.push(m.business);
  console.log(`sent: ${m.business} (${m.email})`);
}
writeFileSync(SENT_FILE, `${JSON.stringify(sent, null, 2)}\n`);
await report({ event: "done", sent: sentNow, failed, sentToday: sentToday + sentNow.length, cap: DAILY_CAP, left: queue.length - sentNow.length });
