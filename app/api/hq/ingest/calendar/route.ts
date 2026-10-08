import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { writeStringField } from "@/lib/hq/google";
import type { CalendarSummary } from "@/lib/hq/types";

/**
 * The calendar sync (ops/gmail/hq-calendar.gs, beside the Gmail sync) posts
 * the next week of Aldo's Google Calendar here every 15 minutes, with the same
 * key as the Gmail sync (HQ_GMAIL_KEY). Stored in arctos-hq (hq/calendar).
 */

const text = (max: number) => z.string().transform((s) => s.slice(0, max));

const Summary = z.object({
  generatedAt: z.number(),
  events: z.array(z.object({
    title: text(200),
    start: z.number(),
    end: z.number(),
    allDay: z.boolean(),
    location: text(200),
  })).max(400),
});

function keyMatches(given: string | null): boolean {
  const expected = process.env.HQ_GMAIL_KEY;
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!keyMatches(request.headers.get("x-hq-key"))) return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  const parsed = Summary.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.slice(0, 3).map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") }, { status: 400 });
  const summary: CalendarSummary = { ...parsed.data, events: parsed.data.events.sort((a, b) => a.start - b.start) };
  await writeStringField("hq/calendar", "payload", JSON.stringify(summary));
  return NextResponse.json({ ok: true, events: summary.events.length });
}
