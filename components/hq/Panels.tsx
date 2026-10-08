"use client";

import { useState } from "react";
import type { ArctosOutreach, HqResponse, HqSettings, HqSnapshot, Pipeline } from "@/lib/hq/types";
import { Bars, Columns, Trend } from "./Charts";
import { BUSINESS_LABEL, KIND_LABEL, ago, num, pct, usd } from "./format";

const sevFor = (since: number, now: number) => (now - since < 86_400_000 ? "ok" : now - since < 3 * 86_400_000 ? "warn" : "bad");

export function TodayPanel({ snap, now }: { snap: HqSnapshot | null; now: number }) {
  const items = snap?.today ?? [];
  return (
    <section className="hq-panel" aria-labelledby="today-h">
      <h2 id="today-h">Waiting on you</h2>
      <p className="hq-lede">Oldest first. Approvals and fixes happen in each business&apos;s own admin; this is the list of what&apos;s stuck until you look.</p>
      {items.length ? (
        <ul className="hq-list">
          {items.map((t) => (
            <li key={t.id} className="hq-item" data-sev={t.kind === "health" ? "bad" : sevFor(t.since, now)}>
              <strong>
                <span className="hq-chip">{BUSINESS_LABEL[t.business]}</span>
                <span className="hq-chip">{KIND_LABEL[t.kind]}</span>
                {t.title}
              </strong>
              <span className="hq-when">{ago(t.since, now)}</span>
              <p>
                {t.detail}
                {t.link ? <> · <a href={t.link} target="_blank" rel="noreferrer">Open</a></> : null}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="hq-empty">Nothing is waiting on you. The agents will add items here as they come up.</p>
      )}
    </section>
  );
}

export function CreatorsPanel({ snap }: { snap: HqSnapshot | null }) {
  const scout = snap?.scout;
  if (!scout) return <section className="hq-panel"><h2>Calgary creators</h2><p className="hq-empty">The Scout hasn&apos;t reported yet. It runs every morning.</p></section>;
  const active = scout.accounts.filter((a) => a.active);
  const creators = active.filter((a) => a.kind === "creator" || a.kind === "candidate");
  return (
    <section className="hq-panel" aria-labelledby="scout-h">
      <h2 id="scout-h">Calgary creators and accounts</h2>
      <p className="hq-lede">Read daily from Instagram. Active means posted in the last 14 days; engagement is the median likes plus comments on recent posts. Best Creator Bench leads are active creators with a high rate.</p>
      <div className="hq-tiles">
        <div className="hq-tile"><b>{scout.accounts.length}</b><span>accounts read</span></div>
        <div className="hq-tile"><b>{active.length}</b><span>active in the last 14 days</span></div>
        <div className="hq-tile"><b>{creators.length}</b><span>active creators</span></div>
        <div className="hq-tile"><b>{scout.candidatesWaiting}</b><span>credited creators to check</span></div>
      </div>
      <div className="hq-table-wrap">
        <table className="hq-table">
          <thead><tr><th>Account</th><th>Type</th><th>Status</th><th className="num">Followers</th><th className="num">Posts / 30 d</th><th className="num">Median likes + comments</th><th className="num">Rate</th><th className="num">Reels</th><th>Best recent</th></tr></thead>
          <tbody>
            {scout.accounts.map((a) => (
              <tr key={a.handle}>
                <td><a href={`https://www.instagram.com/${a.handle}/`} target="_blank" rel="noreferrer">@{a.handle}</a></td>
                <td>{a.kind}</td>
                <td><span className="hq-pill" data-sev={a.active ? "ok" : "warn"}>{a.active ? "Active" : `Quiet ${a.daysSinceLastPost ?? "?"} d`}</span></td>
                <td className="num">{num(a.followers)}</td>
                <td className="num">{a.posts30}</td>
                <td className="num">{num(a.medianEngagement)}</td>
                <td className="num">{pct(a.engagementRate)}</td>
                <td className="num">{Math.round(a.reelShare * 100)}%</td>
                <td>{a.top ? <a href={a.top.permalink} target="_blank" rel="noreferrer">{num(a.top.engagement)} {a.top.reel ? "Reel" : "post"}</a> : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {scout.unreadable.length ? <p className="hq-lede">Couldn&apos;t read (personal account or wrong handle): {scout.unreadable.join(", ")}</p> : null}
      <p className="hq-meta">Scout updated {ago(scout.updatedAt)}</p>
    </section>
  );
}

export function CalgaryDailyPanel({ snap }: { snap: HqSnapshot | null }) {
  const cd = snap?.calgaryDaily;
  if (!cd) return <section className="hq-panel"><h2>CalgaryDaily</h2><p className="hq-empty">No Instagram numbers yet.</p></section>;
  const trend = cd.followerTrend.map((d) => ({ x: d.date.slice(5), y: d.count }));
  const first = cd.followerTrend[0]?.count;
  const change = first !== undefined && cd.followers !== null ? cd.followers - first : null;
  return (
    <section className="hq-panel" aria-labelledby="cd-h">
      <h2 id="cd-h">@calgarydaily</h2>
      <div className="hq-tiles">
        <div className="hq-tile"><b>{num(cd.followers)}</b><span>followers{change !== null ? ` · ${change >= 0 ? "+" : ""}${change} since ${cd.followerTrend[0].date.slice(5)}` : ""}</span></div>
        <div className="hq-tile"><b>{cd.queue.waiting}</b><span>posts waiting for approval</span></div>
        <div className="hq-tile"><b>{cd.queue.scheduled}</b><span>scheduled</span></div>
        <div className="hq-tile"><b>{cd.queue.published7d}</b><span>published in 7 days</span></div>
        <div className="hq-tile"><b>{cd.avgDelayMinutes === null ? "—" : `${Math.round(cd.avgDelayMinutes)} min`}</b><span>average lateness</span></div>
      </div>
      {trend.length > 1 ? <div className="hq-card"><h3>Followers</h3><Trend data={trend} label="Followers by day" /></div> : null}
      <div className="hq-grid2">
        <div className="hq-card">
          <h3>Median views by origin</h3>
          <Bars rows={cd.byOrigin.map((g) => ({ label: g.label, value: g.medianViews, note: `${g.posts} posts` }))} format={num} />
        </div>
        <div className="hq-card">
          <h3>Median views by format</h3>
          <Bars rows={cd.byFormat.map((g) => ({ label: g.label, value: g.medianViews, note: `${num(g.medianEngagement)} interactions` }))} format={num} />
        </div>
      </div>
      <div className="hq-card">
        <h3>Median views by topic</h3>
        <Bars rows={cd.byTopic.map((g) => ({ label: g.label, value: g.medianViews, note: `${g.posts} posts` }))} format={num} />
      </div>
      <div className="hq-card">
        <h3>Top posts ever</h3>
        <ul className="hq-list">
          {cd.top.map((p) => (
            <li key={p.permalink} className="hq-item">
              <strong><a href={p.permalink} target="_blank" rel="noreferrer">{p.views !== null ? `${num(p.views)} views` : `${num(p.likes)} likes`}</a> · {p.format}{p.repost ? " · credited repost" : ""}</strong>
              <span className="hq-when">{new Date(p.at).toLocaleDateString("en-CA", { year: "numeric", month: "short" })}</span>
              <p>{p.caption}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function PipelineCard({ p }: { p: Pipeline }) {
  return (
    <div className="hq-card">
      <h3>{p.label}</h3>
      {p.connected ? (
        <>
          <div className="hq-funnel">{p.stages.map((s) => <div key={s.key}><b>{s.count}</b><span>{s.label}</span></div>)}</div>
          <p className="hq-lede">Last 30 days: {p.sent30} sent · {p.replies30} replies · {p.interested30} interested</p>
        </>
      ) : (
        <p className="hq-lede">{p.note}</p>
      )}
    </div>
  );
}

function ArctosCard({ a }: { a: ArctosOutreach | null }) {
  return (
    <div className="hq-card">
      <h3>Arctos Launchpad outreach</h3>
      {a ? (
        <>
          <div className="hq-funnel">
            <div><b>{a.today}</b><span>sent today</span></div>
            <div><b>{a.last30}</b><span>sent in 30 days</span></div>
            <div><b>{a.total}</b><span>sent in total</span></div>
          </div>
          <p className="hq-lede">From outreach/sent.json. Replies land in mrotiz14@gmail.com; they show here once the agent can read that inbox. Last send {ago(a.lastSentAt)}.</p>
          <ul className="hq-list">
            {a.recent.map((s) => (
              <li key={`${s.business}-${s.at}`} className="hq-item"><strong>{s.business}</strong><span className="hq-when">{ago(s.at)}</span><p>{s.subject}</p></li>
            ))}
          </ul>
        </>
      ) : (
        <p className="hq-error">Couldn&apos;t read the Arctos send log.</p>
      )}
    </div>
  );
}

export function PipelinesPanel({ data }: { data: HqResponse }) {
  const pipelines = data.snapshot?.pipelines ?? [];
  const others = pipelines.filter((p) => p.business !== "arctos");
  return (
    <section className="hq-panel" aria-labelledby="pipe-h">
      <h2 id="pipe-h">Outreach pipelines</h2>
      <div className="hq-grid2">
        {others.map((p) => <PipelineCard key={p.business} p={p} />)}
        <ArctosCard a={data.arctos} />
      </div>
      {data.snapshot ? <p className="hq-meta">Pipelines counted {ago(data.snapshot.pipelinesAt)}</p> : null}
    </section>
  );
}

export function MoneyPanel({ data, onSave }: { data: HqResponse; onSave: (s: Pick<HqSettings, "balanceUsd" | "dailyCapUsd">) => Promise<string | null> }) {
  const spend = data.snapshot?.spend;
  const settings = data.settings;
  const [balance, setBalance] = useState(settings.balanceUsd?.toString() ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const days = spend?.days ?? [];
  const perDay = spend ? spend.last7 / 7 : 0;
  const since = settings.balanceAt ? new Date(settings.balanceAt).toLocaleDateString("en-CA", { timeZone: "America/Edmonton" }) : null;
  const spentSince = since ? days.filter((d) => d.date >= since).reduce((n, d) => n + d.usd, 0) : 0;
  const left = settings.balanceUsd !== null ? Math.max(0, settings.balanceUsd - spentSince) : null;
  const runway = left !== null && perDay > 0 ? Math.floor(left / perDay) : null;
  const byTask = new Map<string, number>();
  days.forEach((d) => Object.entries(d.byTask).forEach(([k, v]) => byTask.set(k, (byTask.get(k) ?? 0) + v)));

  return (
    <section className="hq-panel" aria-labelledby="money-h">
      <h2 id="money-h">Spend and runway</h2>
      <p className="hq-lede">Claude usage by the ops agents, priced per call. Anthropic has no balance API, so enter your balance after each top-up and HQ counts down from it. The nightly code fixer isn&apos;t metered here.</p>
      <div className="hq-tiles">
        <div className="hq-tile"><b>{usd(spend?.monthToDate)}</b><span>this month</span></div>
        <div className="hq-tile"><b>{usd(spend?.last7)}</b><span>last 7 days · {usd(perDay)}/day</span></div>
        <div className="hq-tile"><b>{usd(left)}</b><span>{left === null ? "balance not entered" : `left of ${usd(settings.balanceUsd)} entered ${ago(settings.balanceAt)}`}</span></div>
        <div className="hq-tile"><b>{runway === null ? "—" : `${runway} days`}</b><span>runway at the 7-day pace</span></div>
      </div>
      {days.length ? (
        <div className="hq-card"><h3>Per day</h3><Columns data={days.map((d) => ({ x: d.date.slice(5), y: d.usd }))} format={usd} label="Claude spend per day" /></div>
      ) : (
        <p className="hq-empty">No metered spend yet. It starts with the next ops run.</p>
      )}
      {byTask.size ? (
        <div className="hq-card"><h3>By job, last 35 days</h3><Bars rows={[...byTask.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ label: k, value: v }))} format={usd} /></div>
      ) : null}
      <form
        className="hq-card hq-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const value = balance.trim() === "" ? null : Number(balance);
          if (value !== null && !Number.isFinite(value)) return setMsg("Enter a dollar amount, like 50 or 12.50.");
          setMsg("Saving…");
          const err = await onSave({ balanceUsd: value, dailyCapUsd: settings.dailyCapUsd });
          setMsg(err ?? "Saved. Runway counts down from now.");
        }}
      >
        <label htmlFor="hq-balance">Anthropic balance now (USD)<input id="hq-balance" inputMode="decimal" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="e.g. 50" /></label>
        <button className="hq-btn hq-btn-primary" type="submit">Save balance</button>
        {msg ? <span className="hq-meta">{msg}</span> : null}
      </form>
    </section>
  );
}

export function BottlenecksPanel({ snap }: { snap: HqSnapshot | null }) {
  const b = snap?.bottlenecks ?? [];
  const health = snap?.health?.items ?? [];
  return (
    <section className="hq-panel" aria-labelledby="bn-h">
      <h2 id="bn-h">Where work piles up</h2>
      <ul className="hq-list">
        {b.map((x) => (
          <li key={x.id} className="hq-item" data-sev={x.severity}>
            <strong>{x.label}</strong>
            <span className="hq-pill" data-sev={x.severity}>{x.severity === "ok" ? "OK" : x.severity === "warn" ? "Watch" : "Blocked"}</span>
            <p>{x.value} · {x.detail}</p>
          </li>
        ))}
      </ul>
      {health.length ? (
        <>
          <h2>Every connection</h2>
          <ul className="hq-list">
            {health.map((h) => (
              <li key={h.id} className="hq-item" data-sev={h.ok ? "ok" : "bad"}>
                <strong>{h.label}</strong>
                <span className="hq-pill" data-sev={h.ok ? "ok" : "bad"}>{h.ok ? "OK" : "Broken"}</span>
                <p>{h.detail}</p>
              </li>
            ))}
          </ul>
          <p className="hq-meta">Health checked {ago(snap?.health?.checkedAt)}</p>
        </>
      ) : null}
    </section>
  );
}

const GLOSSARY: Array<[string, string]> = [
  ["Median views", "The middle value when posts are sorted by views. One viral post can't drag it up, so it shows what a typical post does."],
  ["Credited repost", "Another creator's Reel posted with their permission and their @handle in the caption. Historically CalgaryDaily's best format."],
  ["Engagement rate", "Median likes plus comments divided by followers. Shows whether an audience actually reacts, whatever its size."],
  ["Active", "The account posted in the last 14 days."],
  ["Scout", "The agent that reads other Calgary Instagram accounts once a day through Business Discovery. Read only."],
  ["Creator Bench", "Calgary creators with standing permission to have their Reels reposted with credit."],
  ["Pipeline", "Where outreach contacts are: found, contacted, replied, interested, won."],
  ["Suppression list", "Addresses that asked not to be contacted, or bounced. Nobody on it is ever emailed again, by any business."],
  ["CASL", "Canada's anti-spam law: business emails only, a real mailing address, a working opt-out honoured immediately."],
  ["Send-as", "Gmail sending as aldo@arctoslaunchpad.com or aldo@vowmotionweddings.com through the Brevo relay."],
  ["DKIM / DMARC", "DNS records that prove an email really came from your domain. Without them, mail lands in spam."],
  ["Runway", "How many days the Anthropic balance lasts at the last 7 days' spending pace."],
  ["Lateness", "Minutes between a post's slot and when it actually went out. GitHub starts scheduled runs late."],
  ["Quota", "Firebase's free plan allows 50,000 reads a day. When it's used up, the agents stop until midnight Pacific."],
  ["Workload identity", "How GitHub and Vercel sign in to Google without a stored key: each run gets a one-hour token."],
  ["Data access (Scout)", "Meta stops the Scout's token returning data about 90 days after the app was last approved. Renewing is one click."],
];

export function GlossaryPanel() {
  return (
    <section className="hq-panel" aria-labelledby="gl-h">
      <h2 id="gl-h">Glossary</h2>
      <dl className="hq-gloss">
        {GLOSSARY.map(([t, d]) => (
          <div key={t} style={{ display: "contents" }}><dt>{t}</dt><dd>{d}</dd></div>
        ))}
      </dl>
    </section>
  );
}
