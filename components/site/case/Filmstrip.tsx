"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import type { Shot } from "./frames";

/**
 * The project's own media as a strip of film. Native horizontal scroll does
 * the work on touch and keyboard; on a fine pointer it can also be thrown
 * (drag with inertia), and the frames lean into the throw. Each frame opens
 * full size in a native <dialog>.
 */
export function Filmstrip({ shots, credit, title }: { shots: Shot[]; credit: string; title: string }) {
  const strip = useRef<HTMLUListElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const moved = useRef(false);

  useEffect(() => {
    const el = strip.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const items = Array.from(el.querySelectorAll<HTMLElement>(".cx-film__frame"));
    const imgs = items.map((i) => i.querySelector<HTMLElement>("img"));

    const opens = items.map((i) => i.querySelector<HTMLElement>(".cx-film__open"));
    const root = el.closest(".cx-film");
    const bar = root?.querySelector<HTMLElement>(".cx-film__bar");
    const count = root?.querySelector<HTMLElement>(".cx-film__now");

    // Depth: the frame nearest the centre comes forward, the others recede,
    // and each image drifts inside its frame. Progress and the frame counter
    // follow the strip (those also run under reduced motion: they inform).
    let raf = 0;
    const paint = () => {
      raf = 0;
      const box = el.getBoundingClientRect();
      const mid = box.left + el.clientWidth / 2;
      let best = 0;
      let bestD = Infinity;
      items.forEach((item, i) => {
        const r = item.getBoundingClientRect();
        const off = (r.left + r.width / 2 - mid) / el.clientWidth;
        if (Math.abs(off) < bestD) {
          bestD = Math.abs(off);
          best = i;
        }
        if (reduce) return;
        const img = imgs[i];
        if (img) img.style.transform = `translate3d(${(-off * 9).toFixed(2)}%,0,0) scale(1.14)`;
        const o = opens[i];
        if (o) {
          const k = Math.min(1, Math.abs(off) * 1.4);
          o.style.transform = `scale(${(1 - k * 0.08).toFixed(3)})`;
          o.style.opacity = (1 - k * 0.35).toFixed(3);
        }
      });
      const max = el.scrollWidth - el.clientWidth;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.max(0.04, el.scrollLeft / max).toFixed(3) : 1})`;
      if (count) count.textContent = String(best + 1).padStart(2, "0");
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // Throw: drag with inertia on a fine pointer.
    let down = false;
    let startX = 0;
    let startScroll = 0;
    let lastX = 0;
    let lastT = 0;
    let vel = 0;
    const skewTo = gsap.quickTo(items, "skewX", { duration: 0.5, ease: "power3.out" });
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || e.pointerType !== "mouse") return;
      down = true;
      moved.current = false;
      startX = lastX = e.clientX;
      startScroll = el.scrollLeft;
      lastT = performance.now();
      vel = 0;
      gsap.killTweensOf(el);
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 5 && !moved.current) {
        moved.current = true;
        el.classList.add("is-dragging");
        el.setPointerCapture(e.pointerId);
      }
      if (!moved.current) return;
      el.scrollLeft = startScroll - dx;
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      vel = (e.clientX - lastX) / dt;
      lastX = e.clientX;
      lastT = now;
      if (!reduce) skewTo(gsap.utils.clamp(-6, 6, -vel * 3));
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      el.classList.remove("is-dragging");
      if (!reduce) skewTo(0);
      if (moved.current && Math.abs(vel) > 0.05) {
        const target = gsap.utils.clamp(0, el.scrollWidth - el.clientWidth, el.scrollLeft - vel * 420);
        if (reduce) el.scrollLeft = target;
        else gsap.to(el, { scrollLeft: target, duration: 1.1, ease: "power3.out" });
      }
    };
    if (fine) {
      el.addEventListener("pointerdown", onDown);
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerup", onUp);
      el.addEventListener("pointercancel", onUp);
    }
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      gsap.killTweensOf(el);
      gsap.set(items, { clearProps: "transform" });
      opens.forEach((o) => o && (o.style.transform = o.style.opacity = ""));
    };
  }, []);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal();
    if (open === null && d.open) d.close();
  }, [open]);

  const step = useCallback(
    (dir: number) => setOpen((o) => (o === null ? o : (o + dir + shots.length) % shots.length)),
    [shots.length],
  );

  const nudge = (dir: number) => {
    const el = strip.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = el.scrollLeft + dir * el.clientWidth * 0.7;
    if (reduce) el.scrollLeft = target;
    else gsap.to(el, { scrollLeft: target, duration: 0.9, ease: "power3.inOut" });
  };

  const current = open === null ? null : shots[open];

  return (
    <section className="cx-film tone-ink" data-tone="ink" aria-labelledby="cx-film-title">
      <div className="wrap cx-film__head">
        <div>
          <p className="eyebrow" data-reveal>
            {credit}
          </p>
          <h2 id="cx-film-title" className="h2 cx-film__title" data-reveal style={{ "--d": 1 } as CSSProperties}>
            {title}
          </h2>
        </div>
        <div className="cx-film__ctrl">
          <span className="mono cx-film__hint" aria-hidden="true">
            Drag, scroll or tap a frame
          </span>
          <button type="button" className="cx-film__nav" onClick={() => nudge(-1)} aria-label="Scroll the frames back">
            ←
          </button>
          <button type="button" className="cx-film__nav" onClick={() => nudge(1)} aria-label="Scroll the frames forward">
            →
          </button>
        </div>
      </div>
      <ul ref={strip} className="cx-film__strip" aria-label={`${shots.length} frames`}>
        {shots.map((s, i) => (
          <li key={s.src} className={`cx-film__frame cx-film__frame--${s.width >= s.height ? "wide" : "tall"}`}>
            <button
              type="button"
              className="cx-film__open"
              onClick={(e) => {
                if (moved.current) {
                  e.preventDefault();
                  moved.current = false;
                  return;
                }
                setOpen(i);
              }}
              aria-label={`Open frame ${i + 1}: ${s.alt}`}
            >
              <span className="cx-film__img">
                <Image
                  src={s.src}
                  alt=""
                  width={s.width}
                  height={s.height}
                  sizes="(max-width: 700px) 80vw, 40vw"
                  draggable={false}
                />
              </span>
            </button>
            <p className="cx-film__cap">
              <span className="mono">F{String(i + 1).padStart(2, "0")}</span>
              {s.caption}
            </p>
            {s.palette ? (
              <span className="cx-film__palette" aria-label="Theme palette from the product">
                {s.palette.map((c) => (
                  <i key={c} style={{ background: c }} title={c} />
                ))}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
      <div className="wrap cx-film__meter" aria-hidden="true">
        <span className="mono">
          <span className="cx-film__now">01</span> / {String(shots.length).padStart(2, "0")}
        </span>
        <span className="cx-film__track">
          <span className="cx-film__bar" />
        </span>
      </div>

      <dialog
        ref={dialog}
        className="cx-lightbox"
        aria-label={current ? current.alt : "Frame"}
        onClose={() => setOpen(null)}
        onClick={(e) => {
          if (e.target === dialog.current) setOpen(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
      >
        {current ? (
          <figure className="cx-lightbox__fig">
            <Image
              key={current.src}
              src={current.src}
              alt={current.alt}
              width={current.width}
              height={current.height}
              sizes="92vw"
            />
            <figcaption>
              <span className="mono">
                F{String((open ?? 0) + 1).padStart(2, "0")} / {String(shots.length).padStart(2, "0")}
              </span>
              {current.caption}
            </figcaption>
          </figure>
        ) : null}
        <div className="cx-lightbox__bar">
          <button type="button" onClick={() => step(-1)} aria-label="Previous frame">
            ←
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Next frame">
            →
          </button>
          <button type="button" onClick={() => setOpen(null)} aria-label="Close">
            ×
          </button>
        </div>
      </dialog>
    </section>
  );
}
