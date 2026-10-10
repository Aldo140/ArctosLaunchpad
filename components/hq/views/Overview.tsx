"use client";

import { inFilter, useHq } from "../context";
import { calgaryDayStart } from "../tasks";
import { BUSINESS_LABEL, calgaryParts, num, plural, short, slot } from "../format";
import { useState } from "react";
import { GYM_GOAL, agenda, brief, dollars, greeting, gymSlot, gymStats, mood, moodSignoff, moneyStats, nextMilestone, outreachStreak, owedStats, todoStats, weekScore, wins } from "../persona";
import { openDecisions } from "../queue";
import { SkyStrip } from "../Sky";
import { Icon } from "../ui";
import { QueueRow } from "./Inbox";
import { MoneyMoves, TodoCard } from "./Life";
import { OwedCard } from "./Money";

const time = (t: number) => slot(t).split(" ").slice(1).join(" ");

/** Today: how the day stands in four numbers, what to clear first, and the day itself. */
export function OverviewView() {
  const { data, now, filter, go, preview, logGym } = useHq();
  const snap = data.snapshot;
  const { weekday, date, hour } = calgaryParts(now);
  const queue = openDecisions(data, filter);
  const waiting = queue.length;
  const feel = mood(data, now, filter, waiting);
  const story = brief(data, now, filter);
  const money = moneyStats(data, now, filter);
  const gym = gymStats(data, now);
  const events = agenda(data, now);
  const nextEvent = events.find((e) => !e.allDay && e.end > now);
  const free = gym.wentToday ? null : gymSlot(data, now);
  const owed = owedStats(data, now, filter);
  const todos = todoStats(data, now);
  const [more, setMore] = useState(false);

  // The day as one timeline: calendar, posts going out, and the gym slot.
  const dayEnd = calgaryDayStart(now) + 86_400_000;
  const posts = (snap?.posts ?? []).filter((p) => p.status === "approved" && p.scheduledFor && p.scheduledFor > now - 3_600_000 && p.scheduledFor < dayEnd && inFilter(filter, p.brand));
  const timeline = [
    ...events.map((e) => ({ key: `e${e.start}${e.title}`, at: e.allDay ? 0 : e.start, end: e.end, allDay: e.allDay, kind: "cal" as const, title: e.title, note: e.location })),
    ...posts.map((p) => ({ key: `p${p.id}`, at: p.scheduledFor!, end: p.scheduledFor!, allDay: false, kind: "post" as const, title: p.headline, note: `${BUSINESS_LABEL[p.brand]} post goes out` })),
    ...(free ? [{ key: "gym", at: free, end: free + 90 * 60_000, allDay: false, kind: "gym" as const, title: "Free for the gym", note: "90 minutes clear" }] : []),
  ].sort((a, b) => a.at - b.at);
  // What's due today (or late) has no time of its own; it sits under the day.
  const dueToday = [...todos.overdue, ...todos.today];
  const owedToday = owed.overdue.concat(owed.dueSoon.filter((e) => e.due! < dayEnd));

  const good = wins(data, now, filter);
  const streak = filter === "all" || filter === "arctos" ? (data.arctos ? outreachStreak(data.arctos.sendsByDay, now) : 0) : 0;
  const climb = (snap?.instagram?.accounts ?? []).filter((a) => a.followers > 0 && (filter === "all" || a.business === filter)).map((a) => ({ handle: a.handle, followers: a.followers, ...nextMilestone(a.followers) })).sort((a, b) => b.progress - a.progress)[0];
  const idea = snap?.instagram?.analysis?.ideas?.[0];

  return (
    <div className="hq-view">
      <header className="hq-hello">
        <div className="hq-hello__top">
          <p className="hq-eyebrow">{weekday} · {date}{filter !== "all" ? ` · ${BUSINESS_LABEL[filter]}` : ""}</p>
          <SkyStrip preview={preview} />
        </div>
        <h1 className="hq-h1">{greeting(hour)} {waiting ? <><em>{plural(waiting, "thing")}</em> {waiting === 1 ? "needs" : "need"} you.</> : <>Nothing needs you. <em>Go find money.</em></>}</h1>
        <p className="hq-mood" data-mood={feel.key}>{feel.line}</p>
        <ul className="hq-brieflist" data-open={more}>
          {story.map((line) => <li key={line}>{line}</li>)}
        </ul>
        {story.length > 2 ? <button type="button" className="hq-linkbtn hq-brief__more" data-few={story.length <= 4} onClick={() => setMore((m) => !m)} aria-expanded={more}>{more ? "Less" : "The rest of the brief"}</button> : null}
      </header>

      <div className="hq-pulse">
        <button type="button" className="hq-tile2" data-sev={waiting ? "warn" : "ok"} onClick={() => go("decide")}>
          <span className="hq-tile2__label"><Icon name="inbox" /> Waiting on you</span>
          <b>{waiting}</b>
          <span className="hq-tile2__sub">{waiting ? `oldest ${short(Math.min(...queue.map((q) => q.at)), now).replace(" ago", "")}` : "all clear"}</span>
        </button>
        <button type="button" className="hq-tile2" onClick={() => go("money")}>
          <span className="hq-tile2__label"><Icon name="money" /> In this month</span>
          <b>{dollars(money.month)}</b>
          {money.goal ? <span className="hq-meter"><span style={{ width: `${Math.round((money.progress ?? 0) * 100)}%` }} /></span> : null}
          <span className="hq-tile2__sub" data-sev={owed.overdue.length ? "warn" : undefined}>{owed.overdue.length ? `${dollars(owed.overdueTotal)} owed is late` : money.goal ? `of ${dollars(money.goal)} goal${owed.total ? ` · ${dollars(owed.total)} owed` : ""}` : owed.total ? `${dollars(owed.total)} still owed to you` : money.month ? `${dollars(money.lastMonth)} last month` : "tap to log a payment"}</span>
        </button>
        <div className="hq-tile2" data-sev={!gym.wentToday && (gym.daysSince ?? 99) >= 4 ? "bad" : undefined}>
          <button type="button" className="hq-tile2__link" onClick={() => go("life")} aria-label="Gym details" />
          <span className="hq-tile2__label"><Icon name="gym" /> Gym this week</span>
          <b>{gym.week}<small>/{GYM_GOAL}</small></b>
          {gym.wentToday ? <span className="hq-tile2__sub">done today</span> : <button type="button" className="hq-btn hq-btn--primary hq-btn--sm hq-tile2__cta" onClick={() => void logGym()}>I went today</button>}
        </div>
        <button type="button" className="hq-tile2" onClick={() => go("life")}>
          <span className="hq-tile2__label"><Icon name="calendar" /> Next up</span>
          <b className="hq-tile2__time">{nextEvent ? time(nextEvent.start) : "Free"}</b>
          <span className="hq-tile2__sub">{nextEvent ? nextEvent.title : data.calendar ? "nothing else today" : "calendar not synced yet"}</span>
        </button>
      </div>

      <div className="hq-cols-2">
        <section className="hq-card">
          <div className="hq-card__head">
            <h2 className="hq-h2">Clear these first</h2>
            {waiting ? <button type="button" className="hq-btn hq-btn--ghost" onClick={() => go("decide")}>{waiting > 3 ? `All ${waiting}` : "Open"}</button> : null}
          </div>
          {queue.length ? (
            <ul className="hq-qlist hq-qlist--compact">
              {queue.slice(0, 3).map((i) => <QueueRow key={i.key} item={i} />)}
            </ul>
          ) : <p className="hq-small" style={{ margin: 0 }}>Nothing waiting. Replies, drafts and pitches land here the moment the agents find them.</p>}
        </section>
        <section className="hq-card">
          <div className="hq-card__head"><h2 className="hq-h2">Your day</h2><button type="button" className="hq-btn hq-btn--ghost" onClick={() => go("life")}>Week</button></div>
          {timeline.length ? (
            <ol className="hq-agenda hq-agenda--timeline">
              {timeline.map((x) => (
                <li key={x.key} data-kind={x.kind} data-past={!x.allDay && x.end <= now} data-next={x.kind === "cal" && nextEvent && x.at === nextEvent.start}>
                  <span className="hq-mono">{x.allDay ? "All day" : time(x.at)}</span>
                  <span>{x.title}{x.note ? <small>{x.note}</small> : null}</span>
                </li>
              ))}
            </ol>
          ) : <p className="hq-small" style={{ margin: 0 }}>{data.calendar ? "Nothing booked. The whole day is yours." : "Your calendar hasn't reported yet."}</p>}
          {dueToday.length || owedToday.length ? (
            <div className="hq-dueday">
              <p className="hq-qgroup">Due today</p>
              <ul>
                {owedToday.map((e) => <li key={e.id} data-kind="owed"><span>{dollars(e.amount ?? 0)} from {e.text}</span><button type="button" className="hq-linkbtn" onClick={() => go("money")}>{e.due! < dayEnd - 86_400_000 ? "Late" : "Chase"}</button></li>)}
                {dueToday.map((e) => <li key={e.id} data-kind="todo" data-late={e.due! < dayEnd - 86_400_000}><span>{e.text}</span><button type="button" className="hq-linkbtn" onClick={() => go("life")}>{e.due! < dayEnd - 86_400_000 ? "Late" : "To-do"}</button></li>)}
              </ul>
            </div>
          ) : null}
        </section>
      </div>

      <div className="hq-cols-2">
        <TodoCard compact />
        <div className="hq-stack">
          {owed.open.length ? <OwedCard compact /> : null}
          <MoneyMoves besideQueue />
        </div>
      </div>

      <WeekScore />

      {good.length || streak || climb ? (
        <section className="hq-card hq-momentum">
          <div className="hq-card__head"><h2 className="hq-h2">Momentum</h2><span className="hq-mono">Last 7 days</span></div>
          <div className="hq-momentum__grid">
            {streak ? (
              <div className="hq-streak">
                <b>{streak}</b>
                <span>{streak === 1 ? "weekday" : "weekdays"} straight of Arctos outreach</span>
                <i aria-hidden="true">{Array.from({ length: Math.min(streak, 10) }, (_, k) => <em key={k} />)}</i>
              </div>
            ) : null}
            {climb ? (
              <div className="hq-climb">
                <span className="hq-mono">@{climb.handle}</span>
                <b>{num(climb.left)} <small>to {num(climb.target)}</small></b>
                <span className="hq-meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(climb.progress * 100)} aria-label={`@${climb.handle} toward ${num(climb.target)} followers`}><span style={{ width: `${Math.round(climb.progress * 100)}%` }} /></span>
              </div>
            ) : null}
            {good.length ? (
              <ul className="hq-wins">
                {good.slice(0, 4).map((w) => <li key={w.key}><span>{w.text}</span><span className="hq-mono">{short(w.at, now)}</span></li>)}
              </ul>
            ) : null}
          </div>
        </section>
      ) : null}

      {idea ? (
        <button type="button" className="hq-idea" onClick={() => go("inspiration")}>
          <span className="hq-eyebrow"><span>✦</span> Post idea</span>
          <strong>{idea.title} <span className="hq-chip">{idea.format}</span></strong>
          <span className="hq-small">{idea.hook}</span>
        </button>
      ) : null}

      <p className="hq-signoff">{moodSignoff(feel.key, now)}</p>
    </div>
  );
}

const fmtDelta = (d: number, money: boolean) => `${d > 0 ? "+" : d < 0 ? "−" : "±"}${money ? dollars(Math.abs(d)) : Math.abs(d)}`;

/** This week so far against last week to the same moment: is it a better week? */
function WeekScore() {
  const { data, now, filter, go } = useHq();
  const { lines } = weekScore(data, now, filter);
  const ahead = lines.filter((l) => l.value > l.last).length;
  const behind = lines.filter((l) => l.value < l.last).length;
  const verdict = ahead > behind ? "Ahead of last week." : behind > ahead ? "Behind last week, so far." : "Level with last week.";
  return (
    <section className="hq-card hq-score">
      <div className="hq-card__head">
        <div>
          <p className="hq-eyebrow"><span>↗</span> Your week</p>
          <h2 className="hq-h2">{verdict}</h2>
        </div>
        <span className="hq-mono">vs last week, same point</span>
      </div>
      <div className="hq-score__grid">
        {lines.map((l) => {
          const d = l.value - l.last;
          const money = l.format === "money";
          return (
            <button key={l.key} type="button" className="hq-score__cell" data-dir={d > 0 ? "up" : d < 0 ? "down" : "flat"} onClick={() => go(l.view)}>
              <span className="hq-score__label">{l.label}</span>
              <b>{money ? dollars(l.value) : l.value}{l.goal ? <small>/{l.goal}</small> : null}</b>
              <span className="hq-score__delta">{fmtDelta(d, money)} <span>vs {money ? dollars(l.last) : l.last}</span></span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
