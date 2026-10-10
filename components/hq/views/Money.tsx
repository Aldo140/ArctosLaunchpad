"use client";

import { useState } from "react";
import { useHq } from "../context";
import { BUSINESSES, BUSINESS_LABEL, ago, num, when } from "../format";
import type { LifeEntry } from "@/lib/hq/types";
import { dollars, moneyPace, moneyStats, owedStats } from "../persona";
import { Pace } from "../Charts";
import { Empty, Stat } from "../ui";
import { DuePicker, DueTag, MoneyMoves } from "./Life";

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

/** Money someone owes you: who, how much, and when it's due. */
export function OwedForm({ onDone }: { onDone?: () => void }) {
  const { addOwed, filter } = useHq();
  const [amount, setAmount] = useState("");
  const [business, setBusiness] = useState<string>(filter === "all" ? "arctos" : filter);
  const [text, setText] = useState("");
  const [due, setDue] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const cents = toCents(amount);
  return (
    <form
      className="hq-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!cents || !text.trim()) return;
        setBusy(true);
        const ok = await addOwed(cents, business, text.trim(), due);
        setBusy(false);
        if (ok) {
          setAmount("");
          setText("");
          setDue(null);
          onDone?.();
        }
      }}
    >
      <label className="hq-field hq-field--grow">
        <span>Who owes you</span>
        <input className="hq-input" value={text} maxLength={200} onChange={(e) => setText(e.target.value)} placeholder="e.g. Peak Physio, website balance" />
      </label>
      <label className="hq-field hq-field--money">
        <span>Amount</span>
        <span className="hq-money-input"><i>$</i><input className="hq-input" inputMode="decimal" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} aria-label="Amount owed in dollars" /></span>
      </label>
      <label className="hq-field">
        <span>For</span>
        <select className="hq-input" value={business} onChange={(e) => setBusiness(e.target.value)}>
          {MONEY_BUSINESSES.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
        </select>
      </label>
      <label className="hq-field">
        <span>Due</span>
        <DuePicker value={due} onChange={setDue} label="Due" />
      </label>
      <button type="submit" className="hq-btn hq-btn--primary" disabled={busy || !cents || !text.trim()}>Add {cents ? dollars(cents) : ""}</button>
    </form>
  );
}

function OwedRow({ e }: { e: LifeEntry }) {
  const { now, markPaid, removeLife } = useHq();
  return (
    <li className="hq-owed__row" data-done={e.done}>
      <div className="hq-owed__main">
        <strong>{dollars(e.amount ?? 0)} <span>{e.text}</span></strong>
        <span className="hq-small">{BUSINESS_LABEL[e.business ?? ""] ?? "Other"} · {e.done ? "paid" : `added ${ago(e.at, now)}`}</span>
      </div>
      <div className="hq-owed__side">
        {e.done ? null : <DueTag due={e.due} />}
        {e.done ? (
          <button type="button" className="hq-btn hq-btn--ghost hq-btn--sm" onClick={() => void markPaid(e, false)}>Not paid</button>
        ) : (
          <button type="button" className="hq-btn hq-btn--primary hq-btn--sm" onClick={() => void markPaid(e, true)}>Paid</button>
        )}
        <button type="button" className="hq-linkbtn hq-todo__x" aria-label="Remove" onClick={() => void removeLife(e, "Removed")}>×</button>
      </div>
    </li>
  );
}

/** Everything people owe you, late first. Marking it paid turns it into money in. */
export function OwedCard({ compact }: { compact?: boolean }) {
  const { data, now, filter, go } = useHq();
  const o = owedStats(data, now, filter);
  const [adding, setAdding] = useState(false);
  const recent = o.paid.slice(0, 4);
  return (
    <section className="hq-card hq-owed" data-sev={o.overdue.length ? "warn" : undefined}>
      <div className="hq-card__head">
        <div>
          <p className="hq-eyebrow"><span>$</span> Owed to you</p>
          <h2 className="hq-h2">{o.open.length ? <>{dollars(o.total)} <small className="hq-mono">{o.overdue.length ? `${dollars(o.overdueTotal)} late` : `${o.open.length} open`}</small></> : "Nobody owes you"}</h2>
        </div>
        {compact ? <button type="button" className="hq-btn hq-btn--ghost" onClick={() => go("money")}>Money</button> : <button type="button" className="hq-btn" onClick={() => setAdding((a) => !a)} aria-expanded={adding}>{adding ? "Close" : "Add"}</button>}
      </div>
      {!compact && (adding || !o.open.length) ? <OwedForm onDone={() => setAdding(false)} /> : null}
      {o.open.length ? (
        <ul className="hq-owed__list">{(compact ? o.open.slice(0, 3) : o.open).map((e) => <OwedRow key={e.id} e={e} />)}</ul>
      ) : <p className="hq-small" style={{ margin: 0 }}>Sent an invoice or agreed a price? Put it here with a due day. HQ reminds you when it&apos;s late, and one tap logs it as paid.</p>}
      {!compact && recent.length ? (
        <details className="hq-more">
          <summary>Paid recently ({recent.length})</summary>
          <ul className="hq-owed__list">{recent.map((e) => <OwedRow key={e.id} e={e} />)}</ul>
        </details>
      ) : null}
    </section>
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

/** Payments grouped by calendar month (Calgary), newest first, with each month's total. */
function byMonth(entries: LifeEntry[]) {
  const out: Array<{ key: string; label: string; total: number; entries: LifeEntry[] }> = [];
  for (const e of entries) {
    const key = new Date(e.at).toLocaleDateString("en-CA", { timeZone: "America/Edmonton" }).slice(0, 7);
    let g = out.find((x) => x.key === key);
    if (!g) {
      g = { key, label: new Date(e.at).toLocaleDateString("en-CA", { timeZone: "America/Edmonton", month: "long", year: "numeric" }), total: 0, entries: [] };
      out.push(g);
    }
    g.total += e.amount ?? 0;
    g.entries.push(e);
  }
  return out;
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
  const pace = moneyPace(data, now, filter);
  const owed = owedStats(data, now, filter);
  // Compare like with like: this month so far against last month up to the same day.
  const lastSoFar = pace.last[Math.min(pace.today, pace.last.length) - 1] ?? 0;
  const vsLast = lastSoFar ? Math.round(((m.month - lastSoFar) / lastSoFar) * 100) : null;

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
        <p className="hq-lede">
          {owed.total ? <>{dollars(owed.total)} more is owed to you{owed.overdue.length ? <>, <b className="hq-warntext">{dollars(owed.overdueTotal)} of it late</b></> : null}. </> : null}
          {m.entries.length ? "Every payment you log lands here and in the morning brief." : "Log every payment the moment it lands, however small. Watching the number climb is the point."} <Goal />
        </p>
      </header>

      <section className="hq-card">
        <div className="hq-card__head">
          <h2 className="hq-h2">The month so far</h2>
          <span className="hq-mono">{vsLast !== null ? `${vsLast >= 0 ? "+" : ""}${vsLast}% on last month` : "by day"}</span>
        </div>
        <Pace month={pace.month} last={pace.last} today={pace.today} days={pace.days} goal={m.goal} format={dollars} />
      </section>

      <div className="hq-cols-2">
        <section className="hq-card hq-card--accent">
          <div className="hq-card__head"><h2 className="hq-h2">Money came in?</h2><span className="hq-mono">Takes 5 seconds</span></div>
          <MoneyForm />
        </section>
        <OwedCard />
      </div>

      <div className="hq-cols-2">
        <MoneyMoves />
        <section className="hq-card">
          <div className="hq-card__head"><h2 className="hq-h2">By business</h2></div>
          <div className="hq-stats">
            <Stat value={dollars(m.month)} label="this month" />
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
          <div className="hq-paylist">
            {byMonth(m.entries.slice(0, 60)).map((g) => (
              <div key={g.key}>
                <p className="hq-qgroup">{g.label} <span>{dollars(g.total)}</span></p>
                <ul>
                  {g.entries.map((e) => (
                    <li key={e.id}>
                      <b>{dollars(e.amount ?? 0)}</b>
                      <span className="hq-paylist__what">{e.text || "No note"}<small>{BUSINESS_LABEL[e.business ?? ""] ?? "Other"}</small></span>
                      <span className="hq-when" title={when(e.at)}>{new Date(e.at).toLocaleDateString("en-CA", { timeZone: "America/Edmonton", month: "short", day: "numeric" })}</span>
                      <button type="button" className="hq-linkbtn hq-todo__x" aria-label={`Remove ${dollars(e.amount ?? 0)}`} onClick={() => void removeLife(e, `${dollars(e.amount ?? 0)} removed`)}>×</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : <Empty title="No payments logged yet.">Use the form above, the + button, or press <kbd>l m</kbd>.</Empty>}
      </section>
    </div>
  );
}
