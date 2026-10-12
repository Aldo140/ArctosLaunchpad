/** The texts the HQ bot sends on its own: what's worth a buzz, and never twice (pure; no network). */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { HELLO, MAX_PER_RUN, alertsFor, gymWeek, leadAlert, outreachAlert, planAlerts, quietHours, type AlertInput } from '../../lib/hq/alerts';
import type { HqSnapshot, ReplyTriage } from '../../lib/hq/types';

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
// Wednesday Oct 7, 2026, 6 pm in Calgary (MDT, UTC-6).
const wed6pm = Date.parse('2026-10-08T00:00:00Z');
const wed10am = wed6pm - 8 * HOUR;

const snapshot = (over: Partial<HqSnapshot> = {}): HqSnapshot => ({
  version: 2, generatedAt: wed10am, today: [], health: null, calgaryDaily: null, pipelines: [], pipelinesAt: wed10am, bottlenecks: [], ...over,
});

const triageItem = (over: Partial<ReplyTriage>): ReplyTriage => ({
  key: 't1', url: 'https://mail.google.com/x/t1', replyAt: wed10am - HOUR, from: 'Jo <jo@cafe.ca>', at: wed10am, fingerprint: 'f',
  needsAction: true, category: 'question', reason: 'Asks for a price.', checks: [], related: [], subtask: { title: 'Send Jo a quote', detail: '', draftReply: 'Hi Jo' }, ...over,
});

const input = (over: Partial<AlertInput> = {}): AlertInput => ({
  now: wed10am, snapshot: snapshot(), gmail: null, triage: null, decisions: [], calendar: null, life: [], ...over,
});

const keys = (i: AlertInput) => alertsFor(i).map((a) => a.key);

describe('alertsFor', () => {
  it('texts replies that need Aldo, and stays quiet about the rest', () => {
    const triage = { at: wed10am, error: null, items: [
      triageItem({}),
      triageItem({ key: 't2', needsAction: false, category: 'informational' }),
      triageItem({ key: 't3', replyAt: wed10am - 3 * DAY }),
      triageItem({ key: 't4' }),
    ] };
    const decisions = [{ key: 't4', decision: 'dismissed' as const, title: null, by: 'a@b.c', at: wed10am }];
    const alerts = alertsFor(input({ triage, decisions }));
    assert.deepEqual(alerts.map((a) => a.key), ['mail:t1']);
    assert.match(alerts[0].text, /Send Jo a quote/);
    assert.match(alerts[0].text, /Jo &lt;jo@cafe.ca&gt;/);
  });

  it('texts pitch replies, failed posts and real breaks, not warnings or published posts', () => {
    const s = snapshot({
      inbox: { at: wed10am, pitches: [], replies: [
        { leadId: 'l1', business: 'calgarywatch', businessName: 'Bakery', from: 'b@x.ca', subject: 'Re', text: 'Yes please', classification: 'interested', suggestedSubject: 'Re', suggestedBody: 'Great', approved: false, at: wed10am - HOUR },
        { leadId: 'l2', business: 'calgarywatch', businessName: 'Done', from: 'c@x.ca', subject: 'Re', text: 'Ok', classification: 'interested', suggestedSubject: 'Re', suggestedBody: 'Ok', approved: true, at: wed10am },
      ] },
      posts: [
        { id: 'p1', brand: 'calgarydaily', status: 'failed', template: 'event', format: 'image', headline: 'Elk', caption: '', altText: '', imageUrl: null, imageUrls: [], videoUrl: null, warnings: [], facts: '', note: '', suggestedFor: null, scheduledFor: null, publishedAt: null, permalink: null, error: 'Media expired', insights: null, updatedAt: wed10am },
        { id: 'p2', brand: 'calgarydaily', status: 'published', template: 'event', format: 'image', headline: 'Fine', caption: '', altText: '', imageUrl: null, imageUrls: [], videoUrl: null, warnings: [], facts: '', note: '', suggestedFor: null, scheduledFor: null, publishedAt: wed10am, permalink: null, error: null, insights: null, updatedAt: wed10am },
      ],
      bottlenecks: [
        { id: 'inbox', label: 'Reply inbox sync', value: '7 h ago', severity: 'bad', detail: 'Outreach stops.' },
        { id: 'late', label: 'Posts going out late', value: '120 min', severity: 'bad', detail: '' },
        { id: 'claude', label: 'Claude', value: 'Slow', severity: 'warn', detail: '' },
      ],
    });
    assert.deepEqual(keys(input({ snapshot: s })), [`pitch-reply:l1:${wed10am - HOUR}`, 'post-failed:p1', 'break:inbox']);
  });

  it('gives a heads-up 45 minutes before timed events only', () => {
    const calendar = { generatedAt: wed10am, events: [
      { title: 'Call with Sam', start: wed10am + 30 * MIN, end: wed10am + HOUR, allDay: false, location: 'Zoom' },
      { title: 'Later', start: wed10am + 2 * HOUR, end: wed10am + 3 * HOUR, allDay: false, location: '' },
      { title: 'Holiday', start: wed10am + 10 * MIN, end: wed10am + DAY, allDay: true, location: '' },
      { title: 'Started', start: wed10am - MIN, end: wed10am + HOUR, allDay: false, location: '' },
    ] };
    const alerts = alertsFor(input({ calendar }));
    assert.equal(alerts.length, 1);
    assert.match(alerts[0].text, /In 30 min \(10:30 am\): <b>Call with Sam<\/b>/);
  });

  it('texts money owed that is due today or late, once a day', () => {
    const life = [
      { id: 'o1', kind: 'owed' as const, at: wed10am - 10 * DAY, amount: 120000, business: 'arctos', text: 'Bakery site', done: false, due: Date.parse('2026-10-05T12:00:00-06:00') },
      { id: 'o2', kind: 'owed' as const, at: wed10am, amount: 5050, business: 'other', text: 'Sam', done: false, due: Date.parse('2026-10-07T12:00:00-06:00') },
      { id: 'o3', kind: 'owed' as const, at: wed10am, amount: 999, business: 'other', text: 'Next week', done: false, due: Date.parse('2026-10-14T12:00:00-06:00') },
      { id: 'o4', kind: 'owed' as const, at: wed10am, amount: 999, business: 'other', text: 'Paid', done: true, due: Date.parse('2026-10-05T12:00:00-06:00') },
    ];
    const alerts = alertsFor(input({ life }));
    assert.deepEqual(alerts.map((a) => a.key), ['owed:2026-10-07']);
    assert.match(alerts[0].text, /\$1,250\.50 owed/);
    assert.match(alerts[0].text, /Bakery site: \$1,200 \(late since Oct 5\)/);
    assert.match(alerts[0].text, /Sam: \$50\.50 \(due today\)/);
    assert.doesNotMatch(alerts[0].text, /Next week|Paid/);
    assert.deepEqual(keys(input({ life, now: wed10am - 3 * HOUR })), [], 'not before 8 am');
  });

  it('nudges about the gym at 5 pm only when the week is slipping', () => {
    const gym = (t: number) => ({ id: String(t), kind: 'gym' as const, at: t });
    // Wednesday 6 pm, nothing yet this week, last visit Saturday: behind.
    assert.deepEqual(keys(input({ now: wed6pm, life: [gym(wed6pm - 4 * DAY)] })), ['gym:2026-10-07']);
    // Two visits already, went Tuesday: on pace, no text.
    assert.deepEqual(keys(input({ now: wed6pm, life: [gym(wed6pm - DAY), gym(wed6pm - 2 * DAY)] })), []);
    // Went today: no text.
    assert.deepEqual(keys(input({ now: wed6pm, life: [gym(wed6pm - HOUR)] })), []);
    // Not at 10 am.
    assert.deepEqual(keys(input({ now: wed10am, life: [] })), []);
    // Sunday with 2 of 3: last chance.
    const sun6pm = wed6pm + 4 * DAY;
    const text = alertsFor(input({ now: sun6pm, life: [gym(sun6pm - DAY), gym(sun6pm - 2 * DAY)] }))[0].text;
    assert.match(text, /1 more to hit 3 and today is the last day/);
  });

  it('counts calendar workouts as gym days', () => {
    const calendar = { generatedAt: wed6pm, events: [{ title: 'Leg day', start: wed6pm - 3 * HOUR, end: wed6pm - 2 * HOUR, allDay: false, location: '' }] };
    assert.equal(gymWeek({ now: wed6pm, life: [], calendar }).wentToday, true);
    assert.equal(gymWeek({ now: wed6pm, life: [], calendar }).week, 1);
  });
});

describe('planAlerts', () => {
  const a = (key: string) => ({ key, text: key });

  it('sends nothing but hello on the first run, so turning it on does not flood', () => {
    const plan = planAlerts(null, [a('mail:1'), a('cal:1')], wed10am);
    assert.equal(plan.first, true);
    assert.deepEqual(plan.send, []);
    assert.deepEqual(Object.keys(plan.state.sent), ['mail:1', 'cal:1']);
    assert.match(HELLO, /Alerts are on/);
  });

  it('sends each alert once', () => {
    const state = { sent: { 'mail:1': wed10am - HOUR } };
    const plan = planAlerts(state, [a('mail:1'), a('mail:2')], wed10am);
    assert.deepEqual(plan.send.map((x) => x.key), ['mail:2']);
    assert.deepEqual(planAlerts(plan.state, [a('mail:1'), a('mail:2')], wed10am + MIN).send, []);
  });

  it('caps a run and counts the rest', () => {
    const many = Array.from({ length: MAX_PER_RUN + 3 }, (_, i) => a(`mail:${i}`));
    const plan = planAlerts({ sent: {} }, many, wed10am);
    assert.equal(plan.send.length, MAX_PER_RUN);
    assert.equal(plan.more, 3);
    assert.equal(Object.keys(plan.state.sent).length, MAX_PER_RUN + 3);
  });

  it('forgets a break once it recovers, and old alerts after two weeks', () => {
    const state = { sent: { 'break:inbox': wed10am - HOUR, 'mail:old': wed10am - 15 * DAY, 'mail:new': wed10am - DAY } };
    assert.deepEqual(Object.keys(planAlerts(state, [], wed10am).state.sent), ['mail:new']);
    assert.deepEqual(planAlerts(state, [a('break:inbox')], wed10am).send, []);
  });
});

describe('quiet hours and leads', () => {
  it('is quiet from 10 pm to 7 am Calgary', () => {
    assert.equal(quietHours(wed10am), false);
    assert.equal(quietHours(wed6pm + 4 * HOUR), true);
    assert.equal(quietHours(wed10am - 4 * HOUR), true);
  });

  it('writes a lead text with what matters and escapes it', () => {
    const text = leadAlert({ name: 'Jo <Smith>', email: 'jo@cafe.ca', company: 'Cafe & Co', website: '', projectType: 'Website', budget: '$10,000 to $25,000', timeline: '', challenge: 'Our site is slow and nobody calls.', source: '/services' }, true);
    assert.match(text, /New Arctos enquiry<\/b> from Jo &lt;Smith&gt; at Cafe &amp; Co/);
    assert.match(text, /Website · budget \$10,000 to \$25,000/);
    assert.match(text, /Reply to jo@cafe.ca/);
    assert.match(text, /automatic receipt/);
    assert.doesNotMatch(leadAlert({ name: 'Jo', email: 'j@c.ca', company: '', website: '', projectType: 'Website', budget: '', timeline: '', challenge: 'x'.repeat(30), source: '' }, false), /receipt|Came from/);
  });
});

describe('outreachAlert', () => {
  it('says when a run starts and how it ended', () => {
    assert.match(outreachAlert({ event: 'start', planned: 10 }), /starting: sending 10 emails/);
    assert.match(outreachAlert({ event: 'start', planned: 1 }), /sending 1 email from/);
    const done = outreachAlert({ event: 'done', sent: ['Cafe & Co', 'Bakery'], failed: null, sentToday: 20, cap: 50, left: 7 });
    assert.match(done, /✅ <b>Arctos outreach done<\/b>: 2 emails sent/);
    assert.match(done, /• Cafe &amp; Co\n• Bakery/);
    assert.match(done, /20\/50 today, 7 still queued/);
    const stopped = outreachAlert({ event: 'done', sent: ['Cafe'], failed: { business: 'Bakery', error: 'Invalid email' }, runUrl: 'https://github.com/Aldo140/ArctosLaunchpad/actions/runs/1' });
    assert.match(stopped, /stopped<\/b> after 1 email\. Brevo refused Bakery: Invalid email/);
    assert.match(stopped, /See the run/);
    assert.match(outreachAlert({ event: 'crashed' }), /❌ <b>Arctos outreach failed/);
  });
});
