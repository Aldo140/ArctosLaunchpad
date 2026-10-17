import { workflowSummaries } from "./github";
import { queryRecent, readFields, readStringField } from "./google";
import { readLife } from "./lifeStore";
import { readDecisions, readTriage } from "./triageStore";
import { buildIntelligence } from "./intelligence";
import type { ArctosOutreach, CalendarSummary, CommandType, GmailSummary, HqCommandRecord, HqData, HqExperiment, HqMemory, HqProductEvent, HqSettings, HqSnapshot } from "./types";

/**
 * Everything HQ knows, read once. The dashboard (/api/hq/snapshot) and the
 * Telegram bot both use this, so they always show the same numbers.
 */

export type { HqData };

const SENT_URL = "https://raw.githubusercontent.com/Aldo140/ArctosLaunchpad/arctos-launchpad/outreach/sent.json";
const VOW_SENT_URL = "https://raw.githubusercontent.com/Aldo140/ArctosLaunchpad/arctos-launchpad/outreach/vow-motion-sent.json";
const DAY = 86_400_000;
const calgaryDay = (t: number) => new Date(t).toLocaleDateString("en-CA", { timeZone: "America/Edmonton" });

/** A campaign's send log from outreach.yml (Arctos, or Vow Motion since HQ took it over). */
export async function outreachLog(now: number, campaign: "arctos" | "vowmotion"): Promise<ArctosOutreach> {
  const r = await fetch(campaign === "arctos" ? SENT_URL : VOW_SENT_URL, { next: { revalidate: 300 } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const sends = ((await r.json()) as Array<{ business?: string; subject?: string; at?: string }>)
    .map((s) => ({ business: s.business ?? "", subject: s.subject ?? "", at: Date.parse(s.at ?? "") }))
    .filter((s) => Number.isFinite(s.at))
    .sort((a, b) => b.at - a.at);
  const days = new Map<string, number>();
  for (let i = 29; i >= 0; i--) days.set(calgaryDay(now - i * DAY), 0);
  for (const s of sends) {
    const d = calgaryDay(s.at);
    if (days.has(d)) days.set(d, (days.get(d) ?? 0) + 1);
  }
  return {
    total: sends.length,
    last30: sends.filter((s) => s.at >= now - 30 * DAY).length,
    today: sends.filter((s) => calgaryDay(s.at) === calgaryDay(now)).length,
    lastSentAt: sends[0]?.at ?? null,
    sendsByDay: [...days.entries()].map(([date, sent]) => ({ date, sent })),
    sends: sends.slice(0, 300),
  };
}

async function commands(now: number): Promise<HqCommandRecord[]> {
  // Two weeks: the week score compares this week with last, and both need their calls.
  const rows = await queryRecent("hq_commands", "at", now - 15 * DAY);
  return rows
    .map((r) => ({
      id: r.id,
      type: r.fields.type as CommandType,
      targetId: String(r.fields.targetId ?? ""),
      by: String(r.fields.by ?? ""),
      at: Number(r.fields.at ?? 0),
      status: (r.fields.status as HqCommandRecord["status"]) ?? "pending",
      result: (r.fields.result as string | null) ?? null,
      appliedAt: (r.fields.appliedAt as number | null) ?? null,
    }))
    .sort((a, b) => b.at - a.at);
}

async function settings(): Promise<HqSettings> {
  const f = await readFields("hq_settings/me");
  return { moneyGoal: typeof f?.moneyGoal === "number" ? f.moneyGoal : null };
}

async function memories(): Promise<HqMemory[]> {
  return (await queryRecent("hq_memories", "at", 0, 300)).map((r) => ({
    id: r.id, kind: String(r.fields.kind) as HqMemory["kind"], text: String(r.fields.text ?? ""),
    business: String(r.fields.business ?? "all") as HqMemory["business"], at: Number(r.fields.at ?? 0), by: String(r.fields.by ?? ""),
  })).filter((x) => x.text).sort((a, b) => b.at - a.at);
}

async function experiments(): Promise<HqExperiment[]> {
  return (await queryRecent("hq_experiments", "startedAt", 0, 100)).map((r) => ({
    id: r.id, title: String(r.fields.title ?? ""), hypothesis: String(r.fields.hypothesis ?? ""), metric: String(r.fields.metric ?? ""),
    business: String(r.fields.business ?? "arctos") as HqExperiment["business"], status: String(r.fields.status ?? "planned") as HqExperiment["status"],
    startedAt: Number(r.fields.startedAt ?? 0), endsAt: typeof r.fields.endsAt === "number" ? r.fields.endsAt : null,
    result: typeof r.fields.result === "string" ? r.fields.result : null, by: String(r.fields.by ?? ""),
  })).filter((x) => x.title).sort((a, b) => b.startedAt - a.startedAt);
}

async function productEvents(now: number): Promise<HqProductEvent[]> {
  return (await queryRecent("hq_product_events", "at", now - 30 * DAY, 1000)).map((r) => ({
    id: r.id, name: String(r.fields.name ?? ""), area: String(r.fields.area ?? "unknown"),
    at: Number(r.fields.at ?? 0), by: String(r.fields.by ?? ""), detail: typeof r.fields.detail === "string" ? r.fields.detail : null,
  })).filter((x) => x.name).sort((a, b) => b.at - a.at);
}

export async function loadHq(now: number): Promise<HqData> {
  const errors: string[] = [];
  const note = (label: string) => (e: unknown) => {
    errors.push(`${label}: ${e instanceof Error ? e.message : String(e)}`);
    return null;
  };
  const [snapshot, arctos, vowmotion, cmds, workflows, gmail, triage, decisions, calendar, life, mine, memory, tests, events] = await Promise.all([
    readStringField("hq/snapshot", "payload").then((s) => (s ? (JSON.parse(s) as HqSnapshot) : null)).catch(note("Agents' report")),
    outreachLog(now, "arctos").catch(note("Arctos sends")),
    outreachLog(now, "vowmotion").catch(note("Vow Motion sends")),
    commands(now).catch(note("HQ actions")),
    workflowSummaries().catch(note("Agent runs")),
    readStringField("hq/gmail", "payload").then((s) => (s ? (JSON.parse(s) as GmailSummary) : null)).catch(note("Gmail")),
    readTriage().catch(note("Reply check")),
    readDecisions(now - 45 * DAY).catch(note("Reply decisions")),
    readStringField("hq/calendar", "payload").then((s) => (s ? (JSON.parse(s) as CalendarSummary) : null)).catch(note("Calendar")),
    readLife(now).catch(note("Your log")),
    settings().catch(note("Your settings")),
    memories().catch(note("HQ memory")),
    experiments().catch(note("Experiments")),
    productEvents(now).catch(note("HQ research")),
  ]);
  const base = {
    snapshot, arctos, vowmotion, commands: cmds ?? [], workflows, gmail, triage, decisions: decisions ?? [],
    calendar, life, settings: mine, memories: memory ?? [], experiments: tests ?? [], productEvents: events ?? [], errors,
  };
  return { ...base, intelligence: buildIntelligence(base, now) };
}
