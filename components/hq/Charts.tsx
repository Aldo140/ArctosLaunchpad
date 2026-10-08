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
