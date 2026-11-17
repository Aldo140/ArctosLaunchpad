import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { accountIdFor, publicSnapshot } from "../../lib/portal/store";
import type { ClientAccount } from "../../lib/portal/types";

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
