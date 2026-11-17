import { HqAuthError, requireFirebaseUser } from "@/lib/hq/auth";
import { accountByEmail } from "./store";

export async function requireClient(request: Request) {
  const user = await requireFirebaseUser(request);
  const account = await accountByEmail(user.email);
  if (!account || account.email.toLowerCase() !== user.email) throw new HqAuthError("No client workspace is connected to this email.", 403);
  return { user, account };
}
