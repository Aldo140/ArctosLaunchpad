"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * Footer sign-off motion. Mounted inside `.ftr`; finds the footer by DOM.
 *
 *  - The bridge art rises into place with depth as the page ends (scroll-scrubbed,
 *    rect-based so it stays correct whatever other sections pin above).
 *  - Pointer tilt gives the art a little 3D on fine pointers.
 *  - The huge wordmark's letters rise out of a mask when it reaches the viewport.
 *
 * Reduced motion / no JS: nothing moves and nothing is hidden.
 */
export function FooterFx() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const footer = ref.current?.closest<HTMLElement>(".ftr");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!footer) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const motion = !reduce && document.documentElement.classList.contains("js-motion");
    if (!motion) return;

    const rise = footer.querySelector<HTMLElement>(".ftr__bridge-rise");
    const tilt = footer.querySelector<HTMLElement>(".ftr__bridge-tilt");
    const shadow = footer.querySelector<HTMLElement>(".ftr__shadow");
    const word = footer.querySelector<HTMLElement>(".ftr__word");
    const rule = footer.querySelector<HTMLElement>(".ftr__rule");
    const cleanups: (() => void)[] = [];

    footer.classList.add("is-fx");

    // ---- Bridge rises with the scroll -----------------------------------
    let raf = 0;
    const setY = rise ? gsap.quickSetter(rise, "y", "px") : null;
    const setS = rise ? gsap.quickSetter(rise, "scale") : null;
    const setSh = shadow ? gsap.quickSetter(shadow, "opacity") : null;
    // touch: no pointer to tilt with, so the scroll tips the bridge up out of the page instead
    const setRX = !fine && tilt ? gsap.quickSetter(tilt, "rotationX", "deg") : null;
    const update = () => {
      raf = 0;
      if (!rise || !setY || !setS) return;
      const r = footer.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the footer's top meets the viewport bottom, 1 once it's 20% from the top
      const p = clamp((vh - r.top) / (vh * 0.8), 0, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setY((1 - e) * 180);
      setS(0.84 + 0.16 * e);
      setSh?.(0.25 + 0.75 * e);
      setRX?.((1 - e) * 28);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    cleanups.push(() => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    });

    // ---- Pointer tilt ----------------------------------------------------
    if (fine && tilt) {
      const rx = gsap.quickTo(tilt, "rotationX", { duration: 1, ease: "power3.out" });
      const ry = gsap.quickTo(tilt, "rotationY", { duration: 1, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        const r = tilt.getBoundingClientRect();
        const nx = clamp((e.clientX - (r.left + r.width / 2)) / window.innerWidth, -0.5, 0.5);
        const ny = clamp((e.clientY - (r.top + r.height / 2)) / window.innerHeight, -0.5, 0.5);
        ry(nx * 14);
        rx(-ny * 10);
      };
      const leave = () => {
        rx(0);
        ry(0);
      };
      footer.addEventListener("pointermove", move);
      footer.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        footer.removeEventListener("pointermove", move);
        footer.removeEventListener("pointerleave", leave);
      });
    }

    // ---- Wordmark reveal ---------------------------------------------------
    let split: SplitText | null = null;
    if (word) {
      split = SplitText.create(word, { type: "chars", mask: "chars", charsClass: "fc", aria: "none" });
      gsap.set(split.chars, { yPercent: 105 });
      if (rule) gsap.set(rule, { scaleX: 0 });
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((en) => en.isIntersecting) || !split) return;
          io.disconnect();
          gsap.to(split.chars, { yPercent: 0, duration: 1.4, ease: "expo.out", stagger: 0.07 });
          if (rule) gsap.to(rule, { scaleX: 1, duration: 1.6, ease: "expo.inOut", delay: 0.2 });
        },
        { threshold: 0.25 },
      );
      io.observe(word);
      cleanups.push(() => io.disconnect());
    }

    return () => {
      cleanups.forEach((fn) => fn());
      gsap.killTweensOf([split?.chars ?? [], rule, tilt].flat().filter(Boolean) as Element[]);
      split?.revert();
      footer.classList.remove("is-fx");
      [rise, tilt, shadow, rule].forEach((el) => el && gsap.set(el, { clearProps: "all" }));
    };
  }, []);

  return <span ref={ref} hidden />;
}
