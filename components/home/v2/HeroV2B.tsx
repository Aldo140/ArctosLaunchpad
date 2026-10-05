"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import canvas from "@/public/assets/chapters/convert.webp";
import bear from "@/public/assets/illustrations/connected-automation.webp";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Concept B: the monumental plate.
 *
 * One poster. A torn-paper canvas is the ground, the gears bear is laid on it
 * as a roundel too big for the frame, and the headline is set across both. The
 * headline is blended (`difference`) so one line of type reads ink on paper and
 * paper on navy as it crosses the roundel's edge. A single drawn route leaves
 * the last full stop of the headline and ends at the offer.
 *
 * Motion: the final composition is the CSS default. Under no-preference the
 * entrance is WIPE (roundel laid down) -> SET (type resolves) -> DRAW (route),
 * held until the intro loader has lifted. Scrolling scales the held art.
 */

const CASES = [
  { href: "/work/fresh-prep-event-intelligence", label: "Fresh Prep" },
  { href: "/work/true-north-kromes", label: "True North Kromes" },
  { href: "/work/calgary-watch", label: "Calgary Watch" },
  { href: "/work/rio-alto", label: "Rio Alto" },
  { href: "/work/starlings-support-map", label: "Starlings" },
];

export function HeroV2B() {
  const root = useRef<HTMLElement>(null);
  const dot = useRef<HTMLSpanElement>(null);
  const cta = useRef<HTMLAnchorElement>(null);
  const route = useRef<SVGPathElement>(null);
  const start = useRef<SVGCircleElement>(null);
  const end = useRef<SVGCircleElement>(null);

  /* The route is measured from the real layout (the headline's full stop to the
     button) so it stays attached at every width and font-load state. */
  useLayoutEffect(() => {
    const section = root.current;
    if (!section) return;

    const plot = () => {
      const d = dot.current;
      const c = cta.current;
      const path = route.current;
      if (!d || !c || !path) return;
      const s = section.getBoundingClientRect();
      const a = d.getBoundingClientRect();
      const b = c.getBoundingClientRect();
      const narrow = window.innerWidth <= 1000;
      const sx = a.left - s.left + (narrow ? 2 : 6);
      const sy = a.bottom - s.top - a.height * 0.2;
      let ex: number;
      let ey: number;
      let dPath: string;
      if (narrow) {
        // A margin line: drops down the right gutter and lands on the button.
        const lane = s.width - 11;
        ex = lane;
        ey = b.top - s.top + b.height / 2;
        dPath = `M${sx} ${sy} C${sx + 18} ${sy} ${lane} ${sy - 4} ${lane} ${sy + 34} L${lane} ${ey - 10} Q${lane} ${ey} ${lane - 8} ${ey}`;
        ex = lane - 8;
      } else {
        ex = b.right - s.left + 14;
        ey = b.top - s.top + b.height / 2;
        dPath = `M${sx} ${sy} C${sx + 30} ${sy + 80} ${ex + 190} ${ey + 10} ${ex} ${ey}`;
      }
      path.setAttribute("d", dPath);
      start.current?.setAttribute("cx", String(sx));
      start.current?.setAttribute("cy", String(sy));
      end.current?.setAttribute("cx", String(ex));
      end.current?.setAttribute("cy", String(ey));
    };

    plot();
    const ro = new ResizeObserver(plot);
    ro.observe(section);
    document.fonts?.ready.then(plot);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;
      const q = gsap.utils.selector(section);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const intro = document.documentElement.dataset.intro;
        const delay = intro === "show" || intro === "done" ? 1.25 : 0.05;
        const routeEl = route.current;
        const finish = () => {
          section.dataset.ready = "true";
          gsap.set(q(".hvb-arm"), { clearProps: "opacity,clipPath" });
        };

        const tl = gsap.timeline({ delay, onComplete: finish });
        tl.fromTo(
          q(".hvb__disc"),
          { opacity: 1, clipPath: "circle(0% at 46% 54%)" },
          {
            clipPath: "circle(50% at 50% 50%)",
            duration: 1.05,
            ease: "power3.inOut",
          },
          0,
        )
          .fromTo(
            q(".hvb__disc-img"),
            { scale: 1.14 },
            { scale: 1, duration: 1.4, ease: "power2.out" },
            0,
          )
          .fromTo(
            q(".hvb__eyebrow, .hvb__l1, .hvb__l2"),
            { opacity: 0 },
            { opacity: 1, duration: 0.7, ease: "power2.out", stagger: 0.14 },
            0.45,
          )
          .fromTo(
            q(".hvb__lead, .hvb__actions, .hvb__fine, .hvb__proof"),
            { opacity: 0 },
            { opacity: 1, duration: 0.6, ease: "power2.out", stagger: 0.1 },
            1.0,
          );
        if (routeEl) {
          tl.fromTo(
            routeEl,
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 1.15, ease: "power2.inOut" },
            1.05,
          ).fromTo(
            q(".hvb__route-mark"),
            { opacity: 0 },
            { opacity: 1, duration: 0.4, stagger: 0.7 },
            1.05,
          );
        }

        // Scroll-tied depth on the held art. Transform only, no entrance.
        gsap.fromTo(
          q(".hvb__canvas-img"),
          { scale: 1 },
          {
            scale: 1.08,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom top",
              scrub: 0.8,
            },
          },
        );
        gsap.fromTo(
          q(".hvb__disc-wrap"),
          { scale: 1 },
          {
            scale: 1.09,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom top",
              scrub: 0.8,
            },
          },
        );

        return () => {
          section.dataset.ready = "true";
        };
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="hvb section section--flush"
      data-material="paper"
      data-chapter="convert"
      data-station="Cover"
    >
      <div className="hvb__canvas" aria-hidden="true">
        <Image
          className="hvb__canvas-img"
          src={canvas}
          alt=""
          fill
          priority
          sizes="140vw"
        />
      </div>

      <div className="hvb__disc-wrap" aria-hidden="true">
        <div className="hvb__disc hvb-arm">
          <Image
            className="hvb__disc-img"
            src={bear}
            alt=""
            fill
            priority
            sizes="(max-width: 700px) 150vw, 1100px"
          />
        </div>
      </div>

      <svg
        className="hvb__route"
        aria-hidden="true"
        focusable="false"
      >
        <path
          ref={route}
          className="hvb__route-line"
          pathLength={1}
          fill="none"
        />
        <circle ref={start} className="hvb__route-mark" r="5" />
        <circle ref={end} className="hvb__route-mark hvb__route-end" r="7" />
      </svg>

      <div className="hvb__inner">
        <p className="hvb__eyebrow hvb-arm t-folio">
          <span>
            Calgary · Reporting &amp; automation
            <span className="hvb__eb-long"> for recurring work</span>
          </span>
        </p>

        <h1 className="hvb__title">
          <span className="hvb__l1 hvb-arm">
            Run the work.
          </span>
          <em className="hvb__l2 hvb-arm">
            The report writes itself<span ref={dot}>.</span>
          </em>
        </h1>

        <p className="hvb__lead hvb-arm">
          Arctos builds the reporting and automation behind events, campaigns
          and production runs, so the tenth one costs less than the first.
        </p>

        <div className="hvb__actions hvb-arm">
          <Link ref={cta} className="btn hvb__cta" href="/teardown">
            Get a free reporting teardown
            <span className="btn__arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>

        <p className="hvb__fine hvb-arm">
          <span>30 minutes. No obligation. Reply within two business days.</span>
          <Link className="hvb__quiet" href="/work">
            See the work
          </Link>
        </p>
      </div>

      <nav className="hvb__proof hvb-arm" aria-label="Case files">
        <span className="hvb__proof-label">Case files</span>
        <ul>
          {CASES.map((c) => (
            <li key={c.href}>
              <Link href={c.href}>{c.label}</Link>
            </li>
          ))}
          <li>
            <Link className="hvb__quiet hvb__quiet--proof" href="/work">
              All work →
            </Link>
          </li>
        </ul>
      </nav>
    </section>
  );
}
