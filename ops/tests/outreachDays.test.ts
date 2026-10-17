/** Did outreach go out: the HQ calendar, Today's run list and the bot's outreach checks (pure; no network). */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { alertsFor } from '../../lib/hq/alerts';
import { outreachCalendar, outreachRunsToday, type OutreachInput } from '../../lib/hq/outreachDays';
import type { ArctosOutreach, WorkflowSummary } from '../../lib/hq/types';

const MIN = 60_000;
// Monday Oct 12, 2026 in Calgary (MDT, UTC-6).
const at = (hhmm: string, date = '2026-10-12') => Date.parse(`${date}T${hhmm}:00-06:00`);

const log = (sends: Array<{ at: number }>, byDay: Record<string, number>): ArctosOutreach => ({
  total: sends.length, last30: sends.length, today: 0, lastSentAt: sends[0]?.at ?? null,
  sendsByDay: Object.entries(byDay).map(([date, sent]) => ({ date, sent })),
  sends: sends.map((s) => ({ business: 'B', subject: 'S', at: s.at })),
});

const outreachWorkflow = (runs: WorkflowSummary['runs']): WorkflowSummary => ({
  repo: 'Aldo140/ArctosLaunchpad', file: 'outreach.yml', name: 'Arctos outreach', job: '', cron: '',
  lastRunAt: runs[0]?.at ?? null, lastStatus: runs[0]?.status ?? 'unknown', lastDurationSec: null, lastUrl: null, recent: [], runs,
});

const input = (over: Partial<OutreachInput> = {}): OutreachInput => ({
  snapshot: null,
  arctos: log([{ at: at('12:41') }, { at: at('12:41') }], { '2026-10-12': 2, '2026-10-09': 30, '2026-10-08': 0 }),
  vowmotion: log([{ at: at('12:42') }], { '2026-10-12': 1 }),
  workflows: [outreachWorkflow([
    { at: at('13:12'), end: at('13:13'), status: 'failure', url: 'https://github.com/x/1', event: 'workflow_dispatch' },
    { at: at('12:40'), end: at('12:43'), status: 'success', url: 'https://github.com/x/2', event: 'workflow_dispatch' },
    { at: at('12:10'), end: at('12:11'), status: 'success', url: 'https://github.com/x/3', event: 'workflow_dispatch' },
  ])],
  ...over,
});

describe('outreachCalendar', () => {
  it('marks sent days, failed runs, weekends, missed weekdays and today in progress', () => {
    const rows = outreachCalendar(input(), at('14:00'));
    const arctos = rows.find((r) => r.id === 'arctos')!;
    const day = (d: string) => arctos.days.find((x) => x.date === d)!;
    assert.equal(arctos.days.length, 7);
    assert.equal(day('2026-10-12').state, 'ok');
    assert.equal(day('2026-10-12').sent, 2);
    const runs = rows.find((r) => r.id === 'runs')!;
    assert.equal(runs.days.at(-1)!.state, 'failed');
    assert.equal(runs.days.at(-1)!.failedRuns, 1);
    // Before the oldest run GitHub returned, there's no record either way.
    assert.equal(runs.days[0].state, 'off');
    assert.equal(day('2026-10-09').state, 'ok');
    assert.equal(day('2026-10-10').state, 'off');
    assert.equal(day('2026-10-08').state, 'missed');
    const cw = rows.find((r) => r.id === 'calgarywatch')!;
    assert.equal(cw.days.at(-1)!.state, 'waiting');
    assert.equal(outreachCalendar(input(), at('17:00')).find((r) => r.id === 'calgarywatch')!.days.at(-1)!.state, 'missed');
  });
});

describe('outreachRunsToday', () => {
  it('lists runs that sent something or failed, with what each sent', () => {
    const runs = outreachRunsToday(input(), at('14:00'));
    assert.deepEqual(runs.map((r) => [r.status, r.arctos, r.vowmotion]), [['success', 2, 1], ['failure', 0, 0]]);
  });
});

describe('outreach checks in alertsFor', () => {
  const base = { snapshot: null, gmail: null, triage: null, decisions: [], calendar: null, life: [] };
  it('texts once when the sender has been quiet for over 75 minutes on a weekday', () => {
    const quiet = alertsFor({ ...base, now: at('14:30'), outreach: input() });
    assert.ok(quiet.some((a) => a.key === 'outreach-stalled:2026-10-12' && /hasn't run/.test(a.text)));
    assert.ok(!alertsFor({ ...base, now: at('13:40'), outreach: input() }).some((a) => a.key.startsWith('outreach-stalled')));
    // Saturday: no checks.
    assert.ok(!alertsFor({ ...base, now: at('14:30', '2026-10-10'), outreach: input() }).some((a) => a.key.startsWith('outreach')));
  });
  it('sends the day\'s tally after 5 pm', () => {
    const tally = alertsFor({ ...base, now: at('17:05'), outreach: input() }).find((a) => a.key === 'outreach-day:2026-10-12');
    assert.ok(tally);
    assert.match(tally!.text, /Outreach today: 3 emails/);
    assert.match(tally!.text, /✓ Arctos: 2 sent/);
    assert.match(tally!.text, /✓ Vow Motion: 1 sent/);
    assert.match(tally!.text, /✗ 1 send run failed/);
    assert.match(tally!.text, /⚠️ CalgaryWatch: nothing went out/);
  });
  it('stays quiet without outreach data', () => {
    assert.ok(!alertsFor({ ...base, now: at('17:05') }).some((a) => a.key.startsWith('outreach')));
  });
});
