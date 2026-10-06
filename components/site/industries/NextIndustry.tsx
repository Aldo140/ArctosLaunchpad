"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * The next terrain, previewed. On click its map opens out to fill the screen
 * (a clip-path wipe from the card's own rectangle) and the next page's hero,
 * drawn on the same ink, takes over. Modified clicks and reduced motion get
 * an ordinary link.
 */
export function NextIndustry({
  href,
  title,
  index,
  total,
  terrain,
}: {
  href: string;
  title: string;
  index: number;
  total: number;
  terrain: ReactNode;
}) {
  const router = useRouter();
  const mapRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    router.prefetch(href);
    return () => {
      overlayRef.current?.remove();
    };
  }, [href, router]);

  // Touch screens: the next map opens out of the page as it scrolls in.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const mm = gsap.matchMedia();
    mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
      const svg = map.querySelector("svg");
      gsap.fromTo(
        map,
        { scale: 0.86, rotateX: 18, transformPerspective: 900 },
        {
          scale: 1,
          rotateX: 0,
          ease: "none",
          scrollTrigger: { trigger: map, start: "top 100%", end: "top 40%", scrub: 0.4 },
        },
      );
      if (svg)
        gsap.fromTo(
          svg,
          { scale: 1.25 },
          { scale: 1, ease: "none", scrollTrigger: { trigger: map, start: "top 100%", end: "bottom 30%", scrub: 0.4 } },
        );
    });
    return () => mm.revert();
  }, []);

  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const map = mapRef.current;
    const svg = map?.querySelector("svg");
    if (!map || !svg) return;
    e.preventDefault();
    const r = map.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const overlay = document.createElement("div");
    overlay.className = "ind-wipe tone-ink";
    overlay.setAttribute("aria-hidden", "true");
    overlay.appendChild(svg.cloneNode(true));
    document.body.appendChild(overlay);
    overlayRef.current = overlay;
    const from = `inset(${r.top}px ${vw - r.right}px ${vh - r.bottom}px ${r.left}px round 10px)`;
    gsap.fromTo(
      overlay,
      { clipPath: from },
      {
        clipPath: "inset(0px 0px 0px 0px round 0px)",
        duration: 0.75,
        ease: "expo.inOut",
        onComplete: () => router.push(href),
      },
    );
    gsap.fromTo(overlay.querySelector("svg"), { scale: 1.12 }, { scale: 1, duration: 0.9, ease: "expo.out" });
    window.setTimeout(() => overlay.remove(), 4000);
  };

  return (
    <Link href={href} className="inx-next" onClick={go}>
      <span className="inx-next__copy">
        <span className="mono">
          Next terrain · {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <span className="inx-next__title">
          {title} <span className="inx-next__arrow" aria-hidden="true">→</span>
        </span>
      </span>
      <span className="inx-next__map" ref={mapRef} aria-hidden="true">
        {terrain}
      </span>
    </Link>
  );
}
