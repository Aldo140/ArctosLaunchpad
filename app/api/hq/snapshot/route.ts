import { NextResponse } from "next/server";
import { HqAuthError, requireHqUser } from "@/lib/hq/auth";
import { readStringField } from "@/lib/hq/google";
import type { ArctosOutreach, HqResponse, HqSettings, HqSnapshot } from "@/lib/hq/types";

/**
 * Everything the /hq page shows, for a signed-in HQ account. POST so the
 * static GitHub Pages export (which can't run handlers) skips it, the same
 * way it skips /api/contact.
 */

const SENT_URL = "https://raw.githubusercontent.com/Aldo140/ArctosLaunchpad/arctos-launchpad/outreach/sent.json";
const DAY = 86_400_000;
const NO_SETTINGS: HqSettings = { balanceUsd: null, balanceAt: null, dailyCapUsd: null };

async function arctosOutreach(now: number): Promise<ArctosOutreach> {
  const r = await fetch(SENT_URL, { next: { revalidate: 600 } });
  if (!r.ok) throw new Error(`Arctos sends: HTTP ${r.status}`);
  const rows = ((await r.json()) as Array<{ business?: string; subject?: string; at?: string }>)
    .map((s) => ({ business: s.business ?? "", subject: s.subject ?? "", at: Date.parse(s.at ?? "") }))
    .filter((s) => Number.isFinite(s.at))
    .sort((a, b) => b.at - a.at);
  const calgaryDay = (t: number) => new Date(t).toLocaleDateString("en-CA", { timeZone: "America/Edmonton" });
  return {
    total: rows.length,
    last30: rows.filter((s) => s.at >= now - 30 * DAY).length,
    today: rows.filter((s) => calgaryDay(s.at) === calgaryDay(now)).length,
    lastSentAt: rows[0]?.at ?? null,
    recent: rows.slice(0, 8),
  };
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
  const [snapshot, settings, arctos] = await Promise.all([
    readStringField("hq/snapshot", "payload")
      .then((s) => (s ? (JSON.parse(s) as HqSnapshot) : null))
      .catch((e: unknown) => { errors.push(e instanceof Error ? e.message : String(e)); return null; }),
    readStringField("hq/settings", "payload")
      .then((s) => (s ? { ...NO_SETTINGS, ...(JSON.parse(s) as Partial<HqSettings>) } : NO_SETTINGS))
      .catch(() => NO_SETTINGS),
    arctosOutreach(now).catch((e: unknown) => { errors.push(e instanceof Error ? e.message : String(e)); return null; }),
  ]);

  const body: HqResponse = { viewer, snapshot, settings, arctos, errors };
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}
