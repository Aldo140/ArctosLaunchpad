import { NextResponse } from "next/server";
import { z } from "zod";
import { HqAuthError } from "@/lib/hq/auth";
import { requireClient } from "@/lib/portal/auth";
import { stripePost } from "@/lib/portal/stripe";

const Body = z.object({ action: z.enum(["start", "manage"]), accepted: z.boolean().optional() });

function baseUrl(request: Request) {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin).replace(/\/$/, "");
}

export async function POST(request: Request) {
  try {
    const { account } = await requireClient(request);
    const parsed = Body.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Choose a billing action." }, { status: 400 });
    const back = `${baseUrl(request)}/portal?billing=returned`;

    if (parsed.data.action === "manage") {
      if (!account.billing.stripeCustomerId) return NextResponse.json({ error: "Billing has not been activated for this account." }, { status: 409 });
      const session = await stripePost<{ url: string }>("/billing_portal/sessions", new URLSearchParams({ customer: account.billing.stripeCustomerId, return_url: back }));
      return NextResponse.json({ url: session.url });
    }

    if (!parsed.data.accepted) return NextResponse.json({ error: "Confirm the recurring-payment authorization first." }, { status: 400 });
    if (!account.billing.stripePriceId) return NextResponse.json({ error: "The subscription price has not been assigned yet." }, { status: 409 });
    if (account.billing.stripeSubscriptionId) return NextResponse.json({ error: "This account already has a subscription. Use Manage billing." }, { status: 409 });

    const params = new URLSearchParams({
      mode: "subscription",
      client_reference_id: account.id,
      customer_email: account.email,
      "line_items[0][price]": account.billing.stripePriceId,
      "line_items[0][quantity]": "1",
      "subscription_data[metadata][account_id]": account.id,
      "metadata[account_id]": account.id,
      success_url: `${baseUrl(request)}/portal?billing=success`,
      cancel_url: `${baseUrl(request)}/portal?billing=cancelled`,
      billing_address_collection: "auto",
      allow_promotion_codes: "false",
      "automatic_tax[enabled]": "true",
    });
    const session = await stripePost<{ url: string }>("/checkout/sessions", params);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    const status = error instanceof HqAuthError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Billing could not be opened." }, { status });
  }
}
