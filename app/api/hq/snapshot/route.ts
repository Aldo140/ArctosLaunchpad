import { NextResponse } from "next/server";
import { HqAuthError, requireHqUser } from "@/lib/hq/auth";
import { loadHq } from "@/lib/hq/load";
import type { HqResponse } from "@/lib/hq/types";

/**
 * Everything the /hq page shows, for a signed-in HQ account. POST so the
 * static GitHub Pages export (which can't run handlers) skips it, the same
 * way it skips /api/contact.
 */

export async function POST(request: Request) {
  let viewer: string;
  try {
    viewer = (await requireHqUser(request)).email;
  } catch (e) {
    const status = e instanceof HqAuthError ? e.status : 401;
    return NextResponse.json({ error: e instanceof Error ? e.message : "Sign in to open HQ." }, { status });
  }
  const body: HqResponse = { viewer, ...(await loadHq(Date.now())) };
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}
