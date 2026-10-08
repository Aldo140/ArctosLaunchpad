import { NextResponse } from "next/server";
import { z } from "zod";
import { HqAuthError, requireHqUser } from "@/lib/hq/auth";
import { createDoc, deleteDoc } from "@/lib/hq/google";

/**
 * Aldo's personal log, written from HQ: "I went to the gym" today, and undo.
 * Entries live in arctos-hq (hq_life) and come back with /api/hq/snapshot.
 */

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("log"), kind: z.literal("gym") }),
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
  try {
    if (input.action === "undo") {
      await deleteDoc(`hq_life/${input.id}`);
      return NextResponse.json({ ok: true });
    }
    const at = Date.now();
    const id = await createDoc("hq_life", { kind: input.kind, at, by: email });
    return NextResponse.json({ entry: { id, kind: input.kind, at } });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Couldn't save that." }, { status: 502 });
  }
}
