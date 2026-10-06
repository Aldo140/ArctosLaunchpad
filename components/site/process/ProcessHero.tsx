"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { processDetails } from "@/lib/content";
import { Lines, d } from "@/components/site/ui";
import { ROUTE_D, STAKES, STRIP } from "./geometry";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, MotionPathPlugin);

/**
 * /process opening: the ground before anything is built. A surveyor's lamp
 * lights the contours, a dashed route is pegged out across the page and six
 * stakes mark the stops the journey below will build, plank by plank.
 */
export function ProcessHero({ crumbs }: { crumbs: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const route = el.querySelector<SVGPathElement>(".pjh__route-mask")!;
      const guide = el.querySelector<SVGPathElement>(".pjh__route-shadow")!;
      const stakes = gsap.utils.toArray<HTMLElement>(".pjh__stake");
      const marks = gsap.utils.toArray<SVGGElement>(".pjh__mark");
      const signal = el.querySelector<SVGGElement>(".pjh__signal")!;
      const strip = el.querySelector<SVGSVGElement>(".pjh__strip svg")!;
      const lampX = gsap.quickTo(el, "--lx", { duration: 0.9, ease: "power3.out" });
      const lampY = gsap.quickTo(el, "--ly", { duration: 0.9, ease: "power3.out" });

      // Lamp follows the signal while the route is surveyed, then the pointer.
      const follow = () => {
        const sr = strip.getBoundingClientRect();
        const hr = el.getBoundingClientRect();
        const m = signal.getCTM();
        if (!m) return;
        const scale = sr.width / STRIP.w;
        lampX(((sr.left - hr.left + m.e * scale) / hr.width) * 100);
        lampY(((sr.top - hr.top + m.f * scale) / hr.height) * 100);
      };

      const tl = gsap.timeline({ delay: 0.35 });
      tl.fromTo(route, { drawSVG: "0%" }, { drawSVG: "100%", duration: 2.6, ease: "power2.inOut" }, 0)
        .fromTo(
          signal,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 2.6,
            ease: "power2.inOut",
            motionPath: { path: guide, align: guide, alignOrigin: [0.5, 0.5], start: 0, end: 0.985 },
            onUpdate: follow,
          },
          0,
        );
      stakes.forEach((s, i) => {
        const at = 0.25 + (i / (stakes.length - 1)) * 2.15;
        tl.fromTo(s, { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.6, ease: "back.out(2.4)" }, at);
        tl.fromTo(marks[i], { opacity: 0, scale: 0.2, transformOrigin: "50% 100%" }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(3)" }, at);
      });
      tl.to(signal, { opacity: 0, duration: 0.4 }, ">-0.1");

      const fine = window.matchMedia("(pointer: fine)").matches;
      const onMove = (e: PointerEvent) => {
        if (tl.isActive()) return;
        const r = el.getBoundingClientRect();
        lampX(((e.clientX - r.left) / r.width) * 100);
        lampY(((e.clientY - r.top) / r.height) * 100);
      };
      if (fine) el.addEventListener("pointermove", onMove);
      else {
        // Touch: once pegged out, the surveyor walks the route as the page scrolls, lamp in hand.
        tl.eventCallback("onComplete", () => {
          gsap.fromTo(
            signal,
            { opacity: 1 },
            {
              opacity: 1,
              ease: "none",
              motionPath: { path: guide, align: guide, alignOrigin: [0.5, 0.5], start: 0.04, end: 0.97 },
              onUpdate: follow,
              scrollTrigger: { trigger: el, start: "top top", end: "bottom 35%", scrub: 0.6 },
            },
          );
          follow();
        });
      }

      // Depth on scroll: the ground sinks slower than the type.
      gsap.to(".pjh__ground", {
        yPercent: 12,
        scale: 1.08,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".pjh__strip", {
        yPercent: -18,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });

      return () => el.removeEventListener("pointermove", onMove);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="pjh tone-ink" data-tone="ink" style={{ "--lx": 18, "--ly": 72 } as CSSProperties}>
      <div className="pjh__ground" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/process/survey-contours.webp" alt="" className="pjh__contours" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/process/survey-contours.webp" alt="" className="pjh__contours pjh__contours--lit" />
        <span className="pjh__grid" />
      </div>

      <div className="wrap pjh__head">
        <div className="pjh__main">
          {crumbs}
          <p className="eyebrow" data-reveal>
            How a project runs
          </p>
          <Lines as="h1" className="display pjh__title" lines={["Understand it first.", <em key="t">Then build the thing.</em>]} />
        </div>
        <div className="pjh__side" data-reveal style={d(3)}>
          <p className="lead">
            Start with the business problem, make the decisions visible, build something useful, then put it
            into daily use. Six stops, the same order every time.
          </p>
          <dl className="pjh__legend" aria-label="Map legend">
            <div>
              <dt aria-hidden="true">
                <i className="pjh__key pjh__key--route" />
              </dt>
              <dd>Surveyed route</dd>
            </div>
            <div>
              <dt aria-hidden="true">
                <i className="pjh__key pjh__key--stake" />
              </dt>
              <dd>A stop</dd>
            </div>
            <div>
              <dt aria-hidden="true">
                <i className="pjh__key pjh__key--plank" />
              </dt>
              <dd>Built, below</dd>
            </div>
          </dl>
        </div>
      </div>

      <nav className="pjh__strip" aria-label="The six stops">
        <svg viewBox={`0 0 ${STRIP.w} ${STRIP.h}`} aria-hidden="true" focusable="false">
          <defs>
            <mask id="pjh-route-mask" maskUnits="userSpaceOnUse" x="-60" y="0" width="1600" height="300">
              <path className="pjh__route-mask" d={ROUTE_D} fill="none" stroke="#fff" strokeWidth="14" />
            </mask>
          </defs>
          <path className="pjh__route-shadow" d={ROUTE_D} fill="none" />
          <path className="pjh__route" d={ROUTE_D} fill="none" mask="url(#pjh-route-mask)" />
          {STAKES.map(([x, y], i) => (
            <g key={i} className="pjh__mark" transform={`translate(${x} ${y})`}>
              <line x1="0" y1="0" x2="0" y2="-34" />
              <path d="M0,-34 L16,-28 L0,-22 Z" />
              <circle r="7" />
              <circle r="2.5" className="pjh__mark-core" />
            </g>
          ))}
          <g className="pjh__signal" opacity="0">
            <circle r="16" className="pjh__signal-halo" />
            <circle r="6" />
          </g>
        </svg>
        <ol>
          {processDetails.map((step, i) => (
            <li
              key={step.id}
              className="pjh__stake"
              style={{ left: `${(STAKES[i][0] / STRIP.w) * 100}%`, top: `${(STAKES[i][1] / STRIP.h) * 100}%` } as CSSProperties}
            >
              <a href={`#${step.id}`}>
                <span className="pjh__stake-i">{step.index}</span>
                <span className="pjh__stake-t">{step.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </section>
  );
}
