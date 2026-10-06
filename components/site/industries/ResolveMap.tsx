"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type ResolveService = {
  slug: string;
  route: string;
  title: string;
  summary: string;
  island: { id: string; index: string; name: string };
};

type Wire = { from: number; to: number; d: string };

const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Friction on the left, the service that usually addresses it first on the
 * right, and a rust line between them that draws as you scroll — each friction
 * struck through as its line lands. The pairing is written out under every
 * friction too, so the connection never depends on the drawing.
 */
export function ResolveMap({
  challenges,
  routes,
  services,
}: {
  challenges: string[];
  routes: number[][];
  services: ResolveService[];
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [wires, setWires] = useState<Wire[]>([]);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [hot, setHot] = useState<{ side: "c" | "s"; i: number } | null>(null);

  const measure = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      setWires([]);
      return;
    }
    const g = grid.getBoundingClientRect();
    const cPorts = grid.querySelectorAll<HTMLElement>("[data-cport]");
    const sPorts = grid.querySelectorAll<HTMLElement>("[data-sport]");
    const at = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 - g.left, y: r.top + r.height / 2 - g.top };
    };
    const next: Wire[] = [];
    routes.forEach((targets, from) => {
      const a = at(cPorts[from]);
      targets.forEach((to) => {
        const b = at(sPorts[to]);
        const dx = b.x - a.x;
        next.push({
          from,
          to,
          d: `M${a.x.toFixed(1)} ${a.y.toFixed(1)}C${(a.x + dx * 0.55).toFixed(1)} ${a.y.toFixed(1)} ${(b.x - dx * 0.55).toFixed(1)} ${b.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`,
        });
      });
    });
    setBox({ w: g.width, h: g.height });
    setWires(next);
  }, [routes]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(grid);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [measure]);

  // Scroll-scrubbed resolution, one tween per element.
  useIso(() => {
    const grid = gridRef.current;
    if (!grid || !wires.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      grid.classList.add("is-resolved");
      return;
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: grid, start: "top 72%", end: "bottom 62%", scrub: 0.6 },
      });
      challenges.forEach((_, i) => {
        const at = i * 1;
        grid.querySelectorAll<SVGPathElement>(`.rs-wire[data-from="${i}"]`).forEach((p) => {
          tl.fromTo(p, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8, ease: "none" }, at);
        });
        const strike = grid.querySelector(`[data-strike="${i}"]`);
        if (strike) tl.fromTo(strike, { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power1.out" }, at + 0.55);
        const text = grid.querySelector(`[data-ctext="${i}"]`);
        if (text) tl.fromTo(text, { opacity: 1 }, { opacity: 0.55, duration: 0.35 }, at + 0.55);
        routes[i].forEach((to) => {
          const port = grid.querySelector(`[data-sport="${to}"]`);
          if (port) tl.to(port, { scale: 1.6, backgroundColor: "#c4531c", duration: 0.2 }, at + 0.75);
        });
      });
    }, grid);
    return () => ctx.revert();
  }, [wires, challenges, routes]);

  // Phones and tablets: each friction drops its own rust line into the
  // service that answers it, scrubbed by scroll, no pinning.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const mm = gsap.matchMedia();
    mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
      grid.querySelectorAll<HTMLElement>(".rs-c").forEach((li) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: li, start: "top 88%", end: "top 48%", scrub: 0.5 },
        });
        const wire = li.querySelector("[data-wire]");
        const strike = li.querySelector("[data-strike]");
        const text = li.querySelector("[data-ctext]");
        const to = li.querySelector("[data-to]");
        if (wire) tl.fromTo(wire, { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: "none" }, 0);
        if (strike) tl.fromTo(strike, { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power1.out" }, 0.35);
        if (text) tl.fromTo(text, { opacity: 1 }, { opacity: 0.62, duration: 0.3 }, 0.4);
        if (to) tl.fromTo(to, { opacity: 0.25, y: -8 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, 0.45);
      });
    });
    return () => mm.revert();
  }, []);

  const isHot = (w: Wire) => hot && (hot.side === "c" ? w.from === hot.i : w.to === hot.i);
  const cHot = (i: number) => hot && (hot.side === "c" ? hot.i === i : routes[i].includes(hot.i));
  const sHot = (j: number) => hot && (hot.side === "s" ? hot.i === j : routes[hot.i].includes(j));

  return (
    <div className={`rs${hot ? " has-hot" : ""}`} ref={gridRef}>
      {wires.length ? (
        <svg className="rs-wires" width={box.w} height={box.h} viewBox={`0 0 ${box.w} ${box.h}`} aria-hidden="true">
          {wires.map((w) => (
            <path
              key={`${w.from}-${w.to}`}
              className={`rs-wire${isHot(w) ? " is-hot" : ""}`}
              data-from={w.from}
              d={w.d}
              pathLength={1}
            />
          ))}
        </svg>
      ) : null}

      <div className="rs-col rs-col--c">
        <p className="rs-label mono">Friction we hear</p>
        <ol className="rs-list">
          {challenges.map((c, i) => (
            <li
              key={c}
              className={`rs-c${cHot(i) ? " is-hot" : ""}`}
              onPointerEnter={() => setHot({ side: "c", i })}
              onPointerLeave={() => setHot(null)}
            >
              <span className="index">{String(i + 1).padStart(2, "0")}</span>
              <span className="rs-c__body">
                <span className="rs-c__text">
                  <span data-ctext={i}>{c}</span>
                  <span className="rs-c__strike" data-strike={i} aria-hidden="true" />
                </span>
                <span className="rs-c__wire" data-wire={i} aria-hidden="true" />
                <span className="rs-c__to" data-to={i}>
                  <span className="rs-c__arrow" aria-hidden="true">→</span>
                  <span className="visually-hidden">Usually addressed by </span>
                  {routes[i].map((t, k) => (
                    <span key={t} className={`rs-pill isle-${services[t].island.id}`}>
                      {services[t].title}
                      {k < routes[i].length - 1 ? <span className="visually-hidden"> and </span> : null}
                    </span>
                  ))}
                </span>
              </span>
              <span className="rs-port" data-cport={i} aria-hidden="true" />
            </li>
          ))}
        </ol>
      </div>

      <div className="rs-col rs-col--s">
        <p className="rs-label mono">Where we would start</p>
        <ol className="rs-list">
          {services.map((s, j) => (
            <li key={s.slug} className={`rs-s${sHot(j) ? " is-hot" : ""}`}>
              <Link
                href={s.route}
                className="rs-s__link"
                onPointerEnter={() => setHot({ side: "s", i: j })}
                onPointerLeave={() => setHot(null)}
                onFocus={() => setHot({ side: "s", i: j })}
                onBlur={() => setHot(null)}
              >
                <span className="rs-port" data-sport={j} aria-hidden="true" />
                <span className={`rs-s__isle isle-${s.island.id}`}>
                  {s.island.index} · {s.island.name}
                </span>
                <span className="rs-s__title">{s.title}</span>
                <span className="rs-s__summary">{s.summary}</span>
                <span className="rs-s__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
