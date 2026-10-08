import { NextResponse } from "next/server";
import { z } from "zod";
import { HqAuthError, requireHqUser } from "@/lib/hq/auth";
import { deleteDoc, setDoc } from "@/lib/hq/google";

/**
 * Aldo's call on a checked Gmail reply: approve the proposed subtask (maybe
 * reworded), wave it off, put a filtered reply back on the board, or mark the
 * subtask done. One document per reply in hq_reply_decisions; "clear" undoes
 * it. Takes effect on the board at once; nothing is sent anywhere.
 */

const schema = z.object({
  key: z.string().regex(/^[\w-]{1,200}$/),
  decision: z.enum(["approved", "dismissed", "reopened", "done", "clear"]),
  title: z.string().trim().max(200).optional(),
});

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
  const { key, decision, title } = parsed.data;
  try {
    if (decision === "clear") {
      await deleteDoc(`hq_reply_decisions/${key}`);
      return NextResponse.json({ ok: true, decision: null });
    }
    const record = { key, decision, title: title || null, by: email, at: Date.now() };
    await setDoc(`hq_reply_decisions/${key}`, record);
    return NextResponse.json({ ok: true, decision: record });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Couldn't save that." }, { status: 502 });
  }
}
