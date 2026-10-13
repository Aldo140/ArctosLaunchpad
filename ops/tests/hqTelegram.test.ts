/** HQ over Telegram: who may use it, what its buttons carry, and what it sends (pure; no network). */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { briefing, chunks, decodeButton, encodePaid, encodeQueue, encodeRemove, encodeTodo, encodeTriage, encodeUndo, encodeIgForget, igListCards, igNoteText, igSavedText, inboxCards, loggedText, moneyCard, reportForQuestion, telegramUsers } from '../../lib/hq/telegramBot';
import { triageKey } from '../../lib/hq/triage';
import type { GmailSummary, HqData, HqPost, HqSnapshot, LifeEntry } from '../../lib/hq/types';

const now = Date.parse('2026-10-08T18:00:00Z');
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

const post = (over: Partial<HqPost>): HqPost => ({
  id: 'p1', brand: 'calgarydaily', status: 'drafted', template: 'event', format: 'image', headline: 'Elk in Banff', caption: 'Caption <b>', altText: 'alt',
  imageUrl: 'https://img/1.png', imageUrls: [], videoUrl: null, warnings: [], facts: '', note: '', suggestedFor: null, scheduledFor: null, publishedAt: null,
  permalink: null, error: null, insights: null, updatedAt: now, ...over,
});

const snapshot = (over: Partial<HqSnapshot> = {}): HqSnapshot => ({
  version: 2, generatedAt: now - 2 * HOUR, today: [], health: null, calgaryDaily: null, pipelines: [], pipelinesAt: now, bottlenecks: [],
  posts: [post({}), post({ id: 'p2', status: 'published' })],
  inbox: {
    at: now,
    pitches: [{ leadId: 'l1', business: 'calgarywatch', businessName: 'Cafe', contactEmail: 'a@cafe.ca', category: '', neighbourhood: '', reasonRelevant: '', subject: 'Hi', body: 'Pitch', followUp: false, at: now }],
    replies: [
      { leadId: 'l2', business: 'calgarywatch', businessName: 'Bakery', from: 'b@x.ca', subject: 'Re', text: 'Sure', classification: 'interested', suggestedSubject: 'Re', suggestedBody: 'Great', approved: false, at: now - HOUR },
      { leadId: 'l3', business: 'calgarywatch', businessName: 'Done', from: 'c@x.ca', subject: 'Re', text: 'Ok', classification: 'interested', suggestedSubject: 'Re', suggestedBody: 'Ok', approved: true, at: now },
    ],
  },
  ...over,
});

const gmail: GmailSummary = {
  generatedAt: now, account: 'me@gmail.com', days: 30, sends: [],
  replies: [
    { at: now - 3 * HOUR, alias: 'hi@vow', business: 'vowmotion', from: 'jo@x.ca', name: 'Jo', subject: 'Wedding', snippet: 'Are you free', kind: 'reply', toPitch: true, answered: false, url: 'https://mail/1' },
    { at: now, alias: 'hi@vow', business: 'vowmotion', from: 'bot@x.ca', name: '', subject: 'Out of office', snippet: '', kind: 'auto', toPitch: true, answered: false, url: 'https://mail/2' },
  ],
};

const life: LifeEntry[] = [
  { id: 'm1', kind: 'money', at: now - HOUR, amount: 120_000, business: 'vowmotion', text: 'Smith wedding' },
  { id: 'm0', kind: 'money', at: now - 40 * DAY, amount: 99_900, business: 'arctos', text: 'Old site' },
  { id: 'o1', kind: 'owed', at: now - 10 * DAY, amount: 40_000, business: 'arctos', text: 'Ramsay Coffee', done: false, due: now - 2 * DAY, paidId: null },
  { id: 'g1', kind: 'gym', at: now - DAY },
  { id: 'n1', kind: 'note', at: now - DAY, text: 'Call the venue', done: false, due: now - HOUR },
];

/** What HQ knows, as loadHq returns it. */
const data = (over: Partial<HqData> = {}): HqData => ({
  snapshot: snapshot(), arctos: null, commands: [], workflows: [], gmail,
  calendar: { generatedAt: now, events: [{ title: 'Call with Ramsay', start: now + HOUR, end: now + 2 * HOUR, allDay: false, location: '' }] },
  life: life.map((e) => ({ ...e })), settings: { moneyGoal: 500_000 }, triage: null, decisions: [],
  memories: [], experiments: [], productEvents: [],
  intelligence: { recommendations: [], relationships: [], opportunities: [], weekly: { wins: [], risks: [], focus: [], generatedAt: now }, workload: { open: 0, urgent: 0, message: "" }, connections: [], research: { events7d: 0, topAreas: [], message: "" } },
  errors: [], ...over,
});

describe('telegramUsers', () => {
  it('reads id=email pairs and skips malformed ones', () => {
    const users = telegramUsers(' 123=Me@Gmail.com, abc=x@y.z, 456=, 789=other@x.ca ');
    assert.deepEqual([...users], [[123, 'me@gmail.com'], [789, 'other@x.ca']]);
    assert.equal(telegramUsers(undefined).size, 0);
  });
});

describe('buttons', () => {
  it('round-trips queue and undo payloads', () => {
    const payload = encodeQueue('approve-reply', 'lead_42');
    assert.equal(payload, 'q:ar:lead_42');
    assert.deepEqual(decodeButton(payload!), { kind: 'queue', type: 'approve-reply', targetId: 'lead_42' });
    assert.deepEqual(decodeButton(encodeUndo('abcDEF123')), { kind: 'undo', commandId: 'abcDEF123' });
  });
  it('refuses payloads over Telegram\'s 64 bytes and unknown codes', () => {
    assert.equal(encodeQueue('approve-post', 'x'.repeat(70)), null);
    assert.equal(decodeButton('q:zz:abc'), null);
    assert.equal(decodeButton('u:../etc'), null);
  });
  it('round-trips the life and reply-check buttons', () => {
    assert.deepEqual(decodeButton(encodeTriage('approved', '18c2f_1760000000000')!), { kind: 'triage', decision: 'approved', key: '18c2f_1760000000000' });
    assert.deepEqual(decodeButton(encodeTriage('clear', 'k1')!), { kind: 'triage', decision: 'clear', key: 'k1' });
    assert.deepEqual(decodeButton(encodePaid('o1')!), { kind: 'paid', id: 'o1', paid: true });
    assert.deepEqual(decodeButton(encodePaid('o1', false)!), { kind: 'paid', id: 'o1', paid: false });
    assert.deepEqual(decodeButton(encodeTodo('n1')!), { kind: 'todo', id: 'n1', done: true });
    assert.deepEqual(decodeButton(encodeRemove('abc')!), { kind: 'remove', id: 'abc' });
    assert.deepEqual(decodeButton('g'), { kind: 'gym' });
    assert.deepEqual(decodeButton('i'), { kind: 'inbox' });
    assert.equal(decodeButton('x:a/b'), null);
  });
});

describe('briefing', () => {
  it('shows Today from the same numbers as the dashboard', () => {
    const { text, buttons } = briefing(data(), now);
    // 1 post + 1 pitch + 1 drafted reply + Jo's pitch reply (the auto-reply doesn't count): the dashboard's queue.
    assert.match(text, /4 things need you/);
    assert.match(text, /\$1,200 of \$5,000 this month/);
    assert.match(text, /\$400 owed to you is late: Ramsay Coffee/);
    assert.match(text, /Gym 1\/3 this week, last went yesterday/);
    assert.match(text, /Next 1:00 pm: Call with Ramsay/);
    assert.match(text, /Due: Call the venue/);
    assert.match(text, /Agents' report from 2h ago/);
    assert.doesNotMatch(text, /Out of office/);
    assert.deepEqual(buttons.map((b) => b.data ?? b.url), ['i', 'g', 'https://arctoslaunchpad.com/hq']);
  });
  it('leaves Gmail replies the reply check filtered out off the count, like HQ does', () => {
    const key = triageKey(gmail.replies[0]);
    const filtered = data({ triage: { at: now, error: null, items: [{ key, url: 'https://mail/1', replyAt: now - 3 * HOUR, from: 'jo@x.ca', at: now, fingerprint: '', needsAction: false, category: 'informational', reason: 'Just a thank-you.', checks: [], related: [], subtask: null }] } });
    assert.match(briefing(filtered, now).text, /3 things need you/);
  });
  it('still answers with no report', () => {
    const { text } = briefing(data({ snapshot: null, gmail: null }), now);
    assert.match(text, /Nothing needs you/);
    assert.match(text, /report from never/);
  });
});

describe('moneyCard', () => {
  it('shows the month, the goal pace and a Paid button per debt', () => {
    const card = moneyCard(data(), now);
    assert.match(card.text, /\$1,200 in/);
    assert.match(card.text, /24% of \$5,000/);
    assert.match(card.text, /Ramsay Coffee: \$400 \(late since/);
    assert.equal(card.buttons[0].data, 'p:o1');
  });
});

describe('loggedText', () => {
  it('confirms with the number that moved', () => {
    const d = data();
    assert.match(loggedText(d.life![0], d, now), /Logged \$1,200 for Vow Motion \(Smith wedding\)\.\n\$1,200 of \$5,000/);
    assert.match(loggedText({ id: 'g2', kind: 'gym', at: now }, d, now), /1\/3 this week, 2 to go/);
  });
});

describe('inboxCards', () => {
  it('makes one card per open decision, in the dashboard\'s order, escaped', () => {
    const cards = inboxCards(data(), now);
    assert.equal(cards.length, 4);
    // Replies first (oldest first), then posts, then pitches.
    const key = triageKey(gmail.replies[0]);
    assert.deepEqual(cards[0].buttons.map((b) => b.data ?? b.url), [encodeTriage('approved', key), encodeTriage('dismissed', key), 'https://mail/1']);
    assert.deepEqual(cards[1].buttons.map((b) => b.data), ['q:ar:l2', 'q:hr:l2']);
    assert.deepEqual(cards[2].buttons.map((b) => b.data), ['q:ap:p1', 'q:rp:p1']);
    assert.equal(cards[2].photo, 'https://img/1.png');
    assert.match(cards[2].text, /Caption &lt;b&gt;/);
    assert.deepEqual(cards[3].buttons.map((b) => b.data), ['q:ai:l1', 'q:si:l1']);
  });
  it('leaves out what was already decided and is waiting for the agents', () => {
    const queued = data({ commands: [{ id: 'c1', type: 'approve-post', targetId: 'p1', by: 'me', at: now, status: 'pending', result: null, appliedAt: null }] });
    assert.equal(inboxCards(queued, now).length, 3);
  });
});

describe('chunks', () => {
  it('splits long text on line breaks under the limit', () => {
    const parts = chunks(['a'.repeat(30), 'b'.repeat(30), 'c'.repeat(30)].join('\n'), 64);
    assert.deepEqual(parts.map((p) => p.length), [61, 30]);
    assert.ok(chunks('x'.repeat(150), 64).every((p) => p.length <= 64));
  });
});

describe('reportForQuestion', () => {
  it('leads with HQ\'s own totals, drops image URLs and, only when too long, whole sections', () => {
    const small = reportForQuestion(data(), now);
    assert.deepEqual(small.omitted, []);
    assert.doesNotMatch(small.json, /img\/1\.png/);
    const totals = JSON.parse(small.json).totals;
    assert.equal(totals.money.thisMonth, 120_000);
    assert.equal(totals.owedToAldo.lateTotal, 40_000);
    assert.equal(totals.gym.thisWeek, 1);
    assert.equal(totals.waitingOnAldo.length, 4);
    const tiny = reportForQuestion(data(), now, 10);
    assert.deepEqual(tiny.omitted, ['lead list', 'Instagram inspiration', 'Gmail sends', 'relationship history', 'reply check notes']);
  });
});

describe("Instagram agent notes (/ig)", () => {
  it("keeps the text after /ig, and nothing for a bare /ig", () => {
    assert.equal(igNoteText("/ig  push   Halloween stuff this week "), "push Halloween stuff this week");
    assert.equal(igNoteText("/ig@Clifford1400bot post this https://cbc.ca/x"), "post this https://cbc.ca/x");
    assert.equal(igNoteText("/ig"), null);
  });
  it("round-trips the Forget button", () => {
    assert.deepEqual(decodeButton(encodeIgForget("abc123")!), { kind: "igforget", id: "abc123" });
  });
  it("says a link becomes a post and a note shapes captions", () => {
    assert.match(igSavedText("post this https://cbc.ca/x"), /drafts a post from that link/);
    assert.match(igSavedText("more Flames"), /tomorrow morning's plan/);
    assert.equal(igListCards([], 0).length, 1);
    assert.equal(igListCards([{ id: "a", text: "more <b>Flames</b>", at: 0 }], 0)[0].text.includes("&lt;b&gt;"), true);
  });
});
