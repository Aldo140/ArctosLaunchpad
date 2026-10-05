"use client";

import { useRef } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { processDetails } from "@/lib/content";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The first weeks, drawn as one line.
 *
 * Stop 00 is the teardown (where the visitor actually starts), then the six
 * real process steps. The rail is scroll-linked: `--run` runs 0 -> 1 as the
 * section passes through the viewport and each stop's tick lights when the
 * rail reaches it. Both default to the FINISHED state in CSS, so no JS and
 * reduced motion render the designed final frame. Text never dims; progress is
 * carried by the rail, the ticks and the numerals only.
 */
export function ProcessTrack() {
  const root = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const stops = Array.from(el.querySelectorAll<HTMLElement>("[data-stop]"));
        const vertical = () => window.matchMedia("(max-width: 899px)").matches;
        const st = ScrollTrigger.create({
          trigger: el,
          start: "top 78%",
          end: () => (vertical() ? "bottom 62%" : "top 28%"),
          scrub: 0.4,
          onUpdate: (self) => {
            const run = self.progress;
            el.style.setProperty("--run", String(run));
            stops.forEach((s, i) => {
              const at = i / (stops.length - 1 || 1);
              s.dataset.lit = run >= at - 0.001 ? "true" : "false";
            });
          },
        });
        // Start state: nothing drawn yet, until the trigger reports in.
        el.style.setProperty("--run", String(st.progress));
        stops.forEach((s, i) => {
          const at = i / (stops.length - 1 || 1);
          s.dataset.lit = st.progress >= at - 0.001 ? "true" : "false";
        });
        return () => {
          st.kill();
          el.style.removeProperty("--run");
          stops.forEach((s) => delete s.dataset.lit);
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <ol className="trs-track" ref={root}>
      <li
        className="trs-stop trs-stop--start"
        data-stop
        style={{ "--i": 0 } as CSSProperties}
      >
        <span className="trs-stop__tick" aria-hidden="true" />
        <p className="trs-stop__n t-label">You start here</p>
        <h3 className="trs-stop__title">
          <Link href="/teardown" className="trs-stop__link">
            The free teardown<span aria-hidden="true"> →</span>
          </Link>
        </h3>
        <ul className="trs-stop__out">
          <li>One-screen report mock</li>
          <li>First three manual steps to automate</li>
        </ul>
      </li>
      {processDetails.map((step, i) => (
        <li
          className="trs-stop"
          key={step.id}
          data-stop
          style={{ "--i": i + 1 } as CSSProperties}
        >
          <span className="trs-stop__tick" aria-hidden="true" />
          <p className="trs-stop__n t-label">{step.index}</p>
          <h3 className="trs-stop__title">{step.title}</h3>
          <ul className="trs-stop__out">
            {step.deliverables.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
