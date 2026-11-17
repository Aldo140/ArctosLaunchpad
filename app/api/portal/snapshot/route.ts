import { NextResponse } from "next/server";
import { HqAuthError } from "@/lib/hq/auth";
import { requireClient } from "@/lib/portal/auth";
import { publicSnapshot } from "@/lib/portal/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { account } = await requireClient(request);
    return NextResponse.json(publicSnapshot(account), { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const status = error instanceof HqAuthError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not open the workspace." }, { status });
  }
}
