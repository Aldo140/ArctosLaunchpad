"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Homepage motion.
 *
 * Two rules, and they are the reason this reads as part of the design rather
 * than as a scroll library bolted onto it.
 *
 * 1. Only three gestures exist site-wide — DRAW, WIPE, SET (see tokens.css).
 *    Nothing here invents a fourth. Sections that only need to appear are
 *    handled in CSS by `.reveal`; GSAP is reserved for the sequences where
 *    timing carries meaning and one thing must happen before another.
 *
 * 2. Nothing translates on entry. Earlier versions slid headings up 14–18px
 *    and faded cards in from the side, which is the generic scroll-reveal
 *    signature and belonged to no part of this brand. The movement in a
 *    section now comes from its rules drawing, which is what a drawing board
 *    actually does.
 *
 * What survives here is the one section whose argument *is* temporal: the
 * automation ledger, where the manual work has to be struck out in front of
 * you before the outcomes arrive. Everything else was demoted to CSS.
 */
export function HomeMotion() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ledger = document.querySelector(".automation__ledger");
      if (!ledger) return;

      const before = gsap.utils.toArray<HTMLElement>(
        ".automation__list--before li",
      );
      const after = gsap.utils.toArray<HTMLElement>(
        ".automation__list--after li",
      );
      const arrow = ledger.querySelector(".automation__arrow");

      const tl = gsap.timeline({
        scrollTrigger: { trigger: ledger, start: "top 72%", once: true },
      });

      // DRAW: each strike extends across its line. The same gesture as every
      // other rule on the site, put to work making a point.
      tl.to(before, {
        "--strike-scale": 1,
        duration: 0.42,
        stagger: 0.07,
        ease: "power2.inOut",
      })
        .to(before, { opacity: 0.4, duration: 0.45 }, "-=0.25")
        // DRAW: the arrow extends from the struck column toward the outcomes.
        .from(
          arrow,
          {
            scaleX: 0,
            transformOrigin: "left",
            duration: 0.5,
            ease: "power2.inOut",
          },
          "-=0.35",
        )
        // SET: the outcomes resolve in place. They do not fly in.
        .from(after, { autoAlpha: 0, duration: 0.5, stagger: 0.07 }, "-=0.2");
    });

    return () => mm.revert();
  });

  return null;
}
