"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Scroll-tied depth for the two held plates. Nothing here is an entrance: the
 * plates are already laid down, and these only let the artwork move a little
 * against the page as it passes. Reduced motion shows the plates exactly as
 * composed (transform none).
 */
export function ProofMotion() {
  const marker = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const section = marker.current?.closest<HTMLElement>(".prf");
      if (!section) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        section.querySelectorAll<HTMLElement>("[data-prf-depth]").forEach((el) => {
          const depth = Number(el.dataset.prfDepth) || 0;
          const plate = el.closest<HTMLElement>(".prf-plate") ?? el;
          gsap.fromTo(
            el,
            { yPercent: depth },
            {
              yPercent: -depth,
              ease: "none",
              scrollTrigger: {
                trigger: plate,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.6,
              },
            },
          );
        });

        section.querySelectorAll<HTMLElement>("[data-prf-scale]").forEach((el) => {
          const plate = el.closest<HTMLElement>(".prf-plate") ?? el;
          gsap.fromTo(
            el,
            { scale: Number(el.dataset.prfScale) || 1.1 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: plate,
                start: "top bottom",
                end: "center center",
                scrub: 0.6,
              },
            },
          );
        });
      });

      return () => mm.revert();
    },
    { scope: marker },
  );

  return <span ref={marker} hidden />;
}
