"use client";

import { useState } from "react";
import { useHq } from "../context";
import { ago } from "../format";
import { Empty, Section } from "../ui";

const DAY = new Intl.DateTimeFormat("en-CA", { weekday: "long", month: "short", day: "numeric", timeZone: "UTC" });

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className="hq-btn hq-btn--primary"
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 2000); }).catch(() => undefined);
      }}
    >
      {done ? "Copied" : "Copy message"}
    </button>
  );
}

/**
 * The posting agent's week for @calgarydaily, and the only part that needs Aldo:
 * creator DMs to send from his phone (the bot can't DM), and clips to film.
 */
export function WeekView() {
  const { data, now } = useHq();
  const c = data.snapshot?.instagram?.coordinator ?? null;
  if (!c) {
    return (
      <div className="hq-view">
        <header><h1 className="hq-h1">This week on <em>@calgarydaily.</em></h1></header>
        <Empty title="The first plan arrives with tomorrow morning's run.">Each morning the agent reads the account&apos;s numbers and what&apos;s working in Calgary, plans the week, and lists the creator messages and clips only you can do.</Empty>
      </div>
    );
  }
  const days = [...new Set(c.plan.map((p) => p.date))].sort();
  return (
    <div className="hq-view">
      <header>
        <h1 className="hq-h1">This week on <em>@calgarydaily.</em></h1>
        <p className="hq-lede" style={{ marginTop: 10 }}>The agent plans and posts on its own. Below is the part it can&apos;t do: Instagram doesn&apos;t let bots message people, so you send these from your phone. Planned {ago(c.at, now)}.</p>
      </header>

      <Section eyebrow="Your part · send from the Instagram app" title={c.outreach.length ? `${c.outreach.length} ${c.outreach.length === 1 ? "creator" : "creators"} to ask` : "No creators to ask today"}>
        {c.outreach.length ? (
          <ol className="hq-list">
            {c.outreach.map((o) => (
              <li key={o.handle + o.postUrl} className="hq-row" data-sev="ok">
                <strong>@{o.handle}</strong>
                <p>{o.why}</p>
                <p style={{ whiteSpace: "pre-wrap", color: "var(--fg)" }}>{o.dm}</p>
                <p style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <CopyButton text={o.dm} />
                  <a className="hq-btn" href={`https://ig.me/m/${o.handle}`} target="_blank" rel="noreferrer">Open DM</a>
                  {o.postUrl ? <a className="hq-link" href={o.postUrl} target="_blank" rel="noreferrer">See the clip</a> : null}
                </p>
              </li>
            ))}
          </ol>
        ) : <p className="hq-small">When the Scout finds a Calgary creator whose clip is doing well, a ready-to-send message asking to share it shows up here. Once they say yes, the clip goes in brand/reposts and the agent posts it with credit.</p>}
      </Section>

      {c.shootList.length ? (
        <Section eyebrow="Your part · if you're out anyway" title="Clips worth filming">
          <ol className="hq-list">
            {c.shootList.map((s) => (
              <li key={s.what} className="hq-row">
                <strong>{s.what}</strong>
                <span className="hq-when">{s.when}</span>
                <p>{s.where}. {s.why}</p>
              </li>
            ))}
          </ol>
        </Section>
      ) : null}

      <Section eyebrow="The agent's plan" title={`${c.plan.length} posts this week`}>
        <p className="hq-small" style={{ marginBottom: 12 }}>{c.direction}</p>
        {days.map((d) => (
          <div key={d} style={{ marginBottom: 14 }}>
            <p className="hq-eyebrow">{DAY.format(new Date(`${d}T12:00:00Z`))}</p>
            <ol className="hq-list">
              {c.plan.filter((p) => p.date === d).sort((a, b) => a.slot.localeCompare(b.slot)).map((p, i) => (
                <li key={i} className="hq-row">
                  <strong>{p.hook}</strong>
                  <span className="hq-when">{p.slot} · {p.format}</span>
                  <p>{p.idea} <span className="hq-chip">{p.pillar}</span> <span className="hq-chip">{p.asset}</span></p>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </Section>
    </div>
  );
}
