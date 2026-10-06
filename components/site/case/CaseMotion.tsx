"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const DESKTOP = "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const MOTION = "(prefers-reduced-motion: no-preference)";
/** Everything that isn't the desktop pin: phones, tablets, touch laptops. */
const TOUCH =
  "(prefers-reduced-motion: no-preference) and (max-width: 1023px), (prefers-reduced-motion: no-preference) and (pointer: coarse)";

/**
 * Scroll choreography for a case study, wired by class names so the page
 * itself stays a server component.
 *
 *   .cx-reel     the recording opens from a framed stage to full bleed (pinned, desktop)
 *   .cx-story    the sticky frame follows the chapter being read
 *   .cx-kinetic  words light up as they are read
 *   .cx-next     the next page lifts toward the reader
 *
 * Reduced motion: none of this runs, and the CSS defaults are the static layout.
 */
export function CaseMotion() {
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(DESKTOP, () => {
      // ---- The reel: framed stage → full bleed, phone on the nearer plane.
      const reel = document.querySelector<HTMLElement>(".cx-reel");
      if (reel) {
        reel.classList.add("is-cine");
        const frame = reel.querySelector(".cx-reel__frame");
        const inner = reel.querySelector(".cx-reel__inner");
        const phone = reel.querySelector(".cx-reel__phone");
        const wash = reel.querySelector(".cx-reel__wash");
        const cap = reel.querySelector(".cx-reel__cap");
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: reel,
            start: "top top",
            end: "+=120%",
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
          },
        });
        tl.fromTo(
          frame,
          { clipPath: "inset(13% 17% 13% 17% round 18px)" },
          { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1 },
          0,
        )
          .fromTo(inner, { scale: 1.16 }, { scale: 1, duration: 1 }, 0)
          .fromTo(wash, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0)
          .fromTo(phone, { yPercent: 18, xPercent: 0, rotate: 4 }, { yPercent: -46, xPercent: -10, rotate: -2, duration: 1 }, 0)
          .fromTo(cap, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.25 }, 0.7);
        return () => reel.classList.remove("is-cine");
      }
    });

    mm.add(DESKTOP, () => {
      // ---- Story: the sticky frame follows the chapter in view.
      const story = document.querySelector<HTMLElement>(".cx-story");
      if (!story) return;
      const media = story.querySelector<HTMLElement>(".cx-story__media");
      const figure = media?.querySelector<HTMLElement>(".cxf");
      const chapters = gsap.utils.toArray<HTMLElement>(".cx-ch", story);
      const set = (i: number) => {
        if (!media) return;
        media.dataset.active = String(i);
        if (figure) figure.dataset.step = String(i);
        chapters.forEach((c, j) => c.classList.toggle("is-active", i === j));
      };
      set(0);
      media?.classList.add("is-live");
      chapters.forEach((ch, i) => {
        ScrollTrigger.create({
          trigger: ch,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && set(i),
        });
      });
      gsap.fromTo(
        ".cx-story__fill",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: story.querySelector(".cx-story__text"), start: "top 55%", end: "bottom 55%", scrub: true },
        },
      );
      return () => media?.classList.remove("is-live");
    });

    mm.add(MOTION, () => {
      // ---- Kinetic type: each word lights as it crosses the reading line.
      gsap.utils.toArray<HTMLElement>(".cx-kinetic").forEach((block) => {
        const words = block.querySelectorAll(".cx-w");
        gsap.fromTo(
          words,
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.08,
            scrollTrigger: { trigger: block, start: "top 82%", end: "bottom 52%", scrub: 0.4 },
          },
        );
      });

      // ---- What changed: the rule draws, the stamp lands.
      const changed = document.querySelector<HTMLElement>(".cx-changed");
      if (changed) {
        gsap.fromTo(
          changed.querySelector(".cx-changed__rule"),
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { trigger: changed, start: "top 70%", end: "bottom 70%", scrub: true },
          },
        );
        gsap.fromTo(
          changed.querySelector(".cx-changed__big"),
          { yPercent: 30 },
          {
            yPercent: -20,
            ease: "none",
            scrollTrigger: { trigger: changed, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      }

      // ---- Next: the next page lifts toward the reader.
      const next = document.querySelector<HTMLElement>(".cx-next__page");
      if (next) {
        gsap.fromTo(
          next,
          { rotateX: 16, yPercent: 10, scale: 0.9, transformOrigin: "50% 100%" },
          {
            rotateX: 0,
            yPercent: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: ".cx-next", start: "top bottom", end: "top 25%", scrub: 0.5 },
          },
        );
      }

    });

    mm.add(TOUCH, () => {
      // ---- The reel on touch: a CSS-sticky stage (no pin, no scroll-jacking).
      // The recording opens from a framed band to the whole screen while the
      // phone capture rises from the corner to centre stage, on a nearer plane.
      const reel = document.querySelector<HTMLElement>(".cx-reel");
      if (reel) {
        reel.classList.add("is-flow");
        const stage = reel.querySelector<HTMLElement>(".cx-reel__stage");
        const frame = reel.querySelector<HTMLElement>(".cx-reel__frame");
        const inner = reel.querySelector(".cx-reel__inner");
        const phone = reel.querySelector<HTMLElement>(".cx-reel__phone");
        const wash = reel.querySelector(".cx-reel__wash");
        const shade = reel.querySelector(".cx-reel__shade");
        const cap = reel.querySelector(".cx-reel__cap");
        const isFigure = frame?.classList.contains("cx-reel__frame--figure");
        if (stage && frame) {
          // The opening band matches the media's own shape, inside the gutters.
          const band = () => {
            const w = stage.clientWidth;
            const h = stage.clientHeight;
            const gx = Math.min(24, w * 0.05);
            const ratio = isFigure ? (w < 560 ? 1 / 0.9 : 16 / 10) : 1280 / 682;
            const bh = Math.min(h * 0.7, (w - gx * 2) / ratio);
            const gy = (h - bh) / 2;
            return { gx, gy, w, h, bh };
          };
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: reel,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          });
          tl.fromTo(
            frame,
            {
              clipPath: () => {
                const b = band();
                return `inset(${b.gy}px ${b.gx}px ${b.gy}px ${b.gx}px round 14px)`;
              },
            },
            { clipPath: "inset(0px 0px 0px 0px round 0px)", duration: 1 },
            0,
          )
            .fromTo(
              inner,
              {
                // Start with the whole recording fitted inside the band, then
                // zoom until it covers the screen.
                scale: () => {
                  if (isFigure) return 0.92;
                  const b = band();
                  const coverW = Math.max(b.w, b.h * (1280 / 682));
                  return (b.w - b.gx * 2) / coverW;
                },
              },
              { scale: 1, duration: 1 },
              0,
            )
            .fromTo(wash, { opacity: 0.2 }, { opacity: 1, duration: 0.8 }, 0);
          if (phone) {
            tl.fromTo(shade, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.35).fromTo(
              phone,
              {
                x: () => {
                  const b = band();
                  return b.w / 2 - b.gx - phone.offsetWidth * 0.2 - 8;
                },
                y: () => {
                  const b = band();
                  return b.bh / 2 + phone.offsetHeight * 0.06;
                },
                scale: 0.42,
                rotate: 5,
              },
              { x: 0, y: 0, scale: 1, rotate: -2, duration: 1, ease: "power1.inOut" },
              0,
            );
          }
          tl.fromTo(cap, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.2 }, 0.8);
        }
      }

      // ---- Chapters on touch: the media card holds (CSS sticky) while the
      // chapter's text slides up over it; the card recedes as it is covered.
      gsap.utils.toArray<HTMLElement>(".cx-ch").forEach((ch) => {
        const media = ch.querySelector(".cx-ch__media");
        const card = ch.querySelector(".cx-ch__card");
        if (!media || !card) return;
        gsap.fromTo(
          media,
          { scale: 1, opacity: 1 },
          {
            scale: 0.9,
            opacity: 0.35,
            ease: "none",
            scrollTrigger: { trigger: card, start: "top 92%", end: "top 30%", scrub: true },
          },
        );
        gsap.fromTo(
          ch.querySelector(".cx-ch__num"),
          { yPercent: 40 },
          {
            yPercent: -30,
            ease: "none",
            scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      return () => reel?.classList.remove("is-flow");
    });

    const refresh = () => ScrollTrigger.refresh();
    const t = window.setTimeout(refresh, 400);
    window.addEventListener("load", refresh);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("load", refresh);
      mm.revert();
    };
  }, []);

  return null;
}
