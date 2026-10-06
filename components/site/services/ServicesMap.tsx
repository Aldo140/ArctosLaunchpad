"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { gsap } from "gsap";
import type { IslandId } from "@/lib/content";
import Link from "next/link";
import { Lines, d } from "../ui";
import { goToIsland } from "./scrollTo";

export type MapIsland = {
  id: IslandId;
  index: string;
  name: string;
  symptom: string;
  promise: string;
  services: string[];
};

/** The bridge deck in bridge.webp's own 1536×1024 space (shared with the home hero). */
const DECK =
  "M 214 640 C 300 650 360 560 420 512 C 448 490 470 476 500 470 L 700 441 L 760 432 L 905 470 L 1135 486 C 1180 500 1222 560 1262 612 C 1280 634 1300 646 1330 650";
const STOP: Record<IslandId, number> = { win: 0, run: 0.5, see: 1 };

/** Each island-*.webp is an exact 1:1 crop of bridge.webp at these offsets (measured). */
const CROP: Record<IslandId, { x: number; y: number; w: number; h: number }> = {
  win: { x: 0, y: 370, w: 440, h: 470 },
  run: { x: 560, y: 100, w: 600, h: 840 },
  see: { x: 1180, y: 460, w: 356, h: 400 },
};

/** Hit areas (the rock of each island) and label anchors, as % of the plane. */
const HIT: Record<IslandId, { l: number; t: number; w: number; h: number }> = {
  win: { l: 0, t: 36, w: 25, h: 42 },
  run: { l: 38, t: 60, w: 31, h: 29 },
  see: { l: 79, t: 46, w: 21, h: 36 },
};
const PIN: Record<IslandId, { x: number; y: number }> = {
  win: { x: 12, y: 82 },
  run: { x: 53, y: 92 },
  see: { x: 85, y: 84 },
};

const pct = (n: number, of: number) => `${(n / of) * 100}%`;

export function ServicesMap({ islands }: { islands: MapIsland[] }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<IslandId | null>(null);
  const travel = useRef<(id: IslandId | null) => void>(() => {});

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const deck = el.querySelector<SVGPathElement>(".svx-map__deck");
    const trail = el.querySelector<SVGPathElement>(".svx-map__trail");
    const signal = el.querySelector<SVGCircleElement>(".svx-map__signal");
    if (!deck || !trail || !signal) return;
    const length = deck.getTotalLength();
    const state = { p: 0 };
    const draw = () => {
      const pt = deck.getPointAtLength(length * state.p);
      signal.setAttribute("cx", String(pt.x));
      signal.setAttribute("cy", String(pt.y));
      trail.style.strokeDasharray = `${length}`;
      trail.style.strokeDashoffset = `${length * (1 - state.p)}`;
    };

    if (reduce) {
      state.p = 1;
      draw();
      travel.current = (id) => {
        state.p = id ? STOP[id] : 1;
        draw();
      };
      el.querySelector(".svx-map")?.classList.add("is-live");
      return;
    }

    let idle: gsap.core.Tween | null = null;
    const ctx = gsap.context(() => {
      el.querySelector(".svx-map")?.classList.add("is-live");
      const tl = gsap.timeline({ delay: 0.15 });
      tl.fromTo(
        ".svx-map__crop",
        {
          opacity: 0,
          y: (n: number) => 120 + n * 30,
          rotation: (n: number) => [-4, 2, 5][n] ?? 0,
        },
        {
          opacity: 1,
          y: 0,
          rotation: 0,
          duration: 1.5,
          ease: "expo.out",
          stagger: 0.16,
        },
      )
        .set(".svx-map__crop", { clearProps: "transform" })
        .fromTo(
          ".svx-map__base",
          { opacity: 0 },
          { opacity: 1, duration: 0.9, ease: "power2.out", clearProps: "opacity" },
          1.1,
        )
        .to(".svx-map__crop", { opacity: 0, duration: 0.5, clearProps: "opacity" }, 1.9)
        .fromTo(
          ".svx-pin",
          { opacity: 0 },
          { opacity: 1, stagger: 0.12, duration: 0.7, ease: "power2.out", clearProps: "opacity" },
          1.3,
        )
        .fromTo(
          ".svx-map__card",
          { opacity: 0, x: 30 },
          { opacity: 1, x: 0, duration: 0.9, ease: "expo.out", clearProps: "all" },
          1.4,
        )
        .to(
          state,
          { p: 1, duration: 2.4, ease: "power1.inOut", onUpdate: draw },
          1.5,
        );

      const startIdle = () => {
        idle?.kill();
        idle = gsap.fromTo(
          state,
          { p: 0 },
          {
            p: 1,
            duration: 4.2,
            ease: "power1.inOut",
            repeat: -1,
            repeatDelay: 1.6,
            onUpdate: draw,
          },
        );
      };
      tl.call(startIdle);

      travel.current = (id) => {
        tl.progress(1);
        idle?.kill();
        if (id === null) {
          startIdle();
          return;
        }
        gsap.to(state, {
          p: STOP[id],
          duration: 0.9,
          ease: "power3.inOut",
          onUpdate: draw,
          overwrite: true,
        });
      };

      // Pointer tilt: the map leans toward the cursor, a small, slow 3D move.
      if (window.matchMedia("(pointer: fine)").matches) {
        const stage = el.querySelector<HTMLElement>(".svx-map__stage");
        if (stage) {
          const rx = gsap.quickTo(stage, "rotationX", {
            duration: 1.2,
            ease: "power3.out",
          });
          const ry = gsap.quickTo(stage, "rotationY", {
            duration: 1.2,
            ease: "power3.out",
          });
          const move = (e: PointerEvent) => {
            const r = stage.getBoundingClientRect();
            ry(((e.clientX - r.left) / r.width - 0.5) * 7);
            rx(-((e.clientY - r.top) / r.height - 0.5) * 5);
          };
          const leave = () => {
            rx(0);
            ry(0);
          };
          el.addEventListener("pointermove", move);
          el.addEventListener("pointerleave", leave);
          return () => {
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerleave", leave);
          };
        }
      }
    }, el);

    return () => {
      idle?.kill();
      ctx.revert();
    };
  }, []);

  // Leaving is debounced so the bobbing map can't flicker the preview.
  const last = useRef<IslandId | null>(null);
  const leaveTimer = useRef<number | undefined>(undefined);
  const preview = useCallback((id: IslandId | null) => {
    window.clearTimeout(leaveTimer.current);
    const apply = () => {
      if (last.current === id) return;
      last.current = id;
      setActive(id);
      travel.current(id);
    };
    if (id === null) leaveTimer.current = window.setTimeout(apply, 260);
    else apply();
  }, []);

  // Touch screens have no hover, so the map tours itself while it is on
  // screen: each island lifts in turn and the signal walks the deck to it.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const touch = window.matchMedia("(hover: none)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!touch || reduce) return;
    const order = islands.map((i) => i.id);
    let n = 0;
    let timer: number | undefined;
    const tick = () => {
      preview(order[n % order.length]);
      n += 1;
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        window.clearInterval(timer);
        if (entry.isIntersecting) {
          timer = window.setInterval(tick, 2600);
        }
      },
      { threshold: 0.35 },
    );
    const start = window.setTimeout(() => io.observe(el), 3200);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(timer);
      io.disconnect();
    };
  }, [islands, preview]);

  const go = (id: IslandId) => (e: MouseEvent) => {
    e.preventDefault();
    goToIsland(id);
  };

  const current = islands.find((i) => i.id === active);

  return (
    <section
      ref={root}
      className={`svx-hero tone-ink${active ? ` is-${active}` : ""}`}
      data-tone="ink"
      aria-labelledby="svx-title"
    >
      <div className="svx-hero__sea" aria-hidden="true">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <path key={`h${n}`} d={`M 0 ${100 * n + 50} H 1440`} />
          ))}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => (
            <path key={`v${n}`} d={`M ${120 * n + 60} 0 V 900`} />
          ))}
        </svg>
      </div>

      <div className="wrap svx-hero__grid">
        <div className="svx-hero__copy">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <span aria-current="page">Services</span>
              </li>
            </ol>
          </nav>
          <div className="svx-hero__heading">
            <p className="eyebrow" data-reveal>
              What we build
            </p>
            <Lines
              as="h1"
              id="svx-title"
              className="display svx-hero__title"
              lines={["Three islands.", <em key="b">One bridge.</em>]}
            />
          </div>
          <p className="lead svx-hero__lead" data-reveal style={d(2)}>
            Every service sits on one of three islands. Start with the one that
            hurts, and we’ll connect it to the others as the business needs it.
          </p>
          <div className="svx-map__card" aria-hidden="true">
            {current ? (
              <div key={current.id} className="svx-map__cardin">
                <p className="mono svx-map__k">
                  Island {current.index} · {current.services.length} services
                </p>
                <p className="svx-map__name">{current.name}</p>
                <p className="svx-map__sym">{current.symptom}</p>
                <ul className="svx-map__svcs">
                  {current.services.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                <p className="mono svx-map__go">Click to explore ↓</p>
              </div>
            ) : (
              <div key="idle" className="svx-map__cardin">
                <p className="mono svx-map__k">The map</p>
                <p className="svx-map__name">Pick the island that hurts.</p>
                <ul className="svx-map__legend">
                  {islands.map((island) => (
                    <li key={island.id}>
                      <span className="index">{island.index}</span>{" "}
                      {island.name}
                      <span className="svx-map__count">
                        {island.services.length}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mono svx-map__go">
                  Hover an island to preview it
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="svx-map">
          <div className="svx-map__stage">
            <div className="svx-map__plane" onMouseLeave={() => preview(null)}>
              <Image
                className="svx-map__base"
                src="/assets/art/bridge.webp"
                alt="A polar bear setting the last plank of a rust-red bridge that joins three floating islands."
                width={1536}
                height={1024}
                priority
                sizes="(max-width: 900px) 100vw, 80vw"
              />
              {islands.map((island) => {
                const c = CROP[island.id];
                return (
                  <Image
                    key={island.id}
                    className={`svx-map__crop svx-map__crop--${island.id}${active === island.id ? " is-on" : ""}`}
                    src={`/assets/art/island-${island.id}.webp`}
                    alt=""
                    aria-hidden="true"
                    width={c.w}
                    height={c.h}
                    sizes="40vw"
                    style={{
                      left: pct(c.x, 1536),
                      top: pct(c.y, 1024),
                      width: pct(c.w, 1536),
                    }}
                  />
                );
              })}
              <svg
                className="svx-map__route"
                viewBox="0 0 1536 1024"
                aria-hidden="true"
              >
                <path className="svx-map__deck" d={DECK} />
                <path className="svx-map__trail" d={DECK} />
                <circle className="svx-map__halo" r="22" cx="214" cy="640" />
                <circle className="svx-map__signal" r="9" cx="214" cy="640" />
              </svg>
              {islands.map((island) => {
                const h = HIT[island.id];
                return (
                  <div
                    key={island.id}
                    className="svx-map__hit"
                    aria-hidden="true"
                    style={{
                      left: `${h.l}%`,
                      top: `${h.t}%`,
                      width: `${h.w}%`,
                      height: `${h.h}%`,
                    }}
                    onMouseEnter={() => preview(island.id)}
                    onClick={() => goToIsland(island.id)}
                  />
                );
              })}
              <nav className="svx-pins" aria-label="Jump to an island">
                {islands.map((island) => (
                  <a
                    key={island.id}
                    href={`#${island.id}`}
                    className={`svx-pin svx-pin--${island.id}${active === island.id ? " is-on" : ""}`}
                    style={
                      {
                        left: `${PIN[island.id].x}%`,
                        top: `${PIN[island.id].y}%`,
                      } as CSSProperties
                    }
                    onMouseEnter={() => preview(island.id)}
                    onFocus={() => preview(island.id)}
                    onBlur={() => preview(null)}
                    onClick={go(island.id)}
                  >
                    <span className="svx-pin__dot" aria-hidden="true" />
                    <span className="svx-pin__idx">{island.index}</span>
                    <span className="svx-pin__name">{island.name}</span>
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      <ul className="wrap svx-hero__list">
        {islands.map((island) => (
          <li key={island.id} data-on={active === island.id ? "true" : undefined}>
            <a href={`#${island.id}`} onClick={go(island.id)}>
              <span className="index">{island.index}</span>
              <span className="svx-hero__lname">{island.name}</span>
              <span className="svx-hero__lsym">{island.symptom}</span>
              <span className="svx-hero__larr" aria-hidden="true">
                ↓
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
