"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Depth between the type and the paper.
 *
 * The collages are photographs of a physical surface, and the text sits on a
 * pasted panel above them. Drifting the canvas a few percent slower than the
 * page makes that relationship legible: the panel is *on* the paper rather
 * than printed into it.
 *
 * Two moves only, both scrubbed to scroll so nothing plays on its own clock:
 *
 *   1. the canvas drifts vertically across the section
 *   2. the chapter title rises out of its own overflow as the stage arrives
 *
 * `gsap.matchMedia` handles the reduced-motion branch — the tweens are never
 * created, and `revert()` restores the untransformed layout, so there is no
 * inline style left behind for the static case to fight with.
 */
export function ChapterMotion() {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        for (const stage of gsap.utils.toArray<HTMLElement>(".chapter")) {
          const canvas = stage.querySelector<HTMLElement>(".chapter__canvas");
          const title = stage.querySelector<HTMLElement>(".chapter__title");

          if (canvas) {
            gsap.fromTo(
              canvas,
              { yPercent: -5 },
              {
                yPercent: 5,
                ease: "none",
                scrollTrigger: {
                  trigger: stage,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              },
            );
          }

          if (title) {
            gsap.from(title, {
              yPercent: 108,
              duration: 1.1,
              ease: "power4.out",
              scrollTrigger: { trigger: stage, start: "top 72%", once: true },
            });
          }
        }
      });

      return () => mm.revert();
  });

  // Renders nothing: this component exists only to own the timelines.
  return null;
}
