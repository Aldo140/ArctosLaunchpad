"use client";

import { useMemo, useState } from "react";
import type { ArctosOutreach, Pipeline, PipelineDetail } from "@/lib/hq/types";
import { Columns } from "../Charts";
import { useHq } from "../context";
import { LEAD_STAGE, ago, num, when } from "../format";
import { Empty, Stat } from "../ui";

const rate = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "—");

/** Each stage counts every lead that got at least that far, so the drop between stages is real. */
function Funnel({ p }: { p: Pipeline }) {
  const reached = p.stages.map((_, i) => p.stages.slice(i).reduce((n, s) => n + s.count, 0));
  return (
    <div className="hq-funnel">
      {p.stages.map((s, i) => (
        <div key={s.key}>
          <b>{num(reached[i])}</b>
          <span>{i === 0 ? "In the pipeline" : `Reached ${s.label.toLowerCase()}`}</span>
          <small>{i > 0 ? `${rate(reached[i], reached[i - 1])} of the step before` : `${num(s.count)} not contacted yet`}</small>
        </div>
      ))}
    </div>
  );
}

function CalgaryWatchPipeline({ p, d }: { p: Pipeline | undefined; d: PipelineDetail | null }) {
  const { now } = useHq();
  const [q, setQ] = useState("");
  const [stage, setStage] = useState("all");
  const leads = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (d?.leads ?? []).filter((l) => (stage === "all" || l.status === stage) && (!needle || `${l.businessName} ${l.category} ${l.neighbourhood} ${l.contactEmail ?? ""}`.toLowerCase().includes(needle)));
  }, [d, q, stage]);
  if (!p || !d) return <Empty title="The partner pipeline fills in on the next agent run." />;
  const contacted = p.stages.slice(1).reduce((n, s) => n + s.count, 0);
  const stages = [...new Set(d.leads.map((l) => l.status))];

  return (
    <>
      <section className="hq-card">
        <div className="hq-card__head">
          <div><p className="hq-eyebrow">aldo@calgarywatch.ca · listings and partners</p><h2 className="hq-h2">CalgaryWatch partners</h2></div>
        </div>
        <div className="hq-stats">
          <Stat value={num(contacted)} label="businesses contacted" />
          <Stat value={num(p.sent30)} label="emails sent, 30 days" />
          <Stat value={d.replyRate === null ? "—" : `${d.replyRate}%`} label="reply rate" />
          <Stat value={d.medianHoursToReply === null ? "—" : d.medianHoursToReply < 48 ? `${d.medianHoursToReply} h` : `${Math.round(d.medianHoursToReply / 24)} d`} label="median time to reply" />
          <Stat value={num(p.interested30)} label="interested, 30 days" />
          <Stat value={num(d.followUpsDue)} label="follow-ups due" />
        </div>
        <Funnel p={p} />
      </section>

      <div className="hq-cols">
        <section className="hq-card"><h3 className="hq-h3">Emails sent per day</h3><Columns data={d.sendsByDay.map((x) => ({ x: x.date.slice(5), y: x.sent }))} format={(n) => String(Math.round(n))} label="Partner emails sent per day, last 30 days" /></section>
        <section className="hq-card"><h3 className="hq-h3">Replies per day</h3><Columns data={d.sendsByDay.map((x) => ({ x: x.date.slice(5), y: x.replies }))} format={(n) => String(Math.round(n))} label="Partner replies per day, last 30 days" /></section>
      </div>

      <section className="hq-card">
        <h3 className="hq-h3">By kind of business</h3>
        <div className="hq-tablewrap" style={{ maxHeight: "none" }}>
          <table className="hq-table" style={{ minWidth: 560 }}>
            <thead><tr><th>Category</th><th className="num">Leads</th><th className="num">Contacted</th><th className="num">Replied</th><th className="num">Interested</th><th className="num">Reply rate</th></tr></thead>
            <tbody>
              {d.byCategory.map((c) => (
                <tr key={c.category}><td>{c.category}</td><td className="num">{c.total}</td><td className="num">{c.contacted}</td><td className="num">{c.replied}</td><td className="num">{c.interested}</td><td className="num">{rate(c.replied, c.contacted)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="hq-card">
        <div className="hq-card__head"><h3 className="hq-h3">Every lead · {leads.length} shown</h3></div>
        <div className="hq-toolbar">
          <input className="hq-input" type="search" placeholder="Search business, category, area or email" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search leads" />
          <select className="hq-input" style={{ width: "auto" }} value={stage} onChange={(e) => setStage(e.target.value)} aria-label="Stage">
            <option value="all">All stages</option>
            {stages.map((s) => <option key={s} value={s}>{LEAD_STAGE[s]?.label ?? s}</option>)}
          </select>
        </div>
        <div className="hq-tablewrap">
          <table className="hq-table">
            <thead><tr><th>Business</th><th>Category</th><th>Stage</th><th>Last email</th><th>Reply</th><th>Next follow-up</th></tr></thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td>{l.website ? <a href={l.website} target="_blank" rel="noreferrer">{l.businessName}</a> : l.businessName}<div className="hq-mono">{l.contactEmail ?? "no address"}</div></td>
                  <td>{l.category}{l.neighbourhood ? <div className="hq-mono">{l.neighbourhood}</div> : null}</td>
                  <td><span className="hq-pill" data-sev={LEAD_STAGE[l.status]?.sev ?? "idle"}>{LEAD_STAGE[l.status]?.label ?? l.status}</span>{l.followUps ? <div className="hq-mono">{l.followUps} follow-up</div> : null}</td>
                  <td className="hq-num">{l.lastContactAt ? ago(l.lastContactAt, now) : "—"}</td>
                  <td>{l.replyClass ? <>{l.replyClass}<div className="hq-mono">{ago(l.replyAt, now)}</div></> : "—"}</td>
                  <td className="hq-num">{l.nextFollowUpAt ? when(l.nextFollowUpAt) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function ArctosPipeline({ a }: { a: ArctosOutreach | null }) {
  const { now } = useHq();
  const [q, setQ] = useState("");
  if (!a) return <Empty title="Couldn't read the Arctos send log." />;
  const needle = q.trim().toLowerCase();
  const sends = a.sends.filter((s) => !needle || `${s.business} ${s.subject}`.toLowerCase().includes(needle));
  return (
    <>
      <section className="hq-card">
        <div className="hq-card__head"><div><p className="hq-eyebrow">aldo@arctoslaunchpad.com · Brevo</p><h2 className="hq-h2">Arctos Launchpad</h2></div></div>
        <div className="hq-stats">
          <Stat value={num(a.today)} label="sent today" />
          <Stat value={num(a.last30)} label="sent, 30 days" />
          <Stat value={num(a.total)} label="sent in total" />
          <Stat value={ago(a.lastSentAt, now)} label="last send" />
          <Stat value="—" label="replies (connect Gmail)" />
        </div>
        <Columns data={a.sendsByDay.map((x) => ({ x: x.date.slice(5), y: x.sent }))} format={(n) => String(Math.round(n))} label="Arctos emails sent per day, last 30 days" />
      </section>
      <section className="hq-card">
        <div className="hq-card__head"><h3 className="hq-h3">Every send · {sends.length} shown</h3></div>
        <div className="hq-toolbar"><input className="hq-input" type="search" placeholder="Search business or subject" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search Arctos sends" /></div>
        <div className="hq-tablewrap">
          <table className="hq-table" style={{ minWidth: 620 }}>
            <thead><tr><th>Business</th><th>Subject</th><th>Sent</th></tr></thead>
            <tbody>{sends.map((s) => <tr key={`${s.business}-${s.at}`}><td>{s.business}</td><td>{s.subject}</td><td className="hq-num">{when(s.at)}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </>
  );
}

const GMAIL_NOTE = "Vow Motion sends from aldo@vowmotionweddings.com through Gmail, so its sends, replies and opt-outs live in mrotiz14@gmail.com. Connecting Gmail lets the agent count every send, catch every reply, add opt-outs to the shared list and draft answers for you here.";

export function PipelinesView() {
  const { data, filter } = useHq();
  const snap = data.snapshot;
  const tabs = [
    { id: "calgarywatch", label: "CalgaryWatch" },
    { id: "arctos", label: "Arctos" },
    { id: "vowmotion", label: "Vow Motion" },
  ].filter((t) => filter === "all" || filter === t.id || (filter === "calgarydaily" && t.id === "calgarywatch"));
  const [picked, setPicked] = useState<string | null>(null);
  const tab = picked && tabs.some((t) => t.id === picked) ? picked : tabs[0]?.id;

  return (
    <div className="hq-view">
      <header>
        <p className="hq-eyebrow"><span>01</span> Win the customer</p>
        <h1 className="hq-h1">Who we&apos;ve reached, <em>and who&apos;s reaching back.</em></h1>
      </header>
      <div className="hq-seg" role="group" aria-label="Business">
        {tabs.map((t) => <button key={t.id} type="button" aria-pressed={t.id === tab} onClick={() => setPicked(t.id)}>{t.label}</button>)}
      </div>
      {tab === "calgarywatch" ? <CalgaryWatchPipeline p={snap?.pipelines.find((p) => p.business === "calgarywatch")} d={snap?.pipelineDetail?.calgarywatch ?? null} /> : null}
      {tab === "arctos" ? <ArctosPipeline a={data.arctos} /> : null}
      {tab === "vowmotion" ? <Empty title="Vow Motion connects through Gmail.">{GMAIL_NOTE}</Empty> : null}
      {!tabs.length ? <Empty title="No outreach for this business." /> : null}
    </div>
  );
}
