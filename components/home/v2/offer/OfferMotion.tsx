"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Scope = "teardown" | "offer" | "automation";

/**
 * Scroll-tied depth for the three offer sections. Nothing here is an entrance:
 * every tween is scrubbed to scroll position, and every CSS default is the
 * FINISHED state, so no JS or reduced motion shows the designed final frame.
 *
 *  teardown   the three-step track draws left to right as you read it
 *  offer      the diagram's routes draw into the intake; the plate settles
 *  automation each manual step is struck out in turn; the bear plate settles
 */
export function OfferMotion({ scope }: { scope: Scope }) {
  useGSAP(() => {
    const root = document.querySelector<HTMLElement>(`[data-ofr="${scope}"]`);
    if (!root) return;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (scope === "teardown") {
        const line = root.querySelector<HTMLElement>(".ofr-td__line");
        const track = root.querySelector<HTMLElement>(".ofr-td__steps");
        if (line && track) {
          gsap.fromTo(
            line,
            { "--run": 0 },
            {
              "--run": 1,
              ease: "none",
              scrollTrigger: {
                trigger: track,
                start: "top 82%",
                end: "bottom 55%",
                scrub: 0.6,
              },
            },
          );
        }
        const sheet = root.querySelector<HTMLElement>(".ofr-td__cursor");
        if (sheet) {
          gsap.fromTo(
            sheet,
            { "--sel": 0 },
            {
              "--sel": 1,
              ease: "none",
              scrollTrigger: {
                trigger: root,
                start: "top 60%",
                end: "top 15%",
                scrub: 0.6,
              },
            },
          );
        }
      }

      if (scope === "offer") {
        root
          .querySelectorAll<SVGPathElement>(".ofr-of__route")
          .forEach((p, i) => {
            gsap.fromTo(
              p,
              { strokeDashoffset: 1 },
              {
                strokeDashoffset: 0,
                ease: "none",
                scrollTrigger: {
                  trigger: p.closest(".ofr-of__diagram"),
                  start: `top ${78 - i * 3}%`,
                  end: `center ${52 - i * 3}%`,
                  scrub: 0.5,
                },
              },
            );
          });
        const plate = root.querySelector<HTMLElement>(".ofr-of__plate-img");
        if (plate) {
          gsap.fromTo(
            plate,
            { scale: 1.14 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: plate.closest(".ofr-of__plate"),
                start: "top bottom",
                end: "bottom 30%",
                scrub: true,
              },
            },
          );
        }
      }

      if (scope === "automation") {
        root.querySelectorAll<HTMLElement>(".ofr-au__row").forEach((row) => {
          gsap.fromTo(
            row,
            { "--strike": 0 },
            {
              "--strike": 1,
              ease: "none",
              scrollTrigger: {
                trigger: row,
                start: "top 78%",
                end: "top 48%",
                scrub: 0.4,
              },
            },
          );
        });
        const bear = root.querySelector<HTMLElement>(".ofr-au__bear-img");
        if (bear) {
          gsap.fromTo(
            bear,
            { scale: 1.12, yPercent: 4 },
            {
              scale: 1,
              yPercent: -3,
              ease: "none",
              scrollTrigger: {
                trigger: root,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        }
      }
    });

    return () => mm.revert();
  }, [scope]);

  return null;
}
