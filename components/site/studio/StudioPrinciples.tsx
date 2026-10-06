"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { whyArctos } from "@/lib/content";
import { Lines, TextLink } from "../ui";

gsap.registerPlugin(ScrollTrigger);

/* Each principle gets the studio's own roundel of the bear at that kind of work. */
const ART: Record<string, string> = {
  "One connected partner": "connected",
  "Strategy before software": "strategy",
  "Calgary-based": "calgary",
  "Built around existing operations": "existing",
  "Clear ownership": "ownership",
  "Ongoing improvement": "improvement",
};

export function StudioPrinciples() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const mm = gsap.matchMedia(el);

    mm.add("(min-width: 900px) and (pointer: fine)", () => {
      const deck = el.querySelector<HTMLElement>(".st-deck")!;
      const cards = gsap.utils.toArray<HTMLElement>(".st-card", el);
      // Cards start squared up as one deck in the middle, then are dealt to their places.
      const offsets = () => {
        const db = deck.getBoundingClientRect();
        const cx = db.left + db.width / 2;
        const cy = db.top + db.height / 2;
        return cards.map((c) => {
          const b = c.getBoundingClientRect();
          return { x: cx - (b.left + b.width / 2), y: cy - (b.top + b.height / 2) };
        });
      };
      let off = offsets();
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: deck,
          start: "top 88%",
          end: "top 22%",
          scrub: 0.8,
          invalidateOnRefresh: true,
          onRefreshInit: () => {
            gsap.set(cards, { clearProps: "x,y,rotation" });
            off = offsets();
          },
        },
      });
      cards.forEach((c, i) => {
        tl.fromTo(
          c,
          { x: () => off[i].x, y: () => off[i].y, rotation: () => (i - 2.5) * 3.2 },
          { x: 0, y: 0, rotation: 0, ease: "power2.inOut", duration: 1 },
          (cards.length - 1 - i) * 0.12,
        );
      });

      // Each card tilts toward the pointer; its roundel turns like a coin.
      const cleanups = cards.map((c) => {
        const inner = c.querySelector<HTMLElement>(".st-card__inner")!;
        const art = c.querySelector<HTMLElement>(".st-card__art")!;
        const rx = gsap.quickTo(inner, "rotationX", { duration: 0.6, ease: "power3.out" });
        const ry = gsap.quickTo(inner, "rotationY", { duration: 0.6, ease: "power3.out" });
        const ar = gsap.quickTo(art, "rotation", { duration: 0.9, ease: "power3.out" });
        const move = (e: PointerEvent) => {
          const b = c.getBoundingClientRect();
          const nx = (e.clientX - b.left) / b.width - 0.5;
          const ny = (e.clientY - b.top) / b.height - 0.5;
          rx(-ny * 10);
          ry(nx * 12);
          ar(nx * 18);
        };
        const leave = () => {
          rx(0);
          ry(0);
          ar(0);
        };
        c.addEventListener("pointermove", move);
        c.addEventListener("pointerleave", leave);
        return () => {
          c.removeEventListener("pointermove", move);
          c.removeEventListener("pointerleave", leave);
        };
      });
      return () => cleanups.forEach((f) => f());
    });
    // Touch: the cards stick and stack (CSS). Each one sinks back as the next
    // slides over it, and its roundel turns with the scroll, so the pile has depth.
    mm.add("(max-width: 899.98px)", () => {
      const cards = gsap.utils.toArray<HTMLElement>(".st-card", el);
      cards.forEach((c, i) => {
        const inner = c.querySelector(".st-card__inner");
        const art = c.querySelector(".st-card__art");
        gsap.fromTo(
          art,
          { rotation: -14, scale: 0.86 },
          {
            rotation: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: c, start: "top bottom", end: "top 45%", scrub: 0.4 },
          },
        );
        const next = cards[i + 1];
        if (!next) return;
        gsap.fromTo(
          inner,
          { scale: 1, yPercent: 0 },
          {
            scale: 0.93,
            yPercent: -2,
            ease: "none",
            scrollTrigger: { trigger: next, start: "top 70%", end: "top 30%", scrub: 0.4 },
          },
        );
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} className="st-principles section tone-bone" data-tone="bone" aria-labelledby="expect">
      <div className="wrap">
        <div className="split split--head">
          <div>
            <p className="eyebrow" data-reveal>
              What you can expect
            </p>
            <Lines as="h2" id="expect" className="h1" lines={["Practical decisions.", <em key="c">Clear ownership.</em>]} />
          </div>
          <TextLink href="/process">How a project runs</TextLink>
        </div>
        <ol className="st-deck">
          {whyArctos.map((item, i) => (
            <li key={item.title} className="st-card" style={{ "--i": i } as CSSProperties}>
              <div className="st-card__inner">
                <div className="st-card__art" aria-hidden="true">
                  <Image
                    src={`/assets/studio/principles/${ART[item.title] ?? "connected"}.webp`}
                    alt=""
                    width={560}
                    height={560}
                    sizes="(max-width: 900px) 96px, 200px"
                  />
                </div>
                <div className="st-card__text">
                  <span className="st-card__index mono">
                    {String(i + 1).padStart(2, "0")} <span aria-hidden="true">/ {String(whyArctos.length).padStart(2, "0")}</span>
                  </span>
                  <h3 className="h3">{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
