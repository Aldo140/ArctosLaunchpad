"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Tilts each direct child toward a fine pointer, so the plates read as objects.
 * Without a fine pointer the same depth comes from scroll: each plate rises
 * out of a backward lean as it enters.
 */
export function TiltGroup({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) {
      const ctx = gsap.context(() => {
        (Array.from(el.children) as HTMLElement[]).forEach((item) => {
          gsap.fromTo(
            item,
            { "--rx": "14deg", "--ry": "0deg", y: 40 },
            {
              "--rx": "0deg",
              y: 0,
              ease: "none",
              scrollTrigger: { trigger: item, start: "top 98%", end: "top 45%", scrub: 0.4 },
            },
          );
        });
      }, el);
      return () => ctx.revert();
    }
    const items = Array.from(el.children) as HTMLElement[];
    const offs = items.map((item) => {
      const move = (e: PointerEvent) => {
        const r = item.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        item.style.setProperty("--rx", `${(-y * 7).toFixed(2)}deg`);
        item.style.setProperty("--ry", `${(x * 9).toFixed(2)}deg`);
        item.classList.add("is-tilting");
      };
      const leave = () => {
        item.style.setProperty("--rx", "0deg");
        item.style.setProperty("--ry", "0deg");
        item.classList.remove("is-tilting");
      };
      item.addEventListener("pointermove", move);
      item.addEventListener("pointerleave", leave);
      return () => {
        item.removeEventListener("pointermove", move);
        item.removeEventListener("pointerleave", leave);
      };
    });
    return () => offs.forEach((off) => off());
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
