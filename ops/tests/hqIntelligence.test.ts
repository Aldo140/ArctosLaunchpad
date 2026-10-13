import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildIntelligence } from "../../lib/hq/intelligence";
import type { HqData } from "../../lib/hq/types";

const NOW = Date.parse("2026-10-13T18:00:00Z");
const base = (): Omit<HqData, "intelligence"> => ({
  snapshot: null, arctos: null, vowmotion: null, commands: [], workflows: [], gmail: null, calendar: null,
  life: [], settings: { moneyGoal: null }, triage: null, decisions: [], memories: [], experiments: [],
  productEvents: [], errors: [],
});

describe("HQ intelligence", () => {
  it("makes the missing Gmail connection the first action", () => {
    const result = buildIntelligence(base(), NOW);
    assert.equal(result.recommendations[0]?.id, "connect-gmail");
    assert.equal(result.connections.find((c) => c.id === "gmail")?.state, "missing");
  });

  it("ranks an unanswered pitch reply and builds relationship memory", () => {
    const data = base();
    data.gmail = {
      generatedAt: NOW, account: "mrotiz14@gmail.com", days: 30, sends: [],
      replies: [{ at: NOW - 1000, alias: "aldo@vowmotionweddings.com", business: "vowmotion", from: "planner@example.com", name: "Planner", subject: "Pricing", snippet: "Interested in a call", kind: "reply", toPitch: true, answered: false, url: "https://mail/thread" }],
    };
    const result = buildIntelligence(data, NOW);
    assert.equal(result.recommendations[0]?.title, "Reply to Planner");
    assert.equal(result.relationships[0]?.state, "Needs reply");
    assert.match(result.opportunities[0]?.title ?? "", /Planner/);
  });

  it("lets an explicit priority compete with operational work and measures usage", () => {
    const data = base();
    data.memories = [{ id: "m1", kind: "priority", text: "Finish the Vow Motion offer", business: "vowmotion", at: NOW, by: "aldo" }];
    data.productEvents = [{ id: "e1", name: "view", area: "improve/focus", at: NOW, by: "aldo", detail: null }];
    const result = buildIntelligence(data, NOW);
    assert.ok(result.recommendations.some((r) => r.title === "Finish the Vow Motion offer"));
    assert.deepEqual(result.research.topAreas, [{ area: "improve/focus", count: 1 }]);
  });
});
