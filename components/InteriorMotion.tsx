"use client";

import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// This component lives in the root layout, so its module is evaluated during
// static generation as well as in the browser. ScrollTrigger needs `document`
// and must only be registered on the client.
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

type Sequence = {
  container: string;
  items: string;
  start?: string;
  stagger?: number;
  y?: number;
};

/**
 * Shared motion for the site's interior documents.
 *
 * The homepage has its own choreography, so this layer deliberately leaves it
 * alone. On the remaining routes, animation follows the document structure:
 * headings establish the next chapter, records resolve in reading order, and
 * full-bleed evidence receives a shallow optical push as it crosses the frame.
 * Nothing is pinned and nothing is moved horizontally away from its layout.
 *
 * There are no CSS-dependent hidden states here. Without JavaScript, and when
 * reduced motion is requested, every target remains complete and readable.
 */
export function InteriorMotion() {
  const pathname = usePathname();

  useGSAP(
    () => {
      if (typeof document === "undefined" || pathname === "/") return;

      const main = document.querySelector<HTMLElement>("#main");
      if (!main) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const animated = new WeakSet<Element>();
        const mark = (items: HTMLElement[]) => {
          items.forEach((item) => animated.add(item));
          return items;
        };

        const firstSection = main.querySelector<HTMLElement>("section");
        if (firstSection) {
          const eyebrow = firstSection.querySelector<HTMLElement>(
            ".route-open__overline, .scene__folio, .tick-label, .crumbs",
          );
          const title = firstSection.querySelector<HTMLElement>(
            "h1, .route-open__title, .scene__title",
          );
          const intro = firstSection.querySelector<HTMLElement>(
            ".route-open__intro, .scene__lead, .masthead__intro",
          );
          const folio = firstSection.querySelector<HTMLElement>(
            ".masthead__folio",
          );

          const opening = [eyebrow, title, intro, folio].filter(
            (item): item is HTMLElement => Boolean(item),
          );
          mark(opening);

          const entrance = gsap.timeline({
            defaults: { ease: "power3.out" },
          });

          if (eyebrow) {
            entrance.from(eyebrow, {
              autoAlpha: 0,
              y: 8,
              duration: 0.45,
              clearProps: "opacity,visibility,transform",
            });
          }
          if (title) {
            entrance.from(
              title,
              {
                autoAlpha: 0,
                yPercent: 9,
                duration: 0.88,
                clearProps: "opacity,visibility,transform",
              },
              eyebrow ? "-=0.2" : 0,
            );
          }
          if (intro) {
            entrance.from(
              intro,
              {
                autoAlpha: 0,
                y: 14,
                duration: 0.62,
                clearProps: "opacity,visibility,transform",
              },
              "-=0.52",
            );
          }
          if (folio) {
            entrance.from(
              folio,
              {
                autoAlpha: 0,
                duration: 0.45,
                clearProps: "opacity,visibility",
              },
              "-=0.32",
            );
          }
        }

        // Chapter headings arrive as a unit with their label and standfirst.
        // The scene titles are sequenced separately against their artwork.
        main.querySelectorAll<HTMLElement>("section").forEach((section) => {
          if (section === firstSection) return;

          const heading = section.querySelector<HTMLElement>("h2");
          if (
            !heading ||
            heading.closest(".scene__mark, .process-stop, .cta") ||
            animated.has(heading)
          ) {
            return;
          }

          const parent = heading.parentElement;
          const siblings = Array.from(parent?.children ?? []).filter(
            (item): item is HTMLElement => item instanceof HTMLElement,
          );
          const label = siblings.find(
            (item) =>
              item.matches(".tick-label") ||
              (item.tagName === "P" && item === siblings[0]),
          );
          const copy = siblings.find(
            (item) =>
              item.matches(".t-body, .t-lead") ||
              (item.tagName === "P" && item === siblings.at(-1)),
          );
          const targets = [label, heading, copy].filter(
            (item): item is HTMLElement => Boolean(item),
          );
          mark(targets);

          const tl = gsap.timeline({
            ...(parent && parent.getBoundingClientRect().top < innerHeight * 0.86
              ? {}
              : {
                  scrollTrigger: {
                    trigger: parent ?? heading,
                    start: "clamp(top 86%)",
                    once: true,
                  },
                }),
          });
          tl.from(targets, {
            autoAlpha: 0,
            y: (i) => (i === 0 ? 8 : 22),
            duration: 0.72,
            stagger: 0.1,
            ease: "power3.out",
            clearProps: "opacity,visibility,transform",
          });
        });

        const sequences: Sequence[] = [
          {
            container: ".work-sheet",
            items: ".work-sheet__frame",
            stagger: 0.09,
            y: 22,
          },
          {
            container: ".scene__mark",
            items: ":scope > *",
            start: "clamp(top 78%)",
            stagger: 0.1,
            y: 18,
          },
          {
            container: ".atlas-services",
            items: ".atlas-services__item",
            stagger: 0.065,
            y: 18,
          },
          {
            container: ".work-records__grid",
            items: ".work-record",
            stagger: 0.12,
            y: 20,
          },
          {
            container: ".process-legend",
            items: ".process-legend__stop",
            stagger: 0.075,
            y: 12,
          },
          {
            container: ".studio-system__chapters",
            items: ".studio-system__chapter",
            stagger: 0.09,
            y: 24,
          },
          {
            container: ".studio-principles__field",
            items: ".studio-principle",
            stagger: 0.08,
            y: 18,
          },
          {
            container: ".handoff",
            items: ".handoff__step",
            stagger: 0.1,
            y: 18,
          },
          {
            container: ".contexts",
            items: ".contexts__row",
            stagger: 0.055,
            y: 14,
          },
          {
            container: ".ledger",
            items: ".ledger__row",
            stagger: 0.055,
            y: 14,
          },
          {
            container: ".archive",
            items: ".archive__row",
            stagger: 0.06,
            y: 16,
          },
          {
            container: ".proof__gallery",
            items: ".proof__item",
            stagger: 0.08,
            y: 20,
          },
        ];

        sequences.forEach(({ container, items, start, stagger, y }) => {
          main.querySelectorAll<HTMLElement>(container).forEach((group) => {
            const candidates =
              items === ":scope > *"
                ? Array.from(group.children).filter(
                    (item): item is HTMLElement => item instanceof HTMLElement,
                  )
                : Array.from(group.querySelectorAll<HTMLElement>(items));
            const targets = candidates.filter((item) => !animated.has(item));
            if (!targets.length) return;
            mark(targets);

            const alreadyApproaching =
              group.getBoundingClientRect().top < window.innerHeight * 0.86;

            gsap.from(targets, {
              autoAlpha: 0,
              y: y ?? 18,
              duration: 0.7,
              stagger: stagger ?? 0.08,
              ease: "power3.out",
              clearProps: "opacity,visibility,transform",
              ...(alreadyApproaching
                ? { delay: 0.12 }
                : {
                    scrollTrigger: {
                      trigger: group,
                      start: start ?? "clamp(top 84%)",
                      once: true,
                    },
                  }),
            });
          });
        });

        // Each process stop tells a short causal story, so its content resolves
        // in the order a reader uses it rather than the whole stop fading in.
        main
          .querySelectorAll<HTMLElement>(".process-stop")
          .forEach((stop) => {
            const targets = Array.from(stop.children).filter(
              (item): item is HTMLElement =>
                item instanceof HTMLElement &&
                item.matches(
                  ".process-stop__head, h3, .process-stop__summary, .process-stop__detail, .process-stop__deliverables",
                ),
            );
            if (!targets.length) return;
            mark(targets);

            const alreadyApproaching =
              stop.getBoundingClientRect().top < window.innerHeight * 0.8;

            gsap.from(targets, {
              autoAlpha: 0,
              y: 18,
              duration: 0.68,
              stagger: 0.085,
              ease: "power3.out",
              clearProps: "opacity,visibility,transform",
              ...(alreadyApproaching
                ? { delay: 0.16 }
                : {
                    scrollTrigger: {
                      trigger: stop,
                      start: "clamp(top 78%)",
                      once: true,
                    },
                  }),
            });
          });

        // DRAW: actual rules extend from their labelled origin. Pseudo-element
        // rules keep their existing CSS choreography and are not duplicated.
        main
          .querySelectorAll<HTMLElement>(
            ".studio-gap__rule, .process-loop__bracket, .atlas-chapter__bracket, hr",
          )
          .forEach((rule) => {
            gsap.from(rule, {
              scaleX: 0,
              transformOrigin: "left center",
              duration: 0.85,
              ease: "power2.inOut",
              clearProps: "transform",
              scrollTrigger: {
                trigger: rule,
                start: "clamp(top 88%)",
                once: true,
              },
            });
          });

        // A shallow, scroll-linked optical push gives full-bleed evidence life
        // without turning the page into a parallax demo. Transform only: no
        // layout reads are performed while scrolling.
        main
          .querySelectorAll<HTMLElement>(
            ".scene__canvas img, .scene__canvas video, .studio-system__chapter img",
          )
          .forEach((media) => {
            const frame = media.closest<HTMLElement>(
              ".scene, .studio-system__chapter",
            );
            if (!frame) return;

            gsap.fromTo(
              media,
              { scale: 1.035, transformOrigin: "center center" },
              {
                scale: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: frame,
                  start: "clamp(top bottom)",
                  end: "clamp(bottom top)",
                  scrub: 0.45,
                },
              },
            );
          });

      });

      // The scoped useGSAP context owns every tween and ScrollTrigger.
      // matchMedia still needs its own revert so its listener is released.
      return () => mm.revert();
    },
    {
      dependencies: [pathname],
      revertOnUpdate: true,
    },
  );

  return null;
}
