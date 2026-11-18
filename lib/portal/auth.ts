import { allowedEmails, HqAuthError, requireFirebaseUser } from "@/lib/hq/auth";
import { accountByEmail } from "./store";

export async function requireClient(request: Request) {
  const user = await requireFirebaseUser(request);
  const account = await accountByEmail(user.email);
  if (!account || account.email.toLowerCase() !== user.email) {
    if (allowedEmails().includes(user.email)) throw new HqAuthError("Opening Arctos client administration.", 403, "hq-admin");
    throw new HqAuthError("This email is signed in, but no client workspace has been invited yet.", 403, "no-workspace");
  }
  return { user, account };
}
