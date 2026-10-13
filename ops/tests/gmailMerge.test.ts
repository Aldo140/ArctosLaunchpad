import assert from "node:assert/strict";
import test from "node:test";
import { mergeGmailSummary } from "../../lib/hq/gmailMerge";
import type { GmailSummary } from "../../lib/hq/types";

const now = Date.UTC(2026, 9, 13);
const base: GmailSummary = {
  generatedAt: now - 60_000,
  account: "mrotiz@example.com",
  days: 30,
  sends: [{ at: now - 3_600_000, alias: "aldo@arctoslaunchpad.com", business: "arctos", to: "lead@example.com", domain: "example.com", subject: "Hello", first: true, wrongAlias: null, replied: false, url: "gmail://one" }],
  replies: [],
};

test("incremental Gmail scans update matching mail and preserve rolling history", () => {
  const incoming: GmailSummary = {
    generatedAt: now,
    account: base.account,
    days: 30,
    sends: [{ ...base.sends[0], replied: true }],
    replies: [{ at: now, alias: "aldo@arctoslaunchpad.com", business: "arctos", from: "lead@example.com", name: "Lead", subject: "Re: Hello", snippet: "Interested", kind: "reply", toPitch: true, answered: false, url: "gmail://one" }],
  };
  const merged = mergeGmailSummary(base, incoming);
  assert.equal(merged.sends.length, 1);
  assert.equal(merged.sends[0].replied, true);
  assert.equal(merged.replies.length, 1);
  assert.equal(merged.generatedAt, now);
});

test("incremental Gmail scans remove mail outside the rolling window", () => {
  const old = { ...base, sends: [{ ...base.sends[0], at: now - 31 * 86_400_000 }] };
  const merged = mergeGmailSummary(old, { ...base, generatedAt: now, sends: [] });
  assert.deepEqual(merged.sends, []);
});
