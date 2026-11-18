import { requireClient } from "@/lib/portal/auth";
import { portalError, privateJson } from "@/lib/portal/http";

export async function POST(request: Request) {
  try {
    const { account } = await requireClient(request);
    const id = String((await request.json().catch(() => null) as { id?: unknown } | null)?.id ?? "");
    const document = account.documents.find((item) => item.id === id);
    if (!document) return privateJson({ error: "Document not found." }, { status: 404 });
    const url = new URL(document.url);
    if (url.protocol !== "https:") return privateJson({ error: "Document link is invalid." }, { status: 400 });
    return privateJson({ url: url.toString() });
  } catch (error) {
    return portalError(error, "Document could not be opened.");
  }
}
