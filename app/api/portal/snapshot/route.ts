import { requireClient } from "@/lib/portal/auth";
import { portalError, privateJson } from "@/lib/portal/http";
import { publicSnapshot } from "@/lib/portal/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { account } = await requireClient(request);
    return privateJson(publicSnapshot(account));
  } catch (error) {
    return portalError(error, "Could not open the workspace.");
  }
}
