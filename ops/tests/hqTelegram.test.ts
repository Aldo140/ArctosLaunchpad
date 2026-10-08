/** HQ over Telegram: who may use it, what its buttons carry, and what it sends (pure; no network). */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { briefing, chunks, decodeButton, encodeQueue, encodeUndo, inboxCards, reportForQuestion, telegramUsers } from '../../lib/hq/telegramBot';
import type { GmailSummary, HqPost, HqSnapshot } from '../../lib/hq/types';

const now = Date.parse('2026-10-08T18:00:00Z');
const HOUR = 3_600_000;

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

describe('telegramUsers', () => {
  it('reads id=email pairs and skips malformed ones', () => {
    const users = telegramUsers(' 123=Me@Gmail.com, abc=x@y.z, 456=, 789=other@x.ca ');
    assert.deepEqual([...users], [[123, 'me@gmail.com'], [789, 'other@x.ca']]);
    assert.equal(telegramUsers(undefined).size, 0);
  });
});

describe('buttons', () => {
  it('round-trips queue and undo payloads', () => {
    const data = encodeQueue('approve-reply', 'lead_42');
    assert.equal(data, 'q:ar:lead_42');
    assert.deepEqual(decodeButton(data!), { kind: 'queue', type: 'approve-reply', targetId: 'lead_42' });
    assert.deepEqual(decodeButton(encodeUndo('abcDEF123')), { kind: 'undo', commandId: 'abcDEF123' });
  });
  it('refuses payloads over Telegram\'s 64 bytes and unknown codes', () => {
    assert.equal(encodeQueue('approve-post', 'x'.repeat(70)), null);
    assert.equal(decodeButton('q:zz:abc'), null);
    assert.equal(decodeButton('u:../etc'), null);
  });
});

describe('briefing', () => {
  it('counts what is waiting and lists unanswered people, not auto-replies', () => {
    const text = briefing(snapshot(), gmail, now);
    assert.match(text, /report from 2h ago/);
    assert.match(text, /1 post to review, 1 pitch to approve, 1 drafted reply, 1 unanswered email/);
    assert.match(text, /Jo \(Vow Motion\), 3h ago: Wedding/);
    assert.doesNotMatch(text, /Out of office/);
  });
  it('says so when there is no report', () => {
    assert.match(briefing(null, null, now), /haven't published/);
  });
});

describe('inboxCards', () => {
  it('makes one card per open item with the dashboard\'s actions, escaped', () => {
    const cards = inboxCards(snapshot(), gmail, now);
    assert.equal(cards.length, 4);
    assert.deepEqual(cards[0].buttons.map((b) => b.data), ['q:ap:p1', 'q:rp:p1']);
    assert.equal(cards[0].photo, 'https://img/1.png');
    assert.match(cards[0].text, /Caption &lt;b&gt;/);
    assert.deepEqual(cards[1].buttons.map((b) => b.data), ['q:ai:l1', 'q:si:l1']);
    assert.deepEqual(cards[2].buttons.map((b) => b.data), ['q:ar:l2', 'q:hr:l2']);
    assert.deepEqual(cards[3].buttons, []);
    assert.match(cards[3].text, /href="https:\/\/mail\/1"/);
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
  it('drops image URLs and, only when too long, whole sections', () => {
    const small = reportForQuestion(snapshot(), gmail);
    assert.deepEqual(small.omitted, []);
    assert.doesNotMatch(small.json, /img\/1\.png/);
    const tiny = reportForQuestion(snapshot(), gmail, 10);
    assert.deepEqual(tiny.omitted, ['lead list', 'Instagram inspiration', 'Gmail sends']);
  });
});
