import { NextResponse } from "next/server";
import { HqAuthError } from "@/lib/hq/auth";
import { StripeRequestError } from "./stripe";

export const privateJson = (body: unknown, init: ResponseInit = {}) => NextResponse.json(body, {
  ...init,
  headers: { "Cache-Control": "private, no-store", ...init.headers },
});

export function portalError(error: unknown, fallback: string) {
  if (error instanceof HqAuthError) return privateJson({ error: error.message, code: error.code }, { status: error.status });
  if (error instanceof StripeRequestError) {
    console.error("Stripe request failed", { status: error.status, requestId: error.requestId });
    return privateJson({ error: error.status >= 500 ? fallback : error.message }, { status: 502 });
  }
  console.error(fallback, error);
  return privateJson({ error: fallback }, { status: 500 });
}

export function canonicalSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) throw new Error("NEXT_PUBLIC_SITE_URL is not configured.");
  const url = new URL(raw);
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && local)) throw new Error("NEXT_PUBLIC_SITE_URL must use HTTPS.");
  return url.origin;
}
