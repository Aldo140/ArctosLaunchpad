"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { BRIDGE_W } from "./parts";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

/** Where each island starts: adrift, at its own depth and tilt. */
const DRIFT = [
  { x: -56, y: 34, z: -150, rotation: -7, rotationY: 22, rotationX: 10 },
  { x: 0, y: 46, z: -260, rotation: 4, rotationY: -12, rotationX: 8 },
  { x: 64, y: -26, z: -110, rotation: 8, rotationY: -24, rotationX: 6 },
];
const SETTLED = { x: 0, y: 0, z: 0, rotation: 0, rotationY: 0, rotationX: 0 };

/**
 * Motion for the islands chapter. CSS renders the connected end state by
 * default (no JS, reduced motion); everything here starts from the adrift
 * state with explicit fromTo values, so reverting restores the end state.
 */
export function useIslandsMotion(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const mm = gsap.matchMedia(el);
    mm.add(
      {
        wide: "(min-width: 1024px)",
        narrow: "(max-width: 1023.98px)",
        pin: "(min-width: 1024px) and (pointer: fine) and (min-height: 820px)",
      },
      (context) => {
        const { wide, pin } = context.conditions as { wide: boolean; pin: boolean };
        return wide ? desktop(el, pin) : narrow(el);
      },
    );

    // Pointer tilt on each island (fine pointers only; CSS reads --px/--py).
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cards = Array.from(el.querySelectorAll<HTMLElement>(".isl"));
    const move = (e: PointerEvent) => {
      const card = e.currentTarget as HTMLElement;
      const art = card.querySelector(".isl__art")!.getBoundingClientRect();
      card.style.setProperty("--px", (((e.clientX - art.left) / art.width) * 2 - 1).toFixed(3));
      card.style.setProperty("--py", (((e.clientY - art.top) / art.height) * 2 - 1).toFixed(3));
    };
    const leave = (e: PointerEvent) => {
      const card = e.currentTarget as HTMLElement;
      card.style.setProperty("--px", "0");
      card.style.setProperty("--py", "0");
    };
    if (fine) {
      cards.forEach((card) => {
        card.addEventListener("pointermove", move);
        card.addEventListener("pointerleave", leave);
      });
    }

    return () => {
      mm.revert();
      cards.forEach((card) => {
        card.removeEventListener("pointermove", move);
        card.removeEventListener("pointerleave", leave);
        card.style.removeProperty("--px");
        card.style.removeProperty("--py");
      });
    };
  }, [root]);
}

type Vars = gsap.TweenVars;

/**
 * One fromTo per target instead of `stagger`: a staggered fromTo inside a
 * scrubbed timeline only re-applies the FIRST target's from-state after a
 * ScrollTrigger refresh, so later targets would show their end state early.
 */
function each(
  tl: gsap.core.Timeline,
  targets: ArrayLike<Element>,
  from: Vars | ((i: number) => Vars),
  to: Vars,
  at: number,
  step: number,
) {
  Array.from(targets).forEach((target, i) => {
    tl.fromTo(target, typeof from === "function" ? from(i) : { ...from }, { ...to }, at + i * step);
  });
}

function desktop(el: HTMLElement, pin: boolean) {
  const q = gsap.utils.selector(el);
  const stage = q(".isles__stage")[0] as HTMLElement;
  const scene = q(".isles__scene")[0] as HTMLElement;
  const arts = q(".isl__art") as HTMLElement[];
  const bobs = q(".isl__bob") as HTMLElement[];
  const scraps = q(".isl-scrap") as HTMLElement[];
  const scrapBobs = q(".isl-scrap__bob") as HTMLElement[];
  const steps = q(".isles__step") as HTMLElement[];

  el.classList.add("is-live");
  if (pin) el.classList.add("is-pinned");

  // Ambient drift: islands bob until the bridge holds them; scraps keep bobbing.
  const amp = { isl: 1 };
  const setIsl = bobs.map((b) => gsap.quickSetter(b, "y", "px"));
  const setScrapY = scrapBobs.map((b) => gsap.quickSetter(b, "y", "px"));
  const setScrapR = scrapBobs.map((b) => gsap.quickSetter(b, "rotation", "deg"));
  const tick = (time: number) => {
    setIsl.forEach((set, i) => set(Math.sin(time * 0.9 + i * 1.9) * 7 * amp.isl));
    setScrapY.forEach((set, i) => set(Math.sin(time * 1.1 + i * 1.3) * 6));
    setScrapR.forEach((set, i) => set(Math.sin(time * 0.7 + i) * 3));
  };
  let ticking = false;
  const ambient = ScrollTrigger.create({
    trigger: el,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => {
      if (self.isActive && !ticking) gsap.ticker.add(tick);
      else if (!self.isActive && ticking) gsap.ticker.remove(tick);
      ticking = self.isActive;
    },
  });

  const setStep = (p: number) => {
    const active = p < 0.2 ? 0 : p < 0.8 ? 1 : 2;
    steps.forEach((s, i) => s.classList.toggle("is-on", i <= active));
    el.classList.toggle("is-connected", p > 0.97);
  };

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: pin
      ? {
          trigger: stage,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * 2.4)}`,
          pin: true,
          refreshPriority: 1,
          scrub: 0.9,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => setStep(self.progress),
        }
      : {
          trigger: scene,
          start: "top 80%",
          end: "bottom 75%",
          scrub: 0.9,
          invalidateOnRefresh: true,
          onUpdate: (self) => setStep(self.progress),
        },
  });

  setStep(0);
  each(tl, q(".isles__track i"), { scaleX: 0 }, { scaleX: 1, duration: 4 }, 0.6, 4);

  // 1. Adrift → the symptoms surface.
  each(tl, q(".isl__sym"), { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: 0.6 }, 0.1, 0.1);

  // 2. Islands pulled into line.
  arts.forEach((art, i) => {
    tl.fromTo(
      art,
      { ...DRIFT[i], transformPerspective: 900 },
      { ...SETTLED, transformPerspective: 900, duration: 5, ease: "power2.inOut" },
      0.6 + i * 0.25,
    );
  });
  tl.fromTo(q(".isl__shadow"), { scale: 0.55, autoAlpha: 0.35 }, { scale: 1, autoAlpha: 1, duration: 5 }, 0.6);
  tl.to(amp, { isl: 0.15, duration: 4 }, 2);

  // 3. The bridge, plank by plank — built from the lost work in each gap.
  const bridge = (n: 1 | 2, at: number) => {
    const span = q(`.isl-span--${n}`)[0] as HTMLElement;
    tl.fromTo(
      span.querySelectorAll(".isl-bridge__post"),
      { scaleY: 0, transformOrigin: "50% 100%" },
      { scaleY: 1, duration: 0.35 },
      at,
    );
    each(
      tl,
      span.querySelectorAll(".isl-plank"),
      (i) => ({ autoAlpha: 0, y: -24, rotation: ((i * 37) % 60) - 30, transformOrigin: "50% 50%" }),
      { autoAlpha: 1, y: 0, rotation: 0, duration: 0.45, ease: "back.out(1.7)" },
      at + 0.15,
      0.085,
    );
    tl.fromTo(span.querySelectorAll(".isl-bridge__rope"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.3 }, at + 0.3);

    const gap = scraps.filter((s) => s.dataset.gap === String(n));
    gap.forEach((scrap, k) => {
      tl.fromTo(
        scrap,
        { x: 0, y: 0, scale: 1, autoAlpha: 1 },
        {
          x: () => span.offsetLeft + span.offsetWidth * (0.25 + k * 0.25) - (scrap.offsetLeft + scrap.offsetWidth / 2),
          y: () => span.offsetTop + span.offsetHeight * 0.1 - (scrap.offsetTop + scrap.offsetHeight / 2),
          scale: 0.12,
          autoAlpha: 0,
          duration: 1.1,
          ease: "power2.in",
        },
        at + k * 0.25,
      );
    });
  };
  bridge(1, 1.9);
  bridge(2, 3.7);

  // 4. Each island's symptoms are ticked off as the bridge reaches it.
  (["win", "run", "see"] as const).forEach((id, i) => {
    const at = [3.4, 4.3, 5.3][i];
    each(tl, q(`.isl--${id} .isl__sym-text`), { "--strike": "0%" }, { "--strike": "100%", duration: 0.5 }, at, 0.15);
    each(tl, q(`.isl--${id} .isl__mark-dash`), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.2 }, at, 0.15);
    each(tl, q(`.isl--${id} .isl__mark-tick`), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.4 }, at + 0.1, 0.15);
  });

  // 5. What we build fills the empty lot; the ways in appear.
  each(tl, q(".isl__builds-in"), { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "power2.out" }, 6, 0.3);
  each(tl, q(".isl__chips li"), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 6.2, 0.06);
  each(tl, q(".isl__actions"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 7.1, 0.2);

  // 6. The signal crosses, lighting each island as it arrives.
  const signal = (n: number, at: number) => {
    const dot = q(`.isl-span--${n} .isl-bridge__signal`);
    tl.fromTo(dot, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, at);
    tl.fromTo(dot, { x: 0 }, { x: BRIDGE_W, duration: 0.8 }, at);
    tl.to(dot, { autoAlpha: 0, duration: 0.1 }, at + 0.8);
  };
  const nodes = q(".isl__node");
  tl.fromTo(nodes[0], { scale: 0 }, { scale: 1, duration: 0.3, ease: "back.out(2)" }, 8);
  signal(1, 8.1);
  tl.fromTo(nodes[1], { scale: 0 }, { scale: 1, duration: 0.3, ease: "back.out(2)" }, 8.85);
  signal(2, 8.95);
  tl.fromTo(nodes[2], { scale: 0 }, { scale: 1, duration: 0.3, ease: "back.out(2)" }, 9.7);
  tl.to({}, { duration: 0.5 });

  // Keyboard users tabbing into a not-yet-revealed card jump to the end state.
  const onFocus = () => {
    const st = tl.scrollTrigger;
    if (st && tl.progress() < 0.99) window.scrollTo({ top: st.end + 2, behavior: "auto" });
  };
  stage.addEventListener("focusin", onFocus);

  return () => {
    stage.removeEventListener("focusin", onFocus);
    if (ticking) gsap.ticker.remove(tick);
    ambient.kill();
    el.classList.remove("is-live", "is-pinned", "is-connected");
    steps.forEach((s) => s.classList.remove("is-on"));
  };
}

/* ---- phones + tablet: sticky portrait stage, then the cards ---------- */

const SVG_NS = "http://www.w3.org/2000/svg";
type Pt = { x: number; y: number };

/** Anchor points on each island crop, as fractions of its box. */
const ANCHORS = {
  winOut: { x: 0.9, y: 0.24 }, // top of win's ramp
  runIn: { x: 0.05, y: 0.46 }, // run's left bridge arm
  runOut: { x: 0.16, y: 0.82 }, // run's plateau, left
  seeIn: { x: 0.09, y: 0.1 }, // top of see's ramp
};
const M_DRIFT = [
  { x: -34, y: -18, rotation: -9, rotationY: 26, scale: 0.86 },
  { x: 40, y: 10, rotation: 7, rotationY: -22, scale: 0.8 },
  { x: -26, y: 34, rotation: 9, rotationY: 20, scale: 0.88 },
];

function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

function narrow(el: HTMLElement) {
  const q = gsap.utils.selector(el);
  const track = q(".ism")[0] as HTMLElement;
  const scene = q(".ism__scene")[0] as HTMLElement;
  const deck = el.querySelector<SVGSVGElement>(".ism__deck")!;
  const isls = q(".ism__isl") as HTMLElement[];
  el.classList.add("is-live-m");

  // Ambient bob for scraps and islands (only while the stage is on screen).
  const bobs = q(".ism__scrap-bob") as HTMLElement[];
  const setY = bobs.map((b) => gsap.quickSetter(b, "y", "px"));
  const setR = bobs.map((b) => gsap.quickSetter(b, "rotation", "deg"));
  const floats = q(".ism__bob") as HTMLElement[];
  const setF = floats.map((f) => gsap.quickSetter(f, "y", "px"));
  const amp = { isl: 1 };
  const tick = (t: number) => {
    setY.forEach((s, i) => s(Math.sin(t * 1.1 + i * 1.4) * 5));
    setR.forEach((s, i) => s(Math.sin(t * 0.7 + i) * 3));
    setF.forEach((s, i) => s(Math.sin(t * 0.9 + i * 1.9) * 6 * amp.isl));
  };
  let ticking = false;
  const ambient = ScrollTrigger.create({
    trigger: track,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => {
      if (self.isActive && !ticking) gsap.ticker.add(tick);
      else if (!self.isActive && ticking) gsap.ticker.remove(tick);
      ticking = self.isActive;
    },
  });

  // The stage timeline depends on measured geometry, so it is rebuilt when
  // the width changes (not on the iOS address-bar height jiggle).
  let stage: gsap.Context | null = null;
  let lastW = 0;
  const build = () => {
    stage?.revert();
    deck.replaceChildren();
    lastW = window.innerWidth;
    const W = scene.clientWidth;
    const H = scene.clientHeight;
    deck.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const at = (i: number, a: Pt): Pt => {
      const b = isls[i];
      return { x: b.offsetLeft + b.offsetWidth * a.x, y: b.offsetTop + b.offsetHeight * a.y };
    };
    const segs: [Pt, Pt][] = [
      [at(0, ANCHORS.winOut), at(1, ANCHORS.runIn)],
      [at(1, ANCHORS.runOut), at(2, ANCHORS.seeIn)],
    ];

    // Draw both spans: two ropes, cross planks, a signal.
    const parts = segs.map(([a, b]) => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy);
      const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
      const nx = -dy / len;
      const ny = dx / len;
      const g = svg("g", { class: "ism__span" });
      const ropes = [-1, 1].map((side) => {
        const o = 14 * side;
        const r = svg("path", {
          class: "ism__rope",
          d: `M${(a.x + nx * o).toFixed(1)} ${(a.y + ny * o).toFixed(1)} L${(b.x + nx * o).toFixed(1)} ${(b.y + ny * o).toFixed(1)}`,
        });
        g.appendChild(r);
        return r;
      });
      const n = Math.max(6, Math.floor(len / 9));
      const planks: SVGGElement[] = [];
      for (let k = 0; k < n; k++) {
        const t = (k + 0.5) / n;
        const holder = svg("g", {
          transform: `translate(${(a.x + dx * t).toFixed(1)} ${(a.y + dy * t).toFixed(1)}) rotate(${ang.toFixed(1)})`,
        });
        const plank = svg("g", { class: "ism__plank" });
        plank.appendChild(svg("rect", { class: "ism__plank-top", x: -3.2, y: -15, width: 6.4, height: 30, rx: 1.2 }));
        holder.appendChild(plank);
        g.appendChild(holder);
        planks.push(plank);
      }
      const sig = svg("g", { class: "ism__signal" });
      sig.appendChild(svg("circle", { r: 14, class: "ism__glow" }));
      sig.appendChild(svg("circle", { r: 6, class: "ism__sigdot" }));
      g.appendChild(sig);
      deck.appendChild(g);
      return { a, b, ropes, planks, sig };
    });

    stage = gsap.context(() => {
      const steps = q(".ism__step") as HTMLElement[];
      const setStep = (p: number) => {
        const active = p < 0.16 ? 0 : p < 0.8 ? 1 : 2;
        steps.forEach((s, i) => s.classList.toggle("is-on", i <= active));
        el.classList.toggle("is-m-connected", p > 0.97);
      };
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: track,
          start: "top top",
          // finish before the cards ride up over the stage
          end: () => `+=${Math.max(200, track.offsetHeight - window.innerHeight * 1.35)}`,
          invalidateOnRefresh: true,
          scrub: 0.6,
          onUpdate: (self) => setStep(self.progress),
        },
      });
      setStep(0);

      each(tl, q(".ism__track i"), { scaleX: 0 }, { scaleX: 1, duration: 3.4 }, 0.6, 3.4);

      // Islands pulled in from adrift.
      isls.forEach((isl, i) => {
        tl.fromTo(
          isl.querySelector(".ism__float"),
          { ...M_DRIFT[i], transformPerspective: 700 },
          { x: 0, y: 0, rotation: 0, rotationY: 0, scale: 1, transformPerspective: 700, duration: 4.4, ease: "power2.inOut" },
          0.3 + i * 0.3,
        );
      });
      tl.fromTo(amp, { isl: 1 }, { isl: 0.1, duration: 3 }, 2);

      // Bridge spans, plank by plank; scraps are pulled into each span.
      const scraps = q(".ism__scrap") as HTMLElement[];
      parts.forEach((p, s) => {
        const t0 = 1.2 + s * 2.2;
        each(tl, p.ropes, { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.6 }, t0, 0.1);
        each(
          tl,
          p.planks,
          (i) => ({ autoAlpha: 0, scale: 0.2, rotation: ((i * 41) % 70) - 35, svgOrigin: "0 0" }),
          { autoAlpha: 1, scale: 1, rotation: 0, svgOrigin: "0 0", duration: 0.4, ease: "back.out(1.8)" },
          t0 + 0.1,
          1.6 / p.planks.length,
        );
        scraps
          .filter((sc) => sc.dataset.seg === String(s + 1))
          .forEach((sc, k) => {
            const t = 0.35 + k * 0.3;
            const tx = p.a.x + (p.b.x - p.a.x) * t;
            const ty = p.a.y + (p.b.y - p.a.y) * t;
            tl.fromTo(
              sc,
              { x: 0, y: 0, scale: 1, autoAlpha: 1 },
              {
                x: tx - (sc.offsetLeft + sc.offsetWidth / 2),
                y: ty - (sc.offsetTop + sc.offsetHeight / 2),
                scale: 0.1,
                autoAlpha: 0,
                duration: 1.1,
                ease: "power2.in",
              },
              t0 - 0.2 + k * 0.35,
            );
          });
      });

      // Caption swaps from the problem to the promise.
      tl.fromTo(q(".ism__cap--a"), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -12, duration: 0.5 }, 5.6);
      tl.fromTo(q(".ism__cap--b"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 5.9);

      // Signal crosses; each island's dot lights as it arrives.
      const dots = q(".ism__dot");
      tl.fromTo(dots[0], { scale: 0 }, { scale: 1, duration: 0.25, ease: "back.out(2)" }, 6);
      parts.forEach((p, s) => {
        const t0 = 6.1 + s * 0.9;
        tl.fromTo(p.sig, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, t0);
        tl.fromTo(p.sig, { x: p.a.x, y: p.a.y }, { x: p.b.x, y: p.b.y, duration: 0.8 }, t0);
        tl.to(p.sig, { autoAlpha: 0, duration: 0.1 }, t0 + 0.8);
        tl.fromTo(dots[s + 1], { scale: 0 }, { scale: 1, duration: 0.25, ease: "back.out(2)" }, t0 + 0.75);
      });
      tl.to({}, { duration: 0.8 });
    }, el);
  };
  build();
  const onResize = () => {
    if (Math.abs(window.innerWidth - lastW) < 2) return;
    build();
    ScrollTrigger.refresh();
  };
  window.addEventListener("resize", onResize);
  // The cards ride up over the end of the stage as a swipe rail. Symptoms
  // are ticked off as the rail arrives; the dots follow the swipe.
  const grid = q(".isles__grid")[0] as HTMLElement;
  const strike = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: grid, start: "top 85%", end: "top 35%", scrub: 0.6 },
  });
  (q(".isl") as HTMLElement[]).forEach((isl, c) => {
    const t0 = 0.3 + c * 0.1;
    each(strike, isl.querySelectorAll(".isl__sym-text"), { "--strike": "0%" }, { "--strike": "100%", duration: 0.4 }, t0, 0.15);
    each(strike, isl.querySelectorAll(".isl__mark-dash"), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.15 }, t0, 0.15);
    each(strike, isl.querySelectorAll(".isl__mark-tick"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.3 }, t0 + 0.05, 0.15);
  });
  const dots = q(".isles__dots i") as HTMLElement[];
  const cardsEls = q(".isl") as HTMLElement[];
  let raf = 0;
  const onSwipe = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const mid = grid.scrollLeft + grid.clientWidth / 2;
      let best = 0;
      cardsEls.forEach((card, i) => {
        const cMid = card.offsetLeft + card.offsetWidth / 2;
        const bMid = cardsEls[best].offsetLeft + cardsEls[best].offsetWidth / 2;
        if (Math.abs(cMid - mid) < Math.abs(bMid - mid)) best = i;
      });
      dots.forEach((dot, i) => dot.classList.toggle("is-on", i === best));
    });
  };
  grid.addEventListener("scroll", onSwipe, { passive: true });
  onSwipe();

  return () => {
    grid.removeEventListener("scroll", onSwipe);
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    if (ticking) gsap.ticker.remove(tick);
    ambient.kill();
    stage?.revert();
    deck.replaceChildren();
    el.classList.remove("is-live-m", "is-m-connected");
  };
}
