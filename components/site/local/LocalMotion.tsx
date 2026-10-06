"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import type { LocalVariant } from "./drawings";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

/**
 * Motion for the Calgary pages. The markup is server-rendered and complete;
 * this only adds:
 *   hero    depth planes follow the pointer; on the river sheet a task travels
 *           the Bow and lights each bridge (station) it crosses
 *   thesis  the statement is lit word by word as it is read
 *   caps    the capability sheet unfolds like a map as it arrives
 *   proof   the real artifacts tilt toward the pointer, phone on a nearer plane
 * Reduced motion: none of it runs; CSS shows everything finished.
 */
export function LocalMotion({ variant }: { variant: LocalVariant }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".loc");
    if (!root) return;
    const mm = gsap.matchMedia();

    mm.add(
      { motion: "(prefers-reduced-motion: no-preference)", fine: "(pointer: fine)" },
      (context) => {
        const { motion, fine } = context.conditions as { motion: boolean; fine: boolean };
        if (!motion) return;
        const cleanups: (() => void)[] = [];

        /* ---- hero depth ---- */
        const hero = root.querySelector<HTMLElement>(".loc-hero");
        if (hero && fine) {
          const planes = gsap.utils.toArray<HTMLElement>("[data-depth]", hero).map((el) => {
            const depth = Number(el.dataset.depth || 0.5);
            return {
              depth,
              x: gsap.quickTo(el, "x", { duration: 1.1, ease: "power3.out" }),
              y: gsap.quickTo(el, "y", { duration: 1.1, ease: "power3.out" }),
            };
          });
          const move = (e: PointerEvent) => {
            const r = hero.getBoundingClientRect();
            const nx = (e.clientX - r.left) / r.width - 0.5;
            const ny = (e.clientY - r.top) / r.height - 0.5;
            planes.forEach((p) => {
              p.x(nx * -22 * p.depth);
              p.y(ny * -16 * p.depth);
            });
          };
          hero.addEventListener("pointermove", move);
          cleanups.push(() => hero.removeEventListener("pointermove", move));
        }

        // Touch: no pointer, so depth comes from the scroll instead. As the
        // hero leaves, the art lifts away faster than the map beneath it.
        if (hero && !fine) {
          gsap.utils.toArray<HTMLElement>("[data-depth]", hero).forEach((el) => {
            const depth = Number(el.dataset.depth || 0.5);
            gsap.to(el, {
              y: -depth * 56,
              ease: "none",
              scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
            });
          });
        }

        /* ---- river: a task crosses every station ---- */
        if (variant === "river") {
          const path = root.querySelector<SVGPathElement>(".ld-signal--thin");
          const signal = root.querySelector<SVGGElement>(".loc-signal");
          const bridges = gsap.utils.toArray<SVGPathElement>("[data-station]", root);
          const labels = gsap.utils.toArray<HTMLElement>("[data-station-label]", root);
          if (path && signal) {
            const len = path.getTotalLength();
            // Where along the river each bridge sits.
            const marks = bridges.map((b) => {
              const bb = b.getBBox();
              const cx = bb.x + bb.width / 2;
              const cy = bb.y + bb.height / 2;
              let best = 0;
              let bestD = Infinity;
              for (let s = 0; s <= 240; s++) {
                const pt = path.getPointAtLength((s / 240) * len);
                const dd = (pt.x - cx) ** 2 + (pt.y - cy) ** 2;
                if (dd < bestD) {
                  bestD = dd;
                  best = s / 240;
                }
              }
              return best;
            });
            const light = (progress: number) => {
              marks.forEach((m, n) => {
                const on = progress >= m;
                bridges[n]?.classList.toggle("is-lit", on);
                labels[n]?.classList.toggle("is-lit", on);
              });
            };
            gsap.set(signal, { opacity: 0 });
            const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.2, delay: 2.6 });
            tl.set(signal, { opacity: 1 })
              .to(signal, {
                duration: 7.5,
                ease: "none",
                motionPath: { path, align: path, alignOrigin: [0.5, 0.5], start: 0.02, end: 0.98 },
                onUpdate() {
                  light(0.02 + this.progress() * 0.96);
                },
              })
              .to(signal, { opacity: 0, duration: 0.6 })
              .call(() => light(-1));
            const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? tl.resume() : tl.pause()));
            if (hero) io.observe(hero);
            cleanups.push(() => {
              io.disconnect();
              tl.kill();
              light(2);
            });
          }
        }

        /* ---- thesis: read word by word ---- */
        const punch = root.querySelector<HTMLElement>(".loc-thesis__punch");
        if (punch) {
          const words = gsap.utils.toArray<HTMLElement>(".loc-w", punch);
          const tl = gsap.timeline({
            scrollTrigger: { trigger: punch, start: "top 88%", end: "bottom 52%", scrub: 0.6 },
          });
          words.forEach((w, i) => {
            tl.fromTo(w, { opacity: 0.14, yPercent: 18 }, { opacity: 1, yPercent: 0, duration: 1, ease: "power2.out" }, i * 0.55);
          });
          const rule = root.querySelector(".loc-thesis__punch em");
          if (rule) tl.fromTo(rule, { "--rule": 0 }, { "--rule": 1, duration: 1.2, ease: "power2.inOut" }, ">-0.4");
        }

        /* ---- capabilities: the map unfolds ---- */
        gsap.utils.toArray<HTMLElement>(".loc-cap", root).forEach((cap, i) => {
          const face = cap.querySelector<HTMLElement>(".loc-cap__face");
          if (!face) return;
          gsap.fromTo(
            face,
            { rotateX: -78, opacity: 0.25, transformOrigin: "50% 0%" },
            {
              rotateX: 0,
              opacity: 1,
              ease: "power2.out",
              scrollTrigger: { trigger: cap, start: `top ${96 - (i % 3) * 3}%`, end: `top ${70 - (i % 3) * 3}%`, scrub: 0.5 },
            },
          );
        });

        /* ---- proof: tilt the real artifacts ---- */
        const stage = root.querySelector<HTMLElement>(".loc-proof__stage");
        const tilt = root.querySelector<HTMLElement>(".loc-proof__tilt");
        if (stage && tilt && fine) {
          const rx = gsap.quickTo(tilt, "rotateX", { duration: 0.9, ease: "power3.out" });
          const ry = gsap.quickTo(tilt, "rotateY", { duration: 0.9, ease: "power3.out" });
          const phone = tilt.querySelector<HTMLElement>(".stage__phone");
          const px = phone ? gsap.quickTo(phone, "x", { duration: 0.9, ease: "power3.out" }) : null;
          const py = phone ? gsap.quickTo(phone, "y", { duration: 0.9, ease: "power3.out" }) : null;
          const move = (e: PointerEvent) => {
            const r = stage.getBoundingClientRect();
            const nx = (e.clientX - r.left) / r.width - 0.5;
            const ny = (e.clientY - r.top) / r.height - 0.5;
            ry(nx * 9);
            rx(ny * -7);
            px?.(nx * 18);
            py?.(ny * 14);
          };
          const leave = () => {
            rx(0);
            ry(0);
            px?.(0);
            py?.(0);
          };
          stage.addEventListener("pointermove", move);
          stage.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            stage.removeEventListener("pointermove", move);
            stage.removeEventListener("pointerleave", leave);
          });
        }

        // Touch: the artifacts swing into view on the scroll, phone nearer.
        if (stage && tilt && !fine) {
          const st = { trigger: stage, start: "top bottom", end: "bottom top", scrub: 0.4 };
          gsap.fromTo(tilt, { rotateX: 16, rotateY: -10, y: 36 }, { rotateX: -5, rotateY: 5, y: -18, ease: "none", scrollTrigger: st });
          const phone = tilt.querySelector<HTMLElement>(".stage__phone");
          if (phone) gsap.fromTo(phone, { y: 54 }, { y: -36, ease: "none", scrollTrigger: { ...st } });
        }

        return () => cleanups.forEach((fn) => fn());
      },
      root,
    );

    return () => mm.revert();
  }, [variant]);

  return null;
}
