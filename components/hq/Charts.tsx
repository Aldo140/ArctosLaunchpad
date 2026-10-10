"use client";

import { useEffect, useRef, useState } from "react";

/** Draw at the container's real pixel width so axis text stays 11px at any size. */
function useWidth(fallback = 640) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(240, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/**
 * The two chart shapes HQ needs, as plain SVG: daily columns (spend) and a
 * line with area (followers). One series each, so one colour; every mark has a
 * native tooltip, and the same numbers appear as text beside the chart.
 */

const H = 170;
const PAD = { top: 12, right: 8, bottom: 22, left: 44 };

function niceMax(v: number): number {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

export function Columns({ data, format, label }: { data: Array<{ x: string; y: number }>; format: (n: number) => string; label: string }) {
  const [ref, W] = useWidth();
  if (!data.length) return null;
  const top = Math.max(...data.map((d) => d.y));
  const max = niceMax(top);
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;
  const step = iw / data.length;
  const bw = Math.max(2, step - 2);
  const y = (v: number) => PAD.top + ih - (v / max) * ih;
  // Whole-number data never gets a half-way tick that would round to a repeated label.
  const ticks = [...new Set([0, max / 2, max].filter((t) => Number.isInteger(t) || max >= 10 || top % 1 !== 0).map((t) => format(t)))].map((f) => [0, max / 2, max].find((t) => format(t) === f)!);
  return (
    <div ref={ref}>
    <svg className="hq-chart" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={label}>
      {ticks.map((t) => (
        <g key={t}>
          <line className="grid" x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} />
          <text x={PAD.left - 6} y={y(t) + 4} textAnchor="end">{format(t)}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const h = Math.max(0, PAD.top + ih - y(d.y));
        const x = PAD.left + i * step + 1;
        return (
          <g key={d.x}>
            <rect className="mark" x={x} y={y(d.y)} width={bw} height={h} rx={h > 4 ? 2 : 0}>
              <title>{`${d.x}: ${format(d.y)}`}</title>
            </rect>
            <rect x={x - 1} y={PAD.top} width={step} height={ih} fill="transparent">
              <title>{`${d.x}: ${format(d.y)}`}</title>
            </rect>
          </g>
        );
      })}
      <text x={PAD.left} y={H - 4}>{data[0].x}</text>
      <text x={W - PAD.right} y={H - 4} textAnchor="end">{data[data.length - 1].x}</text>
    </svg>
    </div>
  );
}

export function Trend({ data, label }: { data: Array<{ x: string; y: number }>; label: string }) {
  const [ref, W] = useWidth();
  if (data.length < 2) return null;
  const ys = data.map((d) => d.y);
  const lo = Math.min(...ys);
  const hi = Math.max(...ys);
  const span = Math.max(1, hi - lo);
  const min = Math.floor(lo - span * 0.15);
  const max = Math.ceil(hi + span * 0.15);
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (i / (data.length - 1)) * iw;
  const y = (v: number) => PAD.top + ih - ((v - min) / (max - min)) * ih;
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.y).toFixed(1)}`).join("");
  const area = `${line}L${x(data.length - 1).toFixed(1)},${PAD.top + ih}L${PAD.left},${PAD.top + ih}Z`;
  const last = data[data.length - 1];
  return (
    <div ref={ref}>
    <svg className="hq-chart" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={label}>
      {[min, max].map((t) => (
        <g key={t}>
          <line className="grid" x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} />
          <text x={PAD.left - 6} y={y(t) + 4} textAnchor="end">{t.toLocaleString("en-CA")}</text>
        </g>
      ))}
      <path className="area" d={area} />
      <path className="line" d={line} />
      {data.map((d, i) => (
        <circle key={d.x} cx={x(i)} cy={y(d.y)} r={i === data.length - 1 ? 4 : 8} className={i === data.length - 1 ? "dot" : undefined} fill={i === data.length - 1 ? undefined : "transparent"}>
          <title>{`${d.x}: ${d.y.toLocaleString("en-CA")}`}</title>
        </circle>
      ))}
      <text x={PAD.left} y={H - 4}>{data[0].x}</text>
      <text x={W - PAD.right} y={H - 4} textAnchor="end">{`${last.x} · ${last.y.toLocaleString("en-CA")}`}</text>
    </svg>
    </div>
  );
}

export function Bars({ rows, format }: { rows: Array<{ label: string; value: number; note?: string }>; format: (n: number) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="hq-bars">
      {rows.map((r) => (
        <div className="hq-bar" key={r.label}>
          <span>{r.label}</span>
          <div className="hq-bar-track" title={`${r.label}: ${format(r.value)}${r.note ? ` · ${r.note}` : ""}`}>
            <div className="hq-bar-fill" style={{ width: `${(r.value / max) * 78}%` }} />
            <span className="hq-bar-val">{format(r.value)}{r.note ? ` · ${r.note}` : ""}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Money this month, added up day by day, against last month and the pace a
 * goal needs. One axis (dollars); this month is the accent line, last month a
 * quiet dashed one, the goal a straight dashed diagonal. Hover or touch shows
 * the day.
 */
export function Pace({ month, last, today, days, goal, format }: { month: number[]; last: number[]; today: number; days: number; goal: number | null; format: (cents: number) => string }) {
  const [ref, W] = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const h = 190;
  const pad = { top: 14, right: 14, bottom: 22, left: 52 };
  const upto = month.slice(0, today);
  const max = niceMax(Math.max(1, ...upto, ...last, goal ?? 0));
  const iw = W - pad.left - pad.right;
  const ih = h - pad.top - pad.bottom;
  const span = Math.max(days, last.length) - 1 || 1;
  const x = (i: number) => pad.left + (i / span) * iw;
  const y = (v: number) => pad.top + ih - (v / max) * ih;
  const path = (xs: number[]) => xs.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const area = upto.length ? `${path(upto)}L${x(upto.length - 1).toFixed(1)},${pad.top + ih}L${pad.left},${pad.top + ih}Z` : "";
  const i = hover ?? today - 1;
  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setHover(Math.max(0, Math.min(days - 1, Math.round(((e.clientX - r.left) / r.width) * span))));
  };
  const tipX = Math.min(W - pad.right - 150, Math.max(pad.left, x(i) + 10));
  return (
    <div ref={ref} className="hq-pace">
      <svg className="hq-chart" viewBox={`0 0 ${W} ${h}`} width={W} height={h} role="img" aria-label={`Money this month: ${format(upto[upto.length - 1] ?? 0)} by day ${today}, against ${format(last[Math.min(today, last.length) - 1] ?? 0)} by the same day last month`}>
        {[0, max / 2, max].map((t) => (
          <g key={t}>
            <line className="grid" x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} />
            <text x={pad.left - 8} y={y(t) + 4} textAnchor="end">{format(t)}</text>
          </g>
        ))}
        {goal ? <line className="goal" x1={x(0)} y1={y(0)} x2={x(days - 1)} y2={y(goal)} /> : null}
        {last.length ? <path className="last" d={path(last)} /> : null}
        {area ? <path className="area area--accent" d={area} /> : null}
        {upto.length ? <path className="line line--accent" d={path(upto)} /> : null}
        {upto.length ? <circle className="dot dot--accent" cx={x(upto.length - 1)} cy={y(upto[upto.length - 1])} r={4.5} /> : null}
        <line className="cross" x1={x(i)} x2={x(i)} y1={pad.top} y2={pad.top + ih} data-on={hover !== null} />
        <text x={pad.left} y={h - 4}>1</text>
        <text x={x(today - 1)} y={h - 4} textAnchor="middle">Today</text>
        <text x={W - pad.right} y={h - 4} textAnchor="end">{days}</text>
        <rect x={pad.left} y={pad.top} width={iw} height={ih} fill="transparent" onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHover(null)} style={{ touchAction: "pan-y" }} />
        {hover !== null ? (
          <g className="tip" transform={`translate(${tipX},${pad.top + 4})`} pointerEvents="none">
            <rect width={150} height={goal ? 72 : 56} rx={6} />
            <text x={10} y={18} className="tip__h">Day {i + 1}</text>
            {i < today ? <text x={10} y={35}><tspan className="k k--accent">●</tspan> This month {format(month[i])}</text> : <text x={10} y={35}>Not here yet</text>}
            <text x={10} y={50}><tspan className="k">●</tspan> Last month {format(last[Math.min(i, last.length - 1)] ?? 0)}</text>
            {goal ? <text x={10} y={65}><tspan className="k">–</tspan> Goal pace {format(Math.round((goal * i) / (days - 1)))}</text> : null}
          </g>
        ) : null}
      </svg>
      <p className="hq-legend">
        <span><i data-k="this" /> This month</span>
        <span><i data-k="last" /> Last month</span>
        {goal ? <span><i data-k="goal" /> Pace to the goal</span> : null}
      </p>
    </div>
  );
}
