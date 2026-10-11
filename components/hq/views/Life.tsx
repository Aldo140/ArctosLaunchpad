"use client";

import { useState } from "react";
import { useHq } from "../context";
import { BUSINESS_LABEL, ago, slot } from "../format";
import type { LifeEntry } from "@/lib/hq/types";
import { GYM_GOAL, GYM_MONTHLY, agenda, dollars, dueLabel, dueState, gymSlot, gymStats, moneyMoves, noonOf, todoStats } from "../persona";
import { Icon } from "../ui";
import { Swipe } from "../Swipe";

const time = (t: number) => slot(t).split(" ").slice(1).join(" ");

/** The people closest to paying, closest first. */
export function MoneyMoves({ besideQueue }: { besideQueue?: boolean }) {
  const { data, now, filter, go } = useHq();
  // Beside "Clear these first", leave out the people already on that list.
  const asked = new Set((data.snapshot?.inbox?.replies ?? []).filter((r) => !r.approved).map((r) => r.businessName));
  const moves = moneyMoves(data, now, filter).filter((m) => !besideQueue || (!m.key.startsWith("g") && !asked.has(m.who ?? "")));
  return (
    <section className="hq-card hq-money">
      <div className="hq-card__head">
        <div>
          <p className="hq-eyebrow"><span>$</span> Closest to cash</p>
          <h2 className="hq-h2">Money moves</h2>
        </div>
        <button type="button" className="hq-btn hq-btn--ghost" onClick={() => go("pipelines")}>Pipelines</button>
      </div>
      {moves.length ? (
        <ol className="hq-list">
          {moves.slice(0, 5).map((m) => {
            const body = (
              <>
                <strong>{m.title}</strong>
                <span className="hq-when">{m.key === "fu" ? "today" : ago(m.at, now)}</span>
                <p>{BUSINESS_LABEL[m.business] ?? m.business}{m.detail ? ` · ${m.detail}` : ""}</p>
              </>
            );
            const sev = now - m.at > 2 * 86_400_000 ? "bad" : now - m.at > 12 * 3_600_000 ? "warn" : "ok";
            return (
              <li key={m.key}>
                {m.href ? (
                  <a className="hq-row hq-row--link" data-sev={sev} href={m.href} target="_blank" rel="noreferrer">{body}</a>
                ) : (
                  <button type="button" className="hq-row hq-row--link" data-sev={sev} onClick={() => go(m.view ?? "pipelines")}>{body}</button>
                )}
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="hq-small">{besideQueue ? "Everyone close to paying is already on your list." : "Nobody's waiting on you to close."} Every reply to a pitch and every interested lead lands here first.</p>
      )}
    </section>
  );
}

/** Today's calendar, with the next thing up marked. */
export function TodayCard() {
  const { data, now } = useHq();
  const events = agenda(data, now);
  const next = events.find((e) => !e.allDay && e.end > now);
  return (
    <section className="hq-card">
      <div className="hq-card__head"><h2 className="hq-h2">Today</h2><Icon name="calendar" /></div>
      {!data.calendar ? (
        <p className="hq-small">Your calendar hasn&apos;t reported yet. It syncs every 15 minutes once the calendar script has run.</p>
      ) : events.length ? (
        <ol className="hq-agenda">
          {events.map((e, i) => (
            <li key={`${e.start}-${i}`} data-past={!e.allDay && e.end <= now} data-next={e === next}>
              <span className="hq-mono">{e.allDay ? "All day" : time(e.start)}</span>
              <span>{e.title}{e.location ? <small>{e.location}</small> : null}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="hq-small">Nothing booked. The whole day is yours.</p>
      )}
    </section>
  );
}

/** Anytime Fitness, kept honest. */
export function GymCard() {
  const { data, now, logGym, undoGym } = useHq();
  const g = gymStats(data, now);
  const free = g.wentToday ? null : gymSlot(data, now);
  const headline = g.wentToday ? "Done today." : g.daysSince === null ? "Not logged yet." : g.daysSince === 1 ? "Last went yesterday." : `${g.daysSince} days since.`;
  return (
    <section className="hq-card hq-gym" data-sev={!g.wentToday && (g.daysSince ?? 99) >= 4 ? "warn" : undefined}>
      <div className="hq-card__head">
        <div>
          <p className="hq-eyebrow"><span>↑</span> Anytime Fitness</p>
          <h2 className="hq-h2">{headline}</h2>
        </div>
        <Icon name="gym" />
      </div>
      <div className="hq-gym__week" aria-label={`${g.week} of ${GYM_GOAL} this week`}>
        {Array.from({ length: Math.max(GYM_GOAL, g.week) }, (_, k) => <i key={k} data-on={k < g.week} />)}
        <span>{g.week} of {GYM_GOAL} this week</span>
      </div>
      <p className="hq-small">
        {g.month} {g.month === 1 ? "visit" : "visits"} this month
        {g.costPerVisit !== null ? ` · $${g.costPerVisit.toFixed(2)} a visit` : GYM_MONTHLY ? ` · $${GYM_MONTHLY} paid for nothing so far` : ""}
        {g.weekStreak > 1 ? ` · ${g.weekStreak} weeks in a row at ${GYM_GOAL}+` : ""}
      </p>
      {free ? <p className="hq-small"><b style={{ color: "var(--fg)" }}>Free slot:</b> {time(free)}, 90 minutes clear.</p> : null}
      <div className="hq-actions">
        {g.wentToday ? (
          g.todayId ? <button type="button" className="hq-btn hq-btn--ghost" onClick={() => void undoGym(g.todayId!)}>Take it back</button> : <span className="hq-small">From your calendar.</span>
        ) : (
          <button type="button" className="hq-btn hq-btn--primary" onClick={() => void logGym()}>I went today</button>
        )}
      </div>
    </section>
  );
}

const DAY = 86_400_000;
const TZ = "America/Edmonton";
const dayKey = (t: number) => new Date(t).toLocaleDateString("en-CA", { timeZone: TZ });

/** Twelve weeks of gym days, Monday to Sunday, today in the bottom-right corner. */
function GymGrid() {
  const { data, now } = useHq();
  const days = new Set([
    ...(data.life ?? []).filter((e) => e.kind === "gym").map((e) => dayKey(e.at)),
    ...(data.calendar?.events ?? []).filter((e) => !e.allDay && e.end <= now && /\b(gym|workout|lift|leg day|push day|pull day|anytime fitness)\b/i.test(e.title)).map((e) => dayKey(e.start)),
  ]);
  const dow = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(new Date(now).toLocaleDateString("en-CA", { timeZone: TZ, weekday: "short" }));
  const weeks = 12;
  const start = now - (dow + (weeks - 1) * 7) * DAY;
  const cells = Array.from({ length: weeks * 7 }, (_, i) => {
    const t = start + i * DAY;
    return { key: dayKey(t), on: days.has(dayKey(t)), future: t > now + DAY / 2 };
  });
  return (
    <div className="hq-gymgrid" role="img" aria-label={`${cells.filter((c) => c.on).length} gym days in the last ${weeks} weeks`}>
      {Array.from({ length: weeks }, (_, w) => (
        <span key={w} className="hq-gymgrid__week">
          {cells.slice(w * 7, w * 7 + 7).map((c) => <i key={c.key} data-on={c.on} data-future={c.future} title={c.key} />)}
        </span>
      ))}
    </div>
  );
}

/** The gym in full: the grid, a forgotten day, and every visit with a way to take one back. */
function GymFull() {
  const { data, now, logGym, removeLife } = useHq();
  const g = gymStats(data, now);
  const [past, setPast] = useState("");
  const visits = (data.life ?? []).filter((e) => e.kind === "gym").slice(0, 8);
  const yesterday = dayKey(now - DAY);
  return (
    <section className="hq-card hq-gym" data-sev={!g.wentToday && (g.daysSince ?? 99) >= 4 ? "warn" : undefined}>
      <div className="hq-card__head">
        <div>
          <p className="hq-eyebrow"><span>↑</span> Anytime Fitness · goal {GYM_GOAL} a week</p>
          <h2 className="hq-h2">{g.wentToday ? "Done today. Good." : g.daysSince === null ? "No visits logged yet." : `${g.daysSince} ${g.daysSince === 1 ? "day" : "days"} since you went.`}</h2>
        </div>
        <Icon name="gym" />
      </div>
      <div className="hq-gym__body">
        <div className="hq-gym__grid">
          <GymGrid />
          <p className="hq-mono hq-gym__axis"><span>12 weeks ago</span><span>this week</span></p>
        </div>
        <div className="hq-stats hq-gym__stats">
          <div className="hq-stat"><b>{g.week}<small>/{GYM_GOAL}</small></b><span>this week</span></div>
          <div className="hq-stat"><b>{g.month}</b><span>this month</span></div>
          <div className="hq-stat"><b>{g.costPerVisit !== null ? `$${g.costPerVisit.toFixed(0)}` : GYM_MONTHLY ? `$${GYM_MONTHLY}` : "—"}</b><span>{g.costPerVisit !== null ? "per visit" : "paid, unused"}</span></div>
          <div className="hq-stat"><b>{g.weekStreak}</b><span>{g.weekStreak === 1 ? "week" : "weeks"} in a row at goal</span></div>
        </div>
      </div>
      <div className="hq-actions">
        {g.wentToday ? null : <button type="button" className="hq-btn hq-btn--primary" onClick={() => void logGym()}>I went today</button>}
        <button type="button" className="hq-btn" onClick={() => void logGym(Date.parse(`${yesterday}T18:00:00-06:00`))}>I went yesterday</button>
        <form className="hq-actions" onSubmit={(e) => { e.preventDefault(); if (past) void logGym(Date.parse(`${past}T18:00:00-06:00`)).then(() => setPast("")); }}>
          <input className="hq-input" type="date" value={past} max={dayKey(now)} min={dayKey(now - 60 * DAY)} onChange={(e) => setPast(e.target.value)} aria-label="Another day you went" style={{ width: "auto" }} />
          <button type="submit" className="hq-btn hq-btn--ghost" disabled={!past}>Log that day</button>
        </form>
      </div>
      {visits.length ? (
        <p className="hq-small" style={{ margin: 0 }}>
          Logged: {visits.map((v, i) => (
            <span key={v.id}>{i ? ", " : ""}{new Date(v.at).toLocaleDateString("en-CA", { timeZone: TZ, weekday: "short", month: "short", day: "numeric" })} <button type="button" className="hq-linkbtn" aria-label="Remove this visit" onClick={() => void removeLife(v, "Visit removed")}>×</button></span>
          ))}
        </p>
      ) : null}
    </section>
  );
}

/** The next seven days, a day per block: calendar events, then what's due that day. */
export function WeekCard() {
  const { data, now } = useHq();
  const events = data.calendar?.events ?? [];
  const start = Date.parse(`${dayKey(now)}T00:00:00-06:00`);
  const due = (data.life ?? []).filter((e) => (e.kind === "note" || e.kind === "owed") && !e.done && e.due);
  const days = Array.from({ length: 7 }, (_, i) => {
    const key = dayKey(now + i * DAY);
    const list = events.filter((e) => dayKey(e.start) === key || (e.allDay && e.start <= start + i * DAY + DAY / 2 && e.end > start + i * DAY + DAY / 2)).sort((a, b) => Number(b.allDay) - Number(a.allDay) || a.start - b.start);
    // Today also carries anything late, so nothing overdue drops off the week.
    const things = due.filter((e) => (i === 0 ? dayKey(e.due!) <= key : dayKey(e.due!) === key));
    return { key, label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : new Date(now + i * DAY).toLocaleDateString("en-CA", { timeZone: TZ, weekday: "long" }), date: new Date(now + i * DAY).toLocaleDateString("en-CA", { timeZone: TZ, month: "short", day: "numeric" }), list, things };
  });
  return (
    <section className="hq-card">
      <div className="hq-card__head"><h2 className="hq-h2">This week</h2>{data.calendar ? <span className="hq-mono">synced {ago(data.calendar.generatedAt, now)}</span> : null}</div>
      {!data.calendar ? <p className="hq-small">Your calendar hasn&apos;t reported yet. It syncs every 15 minutes once the calendar script has run.</p> : null}
      <ol className="hq-week">
        {days.map((d) => (
          <li key={d.key} data-empty={!d.list.length && !d.things.length}>
            <p className="hq-week__day"><b>{d.label}</b><span className="hq-mono">{d.date}</span></p>
            {d.list.length || d.things.length ? (
              <ul>
                {d.list.map((e, i) => (
                  <li key={`${e.start}-${i}`} data-past={!e.allDay && e.end <= now}>
                    <span className="hq-mono">{e.allDay ? "All day" : time(e.start)}</span>
                    <span>{e.title}{e.location ? <small>{e.location}</small> : null}</span>
                  </li>
                ))}
                {d.things.map((e) => (
                  <li key={e.id} data-kind={e.kind}>
                    <span className="hq-mono">{e.kind === "owed" ? "Owed" : dueState(e.due, now) === "late" ? "Late" : "To-do"}</span>
                    <span>{e.kind === "owed" ? `${dollars(e.amount ?? 0)} from ${e.text}` : e.text}</span>
                  </li>
                ))}
              </ul>
            ) : <span className="hq-small">Free</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Noon on the day `n` days from now, Calgary time. */
const inDays = (now: number, n: number) => noonOf(dayKey(now + n * DAY));

/** When a to-do (or a payment) is due: a quick list, or any day. */
export function DuePicker({ value, onChange, label = "Due", allowNone = true }: { value: number | null; onChange: (v: number | null) => void; label?: string; allowNone?: boolean }) {
  const { now } = useHq();
  const options = [
    ...(allowNone ? [{ v: "", label: "No date" }] : []),
    { v: String(inDays(now, 0)), label: "Today" },
    { v: String(inDays(now, 1)), label: "Tomorrow" },
    ...[2, 3, 4, 5, 6].map((n) => ({ v: String(inDays(now, n)), label: new Date(now + n * DAY).toLocaleDateString("en-CA", { timeZone: TZ, weekday: "long" }) })),
    { v: String(inDays(now, 7)), label: "In a week" },
    { v: String(inDays(now, 14)), label: "In two weeks" },
    { v: String(inDays(now, 30)), label: "In a month" },
  ];
  const known = value === null || options.some((o) => o.v === String(value));
  const [pick, setPick] = useState(!known);
  return (
    <span className="hq-due">
      <select className="hq-input" aria-label={label} value={pick ? "pick" : value === null ? "" : String(value)} onChange={(e) => {
        if (e.target.value === "pick") { setPick(true); return; }
        setPick(false);
        onChange(e.target.value ? Number(e.target.value) : null);
      }}>
        {options.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
        <option value="pick">Pick a day…</option>
      </select>
      {pick ? <input className="hq-input" type="date" aria-label={`${label} day`} value={value ? dayKey(value) : ""} min={dayKey(now - 365 * DAY)} onChange={(e) => onChange(e.target.value ? noonOf(e.target.value) : null)} /> : null}
    </span>
  );
}

export function DueTag({ due }: { due: number | null | undefined }) {
  const { now } = useHq();
  if (!due) return null;
  return <span className="hq-duetag" data-due={dueState(due, now)}>{dueLabel(due, now)}</span>;
}

/** One to-do: tick it, see when it's due, push it to tomorrow, or delete it. */
function TodoRow({ n }: { n: LifeEntry }) {
  const { now, toggleNote, setNoteDue, removeLife } = useHq();
  const st = dueState(n.due, now);
  return (
    <li data-done={n.done} data-due={st}>
      <Swipe
        right={{ label: n.done ? "Not done" : "Done", run: () => void toggleNote(n.id, !n.done), tone: "go" }}
        left={n.done ? { label: "Delete", run: () => void removeLife(n, "To-do deleted"), tone: "calm" } : { label: st === "late" || st === "today" ? "Tomorrow" : "Today", run: () => void setNoteDue(n.id, inDays(now, st === "late" || st === "today" ? 1 : 0)), tone: "calm" }}
      >
        <div className="hq-todo__row">
          <label>
            <input type="checkbox" checked={!!n.done} onChange={(e) => void toggleNote(n.id, e.target.checked)} />
            <span>{n.text}</span>
          </label>
          <span className="hq-todo__side">
            {n.done ? null : <DueTag due={n.due} />}
            {!n.done && (st === "late" || st === "today") ? <button type="button" className="hq-linkbtn hq-todo__push" onClick={() => void setNoteDue(n.id, inDays(now, 1))}>Tomorrow</button> : null}
            {!n.done && st === "none" ? <button type="button" className="hq-linkbtn hq-todo__push" onClick={() => void setNoteDue(n.id, inDays(now, 0))}>Do today</button> : null}
            <button type="button" className="hq-linkbtn hq-todo__x" aria-label="Delete to-do" onClick={() => void removeLife(n, "To-do deleted")}>×</button>
          </span>
        </div>
      </Swipe>
    </li>
  );
}

/** Add a to-do with an optional due day. Used on the card and in the quick-add sheet. */
export function TodoForm({ onDone, autoFocus }: { onDone?: () => void; autoFocus?: boolean }) {
  const { addNote } = useHq();
  const [text, setText] = useState("");
  const [due, setDue] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="hq-addnote"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        setBusy(true);
        if (await addNote(text.trim(), due)) {
          setText("");
          setDue(null);
          onDone?.();
        }
        setBusy(false);
      }}
    >
      <input className="hq-input" autoFocus={autoFocus} value={text} maxLength={500} onChange={(e) => setText(e.target.value)} placeholder="Call Peak Physio back, buy a tripod, an idea…" aria-label="New to-do" />
      <DuePicker value={due} onChange={setDue} />
      <button type="submit" className="hq-btn hq-btn--primary" disabled={busy || !text.trim()}>Add</button>
    </form>
  );
}

const TODO_GROUPS: Array<{ key: string; label: string; test: (s: ReturnType<typeof dueState>) => boolean }> = [
  { key: "late", label: "Late", test: (s) => s === "late" },
  { key: "today", label: "Today", test: (s) => s === "today" },
  { key: "soon", label: "This week", test: (s) => s === "soon" },
  { key: "later", label: "Later", test: (s) => s === "later" },
  { key: "none", label: "Whenever", test: (s) => s === "none" },
];

/**
 * To-dos, saved to HQ so they follow you between phone and laptop. `compact`
 * (on Today) shows what's late, today and this week first; the full list
 * groups everything by when it's due and keeps the last few you finished.
 */
export function TodoCard({ compact }: { compact?: boolean }) {
  const { data, now, go } = useHq();
  const t = todoStats(data, now);
  const done = (data.life ?? []).filter((e) => e.kind === "note" && e.done).sort((a, b) => b.at - a.at).slice(0, 6);
  const urgent = t.overdue.length + t.today.length;
  const shown = t.open.slice(0, 5);
  return (
    <section className="hq-card hq-todo" data-sev={t.overdue.length ? "warn" : undefined}>
      <div className="hq-card__head">
        <div>
          <h2 className="hq-h2">To-dos</h2>
          <p className="hq-small hq-todo__count">{t.open.length ? `${t.open.length} open${urgent ? ` · ${urgent} due${t.overdue.length ? `, ${t.overdue.length} late` : " today"}` : ""}` : "Nothing on the list"}</p>
        </div>
        {compact && t.open.length > shown.length ? <button type="button" className="hq-btn hq-btn--ghost" onClick={() => go("life")}>All {t.open.length}</button> : null}
      </div>
      <TodoForm />
      {compact ? (
        shown.length ? <ul className="hq-notes">{shown.map((n) => <TodoRow key={n.id} n={n} />)}</ul> : <p className="hq-small" style={{ margin: 0 }}>Nothing written down. Give something a day and it shows up here and in your day.</p>
      ) : (
        <div className="hq-todo__groups">
          {TODO_GROUPS.map((g) => {
            const list = t.open.filter((n) => g.test(dueState(n.due, now)));
            return list.length ? (
              <div key={g.key}>
                <p className="hq-qgroup" data-k={g.key}>{g.label} <span>{list.length}</span></p>
                <ul className="hq-notes">{list.map((n) => <TodoRow key={n.id} n={n} />)}</ul>
              </div>
            ) : null;
          })}
          {!t.open.length ? <p className="hq-small" style={{ margin: 0 }}>All clear. Add anything you don&apos;t want to carry in your head.</p> : null}
          {done.length ? (
            <details className="hq-more">
              <summary>Done recently ({done.length})</summary>
              <ul className="hq-notes">{done.map((n) => <TodoRow key={n.id} n={n} />)}</ul>
            </details>
          ) : null}
        </div>
      )}
    </section>
  );
}

export function LifeView() {
  const { data, now } = useHq();
  const g = gymStats(data, now);
  return (
    <div className="hq-view">
      <header className="hq-viewhead">
        <h1 className="hq-h1">{g.wentToday ? <>Gym done. <em>Now the rest of the day.</em></> : (g.daysSince ?? 99) >= 3 ? <>The gym is <em>waiting on you.</em></> : <>Your week, <em>at a glance.</em></>}</h1>
        <p className="hq-lede">The gym, your week and your to-dos. The business stuff lives everywhere else.</p>
      </header>
      <GymFull />
      <div className="hq-cols-2">
        <TodoCard />
        <WeekCard />
      </div>
    </div>
  );
}
