import type { Business } from "@/lib/hq/types";

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const TZ = "America/Edmonton";

export function ago(t: number | null | undefined, now = Date.now()): string {
  if (!t) return "never";
  const d = now - t;
  if (d < 0) return until(t, now);
  if (d < HOUR) return `${Math.max(1, Math.round(d / MIN))} min ago`;
  if (d < 2 * DAY) return `${Math.round(d / HOUR)} h ago`;
  return `${Math.round(d / DAY)} days ago`;
}

export function until(t: number, now = Date.now()): string {
  const d = t - now;
  if (d <= 0) return "now";
  if (d < HOUR) return `in ${Math.max(1, Math.round(d / MIN))} min`;
  if (d < 2 * DAY) return `in ${Math.round(d / HOUR)} h`;
  return `in ${Math.round(d / DAY)} days`;
}

/** "Thu 8 Oct, 5:00 pm", Calgary time. */
export function when(t: number | null | undefined): string {
  if (!t) return "—";
  return new Date(t).toLocaleString("en-CA", { timeZone: TZ, weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export function calgaryParts(t: number) {
  const d = new Date(t);
  return {
    weekday: d.toLocaleDateString("en-CA", { timeZone: TZ, weekday: "long" }),
    date: d.toLocaleDateString("en-CA", { timeZone: TZ, month: "long", day: "numeric" }),
    hour: Number(d.toLocaleString("en-CA", { timeZone: TZ, hour: "numeric", hour12: false })),
  };
}

export const num = (n: number | null | undefined) =>
  n === null || n === undefined ? "—" : n >= 10_000 ? `${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}K` : Math.round(n).toLocaleString("en-CA");

export const pct = (n: number | null | undefined) => (n === null || n === undefined ? "—" : `${n.toFixed(n < 1 ? 2 : 1)}%`);

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export const BUSINESSES: Array<{ id: Business; label: string; handle: string }> = [
  { id: "calgarydaily", label: "CalgaryDaily", handle: "calgarydaily" },
  { id: "calgarywatch", label: "CalgaryWatch", handle: "calgarywatch" },
  { id: "vowmotion", label: "Vow Motion", handle: "vowmotion" },
  { id: "arctos", label: "Arctos", handle: "arctoslaunchpad" },
];
export const BUSINESS_LABEL: Record<string, string> = Object.fromEntries(BUSINESSES.map((b) => [b.id, b.label]));

export const STATUS_LABEL: Record<string, string> = {
  drafted: "Waiting for you",
  approved: "Scheduled",
  published: "Published",
  failed: "Failed",
  "needs-correction": "Needs a fix",
  redraft: "Redrafting",
  requested: "Being drafted",
  rejected: "Rejected",
};

export const LEAD_STAGE: Record<string, { label: string; sev: "ok" | "warn" | "bad" | "idle" }> = {
  new: { label: "Found", sev: "idle" },
  "no-email": { label: "No email", sev: "idle" },
  blocked: { label: "Blocked", sev: "bad" },
  ready: { label: "Pitch ready", sev: "warn" },
  approved: { label: "Sending", sev: "ok" },
  contacted: { label: "Contacted", sev: "idle" },
  "follow-up-ready": { label: "Follow-up ready", sev: "warn" },
  replied: { label: "Replied", sev: "ok" },
  interested: { label: "Interested", sev: "ok" },
  claimed: { label: "Claimed", sev: "ok" },
  partner: { label: "Partner", sev: "ok" },
  "not-interested": { label: "Not interested", sev: "idle" },
  "no-response": { label: "No response", sev: "idle" },
  "do-not-contact": { label: "Opted out", sev: "bad" },
};

/** jsDelivr serves the agents' rendered images from GitHub with a CDN in front. */
export const cdn = (url: string | null | undefined) => {
  if (!url) return null;
  const m = url.match(/^https:\/\/raw\.githubusercontent\.com\/([^/]+\/[^/]+)\/ops-media\/(.+)$/);
  return m ? `https://cdn.jsdelivr.net/gh/${m[1]}@ops-media/${m[2]}` : url;
};

/** Compact relative time for tight spots: "12m", "5h", "3d", or "in 16h". */
export function short(t: number | null | undefined, now = Date.now()): string {
  if (!t) return "—";
  const d = Math.abs(now - t);
  const v = d < HOUR ? `${Math.max(1, Math.round(d / MIN))}m` : d < 2 * DAY ? `${Math.round(d / HOUR)}h` : `${Math.round(d / DAY)}d`;
  return t > now ? `in ${v}` : `${v} ago`;
}

/** "Thu 7:47 pm", Calgary time. */
export function slot(t: number | null | undefined): string {
  if (!t) return "—";
  const d = new Date(t);
  const day = d.toLocaleDateString("en-CA", { timeZone: TZ, weekday: "short" });
  const time = d.toLocaleTimeString("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).replace(" AM", " am").replace(" PM", " pm");
  return `${day} ${time}`;
}
