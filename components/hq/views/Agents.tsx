"use client";

import type { WorkflowSummary } from "@/lib/hq/types";
import { inFilter, useHq } from "../context";
import { BUSINESS_LABEL, ago } from "../format";
import { Empty } from "../ui";

const SEV: Record<WorkflowSummary["lastStatus"], "ok" | "warn" | "bad" | "idle"> = { success: "ok", running: "warn", failure: "bad", cancelled: "idle", skipped: "idle", unknown: "idle" };
const WORD: Record<WorkflowSummary["lastStatus"], string> = { success: "OK", running: "Running", failure: "Failed", cancelled: "Cancelled", skipped: "Skipped", unknown: "No runs" };

function Runs({ recent }: { recent: WorkflowSummary["recent"] }) {
  return (
    <span aria-label={`Last ${recent.length} runs`} style={{ display: "inline-flex", gap: 3 }}>
      {recent.map((r, i) => (
        <span key={i} title={WORD[r]} style={{ width: 6, height: 14, borderRadius: 2, background: r === "success" ? "var(--hq-ok)" : r === "failure" ? "var(--hq-bad)" : r === "running" ? "var(--hq-warn)" : "var(--line-strong)" }} />
      ))}
    </span>
  );
}

export function AgentsView() {
  const { data, now, filter } = useHq();
  const runs = data.workflows ?? [];
  const failing = runs.filter((r) => r.lastStatus === "failure");
  const activity = (data.snapshot?.activity ?? []).filter((a) => inFilter(filter, a.business));

  return (
    <div className="hq-view">
      <header>
        <p className="hq-eyebrow"><span>02</span> Run the work</p>
        <h1 className="hq-h1">{failing.length ? <>{failing.length} {failing.length === 1 ? "agent" : "agents"} <em>need a look.</em></> : <>Every agent <em>is running clean.</em></>}</h1>
        <p className="hq-lede" style={{ marginTop: 10 }}>The agents run on GitHub&apos;s schedule. Each bar is one run, oldest to newest. A red last run means the next one retries; two in a row is worth a look.</p>
      </header>

      {runs.length ? (
        <div className="hq-tablewrap" style={{ maxHeight: "none" }}>
          <table className="hq-table">
            <thead><tr><th>Agent</th><th>What it does</th><th>Last run</th><th>Status</th><th>Recent runs</th></tr></thead>
            <tbody>
              {runs.map((r) => (
                <tr key={`${r.repo}/${r.file}`}>
                  <td><strong>{r.name}</strong><div className="hq-mono">{r.repo.split("/")[1]}</div></td>
                  <td className="hq-small" style={{ maxWidth: 360 }}>{r.job}</td>
                  <td className="hq-num">{r.lastRunAt ? ago(r.lastRunAt, now) : "—"}{r.lastDurationSec !== null ? <div className="hq-mono">{r.lastDurationSec < 90 ? `${r.lastDurationSec} s` : `${Math.round(r.lastDurationSec / 60)} min`}</div> : null}</td>
                  <td>{r.lastUrl ? <a href={r.lastUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}><span className="hq-pill" data-sev={SEV[r.lastStatus]}>{WORD[r.lastStatus]}</span></a> : <span className="hq-pill" data-sev="idle">{WORD[r.lastStatus]}</span>}</td>
                  <td><Runs recent={r.recent} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Empty title="Couldn't reach GitHub for the run history.">It retries on the next refresh.</Empty>}

      <section className="hq-card">
        <div className="hq-card__head"><h2 className="hq-h2">What happened · 72 hours</h2><span className="hq-mono">{activity.length} events</span></div>
        {activity.length ? (
          <ol className="hq-feed">
            {activity.map((a, i) => (
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
