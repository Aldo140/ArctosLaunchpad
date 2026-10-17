"use client";

import { OUTREACH_CAP, outreachCalendar, type DayState } from "@/lib/hq/outreachDays";
import { useHq } from "./context";

const TZ = "America/Edmonton";

const MARK: Record<DayState, string> = { ok: "✓", failed: "✗", missed: "0", waiting: "…", off: "–" };
const SAYS: Record<DayState, string> = {
  ok: "went out",
  failed: "a send run failed",
  missed: "nothing went out",
  waiting: "still sending today",
  off: "weekend, no sends",
};

/**
 * Outreach as a calendar: one row per business, one cell per day for the
 * last week, and a row for the send runs. Green means emails went out (or
 * every run worked), red means a send run failed, amber means a weekday
 * passed with nothing sent.
 */
export function OutreachCalendar({ days = 7 }: { days?: number }) {
  const { data, now } = useHq();
  const rows = outreachCalendar({ snapshot: data.snapshot, arctos: data.arctos, vowmotion: data.vowmotion, workflows: data.workflows }, now, days);
  const dates = rows[0]?.days.map((d) => d.date) ?? [];
  const label = (date: string) => new Date(`${date}T12:00:00-06:00`).toLocaleDateString("en-CA", { timeZone: TZ, weekday: "short" });
  return (
    <section className="hq-card">
      <div className="hq-card__head">
        <div><p className="hq-eyebrow">Did it go out?</p><h2 className="hq-h2">Outreach calendar</h2></div>
        <span className="hq-mono">up to {OUTREACH_CAP} a day each</span>
      </div>
      <div className="hq-jobcal" role="table" aria-label="Outreach sent per day, last week">
        <div className="hq-jobcal__row" role="row">
          <span role="columnheader" />
          {dates.map((d, i) => <span key={d} role="columnheader" className="hq-mono" data-today={i === dates.length - 1}>{i === dates.length - 1 ? "Today" : label(d)}</span>)}
        </div>
        {rows.map((r) => (
          <div key={r.id} className="hq-jobcal__row" role="row" data-runs={r.id === "runs"}>
            <span role="rowheader">{r.label}</span>
            {r.days.map((d) => (
              <span key={d.date} role="cell" className="hq-jobcal__cell" data-state={d.state} title={r.id === "runs" ? `${d.date}: ${d.sent} runs, ${d.failedRuns} failed` : `${r.label}, ${d.date}: ${d.sent} sent, ${SAYS[d.state]}`}>
                {r.id === "runs"
                  ? <><b>{d.state === "failed" ? `✗ ${d.failedRuns}` : MARK[d.state]}</b>{d.state === "failed" ? <small>failed</small> : null}</>
                  : <><b>{d.state === "ok" ? d.sent : MARK[d.state]}</b>{d.state === "ok" ? <small>✓</small> : null}</>}
              </span>
            ))}
          </div>
        ))}
      </div>
      <p className="hq-small hq-jobcal__key"><span data-state="ok">✓ emails went out</span> <span data-state="failed">✗ a send run failed</span> <span data-state="missed">0 nothing went out</span> <span data-state="waiting">… still sending today</span></p>
    </section>
  );
}
