import { NextResponse } from "next/server";
import { z } from "zod";
import { HqAuthError, requireHqUser } from "@/lib/hq/auth";
import { createDoc, deleteDoc, readFields } from "@/lib/hq/google";

/**
 * Queues an action taken in HQ (approve a post, send a reply…) for the ops
 * agents, which apply it on their next run with the same rules as the
 * CalgaryWatch admin. Also cancels a queued action that hasn't run yet.
 */

const types = ["approve-post", "reject-post", "redraft-post", "unschedule-post", "approve-pitch", "skip-pitch", "approve-reply", "handled-reply"] as const;

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create"),
    type: z.enum(types),
    targetId: z.string().min(1).max(200),
    payload: z
      .object({
        caption: z.string().max(2200).optional(),
        scheduledFor: z.number().optional(),
        note: z.string().max(500).optional(),
        subject: z.string().max(200).optional(),
        body: z.string().max(6000).optional(),
      })
      .default({}),
  }),
  z.object({ action: z.literal("cancel"), id: z.string().min(1).max(100) }),
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
  if (!parsed.success) return NextResponse.json({ error: "That action isn't valid." }, { status: 400 });
  const input = parsed.data;

  try {
    if (input.action === "cancel") {
      const current = await readFields(`hq_commands/${input.id}`);
      if (!current) return NextResponse.json({ ok: true });
      if (current.status !== "pending") return NextResponse.json({ error: "The agents already handled it." }, { status: 409 });
      await deleteDoc(`hq_commands/${input.id}`);
      return NextResponse.json({ ok: true });
    }
    const at = Date.now();
    const id = await createDoc("hq_commands", {
      type: input.type,
      targetId: input.targetId,
      payload: JSON.stringify(input.payload),
      by: email,
      at,
      status: "pending",
    });
    return NextResponse.json({ command: { id, type: input.type, targetId: input.targetId, by: email, at, status: "pending", result: null, appliedAt: null } });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Couldn't save that." }, { status: 502 });
  }
}
