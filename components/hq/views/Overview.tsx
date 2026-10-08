"use client";

import { inFilter, useHq } from "../context";
import { BUSINESS_LABEL, ago, calgaryParts, cdn, num, plural, short, slot, when } from "../format";
import { Spark, Stat, Thumb } from "../ui";
import { evaluateAll } from "../tasks";
import { replyBoard } from "@/lib/hq/triage";

export function OverviewView() {
  const { data, now, filter, go } = useHq();
  const snap = data.snapshot;
  const { weekday, date, hour } = calgaryParts(now);
  const greeting = hour < 12 ? "Good morning." : hour < 18 ? "Good afternoon." : "Good evening.";

  const replies = (snap?.inbox?.replies ?? []).filter((r) => !r.approved && inFilter(filter, r.business));
  const pitches = (snap?.inbox?.pitches ?? []).filter((p) => inFilter(filter, p.business));
  const decisionPosts = (snap?.posts ?? []).filter((p) => ["drafted", "needs-correction", "failed"].includes(p.status) && inFilter(filter, p.brand));
  const gmail = replyBoard(data, (r) => inFilter(filter, r.business)).board;
  const waiting = replies.length + pitches.length + decisionPosts.length + gmail.length;
  const needs = [
    ...replies.map((r) => ({ key: `r${r.leadId}`, at: r.at, label: "Reply", title: `${r.businessName} wrote back`, detail: r.text.replace(/\s+/g, " ").slice(0, 120), business: r.business })),
    ...decisionPosts.map((p) => ({ key: `p${p.id}`, at: p.updatedAt, label: p.status === "drafted" ? "Approve post" : "Fix post", title: p.headline, detail: p.suggestedFor ? `Slot ${when(p.suggestedFor)}` : p.template, business: p.brand })),
    ...pitches.map((p) => ({ key: `c${p.leadId}`, at: p.at, label: "Approve pitch", title: p.businessName, detail: p.subject, business: p.business })),
    ...gmail.map(({ reply: r, state, triage, decision }) => ({
      key: `g${r.url}${r.at}`,
      at: r.at,
      label: state === "proposed" ? "Approve subtask" : state === "approved" ? "Subtask" : "Reply in Gmail",
      title: `${r.name || r.from} wrote back`,
      detail: (state === "approved" ? decision?.title ?? triage?.subtask?.title : state === "proposed" ? triage?.subtask?.title : null) ?? r.snippet.slice(0, 120),
      business: r.business,
    })),
  ].sort((a, b) => a.at - b.at);

  const accounts = (snap?.instagram?.accounts ?? []).filter((a) => inFilter(filter, a.business));
  const followers = accounts.reduce((n, a) => n + a.followers, 0);
  const followerDelta = accounts.reduce((n, a) => n + (a.trend.length > 1 ? a.followers - a.trend[0].followers : 0), 0);
  const cdTrend = accounts.find((a) => a.handle === "calgarydaily")?.trend.map((t) => t.followers) ?? snap?.calgaryDaily?.followerTrend.map((t) => t.count) ?? [];
  const cw = snap?.pipelines.find((p) => p.business === "calgarywatch");
  const gmailPitches = (data.gmail?.sends ?? []).filter((s) => s.first && s.at >= now - 30 * 86_400_000 && s.business !== "other" && inFilter(filter, s.business)).length;
  const sent30 = (inFilter(filter, "calgarywatch") ? cw?.sent30 ?? 0 : 0) + (inFilter(filter, "arctos") ? data.arctos?.last30 ?? 0 : 0) + gmailPitches;
  const scheduled = (snap?.posts ?? []).filter((p) => p.status === "approved" && inFilter(filter, p.brand)).sort((a, b) => (a.scheduledFor ?? 0) - (b.scheduledFor ?? 0));
  const tasks = evaluateAll(data, now).filter((t) => inFilter(filter, t.routine.owner) || t.routine.owner === "shared");
  const tasksDone = tasks.filter((t) => t.state === "confirmed" || t.state === "done").length;
  const tasksDue = tasks.filter((t) => !["later", "setup", "unknown"].includes(t.state)).length;
  const failing = tasks.filter((t) => t.state === "failed" || t.state === "missed").length;
  const healthItems = snap?.health?.items ?? [];
  const healthy = healthItems.filter((h) => h.ok).length;
  const activity = (snap?.activity ?? []).filter((a) => inFilter(filter, a.business)).slice(0, 7);
  const idea = snap?.instagram?.analysis?.ideas?.[0];

  return (
    <div className="hq-view">
      <header>
        <p className="hq-eyebrow">{weekday} · {date}{filter !== "all" ? ` · ${BUSINESS_LABEL[filter]}` : ""}</p>
        <h1 className="hq-h1">{greeting} {waiting ? <><em>{plural(waiting, "thing")}</em> {waiting === 1 ? "needs" : "need"} you.</> : <>Nothing needs you. <em>Go build.</em></>}</h1>
      </header>

      <div className="hq-islands">
        <section className="hq-card hq-island">
          <div className="hq-card__head"><p className="hq-eyebrow"><span>01</span> Win the customer</p><button type="button" className="hq-btn hq-btn--ghost" onClick={() => go("instagram")}>Instagram</button></div>
          <div className="hq-stats">
            <Stat value={num(followers)} label={`followers, ${accounts.length} ${accounts.length === 1 ? "account" : "accounts"}`} delta={followerDelta ? `${followerDelta > 0 ? "+" : ""}${followerDelta} tracked` : undefined} dir={followerDelta > 0 ? "up" : followerDelta < 0 ? "down" : "flat"} />
            <Stat value={num(sent30)} label="outreach emails, 30 days" />
            <Stat value={num(cw?.interested30 ?? 0)} label="interested, 30 days" />
          </div>
          <Spark values={cdTrend} label="CalgaryDaily followers, recent days" />
        </section>
        <section className="hq-card hq-island">
          <div className="hq-card__head"><p className="hq-eyebrow"><span>02</span> Run the work</p><button type="button" className="hq-btn hq-btn--ghost" onClick={() => go("tasks")}>Tasks</button></div>
          <div className="hq-stats">
            <Stat value={waiting} label="waiting on you" delta={needs[0] ? `oldest ${ago(needs[0].at, now)}` : undefined} />
            <Stat value={scheduled.length} label="posts scheduled" />
            <Stat value={tasksDue ? `${tasksDone}/${tasksDue}` : "—"} label="jobs done today" delta={failing ? `${failing} need a look` : undefined} dir={failing ? "down" : undefined} />
          </div>
        </section>
        <section className="hq-card hq-island">
          <div className="hq-card__head"><p className="hq-eyebrow"><span>03</span> See the numbers</p><button type="button" className="hq-btn hq-btn--ghost" onClick={() => go("performance")}>Numbers</button></div>
          <div className="hq-stats">
            <Stat value={snap?.calgaryDaily?.queue.published7d ?? "—"} label="posts published, 7 days" />
            <Stat value={snap?.calgaryDaily?.avgDelayMinutes == null ? "—" : `${Math.round(snap.calgaryDaily.avgDelayMinutes)} min`} label="average lateness" />
            <Stat value={healthItems.length ? `${healthy}/${healthItems.length}` : "—"} label="connections healthy" dir={healthy < healthItems.length ? "down" : undefined} delta={healthy < healthItems.length ? `${healthItems.length - healthy} broken` : undefined} />
          </div>
        </section>
      </div>

      <div className="hq-cols-2">
        <section className="hq-card">
          <div className="hq-card__head"><h2 className="hq-h2">Needs you</h2>{needs.length ? <button type="button" className="hq-btn hq-btn--primary" onClick={() => go("inbox")}>Open inbox</button> : null}</div>
          {needs.length ? (
            <ul className="hq-list">
              {needs.slice(0, 6).map((n) => (
                <li key={n.key} className="hq-row" data-sev={now - n.at > 3 * 86_400_000 ? "bad" : now - n.at > 86_400_000 ? "warn" : "ok"}>
                  <strong><span className="hq-chip" style={{ marginRight: 8 }}>{n.label}</span>{n.title}</strong>
                  <span className="hq-when">{ago(n.at, now)}</span>
                  <p>{BUSINESS_LABEL[n.business]} · {n.detail}</p>
                </li>
              ))}
            </ul>
          ) : <p className="hq-small">Nothing is waiting. Replies, drafts and pitches land here the moment the agents find them.</p>}
          {needs.length > 6 ? <button type="button" className="hq-btn hq-btn--ghost" onClick={() => go("inbox")}>And {needs.length - 6} more</button> : null}
        </section>
        <section className="hq-card">
          <div className="hq-card__head"><h2 className="hq-h2">Latest from the agents</h2><button type="button" className="hq-btn hq-btn--ghost" onClick={() => go("tasks")}>All</button></div>
          {activity.length ? (
            <ol className="hq-feed">
              {activity.map((a, i) => (
                <li key={`${a.at}-${i}`} data-type={a.type}>
                  <b>{a.type} <span className="hq-mono">· {ago(a.at, now)}</span></b>
                  <p>{a.text}</p>
                </li>
              ))}
            </ol>
          ) : <p className="hq-small">Quiet for now.</p>}
        </section>
      </div>

      {scheduled.length ? (
        <section className="hq-card">
          <div className="hq-card__head"><h2 className="hq-h2">Up next on Instagram</h2><button type="button" className="hq-btn hq-btn--ghost" onClick={() => go("instagram")}>Queue</button></div>
          <div className="hq-gallery">
            {scheduled.slice(0, 6).map((p) => (
              <div className="hq-tile" key={p.id}>
                <Thumb src={cdn(p.imageUrl)} alt={p.altText || p.headline} tag={p.format === "reel" ? "Reel" : undefined} />
                <span className="hq-mono"><span>{slot(p.scheduledFor)}</span><span>{p.scheduledFor ? short(p.scheduledFor, now) : ""}</span></span>
                <p>{p.headline}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {idea ? (
        <section className="hq-card">
          <div className="hq-card__head"><p className="hq-eyebrow">Today&apos;s idea from Inspiration</p><button type="button" className="hq-btn hq-btn--ghost" onClick={() => go("inspiration")}>All ideas</button></div>
          <h2 className="hq-h2">{idea.title} <span className="hq-chip" style={{ marginLeft: 6 }}>{idea.format}</span></h2>
          <p className="hq-lede"><b style={{ color: "var(--fg)" }}>Hook:</b> {idea.hook}</p>
          <p className="hq-small">{idea.why}</p>
        </section>
      ) : null}
    </div>
  );
}
