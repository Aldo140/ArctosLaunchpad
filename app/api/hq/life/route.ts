import { NextResponse } from "next/server";
import { z } from "zod";
import { HqAuthError, requireHqUser } from "@/lib/hq/auth";
import { BUSINESSES, LifeGone, addNote, addOwed, logGym, logMoney, removeLife, setMoneyGoal, setNote, setOwedPaid } from "@/lib/hq/lifeWrites";

/**
 * Aldo's personal log, written from HQ: gym visits (today or a day he forgot
 * to log), money that came in, money someone owes him (and marking it paid),
 * to-dos with an optional due day, the monthly money goal, and undo. Entries live in arctos-hq (hq_life, settings in hq_settings/me) and
 * come back with /api/hq/snapshot. The Telegram bot writes the same entries (lib/hq/lifeWrites.ts).
 */

const BUSINESS = z.enum(BUSINESSES);

/** A due day: within a year either side, sent as noon Calgary time. */
const DUE = z.number().int().nullable().optional();

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("log"), kind: z.literal("gym"), at: z.number().int().optional() }),
  z.object({ action: z.literal("money"), amount: z.number().int().min(1).max(100_000_000), business: BUSINESS, text: z.string().max(200).default(""), at: z.number().int().optional() }),
  z.object({ action: z.literal("note"), text: z.string().trim().min(1).max(500), due: DUE, at: z.number().int().optional() }),
  z.object({ action: z.literal("note-done"), id: z.string().min(1).max(100), done: z.boolean() }),
  z.object({ action: z.literal("note-due"), id: z.string().min(1).max(100), due: DUE }),
  z.object({ action: z.literal("owed"), amount: z.number().int().min(1).max(100_000_000), business: BUSINESS, text: z.string().trim().min(1).max(200), due: DUE, at: z.number().int().optional() }),
  z.object({ action: z.literal("owed-paid"), id: z.string().min(1).max(100), paid: z.boolean() }),
  z.object({ action: z.literal("goal"), amount: z.number().int().min(0).max(100_000_000).nullable() }),
  z.object({ action: z.literal("undo"), id: z.string().min(1).max(100) }),
]);

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
        await removeLife(input.id);
        return NextResponse.json({ ok: true });
      case "goal":
        await setMoneyGoal(input.amount, email, now);
        return NextResponse.json({ ok: true });
      case "note-done":
        await setNote(input.id, now, { done: input.done });
        return NextResponse.json({ ok: true });
      case "note-due":
        await setNote(input.id, now, { due: input.due ?? null });
        return NextResponse.json({ ok: true });
      case "note":
        return NextResponse.json({ entry: await addNote(email, now, input) });
      case "owed":
        return NextResponse.json({ entry: await addOwed(email, now, input) });
      case "owed-paid": {
        const { entry, paidId } = await setOwedPaid(input.id, input.paid, email, now);
        return NextResponse.json(entry ? { entry, paidId } : paidId ? { ok: true, paidId } : { ok: true });
      }
      case "money":
        return NextResponse.json({ entry: await logMoney(email, now, input) });
      case "log":
        return NextResponse.json({ entry: await logGym(email, now, input.at) });
    }
  } catch (e) {
    if (e instanceof LifeGone) return NextResponse.json({ error: e.message }, { status: 404 });
    return NextResponse.json({ error: e instanceof Error ? e.message : "Couldn't save that." }, { status: 502 });
  }
}
