import { NextResponse } from "next/server";
import { z } from "zod";
import { HqAuthError, requireHqUser } from "@/lib/hq/auth";
import { createDoc, deleteDoc, readFields, setDoc } from "@/lib/hq/google";

/**
 * Aldo's personal log, written from HQ: gym visits (today or a day he forgot
 * to log), money that came in, notes to self, the monthly money goal, and
 * undo. Entries live in arctos-hq (hq_life, settings in hq_settings/me) and
 * come back with /api/hq/snapshot.
 */

const DAY = 86_400_000;
const BUSINESS = z.enum(["calgarywatch", "calgarydaily", "vowmotion", "arctos", "other"]);

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("log"), kind: z.literal("gym"), at: z.number().int().optional() }),
  z.object({ action: z.literal("money"), amount: z.number().int().min(1).max(100_000_000), business: BUSINESS, text: z.string().max(200).default(""), at: z.number().int().optional() }),
  z.object({ action: z.literal("note"), text: z.string().trim().min(1).max(500) }),
  z.object({ action: z.literal("note-done"), id: z.string().min(1).max(100), done: z.boolean() }),
  z.object({ action: z.literal("goal"), amount: z.number().int().min(0).max(100_000_000).nullable() }),
  z.object({ action: z.literal("undo"), id: z.string().min(1).max(100) }),
]);

/** A past day is fine (a forgotten log), the future and the distant past aren't. */
const when = (at: number | undefined, now: number) => (at === undefined ? now : Math.min(now, Math.max(now - 90 * DAY, at)));

export async function POST(request: Request) {
  let email: string;
  try {
    email = (await requireHqUser(request)).email;
  } catch (e) {
    const status = e instanceof HqAuthError ? e.status : 401;
    return NextResponse.json({ error: e instanceof Error ? e.message : "Sign in to open HQ." }, { status });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "That isn't valid." }, { status: 400 });
  const input = parsed.data;
  const now = Date.now();
  try {
    switch (input.action) {
      case "undo":
        await deleteDoc(`hq_life/${input.id}`);
        return NextResponse.json({ ok: true });
      case "goal":
        await setDoc("hq_settings/me", { moneyGoal: input.amount, by: email, at: now });
        return NextResponse.json({ ok: true });
      case "note-done": {
        const doc = await readFields(`hq_life/${input.id}`);
        if (!doc || doc.kind !== "note") return NextResponse.json({ error: "That note is gone." }, { status: 404 });
        await setDoc(`hq_life/${input.id}`, { ...doc, done: input.done ? 1 : 0 });
        return NextResponse.json({ ok: true });
      }
      case "note": {
        const id = await createDoc("hq_life", { kind: "note", at: now, text: input.text, done: 0, by: email });
        return NextResponse.json({ entry: { id, kind: "note", at: now, text: input.text, done: false } });
      }
      case "money": {
        const at = when(input.at, now);
        const id = await createDoc("hq_life", { kind: "money", at, amount: input.amount, business: input.business, text: input.text, by: email });
        return NextResponse.json({ entry: { id, kind: "money", at, amount: input.amount, business: input.business, text: input.text } });
      }
      case "log": {
        const at = when(input.at, now);
        const id = await createDoc("hq_life", { kind: input.kind, at, by: email });
        return NextResponse.json({ entry: { id, kind: input.kind, at } });
      }
    }
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Couldn't save that." }, { status: 502 });
  }
}
