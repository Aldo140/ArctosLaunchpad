"use client";

import { useState } from "react";

/* Line icons, drawn on a 24px grid with a 1.6 stroke so they sit with Archivo. */
const PATHS: Record<string, string> = {
  overview: "M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z",
  inbox: "M4 13l2.5-7h11L20 13M4 13v6h16v-6M4 13h5l1 2h4l1-2h5",
  instagram: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM17.3 6.7h.01",
  inspiration: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z",
  pipelines: "M3 5h18l-7 8v6l-4 2v-8z",
  tasks: "M4 6l1.5 1.5L8 5M4 12l1.5 1.5L8 11M4 18l1.5 1.5L8 17M11 6h9M11 12h9M11 18h9",
  performance: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  health: "M3 12h4l2-6 4 12 2-6h6",
  glossary: "M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  refresh: "M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7",
  out: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10",
  external: "M14 4h6v6M20 4l-9 9M18 14v6H4V6h6",
};

export function Icon({ name, title }: { name: keyof typeof PATHS | string; title?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden={title ? undefined : true} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <path d={PATHS[name] ?? PATHS.more} />
    </svg>
  );
}

/** A post image at Instagram's 4:5, with a quiet fallback when the link has expired. */
export function Thumb({ src, alt, tag }: { src: string | null | undefined; alt: string; tag?: string }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className="hq-thumb">
      {src && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote Instagram and GitHub media, sized by CSS
        <img src={src} alt={alt} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setBroken(true)} />
      ) : (
        <span className="hq-thumb__empty">{src ? "Image link expired" : "No image"}</span>
      )}
      {tag ? <span className="hq-thumb__tag"><span className="hq-chip">{tag}</span></span> : null}
    </div>
  );
}

export function Stat({ value, label, delta, dir }: { value: React.ReactNode; label: string; delta?: string; dir?: "up" | "down" | "flat" }) {
  return (
    <div className="hq-stat">
      <b>{value}</b>
      <span>{label}</span>
      {delta ? <small data-dir={dir}>{delta}</small> : null}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="hq-empty">
      <b>{title}</b>
      {children ? <span>{children}</span> : null}
    </div>
  );
}

/** A tiny trend line with no axes, for a number's recent direction. */
export function Spark({ values, label }: { values: number[]; label: string }) {
  if (values.length < 2) return null;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * 100, 34 - ((v - lo) / span) * 30]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join("");
  return (
    <svg className="hq-spark" viewBox="0 0 100 38" preserveAspectRatio="none" role="img" aria-label={label}>
      <path className="area" d={`${line}L100,38L0,38Z`} />
      <path className="line" d={line} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function Section({ title, eyebrow, action, children }: { title: string; eyebrow?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="hq-card">
      <div className="hq-card__head">
        <div>
          {eyebrow ? <p className="hq-eyebrow">{eyebrow}</p> : null}
          <h2 className="hq-h2">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
