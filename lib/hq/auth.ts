import { createRemoteJWKSet, jwtVerify } from "jose";

/**
 * Checks the Firebase ID token the /hq page sends (Google sign-in on the
 * arctos-hq project) and that the account is one of HQ_ALLOWED_EMAILS.
 * Verification uses Google's public keys only; no secret is needed.
 */

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

export class HqAuthError extends Error {
  constructor(
    message: string,
    readonly status: 401 | 403,
  ) {
    super(message);
  }
}

export function allowedEmails(): string[] {
  return (process.env.HQ_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireHqUser(request: Request): Promise<{ email: string }> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new HqAuthError("Sign in to open HQ.", 401);
  const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "arctos-hq";
  let payload;
  try {
    ({ payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${project}`,
      audience: project,
    }));
  } catch {
    throw new HqAuthError("Your sign-in expired. Sign in again.", 401);
  }
  const email = String(payload.email ?? "").toLowerCase();
  if (!email || payload.email_verified !== true || !allowedEmails().includes(email)) {
    throw new HqAuthError(`${email || "This account"} isn't on the HQ list.`, 403);
  }
  return { email };
}
