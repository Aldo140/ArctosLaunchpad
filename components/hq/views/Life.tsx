"use client";

import { useState } from "react";
import { useHq } from "../context";
import { BUSINESS_LABEL, ago, short, slot } from "../format";
import { GYM_GOAL, GYM_MONTHLY, agenda, gymSlot, gymStats, moneyMoves } from "../persona";
import { Icon } from "../ui";

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
      <div className="hq-stats">
        <div className="hq-stat"><b>{g.week}<small>/{GYM_GOAL}</small></b><span>this week</span></div>
        <div className="hq-stat"><b>{g.month}</b><span>this month</span></div>
        <div className="hq-stat"><b>{g.costPerVisit !== null ? `$${g.costPerVisit.toFixed(0)}` : GYM_MONTHLY ? `$${GYM_MONTHLY}` : "—"}</b><span>{g.costPerVisit !== null ? "per visit" : "paid, unused"}</span></div>
        <div className="hq-stat"><b>{g.weekStreak}</b><span>{g.weekStreak === 1 ? "week" : "weeks"} in a row at goal</span></div>
      </div>
      <GymGrid />
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

/** The next seven days, a day per block. */
export function WeekCard() {
  const { data, now } = useHq();
  const events = data.calendar?.events ?? [];
  const start = Date.parse(`${dayKey(now)}T00:00:00-06:00`);
  const days = Array.from({ length: 7 }, (_, i) => {
    const key = dayKey(now + i * DAY);
    const list = events.filter((e) => dayKey(e.start) === key || (e.allDay && e.start <= start + i * DAY + DAY / 2 && e.end > start + i * DAY + DAY / 2)).sort((a, b) => Number(b.allDay) - Number(a.allDay) || a.start - b.start);
    return { key, label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : new Date(now + i * DAY).toLocaleDateString("en-CA", { timeZone: TZ, weekday: "long" }), date: new Date(now + i * DAY).toLocaleDateString("en-CA", { timeZone: TZ, month: "short", day: "numeric" }), list };
  });
  return (
    <section className="hq-card">
      <div className="hq-card__head"><h2 className="hq-h2">This week</h2>{data.calendar ? <span className="hq-mono">synced {ago(data.calendar.generatedAt, now)}</span> : null}</div>
      {!data.calendar ? <p className="hq-small">Your calendar hasn&apos;t reported yet. It syncs every 15 minutes once the calendar script has run.</p> : (
        <ol className="hq-week">
          {days.map((d) => (
            <li key={d.key} data-empty={!d.list.length}>
              <p className="hq-week__day"><b>{d.label}</b><span className="hq-mono">{d.date}</span></p>
              {d.list.length ? (
                <ul>
                  {d.list.map((e, i) => (
                    <li key={`${e.start}-${i}`} data-past={!e.allDay && e.end <= now}>
                      <span className="hq-mono">{e.allDay ? "All day" : time(e.start)}</span>
                      <span>{e.title}{e.location ? <small>{e.location}</small> : null}</span>
                    </li>
                  ))}
                </ul>
              ) : <span className="hq-small">Free</span>}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/** Notes to self: ideas, errands, things to remember. Saved to HQ, so they're on the phone and the laptop. */
export function NotesCard({ limit }: { limit?: number }) {
  const { data, now, addNote, toggleNote, removeLife, go } = useHq();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const notes = (data.life ?? []).filter((e) => e.kind === "note").sort((a, b) => Number(a.done) - Number(b.done) || b.at - a.at);
  const open = notes.filter((n) => !n.done);
  const shown = limit ? open.slice(0, limit) : notes.slice(0, 40);
  return (
    <section className="hq-card">
      <div className="hq-card__head"><h2 className="hq-h2">Notes</h2>{limit && open.length > limit ? <button type="button" className="hq-btn hq-btn--ghost" onClick={() => go("life")}>All {open.length}</button> : <span className="hq-mono">{open.length} open</span>}</div>
      <form
        className="hq-addnote"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!text.trim()) return;
          setBusy(true);
          if (await addNote(text.trim())) setText("");
          setBusy(false);
        }}
      >
        <input className="hq-input" value={text} maxLength={500} onChange={(e) => setText(e.target.value)} placeholder="An idea, a to-do, anything" aria-label="New note" />
        <button type="submit" className="hq-btn hq-btn--primary" disabled={busy || !text.trim()}>Add</button>
      </form>
      {shown.length ? (
        <ul className="hq-notes">
          {shown.map((n) => (
            <li key={n.id} data-done={n.done}>
              <label>
                <input type="checkbox" checked={!!n.done} onChange={(e) => void toggleNote(n.id, e.target.checked)} />
                <span>{n.text}</span>
              </label>
              <span className="hq-when">{short(n.at, now)}</span>
              <button type="button" className="hq-linkbtn" aria-label="Delete note" onClick={() => void removeLife(n, "Note deleted")}>×</button>
            </li>
          ))}
        </ul>
      ) : <p className="hq-small" style={{ margin: 0 }}>Nothing written down. Ideas you add here follow you between phone and laptop.</p>}
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
        <p className="hq-lede">The gym, your calendar and your notes. The business stuff lives everywhere else.</p>
      </header>
      <GymFull />
      <div className="hq-cols-2">
        <WeekCard />
        <NotesCard />
      </div>
    </div>
  );
}
