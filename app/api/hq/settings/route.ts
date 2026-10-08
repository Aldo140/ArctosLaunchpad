import { NextResponse } from "next/server";
import { z } from "zod";
import { HqAuthError, requireHqUser } from "@/lib/hq/auth";
import { writeStringField } from "@/lib/hq/google";
import type { HqSettings } from "@/lib/hq/types";

/** Saves the Money tab: the Anthropic balance after a top-up, and a daily spend cap. */

const schema = z.object({
  balanceUsd: z.number().min(0).max(100_000).nullable(),
  dailyCapUsd: z.number().min(0).max(1_000).nullable(),
});

export async function POST(request: Request) {
  try {
    await requireHqUser(request);
  } catch (e) {
    const status = e instanceof HqAuthError ? e.status : 401;
    return NextResponse.json({ error: e instanceof Error ? e.message : "Sign in to open HQ." }, { status });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter amounts in dollars, like 50 or 12.50." }, { status: 400 });

  const settings: HqSettings = { ...parsed.data, balanceAt: parsed.data.balanceUsd === null ? null : Date.now() };
  try {
    await writeStringField("hq/settings", "payload", JSON.stringify(settings));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Couldn't save." }, { status: 502 });
  }
  return NextResponse.json({ settings });
}
