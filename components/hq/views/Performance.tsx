"use client";

import { Bars } from "../Charts";
import { useHq } from "../context";
import { num } from "../format";
import { Empty, Stat } from "../ui";

export function PerformanceView() {
  const { data } = useHq();
  const cd = data.snapshot?.calgaryDaily;
  if (!cd) return <div className="hq-view"><Empty title="No Instagram history yet." /></div>;
  const origin = Object.fromEntries(cd.byOrigin.map((g) => [g.key, g]));
  const credited = origin.repost?.medianViews ?? 0;
  const original = origin.original?.medianViews ?? 0;

  return (
    <div className="hq-view">
      <header>
        
        <h1 className="hq-h1">@calgarydaily, <em>every post it ever made.</em></h1>
        <p className="hq-lede" style={{ marginTop: 10 }}>
          {credited && original ? `A credited Reel gets a median of ${num(credited)} views; an original post gets ${num(original)}. That gap is what the new posting plan is built on.` : "What a typical post does, by origin, format and topic."}
        </p>
      </header>
      <section className="hq-card">
        <div className="hq-stats">
          <Stat value={num(cd.followers)} label="followers" />
          <Stat value={cd.queue.published7d} label="published in 7 days" />
          <Stat value={cd.queue.scheduled} label="scheduled" />
          <Stat value={cd.avgDelayMinutes === null ? "—" : `${Math.round(cd.avgDelayMinutes)} min`} label="average lateness" />
        </div>
      </section>
      <div className="hq-cols">
        <section className="hq-card"><h3 className="hq-h3">Median views by origin</h3><Bars rows={cd.byOrigin.map((g) => ({ label: g.label, value: g.medianViews, note: `${g.posts} posts` }))} format={num} /></section>
        <section className="hq-card"><h3 className="hq-h3">Median views by format</h3><Bars rows={cd.byFormat.map((g) => ({ label: g.label, value: g.medianViews, note: `${num(g.medianEngagement)} interactions` }))} format={num} /></section>
      </div>
      <section className="hq-card"><h3 className="hq-h3">Median views by topic</h3><Bars rows={cd.byTopic.map((g) => ({ label: g.label, value: g.medianViews, note: `${g.posts} posts` }))} format={num} /></section>
      <section className="hq-card">
        <h3 className="hq-h3">The ten best posts ever</h3>
        <ol className="hq-list">
          {cd.top.map((p, i) => (
            <li key={p.permalink} className="hq-row">
              <strong><span className="hq-mono" style={{ marginRight: 8 }}>{String(i + 1).padStart(2, "0")}</span><a href={p.permalink} target="_blank" rel="noreferrer">{p.views !== null ? `${num(p.views)} views` : `${num(p.likes)} likes`}</a> · {p.format}{p.repost ? " · credited repost" : ""}</strong>
              <span className="hq-when">{new Date(p.at).toLocaleDateString("en-CA", { year: "numeric", month: "short" })}</span>
              <p>{p.caption}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
