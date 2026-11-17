import { NextResponse } from "next/server";
import { HqAuthError } from "@/lib/hq/auth";
import { requireClient } from "@/lib/portal/auth";

export async function POST(request: Request) {
  try {
    const { account } = await requireClient(request);
    const id = String((await request.json().catch(() => null) as { id?: unknown } | null)?.id ?? "");
    const document = account.documents.find((item) => item.id === id);
    if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });
    const url = new URL(document.url);
    if (url.protocol !== "https:") return NextResponse.json({ error: "Document link is invalid." }, { status: 400 });
    return NextResponse.json({ url: url.toString() });
  } catch (error) {
    const status = error instanceof HqAuthError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Document could not be opened." }, { status });
  }
}
