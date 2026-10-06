"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { LAYER_STEP, SHEET_COUNT } from "./MachineOverlay";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, DrawSVGPlugin);

/* The painted route, in art coordinates. */
const HAND = { x: 700, y: 356 };
const BELT_TOP = { x: 792, y: 390 };
const BELT_END = { x: 1196, y: 664 };
const STACK = { x: 1370, y: 603 };
const BELT_ANGLE = 34.5;

/* Where each loose sheet comes from, and how wildly it tumbles. */
const STARTS = [
  { x: -120, y: 230, r: -38, mx: 260, my: 120 },
  { x: -70, y: 640, r: 26, mx: 330, my: 210 },
  { x: -150, y: 380, r: -14, mx: 240, my: 90 },
  { x: -60, y: 770, r: 48, mx: 380, my: 160 },
  { x: -140, y: 140, r: -30, mx: 300, my: 70 },
  { x: -90, y: 540, r: 20, mx: 350, my: 240 },
  { x: -130, y: 460, r: -52, mx: 280, my: 140 },
];

/* Scattered-pile poses for the three principle cards. */
const PILE = [
  { x: 26, y: -6, rotation: -3 },
  { x: -8, y: 3, rotation: 2.4 },
  { x: 38, y: 2, rotation: -1.6 },
];

const STATES = ["scattered", "sorting", "sorted"] as const;

export function StudioNoteMotion() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = ref.current?.closest<HTMLElement>(".studio-note");
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const q = gsap.utils.selector(section);
    const mm = gsap.matchMedia();

    const setState = (p: number) => {
      const s = p < 0.3 ? 0 : p < 0.86 ? 1 : 2;
      if (section.dataset.state !== STATES[s]) section.dataset.state = STATES[s];
    };

    /** The machine: sheets in, sorted sheets out. `count` sheets, `gap` stagger. */
    const buildMachine = (count: number, gap: number) => {
      const tl = gsap.timeline({ defaults: { ease: "none" } });
      const sheets = q<SVGGElement>(".sn-sheet");
      const layers = q<SVGGElement>(".sn-layer");

      gsap.set(sheets, { opacity: 0, transformOrigin: "50% 50%" });
      gsap.set(layers, { opacity: 0 });
      gsap.set(q(".sn-sheet__neat"), { opacity: 0 });
      gsap.set(q(".sn-thread"), { drawSVG: "0%" });

      // Spread the sheets we use across the start poses so fewer still reads as chaos.
      const picks = Array.from({ length: count }, (_, k) =>
        Math.round((k * (SHEET_COUNT - 1)) / Math.max(1, count - 1)),
      );

      picks.forEach((idx, k) => {
        const sheet = sheets[idx];
        const s = STARTS[idx];
        const body = sheet.querySelector(".sn-sheet__body");
        const messy = sheet.querySelector(".sn-sheet__messy");
        const neat = sheet.querySelector(".sn-sheet__neat");
        const t = k * gap;
        const top = STACK.y - (k + 1) * LAYER_STEP;

        // 1. Tumble in from the left, over the bear, into the bear's hand and onto the belt.
        tl.set(sheet, { x: s.x, y: s.y, rotation: s.r, scale: 0.9, opacity: 0 }, t)
          .to(sheet, { opacity: 1, duration: 0.25 }, t)
          .to(
            sheet,
            {
              duration: 1.5,
              ease: "power1.inOut",
              motionPath: {
                path: [
                  { x: s.x, y: s.y },
                  { x: s.mx, y: s.my },
                  { x: HAND.x - 60, y: HAND.y - 50 },
                  HAND,
                  BELT_TOP,
                ],
                curviness: 1.25,
              },
              rotation: BELT_ANGLE,
              scale: 1,
            },
            t,
          )
          .fromTo(
            body,
            { skewX: 0 },
            { skewX: 14, duration: 0.375, yoyo: true, repeat: 3, ease: "sine.inOut" },
            t,
          )
          // 2. The machine straightens it out: scrawl becomes ruled lines and a tick.
          .to(messy, { opacity: 0, duration: 0.3 }, t + 1.45)
          .to(neat, { opacity: 1, duration: 0.3 }, t + 1.55)
          // 3. Down the belt, square to it.
          .to(sheet, { x: BELT_END.x, y: BELT_END.y, duration: 1.2 }, t + 1.5)
          // 4. Onto the stack, which grows by one.
          .to(
            sheet,
            {
              duration: 0.55,
              ease: "power2.out",
              motionPath: { path: [BELT_END, { x: 1290, y: top - 46 }, { x: STACK.x, y: top }], curviness: 1 },
              rotation: -4,
              scaleX: 1.8,
              scaleY: 0.32,
              skewX: -38,
            },
            t + 2.7,
          )
          .to(sheet, { opacity: 0, duration: 0.12 }, t + 3.15)
          .fromTo(
            layers[k],
            { opacity: 0, y: -6 },
            { opacity: 1, y: 0, duration: 0.15, ease: "power2.out" },
            t + 3.12,
          );
      });

      const end = (count - 1) * gap + 3.3;
      // The rust thread follows the first sheet, then stays: the route is now built.
      tl.to(q(".sn-thread"), { drawSVG: "100%", duration: 2.0, ease: "power1.inOut" }, 1.3);
      // Gears and pulleys turn with the work, never on their own.
      tl.to(q('[data-gear="a"]'), { rotation: 540, svgOrigin: "840 567.4", duration: end }, 0)
        .to(q('[data-gear="b"]'), { rotation: -743, svgOrigin: "891.4 650.4", duration: end }, 0)
        .to(q('[data-gear="c"]'), { rotation: 900, svgOrigin: "975.2 605.7", duration: end }, 0)
        .to(q('[data-gear="d"]'), { rotation: 900, svgOrigin: "1134.2 717.3", duration: end }, 0);
      // Status rule: fills Scattered → Sorting → Sorted.
      const fills = q(".studio-note__rule-fill");
      tl.fromTo(fills[0], { scaleX: 0 }, { scaleX: 1, duration: end * 0.3 }, 0).fromTo(
        fills[1],
        { scaleX: 0 },
        { scaleX: 1, duration: end * 0.56 },
        end * 0.3,
      );
      return { tl, end };
    };

    const cards = q<HTMLElement>(".studio-note__card");

    // Desktop: the stage sticks (pure CSS) and one timeline runs across the track.
    mm.add(
      "(min-width: 1024px) and (pointer: fine) and (min-height: 720px)",
      () => {
        const { tl, end } = buildMachine(SHEET_COUNT, 0.95);
        // The principles get sorted the same way, while the stage is held.
        cards.forEach((card, i) => {
          tl.fromTo(
            card,
            { ...PILE[i], "--filed": 0 },
            { x: 0, y: 0, rotation: 0, "--filed": 1, duration: 1.1, ease: "power2.inOut" },
            end * 0.28 + i * 1.5,
          );
        });
        const track = q(".studio-note__track")[0];
        ScrollTrigger.create({
          trigger: track,
          start: "top 70%",
          end: "bottom bottom",
          scrub: 0.7,
          refreshPriority: -10,
          animation: tl,
          onUpdate: (self) => setState(self.progress),
          onRefresh: (self) => setState(self.progress),
        });
        // Depth: the plate drifts against the held copy.
        gsap.fromTo(
          q(".studio-note__plate"),
          { y: 50 },
          { y: -50, ease: "none", scrollTrigger: { trigger: track, start: "top bottom", end: "bottom top", scrub: true, refreshPriority: -10 } },
        );
        // Subtle pointer depth on the plate.
        const plate = q(".studio-note__plate")[0];
        const rx = gsap.quickTo(plate, "rotationX", { duration: 0.8, ease: "power3.out" });
        const ry = gsap.quickTo(plate, "rotationY", { duration: 0.8, ease: "power3.out" });
        const onMove = (e: PointerEvent) => {
          ry((e.clientX / window.innerWidth - 0.5) * 5);
          rx((e.clientY / window.innerHeight - 0.5) * -4);
        };
        section.addEventListener("pointermove", onMove);
        return () => section.removeEventListener("pointermove", onMove);
      },
      section,
    );

    // Everywhere else (phones, tablets, short windows): no pinning. On phones and
    // tablets the machine view is a CSS-sticky frame held for a short stretch,
    // while a camera pans across the painting from the bear to the stack.
    mm.add(
      "not all and (min-width: 1024px) and (pointer: fine) and (min-height: 720px)",
      () => {
        const art = q<HTMLElement>(".studio-note__art")[0];
        const frame = q<HTMLElement>(".studio-note__frame")[0];
        const win = q<HTMLElement>(".studio-note__window")[0];
        const plate = q<HTMLElement>(".studio-note__plate")[0];
        const held = () => getComputedStyle(frame).position === "sticky";
        const { tl, end } = buildMachine(5, 1.0);
        // Camera: lingers on the bear, follows the sheets through the machine, ends on the stack.
        tl.fromTo(
          plate,
          { x: 0 },
          { x: () => -Math.max(0, plate.offsetWidth - win.clientWidth), duration: end, ease: "power1.inOut" },
          0,
        );
        ScrollTrigger.create({
          trigger: art,
          start: () => (held() ? "top 70%" : "top 88%"),
          end: () => (held() ? `bottom ${64 + frame.offsetHeight}px` : "bottom 12%"),
          scrub: 0.6,
          refreshPriority: -10,
          invalidateOnRefresh: true,
          animation: tl,
          onUpdate: (self) => setState(self.progress),
          onRefresh: (self) => setState(self.progress),
        });
        // Depth without a pointer: the painting eases in from slightly closer.
        gsap.fromTo(
          plate.querySelector("img"),
          { scale: 1.06, transformOrigin: "50% 60%" },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: art, start: "top bottom", end: "top 64px", scrub: true, refreshPriority: -10 },
          },
        );
        // The principles come out of the machine as a sorted pile, one by one.
        cards.forEach((card, i) => {
          gsap.fromTo(
            card,
            { x: PILE[i].x * 0.6, y: 40, rotation: PILE[i].rotation * 1.6, "--filed": 0 },
            {
              x: 0,
              y: 0,
              rotation: 0,
              "--filed": 1,
              ease: "power2.out",
              scrollTrigger: { trigger: card, start: "top 98%", end: "top 60%", scrub: 0.5, refreshPriority: -10 },
            },
          );
        });
      },
      section,
    );

    section.classList.add("is-live");
    return () => {
      mm.revert();
      section.classList.remove("is-live");
      delete section.dataset.state;
    };
  }, []);

  return <span ref={ref} hidden />;
}
