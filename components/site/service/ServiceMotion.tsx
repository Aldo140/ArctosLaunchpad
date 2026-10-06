"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import type { IslandId } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, MotionPathPlugin);

type Q = <T extends Element = HTMLElement>(sel: string) => T[];

/**
 * All motion for a service page, driven from the server-rendered markup.
 * Every animation runs *towards* the markup's rest state, so the page is
 * complete without JS and under reduced motion (where nothing here runs
 * except the native <details> FAQ).
 */
export function ServiceMotion({ island, children }: { island: IslandId; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const q: Q = (sel) => gsap.utils.toArray(sel, el);
    const cleanups: (() => void)[] = [];
    const mm = gsap.matchMedia(el);

    mm.add(
      {
        desk: "(min-width: 1024px) and (pointer: fine)",
        vert: "(max-width: 900px)",
        small: "(max-width: 1023px)",
      },
      (ctx) => {
        const { desk, vert, small } = ctx.conditions as { desk: boolean; vert: boolean; small: boolean };
        hero(q, island, desk, small, cleanups);
        beforeAfter(q, desk, small);
        capabilities(q, small);
        bridge(q, desk, vert);
        wrongFit(q);
        if (desk) tilt(q, cleanups);
        ScrollTrigger.sort();
        requestAnimationFrame(() => ScrollTrigger.refresh());
        return () => {
          cleanups.splice(0).forEach((fn) => fn());
          q(".is-pinned, .is-3d, .is-after, .is-sticky").forEach((n) => n.classList.remove("is-pinned", "is-3d", "is-after", "is-sticky"));
          q(".svx-ba__runway").forEach((n) => (n.style.height = ""));
          q(".svx-ba__stage").forEach((n) => (n.style.top = ""));
        };
      },
    );

    const offFaq = faq(el);
    return () => {
      offFaq();
      mm.revert();
    };
  }, [island]);

  return (
    <div ref={root} className={`svx svx--${island}`}>
      {children}
    </div>
  );
}

/* ---- Hero ---------------------------------------------------------------- */

function hero(q: Q, island: IslandId, desk: boolean, small: boolean, cleanups: (() => void)[]) {
  const section = q(".svx-hero")[0];
  const inner = q(".svx-stage__inner")[0];
  if (!section || !inner) return;
  const sig = q(".svx-plane--sig")[0];
  const track = q(".svx-stage-track")[0];

  // Desktop: the diagram builds itself on arrival. Touch: the stage is
  // sticky and the same build is scrubbed by the thumb, with the scene art
  // settling into place underneath it.
  if (small) {
    sig?.classList.add("is-on");
    // Bring the current island chip into view in the swipeable row.
    const list = q(".svx-isles ol")[0];
    const here = q(".svx-isles .is-here")[0]?.parentElement;
    if (list && here) list.scrollLeft = here.offsetLeft - list.offsetLeft;
  }
  const intro = small
    ? gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: { trigger: track, start: "top 78%", end: "bottom bottom", scrub: 0.6 },
      })
    : gsap.timeline({ delay: 0.2 });
  if (small) {
    intro
      .fromTo(".svx-scene img", { yPercent: 16, scale: 1.16 }, { yPercent: 0, scale: 1, duration: 3.6, ease: "none" }, 0)
      .fromTo(".svx-stage__inner", { y: 50 }, { y: 0, duration: 3.6, ease: "none" }, 0);
  }
  intro
    .from(".svx-plane--art", { opacity: 0, y: 80, scale: 0.92, duration: 1.8, ease: "expo.out" }, 0)
    .from(".svx-contours ellipse", { opacity: 0, scale: 0.6, transformOrigin: "50% 50%", stagger: 0.08, duration: 1.6, ease: "expo.out" }, 0.1)
    .from(".svx-ghost", { opacity: 0, yPercent: 30, duration: 1.6, ease: "expo.out" }, 0.2)
    .call(() => sig?.classList.add("is-on"), [], 0.5)
    .from(sig, { opacity: 0, duration: 0.4 }, 0.5);

  let loopActive = true;
  const loops: gsap.core.Animation[] = [];

  if (!small) q(".svx-card[data-float]").forEach((card, i) => {
    loops.push(gsap.to(card, { y: "-=7", duration: 2.4 + i * 0.5, ease: "sine.inOut", yoyo: true, repeat: -1, delay: i * 0.3 }));
  });

  if (island === "win") {
    intro
      .from(".svx-sig--win .svx-card", { opacity: 0, y: 26, stagger: 0.25, duration: 1, ease: "expo.out" }, 0.55)
      .from(".svx-sig--win .svx-sig__route", { drawSVG: "0%", duration: 2.2, ease: "power2.inOut" }, 0.9)
      .from(".svx-sig--win .svx-sig__dot", { opacity: 0, duration: 0.3 }, 0.9);
    if (small) {
      intro.fromTo(
        ".svx-sig--win .svx-sig__dot",
        { opacity: 1 },
        {
          duration: 2.2,
          ease: "power2.inOut",
          motionPath: { path: ".svx-sig--win .svx-sig__route", align: ".svx-sig--win .svx-sig__route", alignOrigin: [0.5, 0.5] },
        },
        0.9,
      );
    }
    const run = gsap.timeline({ repeat: -1, repeatDelay: 1.1, delay: 0.9, paused: small });
    run
      .fromTo(
        ".svx-sig--win .svx-sig__dot",
        { opacity: 1 },
        {
          duration: 3.4,
          ease: "power1.inOut",
          motionPath: { path: ".svx-sig--win .svx-sig__route", align: ".svx-sig--win .svx-sig__route", alignOrigin: [0.5, 0.5] },
        },
      )
      .fromTo(".svx-sig--win .svx-sig__ping", { scale: 1 }, { scale: 2.2, transformOrigin: "50% 50%", duration: 0.35, yoyo: true, repeat: 1, ease: "power2.out" })
      .to(".svx-sig--win .svx-sig__dot", { opacity: 0, duration: 0.4 }, "<");
    if (!small) loops.push(run);
  }

  if (island === "run") {
    const ring = q<SVGPathElement>(".svx-sig--run .svx-sig__route")[0];
    const tokens = q<SVGGElement>(".svx-token");
    const nodes = q<SVGGElement>(".svx-node");
    intro
      .from(nodes, { opacity: 0, scale: 0.6, transformOrigin: "50% 50%", stagger: 0.15, duration: 1, ease: "back.out(1.6)" }, 0.55)
      .from(ring, { drawSVG: "0%", duration: 2, ease: "power2.inOut" }, 0.8)
      .from(tokens, { opacity: 0, duration: 0.6, stagger: 0.2 }, 1.8);
    const raw = MotionPathPlugin.getRawPath(ring);
    MotionPathPlugin.cacheRawPathMeasurements(raw);
    const len = ring.getTotalLength();
    const nodeP = nodes.map((node) => {
      const m = node.transform.baseVal.consolidate()?.matrix;
      const cx = (m?.e ?? 0) + 48;
      const cy = (m?.f ?? 0) + 48;
      let best = 0;
      let bestD = Infinity;
      for (let s = 0; s <= 240; s++) {
        const pt = ring.getPointAtLength((s / 240) * len);
        const dd = (pt.x - cx) ** 2 + (pt.y - cy) ** 2;
        if (dd < bestD) {
          bestD = dd;
          best = s / 240;
        }
      }
      return best;
    });
    const period = 11;
    const state = { t: 0 };
    const tick = (_time: number, dt: number) => {
      if (!loopActive) return;
      state.t += dt / 1000 / period;
      const lit = nodes.map(() => false);
      tokens.forEach((token, k) => {
        const p = (state.t + k / tokens.length) % 1;
        const pos = MotionPathPlugin.getPositionOnPath(raw, p);
        gsap.set(token, { x: pos.x, y: pos.y });
        nodeP.forEach((np, n) => {
          const gap = Math.abs(p - np);
          if (Math.min(gap, 1 - gap) < 0.035) lit[n] = true;
        });
      });
      nodes.forEach((node, n) => node.classList.toggle("is-lit", lit[n]));
    };
    tick(0, 0);
    gsap.ticker.add(tick);
    cleanups.push(() => gsap.ticker.remove(tick));
  }

  if (island === "see") {
    const bodies = q<SVGGElement>(".svx-sheet__body");
    const bars = q<SVGRectElement>(".svx-bar");
    intro
      .fromTo(
        bodies,
        {
          opacity: 0,
          x: (i, t: Element) => Number(t.parentElement?.getAttribute("data-dx")),
          y: (i, t: Element) => Number(t.parentElement?.getAttribute("data-dy")) - 20,
          rotation: (i, t: Element) => Number(t.parentElement?.getAttribute("data-r")),
        },
        { opacity: 1, y: (i, t: Element) => Number(t.parentElement?.getAttribute("data-dy")), duration: 0.6, stagger: 0.1, ease: "power2.out", transformOrigin: "50% 50%" },
        0.5,
      )
      .to(bodies, { x: 0, y: 0, rotation: 0, duration: 1.2, stagger: 0.09, ease: "power3.inOut" }, 1.8)
      .from(".svx-report", { opacity: 0, scale: 0.88, transformOrigin: "50% 50%", duration: 1, ease: "expo.out" }, 2.5)
      .from(bars, { scaleY: 0, transformOrigin: "50% 100%", stagger: 0.07, duration: 0.9, ease: "expo.out" }, 2.8)
      .from(".svx-sig__trend", { drawSVG: "0%", duration: 1.2, ease: "power2.inOut" }, 3.1);
    const refreshLoop = gsap.timeline({ repeat: -1, repeatDelay: 2.6, delay: 6, paused: small });
    refreshLoop
      .to(bodies[0], { y: -46, x: -30, rotation: -8, duration: 0.6, ease: "power2.out" })
      .to(bodies[0], { y: 0, x: 0, rotation: 0, duration: 0.8, ease: "power3.inOut" })
      .to(".svx-sig--see .svx-sig__ping", { scale: 2.2, transformOrigin: "50% 50%", yoyo: true, repeat: 1, duration: 0.3 }, "<0.5")
      .to(bars, { scaleY: () => gsap.utils.random(0.72, 1.18), transformOrigin: "50% 100%", duration: 1, stagger: 0.05, ease: "expo.out" }, "<");
    if (!small) loops.push(refreshLoop);
  }

  // Only spend frames while the hero is on screen.
  ScrollTrigger.create({
    trigger: section,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => {
      loopActive = self.isActive;
      loops.forEach((l) => (self.isActive ? l.resume() : l.pause()));
    },
  });

  // Depth on scroll: the planes separate as the hero leaves (desktop only).
  if (desk) {
    gsap.to(".svx-plane--art", { yPercent: -14, ease: "none", scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".svx-plane--sig", { yPercent: -26, ease: "none", scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".svx-plane--back", { yPercent: 8, ease: "none", scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true } });
  }

  // Depth on pointer: the stage turns, the planes slide at different rates.
  if (desk) {
    const rx = gsap.quickTo(inner, "rotationX", { duration: 0.9, ease: "power3.out" });
    const ry = gsap.quickTo(inner, "rotationY", { duration: 0.9, ease: "power3.out" });
    const planes = [
      [".svx-plane--back", -12],
      [".svx-plane--art", 14],
      [".svx-plane--sig", 28],
    ] as const;
    const movers = planes.map(([sel, amt]) => ({ to: gsap.quickTo(q(sel)[0], "x", { duration: 1, ease: "power3.out" }), amt }));
    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      ry(nx * 10);
      rx(-ny * 7);
      movers.forEach((m) => m.to(nx * m.amt));
    };
    section.addEventListener("pointermove", onMove);
    cleanups.push(() => section.removeEventListener("pointermove", onMove));
  }
}

/* ---- Sound familiar → what changes ----------------------------------------- */

function beforeAfter(q: Q, desk: boolean, small: boolean) {
  const section = q(".svx-ba")[0];
  const card = q(".svx-ba__card")[0];
  if (!section || !card) return;
  const strikes = q(".svx-ba__strike");
  const outcomes = q(".svx-ba__outcomes li");
  const ticks = q(".svx-ba__tick path");
  gsap.set(strikes, { "--s": 0 });

  if (desk || small) {
    card.classList.add("is-3d");
    const track = q(".svx-ba__track")[0];
    const stage = q(".svx-ba__stage")[0];
    const runway = q(".svx-ba__runway")[0];
    // Touch: centre the sticky card in the visible screen, never under the header.
    const stick = () => Math.max(76, Math.round((window.innerHeight - stage.offsetHeight) / 2 + 24));
    let trigger: ScrollTrigger.Vars;
    if (desk) {
      section.classList.add("is-pinned");
      trigger = {
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * (0.3 * strikes.length + 0.25 * outcomes.length + 1)}`,
        pin: true,
        anticipatePin: 1,
      };
    } else {
      // Touch: a CSS-sticky stage over a runway; the thumb scrubs the flip.
      section.classList.add("is-sticky");
      runway.style.height = `${(strikes.length + outcomes.length) * 22 + 50}svh`;
      stage.style.top = `${stick()}px`;
      trigger = {
        trigger: track,
        start: () => `top ${stick()}px`,
        end: () => `bottom ${stick() + stage.offsetHeight}px`,
        onRefresh: () => (stage.style.top = `${stick()}px`),
      };
    }
    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      scrollTrigger: {
        ...trigger,
        scrub: desk ? 0.7 : 0.5,
        invalidateOnRefresh: true,
        onLeaveBack: () => section.classList.remove("is-after"),
      },
    });
    tl.to(".svx-ba__bar > span", { scaleX: 1, ease: "none", duration: strikes.length * 0.6 + 1.6 + outcomes.length * 0.4 }, 0);
    strikes.forEach((s, i) => {
      tl.to(s, { "--s": 1, color: "#5d6664", duration: 0.6 }, i * 0.6);
    });
    const at = strikes.length * 0.6 + 0.2;
    tl.to(card, { rotationY: 180, duration: 1.4, ease: "power2.inOut" }, at)
      .to(card, { scale: 0.92, duration: 0.7, ease: "power1.out" }, at)
      .to(card, { scale: 1, duration: 0.7, ease: "power1.in" }, at + 0.7)
      .call(() => section.classList.toggle("is-after", tl.scrollTrigger ? tl.scrollTrigger.direction > 0 : true), [], at + 0.7)
      .from(outcomes, { opacity: 0, x: 30, stagger: 0.25, duration: 0.45 }, at + 0.95)
      .from(ticks, { drawSVG: "0%", stagger: 0.25, duration: 0.45 }, at + 1.05);
  } else {
    strikes.forEach((s) =>
      gsap.to(s, {
        "--s": 1,
        color: "#5d6664",
        duration: 0.9,
        ease: "power3.inOut",
        scrollTrigger: { trigger: s, start: "top 72%", once: true },
      }),
    );
    gsap.from(outcomes, {
      opacity: 0,
      y: 22,
      stagger: 0.12,
      duration: 0.9,
      ease: "expo.out",
      scrollTrigger: { trigger: ".svx-ba__outcomes", start: "top 80%", once: true },
    });
    gsap.from(ticks, {
      drawSVG: "0%",
      stagger: 0.12,
      duration: 0.7,
      delay: 0.3,
      scrollTrigger: { trigger: ".svx-ba__outcomes", start: "top 80%", once: true },
    });
  }
}

/* ---- Capabilities -------------------------------------------------------------- */

function capabilities(q: Q, small: boolean) {
  const tiles = q(".svx-tile");
  if (!tiles.length) return;
  if (small) {
    // Touch: each tile is lifted into place by the scroll itself, its ghost
    // numeral drifts on a slower plane, and the tile crossing the middle of
    // the screen lights up the way a hovered tile does on desktop.
    tiles.forEach((tile, i) => {
      const face = tile.querySelector(".svx-tile__face");
      const ghost = tile.querySelector(".svx-tile__ghost");
      gsap.fromTo(
        face,
        { y: 70, rotationX: -48, opacity: 0, transformPerspective: 700, transformOrigin: "50% 100%" },
        {
          y: 0,
          rotationX: 0,
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: { trigger: tile, start: `top ${i % 2 ? 100 : 96}%`, end: "top 66%", scrub: 0.5 },
        },
      );
      gsap.fromTo(ghost, { yPercent: 40 }, { yPercent: -30, ease: "none", scrollTrigger: { trigger: tile, start: "top bottom", end: "bottom top", scrub: true } });
      ScrollTrigger.create({ trigger: tile, start: "top 58%", end: "bottom 42%", toggleClass: "is-lit" });
    });
    return;
  }
  gsap.set(tiles, { opacity: 0, y: 60, rotationX: -32, transformPerspective: 900, transformOrigin: "50% 100%" });
  ScrollTrigger.batch(tiles, {
    start: "top 90%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { opacity: 1, y: 0, rotationX: 0, stagger: 0.08, duration: 1.2, ease: "expo.out", overwrite: true }),
  });
}

/* ---- Bridge ---------------------------------------------------------------------- */

function bridge(q: Q, desk: boolean, vert: boolean) {
  const section = q(".svx-br")[0];
  const planks = q(".svx-plank");
  if (!section || !planks.length) return;
  const n = planks.length;
  const boards = q(".svx-plank__board");
  const nums = q(".svx-plank__n");
  const hangers = q(".svx-plank__hanger");
  const fill = q(".svx-br__fill")[0];
  const signal = q(".svx-br__signal")[0];
  const rail = q(".svx-br__rail")[0];

  if (desk && !vert) {
    section.classList.add("is-pinned");
    gsap.set(boards, { opacity: 0, y: -110, rotationX: 78, transformPerspective: 900, transformOrigin: "50% 0%" });
    gsap.set(hangers, { scaleY: 0, transformOrigin: "50% 0%" });
    gsap.set(fill, { scaleX: 0, transformOrigin: "0% 50%" });
    gsap.set(signal, { x: 0, opacity: 0 });
    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * (0.42 * n + 0.4)}`,
        pin: true,
        scrub: 0.7,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
    tl.from(".svx-br__tower", { scaleY: 0, transformOrigin: "50% 100%", duration: 0.5 }, 0)
      .from(".svx-br__cable path", { drawSVG: "0%", duration: 0.9, ease: "none" }, 0.1)
      .to(signal, { opacity: 1, duration: 0.2 }, 0.6);
    planks.forEach((_, i) => {
      const t = 0.8 + i;
      const f = (i + 0.5) / n;
      tl.to(hangers[i], { scaleY: 1, duration: 0.35 }, t)
        .to(boards[i], { opacity: 1, y: 0, rotationX: 0, duration: 0.6, ease: "back.out(1.3)" }, t + 0.15)
        .to(fill, { scaleX: f, duration: 0.6, ease: "power1.inOut" }, t + 0.35)
        .to(signal, { x: () => rail.offsetWidth * f, duration: 0.6, ease: "power1.inOut" }, t + 0.35)
        .to(nums[i], { backgroundColor: "#c4531c", color: "#f8f4ec", duration: 0.2 }, t + 0.85);
    });
    tl.to(fill, { scaleX: 1, duration: 0.5 }, n + 0.8)
      .to(signal, { x: () => rail.offsetWidth, duration: 0.5 }, n + 0.8)
      .to(".svx-br__shore--b", { color: "#e57a42", duration: 0.2 }, n + 1.2);
  } else if (vert) {
    gsap.set(fill, { scaleY: 0, transformOrigin: "50% 0%" });
    gsap.to(fill, {
      scaleY: 1,
      ease: "none",
      scrollTrigger: { trigger: ".svx-br__deck", start: "top 70%", end: "bottom 60%", scrub: 0.4 },
    });
    gsap.fromTo(
      signal,
      { y: 0 },
      {
        y: () => rail.offsetHeight,
        ease: "none",
        scrollTrigger: { trigger: ".svx-br__deck", start: "top 70%", end: "bottom 60%", scrub: 0.4, invalidateOnRefresh: true },
      },
    );
    // Each plank is laid by the scroll (swung down from vertical onto the
    // rail) and lights once the signal reaches it.
    boards.forEach((b, i) => {
      gsap.fromTo(
        b,
        { opacity: 0, rotationX: 80, y: -36, transformPerspective: 700, transformOrigin: "50% 0%" },
        {
          opacity: 1,
          rotationX: 0,
          y: 0,
          ease: "power2.out",
          scrollTrigger: { trigger: b, start: "top 98%", end: "top 70%", scrub: 0.5 },
        },
      );
      ScrollTrigger.create({ trigger: b, start: "top 62%", end: "max", toggleClass: { targets: planks[i], className: "is-lit" } });
    });
    void nums;
  } else {
    gsap.from(boards, {
      opacity: 0,
      y: 40,
      stagger: 0.1,
      duration: 1,
      ease: "expo.out",
      scrollTrigger: { trigger: ".svx-br__deck", start: "top 80%", once: true },
    });
  }
}

/* ---- Wrong fit: stamps ---------------------------------------------------------- */

function wrongFit(q: Q) {
  const notes = q(".svx-note");
  notes.forEach((note) => {
    const stamp = note.querySelector(".svx-stamp");
    gsap.set(stamp, { opacity: 0, scale: 2.6, rotation: -34 });
    gsap.from(note, { opacity: 0, y: 40, duration: 1, ease: "expo.out", scrollTrigger: { trigger: note, start: "top 88%", once: true } });
    gsap
      .timeline({ scrollTrigger: { trigger: note, start: "top 70%", once: true } })
      .to(stamp, { opacity: 1, scale: 1, rotation: -12, duration: 0.32, ease: "power4.in" }, 0.25)
      .fromTo(note, { y: 0 }, { y: 3, duration: 0.08, yoyo: true, repeat: 1, ease: "power1.out" }, 0.57);
  });
}

/* ---- Tilt (tiles, proof plates) ----------------------------------------------- */

function tilt(q: Q, cleanups: (() => void)[]) {
  q("[data-svx-tilt]").forEach((el) => {
    const target = el.querySelector<HTMLElement>(".svx-tile__face, .stage") ?? el;
    const soft = el.dataset.svxTilt === "soft";
    const amt = soft ? 5 : 11;
    gsap.set(target, { transformPerspective: soft ? 1400 : 800 });
    const rx = gsap.quickTo(target, "rotationX", { duration: 0.6, ease: "power3.out" });
    const ry = gsap.quickTo(target, "rotationY", { duration: 0.6, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      ry((x - 0.5) * amt);
      rx(-(y - 0.5) * amt);
      target.style.setProperty("--mx", `${x * 100}%`);
      target.style.setProperty("--my", `${y * 100}%`);
    };
    const leave = () => {
      rx(0);
      ry(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    cleanups.push(() => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    });
  });
}

/* ---- FAQ: height animated open/close, native <details> semantics kept ----------- */

function faq(el: HTMLElement) {
  const offs: (() => void)[] = [];
  el.querySelectorAll<HTMLDetailsElement>(".svx-faq__item").forEach((item) => {
    const summary = item.querySelector("summary");
    const body = item.querySelector<HTMLElement>(".svx-faq__body");
    if (!summary || !body) return;
    const onClick = (e: MouseEvent) => {
      e.preventDefault();
      gsap.killTweensOf(body);
      const wasClosing = item.classList.contains("is-closing");
      if (!item.open || wasClosing) {
        item.classList.remove("is-closing");
        const from = wasClosing ? body.offsetHeight : 0;
        item.open = true;
        gsap.fromTo(
          body,
          { height: from, opacity: wasClosing ? Number(gsap.getProperty(body, "opacity")) : 0 },
          { height: body.scrollHeight, opacity: 1, duration: 0.6, ease: "expo.out", onComplete: () => gsap.set(body, { height: "auto" }) },
        );
      } else {
        item.classList.add("is-closing");
        gsap.fromTo(
          body,
          { height: body.offsetHeight },
          {
            height: 0,
            opacity: 0,
            duration: 0.45,
            ease: "power3.inOut",
            onComplete: () => {
              item.open = false;
              item.classList.remove("is-closing");
              gsap.set(body, { clearProps: "height,opacity" });
            },
          },
        );
      }
    };
    summary.addEventListener("click", onClick);
    offs.push(() => summary.removeEventListener("click", onClick));
  });
  return () => offs.forEach((fn) => fn());
}
