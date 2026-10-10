import { NextResponse } from "next/server";
import { HqAuthError, requireHqUser } from "@/lib/hq/auth";
import { workflowSummaries } from "@/lib/hq/github";
import { queryRecent, readFields, readStringField } from "@/lib/hq/google";
import { readDecisions, readTriage } from "@/lib/hq/triageStore";
import type { ArctosOutreach, CalendarSummary, CommandType, GmailSummary, HqCommandRecord, HqResponse, HqSettings, HqSnapshot, LifeEntry } from "@/lib/hq/types";

/**
 * Everything the /hq page shows, for a signed-in HQ account. POST so the
 * static GitHub Pages export (which can't run handlers) skips it, the same
 * way it skips /api/contact.
 */

const SENT_URL = "https://raw.githubusercontent.com/Aldo140/ArctosLaunchpad/arctos-launchpad/outreach/sent.json";
const DAY = 86_400_000;
const calgaryDay = (t: number) => new Date(t).toLocaleDateString("en-CA", { timeZone: "America/Edmonton" });

async function arctosOutreach(now: number): Promise<ArctosOutreach> {
  const r = await fetch(SENT_URL, { next: { revalidate: 600 } });
  if (!r.ok) throw new Error(`Arctos sends: HTTP ${r.status}`);
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
  const rows = await queryRecent("hq_commands", "at", now - 2 * DAY);
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

async function life(now: number): Promise<LifeEntry[]> {
  // A year and a bit, so the money page can show the year so far.
  const rows = await queryRecent("hq_life", "at", now - 400 * DAY, 2000);
  return rows
    .filter((r) => ["gym", "money", "note", "owed"].includes(String(r.fields.kind)))
    .map((r): LifeEntry => {
      const f = r.fields;
      const base = { id: r.id, kind: f.kind as LifeEntry["kind"], at: Number(f.at ?? 0) };
      if (f.kind === "money") return { ...base, amount: Number(f.amount ?? 0), business: String(f.business ?? "other"), text: String(f.text ?? "") };
      const due = typeof f.due === "number" ? f.due : null;
      if (f.kind === "note") return { ...base, text: String(f.text ?? ""), done: Number(f.done ?? 0) === 1, due };
      if (f.kind === "owed") return { ...base, amount: Number(f.amount ?? 0), business: String(f.business ?? "other"), text: String(f.text ?? ""), done: Number(f.done ?? 0) === 1, due, paidId: typeof f.paidId === "string" ? f.paidId : null };
      return base;
    })
    .sort((a, b) => b.at - a.at);
}

async function settings(): Promise<HqSettings> {
  const f = await readFields("hq_settings/me");
  return { moneyGoal: typeof f?.moneyGoal === "number" ? f.moneyGoal : null };
}

export async function POST(request: Request) {
  let viewer: string;
  try {
    viewer = (await requireHqUser(request)).email;
  } catch (e) {
    const status = e instanceof HqAuthError ? e.status : 401;
    return NextResponse.json({ error: e instanceof Error ? e.message : "Sign in to open HQ." }, { status });
  }

  const now = Date.now();
  const errors: string[] = [];
  const note = (label: string) => (e: unknown) => {
    errors.push(`${label}: ${e instanceof Error ? e.message : String(e)}`);
    return null;
  };
  const [snapshot, arctos, cmds, workflows, gmail, triage, decisions, calendar, lifeLog, mine] = await Promise.all([
    readStringField("hq/snapshot", "payload").then((s) => (s ? (JSON.parse(s) as HqSnapshot) : null)).catch(note("Agents' report")),
    arctosOutreach(now).catch(note("Arctos sends")),
    commands(now).catch(note("HQ actions")),
    workflowSummaries().catch(note("Agent runs")),
    readStringField("hq/gmail", "payload").then((s) => (s ? (JSON.parse(s) as GmailSummary) : null)).catch(note("Gmail")),
    readTriage().catch(note("Reply check")),
    readDecisions(now - 45 * DAY).catch(note("Reply decisions")),
    readStringField("hq/calendar", "payload").then((s) => (s ? (JSON.parse(s) as CalendarSummary) : null)).catch(note("Calendar")),
    life(now).catch(note("Your log")),
    settings().catch(note("Your settings")),
  ]);

  const body: HqResponse = { viewer, snapshot, arctos, commands: cmds ?? [], workflows, gmail, triage, decisions: decisions ?? [], calendar, life: lifeLog, settings: mine, errors };
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}
