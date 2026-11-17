import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { accountById, saveAccount } from "@/lib/portal/store";
import type { BillingStatus, ClientAccount } from "@/lib/portal/types";

export const runtime = "nodejs";

type StripeObject = {
  id: string;
  customer?: string;
  subscription?: string;
  status?: string;
  cancel_at_period_end?: boolean;
  current_period_end?: number;
  client_reference_id?: string;
  metadata?: Record<string, string>;
  parent?: { subscription_details?: { metadata?: Record<string, string> } };
};
type StripeEvent = { id: string; type: string; data: { object: StripeObject } };

function verified(raw: string, signature: string | null): boolean {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const pairs = signature.split(",").map((part) => part.split("=", 2) as [string, string]);
  const timestamp = pairs.find(([name]) => name === "t")?.[1];
  const sent = pairs.filter(([name]) => name === "v1").map(([, value]) => value);
  if (!timestamp || !sent.length || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${raw}`).digest("hex");
  return sent.some((value) => expected.length === value.length && timingSafeEqual(Buffer.from(expected), Buffer.from(value)));
}

const state = (value?: string): BillingStatus => value === "active" || value === "trialing" || value === "past_due" || value === "paused" || value === "canceled"
  ? ({ past_due: "past-due", canceled: "cancelled" } as Record<string, BillingStatus>)[value] ?? value as BillingStatus
  : "not-started";

function addBillingActivity(account: ClientAccount, event: StripeEvent, title: string, detail: string) {
  if (account.activity.some((item) => item.id === event.id)) return;
  account.activity.unshift({ id: event.id, at: Date.now(), title, detail, kind: "billing" });
  account.activity = account.activity.slice(0, 100);
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (!verified(raw, request.headers.get("stripe-signature"))) return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  const event = JSON.parse(raw) as StripeEvent;
  const object = event.data.object;
  const accountId = object.client_reference_id ?? object.metadata?.account_id ?? object.parent?.subscription_details?.metadata?.account_id;
  if (!accountId) return NextResponse.json({ received: true });
  const account = await accountById(accountId);
  if (!account) return NextResponse.json({ received: true });

  if (event.type === "checkout.session.completed") {
    account.billing.stripeCustomerId = object.customer ?? account.billing.stripeCustomerId;
    account.billing.stripeSubscriptionId = object.subscription ?? account.billing.stripeSubscriptionId;
    account.billing.status = "active";
    addBillingActivity(account, event, "Automatic payments authorized", `${account.billing.planName} is now active.`);
  } else if (event.type.startsWith("customer.subscription.")) {
    account.billing.stripeCustomerId = object.customer ?? account.billing.stripeCustomerId;
    account.billing.stripeSubscriptionId = object.id;
    account.billing.status = state(object.status);
    account.billing.cancelAtPeriodEnd = Boolean(object.cancel_at_period_end);
    account.billing.nextPaymentAt = object.current_period_end ? object.current_period_end * 1000 : account.billing.nextPaymentAt;
    addBillingActivity(account, event, "Subscription updated", `Billing status: ${account.billing.status}.`);
    if (event.type === "customer.subscription.deleted") account.billing.stripeSubscriptionId = null;
  } else if (event.type === "invoice.payment_failed") {
    account.billing.status = "past-due";
    addBillingActivity(account, event, "Payment needs attention", "Stripe could not complete the scheduled payment.");
  } else if (event.type === "invoice.paid") {
    account.billing.status = "active";
    addBillingActivity(account, event, "Payment received", `${account.billing.planName} payment completed.`);
  }
  await saveAccount(account);
  return NextResponse.json({ received: true });
}
