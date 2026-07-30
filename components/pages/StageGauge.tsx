"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The stage gauge.
 *
 * The page argues that Attract, Convert, Operate, and Scale are one connected
 * system rather than four departments, so the index is one instrument with four
 * bands rather than four cards. Each band fills as its chapter is read, which
 * makes the gauge do two jobs at once: it indexes the offer, and it reports how
 * far through the system the reader currently is.
 *
 * The fill is scrubbed against the chapter's own extent rather than played on
 * entry — a band that filled instantly would be decoration, whereas one that
 * tracks the chapter is reporting a real position. `--fill` defaults to 1 in
 * CSS, so with no JavaScript the gauge simply reads as a complete index.
 */
export function StageGauge({ stages }: { stages: string[] }) {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const bands = stages
        .map((id) =>
          document.querySelector<HTMLElement>(
            `.stage-gauge__band[data-stage="${id}"]`,
          ),
        )
        .filter((el): el is HTMLElement => Boolean(el));

      if (!bands.length) return;
      gsap.set(bands, { "--fill": 0 });

      const triggers = stages.map((id, i) => {
        const band = bands[i];
        const chapter = document.getElementById(id);
        if (!band || !chapter) return null;

        return ScrollTrigger.create({
          trigger: chapter,
          start: "top 78%",
          end: "bottom 62%",
          onUpdate: (self) => {
            gsap.set(band, { "--fill": self.progress });
          },
          // Past the chapter, the band stays full: it records that the reader
          // has covered this part of the system, not where they are looking.
          onLeave: () => gsap.set(band, { "--fill": 1 }),
        });
      });

      return () => triggers.forEach((t) => t?.kill());
    });

    return () => mm.revert();
  }, [stages]);

  return null;
}
