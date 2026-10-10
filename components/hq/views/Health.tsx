"use client";

import { useHq } from "../context";
import { ago } from "../format";
import { Empty } from "../ui";

export function HealthView() {
  const { data, now } = useHq();
  const b = data.snapshot?.bottlenecks ?? [];
  const items = data.snapshot?.health?.items ?? [];
  const bad = b.filter((x) => x.severity === "bad").length + items.filter((i) => !i.ok).length;
  return (
    <div className="hq-view">
      <header>
        
        <h1 className="hq-h1">{bad ? <>{bad} {bad === 1 ? "thing is" : "things are"} <em>holding work up.</em></> : <>Nothing is <em>holding work up.</em></>}</h1>
      </header>
      <section className="hq-card">
        <div className="hq-card__head"><h2 className="hq-h2">Where work piles up</h2></div>
        {b.length ? (
          <ul className="hq-list">
            {b.map((x) => (
              <li key={x.id} className="hq-row" data-sev={x.severity}>
                <strong>{x.label}</strong>
                <span className="hq-pill" data-sev={x.severity}>{x.severity === "ok" ? "OK" : x.severity === "warn" ? "Watch" : "Blocked"}</span>
                <p>{x.value} · {x.detail}</p>
              </li>
            ))}
          </ul>
        ) : <Empty title="No report yet." />}
      </section>
      <section className="hq-card">
        <div className="hq-card__head"><h2 className="hq-h2">Every connection</h2>{data.snapshot?.health ? <span className="hq-mono">Checked {ago(data.snapshot.health.checkedAt, now)}</span> : null}</div>
        <ul className="hq-list">
          {items.map((h) => (
            <li key={h.id} className="hq-row" data-sev={h.ok ? "ok" : "bad"}>
              <strong>{h.label}</strong>
              <span className="hq-pill" data-sev={h.ok ? "ok" : "bad"}>{h.ok ? "OK" : "Broken"}</span>
              <p>{h.detail}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
