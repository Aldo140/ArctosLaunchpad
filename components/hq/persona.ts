import type { HqResponse, LifeEntry } from "@/lib/hq/types";
import { inFilter, type Filter } from "./context";
import { calgaryDayStart, evaluateAll } from "./tasks";
import { replyBoard } from "@/lib/hq/triage";
import { BUSINESS_LABEL, num, plural, slot } from "./format";

/**
 * HQ's voice. Everything that makes the dashboard sound like Aldo's own
 * lives here, so the tone can be changed in one place.
 */

export const OWNER = "Aldo";

/** Arctos sends at most this many cold emails a weekday. */
export const ARCTOS_DAILY_CAP = 50;

const DAY = 86_400_000;

export function greeting(hour: number): string {
  if (hour < 5) return `Late one, ${OWNER}.`;
  if (hour < 12) return `Morning, ${OWNER}.`;
  if (hour < 17) return `Afternoon, ${OWNER}.`;
  if (hour < 22) return `Evening, ${OWNER}.`;
  return `Late one, ${OWNER}.`;
}

/** A sign-off for the bottom of the brief, picked by the day so it stays put all day. */
const SIGNOFFS = [
  "Small moves, every day.",
  "Build the thing you'd want to use.",
  "Four businesses. One you.",
  "Calgary's watching. Make it good.",
  "Ship it, then make it better.",
  "The agents did the grind. You do the calls.",
  "Momentum beats motivation.",
];
export const signoff = (now: number) => SIGNOFFS[Math.floor(calgaryDayStart(now) / DAY) % SIGNOFFS.length];

/**
 * Two or three plain sentences on what happened since this morning and what's
 * next, written from the live data. Each clause only appears when it has
 * something true to say.
 */
export function brief(data: HqResponse, now: number, filter: Filter): string[] {
  const snap = data.snapshot;
  const dayStart = calgaryDayStart(now);
  const out: string[] = [];

  const published = (snap?.posts ?? []).filter((p) => p.publishedAt && p.publishedAt >= dayStart && inFilter(filter, p.brand));
  const byBrand = new Map<string, number>();
  for (const p of published) byBrand.set(p.brand, (byBrand.get(p.brand) ?? 0) + 1);
  const postBits = [...byBrand].map(([b, n]) => `${BUSINESS_LABEL[b] ?? b} posted ${n}`);

  const weekday = !["Sat", "Sun"].includes(new Date(now).toLocaleDateString("en-CA", { timeZone: "America/Edmonton", weekday: "short" }));
  const arctosBit = inFilter(filter, "arctos") && data.arctos && weekday ? `Arctos has sent ${data.arctos.today} of ${ARCTOS_DAILY_CAP} emails` : null;

  const done = [...postBits, arctosBit].filter(Boolean) as string[];
  if (done.length) out.push(`${joinList(done)} today.`);

  const replies = replyBoard(data, (r) => inFilter(filter, r.business)).board.length + (snap?.inbox?.replies ?? []).filter((r) => !r.approved && inFilter(filter, r.business)).length;
  const failing = evaluateAll(data, now).filter((t) => (t.state === "failed" || t.state === "missed") && (filter === "all" || t.routine.owner === filter || t.routine.owner === "shared")).length;
  const asks: string[] = [];
  if (replies) asks.push(`${plural(replies, "person", "people")} wrote back and ${replies === 1 ? "is" : "are"} waiting on you`);
  if (failing) asks.push(`${plural(failing, "job")} need${failing === 1 ? "s" : ""} a look`);
  if (asks.length) out.push(`${capital(joinList(asks))}.`);

  const today = agenda(data, now).filter((e) => !e.allDay && e.end > now);
  if (today.length) out.push(`${plural(today.length, "thing")} left on your calendar, next is ${today[0].title} at ${slot(today[0].start).split(" ").slice(1).join(" ")}.`);

  const money = moneyLine(moneyStats(data, now, filter));
  if (money) out.push(money);
  const owed = owedStats(data, now, filter);
  if (owed.overdue.length) out.push(`${dollars(owed.overdueTotal)} owed to you is past due, chase ${owed.overdue.length === 1 ? owed.overdue[0].text : `${plural(owed.overdue.length, "person", "people")}`}.`);
  else if (owed.dueSoon.length) out.push(`${dollars(owed.dueSoon.reduce((n, e) => n + (e.amount ?? 0), 0))} is due to come in this week.`);

  const t = todoStats(data, now);
  if (t.overdue.length || t.today.length) out.push(`${plural(t.overdue.length + t.today.length, "to-do")} due${t.overdue.length ? `, ${t.overdue.length} late` : " today"}.`);

  const next = (snap?.posts ?? []).filter((p) => p.status === "approved" && p.scheduledFor && p.scheduledFor > now && inFilter(filter, p.brand)).sort((a, b) => a.scheduledFor! - b.scheduledFor!)[0];
  if (next) out.push(`Next post goes out ${slot(next.scheduledFor)}.`);

  if (!out.length) out.push("Quiet so far. The agents are on it.");
  return out;
}

export interface Win { key: string; at: number; text: string; business: string }

/** Good news from the last week, newest first: people who said yes, replies, milestones. */
export function wins(data: HqResponse, now: number, filter: Filter): Win[] {
  const since = now - 7 * DAY;
  const out: Win[] = [];
  for (const r of data.gmail?.replies ?? []) {
    if (r.kind === "reply" && r.toPitch && r.at >= since && inFilter(filter, r.business)) out.push({ key: `g${r.url}${r.at}`, at: r.at, business: r.business, text: `${r.name || r.from} replied to a pitch` });
  }
  for (const l of data.snapshot?.pipelineDetail?.calgarywatch?.leads ?? []) {
    if (l.replyAt && l.replyAt >= since && ["interested", "claimed", "partner"].includes(l.status) && inFilter(filter, "calgarywatch")) out.push({ key: `l${l.id}`, at: l.replyAt, business: "calgarywatch", text: `${l.businessName} is ${l.status === "partner" ? "now a partner" : l.status === "claimed" ? "claimed their listing" : "interested"}` });
  }
  for (const a of data.snapshot?.instagram?.accounts ?? []) {
    if (!inFilter(filter, a.business) || a.trend.length < 2) continue;
    const week = a.trend.filter((t) => Date.parse(t.date) >= since - DAY);
    const from = (week[0] ?? a.trend[0]).followers;
    const step = milestoneStep(a.followers);
    const crossed = Math.floor(a.followers / step) * step;
    const day = a.trend.find((t) => t.followers >= crossed);
    if (from < crossed && day) out.push({ key: `m${a.handle}${crossed}`, at: Math.min(now, Date.parse(day.date) + DAY / 2), business: a.business, text: `@${a.handle} passed ${num(crossed)} followers` });
  }
  for (const p of data.snapshot?.posts ?? []) {
    const best = p.insights ? Math.max(p.insights.views ?? 0, p.insights.reach) : 0;
    if (p.publishedAt && p.publishedAt >= since && best >= 10_000 && inFilter(filter, p.brand)) out.push({ key: `p${p.id}`, at: p.publishedAt, business: p.brand, text: `"${p.headline}" reached ${num(best)}` });
  }
  return out.sort((a, b) => b.at - a.at);
}

/** Round numbers worth celebrating: every 100 under 1K, every 500 under 10K, then every 1K. */
export function milestoneStep(n: number): number {
  return n < 1000 ? 100 : n < 10_000 ? 500 : 1000;
}

/**
 * Weekdays in a row (today included once it has a send) with at least one
 * Arctos email out. Weekends neither break nor extend it.
 */
export function outreachStreak(days: Array<{ date: string; sent: number }>, now: number): number {
  const sent = new Map(days.map((d) => [d.date, d.sent]));
  const key = (t: number) => new Date(t).toLocaleDateString("en-CA", { timeZone: "America/Edmonton" });
  const dow = (t: number) => new Date(t).toLocaleDateString("en-CA", { timeZone: "America/Edmonton", weekday: "short" });
  let streak = 0;
  for (let i = 0; i < days.length; i++) {
    const t = now - i * DAY;
    if (dow(t) === "Sat" || dow(t) === "Sun") continue;
    const n = sent.get(key(t)) ?? 0;
    if (n > 0) streak++;
    else if (i === 0) continue; // today hasn't started yet
    else break;
  }
  return streak;
}

/** The next follower milestone for an account and how far off it is. */
export function nextMilestone(followers: number): { target: number; left: number; progress: number } {
  const step = milestoneStep(followers);
  const target = (Math.floor(followers / step) + 1) * step;
  return { target, left: target - followers, progress: (followers - (target - step)) / step };
}

function joinList(xs: string[]): string {
  if (xs.length < 2) return xs.join("");
  return `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
}
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- life: the gym, the calendar, the mood ---------- */

/** Anytime Fitness. Visits a week that count as "going". */
export const GYM_GOAL = 3;
/** The membership's monthly cost in dollars, for cost per visit. Null hides it. */
export const GYM_MONTHLY: number | null = 50;

const TZ = "America/Edmonton";
const dayKey = (t: number) => new Date(t).toLocaleDateString("en-CA", { timeZone: TZ });
const GYM_WORDS = /\b(gym|workout|work out|lift|lifting|leg day|push day|pull day|anytime fitness)\b/i;

export interface GymStats {
  wentToday: boolean;
  todayId: string | null;
  lastAt: number | null;
  daysSince: number | null;
  week: number;
  month: number;
  weekStreak: number;
  costPerVisit: number | null;
}

/** Gym days come from the HQ log and from calendar events that look like a workout and already ended. */
export function gymStats(data: HqResponse, now: number): GymStats {
  const logged = (data.life ?? []).filter((e) => e.kind === "gym");
  const fromCal = (data.calendar?.events ?? []).filter((e) => !e.allDay && e.end <= now && GYM_WORDS.test(e.title)).map((e) => e.start);
  const times = [...logged.map((e) => e.at), ...fromCal].sort((a, b) => b - a);
  const days = new Set(times.map(dayKey));
  const today = dayKey(now);
  const todayStart = calgaryDayStart(now);
  const lastAt = times[0] ?? null;

  const dow = (new Date(now).toLocaleDateString("en-CA", { timeZone: TZ, weekday: "short" }));
  const sinceMonday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(dow);
  const weekStart = todayStart - sinceMonday * DAY;
  const inRange = (from: number, to: number) => [...days].filter((d) => {
    const t = Date.parse(`${d}T12:00:00-07:00`);
    return t >= from && t < to;
  }).length;
  const week = inRange(weekStart, todayStart + DAY);
  const monthStart = Date.parse(`${today.slice(0, 8)}01T00:00:00-07:00`);
  const month = inRange(monthStart, todayStart + DAY);

  let weekStreak = week >= GYM_GOAL ? 1 : 0;
  for (let w = 1; w < 13; w++) {
    if (inRange(weekStart - w * 7 * DAY, weekStart - (w - 1) * 7 * DAY) >= GYM_GOAL) weekStreak++;
    else break;
  }

  return {
    wentToday: days.has(today),
    todayId: logged.find((e) => dayKey(e.at) === today)?.id ?? null,
    lastAt,
    daysSince: lastAt === null ? null : Math.round((todayStart - calgaryDayStart(lastAt)) / DAY),
    week,
    month,
    weekStreak,
    costPerVisit: GYM_MONTHLY && month ? GYM_MONTHLY / month : null,
  };
}

/** Today's events, all-day ones first. */
export function agenda(data: HqResponse, now: number) {
  const start = calgaryDayStart(now);
  return (data.calendar?.events ?? []).filter((e) => e.start < start + DAY && e.end > start).sort((a, b) => Number(b.allDay) - Number(a.allDay) || a.start - b.start);
}

/** The first free 90 minutes today between 6 am and 10 pm, if the calendar has one. */
export function gymSlot(data: HqResponse, now: number): number | null {
  if (!data.calendar) return null;
  const start = calgaryDayStart(now);
  const busy = agenda(data, now).filter((e) => !e.allDay).map((e) => [e.start, e.end] as const);
  let t = Math.max(now, start + 6 * 3_600_000);
  t = Math.ceil(t / (15 * 60_000)) * 15 * 60_000;
  const close = start + 22 * 3_600_000;
  while (t + 90 * 60_000 <= close) {
    const clash = busy.find(([a, b]) => a < t + 90 * 60_000 && b > t);
    if (!clash) return t;
    t = Math.ceil(clash[1] / (15 * 60_000)) * 15 * 60_000;
  }
  return null;
}

export type MoodKey = "late" | "slammed" | "gym" | "winning" | "quiet" | "steady";

/**
 * HQ reads the room: how much is waiting, what just went right, the hour,
 * and the gym. The line closes the brief; the sign-off closes the page.
 */
export function mood(data: HqResponse, now: number, filter: Filter, waiting: number): { key: MoodKey; line: string } {
  const hour = Number(new Date(now).toLocaleString("en-CA", { timeZone: TZ, hour: "numeric", hour12: false })) % 24;
  const failing = evaluateAll(data, now).filter((t) => t.state === "failed" || t.state === "missed").length;
  const gym = gymStats(data, now);
  const recent = wins(data, now, filter).filter((w) => w.at >= now - DAY).length;
  const skipped = gym.daysSince ?? 99;

  if (hour >= 23 || hour < 5) return { key: "late", line: "It's late. The agents have the night shift. Get some sleep." };
  if (waiting >= 6 || failing >= 2) return { key: "slammed", line: "Heavy one. Don't spread thin: oldest first, one at a time." };
  if (!gym.wentToday && skipped >= 4) return { key: "gym", line: gym.lastAt ? `${skipped} days since the gym. The membership's paid either way, so use it.` : "No gym logged yet. Go once and tap it in." };
  if (recent) return { key: "winning", line: recent === 1 ? "Something landed today. Ride it." : `${recent} things landed today. You're on a run, keep the pressure on.` };
  if (!gym.wentToday && skipped >= 2) return { key: "gym", line: `${skipped} days since the gym. Today's a good day for it.` };
  if (!waiting) return { key: "quiet", line: "Inbox is clear. Best time to go find money." };
  return { key: "steady", line: "Steady. Keep stacking." };
}

const SIGNOFF_BY_MOOD: Record<MoodKey, string[]> = {
  late: ["Tomorrow's you says thanks.", "Close the laptop."],
  slammed: ["Breathe. It's a list, not a fire.", "Done beats perfect today."],
  gym: ["Body's a business too.", "One hour. No excuses."],
  winning: ["Money loves speed.", "Stack another one."],
  quiet: ["Quiet days build loud months.", "Go find the next yes."],
  steady: SIGNOFFS,
};
export const moodSignoff = (key: MoodKey, now: number) => {
  const list = SIGNOFF_BY_MOOD[key];
  return list[Math.floor(calgaryDayStart(now) / DAY) % list.length];
};

export interface MoneyMove { key: string; at: number; business: string; title: string; detail: string; href?: string; view?: string; who?: string }

/**
 * Who is closest to paying, closest first: people who wrote back to a pitch
 * and haven't heard from Aldo, warm CalgaryWatch leads, then follow-ups due.
 */
export function moneyMoves(data: HqResponse, now: number, filter: Filter): MoneyMove[] {
  const out: MoneyMove[] = [];
  /* Only replies the reply check says need Aldo; its subtask, when there is one, says what to do. */
  for (const { reply: r, triage, decision } of replyBoard(data, (x) => inFilter(filter, x.business)).board) {
    const todo = decision?.title ?? triage?.subtask?.title;
    out.push({ key: `g${r.url}${r.at}`, at: r.at, business: r.business, title: `${r.name || r.from} is waiting on an answer`, detail: (todo ?? r.snippet).slice(0, 110), href: r.url });
  }
  for (const l of data.snapshot?.pipelineDetail?.calgarywatch?.leads ?? []) {
    if (!inFilter(filter, "calgarywatch") || !["interested", "replied"].includes(l.status)) continue;
    out.push({ key: `l${l.id}`, who: l.businessName, at: l.replyAt ?? l.createdAt, business: "calgarywatch", title: l.status === "interested" ? `${l.businessName} is interested. Close them.` : `${l.businessName} replied`, detail: [l.category, l.neighbourhood].filter(Boolean).join(" · "), view: "pipelines" });
  }
  out.sort((a, b) => a.at - b.at);
  const due = data.snapshot?.pipelineDetail?.calgarywatch?.followUpsDue ?? 0;
  if (due && inFilter(filter, "calgarywatch")) out.push({ key: "fu", at: now, business: "calgarywatch", title: `${plural(due, "follow-up")} due`, detail: "Second touches win most deals.", view: "pipelines" });
  return out;
}

/* ---------- money in ---------- */

export interface MoneyStats {
  /** Cents, this calendar month (Calgary). */
  month: number;
  lastMonth: number;
  year: number;
  goal: number | null;
  /** 0..1 of the goal, or null without one. */
  progress: number | null;
  /** What it takes a day, for the rest of the month, to hit the goal. */
  perDayToGoal: number | null;
  byBusiness: Array<{ business: string; amount: number }>;
  entries: LifeEntry[];
  daysLeft: number;
}

export function moneyStats(data: HqResponse, now: number, filter: Filter): MoneyStats {
  const today = dayKey(now);
  const monthKey = today.slice(0, 7);
  const [y, m] = monthKey.split("-").map(Number);
  const lastKey = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
  const entries = (data.life ?? []).filter((e) => e.kind === "money" && inFilter(filter, e.business ?? "other")).sort((a, b) => b.at - a.at);
  const sum = (xs: LifeEntry[]) => xs.reduce((n, e) => n + (e.amount ?? 0), 0);
  const inMonth = entries.filter((e) => dayKey(e.at).startsWith(monthKey));
  const by = new Map<string, number>();
  for (const e of inMonth) by.set(e.business ?? "other", (by.get(e.business ?? "other") ?? 0) + (e.amount ?? 0));
  const month = sum(inMonth);
  const goal = filter === "all" ? data.settings?.moneyGoal ?? null : null;
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const daysLeft = daysInMonth - Number(today.slice(8, 10)) + 1;
  return {
    month,
    lastMonth: sum(entries.filter((e) => dayKey(e.at).startsWith(lastKey))),
    year: sum(entries.filter((e) => dayKey(e.at).startsWith(String(y)))),
    goal,
    progress: goal ? Math.min(1, month / goal) : null,
    perDayToGoal: goal && goal > month ? Math.ceil((goal - month) / Math.max(1, daysLeft)) : null,
    byBusiness: [...by].map(([business, amount]) => ({ business, amount })).sort((a, b) => b.amount - a.amount),
    entries,
    daysLeft,
  };
}

/** The money line for the brief: nothing when nothing's logged and no goal is set. */
export function moneyLine(s: MoneyStats): string | null {
  if (!s.goal && !s.month) return null;
  if (s.goal && s.month >= s.goal) return `You've hit this month's ${dollars(s.goal)} goal with ${dollars(s.month)} in.`;
  if (s.goal) return `${dollars(s.month)} of ${dollars(s.goal)} this month, ${dollars(s.perDayToGoal ?? 0)} a day closes it.`;
  return `${dollars(s.month)} in this month.`;
}

/** "$1,250" from cents; cents only when there are some. */
export function dollars(cents: number): string {
  const d = cents / 100;
  return `$${d.toLocaleString("en-CA", { minimumFractionDigits: Number.isInteger(d) ? 0 : 2, maximumFractionDigits: 2 })}`;
}

/** Cumulative money by day of the month, this month and last, for the pace chart. Cents. */
export function moneyPace(data: HqResponse, now: number, filter: Filter): { days: number; today: number; month: number[]; last: number[] } {
  const today = dayKey(now);
  const [y, m] = today.slice(0, 7).split("-").map(Number);
  const ly = m === 1 ? y - 1 : y;
  const lm = m === 1 ? 12 : m - 1;
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lastDays = new Date(Date.UTC(ly, lm, 0)).getUTCDate();
  const month = new Array(days).fill(0);
  const last = new Array(lastDays).fill(0);
  const thisKey = today.slice(0, 7);
  const lastKey = `${ly}-${String(lm).padStart(2, "0")}`;
  for (const e of data.life ?? []) {
    if (e.kind !== "money" || !inFilter(filter, e.business ?? "other")) continue;
    const k = dayKey(e.at);
    const d = Number(k.slice(8, 10)) - 1;
    if (k.startsWith(thisKey)) month[d] += e.amount ?? 0;
    else if (k.startsWith(lastKey)) last[d] += e.amount ?? 0;
  }
  for (let i = 1; i < month.length; i++) month[i] += month[i - 1];
  for (let i = 1; i < last.length; i++) last[i] += last[i - 1];
  return { days, today: Number(today.slice(8, 10)), month, last };
}

/* ---------- owed to you ---------- */

export interface OwedStats {
  open: LifeEntry[];
  total: number;
  overdue: LifeEntry[];
  overdueTotal: number;
  /** Due in the next 7 days (not yet late). */
  dueSoon: LifeEntry[];
  paid: LifeEntry[];
}

/** Money people owe Aldo: late first, then by due day, undated last. */
export function owedStats(data: HqResponse, now: number, filter: Filter): OwedStats {
  const all = (data.life ?? []).filter((e) => e.kind === "owed" && inFilter(filter, e.business ?? "other"));
  const todayStart = calgaryDayStart(now);
  const open = all.filter((e) => !e.done).sort((a, b) => (a.due ?? Infinity) - (b.due ?? Infinity) || a.at - b.at);
  const overdue = open.filter((e) => e.due && e.due < todayStart);
  const dueSoon = open.filter((e) => e.due && e.due >= todayStart && e.due < todayStart + 7 * DAY);
  const sum = (xs: LifeEntry[]) => xs.reduce((n, e) => n + (e.amount ?? 0), 0);
  return { open, total: sum(open), overdue, overdueTotal: sum(overdue), dueSoon, paid: all.filter((e) => e.done).sort((a, b) => b.at - a.at) };
}

/* ---------- to-dos ---------- */

export const openNotes = (data: HqResponse) => (data.life ?? []).filter((e) => e.kind === "note" && !e.done).sort((a, b) => b.at - a.at);

/** Noon on a Calgary day, from "2026-10-09". Due days are stored this way so they never slip across midnight. */
export const noonOf = (key: string) => Date.parse(`${key}T12:00:00-06:00`);
export const dueKey = dayKey;

export type DueState = "late" | "today" | "soon" | "later" | "none";
export function dueState(due: number | null | undefined, now: number): DueState {
  if (!due) return "none";
  const start = calgaryDayStart(now);
  if (due < start) return "late";
  if (due < start + DAY) return "today";
  if (due < start + 7 * DAY) return "soon";
  return "later";
}

/** "Late · Tue", "Today", "Tomorrow", "Fri", "Oct 24". */
export function dueLabel(due: number, now: number): string {
  const st = dueState(due, now);
  const start = calgaryDayStart(now);
  const wd = new Date(due).toLocaleDateString("en-CA", { timeZone: TZ, weekday: "short" });
  if (st === "late") return start - due < 6 * DAY ? `Late · ${wd}` : `Late · ${new Date(due).toLocaleDateString("en-CA", { timeZone: TZ, month: "short", day: "numeric" })}`;
  if (st === "today") return "Today";
  if (due < start + 2 * DAY) return "Tomorrow";
  if (st === "soon") return wd;
  return new Date(due).toLocaleDateString("en-CA", { timeZone: TZ, month: "short", day: "numeric" });
}

/** Open to-dos sorted the way you'd do them: late, today, this week, later, then undated newest first. */
export function todoStats(data: HqResponse, now: number) {
  const open = (data.life ?? []).filter((e) => e.kind === "note" && !e.done);
  const dated = open.filter((e) => e.due).sort((a, b) => a.due! - b.due!);
  const undated = open.filter((e) => !e.due).sort((a, b) => b.at - a.at);
  return {
    open: [...dated, ...undated],
    overdue: dated.filter((e) => dueState(e.due, now) === "late"),
    today: dated.filter((e) => dueState(e.due, now) === "today"),
  };
}

/* ---------- the week, scored ---------- */

export interface ScoreLine { key: string; label: string; value: number; last: number; format: "money" | "count"; view: string; goal?: number }

/**
 * This week so far against last week up to the same moment, so a Tuesday
 * isn't measured against a whole week.
 */
export function weekScore(data: HqResponse, now: number, filter: Filter): { lines: ScoreLine[]; weekStart: number } {
  const todayStart = calgaryDayStart(now);
  const dow = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(new Date(now).toLocaleDateString("en-CA", { timeZone: TZ, weekday: "short" }));
  const weekStart = todayStart - dow * DAY;
  const thisWeek = (t: number) => t >= weekStart && t <= now;
  const lastWeek = (t: number) => t >= weekStart - 7 * DAY && t <= now - 7 * DAY;
  const count = <T>(xs: T[], at: (x: T) => number, inRange: (t: number) => boolean) => xs.filter((x) => inRange(at(x))).length;
  const sumOf = <T>(xs: T[], at: (x: T) => number, v: (x: T) => number, inRange: (t: number) => boolean) => xs.reduce((n, x) => n + (inRange(at(x)) ? v(x) : 0), 0);

  const money = (data.life ?? []).filter((e) => e.kind === "money" && inFilter(filter, e.business ?? "other"));
  const noonOfDate = (d: string) => Date.parse(`${d}T12:00:00-06:00`);
  const sends: Array<{ at: number; n: number }> = [];
  if (inFilter(filter, "arctos")) for (const d of data.arctos?.sendsByDay ?? []) sends.push({ at: Math.min(noonOfDate(d.date), now), n: d.sent });
  if (inFilter(filter, "calgarywatch")) for (const d of data.snapshot?.pipelineDetail?.calgarywatch?.sendsByDay ?? []) sends.push({ at: Math.min(noonOfDate(d.date), now), n: d.sent });
  if (inFilter(filter, "vowmotion")) for (const s of data.gmail?.sends ?? []) if (s.business === "vowmotion" && s.first) sends.push({ at: s.at, n: 1 });
  const posts = (data.snapshot?.posts ?? []).filter((p) => p.publishedAt && inFilter(filter, p.brand));
  const decided = [...data.commands.map((c) => c.at), ...(data.decisions ?? []).map((d) => d.at)];

  // Gym days, counted once a day, from the log and the calendar.
  const gymDays = new Map<string, number>();
  for (const e of data.life ?? []) if (e.kind === "gym") gymDays.set(dayKey(e.at), e.at);
  for (const e of data.calendar?.events ?? []) if (!e.allDay && e.end <= now && GYM_WORDS.test(e.title)) gymDays.set(dayKey(e.start), e.start);
  const gym = [...gymDays.values()];

  return {
    weekStart,
    lines: [
      { key: "money", label: "Money in", value: sumOf(money, (e) => e.at, (e) => e.amount ?? 0, thisWeek), last: sumOf(money, (e) => e.at, (e) => e.amount ?? 0, lastWeek), format: "money", view: "money" },
      { key: "gym", label: "Gym", value: count(gym, (t) => t, thisWeek), last: count(gym, (t) => t, lastWeek), format: "count", view: "life", goal: GYM_GOAL },
      { key: "sent", label: "Pitches sent", value: sumOf(sends, (s) => s.at, (s) => s.n, thisWeek), last: sumOf(sends, (s) => s.at, (s) => s.n, lastWeek), format: "count", view: "pipelines" },
      { key: "posts", label: "Posts out", value: count(posts, (p) => p.publishedAt!, thisWeek), last: count(posts, (p) => p.publishedAt!, lastWeek), format: "count", view: "growth" },
      { key: "decided", label: "Calls made", value: count(decided, (t) => t, thisWeek), last: count(decided, (t) => t, lastWeek), format: "count", view: "decide" },
    ],
  };
}
