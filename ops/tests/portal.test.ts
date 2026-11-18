import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { describe, it } from "node:test";
import { accountIdFor, publicSnapshot } from "../../lib/portal/store";
import { applyBillingEvent, type StripeEvent } from "../../lib/portal/billing-events";
import type { ClientAccount } from "../../lib/portal/types";
import { verifyStripeSignature } from "../../lib/portal/stripe-signature";

const account: ClientAccount = {
  id: "client", email: "client@example.ca", clientName: "Client Name", company: "Company", firstName: "Client",
  projectName: "New website", projectSummary: "A project.", status: "in-progress", services: ["Website"],
  leadContact: { name: "Aldo", email: "aldo@arctoslaunchpad.com" }, nextStep: null, milestones: [], documents: [], activity: [],
  billing: { status: "active", currency: "cad", monthlyAmount: 50000, planName: "Care", nextPaymentAt: 1, stripeCustomerId: "cus_secret", stripeSubscriptionId: "sub_secret", stripePriceId: "price_secret", cancelAtPeriodEnd: false },
  createdAt: 1, updatedAt: 1,
};

describe("client portal privacy", () => {
  it("uses a stable normalized account id without exposing the email", () => {
    const a = accountIdFor(" Client@Example.ca ");
    assert.equal(a, accountIdFor("client@example.ca"));
    assert.equal(a.length, 32);
    assert.ok(!a.includes("client"));
  });

  it("never returns Stripe object ids to the browser", () => {
    const snapshot = JSON.stringify(publicSnapshot(account));
    assert.doesNotMatch(snapshot, /cus_secret|sub_secret|price_secret/);
    assert.equal(publicSnapshot(account).account.billing.canManage, true);
    assert.equal(publicSnapshot(account).account.billing.canStart, false);
  });
});

describe("client portal billing state", () => {
  const fresh = (): ClientAccount => structuredClone({ ...account, activity: [], billing: { ...account.billing, status: "not-started", stripeCustomerId: null, stripeSubscriptionId: null } });
  const event = (id: string, type: string, object: StripeEvent["data"]["object"]): StripeEvent => ({ id, type, data: { object } });

  it("does not call a delayed payment active when Checkout only authorized it", () => {
    const target = fresh();
    applyBillingEvent(target, event("evt_checkout", "checkout.session.completed", { id: "cs_test", customer: "cus_123", subscription: "sub_123" }));
    assert.equal(target.billing.status, "not-started");
    assert.equal(target.billing.stripeCustomerId, "cus_123");
    assert.match(target.activity[0].title, /authorized/i);
  });

  it("uses subscription and invoice events as the source of payment truth", () => {
    const target = fresh();
    applyBillingEvent(target, event("evt_sub", "customer.subscription.updated", { id: "sub_123", customer: "cus_123", status: "trialing", current_period_end: 2_000 }));
    assert.equal(target.billing.status, "trialing");
    assert.equal(target.billing.nextPaymentAt, 2_000_000);
    applyBillingEvent(target, event("evt_fail", "invoice.payment_failed", { id: "in_123", customer: "cus_123" }));
    assert.equal(target.billing.status, "past-due");
  });

  it("records a retried Stripe event only once", () => {
    const target = fresh();
    const paid = event("evt_paid", "invoice.paid", { id: "in_123", customer: "cus_123" });
    applyBillingEvent(target, paid);
    applyBillingEvent(target, paid);
    assert.equal(target.activity.filter(item => item.id === "evt_paid").length, 1);
  });
});

describe("Stripe webhook authentication", () => {
  const now = 1_800_000_000_000;
  const raw = '{"id":"evt_123"}';
  const secret = "whsec_test_only";
  const signed = (at: number, body = raw) => {
    const timestamp = Math.floor(at / 1000);
    const digest = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
    return `t=${timestamp},v1=${digest}`;
  };

  it("accepts an authentic recent payload and rejects tampering", () => {
    const signature = signed(now);
    assert.equal(verifyStripeSignature(raw, signature, secret, now), true);
    assert.equal(verifyStripeSignature(`${raw} `, signature, secret, now), false);
    assert.equal(verifyStripeSignature(raw, `t=${Math.floor(now / 1000)},v1=${"z".repeat(64)}`, secret, now), false);
  });

  it("rejects replayed events outside the five-minute tolerance", () => {
    assert.equal(verifyStripeSignature(raw, signed(now - 301_000), secret, now), false);
  });
});
