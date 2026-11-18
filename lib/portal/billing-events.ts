import type { BillingStatus, ClientAccount } from "./types";

export type StripeObject = {
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
export type StripeEvent = { id: string; type: string; data: { object: StripeObject } };

const state = (value?: string): BillingStatus => value === "active" || value === "trialing" || value === "past_due" || value === "paused" || value === "canceled"
  ? ({ past_due: "past-due", canceled: "cancelled" } as Record<string, BillingStatus>)[value] ?? value as BillingStatus
  : "not-started";

function addBillingActivity(account: ClientAccount, event: StripeEvent, title: string, detail: string) {
  if (account.activity.some((item) => item.id === event.id)) return;
  account.activity.unshift({ id: event.id, at: Date.now(), title, detail, kind: "billing" });
  account.activity = account.activity.slice(0, 100);
}

export function stripeObjectId(value: unknown): string | null {
  return typeof value === "string" && /^[a-z]+_[A-Za-z0-9]+$/.test(value) ? value : null;
}

export function applyBillingEvent(current: ClientAccount, event: StripeEvent): void {
  const object = event.data.object;
  const customerId = stripeObjectId(object.customer);
  if (event.type === "checkout.session.completed") {
    current.billing.stripeCustomerId = customerId ?? current.billing.stripeCustomerId;
    current.billing.stripeSubscriptionId = stripeObjectId(object.subscription) ?? current.billing.stripeSubscriptionId;
    addBillingActivity(current, event, "Automatic payments authorized", "Stripe accepted the recurring-payment authorization.");
  } else if (event.type.startsWith("customer.subscription.")) {
    current.billing.stripeCustomerId = customerId ?? current.billing.stripeCustomerId;
    current.billing.stripeSubscriptionId = stripeObjectId(object.id) ?? current.billing.stripeSubscriptionId;
    current.billing.status = state(object.status);
    current.billing.cancelAtPeriodEnd = Boolean(object.cancel_at_period_end);
    current.billing.nextPaymentAt = object.current_period_end ? object.current_period_end * 1000 : current.billing.nextPaymentAt;
    addBillingActivity(current, event, "Subscription updated", `Billing status: ${current.billing.status}.`);
    if (event.type === "customer.subscription.deleted") current.billing.stripeSubscriptionId = null;
  } else if (event.type === "invoice.payment_failed") {
    current.billing.status = "past-due";
    addBillingActivity(current, event, "Payment needs attention", "Stripe could not complete the scheduled payment.");
  } else if (event.type === "invoice.paid") {
    current.billing.status = "active";
    addBillingActivity(current, event, "Payment received", `${current.billing.planName} payment completed.`);
  }
}
