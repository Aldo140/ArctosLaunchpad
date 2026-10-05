"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Demand against the work behind it.
 *
 * Three lines leave the same origin. Demand climbs. Admin done by hand climbs
 * with it, because every extra campaign is another stretch of copy and paste.
 * Admin behind a connected system stays level. The space between the last two
 * is the work we take off the team. No numbers: it is an argument about shape.
 *
 * The lines are DRAWN by scroll: each is revealed through a clip rect whose
 * width is scrubbed, so a stroke never has to be measured (the strokes are
 * non-scaling, so path lengths do not match screen lengths). Without motion, or
 * without JS, the clips are fully open and the finished drawing is the design.
 */
export function GapCurves({ children }: { children?: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top 96%",
            end: "top 58%",
            scrub: 0.7,
          },
        });
        tl.fromTo(q("#prf-clip-system rect"), { attr: { width: 0 } }, { attr: { width: 1000 }, duration: 0.55 }, 0)
          .fromTo(q("#prf-clip-demand rect"), { attr: { width: 0 } }, { attr: { width: 1000 }, duration: 0.8 }, 0.05)
          .fromTo(q("#prf-clip-hand rect"), { attr: { width: 0 } }, { attr: { width: 1000 }, duration: 0.8 }, 0.2)
          .fromTo(q(".prf-gap__area"), { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0.75)
          .fromTo(q(".prf-gap__bracket"), { scaleY: 0 }, { scaleY: 1, duration: 0.25 }, 0.8)
          .fromTo(q(".prf-gap__tag"), { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.06 }, 0.82);
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div className="prf-gap__chart" ref={root}>
      <div className="prf-gap__plot" aria-hidden="true">
        <svg viewBox="0 0 1000 400" preserveAspectRatio="none" role="presentation">
          <defs>
            {["system", "demand", "hand"].map((id) => (
              <clipPath key={id} id={`prf-clip-${id}`} clipPathUnits="userSpaceOnUse">
                <rect x="0" y="-20" width="1000" height="440" />
              </clipPath>
            ))}
          </defs>
          <path className="prf-gap__grid" d="M0 80H1000M0 160H1000M0 240H1000M0 320H1000" />
          <path className="prf-gap__axis" d="M0 372H1000" />
          <path
            className="prf-gap__area"
            d="M0 360 C 215 352, 482 308, 654 206 S 800 112, 860 100 L860 316 C 516 340, 215 354, 0 360 Z"
          />
          <g clipPath="url(#prf-clip-system)">
            <path className="prf-gap__line prf-gap__line--system" d="M0 360 C 215 354, 516 340, 860 316" />
          </g>
          <g clipPath="url(#prf-clip-hand)">
            <path
              className="prf-gap__line prf-gap__line--hand"
              d="M0 360 C 215 352, 482 308, 654 206 S 800 112, 860 100"
            />
          </g>
          <g clipPath="url(#prf-clip-demand)">
            <path
              className="prf-gap__line prf-gap__line--demand"
              d="M0 360 C 215 350, 465 286, 636 168 S 791 48, 860 28"
            />
          </g>
        </svg>
        <span className="prf-gap__tag prf-gap__tag--demand">Demand</span>
        <span className="prf-gap__tag prf-gap__tag--hand">Admin, by hand</span>
        <span className="prf-gap__tag prf-gap__tag--system">Admin, connected</span>
        <span className="prf-gap__bracket" />
        <span className="prf-gap__tag prf-gap__tag--gap">The work we take off you</span>
      </div>
      <ul className="prf-gap__legend" aria-hidden="true">
        <li className="prf-gap__key prf-gap__key--demand">Demand</li>
        <li className="prf-gap__key prf-gap__key--hand">Admin, by hand</li>
        <li className="prf-gap__key prf-gap__key--system">Admin, connected</li>
      </ul>
      <div className="prf-gap__aside shell">{children}</div>
    </div>
  );
}
