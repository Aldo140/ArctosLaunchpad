"use client";

import { useHq } from "../context";
import { BUSINESS_LABEL, ago, slot } from "../format";
import { GYM_GOAL, GYM_MONTHLY, agenda, gymSlot, gymStats, moneyMoves } from "../persona";
import { Icon } from "../ui";

const time = (t: number) => slot(t).split(" ").slice(1).join(" ");

/** The people closest to paying, closest first. */
export function MoneyMoves() {
  const { data, now, filter, go } = useHq();
  const moves = moneyMoves(data, now, filter);
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
        <p className="hq-small">Nobody&apos;s waiting on you to close. Every reply to a pitch and every interested lead lands here first.</p>
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
        <p className="hq-small">Your calendar isn&apos;t connected yet. Add <code>ops/gmail/hq-calendar.gs</code> to the Gmail sync&apos;s Apps Script project and run <code>setupCalendar</code> once.</p>
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
