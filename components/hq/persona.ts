import type { HqResponse } from "@/lib/hq/types";
import { inFilter, type Filter } from "./context";
import { calgaryDayStart, evaluateAll } from "./tasks";
import { gmailWaiting } from "./views/GmailPipeline";
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

  const replies = gmailWaiting(data.gmail, (b) => inFilter(filter, b)).length + (snap?.inbox?.replies ?? []).filter((r) => !r.approved && inFilter(filter, r.business)).length;
  const failing = evaluateAll(data, now).filter((t) => (t.state === "failed" || t.state === "missed") && (filter === "all" || t.routine.owner === filter || t.routine.owner === "shared")).length;
  const asks: string[] = [];
  if (replies) asks.push(`${plural(replies, "person", "people")} wrote back and ${replies === 1 ? "is" : "are"} waiting on you`);
  if (failing) asks.push(`${plural(failing, "job")} need${failing === 1 ? "s" : ""} a look`);
  if (asks.length) out.push(`${capital(joinList(asks))}.`);

  const today = agenda(data, now).filter((e) => !e.allDay && e.end > now);
  if (today.length) out.push(`${plural(today.length, "thing")} left on your calendar, next is ${today[0].title} at ${slot(today[0].start).split(" ").slice(1).join(" ")}.`);

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
export const GYM_MONTHLY: number | null = null;

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

export interface MoneyMove { key: string; at: number; business: string; title: string; detail: string; href?: string; view?: string }

/**
 * Who is closest to paying, closest first: people who wrote back to a pitch
 * and haven't heard from Aldo, warm CalgaryWatch leads, then follow-ups due.
 */
export function moneyMoves(data: HqResponse, now: number, filter: Filter): MoneyMove[] {
  const out: MoneyMove[] = [];
  for (const r of gmailWaiting(data.gmail, (b) => inFilter(filter, b))) {
    out.push({ key: `g${r.url}${r.at}`, at: r.at, business: r.business, title: `${r.name || r.from} is waiting on an answer`, detail: r.snippet.slice(0, 110), href: r.url });
  }
  for (const l of data.snapshot?.pipelineDetail?.calgarywatch?.leads ?? []) {
    if (!inFilter(filter, "calgarywatch") || !["interested", "replied"].includes(l.status)) continue;
    out.push({ key: `l${l.id}`, at: l.replyAt ?? l.createdAt, business: "calgarywatch", title: l.status === "interested" ? `${l.businessName} is interested. Close them.` : `${l.businessName} replied`, detail: [l.category, l.neighbourhood].filter(Boolean).join(" · "), view: "pipelines" });
  }
  out.sort((a, b) => a.at - b.at);
  const due = data.snapshot?.pipelineDetail?.calgarywatch?.followUpsDue ?? 0;
  if (due && inFilter(filter, "calgarywatch")) out.push({ key: "fu", at: now, business: "calgarywatch", title: `${plural(due, "follow-up")} due`, detail: "Second touches win most deals.", view: "pipelines" });
  return out;
}
