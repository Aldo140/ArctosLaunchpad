"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Feeds pointer and scroll position to CSS (--px, --py, --sy) so the terrain's
 * elevation bands can sit on separate depth planes. Fine pointers only for the
 * pointer part; nothing at all under reduced motion.
 */
export function DepthField({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    const loop = () => {
      x += (tx - x) * 0.07;
      y += (ty - y) * 0.07;
      const r = el.getBoundingClientRect();
      const sy = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height)));
      el.style.setProperty("--px", x.toFixed(4));
      el.style.setProperty("--py", y.toFixed(4));
      el.style.setProperty("--sy", sy.toFixed(4));
      raf = Math.abs(tx - x) > 0.0005 || Math.abs(ty - y) > 0.0005 ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const move = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
      kick();
    };
    if (fine) window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", kick, { passive: true });
    kick();
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", kick);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
