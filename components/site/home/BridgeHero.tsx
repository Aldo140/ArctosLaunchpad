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
import { ART_H, ART_W, DECK, FRAMES, GLOSS, ISLES, LABELS, LIVE, PLUMB } from "./hero/geometry";

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
 * Phones and tablets (≤ 900px): a sticky stage inside a tall track. Scroll
 * drives a three-act camera move across the painting — win, run, see — with
 * the signal travelling the deck in sync, then pulls back to the whole bridge
 * where the lead and the actions arrive. No pinning library, no pointer.
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

    const setup = (story: boolean) => {
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
        if (story || !introDone) trail.style.strokeDashoffset = String(len * (1 - sig.p));
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
      if (!story) {
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
          if (visible && !story) loop.play();
        },
      });
      tl.from(".hero__sky", { opacity: 0, scale: 1.08, duration: 2.6, ease: "power2.out" }, 0)
        .from(".hero__survey", { opacity: 0, duration: 2.2, ease: "power1.out" }, 0.35)
        .from(".hero__glow", { opacity: 0, scale: 0.55, duration: 2.6, ease: "power2.out" }, 0.3)
        .from(
          ".hero__lift",
          { opacity: 0, y: 110, rotationX: story ? 0 : 28, scale: 0.9, duration: 2.3, ease: "expo.out", transformOrigin: "50% 100%" },
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

      if (story) {
        // The first frame lands whole: lines light in order, no scrolling needed.
        tl.from(".hero__eyebrow-in", { opacity: 0, y: 14, duration: 1, ease: "expo.out" }, 0.4)
          .from(".hero__label", { opacity: 0, duration: 0.9, ease: "power2.out", stagger: 0.12 }, 0.9)
          .call(() => light("win", false), [], 1.15)
          .call(() => light("run", false), [], 1.4)
          .call(() => light("see", false), [], 1.65);
      } else {
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
      gsap.to(".hero__float", { y: story ? -6 : -11, duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1 });
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
      if (fine && !story) {
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

      if (story) {
        buildStory();
      } else {
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

      /**
       * Phones/tablets. The pin is a CSS sticky 100svh stage inside a tall
       * track; this timeline is scrubbed by the track's scroll.
       */
      function buildStory() {
        const pin = el!.querySelector<HTMLElement>(".hero__pin");
        const stage = el!.querySelector<HTMLElement>(".hero__stage");
        const dolly = el!.querySelector<HTMLElement>(".hero__dolly");
        const title = el!.querySelector<HTMLElement>(".hero__title");
        const lead = el!.querySelector<HTMLElement>(".hero__lead");
        if (!pin || !stage || !dolly || !title || !lead) return;

        // Camera: put art point (ax, ay) at pin point (fx, fy), zoomed by s.
        const cam = (ax: number, ay: number, s: number, fx: number, fy: number) => ({
          x: fx - stage.offsetLeft - s * ax * stage.offsetWidth,
          y: fy - stage.offsetTop - s * ay * stage.offsetWidth * (ART_H / ART_W),
          scale: s,
        });
        const W = () => pin.clientWidth;
        const H = () => pin.clientHeight;
        const frame = (id: IslandId) => () => {
          const f = FRAMES[id];
          return cam(f.ax, f.ay, f.s, W() / 2, H() * 0.66);
        };
        // The final frame: the whole bridge between the headline and the lead.
        const finale = () => {
          const top = title.offsetTop + title.offsetHeight;
          const bottom = lead.offsetTop;
          const artH = stage.offsetWidth * (ART_H / ART_W);
          const s = Math.min(1, ((bottom - top) * 1.04) / (artH * 0.98));
          return cam(0.5, 0.56, s, W() / 2, top + (bottom - top) * 0.5);
        };
        const fv = (f: () => { x: number; y: number; scale: number }, key: "x" | "y" | "scale", k = 1) => () =>
          f()[key] * k;

        let current: IslandId | null = null;
        gsap.set(dolly, { transformOrigin: "0 0" });
        const setZoom = () => stage.style.setProperty("--zoom", String(gsap.getProperty(dolly, "scale")));

        const st = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: ".hero__track",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const p = self.progress;
              const id: IslandId | null =
                p < 0.075 ? null : p < 0.37 ? "win" : p < 0.6 ? "run" : p < 0.8 ? "see" : null;
              if (id === current) return;
              current = id;
              if (id) pulse(id);
              setActive(id);
            },
          },
          onUpdate: setZoom,
        });

        const moveTo = (f: () => { x: number; y: number; scale: number }, at: number, dur: number) => {
          st.to(dolly, { x: fv(f, "x"), y: fv(f, "y"), scale: fv(f, "scale"), duration: dur }, at);
          // Depth: far planes drift a little, near planes a lot, in the same direction.
          const rel = (k: number) => () => f().x * k * 0.12;
          st.to(".hero__sky", { x: rel(0.25), duration: dur }, at)
            .to(".hero__survey", { x: rel(0.6), duration: dur }, at)
            .to(".hero__glow", { x: rel(1), duration: dur }, at)
            .to(".hero__motes", { x: rel(2.2), y: () => (f().scale - 1) * -40, duration: dur }, at)
            .to(".hero__scraps", { x: rel(3.4), y: () => (f().scale - 1) * -90, duration: dur }, at);
        };

        const acts = gsap.utils.toArray<HTMLElement>(".hero__act", el);
        const actIn = (i: number, at: number) =>
          st.fromTo(acts[i], { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" }, at)
            .fromTo(acts[i].querySelector(".hero__act-u"), { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power2.out" }, at + 0.35);
        const actOut = (i: number, at: number) =>
          st.to(acts[i], { autoAlpha: 0, y: -30, duration: 0.5, ease: "power2.in" }, at);

        st.set({}, {}, 0)
          // Act 1 — win
          .to([".hero__eyebrow", title], { autoAlpha: 0, y: -36, duration: 0.6, ease: "power2.in", stagger: 0.05 }, 0.6)
          .to(".hero__cue", { autoAlpha: 0, duration: 0.3 }, 0.6);
        moveTo(frame("win"), 0.6, 1.4);
        actIn(0, 1.3);
        st.fromTo(signal, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "none" }, 1.5)
          .fromTo(sig, { p: 0 }, { p: 0, duration: 0.01, onUpdate: place }, 1.5);
        // Act 2 — run
        actOut(0, 2.8);
        moveTo(frame("run"), 2.8, 1.6);
        st.to(sig, { p: pRun, duration: 1.6, onUpdate: place }, 2.8)
          .fromTo(".hero__plumb", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.4, ease: "power2.out" }, 4.2);
        actIn(1, 3.6);
        // Act 3 — see
        actOut(1, 5.2);
        moveTo(frame("see"), 5.2, 1.6);
        st.to(sig, { p: 1, duration: 1.6, onUpdate: place }, 5.2);
        actIn(2, 6.0);
        // Finale — the whole connected bridge, then the way forward
        actOut(2, 7.6);
        moveTo(finale, 7.6, 1.4);
        st.to(signal, { opacity: 0, duration: 0.4 }, 8.4)
          .to([".hero__eyebrow", title], { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.05 }, 8.3)
          .fromTo(
            [lead, ".hero__copy .actions"],
            { autoAlpha: 0, y: 30 },
            { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.12, immediateRender: true },
            8.5,
          )
          .to({}, { duration: 0.8 }, 9.2);
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
          if (!introDone || story) return;
          if (visible) loop.play();
          else loop.pause();
        },
      });

      return () => {
        detach();
        follow.current = null;
      };
    };

    const mm = gsap.matchMedia(el);
    mm.add("(max-width: 900px)", () => setup(true));
    mm.add("(min-width: 901px)", () => setup(false));

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

          {/* Phone/tablet scroll story: one act per island (visual duplicate of
              the H1 lines, so hidden from assistive tech). */}
          <div className="hero__acts" aria-hidden="true">
            {islands.map((island) => (
              <div key={island.id} className={`hero__act hero__act--${island.id}`}>
                <p className="hero__act-k">
                  <span>{island.index}</span> / 03
                </p>
                <p className="hero__act-t">
                  {island.id === "see" ? <em>{island.line}</em> : island.line}
                  <span className="hero__act-u" />
                </p>
                <p className="hero__act-g">{GLOSS[island.id]}</p>
              </div>
            ))}
            <ol className="hero__rail">
              {ORDER.map((id) => (
                <li key={id} className={active === id ? "is-on" : undefined} />
              ))}
            </ol>
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
