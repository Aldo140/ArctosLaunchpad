"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { islands, type IslandId } from "@/lib/content";
import { Btn, TextLink } from "../ui";
import { Atmosphere } from "./hero/Atmosphere";
import { Snow } from "./hero/Snow";
import { ART_H, ART_W, DECK, ISLES, LABELS, LIVE, PLUMB } from "./hero/geometry";
import { DEMO_SITES, DEMO_START_COUNT, DEMO_YOUR_REPLY, SystemDemo } from "./hero/SystemDemo";

gsap.registerPlugin(ScrollTrigger, SplitText, MotionPathPlugin);

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
 * Phones and tablets (≤ 900px): the metaphor gives way to the real thing. A
 * live demo plays what Arctos builds: a visitor taps the call to action on a
 * real client site (win), the enquiry lands on an automated leads board and
 * follows itself up (run), and the weekly dashboard counts it (see). Each
 * step lights its headline line, then the loop moves to the next client.
 * Scrolling is never captured.
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

    /** Phones and tablets: the live demo. */
    const setupDemo = () => {
      const stage = el.querySelector<HTMLElement>(".hero__demo-stage");
      if (!stage) return;
      const $ = <T extends Element = HTMLElement>(sel: string) => stage.querySelector<T>(sel)!;
      const phone = $(".demo-phone");
      const screen = $(".demo-phone__screen");
      const sites = gsap.utils.toArray<HTMLElement>(".demo-site", stage);
      const tap = $(".demo-tap");
      const toast = $(".demo-toast");
      const toastWhat = $(".demo-toast__what");
      const signal = $(".demo-signal");
      const trail = gsap.utils.toArray<HTMLElement>(".demo-trail", stage);
      const newRow = $(".demo-row--new");
      const rowName = $(".demo-name");
      const rowWhat = $(".demo-what");
      const rowAv = $(".demo-row--new .demo-av");
      const pillA = $(".demo-pill__a");
      const pillB = $(".demo-pill__b");
      const count = $(".demo-count");
      const today = $(".demo-bars .is-today");
      const routeA = $<SVGPathElement>(".demo-route__path--a");
      const routeB = $<SVGPathElement>(".demo-route__path--b");
      const svg = $<SVGSVGElement>(".demo-route");
      const mail = $(".demo-mail");
      const mailText = $(".demo-mail__t");
      const mailState = $(".demo-mail__state");
      const glare = $(".demo-glare");
      const reply = { n: 0, text: "" };
      el.dataset.intro = "running";
      setLit([]);
      setActive(null);

      const splits = lines.map((line) =>
        SplitText.create(line.querySelector(".hero__text"), {
          type: "words",
          mask: "words",
          wordsClass: "hero__w",
          aria: "none",
        }),
      );

      // ---- geometry: where things are, in stage pixels ---------------------
      const rel = (node: Element, fx = 0.5, fy = 0.5) => {
        const s0 = stage.getBoundingClientRect();
        const r = node.getBoundingClientRect();
        return { x: r.left - s0.left + r.width * fx, y: r.top - s0.top + r.height * fy };
      };
      let site = 0;
      // The visitor's turn: where they tapped (fractions of the screen), and state.
      let tapAt: { x: number; y: number } | null = null;
      let userTurn = false;
      let userDone = false;
      const points = () => {
        const sr = screen.getBoundingClientRect();
        const s0 = stage.getBoundingClientRect();
        // A visitor's own tap overrides the site's call to action.
        const t = tapAt ?? DEMO_SITES[site].tap;
        return {
          tap: { x: sr.left - s0.left + sr.width * t.x, y: sr.top - s0.top + sr.height * t.y },
          row: rel(newRow, 0.12, 0.5),
          count: rel(count, 0.5, 0.55),
        };
      };
      const drawRoutes = () => {
        const p = points();
        const w = stage.clientWidth;
        const h = stage.clientHeight;
        svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
        svg.setAttribute("preserveAspectRatio", "none");
        const mid = (a: { x: number; y: number }, b: { x: number; y: number }, bend: number) =>
          `${(a.x + b.x) / 2 + bend} ${(a.y + b.y) / 2}`;
        routeA.setAttribute("d", `M ${p.tap.x} ${p.tap.y} Q ${mid(p.tap, p.row, -w * 0.12)} ${p.row.x} ${p.row.y}`);
        routeB.setAttribute("d", `M ${p.row.x} ${p.row.y} Q ${mid(p.row, p.count, w * 0.22)} ${p.count.x} ${p.count.y}`);
        const t = tapAt ?? DEMO_SITES[site].tap;
        gsap.set(tap, { left: `${t.x * 100}%`, top: `${t.y * 100}%` });
      };

      // ---- lighting the headline ------------------------------------------
      const light = (id: IslandId) => {
        setLit((current) => (current.includes(id) ? current : [...current, id]));
        stage.querySelector(`[data-step="${id}"]`)?.classList.add("is-lit");
        const i = ORDER.indexOf(id);
        const words = splits[i].words as HTMLElement[];
        const base = getComputedStyle(words[0]).color;
        gsap.to(words, {
          keyframes: [
            { color: id === "see" ? "#fff4ea" : "#ffb48a", duration: 0.14, ease: "none" },
            { color: base, duration: 0.7, ease: "power2.out" },
          ],
          stagger: 0.05,
          onComplete: () => void gsap.set(words, { clearProps: "color" }),
        });
        const spark = lines[i].querySelector(".hero__spark");
        const width = lines[i].querySelector<HTMLElement>(".hero__words")?.offsetWidth ?? 0;
        gsap.fromTo(spark, { x: 0, opacity: 1 }, { x: width, duration: 0.9, ease: "expo.out", onComplete: () => void gsap.to(spark, { opacity: 0, duration: 0.3 }) });
      };
      // A step lights its screen with a soft rust rim rather than a jump.
      const pop = (card: Element) => {
        card.classList.add("is-active");
        window.setTimeout(() => card.classList.remove("is-active"), 1300);
      };

      // ---- intro: the screens arrive in depth -----------------------------
      const tl = gsap.timeline({ delay: 0.05 });
      tl.from(".hero__sky", { opacity: 0, duration: 1.6, ease: "power2.out" }, 0)
        .from(".hero__glow", { opacity: 0, scale: 0.6, duration: 2, ease: "power2.out" }, 0.2)
        .from(".hero__survey", { opacity: 0, duration: 1.6 }, 0.3)
        .from(".hero__aurora i", { opacity: 0, scaleY: 0.4, duration: 2.2, ease: "power2.out", stagger: 0.25 }, 0.2)
        .from(".hero__eyebrow-in", { opacity: 0, y: 12, duration: 0.9, ease: "expo.out" }, 0.15)
        .from(".hero__sub", { opacity: 0, y: 14, duration: 1, ease: "expo.out" }, 0.5);
      splits.forEach((split, i) => {
        tl.from(split.words, { yPercent: 118, rotation: 5, duration: 1.1, ease: "expo.out", stagger: 0.06, transformOrigin: "0% 100%" }, 0.1 + i * 0.12);
      });
      tl.from(".demo-phone", { opacity: 0, x: -50, rotationY: 50, z: -200, filter: "blur(10px)", duration: 1.5, ease: "expo.out", clearProps: "filter" }, 0.45)
        .from(".demo-leads", { opacity: 0, x: 50, rotationY: -40, z: -160, filter: "blur(10px)", duration: 1.5, ease: "expo.out", clearProps: "filter" }, 0.6)
        .from(".demo-dash", { opacity: 0, y: 60, rotationX: 40, z: -120, filter: "blur(10px)", duration: 1.5, ease: "expo.out", clearProps: "filter" }, 0.75)
        // the dashboard arrives already counting: the week rolls up to today
        .from(".demo-bars i", { height: 0, duration: 0.7, ease: "back.out(1.6)", stagger: 0.06 }, 1)
        .fromTo({ v: 0 }, { v: 0 }, {
          v: DEMO_START_COUNT,
          duration: 1,
          ease: "power2.out",
          onUpdate() {
            count.textContent = String(Math.round(this.targets()[0].v));
          },
        }, 0.95)
        .from(".hero__copy .actions", { opacity: 0, y: 18, duration: 1, ease: "expo.out" }, 1)
        .from(".hero__lead", { opacity: 0, y: 18, duration: 1, ease: "expo.out" }, 1.1)
        .call(() => {
          el.dataset.intro = "done";
          drawRoutes();
          if (held) story.pause(0);
          else story.play(0);
        }, [], 1.7);

      // ---- one enquiry, end to end ----------------------------------------
      let n = DEMO_START_COUNT;
      const counter = { v: n };
      const story = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.6, onRepeat: () => nextSite() });
      const nextSite = () => {
        // The first full loop has played: invite the visitor to take a turn.
        if (!userDone && !hinted) {
          hinted = true;
          gsap.fromTo(".demo-hint", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "back.out(2)" });
        }
        userTurn = false;
        tapAt = null;
        newRow.classList.remove("is-you");
        const prev = site;
        site = (site + 1) % DEMO_SITES.length;
        // Swipe to the next client, the way a phone moves between apps.
        gsap.timeline({ defaults: { duration: 0.75, ease: "power3.inOut" } })
          .set(sites[site], { opacity: 1, xPercent: 100 })
          .to(sites[prev], { xPercent: -35, opacity: 0.4 }, 0)
          .to(sites[site], { xPercent: 0 }, 0)
          .set(sites[prev], { opacity: 0, xPercent: 0 });
        gsap.fromTo(glare, { xPercent: -120 }, { xPercent: 120, duration: 1.1, ease: "power2.inOut" });
        drawRoutes();
        // GSAP records function-based starts and motion paths on first play;
        // the routes just moved, so have it measure again.
        story.invalidate();
      };
      story
        // 01 — the tap on the client's own call to action
        .fromTo(tap, { opacity: 0, scale: 1.8 }, { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" }, 0.5)
        .to(tap, { scale: 0.7, duration: 0.12, ease: "power2.in" }, 0.85)
        .to(tap, { scale: 2.2, opacity: 0, duration: 0.5, ease: "expo.out" }, 0.97)
        .call(() => { light("win"); pop(phone); }, [], 0.95)
        // the enquiry leaves the site
        .call(() => {
          const lead = userTurn ? { who: "You", what: "Your enquiry" } : DEMO_SITES[site].lead;
          newRow.classList.toggle("is-you", userTurn);
          toastWhat.textContent = lead.what;
          rowName.textContent = lead.who;
          rowWhat.textContent = lead.what;
          rowAv.textContent = lead.who[0];
        }, [], 0.96)
        // Appear exactly where the flight begins, so there is no snap when it leaves.
        .set(toast, { motionPath: { path: routeA, align: routeA, alignOrigin: [0.1, 0.5], start: 0, end: 0 } }, 0.99)
        .fromTo(toast, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, 1)
        .to(toast, {
          motionPath: { path: routeA, align: routeA, alignOrigin: [0.1, 0.5] },
          duration: 0.8,
          ease: "power2.inOut",
        }, 1.25)
        .to(toast, { opacity: 0, scale: 0.7, duration: 0.25 }, 2)
        // 02 — it lands on the board, and the automation writes back
        .fromTo(newRow, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.45, ease: "power3.out" }, 2)
        .call(() => { light("run"); }, [], 2.1)
        .set(pillB, { opacity: 0 }, 2)
        .set(pillA, { opacity: 1 }, 2)
        .call(() => {
          reply.text = userTurn ? DEMO_YOUR_REPLY : DEMO_SITES[site].reply;
          mailText.textContent = "";
          mailState.textContent = "Auto-reply · writing";
          mail.classList.remove("is-sent");
          const at = rel(newRow, 0.04, 1);
          gsap.set(mail, { x: at.x, y: at.y + 6 });
        }, [], 2.3)
        .fromTo(mail, { autoAlpha: 0, scale: 0.85, transformOrigin: "10% 0%" }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, 2.35)
        .fromTo(reply, { n: 0 }, {
          n: 1,
          duration: 1,
          ease: "none",
          onUpdate: () => { mailText.textContent = reply.text.slice(0, Math.round(reply.n * reply.text.length)); },
        }, 2.5)
        .call(() => {
          mailState.textContent = "Auto-reply · sent in 4s";
          mail.classList.add("is-sent");
        }, [], 3.5)
        .to(pillA, { opacity: 0, duration: 0.25 }, 3.5)
        .fromTo(pillB, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35, ease: "back.out(2)" }, 3.6)
        .call(() => {
          const pill = pillB.parentElement!;
          pill.classList.add("is-done");
          pop($(".demo-leads"));
        }, [], 3.6)
        .to(mail, { autoAlpha: 0, y: "-=10", scale: 0.92, duration: 0.4, ease: "power2.in" }, 4.15)
        // 03 — the dashboard counts it
        .fromTo([signal, ...trail], { opacity: 0 }, { opacity: (i) => [1, 0.5, 0.25][i], duration: 0.15 }, 4.4)
        // the signal and two fading echoes, a beat apart: a comet, not a dot
        .to(signal, { motionPath: { path: routeB, align: routeB, alignOrigin: [0.5, 0.5] }, duration: 0.7, ease: "power2.inOut" }, 4.4)
        .to(trail[0], { motionPath: { path: routeB, align: routeB, alignOrigin: [0.5, 0.5] }, duration: 0.7, ease: "power2.inOut" }, 4.45)
        .to(trail[1], { motionPath: { path: routeB, align: routeB, alignOrigin: [0.5, 0.5] }, duration: 0.7, ease: "power2.inOut" }, 4.5)
        .to([signal, ...trail], { opacity: 0, duration: 0.25, stagger: 0.05 }, 5.1)
        .call(() => {
          n += 1;
          gsap.to(counter, { v: n, duration: 0.5, ease: "power2.out", onUpdate: () => { count.textContent = String(Math.round(counter.v)); } });
          gsap.to(today, { height: `${Math.min(96, 30 + (n - DEMO_START_COUNT) * 14)}%`, duration: 0.6, ease: "back.out(1.6)" });
          light("see");
          pop($(".demo-dash"));
          celebrate();
          // The first time the numbers move, the bear comes up to look; after
          // that it gives a happy little bob each time.
          if (!bearUp) {
            bearUp = true;
            gsap.to(".demo-bear", { yPercent: 0, opacity: 1, duration: 0.9, ease: "back.out(1.7)", delay: 0.15 });
          } else {
            gsap.fromTo(".demo-bear", { y: 0, rotation: 0 }, { keyframes: [{ y: -7, rotation: -3, duration: 0.18 }, { y: 0, rotation: 0, duration: 0.5, ease: "bounce.out" }], transformOrigin: "50% 100%" });
          }
        }, [], 5.1)
        // the visitor's own enquiry made it all the way: say so
        .call(() => {
          if (!userTurn || userDone) return;
          userDone = true;
          gsap.fromTo(".demo-nudge", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "expo.out", delay: 0.3 });
        }, [], 5.4)
        // the visitor's own row stays on the board for the rest of the visit
        .call(() => {
          if (!userTurn) return;
          const kept = newRow.cloneNode(true) as HTMLElement;
          kept.classList.remove("demo-row--new");
          kept.removeAttribute("style");
          kept.querySelector<HTMLElement>(".demo-pill__a")?.setAttribute("style", "opacity:0");
          kept.querySelector<HTMLElement>(".demo-pill__b")?.setAttribute("style", "opacity:1");
          newRow.after(kept);
          // keep the board at three rows: the oldest one makes room. It is
          // hidden, not removed, because React owns it and will unmount it.
          const rows = [...newRow.parentElement!.querySelectorAll<HTMLElement>(".demo-row:not(.demo-row--new)")]
            .filter((row) => row.style.display !== "none");
          if (rows.length > 2) rows[rows.length - 1].style.display = "none";
          gsap.from(kept, { backgroundColor: "rgba(229,122,66,0.25)", duration: 1.2, ease: "power2.out" });
        }, [], 6.85)
        // reset for the next client
        .to(newRow, { height: 0, opacity: 0, duration: 0.4, ease: "power2.in" }, 6.9)
        .call(() => {
          pillB.parentElement!.classList.remove("is-done");
          gsap.set(pillA, { opacity: 1 });
          gsap.set(pillB, { opacity: 0 });
        }, [], 7.35);

      // ---- celebration: a +1 chip and a burst of paper in brand colours ------
      const confetti = $(".demo-confetti");
      const plus = $(".demo-plus");
      const PAPER = ["#e57a42", "#f1ebdf", "#ffb48a", "#5ebea0", "#c4531c"];
      const celebrate = () => {
        gsap.fromTo(plus, { autoAlpha: 0, y: 6, scale: 0.6 }, { keyframes: [
          { autoAlpha: 1, y: -10, scale: 1, duration: 0.3, ease: "back.out(2)" },
          { autoAlpha: 0, y: -26, duration: 0.6, delay: 0.5, ease: "power1.in" },
        ] });
        for (let i = 0; i < 14; i++) {
          const bit = document.createElement("i");
          bit.style.background = PAPER[i % PAPER.length];
          confetti.appendChild(bit);
          const angle = (-160 + Math.random() * 140) * (Math.PI / 180);
          const speed = 40 + Math.random() * 50;
          gsap.fromTo(bit,
            { x: 0, y: 0, rotation: Math.random() * 180, opacity: 1, scale: 0.6 + Math.random() * 0.6 },
            {
              keyframes: [
                { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed, rotation: "+=220", duration: 0.55, ease: "power2.out" },
                { y: `+=${30 + Math.random() * 30}`, opacity: 0, rotation: "+=120", duration: 0.7, ease: "power1.in" },
              ],
              onComplete: () => bit.remove(),
            });
        }
      };

      // ---- your turn: tap the site and your enquiry runs the system --------
      let hinted = false;
      const takeTurn = (e: PointerEvent) => {
        const r = screen.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
        if (userTurn) return;
        navigator.vibrate?.(12);
        gsap.to(".demo-hint", { autoAlpha: 0, duration: 0.3 });
        story.pause();
        gsap.set(newRow, { height: 0, opacity: 0 });
        pillB.parentElement!.classList.remove("is-done");
        gsap.set(pillA, { opacity: 1 });
        gsap.set(pillB, { opacity: 0 });
        gsap.set([toast, signal], { opacity: 0 });
        gsap.set(mail, { autoAlpha: 0 });
        userTurn = true;
        tapAt = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
        drawRoutes();
        story.invalidate();
        // Their tap shows at once, where they touched (the timeline's own
        // ripple fade-in sits before the point we jump to).
        gsap.set(tap, { opacity: 1, scale: 1 });
        if (held) onPause();
        story.play(0.84);
      };

      // ---- touch: drag sideways to tilt the screens; a still tap is a turn --
      const tiltY = gsap.quickTo(stage, "rotationY", { duration: 0.5, ease: "power3.out" });
      const tiltX = gsap.quickTo(stage, "rotationX", { duration: 0.5, ease: "power3.out" });
      let origin: { x: number; y: number; id: number } | null = null;
      let moved = false;
      const down = (e: PointerEvent) => {
        origin = { x: e.clientX, y: e.clientY, id: e.pointerId };
        moved = false;
      };
      const move = (e: PointerEvent) => {
        if (!origin || e.pointerId !== origin.id) return;
        const dx = e.clientX - origin.x;
        const dy = e.clientY - origin.y;
        if (Math.hypot(dx, dy) > 8) moved = true;
        tiltY(gsap.utils.clamp(-1, 1, dx / 160) * 14);
        tiltX(gsap.utils.clamp(-1, 1, dy / 220) * -7);
      };
      const settle = () => {
        origin = null;
        gsap.to(stage, { rotationY: 0, rotationX: 0, duration: 1.3, ease: "elastic.out(1, 0.45)", overwrite: true });
      };
      const up = (e: PointerEvent) => {
        if (!origin || e.pointerId !== origin.id) return;
        if (!moved && el.dataset.intro === "done") takeTurn(e);
        settle();
      };
      stage.addEventListener("pointerdown", down);
      stage.addEventListener("pointermove", move);
      stage.addEventListener("pointerup", up);
      stage.addEventListener("pointercancel", settle);
      stage.addEventListener("pointerleave", settle);

      gsap.set(newRow, { height: 0, opacity: 0 });
      gsap.set([".demo-hint", ".demo-nudge", plus, mail], { autoAlpha: 0 });
      // Hidden behind the dashboard until the numbers first move.
      let bearUp = false;
      gsap.set(".demo-bear", { yPercent: 70, opacity: 0 });

      // ---- the aurora never quite holds still ------------------------------
      const loops: gsap.core.Tween[] = [];
      gsap.utils.toArray<HTMLElement>(".hero__aurora i", el).forEach((band, i) => {
        loops.push(gsap.to(band, {
          xPercent: i % 2 ? -14 : 12,
          skewX: i % 2 ? 8 : -10,
          scaleY: 1.18,
          opacity: 0.85 + i * 0.05,
          duration: 7 + i * 2.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 2 + i * 0.6,
        }));
      });

      // ---- the screens float, each on its own rhythm ------------------------
      gsap.utils.toArray<HTMLElement>(".demo-card", stage).forEach((card, i) => {
        loops.push(gsap.to(card, { y: -5 - i * 2, duration: 3.2 + i * 0.6, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2 + i * 0.3 }));
      });

      // ---- scrolling away: the screens drift apart, like a camera pulling back
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.5 },
      })
        .to(".demo-phone", { xPercent: -14, rotationZ: -4 }, 0)
        .to(".demo-leads", { xPercent: 10, yPercent: -12, rotationZ: 3 }, 0)
        .to(".demo-dash", { yPercent: 22 }, 0)
        .to(".hero__aurora", { yPercent: 12, opacity: 0.4 }, 0);

      // ---- the clock on the leads board is the visitor's own ----------------
      const clock = $(".demo-clock");
      const tick = () => {
        const now = new Date();
        clock.textContent = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
        clock.setAttribute("datetime", now.toISOString());
      };
      tick();
      const clockTimer = window.setInterval(tick, 30_000);

      // ---- pause: one control holds everything that moves on its own --------
      let held = false;
      let inView = true;
      const pauseBtn = el.querySelector<HTMLButtonElement>(".demo-pause");
      const resume = () => {
        if (held || !inView || document.hidden || el.dataset.intro !== "done") return;
        story.play();
      };
      const onPause = () => {
        held = !held;
        pauseBtn?.setAttribute("aria-pressed", String(held));
        pauseBtn?.setAttribute("aria-label", held ? "Play the animation" : "Pause the animation");
        pauseBtn?.classList.toggle("is-held", held);
        loops.forEach((t) => (held ? t.pause() : t.resume()));
        window.dispatchEvent(new CustomEvent("arctos:hero-hold", { detail: held }));
        if (held) story.pause();
        else resume();
      };
      pauseBtn?.addEventListener("click", onPause);

      // ---- a background tab costs nothing ------------------------------------
      const onVisibility = () => (document.hidden ? story.pause() : resume());
      document.addEventListener("visibilitychange", onVisibility);

      // iOS fires resize as the address bar shows and hides while scrolling;
      // only a real width change moves the screens.
      let lastWidth = stage.clientWidth;
      const onResize = () => {
        if (Math.abs(stage.clientWidth - lastWidth) < 2) return;
        lastWidth = stage.clientWidth;
        drawRoutes();
        story.invalidate();
      };
      window.addEventListener("resize", onResize);

      ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          inView = self.isActive;
          if (el.dataset.intro !== "done") return;
          if (self.isActive) resume();
          else story.pause();
        },
      });

      return () => {
        window.clearInterval(clockTimer);
        pauseBtn?.removeEventListener("click", onPause);
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("resize", onResize);
        stage.removeEventListener("pointerdown", down);
        stage.removeEventListener("pointermove", move);
        stage.removeEventListener("pointerup", up);
        stage.removeEventListener("pointercancel", settle);
        stage.removeEventListener("pointerleave", settle);
      };
    };

    const mm = gsap.matchMedia(el);
    mm.add("(max-width: 900px)", () => setupDemo());
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
                <span className="hero__eyebrow-in">Calgary marketing &amp; software agency</span>
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

              {/* Phones: the plain-English answer to "what do they do?", right under the line. */}
              <p className="hero__sub">
                Websites, custom software and automation that bring in customers and cut the busywork.
              </p>

              {/* Phones and tablets: what Arctos builds, shown working. */}
              <SystemDemo />

              <p className="lead hero__lead">
                Arctos Launchpad is a Calgary agency. We design and build websites, custom
                software, marketing campaigns and automation so your business can win
                customers, run the work and see the numbers.
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
                          <span>{island.offer}</span>
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
