import type { ArctosOutreach, HqSnapshot, WorkflowSummary } from "./types";

/**
 * Did outreach actually go out? One place that answers it, for the HQ
 * calendar, Today's timeline and the bot's checks. A run that worked but sent
 * nothing isn't proof; the send logs are.
 *
 * CalgaryWatch sends from Calgary-Watch-'s ops job (counts from the snapshot);
 * Arctos and Vow Motion from outreach.yml (their send logs, and the runs).
 */

const TZ = "America/Edmonton";
const DAY = 86_400_000;
export const OUTREACH_CAP = 50;

export type CampaignId = "calgarywatch" | "arctos" | "vowmotion";
export const CAMPAIGNS: Array<{ id: CampaignId; label: string; endsAt: number }> = [
  // When each one's send window closes, in Calgary minutes: after that, nothing sent means it didn't happen.
  { id: "calgarywatch", label: "CalgaryWatch", endsAt: 16 * 60 + 30 },
  { id: "arctos", label: "Arctos", endsAt: 16 * 60 + 30 },
  { id: "vowmotion", label: "Vow Motion", endsAt: 15 * 60 },
];

export interface OutreachInput {
  snapshot: HqSnapshot | null;
  arctos: ArctosOutreach | null;
  vowmotion?: ArctosOutreach | null;
  workflows: WorkflowSummary[] | null;
}

export type DayState = "ok" | "failed" | "missed" | "waiting" | "off";
export interface CampaignDay { date: string; sent: number; failedRuns: number; state: DayState }

export const calgaryDate = (t: number) => new Date(t).toLocaleDateString("en-CA", { timeZone: TZ });
const calgaryMinutes = (t: number) => {
  const [h, m] = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, hour: "numeric", minute: "numeric", hourCycle: "h23" }).format(new Date(t)).split(":").map(Number);
  return h * 60 + m;
};
const isWeekend = (date: string) => [0, 6].includes(new Date(`${date}T12:00:00Z`).getUTCDay());

/** Sends per Calgary day for a campaign. */
function sentByDay(input: OutreachInput, id: CampaignId): Map<string, number> {
  const rows = id === "calgarywatch" ? input.snapshot?.pipelineDetail?.calgarywatch?.sendsByDay ?? []
    : id === "arctos" ? input.arctos?.sendsByDay ?? [] : input.vowmotion?.sendsByDay ?? [];
  return new Map(rows.map((r) => [r.date, r.sent]));
}

/** Runs of the workflow that sends a campaign. */
export function senderRuns(input: OutreachInput, id: CampaignId): WorkflowSummary["runs"] {
  const repo = id === "calgarywatch" ? "Aldo140/Calgary-Watch-" : "Aldo140/ArctosLaunchpad";
  const file = id === "calgarywatch" ? "ops-hourly.yml" : "outreach.yml";
  return input.workflows?.find((w) => w.repo === repo && w.file === file)?.runs ?? [];
}

export type CalendarRow = { id: CampaignId | "runs"; label: string; days: CampaignDay[] };

/**
 * The last `days` days, oldest first: a row per business with what went out,
 * then a row for the send runs themselves (outreach.yml sends Arctos and Vow
 * Motion in the same run, so a failed run belongs to neither alone).
 */
export function outreachCalendar(input: OutreachInput, now: number, days = 7): CalendarRow[] {
  const today = calgaryDate(now);
  const late = (date: string, endsAt: number) => date === today && calgaryMinutes(now) < endsAt;
  const dates = Array.from({ length: days }, (_, i) => calgaryDate(now - (days - 1 - i) * DAY));
  const rows: CalendarRow[] = CAMPAIGNS.map((c) => {
    const sent = sentByDay(input, c.id);
    return {
      id: c.id, label: c.label,
      days: dates.map((date) => {
        const n = sent.get(date) ?? 0;
        const state: DayState = n > 0 ? "ok" : isWeekend(date) ? "off" : late(date, c.endsAt) ? "waiting" : "missed";
        return { date, sent: n, failedRuns: 0, state };
      }),
    };
  });
  // GitHub returns the latest 100 runs; days before the oldest of them have no record.
  const runs = senderRuns(input, "arctos");
  const known = runs.length ? calgaryDate(Math.min(...runs.map((r) => r.at))) : today;
  rows.push({
    id: "runs", label: "Send runs",
    days: dates.map((date) => {
      const that = runs.filter((r) => calgaryDate(r.at) === date);
      const failedRuns = that.filter((r) => r.status === "failure").length;
      const state: DayState = failedRuns ? "failed" : that.some((r) => r.status === "success") ? "ok"
        : isWeekend(date) || date < known ? "off" : late(date, 16 * 60 + 30) ? "waiting" : "missed";
      return { date, sent: that.length, failedRuns, state };
    }),
  });
  return rows;
}

export interface RunResult { at: number; end: number | null; status: WorkflowSummary["lastStatus"]; url: string; arctos: number; vowmotion: number }

/**
 * Today's outreach.yml runs that did something: sent email, or failed. Sends
 * are matched to a run by time, since a run writes its log as it ends.
 */
export function outreachRunsToday(input: OutreachInput, now: number): RunResult[] {
  const today = calgaryDate(now);
  const within = (log: ArctosOutreach | null | undefined, from: number, to: number) => (log?.sends ?? []).filter((s) => s.at >= from && s.at <= to).length;
  return senderRuns(input, "arctos")
    .filter((r) => calgaryDate(r.at) === today)
    .map((r) => {
      const to = (r.end ?? now) + 60_000;
      return { at: r.at, end: r.end, status: r.status, url: r.url, arctos: within(input.arctos, r.at - 60_000, to), vowmotion: within(input.vowmotion, r.at - 60_000, to) };
    })
    .filter((r) => r.status === "failure" || r.arctos + r.vowmotion > 0)
    .sort((a, b) => a.at - b.at);
}

/** Today, per business (sent, and whether that's a success), and how many send runs failed. */
export function outreachToday(input: OutreachInput, now: number): { campaigns: Array<{ id: CampaignId; label: string; sent: number; state: DayState }>; failedRuns: number } {
  const rows = outreachCalendar(input, now, 1);
  return {
    campaigns: rows.filter((r) => r.id !== "runs").map((r) => ({ id: r.id as CampaignId, label: r.label, sent: r.days[0].sent, state: r.days[0].state })),
    failedRuns: rows.find((r) => r.id === "runs")?.days[0].failedRuns ?? 0,
  };
}
