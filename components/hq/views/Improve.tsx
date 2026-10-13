"use client";

import { useEffect, useState } from "react";
import { useHq } from "../context";
import { ago, BUSINESSES } from "../format";
import { Empty, Stat } from "../ui";
import type { Business, HqExperimentStatus, HqMemoryKind } from "@/lib/hq/types";

export type ImproveTab = "focus" | "relationships" | "memory" | "experiments" | "research" | "setup";
const TABS: Array<[ImproveTab, string]> = [["focus", "Focus"], ["relationships", "Relationships"], ["memory", "Memory"], ["experiments", "Experiments"], ["research", "Research"], ["setup", "Setup"]];
const memoryKinds: Array<[HqMemoryKind, string]> = [["priority", "Priority"], ["preference", "Preference"], ["rule", "Rule"], ["person", "Person"], ["decision", "Decision"]];

export function ImproveView({ tab }: { tab: ImproveTab }) {
  const { data, go, improve } = useHq();
  useEffect(() => {
    const key = `hq-seen-${tab}-${new Date().toISOString().slice(0, 10)}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    void improve({ action: "event", name: "view", area: `improve/${tab}`, detail: null });
  }, [tab, improve]);
  return (
    <div className="hq-view hq-improve">
      <header className="hq-pagehead"><div><p className="hq-eyebrow">Learn, simplify, compound</p><h1>Make HQ <em>more useful.</em></h1><p>One ranked plan, remembered decisions and evidence about what actually works.</p></div></header>
      <div className="hq-seg hq-subnav" role="tablist" aria-label="Improve">
        {TABS.map(([id, label]) => <button key={id} role="tab" type="button" aria-selected={tab === id} onClick={() => go(`improve/${id}`)}>{label}{id === "setup" && data.intelligence.connections.some((c) => c.state !== "connected") ? <b>!</b> : null}</button>)}
      </div>
      {tab === "focus" ? <Focus /> : tab === "relationships" ? <Relationships /> : tab === "memory" ? <Memory /> : tab === "experiments" ? <Experiments /> : tab === "research" ? <Research /> : <Setup />}
    </div>
  );
}

function Focus() {
  const { data, now } = useHq();
  const i = data.intelligence;
  return <>
    <div className="hq-pulse"><Stat value={i.workload.urgent} label="urgent" /><Stat value={i.workload.open} label="open" /><Stat value={data.experiments.filter((e) => e.status === "running").length} label="experiments" /><Stat value={i.opportunities.length} label="opportunities" /></div>
    <p className="hq-banner hq-banner--quiet">{i.workload.message}</p>
    <section className="hq-card"><div className="hq-card__head"><div><p className="hq-eyebrow">Expected value × urgency</p><h2 className="hq-h2">Do these next</h2></div></div>
      {i.recommendations.length ? <ol className="hq-ranklist">{i.recommendations.map((r) => <li key={r.id}><b>{r.score}</b><div><strong>{r.title}</strong><p>{r.reason}</p><small>{r.source} · {r.confidence} confidence · {r.effort}</small></div>{r.href ? <a className="hq-btn" href={r.href}>Open</a> : null}</li>)}</ol> : <Empty title="Nothing urgent">Add a priority in Memory and HQ will rank it with live work.</Empty>}
    </section>
    <div className="hq-two">
      <section className="hq-card"><p className="hq-eyebrow">Weekly founder review</p><h2 className="hq-h2">What moved</h2><List title="Wins" values={i.weekly.wins} empty="No recorded wins yet." /><List title="Risks" values={i.weekly.risks} empty="No visible risks." /><List title="This week's focus" values={i.weekly.focus} empty="No focus chosen." /></section>
      <section className="hq-card"><p className="hq-eyebrow">Buying and growth signals</p><h2 className="hq-h2">Opportunities</h2>{i.opportunities.map((o) => <article className="hq-mini" key={o.title}><strong>{o.title}</strong><p>{o.detail}</p><small>{o.source} · {o.confidence} confidence</small></article>)}</section>
    </div>
    <p className="hq-small">Recalculated from current data {ago(i.weekly.generatedAt, now)}.</p>
  </>;
}

function List({ title, values, empty }: { title: string; values: string[]; empty: string }) {
  return <div className="hq-review"><strong>{title}</strong><ul>{values.length ? values.map((x, n) => <li key={n}>{x}</li>) : <li>{empty}</li>}</ul></div>;
}

function Relationships() {
  const { data, now } = useHq();
  const [q, setQ] = useState("");
  const rows = data.intelligence.relationships.filter((r) => (`${r.name} ${r.email} ${r.state}`).toLowerCase().includes(q.toLowerCase()));
  return <section className="hq-card"><div className="hq-card__head"><div><p className="hq-eyebrow">Across every thread</p><h2 className="hq-h2">Relationship memory</h2></div></div>
    <input className="hq-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a person or business" />
    {!data.gmail ? <Empty title="Connect Gmail first">Relationships appear automatically from sent mail and replies.</Empty> :
      <div className="hq-tablewrap"><table className="hq-table"><thead><tr><th>Person</th><th>Business</th><th>State</th><th>Last touch</th><th /></tr></thead><tbody>{rows.map((r) => <tr key={r.key}><td><strong>{r.name}</strong><div className="hq-mono">{r.email}</div></td><td>{r.business}</td><td>{r.state} · {r.touches} touches</td><td>{ago(r.lastAt, now)}</td><td>{r.url ? <a href={r.url} target="_blank" rel="noreferrer">Open</a> : null}</td></tr>)}</tbody></table></div>}
  </section>;
}

function Memory() {
  const { data, improve } = useHq();
  const [text, setText] = useState(""), [kind, setKind] = useState<HqMemoryKind>("priority"), [business, setBusiness] = useState<Business | "all">("all");
  return <div className="hq-two"><section className="hq-card"><p className="hq-eyebrow">Durable context</p><h2 className="hq-h2">What HQ should remember</h2><p className="hq-small">Only save facts and choices worth carrying into future decisions. Every memory stays visible and removable.</p>
    <label className="hq-field"><span>Memory</span><textarea className="hq-textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder="Example: Prioritize warm wedding enquiries over cold outreach." /></label>
    <div className="hq-formrow"><select className="hq-input" value={kind} onChange={(e) => setKind(e.target.value as HqMemoryKind)}>{memoryKinds.map(([v,l]) => <option value={v} key={v}>{l}</option>)}</select><select className="hq-input" value={business} onChange={(e) => setBusiness(e.target.value as Business | "all")}><option value="all">All businesses</option>{BUSINESSES.map((b) => <option value={b.id} key={b.id}>{b.label}</option>)}</select></div>
    <button className="hq-btn hq-btn--primary" type="button" disabled={text.trim().length < 3} onClick={() => void improve({ action: "memory-add", kind, text, business }).then((ok) => ok && setText(""))}>Remember this</button>
  </section><section className="hq-card"><h2 className="hq-h2">{data.memories.length} memories</h2>{data.memories.length ? <ul className="hq-memory">{data.memories.map((m) => <li key={m.id}><div><span className="hq-chip">{m.kind}</span><strong>{m.text}</strong><small>{m.business} · {m.by}</small></div><button className="hq-linkbtn" onClick={() => void improve({ action: "memory-delete", id: m.id })}>Forget</button></li>)}</ul> : <Empty title="Nothing saved yet" />}</section></div>;
}

function Experiments() {
  const { data, improve, now } = useHq();
  const [title,setTitle]=useState(""),[hypothesis,setHypothesis]=useState(""),[metric,setMetric]=useState(""),[business,setBusiness]=useState<Business>("arctos");
  const add=async()=>{ if(await improve({action:"experiment-add",title,hypothesis,metric,business,endsAt:now+14*86_400_000})){setTitle("");setHypothesis("");setMetric("");}};
  return <div className="hq-two"><section className="hq-card"><p className="hq-eyebrow">One variable, one measure</p><h2 className="hq-h2">Start a two-week test</h2>
    <label className="hq-field"><span>Name</span><input className="hq-input" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Venue-specific outreach" /></label>
    <label className="hq-field"><span>Hypothesis</span><textarea className="hq-textarea" value={hypothesis} onChange={(e)=>setHypothesis(e.target.value)} placeholder="If we…, then…, because…" /></label>
    <label className="hq-field"><span>Success metric</span><input className="hq-input" value={metric} onChange={(e)=>setMetric(e.target.value)} placeholder="Reply rate above 12%" /></label>
    <select className="hq-input" value={business} onChange={(e)=>setBusiness(e.target.value as Business)}>{BUSINESSES.map((b)=><option value={b.id} key={b.id}>{b.label}</option>)}</select>
    <button className="hq-btn hq-btn--primary" disabled={!title.trim()||!hypothesis.trim()||!metric.trim()} onClick={()=>void add()}>Start experiment</button>
  </section><section className="hq-card"><h2 className="hq-h2">Experiment log</h2>{data.experiments.length ? <div className="hq-experiments">{data.experiments.map((e)=><article key={e.id}><span className="hq-chip">{e.status}</span><strong>{e.title}</strong><p>{e.hypothesis}</p><small>Measure: {e.metric}</small><div className="hq-actions">{(["won","lost","inconclusive"] as HqExperimentStatus[]).map((s)=><button className="hq-linkbtn" key={s} onClick={()=>void improve({action:"experiment-update",id:e.id,status:s,result:`Marked ${s} from HQ`})}>{s}</button>)}<button className="hq-linkbtn" onClick={()=>void improve({action:"experiment-delete",id:e.id})}>delete</button></div></article>)}</div> : <Empty title="No experiments yet" />}</section></div>;
}

function Research() {
  const { data }=useHq(); const r=data.intelligence.research;
  return <><div className="hq-pulse"><Stat value={r.events7d} label="HQ interactions, 7 days" /><Stat value={r.topAreas.length} label="areas used" /><Stat value={data.memories.length} label="memories" /><Stat value={data.experiments.length} label="experiments" /></div><p className="hq-banner hq-banner--quiet">{r.message}</p><section className="hq-card"><p className="hq-eyebrow">Observed behaviour</p><h2 className="hq-h2">Where HQ is being used</h2>{r.topAreas.length?<ul className="hq-bars">{r.topAreas.map((a)=><li key={a.area}><span>{a.area}</span><b>{a.count}</b></li>)}</ul>:<Empty title="Evidence starts now">Opening Improve sections records private, minimal usage events. No message contents are tracked.</Empty>}</section></>;
}

function Setup() {
  const { data }=useHq();
  return <><section className="hq-card"><p className="hq-eyebrow">Setup doctor</p><h2 className="hq-h2">Connections, with the next exact step</h2><div className="hq-connections">{data.intelligence.connections.map((c)=><article key={c.id} data-state={c.state}><span/><div><strong>{c.label}</strong><p>{c.detail}</p></div>{c.href?<a className="hq-btn" href={c.href} target="_blank" rel="noreferrer">{c.action}</a>:<b>{c.state}</b>}</article>)}</div></section>
    <section className="hq-card"><p className="hq-eyebrow">mrotiz Gmail + Calendar</p><h2 className="hq-h2">The only manual connection</h2><ol className="hq-steps"><li>Open a new <a href="https://script.google.com/home/projects/create" target="_blank" rel="noreferrer">Google Apps Script project</a> while signed into <strong>mrotiz14@gmail.com</strong>.</li><li>Copy <a href="https://github.com/Aldo140/ArctosLaunchpad/blob/main/ops/gmail/hq-sync.gs" target="_blank" rel="noreferrer">hq-sync.gs</a> and <a href="https://github.com/Aldo140/ArctosLaunchpad/blob/main/ops/gmail/hq-calendar.gs" target="_blank" rel="noreferrer">hq-calendar.gs</a> into that project.</li><li>In Project Settings → Script properties, add <code>HQ_KEY</code> using the same value as Vercel’s <code>HQ_GMAIL_KEY</code>.</li><li>Run <code>setup</code>, approve access, then run <code>setupCalendar</code>. Return here; both cards should turn connected within a minute.</li></ol><div className="hq-actions"><a className="hq-btn hq-btn--primary" href="https://vercel.com/aldo140s-projects/arctos-launchpad/settings/environment-variables" target="_blank" rel="noreferrer">Open Vercel variables</a><a className="hq-btn" href="https://script.google.com/home/projects/create" target="_blank" rel="noreferrer">Create Apps Script</a></div></section></>;
}
