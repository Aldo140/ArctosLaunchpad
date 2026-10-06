"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { islands, type IslandId } from "@/lib/content";
import { Btn, TextLink } from "../ui";
import { Atmosphere } from "./hero/Atmosphere";
import { Snow } from "./hero/Snow";
import {
  ART_H, ART_W, DECK, ISLES, LABELS, LIVE, PIECE_LABELS, PIECES, PLUMB, ROUTE, SCENE, STOPS,
} from "./hero/geometry";

gsap.registerPlugin(ScrollTrigger, SplitText);

const ORDER: IslandId[] = ["win", "run", "see"];
const COMET = 150;

type Follow = { to: (x: number, y: number) => void; home: () => void };

/**
 * The bridge. Three headline lines, three islands, one rust signal.
 *
 * Desktop (> 900px): the headline rises out of its masks while the scene
 * assembles in depth; the signal crosses the deck and each arrival lights an
 * island, its label and its headline line. Pointer tilt, hover links lines
 * and islands both ways, and scrolling away dollies the camera into the art.
 *
 * Phones and tablets (≤ 900px): the bridge is recomposed for a portrait
 * screen from its three island cut-outs. They rise in at their own depths,
 * then a rust route climbs win → run → see and each arrival lights its
 * headline line. Scrolling is never captured: the islands only drift apart
 * in parallax as the page moves.
 *
 * Reduced motion: none of the above. Everything is lit and static.
 */
export function BridgeHero() {
  const root = useRef<HTMLElement>(null);
  const follow = useRef<Follow | null>(null);
  const [active, setActive] = useState<IslandId | null>(null);
  const [lit, setLit] = useState<IslandId[]>(ORDER);

  // The light follows the active island, then returns to the signal.
  useEffect(() => {
    if (!follow.current) return;
    if (active) follow.current.to(ISLES[active].cx, ISLES[active].cy);
    else follow.current.home();
  }, [active]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.intro = "done";
      return;
    }

    const deck = el.querySelector<SVGPathElement>(".hero__deck");
    const signal = el.querySelector<SVGCircleElement>(".hero__signal");
    const trail = el.querySelector<SVGPathElement>(".hero__trail");
    const comet = el.querySelector<SVGPathElement>(".hero__comet");
    if (!deck || !signal || !trail || !comet) return;

    const len = deck.getTotalLength();
    // Where along the deck the signal is directly above the run island.
    let pRun = 0.5;
    let best = Infinity;
    for (let i = 0; i <= 240; i++) {
      const d = Math.abs(deck.getPointAtLength((len * i) / 240).x - PLUMB.x);
      if (d < best) {
        best = d;
        pRun = i / 240;
      }
    }

    const lines = gsap.utils.toArray<HTMLElement>(".hero__line", el);

    const setup = () => {
      const fine = window.matchMedia("(pointer: fine)").matches;
      let visible = true;
      let introDone = false;

      const splits = lines.map((line) =>
        SplitText.create(line.querySelector(".hero__text"), {
          type: "words",
          mask: "words",
          wordsClass: "hero__w",
          aria: "none",
        }),
      );

      setLit([]);
      setActive(null);
      el.dataset.intro = "running";

      // ---- the light that rides with the signal ----------------------
      const beam = el.querySelector(".hero__beam");
      gsap.set(beam, { x: ISLES.win.cx, y: ISLES.win.cy });
      const beamX = gsap.quickTo(beam, "x", { duration: 0.7, ease: "power3.out" });
      const beamY = gsap.quickTo(beam, "y", { duration: 0.7, ease: "power3.out" });
      let hovering = false;
      let last = { x: ISLES.win.cx, y: ISLES.win.cy };
      follow.current = {
        to: (x, y) => {
          hovering = true;
          beamX(x);
          beamY(y);
        },
        home: () => {
          hovering = false;
          beamX(last.x);
          beamY(last.y);
        },
      };

      // ---- the signal ------------------------------------------------
      const sig = { p: 0 };
      gsap.set(trail, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
      gsap.set(comet, { strokeDasharray: `${COMET} ${len + COMET}`, strokeDashoffset: COMET });
      const place = () => {
        const pt = deck.getPointAtLength(sig.p * len);
        signal.setAttribute("cx", pt.x.toFixed(1));
        signal.setAttribute("cy", pt.y.toFixed(1));
        comet.style.strokeDashoffset = String(COMET - sig.p * len);
        if (!introDone) trail.style.strokeDashoffset = String(len * (1 - sig.p));
        last = { x: pt.x, y: pt.y };
        if (!hovering) {
          beamX(pt.x);
          beamY(pt.y);
        }
      };

      const pulse = (id: IslandId, strength = 1) => {
        const { cx, cy } = ISLES[id];
        gsap.fromTo(
          `.hero__pulse--${id}`,
          { scale: 0.55, opacity: 0.95 * strength },
          { scale: 1.75, opacity: 0, duration: 1.7, ease: "expo.out", svgOrigin: `${cx} ${cy}` },
        );
      };

      const light = (id: IslandId, flashWords = true) => {
        const i = ORDER.indexOf(id);
        setLit((current) => (current.includes(id) ? current : [...current, id]));
        if (flashWords) {
          // The signal runs through the line it just lit.
          const words = splits[i].words as HTMLElement[];
          const base = getComputedStyle(words[0]).color;
          const flash = id === "see" ? "#fff4ea" : "#ffb48a";
          gsap.to(words, {
            keyframes: [
              { color: flash, duration: 0.16, ease: "none" },
              { color: base, duration: 0.8, ease: "power2.out" },
            ],
            stagger: 0.08,
            onComplete: () => gsap.set(words, { clearProps: "color" }),
          });
        }
        const spark = lines[i].querySelector(".hero__spark");
        const width = lines[i].querySelector<HTMLElement>(".hero__words")?.offsetWidth ?? 0;
        gsap.fromTo(
          spark,
          { x: 0, opacity: 1 },
          { x: width, duration: 1.1, ease: "expo.out", onComplete: () => void gsap.to(spark, { opacity: 0, duration: 0.4 }) },
        );
      };

      const arrive = (id: IslandId) => {
        light(id);
        pulse(id);
      };

      // ---- quiet loop after the first crossing (desktop only) -----------
      const loop = gsap.timeline({ repeat: -1, repeatDelay: 2.6, paused: true });
      {
        loop
          .set(sig, { p: 0, onComplete: place })
          .fromTo(signal, { opacity: 0, scale: 0.4, svgOrigin: "0 0" }, { opacity: 1, scale: 1, duration: 0.4 })
          .call(() => pulse("win", 0.55))
          .to(sig, { p: pRun, duration: 1.7, ease: "sine.inOut", onUpdate: place })
          .call(() => pulse("run", 0.55))
          .to(sig, { p: 1, duration: 1.7, ease: "sine.inOut", onUpdate: place }, "+=0.3")
          .call(() => pulse("see", 0.55))
          .to(signal, { opacity: 0, duration: 0.6 }, "+=0.1");
      }

      // ---- intro -----------------------------------------------------
      const tl = gsap.timeline({
        delay: 0.08,
        onComplete: () => {
          introDone = true;
          el.dataset.intro = "done";
          if (visible) loop.play();
        },
      });
      tl.from(".hero__sky", { opacity: 0, scale: 1.08, duration: 2.6, ease: "power2.out" }, 0)
        .from(".hero__survey", { opacity: 0, duration: 2.2, ease: "power1.out" }, 0.35)
        .from(".hero__glow", { opacity: 0, scale: 0.55, duration: 2.6, ease: "power2.out" }, 0.3)
        .from(
          ".hero__lift",
          { opacity: 0, y: 110, rotationX: 28, scale: 0.9, duration: 2.3, ease: "expo.out", transformOrigin: "50% 100%" },
          0.15,
        );
      splits.forEach((split, i) => {
        tl.from(
          split.words,
          { yPercent: 118, rotation: 6, duration: 1.3, ease: "expo.out", stagger: 0.075, transformOrigin: "0% 100%" },
          0.12 + i * 0.17,
        );
      });
      tl.from(".hero__motes", { opacity: 0, duration: 2 }, 0.8)
        .from(".hero__scraps", { opacity: 0, duration: 2.2 }, 1)
        .from(".hero__cue", { opacity: 0, duration: 1 }, 1.4);

      {
        tl.from(
          [".hero__eyebrow", ".hero__lead", ".hero__copy .actions"],
          { opacity: 0, y: 26, duration: 1.2, ease: "expo.out", stagger: 0.09 },
          0.5,
        )
          .from(".hero__label", { opacity: 0, y: 18, duration: 0.9, ease: "power3.out", stagger: 0.12 }, 0.95)
          .from(".hero__proof-label, .hero__live li", { opacity: 0, y: 14, duration: 0.9, ease: "expo.out", stagger: 0.06 }, 1.15)
          .fromTo(signal, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 1.25)
          .call(() => arrive("win"), [], 1.3)
          .to(sig, { p: pRun, duration: 1.3, ease: "power2.inOut", onUpdate: place }, 1.4)
          .fromTo(".hero__plumb", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.45, ease: "power2.out" }, 2.62)
          .call(() => arrive("run"), [], 2.8)
          .to(sig, { p: 1, duration: 1.3, ease: "power2.inOut", onUpdate: place }, 3.0)
          .call(() => arrive("see"), [], 4.3)
          .to(trail, { opacity: 0.4, duration: 1.4 }, 4.5)
          .to(signal, { opacity: 0, duration: 0.6 }, 4.6);
      }

      // ---- idle life --------------------------------------------------
      gsap.to(".hero__float", { y: -11, duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(".hero__shadow", { scaleX: 0.88, opacity: 0.6, duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.utils.toArray<HTMLElement>(".hero__mote", el).forEach((mote, i) => {
        const depth = Number(mote.dataset.depth || 0.5);
        gsap.to(mote, {
          y: -40 - depth * 70,
          x: (i % 2 ? 1 : -1) * (8 + depth * 14),
          duration: 6 + (1 - depth) * 6,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: i * 0.37,
        });
      });
      gsap.utils.toArray<HTMLElement>(".hero__bokeh", el).forEach((bokeh, i) => {
        gsap.to(bokeh, {
          y: i % 2 ? 26 : -30,
          x: i % 2 ? -12 : 14,
          duration: 7 + i * 1.3,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });

      // ---- pointer depth (desktop, fine pointers only) -----------------
      let detach = () => {};
      if (fine) {
        const q = (sel: string, prop: string, dur = 1.2) =>
          gsap.quickTo(el.querySelector(sel), prop, { duration: dur, ease: "power3.out" });
        const tiltY = q(".hero__tilt", "rotationY", 1.4);
        const tiltX = q(".hero__tilt", "rotationX", 1.4);
        const planes = [
          [q(".hero__sky", "x", 1.8), q(".hero__sky", "y", 1.8), -26],
          [q(".hero__survey", "x", 1.6), q(".hero__survey", "y", 1.6), -14],
          [q(".hero__glow", "x", 1.5), q(".hero__glow", "y", 1.5), 18],
          [q(".hero__motes", "x", 1.1), q(".hero__motes", "y", 1.1), 34],
          [q(".hero__scraps", "x", 0.9), q(".hero__scraps", "y", 0.9), 60],
        ] as const;
        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          tiltY(nx * 9);
          tiltX(ny * -6);
          for (const [px, py, amt] of planes) {
            px(nx * amt);
            py(ny * amt * 0.6);
          }
        };
        const onLeave = () => {
          tiltY(0);
          tiltX(0);
          for (const [px, py] of planes) {
            px(0);
            py(0);
          }
        };
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        detach = () => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
        };
      }

      {
        // ---- scroll-out: the camera dollies in, the planes separate -----
        const out = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.6 },
        });
        // Lines part like layers: the top line lifts fastest, so they spread apart.
        lines.forEach((line, i) => out.to(line, { y: -(120 - i * 50), x: -(6 + i * 10) }, 0));
        out
          .to(".hero__copy", { yPercent: -10 }, 0)
          .to(".hero__dolly", { scale: 1.12, yPercent: -6, rotationX: 14, transformOrigin: "72% 85%" }, 0)
          .to(".hero__sky", { yPercent: 18 }, 0)
          .to(".hero__survey", { yPercent: 10 }, 0)
          .to(".hero__glow", { yPercent: -14 }, 0)
          .to(".hero__motes", { yPercent: -45 }, 0)
          .to(".hero__scraps", { yPercent: -120 }, 0)
          .fromTo(".hero__edge", { scaleY: 0.35 }, { scaleY: 1 }, 0)
          .fromTo(".hero__edge-line", { strokeDashoffset: 1 }, { strokeDashoffset: 0 }, 0.15);
      }

      ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          visible = self.isActive;
          // Idle life (float, motes) sleeps while the hero is off screen.
          gsap.getTweensOf(el.querySelectorAll(".hero__float, .hero__shadow, .hero__mote, .hero__bokeh"))
            .filter((t) => t.repeat() === -1)
            .forEach((t) => (visible ? t.resume() : t.pause()));
          if (!introDone) return;
          if (visible) loop.play();
          else loop.pause();
        },
      });

      return () => {
        detach();
        follow.current = null;
      };
    };

    /** Phones and tablets: the portrait scene. */
    const setupIsles = () => {
      const scene = el.querySelector<HTMLElement>(".hero__isles");
      const route = el.querySelector<SVGPathElement>(".hero__route");
      const rider = el.querySelector<SVGCircleElement>(".hero__rider");
      if (!scene || !route || !rider) return;
      const rlen = route.getTotalLength();
      el.dataset.intro = "running";
      setLit([]);
      setActive(null);

      // Fraction of the route at which it passes each island's stop.
      const at = (id: IslandId) => {
        let best = 0;
        let dist = Infinity;
        for (let i = 0; i <= 200; i++) {
          const pt = route.getPointAtLength((rlen * i) / 200);
          const d = Math.hypot(pt.x - STOPS[id].x, pt.y - STOPS[id].y);
          if (d < dist) {
            dist = d;
            best = i / 200;
          }
        }
        return best;
      };
      const pRun = at("run");

      const splits = lines.map((line) =>
        SplitText.create(line.querySelector(".hero__text"), {
          type: "words",
          mask: "words",
          wordsClass: "hero__w",
          aria: "none",
        }),
      );

      const ride = { p: 0 };
      const place = () => {
        const pt = route.getPointAtLength(ride.p * rlen);
        rider.setAttribute("cx", pt.x.toFixed(1));
        rider.setAttribute("cy", pt.y.toFixed(1));
        route.style.strokeDashoffset = String(rlen * (1 - ride.p));
      };
      gsap.set(route, { strokeDasharray: rlen, strokeDashoffset: rlen });

      const ring = (id: IslandId, strength = 1) =>
        gsap.fromTo(
          `.hero__stop--${id}`,
          { scale: 0.4, opacity: 0.9 * strength },
          { scale: 2.4, opacity: 0, duration: 1.6, ease: "expo.out", svgOrigin: `${STOPS[id].x} ${STOPS[id].y}` },
        );

      const arrive = (id: IslandId) => {
        setLit((current) => (current.includes(id) ? current : [...current, id]));
        ring(id);
        gsap.fromTo(`.hero__isle-piece--${id}`, { y: 0 }, { y: -10, duration: 0.25, ease: "power2.out", yoyo: true, repeat: 1 });
        const i = ORDER.indexOf(id);
        const words = splits[i].words as HTMLElement[];
        const base = getComputedStyle(words[0]).color;
        gsap.to(words, {
          keyframes: [
            { color: id === "see" ? "#fff4ea" : "#ffb48a", duration: 0.16, ease: "none" },
            { color: base, duration: 0.8, ease: "power2.out" },
          ],
          stagger: 0.06,
          onComplete: () => void gsap.set(words, { clearProps: "color" }),
        });
        const spark = lines[i].querySelector(".hero__spark");
        const width = lines[i].querySelector<HTMLElement>(".hero__words")?.offsetWidth ?? 0;
        gsap.fromTo(
          spark,
          { x: 0, opacity: 1 },
          { x: width, duration: 1, ease: "expo.out", onComplete: () => void gsap.to(spark, { opacity: 0, duration: 0.4 }) },
        );
      };

      // ---- intro: night falls in, the islands rack into focus at their own
      // depths, light sweeps the paper, then the route ignites the bridge.
      const tl = gsap.timeline({ delay: 0.05 });
      tl.from(".hero__sky", { opacity: 0, duration: 1.8, ease: "power2.out" }, 0)
        .from(".hero__glow", { opacity: 0, scale: 0.6, duration: 2.2, ease: "power2.out" }, 0.2)
        .from(".hero__survey", { opacity: 0, duration: 1.8 }, 0.3)
        .from(".hero__aurora i", { opacity: 0, scaleY: 0.4, duration: 2.4, ease: "power2.out", stagger: 0.25 }, 0.2)
        .from(".hero__eyebrow-in", { opacity: 0, y: 12, duration: 0.9, ease: "expo.out" }, 0.15);
      splits.forEach((split, i) => {
        tl.from(split.words, { yPercent: 118, rotation: 5, duration: 1.15, ease: "expo.out", stagger: 0.07, transformOrigin: "0% 100%" }, 0.1 + i * 0.14);
      });
      // Rack focus: far islands resolve first and travel least; the near one
      // starts closest to the lens, largest and softest.
      (["see", "run", "win"] as IslandId[]).forEach((id, i) => {
        const d = PIECES[id].depth;
        tl.fromTo(
          `.hero__isle-piece--${id}`,
          { opacity: 0, y: 30 + d * 80, scale: 1.12 + d * 0.12, filter: `blur(${6 + d * 10}px)` },
          {
            opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
            duration: 1.7 + d * 0.3, ease: "expo.out",
            clearProps: "filter",
          },
          0.3 + i * 0.18,
        );
      });
      // One sweep of light across the paper, near to far.
      tl.fromTo(
        ".hero__sheen",
        { backgroundPosition: "130% 0" },
        { backgroundPosition: "-30% 0", duration: 1.3, ease: "power2.inOut", stagger: 0.12 },
        1.25,
      )
        .from(".hero__copy .actions", { opacity: 0, y: 18, duration: 1, ease: "expo.out" }, 1.1)
        .from(".hero__lead", { opacity: 0, y: 18, duration: 1, ease: "expo.out" }, 1.2)
        .fromTo(rider, { opacity: 0, scale: 0.3, svgOrigin: `${STOPS.win.x} ${STOPS.win.y}` }, { opacity: 1, scale: 1, duration: 0.35 }, 1.6)
        .call(() => arrive("win"), [], 1.65)
        .to(ride, { p: pRun, duration: 1.05, ease: "power2.inOut", onUpdate: place }, 1.7)
        .call(() => arrive("run"), [], 2.75)
        // The keystone takes the load: the halo behind the bear blooms.
        .fromTo(".hero__halo", { opacity: 0.25, scale: 0.7 }, { opacity: 1, scale: 1, duration: 1.4, ease: "expo.out" }, 2.75)
        .to(ride, { p: 1, duration: 0.95, ease: "power2.inOut", onUpdate: place }, 2.85)
        .call(() => arrive("see"), [], 3.8)
        .from(".hero__tag", { opacity: 0, duration: 0.7, ease: "power2.out", stagger: 0.55 }, 1.7)
        .to(rider, { opacity: 0, duration: 0.6 }, 3.95);

      // ---- the aurora never quite holds still
      gsap.utils.toArray<HTMLElement>(".hero__aurora i", el).forEach((band, i) => {
        gsap.to(band, {
          xPercent: i % 2 ? -14 : 12,
          skewX: i % 2 ? 8 : -10,
          scaleY: 1.18,
          opacity: 0.85 + i * 0.05,
          duration: 7 + i * 2.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 2 + i * 0.6,
        });
      });

      // ---- touch: drag the scene and it tilts in depth; tap an island to light it
      const box = scene.querySelector<HTMLElement>(".hero__isles-box");
      const tiltY = gsap.quickTo(box, "rotationY", { duration: 0.5, ease: "power3.out" });
      const tiltX = gsap.quickTo(box, "rotationX", { duration: 0.5, ease: "power3.out" });
      const shift = (Object.keys(PIECES) as IslandId[]).map((id) => {
        const target = scene.querySelector(`.hero__isle-float--${id}`);
        return [
          gsap.quickTo(target, "x", { duration: 0.6, ease: "power3.out" }),
          PIECES[id].depth,
        ] as const;
      });
      let origin: { x: number; y: number; id: number } | null = null;
      let moved = false;
      const lean = (dx: number, dy: number) => {
        const nx = gsap.utils.clamp(-1, 1, dx / 160);
        const ny = gsap.utils.clamp(-1, 1, dy / 200);
        tiltY(nx * 16);
        tiltX(ny * -8);
        for (const [x, depth] of shift) x(nx * (8 + depth * 26));
      };
      const release = () => {
        origin = null;
        gsap.to(box, { rotationY: 0, rotationX: 0, duration: 1.4, ease: "elastic.out(1, 0.45)", overwrite: true });
        for (const [x] of shift) x(0);
      };
      const down = (e: PointerEvent) => {
        origin = { x: e.clientX, y: e.clientY, id: e.pointerId };
        moved = false;
      };
      const move = (e: PointerEvent) => {
        if (!origin || e.pointerId !== origin.id) return;
        const dx = e.clientX - origin.x;
        const dy = e.clientY - origin.y;
        if (Math.abs(dx) > 6) moved = true;
        lean(dx, dy);
      };
      const up = (e: PointerEvent) => {
        if (!origin || e.pointerId !== origin.id) return;
        // A tap on an island lights it, the same way the route does.
        if (!moved) {
          const hit = (e.target as HTMLElement).closest<HTMLElement>("[data-isle]");
          if (hit?.dataset.isle) arrive(hit.dataset.isle as IslandId);
        }
        release();
      };
      box?.addEventListener("pointerdown", down);
      box?.addEventListener("pointermove", move);
      box?.addEventListener("pointerup", up);
      box?.addEventListener("pointercancel", release);
      box?.addEventListener("pointerleave", release);

      // ---- idle: each island breathes on its own rhythm
      (Object.keys(PIECES) as IslandId[]).forEach((id, i) => {
        gsap.to(`.hero__isle-float--${id}`, {
          y: -(4 + PIECES[id].depth * 6),
          duration: 3.4 + i * 0.7,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 1.8 + i * 0.4,
        });
      });

      // ---- a quiet signal climbs the route now and then
      const loop = gsap.timeline({ repeat: -1, repeatDelay: 3.2, delay: 6, paused: true });
      loop
        .set(ride, { p: 0 })
        .to(rider, { opacity: 1, duration: 0.3 })
        .to(ride, {
          p: 1,
          duration: 2.6,
          ease: "sine.inOut",
          onUpdate: () => {
            const pt = route.getPointAtLength(ride.p * rlen);
            rider.setAttribute("cx", pt.x.toFixed(1));
            rider.setAttribute("cy", pt.y.toFixed(1));
          },
        })
        .call(() => ring("win", 0.5), [], 0.3)
        .call(() => ring("run", 0.5), [], 0.3 + 2.6 * pRun)
        .call(() => ring("see", 0.5), [], 2.9)
        .to(rider, { opacity: 0, duration: 0.5 }, 2.9);
      tl.eventCallback("onComplete", () => {
        el.dataset.intro = "done";
        loop.play();
      });

      // ---- scroll: no pinning, the islands just part in depth as the page moves
      const parallax = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.4 },
      });
      (Object.keys(PIECES) as IslandId[]).forEach((id) => {
        parallax.to(`.hero__isle-piece--${id}`, { yPercent: -10 - PIECES[id].depth * 22 }, 0);
      });
      parallax.to(".hero__sky", { yPercent: 14 }, 0).to(".hero__glow", { yPercent: -10 }, 0);

      ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          const tweens = gsap
            .getTweensOf(el.querySelectorAll(".hero__isle-float, .hero__mote, .hero__bokeh"))
            .filter((t) => t.repeat() === -1);
          tweens.forEach((t) => (self.isActive ? t.resume() : t.pause()));
          if (el.dataset.intro === "done") {
            if (self.isActive) loop.play();
            else loop.pause();
          }
        },
      });

      return () => {
        box?.removeEventListener("pointerdown", down);
        box?.removeEventListener("pointermove", move);
        box?.removeEventListener("pointerup", up);
        box?.removeEventListener("pointercancel", release);
        box?.removeEventListener("pointerleave", release);
      };
    };

    const mm = gsap.matchMedia(el);
    mm.add("(max-width: 900px)", () => setupIsles());
    mm.add("(min-width: 901px)", () => setup());

    return () => {
      mm.revert();
      el.dataset.intro = "pending";
      setLit(ORDER);
      setActive(null);
    };
  }, []);

  const lineClass = (id: IslandId) =>
    `hero__line${lit.includes(id) ? " is-lit" : ""}${active === id ? " is-active" : ""}${
      active && active !== id ? " is-dim" : ""
    }`;

  return (
    <section
      ref={root}
      className={`hero tone-ink${active ? " has-active" : ""}`}
      data-tone="ink"
      data-intro="pending"
      aria-labelledby="hero-title"
    >
      <div className="hero__track">
        <div className="hero__pin">
          <Atmosphere />
          <Snow />

          <div className="wrap hero__grid">
            <div className="hero__copy">
              <p className="eyebrow hero__eyebrow">
                <span className="hero__eyebrow-in">A Calgary studio for growing businesses</span>
              </p>
              <h1 id="hero-title" className="display hero__title">
                <span className="visually-hidden">Win the customer. Run the work. See the numbers.</span>
                {islands.map((island) => (
                  <span
                    key={island.id}
                    aria-hidden="true"
                    className={lineClass(island.id)}
                    onPointerEnter={() => setActive(island.id)}
                    onPointerLeave={() => setActive(null)}
                  >
                    <span className="hero__words">
                      <span className="hero__text">
                        {island.id === "see" ? <em>{island.line}</em> : island.line}
                      </span>
                      <span className="hero__spark" />
                    </span>
                  </span>
                ))}
              </h1>

              {/* Phones and tablets: the bridge recomposed for a portrait screen. */}
              <div className="hero__isles">
                <div className="hero__isles-box">
                  {/* The northern sky behind the bear: aurora ribbons and a warm halo. */}
                  <div className="hero__aurora" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </div>
                  <div className="hero__halo" aria-hidden="true" />
                  {(["see", "run", "win"] as IslandId[]).map((id) => {
                    const piece = PIECES[id];
                    return (
                      <div
                        key={id}
                        className={`hero__isle-piece hero__isle-piece--${id}${lit.includes(id) ? " is-lit" : ""}`}
                        style={
                          {
                            "--x": `${(piece.x / SCENE) * 100}%`,
                            "--y": `${(piece.y / SCENE) * 100}%`,
                            "--w": `${(piece.width / SCENE) * 100}%`,
                          } as CSSProperties
                        }
                      >
                        <div className={`hero__isle-float hero__isle-float--${id}`} data-isle={id}>
                          <Image
                            src={piece.src}
                            alt=""
                            width={piece.w}
                            height={piece.h}
                            loading={id === "run" ? "eager" : undefined}
                            sizes={`${Math.round((piece.width / SCENE) * 112)}vw`}
                          />
                          {/* light passing over the paper, clipped to the island's own shape */}
                          <span className="hero__sheen" style={{ "--src": `url(${piece.src})` } as CSSProperties} />
                        </div>
                      </div>
                    );
                  })}
                  <svg className="hero__route-svg" viewBox={`0 0 ${SCENE} ${SCENE}`} aria-hidden="true">
                    <path className="hero__route-ghost" d={ROUTE} />
                    <path className="hero__route" d={ROUTE} />
                    {ORDER.map((id) => (
                      <g key={id}>
                        <circle className={`hero__stop hero__stop--${id}`} cx={STOPS[id].x} cy={STOPS[id].y} r="22" />
                        <circle className={`hero__stop-dot${lit.includes(id) ? " is-lit" : ""}`} cx={STOPS[id].x} cy={STOPS[id].y} r="7" />
                      </g>
                    ))}
                    <circle className="hero__rider" r="11" cx={STOPS.win.x} cy={STOPS.win.y} />
                  </svg>
                  {islands.map((island) => (
                    <Link
                      key={island.id}
                      href={`/services#${island.id}`}
                      className={`hero__tag hero__tag--${PIECE_LABELS[island.id].align}${lit.includes(island.id) ? " is-lit" : ""}`}
                      style={{ "--x": `${PIECE_LABELS[island.id].x}%`, "--y": `${PIECE_LABELS[island.id].y}%` } as CSSProperties}
                    >
                      <span className="index">{island.index}</span>
                      <span>{island.name}</span>
                    </Link>
                  ))}
                </div>
                <p className="visually-hidden">
                  A polar bear setting the keystone of a rust-coloured bridge between three floating islands.
                </p>
              </div>

              <p className="lead hero__lead">
                Arctos designs and builds the websites, software, automation and reporting that
                connect them, so a growing business stops running on inboxes and spreadsheets.
              </p>
              <div className="actions">
                <Btn href="/contact">Start a project</Btn>
                <TextLink href="/work">See the work</TextLink>
              </div>
            </div>

            <div className="hero__stage">
              <div className="hero__dolly">
                <div className="hero__lift">
                  <figure className="hero__art hero__tilt">
                    <div className="hero__float">
                      <span className="hero__shadow hero__shadow--win" aria-hidden="true" />
                      <span className="hero__shadow hero__shadow--run" aria-hidden="true" />
                      <span className="hero__shadow hero__shadow--see" aria-hidden="true" />
                      <Image
                        src="/assets/art/bridge.webp"
                        alt="A polar bear building a rust-coloured bridge that connects three floating islands."
                        width={ART_W}
                        height={ART_H}
                        priority
                        sizes="(max-width: 600px) 260vw, (max-width: 900px) 200vw, 64vw"
                      />
                      <svg className="hero__light" viewBox={`0 0 ${ART_W} ${ART_H}`} aria-hidden="true">
                        <defs>
                          <radialGradient id="hero-beam">
                            <stop offset="0" stopColor="#ffb07a" stopOpacity="0.75" />
                            <stop offset="0.45" stopColor="#e57a42" stopOpacity="0.22" />
                            <stop offset="1" stopColor="#e57a42" stopOpacity="0" />
                          </radialGradient>
                        </defs>
                        <g className="hero__beam">
                          <ellipse rx="300" ry="230" fill="url(#hero-beam)" />
                        </g>
                      </svg>
                      <svg className="hero__overlay" viewBox={`0 0 ${ART_W} ${ART_H}`} aria-hidden="true">
                        <defs>
                          <radialGradient id="hero-isle-glow">
                            <stop offset="0" stopColor="#ff9a5c" stopOpacity="0.55" />
                            <stop offset="1" stopColor="#ff9a5c" stopOpacity="0" />
                          </radialGradient>
                        </defs>
                        {ORDER.map((id) => {
                          const s = ISLES[id];
                          return (
                            <g
                              key={id}
                              className={`hero__isle${active === id ? " is-active" : ""}${lit.includes(id) ? " is-lit" : ""}`}
                            >
                              <ellipse className="hero__isle-glow" cx={s.cx} cy={s.cy} rx={s.rx * 1.25} ry={s.ry * 2.4} fill="url(#hero-isle-glow)" />
                              <ellipse className="hero__isle-ring" cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} pathLength={1} />
                              <ellipse className={`hero__pulse hero__pulse--${id}`} cx={s.cx} cy={s.cy} rx={s.rx * 0.8} ry={s.ry * 0.8} />
                            </g>
                          );
                        })}
                        <path className="hero__plumb" d={`M${PLUMB.x} ${PLUMB.top} V${PLUMB.bottom}`} pathLength={1} />
                        <path className="hero__deck" d={DECK} />
                        <path className="hero__trail" d={DECK} />
                        <path className="hero__comet" d={DECK} />
                        <circle className="hero__signal" r="9" cx="214" cy="640" />
                      </svg>
                    </div>
                    <div className="hero__labels">
                      {islands.map((island) => (
                        <Link
                          key={island.id}
                          href={`/services#${island.id}`}
                          className={`hero__label hero__label--${island.id}${lit.includes(island.id) ? " is-lit" : ""}${active === island.id ? " is-active" : ""}`}
                          style={{ "--x": `${LABELS[island.id].x}%`, "--y": `${LABELS[island.id].y}%` } as CSSProperties}
                          onPointerEnter={() => setActive(island.id)}
                          onPointerLeave={() => setActive(null)}
                          onFocus={() => setActive(island.id)}
                          onBlur={() => setActive(null)}
                        >
                          <span className="index">{island.index}</span>
                          <span>{island.name}</span>
                        </Link>
                      ))}
                    </div>
                  </figure>
                </div>
              </div>
            </div>
          </div>

          <div className="hero__cue" aria-hidden="true">
            <span className="mono">Scroll</span>
            <span className="hero__cue-track">
              <span className="hero__cue-dot" />
            </span>
          </div>
        </div>
      </div>

      <div className="wrap hero__foot">
        <div className="hero__proof">
          <p className="mono hero__proof-label">
            <span className="hero__ping" aria-hidden="true" />
            Live now
            <span className="hero__count"> · {String(LIVE.length).padStart(2, "0")} projects</span>
          </p>
          <div className="hero__marquee">
            <ul className="hero__live">
              {LIVE.map(([name, href]) => (
                <li key={href}>
                  <Link href={href}>{name}</Link>
                </li>
              ))}
            </ul>
            <ul className="hero__live hero__live--dupe" aria-hidden="true">
              {LIVE.map(([name, href]) => (
                <li key={href}>
                  <Link href={href} tabIndex={-1}>
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <svg className="hero__edge" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
        <path
          className="hero__edge-fill"
          d="M0 80 L0 50 C 170 34 300 62 480 48 C 660 34 790 16 960 28 C 1130 40 1270 62 1440 40 L1440 80 Z"
        />
        <path
          className="hero__edge-line"
          d="M0 50 C 170 34 300 62 480 48 C 660 34 790 16 960 28 C 1130 40 1270 62 1440 40"
          pathLength={1}
        />
      </svg>
    </section>
  );
}
