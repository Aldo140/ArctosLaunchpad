import { NextResponse } from "next/server";
import { requireHqUser, HqAuthError } from "@/lib/hq/auth";

const required = [
  ["Stripe API", "STRIPE_SECRET_KEY"],
  ["Stripe webhook", "STRIPE_WEBHOOK_SECRET"],
  ["Canonical site URL", "NEXT_PUBLIC_SITE_URL"],
  ["Firebase project", "NEXT_PUBLIC_FIREBASE_PROJECT_ID"],
  ["Firebase browser key", "NEXT_PUBLIC_FIREBASE_API_KEY"],
  ["HQ client authorization", "HQ_ALLOWED_EMAILS"],
  ["Google Cloud project", "GCP_PROJECT_ID"],
  ["Google service account", "GCP_SERVICE_ACCOUNT_EMAIL"],
] as const;

export async function POST(request: Request) {
  try {
    await requireHqUser(request);
    const checks: Array<{ label: string; variable: string; ready: boolean }> = required.map(([label, variable]) => ({ label, variable, ready: Boolean(process.env[variable]) }));
    const site = process.env.NEXT_PUBLIC_SITE_URL;
    const canonicalHttps = Boolean(site && (() => { try { return new URL(site).protocol === "https:"; } catch { return false; } })());
    checks.push({ label: "HTTPS production URL", variable: "NEXT_PUBLIC_SITE_URL", ready: canonicalHttps });
    checks.push({ label: "Stripe live mode", variable: "STRIPE_SECRET_KEY", ready: /^(?:sk|rk)_live_/.test(process.env.STRIPE_SECRET_KEY ?? "") });
    return NextResponse.json({ ready: checks.every(item => item.ready), checks }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const status = error instanceof HqAuthError ? error.status : 500;
    return NextResponse.json({ error: error instanceof HqAuthError ? error.message : "Could not check portal readiness." }, { status, headers: { "Cache-Control": "private, no-store" } });
  }
}
