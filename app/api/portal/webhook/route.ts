import { NextResponse } from "next/server";
import { accountById, accountByStripeCustomer, updateAccount } from "@/lib/portal/store";
import { applyBillingEvent, stripeObjectId, type StripeEvent } from "@/lib/portal/billing-events";
import { verifyStripeSignature } from "@/lib/portal/stripe-signature";

export const runtime = "nodejs";

const HANDLED = new Set([
  "checkout.session.completed",
  "customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted",
  "invoice.paid", "invoice.payment_failed",
]);

export async function POST(request: Request) {
  const raw = await request.text();
  if (Buffer.byteLength(raw) > 1_000_000) return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  if (!verifyStripeSignature(raw, request.headers.get("stripe-signature"))) return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  let event: StripeEvent;
  try { event = JSON.parse(raw) as StripeEvent; } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  if (!event.id || !event.type || !event.data?.object) return NextResponse.json({ error: "Invalid event." }, { status: 400 });
  if (!HANDLED.has(event.type)) return NextResponse.json({ received: true });
  const object = event.data.object;
  const accountId = object.client_reference_id ?? object.metadata?.account_id ?? object.parent?.subscription_details?.metadata?.account_id;
  const customerId = stripeObjectId(object.customer);
  const account = accountId ? await accountById(accountId) : customerId ? await accountByStripeCustomer(customerId) : null;
  if (!account) return NextResponse.json({ received: true });

  await updateAccount(account.id, current => applyBillingEvent(current, event));
  return NextResponse.json({ received: true });
}
