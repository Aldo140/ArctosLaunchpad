"use client";

import { useState } from "react";
import { useHq } from "../context";
import { BUSINESSES, BUSINESS_LABEL, ago, num, when } from "../format";
import { dollars, moneyStats } from "../persona";
import { Empty, Stat } from "../ui";
import { MoneyMoves } from "./Life";

const MONEY_BUSINESSES = [...BUSINESSES.map((b) => ({ id: b.id as string, label: b.label })), { id: "other", label: "Other" }];

/** "1,250.50" or "$1250" typed in, to cents. Null when it isn't a positive amount. */
export function toCents(s: string): number | null {
  const n = Number(s.replace(/[$,\s]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : null;
}

/** The quick form for money that came in. Used here and in the quick-add sheet. */
export function MoneyForm({ onDone }: { onDone?: () => void }) {
  const { logMoney, filter } = useHq();
  const [amount, setAmount] = useState("");
  const [business, setBusiness] = useState<string>(filter === "all" ? "arctos" : filter);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const cents = toCents(amount);
  return (
    <form
      className="hq-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!cents) return;
        setBusy(true);
        const ok = await logMoney(cents, business, text.trim());
        setBusy(false);
        if (ok) {
          setAmount("");
          setText("");
          onDone?.();
        }
      }}
    >
      <label className="hq-field hq-field--money">
        <span>Amount</span>
        <span className="hq-money-input"><i>$</i><input className="hq-input" inputMode="decimal" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} aria-label="Amount in dollars" /></span>
      </label>
      <label className="hq-field">
        <span>From</span>
        <select className="hq-input" value={business} onChange={(e) => setBusiness(e.target.value)}>
          {MONEY_BUSINESSES.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
        </select>
      </label>
      <label className="hq-field hq-field--grow">
        <span>For what (optional)</span>
        <input className="hq-input" value={text} maxLength={200} onChange={(e) => setText(e.target.value)} placeholder="e.g. Peak Physio website, deposit" />
      </label>
      <button type="submit" className="hq-btn hq-btn--primary" disabled={busy || !cents}>Log {cents ? dollars(cents) : "it"}</button>
    </form>
  );
}

function Goal() {
  const { data, setGoal } = useHq();
  const goal = data.settings?.moneyGoal ?? null;
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(goal ? String(goal / 100) : "");
  if (!editing) {
    return <button type="button" className="hq-linkbtn" onClick={() => setEditing(true)}>{goal ? "Change goal" : "Set a monthly goal"}</button>;
  }
  return (
    <form
      className="hq-actions"
      onSubmit={async (e) => {
        e.preventDefault();
        await setGoal(value.trim() ? toCents(value) : null);
        setEditing(false);
      }}
    >
      <span className="hq-money-input"><i>$</i><input className="hq-input" inputMode="decimal" autoFocus value={value} onChange={(e) => setValue(e.target.value)} aria-label="Monthly goal in dollars" style={{ width: 130 }} /></span>
      <button type="submit" className="hq-btn hq-btn--primary hq-btn--sm">Save</button>
      <button type="button" className="hq-btn hq-btn--ghost hq-btn--sm" onClick={() => setEditing(false)}>Cancel</button>
    </form>
  );
}

/** Money: what came in, against the goal, and who's closest to paying next. */
export function MoneyView() {
  const { data, now, filter, removeLife } = useHq();
  const m = moneyStats(data, now, filter);
  const peak = Math.max(1, ...m.byBusiness.map((b) => b.amount));
  const cw = data.snapshot?.pipelines.find((p) => p.business === "calgarywatch");
  const gmailReplies = (b: string) => (data.gmail?.replies ?? []).filter((r) => r.business === b && r.kind === "reply" && r.toPitch && r.at >= now - 30 * 86_400_000).length;
  const funnel = [
    { id: "calgarywatch", label: "CalgaryWatch", sent: cw?.sent30 ?? 0, replies: cw?.replies30 ?? 0, warm: cw?.interested30 ?? 0 },
    { id: "arctos", label: "Arctos", sent: data.arctos?.last30 ?? 0, replies: gmailReplies("arctos"), warm: null },
    { id: "vowmotion", label: "Vow Motion", sent: (data.gmail?.sends ?? []).filter((s) => s.business === "vowmotion" && s.first).length, replies: gmailReplies("vowmotion"), warm: null },
  ].filter((f) => filter === "all" || f.id === filter);
  const vsLast = m.lastMonth ? Math.round(((m.month - m.lastMonth) / m.lastMonth) * 100) : null;

  return (
    <div className="hq-view">
      <header className="hq-viewhead">
        <p className="hq-eyebrow"><span>$</span> Money in · {new Date(now).toLocaleDateString("en-CA", { timeZone: "America/Edmonton", month: "long" })}</p>
        <h1 className="hq-h1 hq-bignum">{dollars(m.month)}{m.goal ? <em> of {dollars(m.goal)}</em> : null}</h1>
        {m.goal ? (
          <div className="hq-progress hq-progress--big" aria-label={`${Math.round((m.progress ?? 0) * 100)}% of the goal`}>
            <span className="hq-meter"><span style={{ width: `${Math.round((m.progress ?? 0) * 100)}%` }} /></span>
            <span className="hq-mono">{m.month >= m.goal ? "Goal hit. Raise it." : `${dollars(m.perDayToGoal ?? 0)} a day for ${m.daysLeft} days closes it`}</span>
          </div>
        ) : null}
        <p className="hq-lede">{m.entries.length ? "Every payment you log lands here and in the morning brief." : "Log every payment the moment it lands, however small. Watching the number climb is the point."} <Goal /></p>
      </header>

      <section className="hq-card hq-card--accent">
        <div className="hq-card__head"><h2 className="hq-h2">Money came in?</h2><span className="hq-mono">Takes 5 seconds</span></div>
        <MoneyForm />
      </section>

      <div className="hq-cols-2">
        <MoneyMoves />
        <section className="hq-card">
          <div className="hq-card__head"><h2 className="hq-h2">This month</h2></div>
          <div className="hq-stats">
            <Stat value={dollars(m.month)} label="this month" delta={vsLast !== null ? `${vsLast >= 0 ? "+" : ""}${vsLast}% on last month` : undefined} dir={vsLast === null ? undefined : vsLast >= 0 ? "up" : "down"} />
            <Stat value={dollars(m.lastMonth)} label="last month" />
            <Stat value={dollars(m.year)} label="this year" />
          </div>
          {m.byBusiness.length ? (
            <div className="hq-bars">
              {m.byBusiness.map((b) => (
                <div className="hq-bar" key={b.business}>
                  <span>{BUSINESS_LABEL[b.business] ?? "Other"}</span>
                  <span className="hq-bar-track"><span className="hq-bar-fill" style={{ width: `${(b.amount / peak) * 100}%` }} /><span className="hq-bar-val">{dollars(b.amount)}</span></span>
                </div>
              ))}
            </div>
          ) : <p className="hq-small">Nothing logged this month yet.</p>}
        </section>
      </div>

      <section className="hq-card">
        <div className="hq-card__head"><h2 className="hq-h2">Where the next dollar comes from</h2><span className="hq-mono">Outreach, 30 days</span></div>
        <div className="hq-funnelrow">
          {funnel.map((f) => (
            <div key={f.id} className="hq-funnelcard">
              <b>{f.label}</b>
              <span><em>{num(f.sent)}</em> sent</span>
              <span><em>{num(f.replies)}</em> wrote back</span>
              {f.warm !== null ? <span><em>{num(f.warm)}</em> interested</span> : null}
              <small className="hq-mono">{f.sent ? `${Math.round((f.replies / f.sent) * 1000) / 10}% reply rate` : "nothing sent yet"}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="hq-card">
        <div className="hq-card__head"><h2 className="hq-h2">Every payment</h2><span className="hq-mono">{m.entries.length} logged</span></div>
        {m.entries.length ? (
          <ul className="hq-list">
            {m.entries.slice(0, 40).map((e) => (
              <li key={e.id} className="hq-row hq-row--pay">
                <strong>{dollars(e.amount ?? 0)} <span className="hq-chip">{BUSINESS_LABEL[e.business ?? ""] ?? "Other"}</span></strong>
                <span className="hq-when" title={when(e.at)}>{ago(e.at, now)}</span>
                <p>{e.text || "No note"} · <button type="button" className="hq-linkbtn" onClick={() => void removeLife(e, `${dollars(e.amount ?? 0)} removed`)}>Remove</button></p>
              </li>
            ))}
          </ul>
        ) : <Empty title="No payments logged yet.">Use the form above, the + button, or press <kbd>l m</kbd>.</Empty>}
      </section>
    </div>
  );
}
