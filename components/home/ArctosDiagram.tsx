"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/useMedia";
import {
  ARCTOS_BEAR_PATH,
  ARCTOS_FRAME_PATH,
  ARCTOS_STAR_PATH,
} from "../brand/ArctosMark";

/**
 * The hero thesis: the mark is the system diagram.
 *
 * The sweep that crosses the Arctos triangle is the customer's path through the
 * studio — attract, convert, operate, scale — so the four stages are plotted as
 * survey stations along it rather than listed as four cards underneath.
 *
 * The reveal is a plotter trace: the outline is stroked on with dashoffset,
 * then the fill fades up behind it. Reduced motion gets the finished plot.
 */

const STATIONS = [
  { id: "attract", n: "01", label: "Attract", x: 17.5, y: 87.5 },
  { id: "convert", n: "02", label: "Convert", x: 38, y: 76 },
  { id: "operate", n: "03", label: "Operate", x: 60, y: 70 },
  { id: "scale", n: "04", label: "Scale", x: 82, y: 80 },
] as const;

export function ArctosDiagram() {
  const reduced = useReducedMotion();
  const [drawn, setDrawn] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const root = useRef<SVGSVGElement>(null);

  // A beat before the plot starts, so the headline lands first.
  useEffect(() => {
    if (reduced) return;
    const t = window.setTimeout(() => setDrawn(true), 120);
    return () => window.clearTimeout(t);
  }, [reduced]);

  // Reduced motion gets the finished plot with no draw-on at all.
  const plotted = reduced || drawn;

  return (
    <div className="diagram">
      <svg
        ref={root}
        className={`diagram__svg${plotted ? " is-plotted" : ""}${drawn ? " is-drawn" : ""}`}
        viewBox="0 0 100 100"
        role="img"
        aria-label="The Arctos mark plotted as a four-stage system: attract, convert, operate, scale."
      >
        {/* Survey grid — the paper the plot is drawn on. */}
        <g className="diagram__grid" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`h${i}`} x1="0" x2="100" y1={(i + 1) * 10} y2={(i + 1) * 10} />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`v${i}`} y1="0" y2="100" x1={(i + 1) * 10} x2={(i + 1) * 10} />
          ))}
        </g>

        <g className="diagram__plot">
          <path d={ARCTOS_FRAME_PATH} className="diagram__path diagram__path--frame" />
          <path d={ARCTOS_BEAR_PATH} className="diagram__path diagram__path--bear" />
          <path d={ARCTOS_STAR_PATH} className="diagram__path diagram__path--star" />
        </g>

        <g className="diagram__stations">
          {STATIONS.map((s) => (
            <g
              key={s.id}
              className={`diagram__station${active === s.id ? " is-active" : ""}`}
              data-chapter={s.id}
              onMouseEnter={() => setActive(s.id)}
              onMouseLeave={() => setActive(null)}
            >
              <circle cx={s.x} cy={s.y} r="4.4" className="diagram__hit" />
              <circle cx={s.x} cy={s.y} r="1.55" className="diagram__node" />
              <circle cx={s.x} cy={s.y} r="3.4" className="diagram__halo" />
            </g>
          ))}
        </g>
      </svg>

      {/* Labels live in HTML, not SVG text — they stay selectable, translatable,
          and they reflow on narrow screens instead of scaling into illegibility. */}
      <ul className="diagram__legend">
        {STATIONS.map((s) => (
          <li
            key={s.id}
            data-chapter={s.id}
            className={active === s.id ? "is-active" : undefined}
            onMouseEnter={() => setActive(s.id)}
            onMouseLeave={() => setActive(null)}
          >
            <span className="t-folio">{s.n}</span>
            <span className="diagram__legend-label">{s.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
