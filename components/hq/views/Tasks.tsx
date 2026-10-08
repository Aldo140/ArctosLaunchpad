"use client";

import { useMemo } from "react";
import { useHq } from "../context";
import { BUSINESS_LABEL, ago } from "../format";
import { Empty, Stat } from "../ui";
import { OWNER_LABEL, OWNER_ORDER, STATE, calgaryDayStart, clock, cronFire, evaluateAll, reliability, type TaskStatus } from "../tasks";

const DAY = 86_400_000;
const RUN_WORD = { success: "Done", failure: "Failed", running: "Running", queued: "Waiting for GitHub", cancelled: "Cancelled", skipped: "Skipped", unknown: "Unknown" } as const;
const SEV = { success: "ok", failure: "bad", running: "warn", queued: "warn", cancelled: "idle", skipped: "idle", unknown: "idle" } as const;

/** Midnight to midnight, Calgary time: a tick per run today, a ring on the next scheduled run. */
function DayTrack({ t, now }: { t: TaskStatus; now: number }) {
  const start = calgaryDayStart(now);
  const pos = (at: number) => `${Math.min(100, Math.max(0, ((at - start) / DAY) * 100)).toFixed(2)}%`;
  const next = t.next && t.next < start + DAY ? t.next : null;
  const proofs = (t.proof?.items ?? []).filter((i) => i.at >= start);
  return (
    <div className="hq-track" role="img" aria-label={`${t.runsToday.length} runs today${proofs.length ? `, ${proofs.length} confirmed results` : ""}`}>
      <span className="hq-track__now" style={{ left: pos(now) }} />
      {t.runsToday.map((r) => <span key={r.at} className="hq-track__run" data-sev={SEV[r.status]} style={{ left: pos(r.at) }} title={`${RUN_WORD[r.status]} · ${clock(r.at, now)}`} />)}
      {proofs.map((p, i) => <span key={`${p.at}-${i}`} className="hq-track__proof" style={{ left: pos(p.at) }} title={`${clock(p.at, now)} · ${p.text}`} />)}
      {next ? <span className="hq-track__next" style={{ left: pos(next) }} title={`Next run ${clock(next, now)}`} /> : null}
    </div>
  );
}

function Task({ t, now }: { t: TaskStatus; now: number }) {
  const { routine: r, state, wf } = t;
  const s = STATE[state];
  const items = t.proof?.items ?? [];
  const runs = (wf?.runs ?? []).slice(0, 8);
  return (
    <details className="hq-task" data-sev={s.sev} data-state={state}>
      <summary>
        <span className="hq-task__mark" aria-hidden="true" />
        <span className="hq-task__main">
          <strong>{r.title}</strong>
          <span className="hq-task__line">{t.line}</span>
        </span>
        <span className="hq-task__side">
          <span className="hq-pill" data-sev={s.sev}>{s.label}</span>
          <span className="hq-mono">{state === "setup" ? r.cadence : t.next ? `next ${clock(t.next, now)}` : r.cadence}</span>
        </span>
        {wf && state !== "setup" ? <DayTrack t={t} now={now} /> : null}
      </summary>
      <div className="hq-task__body">
        <div>
          <p className="hq-h3">The job</p>
          <p className="hq-small" style={{ margin: "6px 0 0" }}>{r.done}</p>
          <p className="hq-mono" style={{ margin: "6px 0 0" }}>{r.cadence}{wf ? ` · ${wf.name}` : ""}</p>
        </div>
        {r.proof ? (
          <div>
            <p className="hq-h3">Today&apos;s proof · {t.proof?.headline}</p>
            {items.length ? (
              <ol className="hq-proof">
                {items.slice(0, 12).map((i, k) => (
                  <li key={`${i.at}-${k}`}>
                    <span className="hq-mono">{clock(i.at, now)}</span>
                    {i.href ? <a href={i.href} target="_blank" rel="noreferrer">{i.text}</a> : <span>{i.text}</span>}
                  </li>
                ))}
                {items.length > 12 ? <li><span className="hq-mono" /><span className="hq-small">and {items.length - 12} more</span></li> : null}
              </ol>
            ) : <p className="hq-small" style={{ margin: "6px 0 0" }}>Nothing to show yet today.</p>}
          </div>
        ) : null}
        {runs.length ? (
          <div>
            <p className="hq-h3">Recent runs</p>
            <ol className="hq-proof">
              {runs.map((x) => (
                <li key={x.at}>
                  <span className="hq-mono">{clock(x.at, now)}</span>
                  <a href={x.url} target="_blank" rel="noreferrer">
                    <span className="hq-pill" data-sev={SEV[x.status]}>{RUN_WORD[x.status]}</span>
                    <span className="hq-small">{x.end ? ` ${Math.max(1, Math.round((x.end - x.at) / 60_000))} min` : ""}{x.event === "workflow_dispatch" ? " · started by hand" : ""}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    </details>
  );
}

export function TasksView() {
  const { data, now, filter } = useHq();
  const all = useMemo(() => evaluateAll(data, now), [data, now]);
  const tasks = all.filter((t) => filter === "all" || t.routine.owner === filter || t.routine.owner === "shared");
  const count = (...states: TaskStatus["state"][]) => tasks.filter((t) => states.includes(t.state)).length;
  const confirmed = count("confirmed");
  const done = confirmed + count("done");
  const needs = count("failed", "missed");
  const late = count("late");
  const timing = (data.workflows ?? []).map((w) => ({ w, ...reliability(w, now) })).filter((r) => r.expected > 0);
  const slipping = timing.filter((r) => r.actual < r.expected * 0.5);
  const dueToday = tasks.filter((t) => !["later", "setup", "unknown"].includes(t.state)).length;
  const activity = (data.snapshot?.activity ?? []).filter((a) => filter === "all" || a.business === filter);
  const nextUp = tasks
    .filter((t) => t.wf && t.state !== "setup")
    .map((t) => ({ t, at: cronFire(t.wf!.cron, now, 1) ?? Infinity }))
    .sort((a, b) => a.at - b.at)[0];

  return (
    <div className="hq-view">
      <header>
        <p className="hq-eyebrow"><span>02</span> Run the work</p>
        <h1 className="hq-h1">
          {dueToday ? <>{done} of {dueToday} jobs done today, {needs ? <em>{needs} {needs === 1 ? "needs" : "need"} a look.</em> : late ? <em>{late} running late.</em> : <em>{confirmed} confirmed.</em>}</> : <>Nothing has come due yet. <em>The day starts at 3 am.</em></>}
        </h1>
        <p className="hq-lede" style={{ marginTop: 10 }}>Every recurring job the agents own. <b style={{ color: "var(--fg)" }}>Confirmed</b> means the result shows up in the data: the email is in the send log, the post is live, the read landed. <b style={{ color: "var(--fg)" }}>Ran clean</b> means the job finished with nothing to prove today. Open any job for its proof and run history.</p>
      </header>

      <div className="hq-card">
        <div className="hq-stats">
          <Stat value={confirmed} label="confirmed today" />
          <Stat value={count("done")} label="ran clean" />
          <Stat value={needs} label="need a look" dir={needs ? "down" : undefined} delta={needs ? "failed, or a day overdue" : undefined} />
          <Stat value={late} label="running late" />
          <Stat value={count("later")} label="not due yet" />
          <Stat value={count("setup")} label="planned, not set up" />
          <Stat value={nextUp ? clock(nextUp.at, now) : "—"} label={nextUp ? `next: ${nextUp.t.routine.title.toLowerCase()}` : "next run"} />
        </div>
        <div className="hq-tracklegend hq-mono" aria-hidden="true">
          <span><i data-k="run" />run</span><span><i data-k="proof" />confirmed result</span><span><i data-k="next" />next run</span><span><i data-k="now" />now</span><span className="hq-tracklegend__axis">midnight to midnight, Calgary</span>
        </div>
      </div>

      {slipping.length ? (
        <section className="hq-card">
          <div className="hq-card__head">
            <div><p className="hq-eyebrow">Bottleneck</p><h2 className="hq-h2">GitHub is starting {slipping.length === 1 ? "one schedule" : `${slipping.length} schedules`} late or not at all.</h2></div>
          </div>
          <p className="hq-small" style={{ margin: 0 }}>GitHub treats schedules on free accounts as best effort: busy hours delay runs and drop some outright. The jobs still work when they run; they just run less often than written. The fix is a reliable clock that starts them on time (a Vercel cron calling GitHub), which costs nothing.</p>
          <div className="hq-tablewrap" style={{ maxHeight: "none" }}>
            <table className="hq-table" style={{ minWidth: 520 }}>
              <thead><tr><th>Job</th><th className="num">Scheduled, 24 h</th><th className="num">Started</th><th className="num">Typical delay</th></tr></thead>
              <tbody>
                {timing.sort((a, b) => a.actual / a.expected - b.actual / b.expected).map((r) => (
                  <tr key={r.w.file}>
                    <td>{r.w.name}</td>
                    <td className="num">{r.expected}</td>
                    <td className="num"><span className="hq-pill" data-sev={r.actual >= r.expected * 0.8 ? "ok" : r.actual >= r.expected * 0.5 ? "warn" : "bad"}>{r.actual}</span></td>
                    <td className="num">{r.medianDelayMin === null ? "—" : r.medianDelayMin < 90 ? `${r.medianDelayMin} min` : `${Math.round(r.medianDelayMin / 60)} h`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {OWNER_ORDER.filter((o) => filter === "all" || o === filter || o === "shared").map((owner) => {
        const group = tasks.filter((t) => t.routine.owner === owner);
        if (!group.length) return null;
        const ok = group.filter((t) => t.state === "confirmed" || t.state === "done").length;
        const live = group.filter((t) => !["later", "setup", "unknown"].includes(t.state)).length;
        return (
          <section className="hq-card" key={owner}>
            <div className="hq-card__head">
              <h2 className="hq-h2">{OWNER_LABEL[owner]}</h2>
              <span className="hq-mono">{live ? `${ok}/${live} done today` : "nothing due today"}</span>
            </div>
            <div className="hq-tasks">{group.map((t) => <Task key={t.routine.id} t={t} now={now} />)}</div>
          </section>
        );
      })}

      {!data.workflows ? <Empty title="Couldn't reach GitHub for the run history.">It retries on the next refresh; proof from the agents&apos; report still shows.</Empty> : null}

      <section className="hq-card">
        <div className="hq-card__head"><h2 className="hq-h2">Everything that happened · 72 hours</h2><span className="hq-mono">{activity.length} events</span></div>
        {activity.length ? (
          <ol className="hq-feed">
            {activity.slice(0, 40).map((a, i) => (
              <li key={`${a.at}-${i}`} data-type={a.type}>
                <b>{a.type} <span className="hq-mono">· {BUSINESS_LABEL[a.business]} · {ago(a.at, now)}</span></b>
                <p>{a.text}</p>
              </li>
            ))}
          </ol>
        ) : <p className="hq-small">Nothing in the last three days.</p>}
      </section>
    </div>
  );
}
