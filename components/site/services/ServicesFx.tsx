"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

/**
 * Scroll motion for the services chapters. Each one explains something:
 *   the island scene sits on its own depth plane (it's a place, not an icon),
 *   the bridge deck between chapters draws as you cross from one to the next,
 *   the "everything on this island" tags gather from scattered to settled.
 * Mouse screens add pointer tilt; touch screens get scroll-driven depth
 * instead (the scene rises out of the page and recedes as the copy passes
 * over it). Reduced motion: nothing runs; the CSS shows the finished state.
 */
export function ServicesFx() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".svx");
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cleanups: (() => void)[] = [];
    const mm = gsap.matchMedia(root);

    // ---- Everywhere ------------------------------------------------------
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".svx-atmos__num").forEach((el) => {
        const ch = el.closest(".svx-ch") ?? el;
        gsap.fromTo(
          el,
          { yPercent: 18 },
          {
            yPercent: -18,
            ease: "none",
            scrollTrigger: { trigger: ch, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      // The deck between chapters draws across the boundary, a signal riding it.
      gsap.utils.toArray<HTMLElement>(".svx-span").forEach((span) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: span, start: "top 92%", end: "bottom 40%", scrub: 0.6 },
        });
        span.querySelectorAll("svg").forEach((svg) => {
          const deck = svg.querySelector<SVGPathElement>(".svx-span__deck");
          const signal = svg.querySelector<SVGCircleElement>(".svx-span__signal");
          if (!deck || !signal) return;
          let length = 0;
          try {
            length = deck.getTotalLength();
          } catch {
            return;
          }
          const state = { p: 0 };
          const place = () => {
            const pt = deck.getPointAtLength(length * state.p);
            signal.setAttribute("cx", String(pt.x));
            signal.setAttribute("cy", String(pt.y));
          };
          tl.fromTo(
            svg.querySelectorAll("path"),
            { drawSVG: "0%" },
            { drawSVG: "100%", ease: "none", duration: 1 },
            0,
          ).fromTo(state, { p: 0 }, { p: 1, ease: "none", duration: 1, onUpdate: place }, 0);
        });
        const label = span.querySelector(".svx-span__label");
        if (label) {
          gsap.fromTo(
            label,
            { opacity: 0, y: 12 },
            {
              opacity: 1,
              y: 0,
              scrollTrigger: { trigger: span, start: "top 60%", toggleActions: "play none none reverse" },
            },
          );
        }
      });

      // Tags gather into the field.
      gsap.utils.toArray<HTMLElement>("[data-svx-tags]").forEach((list) => {
        const spread = Math.min(140, window.innerWidth * 0.18);
        gsap.fromTo(
          list.querySelectorAll("li"),
          {
            x: () => gsap.utils.random(-spread, spread),
            y: () => gsap.utils.random(-80, 80),
            rotation: () => gsap.utils.random(-14, 14),
            opacity: 0,
            scale: 0.8,
          },
          {
            x: 0,
            y: 0,
            rotation: 0,
            opacity: 1,
            scale: 1,
            ease: "power2.out",
            stagger: { each: 0.03, from: "random" },
            scrollTrigger: { trigger: list, start: "top 95%", end: "top 55%", scrub: 0.8 },
          },
        );
      });

      // Swipeable proof: a progress rule under the strip.
      gsap.utils.toArray<HTMLElement>(".svx-proof ul").forEach((strip) => {
        const bar = strip.parentElement?.querySelector<HTMLElement>(".svx-proof__bar");
        if (!bar) return;
        const update = () => {
          const max = strip.scrollWidth - strip.clientWidth;
          const view = strip.clientWidth / strip.scrollWidth;
          bar.style.setProperty("--view", String(view));
          bar.style.setProperty("--sp", max > 0 ? String(strip.scrollLeft / max) : "0");
        };
        update();
        strip.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        cleanups.push(() => {
          strip.removeEventListener("scroll", update);
          window.removeEventListener("resize", update);
        });
      });
    }, root);

    // ---- Wide screens with a mouse: parallax + pointer tilt ---------------
    mm.add("(min-width: 901px) and (hover: hover) and (pointer: fine)", () => {
      gsap.utils.toArray<HTMLElement>(".svx-art__float").forEach((el) => {
        const ch = el.closest(".svx-ch") ?? el;
        gsap.fromTo(
          el,
          { y: 50 },
          {
            y: -50,
            ease: "none",
            scrollTrigger: { trigger: ch, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      const offs: (() => void)[] = [];
      gsap.utils.toArray<HTMLElement>("[data-svx-tilt]").forEach((el) => {
        const ch = el.closest<HTMLElement>(".svx-ch");
        if (!ch) return;
        gsap.set(el, { transformPerspective: 900 });
        const rx = gsap.quickTo(el, "rotationX", { duration: 1.1, ease: "power3.out" });
        const ry = gsap.quickTo(el, "rotationY", { duration: 1.1, ease: "power3.out" });
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const cx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
          const cy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
          ry(gsap.utils.clamp(-12, 12, cx * 22));
          rx(gsap.utils.clamp(-8, 8, -cy * 14));
        };
        const leave = () => {
          rx(0);
          ry(0);
        };
        ch.addEventListener("pointermove", move);
        ch.addEventListener("pointerleave", leave);
        offs.push(() => {
          ch.removeEventListener("pointermove", move);
          ch.removeEventListener("pointerleave", leave);
        });
      });
      return () => offs.forEach((fn) => fn());
    });

    // ---- Touch / narrow: scroll-driven depth instead of a pointer ---------
    mm.add("(max-width: 900px), (hover: none)", () => {
      gsap.utils.toArray<HTMLElement>(".svx-ch").forEach((ch) => {
        const float = ch.querySelector<HTMLElement>(".svx-art__float");
        const art = ch.querySelector<HTMLElement>(".svx-art");
        const intro = ch.querySelector<HTMLElement>(".svx-ch__intro");
        if (!float || !art || !intro) return;
        gsap.set(float, { transformPerspective: 700, transformOrigin: "50% 85%" });
        // The scene rises out of the water and tips upright as it arrives…
        gsap.fromTo(
          float,
          { rotationX: 28, scale: 0.84, y: 60 },
          {
            rotationX: 0,
            scale: 1,
            y: 0,
            ease: "none",
            scrollTrigger: { trigger: ch, start: "top 95%", end: "top 15%", scrub: 0.5 },
          },
        );
        // …then recedes while the copy slides up over it.
        gsap.fromTo(
          art,
          { opacity: 1 },
          {
            opacity: 0.4,
            scale: 0.92,
            immediateRender: false,
            ease: "none",
            scrollTrigger: { trigger: intro, start: "top 50%", end: "top 5%", scrub: 0.5 },
          },
        );
      });
    });

    const t = window.setTimeout(() => ScrollTrigger.refresh(), 600);

    return () => {
      window.clearTimeout(t);
      cleanups.forEach((fn) => fn());
      mm.revert();
      ctx.revert();
    };
  }, []);

  return null;
}
