"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The held scenes, brought to life.
 *
 * Two gestures, both already in the site's vocabulary, applied at the scale the
 * scenes work at:
 *
 *   WIPE   the mega title is uncovered from below, as a plate being laid down.
 *          At 14rem this is the single most physical moment on the site, so it
 *          gets a real duration and nothing else moves while it plays.
 *   DRIFT  the canvas holds at a slightly larger scale and settles to 1 across
 *          the scene. It is the only scrubbed transform here, and it exists to
 *          give the held plate depth — a still image pinned for a full viewport
 *          reads as a stuck background otherwise.
 *
 * Nothing translates on entry, which is the rule the rest of the site follows.
 * The title is uncovered where it already sits; it does not fly in.
 *
 * Everything is additive. The CSS renders every scene complete, so with no
 * JavaScript, under reduced motion, or if this never runs, the pages are
 * finished rather than blank — the failure mode that matters most when the
 * content is the entire page.
 */
export function SceneMotion() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        wide: "(min-width: 901px)",
      },
      (ctx) => {
        const { motion, wide } = ctx.conditions as {
          motion: boolean;
          wide: boolean;
        };
        if (!motion) return;

        const scenes = gsap.utils.toArray<HTMLElement>(".scene");
        const triggers: ScrollTrigger[] = [];

        scenes.forEach((scene) => {
          const title = scene.querySelector<HTMLElement>(".scene__title");
          const img = scene.querySelector<HTMLElement>(
            ".scene__canvas img, .scene__canvas video",
          );

          if (title) {
            // WIPE. `clip-path` keeps the type in the document at full size —
            // the layout never reflows, so the mask cannot cause a jump.
            //
            // The timeline is built paused and played from a STANDALONE
            // trigger rather than being attached to one. Attaching it and
            // using `once: true` kills the timeline along with the trigger as
            // soon as the end position is passed — so a reader scrolling
            // quickly left the copy frozen part-way, stuck at whatever opacity
            // it had reached. Detached, the entrance always finishes.
            const tl = gsap.timeline({ paused: true });

            tl.fromTo(
              title,
              { clipPath: "inset(0 0 100% 0)" },
              {
                clipPath: "inset(0 0 -12% 0)",
                duration: 0.95,
                ease: "power3.out",
              },
            );

            // The lead and the button are deliberately NOT animated here. They
            // were, with `.from({autoAlpha: 0})`, and a reader scrolling
            // quickly through four scenes left them stranded at whatever
            // opacity the tween had reached — measurably stuck around 0.85,
            // in production as well as dev, on every scene after the first.
            //
            // They now fade with a CSS transition keyed off `.is-in` instead.
            // A transition always arrives at its end value; it cannot be
            // killed part-way by a trigger tearing itself down. Reserve GSAP
            // for the one thing it is genuinely needed for here — sequencing
            // the title wipe — and let CSS own anything whose only job is to
            // end up visible.

            triggers.push(
              ScrollTrigger.create({
                trigger: scene,
                start: "top 72%",
                once: true,
                onEnter: () => tl.play(),
              }),
            );
          }

          // DRIFT. Wide viewports only: on a phone the scene is a short banner
          // rather than a held plate, and scaling it just costs paint.
          if (img && wide) {
            const drift = gsap.fromTo(
              img,
              { scale: 1.1 },
              {
                scale: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: scene,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 0.6,
                },
              },
            );
            if (drift.scrollTrigger) triggers.push(drift.scrollTrigger);
          }
        });

        return () => triggers.forEach((t) => t.kill());
      },
    );

    return () => mm.revert();
  });

  return null;
}
