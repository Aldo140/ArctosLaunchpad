"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useMediaQuery, useReducedMotion } from "@/lib/useMedia";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The lead-generation route, drawn.
 *
 * Same technique as the hero mark: a plotted line that draws itself, then a
 * signal travels it once. Here the drawing carries an argument rather than a
 * flourish — the route is the path a customer takes from a search to a
 * reported outcome, and the brackets underneath show how much of it a
 * marketing agency typically covers versus how much still has to exist.
 *
 * The stations are real HTML, not SVG text: selectable, translatable, and they
 * reflow instead of scaling into illegibility. The SVG behind them is purely
 * the connective tissue and is hidden from assistive technology.
 */

const STOPS = [
  "Search / Ads / Content",
  "Landing Page or Website",
  "Form / Booking / Quote",
  "CRM and Lead Routing",
  "Automated Follow-Up",
  "Sales Pipeline",
  "Dashboard and Reporting",
];

/** Where a marketing engagement usually ends. */
const HANDOVER = 3;

const W = 1000;
const H = 120;

/**
 * Station x positions.
 *
 * These have to land on the *left edge* of each label column, because the
 * labels are left-aligned under them. The track is a 7-column grid with no
 * gutter (separation comes from padding inside each cell), so column i starts
 * at exactly i/7 of the width and the arithmetic holds at any viewport.
 */
const INSET = 7;
const xs = STOPS.map((_, i) => (i * W) / STOPS.length + INSET);

/** A gently undulating route — flat reads as a progress bar, not a journey. */
const ys = [78, 62, 70, 44, 56, 40, 26];

function horizontalPath() {
  let d = `M${xs[0]},${ys[0]}`;
  for (let i = 1; i < xs.length; i += 1) {
    const cx = (xs[i - 1] + xs[i]) / 2;
    d += ` C${cx},${ys[i - 1]} ${cx},${ys[i]} ${xs[i]},${ys[i]}`;
  }
  return d;
}

export function JourneyDiagram() {
  const reduced = useReducedMotion();
  const wide = useMediaQuery("(min-width: 900px)", true);
  const root = useRef<HTMLDivElement>(null);
  const route = useRef<SVGPathElement>(null);
  const signal = useRef<SVGCircleElement>(null);

  /**
   * Dash length has to be measured in *rendered* units, not user units.
   *
   * The SVG uses `preserveAspectRatio="none"`, so the 1000-unit viewBox is
   * stretched to whatever the container is. `getTotalLength()` reports the
   * untransformed length, and a dasharray set from it covers only the fraction
   * of the path that the horizontal scale has not stretched — which is why the
   * route appeared to stop three stations early. The path is ~99% horizontal,
   * so scaling by the x factor is exact enough to the pixel.
   */
  const dashLength = () => {
    const path = route.current;
    if (!path) return 0;
    const rendered = path.ownerSVGElement?.getBoundingClientRect().width ?? W;
    return path.getTotalLength() * Math.max(1, rendered / W);
  };

  // Prime the dash before the trigger fires, so the route is never briefly
  // visible in full on a slow first frame.
  useEffect(() => {
    const path = route.current;
    if (!path || reduced || !wide) return;
    const len = dashLength();
    path.style.strokeDasharray = String(len);
    path.style.strokeDashoffset = String(len);
    // Re-measure when the container width changes, or the dash under-covers again.
    const ro = new ResizeObserver(() => {
      const next = dashLength();
      path.style.strokeDasharray = String(next);
      if (parseFloat(path.style.strokeDashoffset || "0") > 0) {
        path.style.strokeDashoffset = String(next);
      }
    });
    if (path.ownerSVGElement) ro.observe(path.ownerSVGElement);
    return () => ro.disconnect();
  }, [reduced, wide]);

  useGSAP(
    () => {
      if (reduced || !wide) return;
      const path = route.current;
      const dot = signal.current;
      const el = root.current;
      if (!path || !el) return;

      const len = path.getTotalLength();
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 78%", once: true },
      });

      tl.to(path, {
        strokeDashoffset: 0,
        duration: 1.9,
        ease: "power2.inOut",
      })
        // Stations light as the line reaches them.
        .to(
          ".journey__stop",
          { "--lit": 1, duration: 0.3, stagger: 0.24, ease: "none" },
          0.15,
        );

      // The coverage brackets draw in CSS, on the shared DRAW token, so they
      // match every other rule on the site rather than keeping their own timing.

      // One pass of the signal, so the route reads as something traversed.
      if (dot) {
        const pos = { p: 0 };
        tl.to(
          pos,
          {
            p: 1,
            duration: 2.4,
            ease: "power1.inOut",
            onUpdate() {
              const { x, y } = path.getPointAtLength(pos.p * len);
              dot.setAttribute("cx", String(x));
              dot.setAttribute("cy", String(y));
            },
          },
          0.35,
        ).to(dot, { autoAlpha: 0, duration: 0.4 }, "-=0.3");
      }
    },
    { dependencies: [reduced, wide], revertOnUpdate: true },
  );

  return (
    <div className="journey reveal" ref={root}>
      {wide ? (
        <svg
          className="journey__svg"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            {/* The soft tints, not the base accents: --scale is a dark forest
                that all but disappears as a 1.6px stroke on the ink ground,
                which made the route look like it stopped three stations early. */}
            <linearGradient id="journey-run" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="var(--attract-soft)" />
              <stop offset="34%" stopColor="var(--convert-soft)" />
              <stop offset="67%" stopColor="var(--operate-soft)" />
              <stop offset="100%" stopColor="var(--scale-soft)" />
            </linearGradient>
          </defs>

          <path className="journey__route" ref={route} d={horizontalPath()} />

          {xs.map((x, i) => (
            <circle
              key={i}
              className={`journey__pin${i === HANDOVER ? " is-handover" : ""}`}
              cx={x}
              cy={ys[i]}
              r={i === HANDOVER ? 5 : 3.5}
            />
          ))}

          <circle
            className="journey__signal"
            ref={signal}
            r="4.5"
            cx={xs[0]}
            cy={ys[0]}
          />
        </svg>
      ) : null}

      <ol className="journey__track">
        {STOPS.map((stop, i) => (
          <li
            key={stop}
            className="journey__stop"
            data-handover={i === HANDOVER || undefined}
            style={{ "--y": `${ys[i]}` } as React.CSSProperties}
          >
            <span className="t-folio journey__n">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="journey__label">{stop}</h3>
          </li>
        ))}
      </ol>

      <div className="journey__spans" aria-hidden="true">
        <div className="journey__span journey__span--agency">
          <span className="journey__bracket" />
          <span className="t-folio">Where most agencies stop</span>
        </div>
        <div className="journey__span journey__span--arctos">
          <span className="journey__bracket" />
          <span className="t-folio">Arctos</span>
        </div>
      </div>

      <p className="visually-hidden">
        Most agencies cover the first three stages: campaign, website, and form.
        Arctos covers all seven, continuing through CRM routing, automated
        follow-up, the sales pipeline, and reporting.
      </p>
    </div>
  );
}
