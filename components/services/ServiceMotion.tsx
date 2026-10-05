"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Scroll-tied depth for the services, industries and service-detail pages.
 * All of it is additive: the CSS renders every plate, route and title in its
 * finished state, so no JavaScript or reduced motion shows the designed page.
 *
 *   DRIFT   `[data-svc-drift]`  a held plate settles from 1.1 to 1 across its
 *           section. The only scrubbed transform on the image.
 *   DRAW    `[data-svc-route]`  a long line is drawn by scroll: `--run` goes
 *           0 to 1 against the element's own extent.
 *   WIPE    `[data-svc-wipe]`   a stage name is laid down once, as a plate,
 *           from a standalone trigger so a fast scroll cannot strand it.
 */
export function ServiceMotion() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const triggers: ScrollTrigger[] = [];

      gsap.utils.toArray<HTMLElement>("[data-svc-drift]").forEach((el) => {
        const host = el.closest("section") ?? el.parentElement;
        const tween = gsap.fromTo(
          el,
          { scale: 1.1 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: host,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          },
        );
        if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
      });

      gsap.utils.toArray<HTMLElement>("[data-svc-route]").forEach((el) => {
        gsap.set(el, { "--run": 0 });
        triggers.push(
          ScrollTrigger.create({
            trigger: el,
            start: "top 80%",
            end: "bottom 45%",
            onUpdate: (self) => {
              gsap.set(el, { "--run": self.progress });
            },
            onLeave: () => gsap.set(el, { "--run": 1 }),
          }),
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-svc-wipe]").forEach((el) => {
        const tl = gsap.timeline({ paused: true });
        tl.fromTo(
          el,
          { clipPath: "inset(0 0 100% 0)" },
          {
            clipPath: "inset(0 0 -14% 0)",
            duration: 0.9,
            ease: "power3.out",
          },
        );
        triggers.push(
          ScrollTrigger.create({
            trigger: el,
            start: "top 85%",
            once: true,
            onEnter: () => tl.play(),
          }),
        );
      });

      return () => triggers.forEach((t) => t.kill());
    });

    return () => mm.revert();
  });

  return null;
}
