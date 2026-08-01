"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Homepage motion.
 *
 * A small motion grammar keeps the homepage expressive without making it feel
 * like a scroll library demo.
 *
 * 1. Only three gestures exist site-wide — DRAW, WIPE, SET (see tokens.css).
 *    Nothing here invents a fourth. Sections that only need to appear are
 *    handled in CSS by `.reveal`; GSAP is reserved for the sequences where
 *    timing carries meaning and one thing must happen before another.
 *
 * 2. Small translations are reserved for structures that have direction: the
 *    mobile journey, process records, and image evidence. Display headlines do
 *    not drift in as unrelated fragments.
 *
 * The automation ledger remains the clearest temporal argument: manual work is
 * struck out before the outcomes resolve. Elsewhere, motion exposes hierarchy,
 * depth, or progression and then gets out of the reader's way.
 */
export function HomeMotion() {
  useGSAP(() => {
    const root = document.querySelector<HTMLElement>("#main");
    if (!root) return;

    const select = gsap.utils.selector(root);
    const mm = gsap.matchMedia();

    mm.add(
      "(min-width: 701px) and (prefers-reduced-motion: no-preference)",
      () => {
        const ledger = root.querySelector(".automation__ledger");

        if (ledger) {
          const before = gsap.utils.toArray<HTMLElement>(
            ledger.querySelectorAll(".automation__list--before li"),
          );
          const after = gsap.utils.toArray<HTMLElement>(
            ledger.querySelectorAll(".automation__list--after li"),
          );
          const arrow = ledger.querySelector(".automation__arrow");

          const tl = gsap.timeline({
            scrollTrigger: { trigger: ledger, start: "top 74%", once: true },
          });

          tl.to(before, {
            "--strike-scale": 1,
            duration: 0.42,
            stagger: 0.07,
            ease: "power2.inOut",
          })
            .to(before, { opacity: 0.4, duration: 0.45 }, "-=0.25")
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
            .from(
              after,
              {
                autoAlpha: 0,
                duration: 0.5,
                stagger: 0.07,
              },
              "-=0.2",
            );
        }

        for (const image of select<HTMLElement>(
          ".showcase__media img, .showcase__video",
        )) {
          gsap.fromTo(
            image,
            { yPercent: -3, scale: 1.07 },
            {
              yPercent: 3,
              scale: 1.07,
              ease: "none",
              scrollTrigger: {
                trigger: image.closest(".showcase__media"),
                start: "top bottom",
                end: "bottom top",
                scrub: 0.6,
              },
            },
          );
        }

        // The supplied field-guide plates drift within their wipe masks. The
        // movement is deliberately slight: it gives the raster artwork depth
        // without turning explanatory figures into a scrolling effect demo.
        for (const image of select<HTMLElement>(".field-figure img")) {
          gsap.fromTo(
            image,
            { yPercent: -2, scale: 1.025 },
            {
              yPercent: 2,
              scale: 1.025,
              ease: "none",
              scrollTrigger: {
                trigger: image.closest(".field-figure"),
                start: "top bottom",
                end: "bottom top",
                scrub: 0.7,
              },
            },
          );
        }

        const terrain = root.querySelector<HTMLElement>(".hero__terrain");
        const hero = root.querySelector<HTMLElement>(".hero");
        if (terrain && hero) {
          gsap.fromTo(
            terrain,
            { yPercent: -1, scale: 1.035 },
            {
              yPercent: 2,
              scale: 1.075,
              ease: "none",
              scrollTrigger: {
                trigger: hero,
                start: "top top",
                end: "bottom top",
                scrub: 0.8,
              },
            },
          );
        }

        // `.process__step` and `.industries__item` no longer exist — the
        // process rows became a drawn track and the industries list became a
        // field of names, both of which carry their own entrance. Left as-is
        // these selectors matched nothing and the why cards lost theirs too.
        for (const row of select<HTMLElement>(".why__card")) {
          const contents = Array.from(row.children);
          if (!contents.length) continue;
          gsap.from(contents, {
            x: -8,
            autoAlpha: 0,
            duration: 0.46,
            stagger: 0.055,
            ease: "power2.out",
            scrollTrigger: { trigger: row, start: "top 88%", once: true },
          });
        }

        const ctaArt = root.querySelector<HTMLElement>(".cta__art");
        const cta = root.querySelector<HTMLElement>(".cta");
        if (ctaArt && cta) {
          gsap.fromTo(
            ctaArt,
            { rotation: -2, scale: 0.94 },
            {
              rotation: 2,
              scale: 1.04,
              ease: "none",
              scrollTrigger: {
                trigger: cta,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.8,
              },
            },
          );
        }
      },
    );

    return () => mm.revert();
  });

  return null;
}
