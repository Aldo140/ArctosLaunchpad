import { NextResponse } from "next/server";
import { z } from "zod";
import { HqAuthError, requireHqUser } from "@/lib/hq/auth";
import { createDoc, deleteDoc, readFields, setDoc } from "@/lib/hq/google";

const business = z.enum(["calgarywatch", "calgarydaily", "vowmotion", "arctos"]);
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("memory-add"), kind: z.enum(["preference", "rule", "person", "decision", "priority"]), text: z.string().trim().min(3).max(1000), business: z.union([business, z.literal("all")]) }),
  z.object({ action: z.literal("memory-delete"), id: z.string().regex(/^[\w-]{1,100}$/) }),
  z.object({ action: z.literal("experiment-add"), title: z.string().trim().min(3).max(160), hypothesis: z.string().trim().min(3).max(800), metric: z.string().trim().min(2).max(200), business, endsAt: z.number().int().nullable() }),
  z.object({ action: z.literal("experiment-update"), id: z.string().regex(/^[\w-]{1,100}$/), status: z.enum(["planned", "running", "won", "lost", "inconclusive"]), result: z.string().trim().max(1000).nullable() }),
  z.object({ action: z.literal("experiment-delete"), id: z.string().regex(/^[\w-]{1,100}$/) }),
  z.object({ action: z.literal("event"), name: z.string().trim().min(1).max(100), area: z.string().trim().min(1).max(100), detail: z.string().max(500).nullable().optional() }),
]);

export async function POST(request: Request) {
  let email: string;
  try { email = (await requireHqUser(request)).email; }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Sign in first." }, { status: e instanceof HqAuthError ? e.status : 401 }); }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "That improvement record is not valid." }, { status: 400 });
  const input = parsed.data, now = Date.now();
  try {
    if (input.action === "memory-add") {
      const id = await createDoc("hq_memories", { kind: input.kind, text: input.text, business: input.business, at: now, by: email });
      return NextResponse.json({ id });
    }
    if (input.action === "memory-delete") { await deleteDoc(`hq_memories/${input.id}`); return NextResponse.json({ ok: true }); }
    if (input.action === "experiment-add") {
      const id = await createDoc("hq_experiments", { title: input.title, hypothesis: input.hypothesis, metric: input.metric, business: input.business, status: "running", startedAt: now, endsAt: input.endsAt, result: null, by: email });
      return NextResponse.json({ id });
    }
    if (input.action === "experiment-update") {
      const path = `hq_experiments/${input.id}`;
      const current = await readFields(path);
      if (!current) return NextResponse.json({ error: "That experiment no longer exists." }, { status: 404 });
      await setDoc(path, { ...current, status: input.status, result: input.result, updatedAt: now, by: email });
      return NextResponse.json({ ok: true });
    }
    if (input.action === "experiment-delete") { await deleteDoc(`hq_experiments/${input.id}`); return NextResponse.json({ ok: true }); }
    const id = await createDoc("hq_product_events", { name: input.name, area: input.area, detail: input.detail ?? null, at: now, by: email });
    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not save that." }, { status: 502 });
  }
}
