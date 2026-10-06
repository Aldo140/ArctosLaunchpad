"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { contours, levelsFor, lerpField, makeField, sample, type Field } from "./terrain";

export type AtlasItem = {
  slug: string;
  title: string;
  challenges: string[];
  count: number;
  work: {
    title: string;
    status: string;
    poster?: string;
    phone?: string;
    accent?: string;
  } | null;
};

/* The panel's own bridge, in a 1000 × 700 box. Same three stops as everywhere. */
const BRIDGE = "M110 590C270 560 330 400 470 360S760 300 880 130";
const NODES = [
  { x: 110, y: 590, label: "01 Win" },
  { x: 470, y: 360, label: "02 Run" },
  { x: 880, y: 130, label: "03 See" },
];

const LEVELS = 13;
const CYCLE_MS = 3600;
const MORPH_MS = 950;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * The atlas: one contour field per industry, morphing as a row is hovered,
 * focused or scrolled past. The bridge on top never moves. The panel is a
 * picture of the list beside it, so it is hidden from assistive tech and
 * holds nothing focusable; every fact in it is on the industry's own page.
 */
export function AtlasPanel({ items }: { items: AtlasItem[] }) {
  const [active, setActive] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const fields = useMemo(() => items.map((it) => makeField(it.slug)), [items]);
  const fieldsRef = useRef<Field[]>(fields);
  const stateRef = useRef({ from: fields[0], to: fields[0], t0: 0, cur: fields[0] });
  const drawRef = useRef<(f: Field) => void>(() => {});
  const rafRef = useRef(0);
  const reduceRef = useRef(false);
  const stateIndex = useRef(0);

  useEffect(() => {
    stateIndex.current = active;
    document.querySelectorAll<HTMLElement>("[data-atlas-row]").forEach((row) => {
      row.classList.toggle("is-lit", Number(row.dataset.atlasRow) === active);
    });
  }, [active]);

  // Canvas renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    reduceRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;

    const draw = (field: Field) => {
      if (!w || !h) return;
      const cell = w < 520 ? 7 : 8;
      const cols = Math.max(12, Math.round(w / cell) + 1);
      const rows = Math.max(10, Math.round(h / cell) + 1);
      const grid = sample(field, cols, rows, w / h);
      const levels = levelsFor(grid, LEVELS);
      const lines = contours(grid, cols, rows, levels, w, h);
      ctx.clearRect(0, 0, w, h);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      lines.forEach((set, lv) => {
        const k = lv / (LEVELS - 1);
        const major = lv % 4 === 3;
        // low ground reads pine, high ground reads paper
        const r = Math.round(143 + (241 - 143) * k);
        const g = Math.round(179 + (235 - 179) * k);
        const b = Math.round(164 + (223 - 164) * k);
        ctx.strokeStyle = `rgba(${r},${g},${b},${major ? 0.62 : 0.2 + k * 0.22})`;
        ctx.lineWidth = major ? 1.35 : 0.85;
        ctx.beginPath();
        for (const { pts, closed } of set) {
          const n = pts.length / 2;
          if (n < 3) continue;
          ctx.moveTo(pts[0], pts[1]);
          for (let i = 1; i < n - 1; i++) {
            const cx = pts[2 * i];
            const cy = pts[2 * i + 1];
            ctx.quadraticCurveTo(cx, cy, (cx + pts[2 * i + 2]) / 2, (cy + pts[2 * i + 3]) / 2);
          }
          ctx.lineTo(pts[2 * n - 2], pts[2 * n - 1]);
          if (closed) ctx.closePath();
        }
        ctx.stroke();
      });
    };
    drawRef.current = draw;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(stateRef.current.cur);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Morph to the active industry
  useEffect(() => {
    const s = stateRef.current;
    const target = fieldsRef.current[active];
    if (reduceRef.current) {
      s.cur = target;
      drawRef.current(target);
      return;
    }
    s.from = s.cur;
    s.to = target;
    s.t0 = performance.now();
    cancelAnimationFrame(rafRef.current);
    const tick = (now: number) => {
      const t = Math.min(1, (now - s.t0) / MORPH_MS);
      s.cur = lerpField(s.from, s.to, ease(t));
      drawRef.current(s.cur);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [active]);

  // Inputs: hover / focus a row, scroll past rows (desktop), gentle cycle otherwise
  useEffect(() => {
    const rows = Array.from(document.querySelectorAll<HTMLElement>("[data-atlas-row]"));
    const root = rootRef.current;
    if (!root || !rows.length) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wide = window.matchMedia("(min-width: 1024px)");
    let lastInput = 0;
    let hovering = false;
    let visible = false;
    const pick = (i: number) => {
      lastInput = performance.now();
      setActive(i);
    };
    const offs: (() => void)[] = [];
    rows.forEach((row) => {
      const i = Number(row.dataset.atlasRow);
      const enter = () => {
        hovering = true;
        pick(i);
        row.classList.add("is-active");
      };
      const leave = () => {
        hovering = false;
        row.classList.remove("is-active");
      };
      const focus = () => pick(i);
      row.addEventListener("pointerenter", enter);
      row.addEventListener("pointerleave", leave);
      row.addEventListener("focus", focus);
      offs.push(() => {
        row.removeEventListener("pointerenter", enter);
        row.removeEventListener("pointerleave", leave);
        row.removeEventListener("focus", focus);
      });
    });

    // Scroll-spy: the row crossing the reading line leads. On wide screens the
    // line sits at 45% of the viewport; on phones and tablets the map is a
    // sticky band, so the line sits just below it.
    let spyOn = false;
    const onScroll = () => {
      if (hovering) return;
      const vh = window.innerHeight;
      const line = wide.matches
        ? vh * 0.45
        : Math.min(vh * 0.8, root.getBoundingClientRect().bottom + (vh - root.getBoundingClientRect().bottom) * 0.3);
      const first = rows[0].getBoundingClientRect();
      const last = rows[rows.length - 1].getBoundingClientRect();
      spyOn = first.top < line && last.bottom > 0;
      if (!spyOn) return;
      let best = 0;
      rows.forEach((row, i) => {
        if (row.getBoundingClientRect().top < line) best = i;
      });
      if (best !== stateIndex.current) pick(best);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.2 });
    io.observe(root);

    const timer = reduce
      ? 0
      : window.setInterval(() => {
          if (!visible || hovering || spyOn || document.hidden) return;
          if (performance.now() - lastInput < 7000) return;
          setActive((a) => (a + 1) % rows.length);
        }, CYCLE_MS);

    return () => {
      offs.forEach((off) => off());
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  // Depth: the project card tilts toward the pointer
  useEffect(() => {
    const root = rootRef.current;
    const card = cardRef.current;
    if (!root || !card) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const move = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty("--rx", `${(-y * 10).toFixed(2)}deg`);
      card.style.setProperty("--ry", `${(x * 14).toFixed(2)}deg`);
    };
    const reset = () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", reset);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", reset);
    };
  }, []);

  const item = items[active];

  return (
    <div className="atlas" ref={rootRef} aria-hidden="true">
      <div className="atlas__map">
        <canvas ref={canvasRef} className="atlas__canvas" />
        <svg className="atlas__bridge" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet">
          <path className="atlas__deck-shadow" d={BRIDGE} />
          <path className="atlas__deck" d={BRIDGE} />
          {NODES.map((n, i) => (
            <g key={n.label} transform={`translate(${n.x} ${n.y})`}>
              <circle className="atlas__ring" r="18" />
              <circle className="atlas__dot" r="6" />
              <text x={i === 2 ? -28 : 28} y={i === 2 ? -22 : 6} textAnchor={i === 2 ? "end" : "start"}>
                {n.label}
              </text>
            </g>
          ))}
        </svg>
        <div className="atlas__plate">
          <span className="atlas__no">
            Terrain {String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
          </span>
          <span className="atlas__legend">Contours generated from the industry name</span>
        </div>
        <div className="atlas__caption">
          <span className="atlas__cap-name" key={item.slug}>
            {item.title}
          </span>
          <span className="atlas__cap-work">
            {item.work ? `${item.work.title} · ${item.work.status}` : "No case study yet"}
          </span>
        </div>
        <div className="atlas__ticks">
          {items.map((it, i) => (
            <span key={it.slug} className={i === active ? "is-on" : undefined} />
          ))}
        </div>
      </div>

      <div className="atlas__readout">
        <div className="atlas__text" key={item.slug}>
          <p className="atlas__name">{item.title}</p>
          <ul className="atlas__challenges">
            {item.challenges.map((c, i) => (
              <li key={c} style={{ "--i": i } as CSSProperties}>
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div className="atlas__work" ref={cardRef}>
          {items.map((it, i) =>
            it.work ? (
              <figure
                key={it.slug}
                className={`atlas__card${i === active ? " is-on" : ""}`}
                style={{ "--plate": it.work.accent ?? "var(--ink-3)" } as CSSProperties}
              >
                <div className="atlas__stage">
                  {it.work.poster ? (
                    <Image
                      className="atlas__poster"
                      src={it.work.poster}
                      alt=""
                      width={640}
                      height={341}
                      sizes="(max-width: 1023px) 70vw, 300px"
                    />
                  ) : (
                    <span className="atlas__typeset">{it.work.title}</span>
                  )}
                  {it.work.phone ? (
                    <Image
                      className="atlas__phone"
                      src={it.work.phone}
                      alt=""
                      width={390}
                      height={844}
                      sizes="90px"
                    />
                  ) : null}
                </div>
                <figcaption>
                  <span>{it.work.title}</span>
                  <span>{it.work.status}</span>
                </figcaption>
              </figure>
            ) : null,
          )}
          {!item.work ? (
            <p className="atlas__empty">
              No case study in this terrain yet. The bridge is the same; discovery maps the ground.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
