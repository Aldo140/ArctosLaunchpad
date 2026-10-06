"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

const IW = 1536;
const IH = 1024;

/* The three words as they sit on the pinned note, in photo pixels. */
const WORDS = [
  {
    word: "Systems",
    gloss: "Work that runs the same way on a busy Tuesday as it does on launch day.",
    line: "M 692 514 C 740 519 806 509 874 515",
    y: 514,
  },
  {
    word: "Clarity",
    gloss: "Plain words, visible numbers, and nobody guessing what happens next.",
    line: "M 692 575 C 744 571 800 579 850 573",
    y: 574,
  },
  {
    word: "Growth",
    gloss: "More of the right customers, and a business ready to look after them.",
    line: "M 692 630 C 742 634 808 626 862 631",
    y: 630,
  },
];

export function StudioWall() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const mm = gsap.matchMedia(el);
    const unders = gsap.utils.toArray<SVGPathElement>(".st-wall__under", el);
    const tags = gsap.utils.toArray<HTMLElement>(".st-tag", el);

    mm.add("(min-width: 1024px) and (pointer: fine)", () => {
      const pin = el.querySelector<HTMLElement>(".st-wall__pin")!;
      const strings = gsap.utils.toArray<SVGPathElement>(".st-wall__string", el);
      const svg = el.querySelector<SVGSVGElement>(".st-wall__strings")!;

      // A string from each paper tag to its word on the note.
      const layout = () => {
        const fw = pin.clientWidth;
        const fh = pin.clientHeight;
        const sw = Math.max(fw, fh * (IW / IH));
        const sh = sw * (IH / IW);
        const ox = (fw - sw) / 2;
        const oy = (fh - sh) / 2;
        svg.setAttribute("viewBox", `0 0 ${fw} ${fh}`);
        tags.forEach((t, i) => {
          const x1 = t.offsetLeft + t.offsetWidth - 10;
          const y1 = t.offsetTop + 26;
          const x2 = ox + (686 / IW) * sw;
          const y2 = oy + (WORDS[i].y / IH) * sh - 12;
          const mx = (x1 + x2) / 2;
          strings[i]?.setAttribute("d", `M ${x1} ${y1} C ${mx} ${y1 + 40} ${mx} ${y2 + 30} ${x2} ${y2}`);
        });
      };
      layout();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=170%",
          pin: pin,
          scrub: 0.7,
          onRefresh: layout,
        },
      });
      tl.fromTo(
        ".st-wall__frame",
        { clipPath: "inset(14% 16% 14% 16% round 14px)" },
        { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "power2.inOut", duration: 1 },
        0,
      )
        .fromTo(".st-wall__stage", { scale: 1.32 }, { scale: 1, ease: "power2.inOut", duration: 1.15 }, 0)
        .fromTo(".st-wall__cap", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 }, 0.7);
      WORDS.forEach((_, i) => {
        const at = 1.1 + i * 0.55;
        tl.fromTo(unders[i], { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.3, ease: "none" }, at)
          .fromTo(strings[i], { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.3, ease: "none" }, at + 0.15)
          .fromTo(
            tags[i],
            { opacity: 0, y: -50, rotation: i % 2 ? 9 : -9, scale: 1.08 },
            { opacity: 1, y: 0, rotation: i % 2 ? 1.5 : -2, scale: 1, duration: 0.3, ease: "back.out(2)" },
            at + 0.3,
          );
      });
      tl.to({}, { duration: 0.3 });
    });

    mm.add("not all and (min-width: 1024px) and (pointer: fine)", () => {
      gsap.fromTo(
        ".st-wall__frame",
        { clipPath: "inset(10% 8% 10% 8% round 12px)" },
        {
          clipPath: "inset(0% 0% 0% 0% round 0px)",
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 90%", end: "top 25%", scrub: 0.4 },
        },
      );
      // Touch: the photo stays put (CSS sticky) and slowly closes in on the note
      // while the three paper tags slide up over it, each one underlining its word.
      gsap.fromTo(
        ".st-wall__stage",
        { scale: 1.18 },
        {
          scale: 1.32,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 60%", end: "bottom bottom", scrub: 0.4 },
        },
      );
      tags.forEach((t, i) => {
        gsap.fromTo(
          t,
          { rotation: i % 2 ? 7 : -7, xPercent: i % 2 ? 8 : -8 },
          {
            rotation: i % 2 ? 1.5 : -2,
            xPercent: 0,
            ease: "power2.out",
            scrollTrigger: { trigger: t, start: "top bottom", end: "top 55%", scrub: 0.4 },
          },
        );
        gsap.fromTo(
          unders[i],
          { drawSVG: "0%" },
          {
            drawSVG: "100%",
            ease: "none",
            scrollTrigger: { trigger: t, start: "top 85%", end: "top 55%", scrub: 0.4 },
          },
        );
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} className="st-wall tone-ink" data-tone="ink" aria-labelledby="st-wall-title">
      <div className="st-wall__pin">
        <div className="st-wall__frame">
          <div className="st-wall__stage">
            <Image
              src="/assets/studio/arctos-wall-materials.webp"
              alt="Concrete, paper and fabric on the studio wall, with a pinned note reading Systems, Clarity, Growth."
              width={IW}
              height={IH}
              sizes="(max-width: 700px) 180vw, 110vw"
            />
            <svg className="st-wall__marks" viewBox={`0 0 ${IW} ${IH}`} aria-hidden="true">
              {WORDS.map((w) => (
                <path key={w.word} className="st-wall__under" d={w.line} />
              ))}
            </svg>
          </div>
        </div>
        <svg className="st-wall__strings" aria-hidden="true">
          {WORDS.map((w) => (
            <path key={w.word} className="st-wall__string" d="M0 0" />
          ))}
        </svg>
        <h2 id="st-wall-title" className="st-wall__cap mono">
          Pinned to the studio wall
        </h2>
        <ul className="st-wall__tags">
          {WORDS.map((w, i) => (
            <li key={w.word} className="st-tag">
              <span className="st-tag__tape" aria-hidden="true" />
              <span className="st-tag__i mono">{String(i + 1).padStart(2, "0")}</span>
              <strong className="st-tag__word">{w.word}.</strong>
              <span className="st-tag__gloss">{w.gloss}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
