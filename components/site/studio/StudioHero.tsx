"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import type { ReactNode } from "react";
import { d } from "../ui";

gsap.registerPlugin(ScrollTrigger, SplitText, MotionPathPlugin);

/* Positions are in the painting's own pixels (1536 × 1024), so every layer
   stays registered to the art at any size. */
const GEARS = [
  { src: "gear-a", left: 791, top: 518, size: 98, turn: 1 },
  { src: "gear-b", left: 860, top: 619, size: 62, turn: -1.58 },
  { src: "pulley-a", left: 953, top: 582, size: 46, turn: 2.2 },
  { src: "pulley-b", left: 1111, top: 693, size: 48, turn: 2.1 },
];

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

/** Hand to hopper, then down the belt, then onto the finished stack. */
const PATH_IN = "M 676 338 C 722 292 782 322 804 436";
const PATH_BELT = "M 872 452 L 1214 676";
const PATH_OUT = "M 1214 676 Q 1290 572 1356 594";

/* Deterministic specks so the server and client agree. */
const SPECKS = Array.from({ length: 46 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  const q = (v: number) => Math.round(v * 100) / 100;
  return { x: q(r(1) * 100), y: q(r(2) * 100), s: q(1 + r(3) * 2.4), rust: r(4) > 0.7, o: q(0.25 + r(5) * 0.5) };
});

function Paper({ id }: { id: string }) {
  return (
    <g className="st-paper" id={id} opacity="0">
      <g transform="translate(-34 -22)">
        <rect width="68" height="44" rx="1.5" fill="#ebe2cf" stroke="#3d3a33" strokeWidth="1.4" />
        <path d="M10 11 H52 M10 18 H56 M10 25 H48 M10 32 H40" stroke="#5f5a4f" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    </g>
  );
}

export function StudioHero({ crumbs }: { crumbs: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      const title = el.querySelector<HTMLElement>(".st-hero__title");
      // Kinetic headline: "Good thinking." arrives like loose papers;
      // "Useful things." lands in order, the way the machine stacks them.
      if (title) {
        const [l1, l2] = Array.from(title.querySelectorAll<HTMLElement>(".st-hero__ln"));
        const s1 = new SplitText(l1, { type: "chars", charsClass: "st-ch" });
        const s2 = new SplitText(l2, { type: "chars", charsClass: "st-ch" });
        gsap.set(title, { autoAlpha: 1 });
        const tl = gsap.timeline({ delay: 0.15 });
        tl.from(s1.chars, {
          yPercent: () => gsap.utils.random(-140, -60),
          xPercent: () => gsap.utils.random(-40, 40),
          rotation: () => gsap.utils.random(-28, 28),
          opacity: 0,
          duration: 1.05,
          ease: "back.out(1.4)",
          stagger: { each: 0.035, from: "random" },
        })
          .from(
            s2.chars,
            { xPercent: -80, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.04 },
            "-=0.45",
          )
          .from(el.querySelector(".st-hero__rule"), { scaleX: 0, duration: 1, ease: "power3.inOut" }, "-=0.4");
      }

      // The machine runs: gears turn, papers fly from the paw to the stack.
      const spin = GEARS.map((g, i) =>
        gsap.to(el.querySelectorAll(".st-gear")[i], {
          rotation: 360 * Math.sign(g.turn),
          duration: 9 / Math.abs(g.turn),
          ease: "none",
          repeat: -1,
        }),
      );
      const papers = gsap.utils.toArray<SVGGElement>(".st-paper", el);
      const loops = papers.map((p, i) => {
        const tl = gsap.timeline({ repeat: -1, delay: i * 0.95, repeatDelay: 0.25 });
        tl.set(p, { opacity: 1, scale: 1 })
          .to(p, {
            duration: 1.1,
            ease: "power1.in",
            motionPath: { path: PATH_IN, autoRotate: true },
          })
          .to(p, { opacity: 0, duration: 0.12 }, "-=0.18")
          .set(p, { opacity: 0 })
          .to(p, { duration: 0.35 })
          .to(p, { opacity: 1, duration: 0.2 })
          .to(p, { duration: 2.1, ease: "none", motionPath: { path: PATH_BELT, autoRotate: true } }, "<")
          .to(p, { duration: 0.55, ease: "power2.out", motionPath: { path: PATH_OUT, autoRotate: false }, rotation: 0 })
          .to(p, { scaleY: 0.2, opacity: 0, duration: 0.25 });
        return tl;
      });
      const all = [...spin, ...loops];
      ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => all.forEach((t) => (self.isActive ? t.resume() : t.pause())),
      });

      // Depth: each plane drifts at its own rate as the page scrolls.
      const planes: [string, number][] = [
        [".st-hero__dust", -60],
        [".st-hero__stage", -110],
        [".st-hero__fly", -190],
        [".st-hero__near", -360],
      ];
      planes.forEach(([sel, y]) =>
        gsap.to(el.querySelector(sel), {
          y,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
        }),
      );

      // Phones: the painting is cropped to the bear, so the camera pans along
      // the machine as you scroll, following the papers to the finished stack.
      if (window.matchMedia("(max-width: 760px)").matches) {
        const stage = el.querySelector<HTMLElement>(".st-hero__stage");
        if (stage) {
          gsap.fromTo(
            stage,
            { x: 0 },
            {
              x: () => {
                return Math.min(0, el.clientWidth - (stage.offsetLeft + stage.offsetWidth) + 4);
              },
              ease: "none",
              scrollTrigger: {
                trigger: stage,
                start: "top 72%",
                end: "bottom 62%",
                scrub: 0.5,
                invalidateOnRefresh: true,
              },
            },
          );
        }
      }

      // Pointer depth on fine pointers only.
      if (window.matchMedia("(pointer: fine)").matches) {
        const depth: [string, number][] = [
          [".st-hero__dust", 8],
          [".st-hero__art", 14],
          [".st-hero__fly", 26],
          [".st-hero__near", 48],
        ];
        const movers = depth.map(([sel, amt]) => {
          const t = el.querySelector(sel);
          return {
            amt,
            x: gsap.quickTo(t, "x", { duration: 0.9, ease: "power3.out" }),
            y: gsap.quickTo(t, "yPercent", { duration: 0.9, ease: "power3.out" }),
          };
        });
        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          movers.forEach((m) => {
            m.x(-nx * m.amt);
            m.y(-ny * m.amt * 0.05);
          });
        };
        el.addEventListener("pointermove", onMove);
        return () => el.removeEventListener("pointermove", onMove);
      }
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="st-hero tone-ink" data-tone="ink" aria-labelledby="st-hero-title">
      <div className="st-hero__dust" aria-hidden="true">
        {SPECKS.map((s, i) => (
          <i
            key={i}
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.s,
              height: s.s,
              opacity: s.o,
              background: s.rust ? "var(--rust)" : "var(--paper)",
            }}
          />
        ))}
      </div>

      <div className="wrap st-hero__copy">
        {crumbs}
        <p className="eyebrow" data-reveal>
          Arctos Launchpad · Calgary, Alberta
        </p>
        <h1 id="st-hero-title" className="display st-hero__title">
          <span className="st-hero__ln">Good thinking.</span>{" "}
          <span className="st-hero__ln st-hero__ln--2">
            <em>Useful things.</em>
            <span className="st-hero__rule" aria-hidden="true" />
          </span>
        </h1>
        <p className="lead st-hero__lead" data-reveal style={d(4)}>
          Arctos Launchpad is a Calgary marketing and software agency. We work directly with
          businesses to design and build websites, applications, campaigns and automation,
          connecting the customer-facing work with the systems behind it.
        </p>
      </div>

      <div className="st-hero__stage" aria-hidden="true">
        <div className="st-hero__art">
          <Image
            src="/assets/v3/the-work-moves.webp"
            alt=""
            width={1536}
            height={1024}
            sizes="(max-width: 700px) 170vw, 100vw"
            priority
          />
          {GEARS.map((g) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={g.src}
              className="st-gear"
              src={`/assets/studio/${g.src}.webp`}
              alt=""
              style={{
                left: pct(g.left, 1536),
                top: pct(g.top, 1024),
                width: pct(g.size, 1536),
              }}
            />
          ))}
        </div>
        <svg className="st-hero__fly" viewBox="0 0 1536 1024" preserveAspectRatio="xMidYMid meet">
          {[0, 1, 2, 3, 4].map((i) => (
            <Paper key={i} id={`st-paper-${i}`} />
          ))}
        </svg>
        <p className="st-hero__caption mono">Busywork in. A working system out.</p>
      </div>

      <div className="st-hero__near" aria-hidden="true">
        <span className="st-near st-near--a" />
        <span className="st-near st-near--b" />
      </div>
    </section>
  );
}
