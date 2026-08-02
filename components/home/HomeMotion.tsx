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

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      /* The cover drifts on every screen. This used to sit in the >=701px
         block, so the phone hero was the one place on the site where the
         backdrop was completely static — and with the plotted mark removed at
         that width, it was the only motion the cover had left. The survey line
         below still requires a fine pointer, because there is nothing for it
         to follow on a touch screen. */
      const heroTerrain = root.querySelector<HTMLElement>(".hero__terrain");
      const heroSection = root.querySelector<HTMLElement>(".hero");
      if (heroTerrain && heroSection) {
        gsap.fromTo(
          heroTerrain,
          { yPercent: -1, scale: 1.035 },
          {
            yPercent: 2,
            scale: 1.075,
            ease: "none",
            scrollTrigger: {
              trigger: heroSection,
              start: "top top",
              end: "bottom top",
              scrub: 0.8,
            },
          },
        );
      }

      const statement = root.querySelector<HTMLElement>(".statement");
      if (!statement) return;

      const demand = statement.querySelector<HTMLElement>(".statement__demand");
      const operatorLabel = statement.querySelector<HTMLElement>(
        ".statement__operator span",
      );
      const operatorMark = statement.querySelector<HTMLElement>(
        ".statement__operator strong",
      );
      const admin = statement.querySelector<HTMLElement>(".statement__admin");
      const outcomes = gsap.utils.toArray<HTMLElement>(
        statement.querySelectorAll(".statement__outcomes p"),
      );
      const demandPath =
        statement.querySelector<SVGPathElement>(".crossover__demand");
      const signal =
        statement.querySelector<SVGCircleElement>(".crossover__signal");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: statement,
          start: "top 72%",
          once: true,
        },
      });

      tl.from(demand, {
        autoAlpha: 0,
        y: 14,
        duration: 0.62,
        ease: "power3.out",
      })
        .from(
          operatorLabel,
          { autoAlpha: 0, duration: 0.32, ease: "power2.out" },
          "-=0.2",
        )
        .from(
          operatorMark,
          {
            autoAlpha: 0,
            scale: 0.86,
            rotation: -4,
            duration: 0.48,
            ease: "power3.out",
          },
          "-=0.14",
        )
        .from(
          admin,
          {
            autoAlpha: 0,
            y: 18,
            duration: 0.68,
            ease: "power3.out",
          },
          "-=0.24",
        )
        .from(
          outcomes,
          {
            autoAlpha: 0,
            x: 10,
            duration: 0.42,
            stagger: 0.09,
            ease: "power2.out",
          },
          "-=0.08",
        );

      if (demandPath && signal) {
        const travel = { progress: 0 };
        const pathLength = demandPath.getTotalLength();

        tl.set(signal, { autoAlpha: 1 }, 0.8)
          .to(
            travel,
            {
              progress: 1,
              duration: 1.35,
              ease: "power1.inOut",
              onUpdate: () => {
                const point = demandPath.getPointAtLength(
                  travel.progress * pathLength,
                );
                signal.setAttribute("cx", point.x.toFixed(2));
                signal.setAttribute("cy", point.y.toFixed(2));
              },
            },
            0.8,
          )
          .to(signal, { autoAlpha: 0, duration: 0.22 }, ">-0.08");
      }
    });

    mm.add(
      "(min-width: 701px) and (prefers-reduced-motion: no-preference)",
      () => {
        let surveyCleanup: (() => void) | undefined;
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

          // The press instrument is no longer mounted on the illustration
          // plate, so the ledger animation starts at the strike-through. GSAP
          // warns on a missing target rather than skipping it, which is why the
          // tweens are gone rather than left pointing at nothing.
          tl.to(
              before,
              {
                "--strike-scale": 1,
                duration: 0.42,
                stagger: 0.07,
                ease: "power2.inOut",
              },
              "-=0.2",
            )
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
                y: 18,
                duration: 0.5,
                stagger: 0.07,
                ease: "power3.out",
              },
              "-=0.2",
            );
        }

        const track = root.querySelector<HTMLElement>(".track");
        if (track) {
          const stops = gsap.utils.toArray<HTMLElement>(
            track.querySelectorAll(".track__stop"),
          );
          gsap.fromTo(
            stops,
            { autoAlpha: 0, y: 18 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.1,
              ease: "power3.out",
              scrollTrigger: { trigger: track, start: "top 82%", once: true },
            },
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

        const hero = root.querySelector<HTMLElement>(".hero");

        const survey = root.querySelector<HTMLElement>(".hero__survey");
        if (survey && hero && window.matchMedia("(pointer: fine)").matches) {
          // Right to left. The pass now opens on the side the plotted mark sits
          // on and travels back across the headline, so the sweep runs against
          // the reading direction and the reader meets it head on instead of
          // being chased by it.
          const idle = gsap.fromTo(
            survey,
            { "--scan-x": "82%" },
            {
              "--scan-x": "18%",
              duration: 8,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
            },
          );

          const onPointerMove = (event: PointerEvent) => {
            if (event.pointerType === "touch") return;
            const bounds = hero.getBoundingClientRect();
            const progress = gsap.utils.clamp(
              0.08,
              0.92,
              (event.clientX - bounds.left) / bounds.width,
            );
            idle.pause();
            gsap.to(survey, {
              "--scan-x": `${progress * 100}%`,
              duration: 0.7,
              ease: "power3.out",
              overwrite: true,
            });
          };

          const onPointerLeave = () => idle.restart();

          hero.addEventListener("pointermove", onPointerMove);
          hero.addEventListener("pointerleave", onPointerLeave);
          surveyCleanup = () => {
            idle.kill();
            hero.removeEventListener("pointermove", onPointerMove);
            hero.removeEventListener("pointerleave", onPointerLeave);
          };
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

        return () => surveyCleanup?.();
      },
    );

    return () => mm.revert();
  });

  return null;
}
