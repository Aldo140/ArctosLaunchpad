"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Keystone page motion. The "how it works" route draws as you read down it
 * and lights each step it reaches: across on wide screens, down on phones.
 * One transform and a class per step, written only when something changes.
 * Reduced motion: the CSS shows the finished route.
 */
export function ProBonoFx() {
  useEffect(() => {
    const steps = document.querySelector<HTMLElement>(".kp-steps");
    if (!steps || !document.documentElement.classList.contains("js-motion")) return;
    const fill = steps.querySelector<HTMLElement>(".kp-steps__fill");
    const items = Array.from(steps.querySelectorAll<HTMLElement>(".kp-step"));
    if (!fill || !items.length) return;

    steps.classList.add("is-live");
    const mm = gsap.matchMedia();
    mm.add({ wide: "(min-width: 901px)", narrow: "(max-width: 900px)" }, (c) => {
      const axis = c.conditions?.wide ? "scaleX" : "scaleY";
      gsap.set(fill, { scaleX: 1, scaleY: 1 });
      gsap.set(fill, { [axis]: 0 });
      const to = gsap.quickTo(fill, axis, { duration: 0.5, ease: "power2.out" });
      let lit = -1;
      const st = ScrollTrigger.create({
        trigger: steps,
        start: c.conditions?.wide ? "top 72%" : "top 62%",
        end: c.conditions?.wide ? "bottom 52%" : "bottom 62%",
        onUpdate: (self) => {
          const p = self.progress;
          to(p);
          const next = Math.min(items.length - 1, Math.floor(p * (items.length - 1) + 0.08));
          const reached = p <= 0.001 ? -1 : next;
          if (reached === lit) return;
          lit = reached;
          items.forEach((item, i) => item.classList.toggle("is-on", i <= reached));
        },
      });
      return () => {
        st.kill();
        items.forEach((item) => item.classList.remove("is-on"));
      };
    });

    return () => {
      mm.revert();
      steps.classList.remove("is-live");
    };
  }, []);

  return null;
}
