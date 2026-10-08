"use client";

import { useState } from "react";
import type { HqPost, OwnAccount } from "@/lib/hq/types";
import { useHq } from "../context";
import { BUSINESSES, cdn, num, pct, short, slot } from "../format";
import { Empty, Section, Stat, Thumb } from "../ui";
import { Trend } from "../Charts";

function AgentPosts({ posts, now }: { posts: HqPost[]; now: number }) {
  const scheduled = posts.filter((p) => p.status === "approved").sort((a, b) => (a.scheduledFor ?? 0) - (b.scheduledFor ?? 0));
  const published = posts.filter((p) => p.status === "published");
  return (
    <>
      <Section eyebrow="The agent's queue" title={scheduled.length ? `Up next: ${scheduled.length} scheduled` : "Nothing scheduled"}>
        {scheduled.length ? (
          <div className="hq-gallery">
            {scheduled.map((p) => (
              <div className="hq-tile" key={p.id}>
                <Thumb src={cdn(p.imageUrl)} alt={p.altText || p.headline} tag={p.format === "reel" ? "Reel" : undefined} />
                <span className="hq-mono"><span>{slot(p.scheduledFor)}</span><span>{p.scheduledFor ? short(p.scheduledFor, now) : ""}</span></span>
                <p>{p.headline}</p>
              </div>
            ))}
          </div>
        ) : <p className="hq-small">Approved posts appear here with their slot. Roundups, date night and the Friday Reel are approved automatically.</p>}
      </Section>
      <Section eyebrow="Published by the agent · 14 days" title={`${published.length} posts`}>
        {published.length ? (
          <div className="hq-gallery">
            {published.map((p) => (
              <a className="hq-tile" key={p.id} href={p.permalink ?? "#"} target="_blank" rel="noreferrer">
                <Thumb src={cdn(p.imageUrl)} alt={p.altText || p.headline} tag={p.format === "reel" ? "Reel" : undefined} />
                <span className="hq-mono">
                  <span>{p.insights ? `${num(p.insights.views ?? p.insights.reach)} ${p.insights.views !== null ? "views" : "reach"}` : "No numbers yet"}</span>
                  <span>{short(p.publishedAt, now)}</span>
                </span>
                <p>{p.headline}</p>
              </a>
            ))}
          </div>
        ) : <p className="hq-small">Nothing published in the last two weeks.</p>}
      </Section>
    </>
  );
}

function Account({ a }: { a: OwnAccount }) {
  const { data, now } = useHq();
  const first = a.trend[0]?.followers;
  const change = first !== undefined ? a.followers - first : null;
  const isAgent = a.handle === "calgarydaily";
  const posts = (data.snapshot?.posts ?? []).filter((p) => p.brand === "calgarydaily");
  return (
    <>
      <section className="hq-card">
        <div className="hq-card__head">
          <div>
            <p className="hq-eyebrow">{isAgent ? "The agent posts here" : "Read daily · publishing not connected yet"}</p>
            <h2 className="hq-h2">@{a.handle}</h2>
          </div>
          <a className="hq-link" href={`https://www.instagram.com/${a.handle}/`} target="_blank" rel="noreferrer">Open on Instagram</a>
        </div>
        <div className="hq-stats">
          <Stat value={num(a.followers)} label="followers" delta={change !== null && a.trend.length > 1 ? `${change >= 0 ? "+" : ""}${change} since ${a.trend[0].date.slice(5)}` : undefined} dir={change === null ? undefined : change > 0 ? "up" : change < 0 ? "down" : "flat"} />
          <Stat value={a.posts30} label="posts in 30 days" />
          <Stat value={num(a.medianEngagement)} label="median likes + comments" />
          <Stat value={pct(a.engagementRate)} label="engagement rate" />
          <Stat value={`${Math.round(a.reelShare * 100)}%`} label="Reels" />
          <Stat value={a.daysSinceLastPost === null ? "—" : a.daysSinceLastPost === 0 ? "Today" : `${a.daysSinceLastPost} d`} label="since last post" />
        </div>
        {a.trend.length > 1 ? <Trend data={a.trend.map((t) => ({ x: t.date.slice(5), y: t.followers }))} label={`@${a.handle} followers by day`} /> : <p className="hq-small">The follower trend fills in from today, one point a day.</p>}
      </section>
      <Section eyebrow="On the account now" title="Recent posts">
        {a.recent.length ? (
          <div className="hq-gallery">
            {a.recent.map((p) => (
              <a className="hq-tile" key={p.permalink} href={p.permalink} target="_blank" rel="noreferrer">
                <Thumb src={p.mediaUrl} alt={p.caption.slice(0, 120) || "Instagram post"} tag={p.reel ? "Reel" : undefined} />
                <span className="hq-mono"><span>{num(p.likes)} likes</span><span>{short(p.at, now)}</span></span>
                <p>{p.caption || "No caption"}</p>
              </a>
            ))}
          </div>
        ) : <p className="hq-small">No posts yet.</p>}
      </Section>
      {isAgent ? <AgentPosts posts={posts} now={now} /> : (
        <Empty title={`Let the agent post to @${a.handle}`}>It needs that account&apos;s Instagram token, made the same way as CalgaryDaily&apos;s. Once it&apos;s in, this account gets its own brand voice, queue and approvals here.</Empty>
      )}
    </>
  );
}

export function InstagramView() {
  const { data, filter } = useHq();
  const accounts = data.snapshot?.instagram?.accounts ?? [];
  const order = BUSINESSES.filter((b) => filter === "all" || b.id === filter);
  const [picked, setPicked] = useState<string | null>(null);
  const handle = picked && order.some((b) => b.handle === picked) ? picked : order[0]?.handle;
  const account = accounts.find((a) => a.handle === handle);

  return (
    <div className="hq-view">
      <header>
        <p className="hq-eyebrow"><span>01</span> Win the customer</p>
        <h1 className="hq-h1">Four accounts. <em>One feed of truth.</em></h1>
      </header>
      <div className="hq-seg" role="group" aria-label="Account">
        {order.map((b) => {
          const a = accounts.find((x) => x.handle === b.handle);
          return (
            <button key={b.handle} type="button" aria-pressed={b.handle === handle} onClick={() => setPicked(b.handle)}>
              @{b.handle}{a ? <b>{num(a.followers)}</b> : null}
            </button>
          );
        })}
      </div>
      {account ? <Account a={account} /> : (
        <Empty title={`@${handle} hasn't been read yet`}>The Scout reads every account each morning. If it stays empty, the handle is different or the account is personal rather than Business or Creator. Tell me the right handle and it&apos;s fixed.</Empty>
      )}
    </div>
  );
}
