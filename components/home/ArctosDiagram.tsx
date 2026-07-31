"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "@/lib/useMedia";
import { growthStages } from "@/lib/content";
import {
  ARCTOS_BEAR_PATH,
  ARCTOS_FRAME_PATH,
  ARCTOS_STAR_PATH,
} from "../brand/ArctosMark";

/**
 * The hero thesis: the mark is the instrument, and you can operate it.
 *
 * The sweep crossing the Arctos triangle is the customer's path through the
 * studio, so the four stages are plotted as survey stations along it rather
 * than listed as four cards underneath. That much was already true. What this
 * adds is that the diagram is now *live*:
 *
 *   - a signal runs the route continuously, passing through each station in
 *     turn, so the mark reads as a system with something moving through it
 *   - taking a station — hover, focus, or arrow key — holds the signal there,
 *     lights the route up to that point in the stage's own accent, and prints
 *     that stage's statement into the readout
 *   - the readout is mono and always occupies the same box, so nothing below
 *     the diagram reflows as you move between stations
 *
 * The stations are real buttons. This is the primary way into the offer, and a
 * hover-only diagram would hand that to a mouse and to nobody else.
 *
 * With reduced motion the signal does not travel: the plot is finished, the
 * route is drawn, and the stations still operate. Nothing here is required to
 * read the page — the headline and the links beside it carry the hero on their
 * own if this never runs.
 */

const STATIONS = [
  { id: "attract", n: "01", x: 17.5, y: 87.5 },
  { id: "convert", n: "02", x: 38, y: 76 },
  { id: "operate", n: "03", x: 60, y: 70 },
  { id: "scale", n: "04", x: 82, y: 80 },
] as const;

/**
 * The customer's path across the mark, through all four stations.
 * Endpoints are pulled inside the triangle: run out to the base corners the
 * line escaped the mark at both ends and read as a stray stroke rather than a
 * route drawn on it.
 */
const ROUTE =
  "M11 90.5 C 13.5 88.8, 15.5 87.8, 17.5 87.5 S 31 79.5, 38 76 S 52 71.5, 60 70 S 75 74, 82 80 S 86.5 84.5, 88.5 86.5";

type StageId = (typeof STATIONS)[number]["id"];

const STAGE = Object.fromEntries(
  growthStages.map((s) => [s.id, s]),
) as Record<StageId, (typeof growthStages)[number]>;

export function ArctosDiagram() {
  const reduced = useReducedMotion();
  const [drawn, setDrawn] = useState(false);
  const [active, setActive] = useState<StageId | null>(null);
  const [cruise, setCruise] = useState(0);
  const stationRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // A beat before the plot starts, so the headline lands first.
  useEffect(() => {
    if (reduced) return;
    const t = window.setTimeout(() => setDrawn(true), 120);
    return () => window.clearTimeout(t);
  }, [reduced]);

  // The signal's idle patrol. It only runs while no station is taken and the
  // tab is visible — an animation nobody is looking at is just battery.
  useEffect(() => {
    if (reduced || active) return;
    let frame = 0;
    let start: number | null = null;
    const CYCLE = 9000;
    const step = (now: number) => {
      if (document.hidden) {
        start = null;
      } else {
        if (start === null) start = now;
        setCruise(((now - start) % CYCLE) / CYCLE);
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [reduced, active]);

  const activeIndex = active
    ? STATIONS.findIndex((s) => s.id === active)
    : -1;

  // Where the signal sits, 0–1 along the route.
  const progress =
    activeIndex >= 0 ? (activeIndex + 0.5) / STATIONS.length : cruise;

  const onKey = useCallback((event: React.KeyboardEvent, index: number) => {
    const delta =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (index + delta + STATIONS.length) % STATIONS.length;
    stationRefs.current[next]?.focus();
  }, []);

  const plotted = reduced || drawn;
  const shown = active ? STAGE[active] : null;

  return (
    <div className="diagram" data-chapter={active ?? undefined}>
      <svg
        className={`diagram__svg${plotted ? " is-plotted" : ""}${
          drawn ? " is-drawn" : ""
        }`}
        viewBox="0 0 100 100"
        role="img"
        aria-label="The Arctos mark plotted as a four-stage system: attract, convert, operate, scale."
      >
        <g className="diagram__grid" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => (
            <line
              key={`h${i}`}
              x1="0"
              x2="100"
              y1={(i + 1) * 10}
              y2={(i + 1) * 10}
            />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <line
              key={`v${i}`}
              y1="0"
              y2="100"
              x1={(i + 1) * 10}
              x2={(i + 1) * 10}
            />
          ))}
        </g>

        <g className="diagram__plot">
          <path
            d={ARCTOS_FRAME_PATH}
            className="diagram__path diagram__path--frame"
          />
          <path
            d={ARCTOS_BEAR_PATH}
            className="diagram__path diagram__path--bear"
          />
          <path
            d={ARCTOS_STAR_PATH}
            className="diagram__path diagram__path--star"
          />
        </g>

        {/* The route, and the signal running it. `pathLength="1"` lets the
            dash values below be read as plain fractions of the whole. */}
        <g className="diagram__route" aria-hidden="true">
          <path className="diagram__route-line" d={ROUTE} pathLength={1} />
          <path
            className="diagram__route-live"
            d={ROUTE}
            pathLength={1}
            style={{ strokeDasharray: `${progress} 1` }}
          />
          <path
            className="diagram__route-signal"
            d={ROUTE}
            pathLength={1}
            style={{
              strokeDasharray: "0.012 1",
              strokeDashoffset: -progress,
            }}
          />
        </g>

        <g className="diagram__stations" aria-hidden="true">
          {STATIONS.map((s) => (
            <g
              key={s.id}
              className={`diagram__station${
                active === s.id ? " is-active" : ""
              }`}
              data-chapter={s.id}
            >
              <circle cx={s.x} cy={s.y} r="1.55" className="diagram__node" />
              <circle cx={s.x} cy={s.y} r="3.4" className="diagram__halo" />
            </g>
          ))}
        </g>
      </svg>

      {/* Real buttons, positioned over the plot. The diagram is the primary
          route into the offer, so it has to be operable without a mouse. */}
      <ul className="diagram__controls">
        {STATIONS.map((s, i) => (
          <li key={s.id} style={{ "--x": s.x, "--y": s.y } as React.CSSProperties}>
            <button
              type="button"
              ref={(el) => {
                stationRefs.current[i] = el;
              }}
              className="diagram__control"
              data-chapter={s.id}
              aria-pressed={active === s.id}
              onMouseEnter={() => setActive(s.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(s.id)}
              onBlur={() => setActive(null)}
              onKeyDown={(e) => onKey(e, i)}
            >
              <span className="visually-hidden">
                Stage {s.n}, {STAGE[s.id].title}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* Fixed-height readout: the box is the same size whether a station is
          taken or not, so nothing under the diagram jumps as you move. */}
      <div className="diagram__readout" aria-live="polite">
        <p className="diagram__readout-line">
          <span className="diagram__readout-n">
            {shown ? `0${activeIndex + 1}` : "——"}
          </span>
          <span className="diagram__readout-name">
            {shown ? shown.title : "The customer path"}
          </span>
        </p>
        <p className="diagram__readout-copy">
          {shown
            ? shown.statement
            : "Four stages on one route. Take a station to read it."}
        </p>
        {shown ? (
          <Link className="diagram__readout-go" href={`/services#${shown.id}`}>
            {shown.title} services <span aria-hidden="true">↗</span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
