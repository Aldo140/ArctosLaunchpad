import type { HqResponse } from "@/lib/hq/types";
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
