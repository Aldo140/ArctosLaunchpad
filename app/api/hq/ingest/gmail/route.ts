import { timingSafeEqual } from "node:crypto";
import { NextResponse, after } from "next/server";
import { z } from "zod";
import { writeStringField } from "@/lib/hq/google";
import { runTriage, triageConfigured } from "@/lib/hq/triageAgent";
import { vercelTriageStore } from "@/lib/hq/triageStore";
import type { GmailSummary } from "@/lib/hq/types";

/**
 * The Gmail sync (ops/gmail/hq-sync.gs) posts here every 15 minutes with the
 * key in HQ_GMAIL_KEY. The summary is stored in arctos-hq (hq/gmail) and read
 * by /api/hq/snapshot; nothing here is public. When ANTHROPIC_API_KEY is set
 * here, the reply check (lib/hq/triageAgent.ts) then looks at any reply that
 * is new or whose surroundings changed; without it, the ops agents' hourly
 * run does (ops/reply-check.ts).
 */

// The reply check runs after the response, inside this function's time.
export const maxDuration = 300;

const business = z.enum(["calgarywatch", "calgarydaily", "vowmotion", "arctos", "other"]);
const text = (max: number) => z.string().transform((s) => s.slice(0, max));

const Summary = z.object({
  generatedAt: z.number(),
  account: text(120),
  days: z.number().int().min(1).max(90),
  sends: z.array(z.object({
    at: z.number(),
    alias: text(120),
    business,
    to: text(200),
    domain: text(120),
    subject: text(200),
    first: z.boolean(),
    wrongAlias: business.nullable(),
    replied: z.boolean(),
    url: text(300),
  })).max(1500),
  replies: z.array(z.object({
    at: z.number(),
    alias: text(120),
    business,
    from: text(200),
    name: text(120),
    subject: text(200),
    snippet: text(240),
    kind: z.enum(["reply", "auto", "optout", "bounce"]),
    toPitch: z.boolean(),
    answered: z.boolean(),
    url: text(300),
    thread: z.array(z.object({ at: z.number(), ours: z.boolean(), from: text(200), text: text(800) })).max(8).optional(),
  })).max(500),
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
  const summary: GmailSummary = {
    ...parsed.data,
    // Newest first, and small enough for one Firestore document (1 MB).
    sends: parsed.data.sends.sort((a, b) => b.at - a.at).slice(0, 1200),
    replies: parsed.data.replies.sort((a, b) => b.at - a.at).slice(0, 400),
  };
  await writeStringField("hq/gmail", "payload", JSON.stringify(summary));
  // With a key on Vercel the check runs right away; otherwise the ops agents' hourly run does it.
  if (triageConfigured()) after(() => runTriage(summary, vercelTriageStore).catch((e) => console.error(`[reply-check] ${e instanceof Error ? e.message : e}`)));
  return NextResponse.json({ ok: true, sends: summary.sends.length, replies: summary.replies.length });
}
