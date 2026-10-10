"use client";

import { useHq } from "../context";
import { ago, num } from "../format";
import { Empty, Thumb } from "../ui";

export function InspirationView() {
  const { data, now } = useHq();
  const ig = data.snapshot?.instagram;
  const analysis = ig?.analysis ?? null;
  const posts = ig?.inspiration ?? [];

  return (
    <div className="hq-view">
      <header>
        
        <h1 className="hq-h1">What&apos;s working in Calgary, <em>and what we make of it.</em></h1>
        <p className="hq-lede" style={{ marginTop: 10 }}>Every morning the agent reads other Calgary accounts and pulls the posts that beat their own usual, so a small account&apos;s breakout counts as much as a big account&apos;s ordinary day. Then it writes down the patterns and turns them into original ideas. It never copies; reposts only with credit and permission.</p>
      </header>

      {analysis ? (
        <div className="hq-cols">
          <section className="hq-card">
            <div className="hq-card__head"><h2 className="hq-h2">Patterns</h2><span className="hq-mono">{ago(analysis.at, now)}</span></div>
            <ol className="hq-list">
              {analysis.patterns.map((p) => (
                <li key={p.title} className="hq-row">
                  <strong>{p.title}</strong>
                  <span className="hq-when">{p.examples.length} {p.examples.length === 1 ? "post" : "posts"}</span>
                  <p>{p.why}</p>
                  {p.examples.length ? (
                    <p>{p.examples.slice(0, 3).map((u, i) => <a key={u} className="hq-link" href={u} target="_blank" rel="noreferrer" style={{ marginRight: 10 }}>Example {i + 1}</a>)}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
          <section className="hq-card">
            <div className="hq-card__head"><h2 className="hq-h2">Ideas for @calgarydaily</h2></div>
            <ol className="hq-list">
              {analysis.ideas.map((i) => (
                <li key={i.title} className="hq-row" data-sev="ok">
                  <strong>{i.title}</strong>
                  <span className="hq-chip">{i.format}</span>
                  <p><b style={{ color: "var(--fg)" }}>Hook:</b> {i.hook}</p>
                  <p>{i.why}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      ) : (
        <Empty title="The first analysis runs with tomorrow morning's agents.">It needs at least three posts that beat their account&apos;s usual this month.</Empty>
      )}

      <section className="hq-card">
        <div className="hq-card__head">
          <h2 className="hq-h2">Beat their own usual · last 30 days</h2>
          {ig?.updatedAt ? <span className="hq-mono">Read {ago(ig.updatedAt, now)}</span> : null}
        </div>
        {posts.length ? (
          <div className="hq-gallery">
            {posts.map((p) => (
              <a className="hq-tile" key={p.permalink} href={p.permalink} target="_blank" rel="noreferrer">
                <Thumb src={p.mediaUrl} alt={p.caption.slice(0, 120) || `Post by @${p.handle}`} tag={`${p.lift}× usual`} />
                <span className="hq-mono"><span>@{p.handle}</span><span>{num(p.engagement)} reactions · {p.reel ? "Reel" : "Post"}</span></span>
                <p>{p.caption || "No caption"}</p>
              </a>
            ))}
          </div>
        ) : <p className="hq-small">No standout posts yet this month.</p>}
      </section>
    </div>
  );
}
