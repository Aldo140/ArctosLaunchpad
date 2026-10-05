"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The hero sequence: chaos, then system.
 *
 *   SET   headline resolves line by line as the loader lifts
 *   SET   loose files resolve where they fell, at their scattered angles
 *   DRAW  a drafted route runs from each file toward the report
 *   WIPE  the report plate is laid down
 *   SET   the plate's contents settle; the files square up and quiet down
 *
 * Nothing translates on entry. Easing the files' rotation toward square is the
 * one non-opacity move, and it belongs to the story (loose, then filed).
 *
 * Before hydration the stage is hidden by CSS (data-run="pending"); a CSS
 * failsafe reveals it if this never runs. Reduced motion shows the designed
 * final state straight from the markup.
 *
 * Loader contract: html[data-intro] is "show" or "done" while the loader is up
 * and "skip" (or absent) otherwise. We wait on it either way, so the hero is
 * correct whether the loader plays, is shortened, or is skipped.
 */
export function HeroMotion() {
  useGSAP(() => {
    const root = document.querySelector<HTMLElement>(".hva");
    if (!root) return;
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      root.dataset.run = "static";
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const html = document.documentElement;
      const mobile = window.matchMedia("(max-width: 899px)").matches;
      const layout = mobile ? "m" : "d";
      const frags = q<HTMLElement>(".hva-frag");
      const plate = q<HTMLElement>(".hva-plate");
      const segs = q<HTMLElement>(`.hva-seg--${layout}`);
      const lines = q<HTMLElement>(".hva-ln");

      const loose = (el: Element) =>
        Number.parseFloat(getComputedStyle(el).getPropertyValue("--r")) || 0;

      /* Resting state of the sequence. */
      gsap.set(lines, { autoAlpha: 0 });
      gsap.set(q(".hva-fade"), { autoAlpha: 0 });
      gsap.set(frags, {
        autoAlpha: 0,
        rotation: (_i: number, el: Element) => loose(el),
      });
      segs.forEach((s) =>
        gsap.set(s, {
          transformOrigin: "0 0",
          scaleX: s.dataset.axis === "h" ? 0 : 1,
          scaleY: s.dataset.axis === "v" ? 0 : 1,
        }),
      );
      gsap.set(plate, { clipPath: "inset(0 100% 0 0)" });
      gsap.set(q(".hva-set"), { autoAlpha: 0 });
      gsap.set(q(".hva-redact"), { scaleX: 0, transformOrigin: "0 50%" });
      gsap.set(q(".hva-chart-line"), { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(q(".hva-tick"), { scaleX: 0, transformOrigin: "0 50%" });
      root.dataset.run = "armed";

      const tl = gsap.timeline({ paused: true });

      tl.to(q(".hva-tick"), { scaleX: 1, duration: 0.9, ease: "power2.inOut" }, 0)
        .to(q(".hva-fade--eyebrow"), { autoAlpha: 1, duration: 0.5 }, 0.05)
        .to(lines[0], { autoAlpha: 1, duration: 0.7, ease: "power3.out" }, 0.1)
        .to(lines[1], { autoAlpha: 1, duration: 0.8, ease: "power3.out" }, 0.38)
        .to(q(".hva-fade--lead"), { autoAlpha: 1, duration: 0.6 }, 0.75)
        .to(q(".hva-fade--cta"), { autoAlpha: 1, duration: 0.6 }, 0.95)
        .to(q(".hva-fade--proof"), { autoAlpha: 1, duration: 0.6, stagger: 0.07 }, 1.15)
        /* chaos: the loose files resolve where they fell */
        .to(
          frags,
          {
            autoAlpha: 1,
            duration: 0.5,
            stagger: { each: 0.1, from: "random" },
            ease: "power2.out",
          },
          0.5,
        );

      /* system: routes are drawn, then the plate is laid down */
      const drawAt = 1.55;
      frags.forEach((f, i) => {
        segs
          .filter((s) => s.dataset.route === `${f.dataset.id}-${layout}`)
          .forEach((s, j) => {
            tl.to(
              s,
              { scaleX: 1, scaleY: 1, duration: 0.42, ease: "power2.inOut" },
              drawAt + i * 0.07 + j * 0.34,
            );
          });
      });

      tl.to(
        plate,
        { clipPath: "inset(0 0% 0 0)", duration: 0.95, ease: "power3.inOut" },
        drawAt + 0.35,
      )
        .to(q(".hva-set"), { autoAlpha: 1, duration: 0.45, stagger: 0.06 }, drawAt + 0.95)
        .to(
          q(".hva-redact"),
          { scaleX: 1, duration: 0.5, stagger: 0.035, ease: "power2.out" },
          drawAt + 1.1,
        )
        .to(
          q(".hva-chart-line"),
          { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" },
          drawAt + 1.2,
        )
        /* loose to filed: the files square up and recede behind the report */
        .to(
          frags,
          {
            rotation: (_i: number, el: Element) => loose(el) * 0.35,
            opacity: 0.62,
            duration: 1.1,
            ease: "power3.inOut",
          },
          drawAt + 1.0,
        );

      let started = false;
      const play = () => {
        if (started) return;
        started = true;
        tl.play();
      };
      let mo: MutationObserver | undefined;
      let fallback: number | undefined;
      if (html.dataset.intro !== "show") {
        play();
      } else {
        /* Begin as the loader lifts, not after it is fully gone. */
        mo = new MutationObserver(() => {
          if (html.dataset.intro !== "show") {
            mo?.disconnect();
            window.setTimeout(play, html.dataset.intro === "done" ? 150 : 0);
          }
        });
        mo.observe(html, { attributes: true, attributeFilter: ["data-intro"] });
        fallback = window.setTimeout(play, 3000);
      }

      /* Scroll-tied depth, not an entrance: terrain and loose files travel at
         different rates as the hero leaves. */
      const trigger = { trigger: root, start: "top top", end: "bottom top", scrub: 0.8 };
      const terrain = root.querySelector(".hva-terrain");
      if (terrain) {
        gsap.fromTo(
          terrain,
          { scale: 1.04, yPercent: -1 },
          { scale: 1.1, yPercent: 3, ease: "none", scrollTrigger: trigger },
        );
      }
      if (!mobile) {
        gsap.to(q(".hva-frag-layer"), {
          yPercent: -7,
          ease: "none",
          scrollTrigger: trigger,
        });
      }

      return () => {
        mo?.disconnect();
        if (fallback) window.clearTimeout(fallback);
      };
    });

    return () => mm.revert();
  });

  /* If this never arms (script blocked), the CSS failsafe takes over. */
  return null;
}
