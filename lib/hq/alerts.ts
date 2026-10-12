import { GYM_GOAL, gymStats } from "../../components/hq/persona";
import { encodePaid, encodeTriage, escapeHtml, type Button } from "./telegramBot";
import type { CalendarSummary, GmailSummary, GmailTriage, HqSnapshot, LifeEntry, TriageDecision } from "./types";

/**
 * Texts the HQ bot sends on its own, the pure half: what is worth a buzz,
 * and what was already sent. lib/hq/alertsRun.ts reads the data and sends.
 *
 * Worth a text: a reply the reply check says needs Aldo, a lead replying to
 * a pitch, a post that failed, something that stopped working, a meeting
 * coming up, money owed that is due, and the gym when the week is slipping.
 * New website enquiries go straight from /api/contact (leadAlert below).
 *
 * Not worth one: every email (newsletters, auto-replies, bounces, replies the
 * check filtered out), posts that published fine, follower counts, agent runs
 * that worked, yellow warnings, ad numbers, all-day calendar events.
 */

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const TZ = "America/Edmonton";

/** Health checks whose failure stops real work. "late" and "you" are on the dashboard already; failed posts get their own text. */
const BREAKS = new Set(["inbox", "workflows", "inventory", "scout", "claude", "outlook"]);
/** At most this many texts per check; the rest are summed up in one line. */
export const MAX_PER_RUN = 5;
/** How long a sent alert is remembered, so it isn't sent again. */
const KEEP = 14 * DAY;

export interface Alert {
  key: string;
  text: string;
  /** Act on it from the text itself: the same actions as the dashboard. */
  buttons?: Button[];
}

const tap = (text: string, data: string | null): Button[] => (data ? [{ text, data }] : []);

export interface AlertInput {
  now: number;
  snapshot: HqSnapshot | null;
  gmail: GmailSummary | null;
  triage: GmailTriage | null;
  decisions: TriageDecision[];
  calendar: CalendarSummary | null;
  life: LifeEntry[];
}

/** What was sent and when (arctos-hq hq/alerts). */
export interface AlertState {
  sent: Record<string, number>;
}

const clip = (s: string, max: number) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s);
const BUSINESS: Record<string, string> = { calgarywatch: "CalgaryWatch", calgarydaily: "Calgary Daily", vowmotion: "Vow Motion", arctos: "Arctos", other: "Other" };

const dayKey = (t: number) => new Date(t).toLocaleDateString("en-CA", { timeZone: TZ });
export function calgaryHour(t: number): number {
  return Number(new Intl.DateTimeFormat("en-CA", { timeZone: TZ, hour: "numeric", hour12: false }).format(new Date(t))) % 24;
}
const time = (t: number) => new Date(t).toLocaleTimeString("en-CA", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).replace(/\s?([ap])\.?m\.?/i, " $1m");
const money = (cents: number) => `$${(cents / 100).toLocaleString("en-CA", { maximumFractionDigits: cents % 100 ? 2 : 0, minimumFractionDigits: cents % 100 ? 2 : 0 })}`;

/** 10 pm to 7 am Calgary: texts still arrive, without a sound. */
export const quietHours = (now: number) => {
  const h = calgaryHour(now);
  return h >= 22 || h < 7;
};

/** Every alert that applies right now. Keys stay the same for the same event, so planAlerts can skip repeats. */
export function alertsFor(input: AlertInput): Alert[] {
  const { now, snapshot, triage, decisions, calendar, life } = input;
  const out: Alert[] = [];
  const decided = new Set(decisions.map((d) => d.key));

  // Replies the reply check says need Aldo, until he approves or dismisses them on the board.
  for (const t of triage?.items ?? []) {
    if (!t.needsAction || decided.has(t.key) || t.replyAt < now - 2 * DAY) continue;
    const what = t.subtask?.title ? `: ${escapeHtml(clip(t.subtask.title, 120))}` : "";
    out.push({
      key: `mail:${t.key}`,
      text: `📬 <b>${escapeHtml(clip(t.from, 80))}</b> needs you${what}\n${escapeHtml(clip(t.reason, 300))}${t.subtask?.draftReply ? `\n\n<b>Draft reply</b>\n${escapeHtml(clip(t.subtask.draftReply, 600))}` : ""}`,
      buttons: [...tap("✅ Add to my list", encodeTriage("approved", t.key)), ...tap("👋 Not needed", encodeTriage("dismissed", t.key)), { text: "Open in Gmail", url: t.url }],
    });
  }

  // A lead wrote back to a pitch (auto-replies and opt-outs never reach the snapshot's inbox).
  for (const r of snapshot?.inbox?.replies ?? []) {
    if (r.approved || r.at < now - 2 * DAY) continue;
    out.push({
      key: `pitch-reply:${r.leadId}:${r.at}`,
      text: `💬 <b>${escapeHtml(r.businessName)}</b> replied to your ${escapeHtml(BUSINESS[r.business] ?? r.business)} pitch (${escapeHtml(r.classification)})\n“${escapeHtml(clip(r.text, 300))}”\n\nAn answer is drafted.`,
      buttons: [{ text: "📥 See the draft", data: "i" }],
    });
  }

  // A post Instagram rejected.
  for (const p of snapshot?.posts ?? []) {
    if (p.status !== "failed" || p.updatedAt < now - DAY) continue;
    out.push({
      key: `post-failed:${p.id}`,
      text: `🔴 A ${escapeHtml(BUSINESS[p.brand] ?? p.brand)} post didn't publish: ${escapeHtml(clip(p.headline, 100))}\n${escapeHtml(clip(p.error ?? p.warnings[0] ?? "Instagram refused it.", 200))}`,
      buttons: [{ text: "📥 Retry or drop it", data: "i" }],
    });
  }

  // Something that stopped working. Once per break: it can text again after it recovers.
  for (const b of snapshot?.bottlenecks ?? []) {
    if (b.severity !== "bad" || !BREAKS.has(b.id)) continue;
    out.push({ key: `break:${b.id}`, text: `🛠️ <b>${escapeHtml(b.label)}</b>: ${escapeHtml(b.value)}\n${escapeHtml(clip(b.detail, 300))}` });
  }

  // A heads-up before anything with a time on the calendar.
  for (const e of calendar?.events ?? []) {
    if (e.allDay || e.start <= now || e.start > now + 45 * MIN) continue;
    const mins = Math.max(1, Math.round((e.start - now) / MIN));
    out.push({
      key: `cal:${e.start}:${e.title.slice(0, 60)}`,
      text: `📅 In ${mins} min (${time(e.start)}): <b>${escapeHtml(clip(e.title, 120))}</b>${e.location ? `\n📍 ${escapeHtml(clip(e.location, 120))}` : ""}`,
    });
  }

  const hour = calgaryHour(now);
  const today = dayKey(now);

  // Money owed that's due today or late, once each morning.
  if (hour >= 8 && hour < 21) {
    const due = life.filter((e) => e.kind === "owed" && !e.done && e.due && dayKey(e.due) <= today).sort((a, b) => (a.due ?? 0) - (b.due ?? 0));
    if (due.length) {
      const lines = due.slice(0, 6).map((e) => `• ${escapeHtml(clip(e.text ?? "Someone", 80))}: ${money(e.amount ?? 0)}${dayKey(e.due!) < today ? ` (late since ${new Date(e.due!).toLocaleDateString("en-CA", { timeZone: TZ, month: "short", day: "numeric" })})` : " (due today)"}`);
      const total = due.reduce((s, e) => s + (e.amount ?? 0), 0);
      out.push({
        key: `owed:${today}`,
        text: `💵 <b>${money(total)} owed to you is due</b>\n${lines.join("\n")}${due.length > 6 ? `\n…and ${due.length - 6} more` : ""}\n\nGo collect. Tap when it lands.`,
        buttons: due.slice(0, 4).flatMap((e) => tap(`💵 ${clip(e.text ?? "Paid", 20)} paid`, encodePaid(e.id))),
      });
    }
  }

  // The gym, at 5 pm, only when the week's goal is slipping.
  if (hour >= 17 && hour < 21) {
    const gym = gymStats(input, now);
    const daysLeft = 7 - gym.sinceMonday; // today included
    const need = GYM_GOAL - gym.week;
    if (!gym.wentToday && need > 0 && (need >= daysLeft || (gym.daysSince ?? 99) >= 3)) {
      const since = gym.daysSince === null ? "" : ` Last time was ${gym.daysSince === 1 ? "yesterday" : `${gym.daysSince} days ago`}.`;
      const push = need >= daysLeft ? `${need} more to hit ${GYM_GOAL} and ${daysLeft === 1 ? "today is the last day" : `only ${daysLeft} days left`}.` : `${gym.week}/${GYM_GOAL} this week.`;
      out.push({ key: `gym:${today}`, text: `🏋️ Gym check: ${push}${since} Anytime Fitness is open. Tap when you're done.`, buttons: [{ text: "🏋️ I went", data: "g" }] });
    }
  }

  return out;
}

/**
 * Which alerts to send now, and the state to save. The first run sends none of
 * what's already there (only a hello), so turning this on doesn't flood the phone.
 * A break that recovered is forgotten, so it can text again if it breaks again.
 */
export function planAlerts(state: AlertState | null, alerts: Alert[], now: number): { send: Alert[]; more: number; state: AlertState; first: boolean } {
  const live = new Set(alerts.map((a) => a.key));
  const sent: Record<string, number> = {};
  for (const [k, at] of Object.entries(state?.sent ?? {})) {
    if (at < now - KEEP) continue;
    if (k.startsWith("break:") && !live.has(k)) continue;
    sent[k] = at;
  }
  const fresh = alerts.filter((a) => !(a.key in sent));
  for (const a of fresh) sent[a.key] = now;
  if (!state) return { send: [], more: 0, state: { sent }, first: true };
  return { send: fresh.slice(0, MAX_PER_RUN), more: Math.max(0, fresh.length - MAX_PER_RUN), state: { sent }, first: false };
}

export const HELLO = [
  "🔔 <b>Alerts are on.</b> I'll text you when:",
  "• someone fills in the Arctos contact form",
  "• an email reply actually needs you (not newsletters or auto-replies)",
  "• a lead answers one of your pitches",
  "• Arctos outreach starts sending, and how it went",
  "• a post fails or something stops working",
  "• a meeting starts in under 45 minutes",
  "• money owed to you is due",
  "• the gym week is slipping (5 pm)",
  "",
  "Between 10 pm and 7 am they come in silently.",
].join("\n");

/** A new website enquiry, sent the moment the form is submitted. */
export function leadAlert(
  s: { name: string; email: string; company: string; website: string; projectType: string; budget: string; timeline: string; challenge: string; source: string },
  receiptSent: boolean,
): string {
  const who = s.company ? `${escapeHtml(s.name)} at ${escapeHtml(s.company)}` : escapeHtml(s.name);
  const facts = [s.projectType, s.budget && `budget ${s.budget}`, s.timeline].filter(Boolean).map((x) => escapeHtml(x)).join(" · ");
  return [
    `💰 <b>New Arctos enquiry</b> from ${who}`,
    facts,
    "",
    `“${escapeHtml(clip(s.challenge, 400))}”`,
    "",
    `Reply to ${escapeHtml(s.email)}${s.website ? ` · ${escapeHtml(s.website)}` : ""}`,
    ...(s.source ? [`Came from: ${escapeHtml(clip(s.source, 120))}`] : []),
    receiptSent ? "They got an automatic receipt. Fast replies win: aim for today." : "Fast replies win: aim for today.",
  ].join("\n");
}

/** What outreach.yml reports about an outreach run (app/api/hq/alerts/outreach). */
export interface OutreachRun {
  event: "start" | "done" | "crashed";
  /** Which campaign; reports from before Vow Motion joined carry none and are Arctos. */
  campaign?: "arctos" | "vowmotion";
  /** start: how many it's about to send. */
  planned?: number;
  /** done: the businesses it emailed. */
  sent?: string[];
  /** done: the send Brevo refused, which stops the run. */
  failed?: { business: string; error: string } | null;
  sentToday?: number;
  cap?: number;
  /** Still queued after this run. */
  left?: number;
  runUrl?: string;
}

/** The text for an outreach run starting or ending. Runs with nothing to send report nothing. */
export function outreachAlert(r: OutreachRun): string {
  const link = r.runUrl ? `\n<a href="${escapeHtml(r.runUrl)}">See the run</a>` : "";
  const name = r.campaign === "vowmotion" ? "Vow Motion outreach" : "Arctos outreach";
  if (r.event === "start") return `📤 ${name} is starting: sending ${r.planned ?? "the next"} email${r.planned === 1 ? "" : "s"} from aldo@arctoslaunchpad.com.`;
  if (r.event === "crashed") return `❌ <b>Outreach failed</b> before it could finish. Nothing more will send until the next run, in about half an hour.${link}`;
  const sent = r.sent ?? [];
  const names = sent.slice(0, 10).map((b) => `• ${escapeHtml(clip(b, 80))}`).join("\n");
  const counts = [r.sentToday !== undefined && r.cap ? `${r.sentToday}/${r.cap} today` : "", r.left !== undefined ? `${r.left} still queued` : ""].filter(Boolean).join(", ");
  if (r.failed) {
    return `⚠️ <b>${name} stopped</b> after ${sent.length} email${sent.length === 1 ? "" : "s"}. Brevo refused ${escapeHtml(clip(r.failed.business, 80))}: ${escapeHtml(clip(r.failed.error, 200))}${names ? `\n\nSent:\n${names}` : ""}${counts ? `\n\n${counts}` : ""}${link}`;
  }
  return `✅ <b>${name} done</b>: ${sent.length} email${sent.length === 1 ? "" : "s"} sent.\n${names}${sent.length > 10 ? `\n…and ${sent.length - 10} more` : ""}${counts ? `\n\n${counts}` : ""}`;
}
