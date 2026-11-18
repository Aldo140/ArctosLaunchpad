import { z } from "zod";
import { requireClient } from "@/lib/portal/auth";
import { canonicalSiteUrl, portalError, privateJson } from "@/lib/portal/http";
import { stripePost } from "@/lib/portal/stripe";

const Body = z.object({ action: z.enum(["start", "manage"]), accepted: z.boolean().optional() });

export async function POST(request: Request) {
  try {
    const { account } = await requireClient(request);
    const parsed = Body.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return privateJson({ error: "Choose a billing action." }, { status: 400 });
    const site = canonicalSiteUrl();
    const back = `${site}/portal?billing=returned`;

    if (parsed.data.action === "manage") {
      if (!account.billing.stripeCustomerId) return privateJson({ error: "Billing has not been activated for this account." }, { status: 409 });
      const session = await stripePost<{ url: string }>("/billing_portal/sessions", new URLSearchParams({ customer: account.billing.stripeCustomerId, return_url: back }));
      return privateJson({ url: session.url });
    }

    if (!parsed.data.accepted) return privateJson({ error: "Confirm the recurring-payment authorization first." }, { status: 400 });
    if (!account.billing.stripePriceId) return privateJson({ error: "The subscription price has not been assigned yet." }, { status: 409 });
    if (account.billing.stripeSubscriptionId) return privateJson({ error: "This account already has a subscription. Use Manage billing." }, { status: 409 });

    const params = new URLSearchParams({
      mode: "subscription",
      client_reference_id: account.id,
      customer_email: account.email,
      "line_items[0][price]": account.billing.stripePriceId,
      "line_items[0][quantity]": "1",
      "subscription_data[metadata][account_id]": account.id,
      "metadata[account_id]": account.id,
      success_url: `${site}/portal?billing=success`,
      cancel_url: `${site}/portal?billing=cancelled`,
      billing_address_collection: "auto",
      allow_promotion_codes: "false",
      "automatic_tax[enabled]": "true",
    });
    const session = await stripePost<{ url: string }>("/checkout/sessions", params, `portal-checkout-${account.id}-${account.billing.stripePriceId}`);
    return privateJson({ url: session.url });
  } catch (error) {
    return portalError(error, "Billing could not be opened.");
  }
}
