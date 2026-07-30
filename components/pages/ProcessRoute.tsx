"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The process route, drawn.
 *
 * The page claims that one decision creates the conditions for the next. This
 * is that claim as a mechanism rather than a sentence: a single spine runs the
 * height of the route and extends with the scroll, and a stop only lights once
 * the line has reached it. You cannot read stop four before the line has passed
 * through three.
 *
 * Two things are deliberately *not* here. Nothing translates on entry — the
 * stops resolve where they already sit (SET), and the only geometry that moves
 * is the line itself (DRAW), which is what the rest of the site does. And
 * nothing is hidden: without JavaScript, or under reduced motion, `--run` and
 * `--lit` stay at their CSS defaults of 1, so the route renders complete and
 * fully readable. Motion is added to a finished page, never required by it.
 */
export function ProcessRoute() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const steps = document.querySelector<HTMLElement>(".process-route__steps");
      const stops = gsap.utils.toArray<HTMLElement>(".process-stop");
      const railItems = gsap.utils.toArray<HTMLElement>(
        ".process-route__rail li",
      );
      if (!steps || !stops.length) return;

      gsap.set(steps, { "--run": 0 });
      gsap.set(stops, { "--lit": 0 });
      gsap.set(railItems, { "--lit": 0 });

      // The spine extends with the scroll. Scrubbed, because the line's job is
      // to report position — it should track the reader, not perform at them.
      const spine = ScrollTrigger.create({
        trigger: steps,
        start: "top 62%",
        end: "bottom 82%",
        onUpdate: (self) => {
          gsap.set(steps, { "--run": self.progress });
        },
      });

      // Each station lights when the line arrives, and stays lit. A stop that
      // dimmed again on the way back up would read as the route un-deciding.
      const stations = stops.map((stop, i) =>
        ScrollTrigger.create({
          trigger: stop,
          start: "top 72%",
          once: true,
          onEnter: () => {
            gsap.to(stop, {
              "--lit": 1,
              duration: 0.5,
              ease: "power2.out",
            });
            const item = railItems[i];
            if (item) {
              gsap.to(item, { "--lit": 1, duration: 0.5, ease: "power2.out" });
            }
          },
        }),
      );

      // The rail marks where the reader currently is, which is a different
      // question from how far the line has been drawn.
      const current = stops.map((stop, i) =>
        ScrollTrigger.create({
          trigger: stop,
          start: "top 60%",
          end: "bottom 60%",
          onToggle: (self) => {
            railItems[i]?.toggleAttribute("data-current", self.isActive);
          },
        }),
      );

      return () => {
        spine.kill();
        stations.forEach((t) => t.kill());
        current.forEach((t) => t.kill());
      };
    });

    return () => mm.revert();
  });

  return null;
}
