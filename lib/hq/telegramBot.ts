import { GREETING, GYM_GOAL, agenda, brief, dollars, gymStats, mood, moneyLine, moneyStats, owedStats, todoStats } from "../../components/hq/persona";
import { describe, openDecisions, type QueueItem } from "../../components/hq/queue";
import { BUSINESS_LABEL, plural, slot } from "../../components/hq/format";
import type { CommandType, HqData, LifeEntry, TriageDecisionKind } from "./types";

/**
 * HQ over Telegram, the pure half: who may use the bot, what the buttons
 * carry, and the messages it sends. No network here (the webhook is
 * app/api/hq/telegram/route.ts), so ops/tests can cover it. Everything it
 * counts comes from the same functions as the dashboard (components/hq/
 * persona.ts and queue.ts), so the bot and HQ never disagree.
 */

export const HQ_URL = "https://arctoslaunchpad.com/hq";

/** HQ_TELEGRAM_USERS: "telegramUserId=email,…". Only these accounts get answers; the email signs their actions. */
export function telegramUsers(raw: string | undefined): Map<number, string> {
  const users = new Map<number, string>();
  for (const pair of (raw ?? "").split(",")) {
    const [id, email] = pair.split("=").map((s) => s.trim());
    if (/^\d+$/.test(id ?? "") && email?.includes("@")) users.set(Number(id), email.toLowerCase());
  }
  return users;
}

/* Button payloads. Telegram allows 64 bytes, so each action has a short code. */
const CODES: Record<CommandType, string> = {
  "approve-post": "ap", "reject-post": "rp", "redraft-post": "dp", "unschedule-post": "up",
  "approve-pitch": "ai", "skip-pitch": "si",
  "approve-reply": "ar", "handled-reply": "hr",
};
const TYPES = Object.fromEntries(Object.entries(CODES).map(([t, c]) => [c, t as CommandType]));
const TRIAGE: Record<string, TriageDecisionKind | "clear"> = { a: "approved", d: "dismissed", n: "done", c: "clear" };
const TRIAGE_CODE = Object.fromEntries(Object.entries(TRIAGE).map(([c, d]) => [d, c]));

export type ButtonAction =
  | { kind: "queue"; type: CommandType; targetId: string }
  | { kind: "undo"; commandId: string }
  /** A checked Gmail reply: put its subtask on the list, wave it off, mark it done, or take the call back. */
  | { kind: "triage"; decision: TriageDecisionKind | "clear"; key: string }
  | { kind: "gym" }
  | { kind: "paid"; id: string; paid: boolean }
  | { kind: "todo"; id: string; done: boolean }
  /** Take back something the bot logged. */
  | { kind: "remove"; id: string }
  | { kind: "today" }
  | { kind: "inbox" }
  /** Drop a note the Instagram agent was going by. */
  | { kind: "igforget"; id: string };

const fit = (data: string) => (Buffer.byteLength(data) <= 64 ? data : null);
export const encodeQueue = (type: CommandType, targetId: string) => fit(`q:${CODES[type]}:${targetId}`);
export const encodeUndo = (commandId: string) => `u:${commandId}`;
export const encodeTriage = (decision: TriageDecisionKind | "clear", key: string) => fit(`t:${TRIAGE_CODE[decision]}:${key}`);
export const encodePaid = (id: string, paid = true) => fit(`${paid ? "p" : "pu"}:${id}`);
export const encodeTodo = (id: string, done = true) => fit(`${done ? "n" : "nu"}:${id}`);
export const encodeRemove = (id: string) => fit(`x:${id}`);
export const encodeIgForget = (id: string) => fit(`ig:${id}`);

const ID = "([\\w-]{1,100})";
export function decodeButton(data: string): ButtonAction | null {
  if (data === "g") return { kind: "gym" };
  if (data === "td") return { kind: "today" };
  if (data === "i") return { kind: "inbox" };
  const q = /^q:([a-z]{2}):(.+)$/.exec(data);
  if (q && TYPES[q[1]]) return { kind: "queue", type: TYPES[q[1]], targetId: q[2] };
  let m = new RegExp(`^u:${ID}$`).exec(data);
  if (m) return { kind: "undo", commandId: m[1] };
  m = new RegExp(`^t:([adnc]):${ID}$`).exec(data);
  if (m) return { kind: "triage", decision: TRIAGE[m[1]], key: m[2] };
  m = new RegExp(`^(p|pu):${ID}$`).exec(data);
  if (m) return { kind: "paid", id: m[2], paid: m[1] === "p" };
  m = new RegExp(`^(n|nu):${ID}$`).exec(data);
  if (m) return { kind: "todo", id: m[2], done: m[1] === "n" };
  m = new RegExp(`^ig:${ID}$`).exec(data);
  if (m) return { kind: "igforget", id: m[1] };
  m = new RegExp(`^x:${ID}$`).exec(data);
  return m ? { kind: "remove", id: m[1] } : null;
}

export const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const clip = (s: string, max: number) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s);
const label = (b: string) => BUSINESS_LABEL[b] ?? (b === "other" ? "Other" : b);
const TZ = "America/Edmonton";
const time = (t: number) => slot(t).split(" ").slice(1).join(" ");

export function ago(t: number, now: number): string {
  const m = Math.max(0, Math.round((now - t) / 60_000));
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return h < 48 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
}

export const HELP = [
  "<b>HQ</b> on your phone. Same numbers as the dashboard.",
  "",
  "/today: your day, the way HQ's Today shows it",
  "/inbox: posts, pitches and replies to decide, one tap each",
  "/money: this month against your goal, and who owes you",
  "/gym: log today's gym visit",
  "/agent: change the site or HQ, like <i>/agent add a gym streak to Today</i>. The agent pushes it to main once the checks pass and texts you back.",
  "/mail: ask about your email, like <i>/mail did the Stampede sponsor ever reply?</i> The agent reads your calgarywatch.ca inbox and HQ's Gmail summary and texts you back.",
  "/ig: tell the Instagram agent something, like <i>/ig push Halloween stuff this week</i> or <i>/ig post this https://…</i>. /ig on its own lists what it's going by.",
  "",
  "Or just text me like a person:",
  "• <i>got paid 1200 from the Smith wedding</i> logs it to Vow Motion",
  "• <i>Ramsay Coffee owes me 400, due Friday</i> tracks it",
  "• <i>remind me to call the venue tomorrow</i> adds a to-do",
  "• <i>how's my month?</i> or <i>who replied to a pitch today?</i>",
  "Every log has an Undo button.",
  "",
  "Approvals go to the same queue as the dashboard. The agents apply them at :07 and :37, so Undo works until then.",
].join("\n");

/** The bot's command menu (Telegram's / button). */
export const MENU = [
  { command: "today", description: "Your day, like HQ's Today" },
  { command: "inbox", description: "Decide posts, pitches and replies" },
  { command: "money", description: "This month, the goal, who owes you" },
  { command: "gym", description: "Log today's gym visit" },
  { command: "agent", description: "Change the site or HQ" },
  { command: "mail", description: "Ask about your email" },
  { command: "ig", description: "Tell the Instagram agent something" },
  { command: "help", description: "What HQ can do here" },
];

export interface Button {
  text: string;
  /** What a tap sends back (callback data). */
  data?: string;
  /** Or a link it opens. */
  url?: string;
}

export interface Card {
  text: string;
  photo: string | null;
  buttons: Button[];
}

const btn = (text: string, data: string | null): Button[] => (data ? [{ text, data }] : []);

/** One line of money: what's in, against the goal, and what's owed. */
function moneyText(data: HqData, now: number): string[] {
  const money = moneyStats(data, now, "all");
  const owed = owedStats(data, now, "all");
  const lines = [`💵 ${moneyLine(money) ?? "Nothing logged this month yet."}`];
  if (owed.overdue.length) lines.push(`   ${dollars(owed.overdueTotal)} owed to you is late: ${owed.overdue.slice(0, 3).map((e) => escapeHtml(clip(e.text ?? "someone", 40))).join(", ")}${owed.overdue.length > 3 ? "…" : ""}`);
  else if (owed.total) lines.push(`   ${dollars(owed.total)} still owed to you${owed.dueSoon.length ? `, ${dollars(owed.dueSoon.reduce((n, e) => n + (e.amount ?? 0), 0))} due this week` : ""}`);
  return lines;
}

function gymText(data: HqData, now: number): string {
  const g = gymStats(data, now);
  const last = g.wentToday ? "done today ✅" : g.daysSince === null ? "nothing logged yet" : g.daysSince === 1 ? "last went yesterday" : `last went ${g.daysSince} days ago`;
  return `🏋️ Gym ${g.week}/${GYM_GOAL} this week, ${last}`;
}

/** The /today message: HQ's Today, top to bottom, from the same numbers. */
export function briefing(data: HqData, now: number): Card {
  const snap = data.snapshot;
  const queue = openDecisions(data, "all");
  const feel = mood(data, now, "all", queue.length);
  const lines: string[] = [
    `<b>${GREETING}</b> ${queue.length ? `${plural(queue.length, "thing")} ${queue.length === 1 ? "needs" : "need"} you.` : "Nothing needs you. Go find money."}`,
    `<i>${escapeHtml(feel.line)}</i>`,
    "",
    ...moneyText(data, now),
    gymText(data, now),
  ];

  const events = agenda(data, now);
  const next = events.find((e) => !e.allDay && e.end > now);
  const later = events.filter((e) => !e.allDay && e.start > now).length;
  if (next) lines.push(`📅 ${next.start <= now ? "Now" : `Next ${time(next.start)}`}: ${escapeHtml(clip(next.title, 80))}${later > 1 ? ` (+${later - 1} more today)` : ""}`);
  else lines.push(data.calendar ? "📅 Nothing else on the calendar today" : "📅 Calendar hasn't synced");

  const todos = todoStats(data, now);
  const due = [...todos.overdue, ...todos.today];
  if (due.length) lines.push(`☑️ Due: ${due.slice(0, 3).map((e) => escapeHtml(clip(e.text ?? "", 50))).join(" · ")}${due.length > 3 ? ` · +${due.length - 3}` : ""}${todos.overdue.length ? ` (${todos.overdue.length} late)` : ""}`);

  const story = brief(data, now, "all");
  if (story.length) lines.push("", ...story.map(escapeHtml));

  if (queue.length) {
    lines.push("", "<b>Clear these first</b>");
    for (const i of queue.slice(0, 5)) {
      const d = describe(i);
      lines.push(`• ${d.label}: ${escapeHtml(clip(d.title, 70))}`);
    }
    if (queue.length > 5) lines.push(`…and ${queue.length - 5} more`);
  }

  const bad = (snap?.bottlenecks ?? []).filter((b) => b.severity === "bad");
  if (bad.length) {
    lines.push("", "<b>Broken</b>");
    for (const b of bad.slice(0, 4)) lines.push(`• 🔴 ${escapeHtml(b.label)}: ${escapeHtml(b.value)}`);
  }

  lines.push("", `<i>Agents' report from ${snap ? ago(snap.generatedAt, now) : "never"}${data.gmail ? ` · Gmail ${ago(data.gmail.generatedAt, now)}` : ""}</i>`);

  const g = gymStats(data, now);
  return {
    text: lines.join("\n"),
    photo: null,
    buttons: [
      ...(queue.length ? [{ text: `📥 Decide ${queue.length}`, data: "i" }] : []),
      ...(g.wentToday ? [] : [{ text: "🏋️ I went today", data: "g" }]),
      { text: "Open HQ", url: HQ_URL },
    ],
  };
}

/** The /money message. */
export function moneyCard(data: HqData, now: number): Card {
  const money = moneyStats(data, now, "all");
  const owed = owedStats(data, now, "all");
  const month = new Date(now).toLocaleDateString("en-CA", { timeZone: TZ, month: "long" });
  const lines = [`<b>${month}: ${dollars(money.month)} in</b>`];
  if (money.goal) lines.push(money.month >= money.goal ? `Goal of ${dollars(money.goal)} hit. 🎯` : `${Math.round((money.progress ?? 0) * 100)}% of ${dollars(money.goal)}. ${dollars(money.perDayToGoal ?? 0)} a day for ${plural(money.daysLeft, "day")} closes it.`);
  lines.push(`Last month ${dollars(money.lastMonth)} · this year ${dollars(money.year)}`);
  if (money.byBusiness.length) lines.push("", ...money.byBusiness.map((b) => `• ${escapeHtml(label(b.business))}: ${dollars(b.amount)}`));
  if (owed.open.length) {
    lines.push("", `<b>Owed to you: ${dollars(owed.total)}</b>`);
    for (const e of owed.open.slice(0, 6)) {
      const late = e.due && owed.overdue.includes(e);
      lines.push(`• ${escapeHtml(clip(e.text ?? "", 60))}: ${dollars(e.amount ?? 0)}${e.due ? ` (${late ? "late since " : "due "}${new Date(e.due).toLocaleDateString("en-CA", { timeZone: TZ, month: "short", day: "numeric" })})` : ""}`);
    }
  }
  const buttons = owed.open.slice(0, 4).flatMap((e) => btn(`💵 ${clip(e.text ?? "", 20)} paid`, encodePaid(e.id)));
  return { text: lines.join("\n"), photo: null, buttons: [...buttons, { text: "Open Money", url: `${HQ_URL}#money` }] };
}

function queueCard(i: QueueItem, now: number): Card {
  switch (i.kind) {
    case "post": {
      const p = i.post;
      const flag = p.status === "drafted" ? "" : `\n⚠️ ${escapeHtml(p.error ?? p.warnings[0] ?? p.status)}`;
      return {
        text: `📝 <b>${escapeHtml(label(p.brand))} post</b>: ${escapeHtml(p.headline)}${flag}\n\n${escapeHtml(clip(p.caption, 700))}`,
        photo: p.imageUrl ?? p.imageUrls[0] ?? null,
        buttons: [...btn("Approve", encodeQueue("approve-post", p.id)), ...btn("Reject", encodeQueue("reject-post", p.id))],
      };
    }
    case "pitch": {
      const p = i.pitch;
      return {
        text: `✉️ <b>${p.followUp ? "Follow-up" : "Pitch"} to ${escapeHtml(p.businessName)}</b> (${escapeHtml(p.contactEmail ?? "no email")})\n<i>${escapeHtml(p.subject)}</i>\n\n${escapeHtml(clip(p.body, 900))}`,
        photo: null,
        buttons: [...btn("Send pitch", encodeQueue("approve-pitch", p.leadId)), ...btn("Skip", encodeQueue("skip-pitch", p.leadId))],
      };
    }
    case "reply": {
      const r = i.reply;
      return {
        text: `💬 <b>${escapeHtml(r.businessName)} replied</b> ${ago(r.at, now)} (${escapeHtml(r.classification)})\n“${escapeHtml(clip(r.text, 400))}”\n\n<b>Drafted answer</b>\n${escapeHtml(clip(r.suggestedBody, 900))}`,
        photo: null,
        buttons: [...btn("Send reply", encodeQueue("approve-reply", r.leadId)), ...btn("Handled", encodeQueue("handled-reply", r.leadId))],
      };
    }
    case "gmail":
      return mailCard(i, now);
  }
}

/** A Gmail reply on the board: what the reply check made of it, and the same calls as the dashboard. */
function mailCard(i: Extract<QueueItem, { kind: "gmail" }>, now: number): Card {
  const { reply: r, triage, decision, state } = i.item;
  const key = i.key.slice(2);
  const todo = decision?.title ?? triage?.subtask?.title;
  const lines = [`📬 <b>${escapeHtml(r.name || r.from)}</b> wrote to ${escapeHtml(label(r.business))} ${ago(r.at, now)}`, `<i>${escapeHtml(clip(r.subject, 120))}</i>`];
  if (triage) lines.push("", escapeHtml(clip(triage.reason, 300)));
  else lines.push(escapeHtml(clip(r.snippet, 300)));
  if (todo) lines.push("", `${state === "approved" ? "On your list" : "Next step"}: <b>${escapeHtml(clip(todo, 160))}</b>`);
  if (triage?.subtask?.draftReply) lines.push("", "<b>Draft reply</b>", escapeHtml(clip(triage.subtask.draftReply, 700)));
  const calls = state === "approved"
    ? btn("✔️ Done", encodeTriage("done", key))
    : [...btn("✅ Add to my list", encodeTriage("approved", key)), ...btn("👋 Not needed", encodeTriage("dismissed", key))];
  return { text: lines.join("\n"), photo: null, buttons: [...calls, { text: "Open in Gmail", url: r.url }] };
}

/** The /inbox messages: one card per open decision, in the dashboard's order, with its actions. */
export function inboxCards(data: HqData, now: number): Card[] {
  return openDecisions(data, "all").map((i) => queueCard(i, now));
}

/** What the bot says after logging something, with the number that moved. */
export function loggedText(e: LifeEntry, data: HqData, now: number): string {
  switch (e.kind) {
    case "gym": {
      const g = gymStats(data, now);
      const left = GYM_GOAL - g.week;
      return `🏋️ Gym logged. ${g.week}/${GYM_GOAL} this week${left > 0 ? `, ${left} to go.` : g.week === GYM_GOAL ? ". Goal hit 💪" : ". Above goal 💪"}`;
    }
    case "money": {
      const line = moneyLine(moneyStats(data, now, "all"));
      return `💵 Logged ${dollars(e.amount ?? 0)} for ${escapeHtml(label(e.business ?? "other"))}${e.text ? ` (${escapeHtml(clip(e.text, 60))})` : ""}.${line ? `\n${line}` : ""}`;
    }
    case "owed": {
      const o = owedStats(data, now, "all");
      return `🧾 Tracking ${dollars(e.amount ?? 0)} from ${escapeHtml(clip(e.text ?? "", 60))}${e.due ? `, due ${new Date(e.due).toLocaleDateString("en-CA", { timeZone: TZ, weekday: "short", month: "short", day: "numeric" })}` : ""}. ${dollars(o.total)} owed to you in all.${e.due ? " I'll text you the morning it's due." : ""}`;
    }
    case "note":
      return `☑️ Added: ${escapeHtml(clip(e.text ?? "", 120))}${e.due ? ` (due ${new Date(e.due).toLocaleDateString("en-CA", { timeZone: TZ, weekday: "short", month: "short", day: "numeric" })})` : ""}`;
  }
}

/** Telegram caps a message at 4096 characters; split on line breaks. */
export function chunks(text: string, max = 4000): string[] {
  const out: string[] = [];
  let current = "";
  for (const line of text.split("\n")) {
    if (current && current.length + line.length + 1 > max) {
      out.push(current);
      current = "";
    }
    current = current ? `${current}\n${line}` : line;
    while (current.length > max) {
      out.push(current.slice(0, max));
      current = current.slice(max);
    }
  }
  if (current) out.push(current);
  return out;
}

function omit<T extends object, K extends keyof T>(o: T, keys: K[]): Omit<T, K> {
  const copy = { ...o };
  for (const k of keys) delete copy[k];
  return copy;
}

/**
 * The report Claude reads to answer a question, without what it can't use
 * (image URLs, alt text). It leads with HQ's own totals (the same numbers the
 * dashboard shows) so answers about money and the gym are never Claude's own
 * arithmetic, then Aldo's log and calendar, then the agents' report and Gmail.
 * Sections are dropped whole, largest last-resort first, only if the report
 * would be too long to send.
 */
export function reportForQuestion(data: HqData, now: number, maxChars = 300_000): { json: string; omitted: string[] } {
  const snapshot = data.snapshot;
  const slim = snapshot && {
    ...snapshot,
    posts: snapshot.posts?.map((p) => omit(p, ["imageUrl", "imageUrls", "videoUrl", "altText"])),
    instagram: snapshot.instagram && {
      ...snapshot.instagram,
      accounts: snapshot.instagram.accounts.map((a) => ({ ...a, recent: a.recent.map((r) => omit(r, ["mediaUrl"])) })),
      inspiration: snapshot.instagram.inspiration.map((o) => omit(o, ["mediaUrl"])),
    },
  };
  const money = moneyStats(data, now, "all");
  const owed = owedStats(data, now, "all");
  const gym = gymStats(data, now);
  const todos = todoStats(data, now);
  const queue = openDecisions(data, "all");
  const totals = {
    note: "Computed by HQ, exactly as the dashboard shows them. Money is in cents. Quote these rather than adding up entries yourself.",
    waitingOnAldo: queue.map((i) => ({ kind: i.kind, ...describe(i), at: i.at, business: i.business })),
    money: { thisMonth: money.month, lastMonth: money.lastMonth, yearSoFar: money.year, monthlyGoal: money.goal, perDayToGoal: money.perDayToGoal, daysLeftInMonth: money.daysLeft, byBusinessThisMonth: money.byBusiness },
    owedToAldo: { total: owed.total, lateTotal: owed.overdueTotal, open: owed.open.map((e) => omit(e, ["paidId"])) },
    gym: { goalPerWeek: GYM_GOAL, thisWeek: gym.week, thisMonth: gym.month, wentToday: gym.wentToday, daysSinceLast: gym.daysSince, weeksInARowAtGoal: gym.weekStreak, costPerVisitDollars: gym.costPerVisit },
    todos: { open: todos.open, lateCount: todos.overdue.length, dueTodayCount: todos.today.length },
  };
  const life = (data.life ?? []).filter((e) => e.kind !== "note" || !e.done).filter((e) => e.at > now - 120 * 86_400_000);
  const report: Record<string, unknown> = {
    totals,
    prioritiesAndMemory: data.memories,
    experiments: data.experiments,
    intelligence: data.intelligence,
    calendar: data.calendar,
    aldoLog: life,
    snapshot: slim,
    gmail: data.gmail,
    replyCheck: data.triage?.items.map((t) => omit(t, ["fingerprint"])),
  };
  const omitted: string[] = [];
  const drops: Array<[string, () => void]> = [
    ["lead list", () => slim && (slim.pipelineDetail = undefined)],
    ["Instagram inspiration", () => slim && (slim.instagram = undefined)],
    ["Gmail sends", () => (report.gmail = data.gmail && { ...data.gmail, sends: [] })],
    ["relationship history", () => (report.intelligence = { ...data.intelligence, relationships: [] })],
    ["reply check notes", () => (report.replyCheck = undefined)],
  ];
  let json = JSON.stringify(report);
  for (const [name, drop] of drops) {
    if (json.length <= maxChars) break;
    drop();
    omitted.push(name);
    json = JSON.stringify(report);
  }
  return { json, omitted };
}

/** Notes Aldo gives the Instagram agent (/ig), in arctos-hq; Calgary-Watch-'s ops runs copy them to the agent. */
export const IG_NOTES = "hq_ig_notes";
export const IG_NOTES_MAX = 20;

export interface IgNote { id: string; text: string; at: number }

/** The text after /ig, tidied, or null when there's nothing to keep. */
export function igNoteText(message: string): string | null {
  const t = message.trim().replace(/^\/ig(@\w+)?/i, "").replace(/\s+/g, " ").trim().slice(0, 600);
  return t.length >= 3 ? t : null;
}

const hasLink = (t: string) => /https?:\/\/\S+/.test(t);

export function igSavedText(note: string): string {
  return [
    "Got it. The Instagram agent goes by this from now on:",
    `<i>${escapeHtml(note)}</i>`,
    "",
    hasLink(note)
      ? "It drafts a post from that link within the half hour; it shows up in /inbox for one tap."
      : "Captions written from now on follow it, and tomorrow morning's plan is built around it.",
  ].join("\n");
}

export function igListCards(notes: IgNote[], now: number): Card[] {
  if (!notes.length) return [{ text: "The Instagram agent has no notes from you. Send one like <i>/ig lean into Flames game days</i>.", photo: null, buttons: [] }];
  return notes.map((n) => ({ text: `<i>${escapeHtml(n.text)}</i>\n${ago(n.at, now)}`, photo: null, buttons: btn("Forget this", encodeIgForget(n.id)) }));
}
