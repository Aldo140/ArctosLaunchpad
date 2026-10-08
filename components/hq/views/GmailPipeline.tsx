"use client";

import { useMemo, useState } from "react";
import type { GmailReply, GmailSummary, MailBusiness, ReplyKind } from "@/lib/hq/types";
import { Columns } from "../Charts";
import { useHq } from "../context";
import { BUSINESS_LABEL, ago, num, when } from "../format";
import { Empty, Stat } from "../ui";

const DAY = 86_400_000;
const calgaryDay = (t: number) => new Date(t).toLocaleDateString("en-CA", { timeZone: "America/Edmonton" });

export const KIND: Record<ReplyKind, { label: string; sev: "ok" | "warn" | "bad" | "idle" }> = {
  reply: { label: "Reply", sev: "ok" },
  optout: { label: "Opted out", sev: "bad" },
  auto: { label: "Auto-reply", sev: "idle" },
  bounce: { label: "Bounced", sev: "warn" },
};

/** Real answers to our pitches that nobody has answered yet. */
export function gmailWaiting(gmail: GmailSummary | null, business: (b: MailBusiness) => boolean): GmailReply[] {
  return (gmail?.replies ?? []).filter((r) => r.kind === "reply" && r.toPitch && !r.answered && business(r.business));
}

export const GMAIL_SETUP = "The Gmail sync is a small script inside mrotiz14@gmail.com that reports here every 15 minutes: every pitch from each send-as address, who answered, auto-replies, opt-outs and bounces. It hasn't reported yet.";

export function GmailPipeline({ business, address, title }: { business: MailBusiness; address: string; title: string }) {
  const { data, now } = useHq();
  const gmail = data.gmail;
  const [q, setQ] = useState("");
  const [show, setShow] = useState<"all" | "replied" | "waiting">("all");

  const view = useMemo(() => {
    const sends = (gmail?.sends ?? []).filter((s) => s.business === business);
    const pitches = sends.filter((s) => s.first);
    const replies = (gmail?.replies ?? []).filter((r) => r.business === business && r.toPitch);
    const count = (k: ReplyKind) => replies.filter((r) => r.kind === k).length;
    const days = new Map<string, number>();
    for (let i = 29; i >= 0; i--) days.set(calgaryDay(now - i * DAY), 0);
    for (const s of pitches) {
      const d = calgaryDay(s.at);
      if (days.has(d)) days.set(d, (days.get(d) ?? 0) + 1);
    }
    const repliedPeople = new Set(replies.filter((r) => r.kind === "reply" || r.kind === "optout").map((r) => r.from));
    // This business's pitches that went out from another business's address.
    const misdirected = sends.filter((s) => s.wrongAlias);
    const today = calgaryDay(now);
    return {
      pitches,
      today: pitches.filter((s) => calgaryDay(s.at) === today).length,
      replies,
      real: count("reply"),
      optouts: count("optout"),
      autos: count("auto"),
      bounces: count("bounce"),
      replyRate: pitches.length ? Math.round((repliedPeople.size / pitches.length) * 1000) / 10 : null,
      byDay: [...days.entries()].map(([date, sent]) => ({ x: date.slice(5), y: sent })),
      misdirected,
      waiting: replies.filter((r) => r.kind === "reply" && !r.answered),
    };
  }, [gmail, business, now]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return view.pitches.filter((s) => (show === "all" || (show === "replied" ? s.replied : !s.replied)) && (!needle || `${s.to} ${s.domain} ${s.subject}`.toLowerCase().includes(needle)));
  }, [view, q, show]);

  if (!gmail) return <Empty title="Waiting for the Gmail sync.">{GMAIL_SETUP}</Empty>;
  const peak = Math.max(0, ...view.byDay.map((d) => d.y));

  return (
    <>
      <section className="hq-card">
        <div className="hq-card__head">
          <div><p className="hq-eyebrow">{address} · Gmail</p><h2 className="hq-h2">{title}</h2></div>
          <span className="hq-mono">synced {ago(gmail.generatedAt, now)}</span>
        </div>
        <div className="hq-stats">
          <Stat value={num(view.today)} label="pitches today" delta={view.today > 15 ? "over 15 a day" : undefined} dir={view.today > 15 ? "down" : undefined} />
          <Stat value={num(view.pitches.length)} label={`pitches, ${gmail.days} days`} />
          <Stat value={num(view.real)} label="real replies" />
          <Stat value={view.replyRate === null ? "—" : `${view.replyRate}%`} label="reply rate" />
          <Stat value={num(view.optouts)} label="opted out" dir={view.optouts ? "down" : undefined} />
          <Stat value={num(view.bounces)} label="bounced" dir={view.bounces ? "down" : undefined} />
          <Stat value={num(view.autos)} label="auto-replies" />
        </div>
        <Columns data={view.byDay} format={(n) => String(Math.round(n))} label={`${BUSINESS_LABEL[business] ?? title} pitches per day, last 30 days`} />
        {peak > 15 ? <p className="hq-small" style={{ margin: 0 }}>The busiest day sent {peak}. Past about 15 a day from one Gmail address, mail starts landing in spam; the agents will hold to 15.</p> : null}
      </section>

      {view.misdirected.length ? (
        <section className="hq-card" data-sev="bad">
          <div className="hq-card__head"><div><p className="hq-eyebrow">Sent from the wrong address</p><h2 className="hq-h2">{view.misdirected.length} {title} {view.misdirected.length === 1 ? "pitch" : "pitches"} went out as someone else.</h2></div></div>
          <p className="hq-small" style={{ margin: 0 }}>Gmail sends from its default address unless you pick another. Set Settings → Accounts → Send mail as → make default to the one you pitch from most, or choose the From line each time.</p>
          <ul className="hq-list">
            {view.misdirected.slice(0, 12).map((s) => (
              <li key={`${s.url}-${s.at}`} className="hq-row" data-sev="bad">
                <strong>{s.domain}</strong><span className="hq-when">{when(s.at)}</span>
                <p>From {s.alias} · {s.subject}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="hq-card">
        <div className="hq-card__head"><h3 className="hq-h3">Replies · {view.replies.length}</h3>{view.waiting.length ? <span className="hq-pill" data-sev="warn">{view.waiting.length} waiting for you</span> : null}</div>
        {view.replies.length ? (
          <ul className="hq-list">
            {view.replies.slice(0, 30).map((r) => (
              <li key={`${r.url}-${r.at}`} className="hq-row" data-sev={r.kind === "reply" ? (r.answered ? "ok" : "warn") : r.kind === "optout" ? "bad" : undefined}>
                <strong><span className="hq-pill" data-sev={KIND[r.kind].sev} style={{ marginRight: 8 }}>{KIND[r.kind].label}</span>{r.name || r.from}</strong>
                <span className="hq-when">{ago(r.at, now)}</span>
                <p>{r.snippet || r.subject}</p>
                <p className="hq-mono" style={{ margin: 0 }}>
                  <a className="hq-link" href={r.url} target="_blank" rel="noreferrer">Open in Gmail</a>
                  {r.kind === "reply" ? (r.answered ? " · answered" : " · not answered yet") : r.kind === "optout" ? " · never email again" : ""}
                </p>
              </li>
            ))}
          </ul>
        ) : <p className="hq-small">No replies yet.</p>}
      </section>

      <section className="hq-card">
        <div className="hq-card__head"><h3 className="hq-h3">Every pitch · {rows.length} shown</h3></div>
        <div className="hq-toolbar">
          <input className="hq-input" type="search" placeholder="Search name, domain or subject" value={q} onChange={(e) => setQ(e.target.value)} aria-label={`Search ${title} pitches`} />
          <select className="hq-input" style={{ width: "auto" }} value={show} onChange={(e) => setShow(e.target.value as typeof show)} aria-label="Show">
            <option value="all">All pitches</option>
            <option value="replied">Got a reply</option>
            <option value="waiting">No reply yet</option>
          </select>
        </div>
        <div className="hq-tablewrap">
          <table className="hq-table" style={{ minWidth: 620 }}>
            <thead><tr><th>To</th><th>Subject</th><th>Sent</th><th>Reply</th></tr></thead>
            <tbody>
              {rows.map((s) => (
                <tr key={`${s.url}-${s.at}`}>
                  <td>{s.domain}<div className="hq-mono">{s.to}</div></td>
                  <td>{s.subject}</td>
                  <td className="hq-num">{when(s.at)}</td>
                  <td>{s.replied ? <a className="hq-link" href={s.url} target="_blank" rel="noreferrer">Replied</a> : <span className="hq-mono">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
