"use client";

import { useEffect, useRef } from "react";

/**
 * Calgary snow for the phone hero: three depths of flakes on one canvas.
 * Near flakes are larger, faster and brighter; far ones are specks. Runs only
 * on phones and tablets, never with reduced motion, and sleeps off screen.
 */
export function Snow() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const small = window.matchMedia("(max-width: 900px)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    type Flake = { x: number; y: number; r: number; z: number; drift: number; phase: number };
    let flakes: Flake[] = [];
    let w = 0;
    let h = 0;
    let frame = 0;
    let running = false;
    let last = 0;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(90, (w * h) / 5200));
      flakes = Array.from({ length: count }, () => {
        const z = Math.random();
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.5 + z * 1.5,
          z,
          drift: 6 + Math.random() * 14,
          phase: Math.random() * Math.PI * 2,
        };
      });
    };

    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - (last || t)) / 1000);
      last = t;
      ctx.clearRect(0, 0, w, h);
      for (const f of flakes) {
        f.y += (14 + f.z * 38) * dt;
        f.phase += dt * (0.6 + f.z * 0.8);
        const x = f.x + Math.sin(f.phase) * f.drift;
        if (f.y - f.r > h) {
          f.y = -f.r;
          f.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.arc(x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(241, 235, 223, ${0.18 + f.z * 0.55})`;
        ctx.fill();
      }
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || !small.matches || still.matches) return;
      running = true;
      last = 0;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const seen = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    const onResize = () => {
      size();
      if (!small.matches) stop();
    };

    size();
    seen.observe(canvas);
    window.addEventListener("resize", onResize);
    small.addEventListener("change", onResize);
    return () => {
      stop();
      seen.disconnect();
      window.removeEventListener("resize", onResize);
      small.removeEventListener("change", onResize);
    };
  }, []);

  return <canvas ref={ref} className="hero__snow" aria-hidden="true" />;
}
