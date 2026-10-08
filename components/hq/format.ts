const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export function ago(t: number | null | undefined, now = Date.now()): string {
  if (!t) return "never";
  const d = Math.max(0, now - t);
  if (d < HOUR) return `${Math.max(1, Math.round(d / MIN))} min ago`;
  if (d < 2 * DAY) return `${Math.round(d / HOUR)} h ago`;
  return `${Math.round(d / DAY)} days ago`;
}

export const usd = (n: number | null | undefined) =>
  n === null || n === undefined ? "—" : n < 10 ? `$${n.toFixed(2)}` : `$${Math.round(n).toLocaleString("en-CA")}`;

export const num = (n: number | null | undefined) =>
  n === null || n === undefined ? "—" : n >= 10_000 ? `${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}K` : Math.round(n).toLocaleString("en-CA");

export const pct = (n: number) => `${n.toFixed(n < 1 ? 2 : 1)}%`;

export const BUSINESS_LABEL: Record<string, string> = {
  calgarywatch: "CalgaryWatch",
  calgarydaily: "CalgaryDaily",
  vowmotion: "Vow Motion",
  arctos: "Arctos",
};

export const KIND_LABEL: Record<string, string> = {
  "post-review": "Approve post",
  "post-fix": "Fix post",
  "post-failed": "Post failed",
  reply: "Reply",
  "pitch-review": "Approve pitch",
  health: "Health",
};
