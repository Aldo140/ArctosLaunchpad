"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The closing roundel. Scroll-tied depth only (no entrance): the plate turns
 * and grows slightly as the section arrives, so the bear is still climbing as
 * the page ends. The final state is the CSS default.
 */
export function FinalArt() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          el.querySelector(".trs-final__plate"),
          { scale: 0.94, rotate: -4 },
          {
            scale: 1,
            rotate: 0,
            ease: "none",
            scrollTrigger: {
              trigger: el.closest("section"),
              start: "top bottom",
              end: "center center",
              scrub: 0.6,
            },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div className="trs-final__art" ref={root} aria-hidden="true">
      <div className="trs-final__plate">
        <Image
          src="/assets/figures/bear-ascent.webp"
          alt=""
          width={1200}
          height={1200}
          sizes="(max-width: 900px) 140vw, 80vw"
        />
      </div>
    </div>
  );
}
