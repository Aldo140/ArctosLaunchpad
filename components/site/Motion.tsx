"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Site-wide motion, driven by data attributes so pages stay server components.
 *
 *   [data-reveal]         enters once when it reaches the viewport (CSS transition)
 *   [data-parallax="n"]   drifts n × 100px against the scroll while on screen
 *   video[data-reel]      plays only while on screen and only when motion is welcome
 *
 * Nothing is hidden unless `html.js-motion` is set, which the layout's inline
 * script only does when the visitor hasn't asked for reduced motion.
 */
export function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Reveals
    const revealIO = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            revealIO.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const motionOn = root.classList.contains("js-motion");
    const arm = (scope: ParentNode) => {
      const found = scope.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)");
      if (!motionOn) found.forEach((el) => el.classList.add("is-in"));
      else found.forEach((el) => revealIO.observe(el));
    };
    arm(document);

    // Client components can render their reveal targets after this effect has
    // run (hydration order, conditional markup). Arm those as they appear.
    const added = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches("[data-reveal]:not(.is-in)")) {
            if (motionOn) revealIO.observe(node);
            else node.classList.add("is-in");
          }
          arm(node);
        });
      }
    });
    const main = document.getElementById("main");
    if (main) added.observe(main, { childList: true, subtree: true });

    // Reels: play on screen, pause off screen, never autoplay under reduced motion.
    const reels = document.querySelectorAll<HTMLVideoElement>("video[data-reel]");
    const reelIO = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && !reduce) {
            if (video.preload === "none") video.preload = "auto";
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.35 },
    );
    reels.forEach((video) => reelIO.observe(video));

    // Parallax
    const ctx = gsap.context(() => {
      if (reduce) return;
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const amount = Number(el.dataset.parallax || 0.2) * 100;
        gsap.fromTo(
          el,
          { y: amount },
          {
            y: -amount,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const fontsReady = document.fonts?.ready.then(refresh);
    void fontsReady;

    return () => {
      revealIO.disconnect();
      added.disconnect();
      reelIO.disconnect();
      ctx.revert();
      window.removeEventListener("load", refresh);
    };
  }, [pathname]);

  return null;
}
