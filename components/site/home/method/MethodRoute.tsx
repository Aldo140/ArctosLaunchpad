"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { processDetails } from "@/lib/content";
import { MethodBridge } from "./MethodBridge";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, MotionPathPlugin);

const PIN = "(min-width: 1024px) and (pointer: fine)";
const MOTION = "(prefers-reduced-motion: no-preference)";
/** Timeline length: one unit per stop, plus a short hold on the finished bridge. */
const SPAN = processDetails.length + 0.45;
const HOLD = 0.62;

/**
 * The six stops as the six planks of a bridge.
 *
 * Wide screens with a fine pointer: the stage pins and each stop takes a turn
 * in front. Its plank drops onto the deck, the rust signal runs to the end of
 * it, a pier goes in, and the stop's card rises with what it produces.
 * Everywhere else: a vertical route that draws down the page and lights each
 * stop as the line reaches it. Reduced motion: everything lit and still.
 */
export function MethodRoute() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();

    mm.add({ pin: PIN, motion: MOTION }, (context) => {
      const { pin, motion } = context.conditions as { pin: boolean; motion: boolean };
      if (!motion) return;
      if (pin) return pinned(el);
      return scrubbed(el);
    });

    return () => mm.revert();
  }, []);

  const last = processDetails.length;

  return (
    <div ref={root} className="mroute">
      <div className="mroute__stage">
        <div className="mroute__counter" aria-hidden="true">
          <span className="mroute__digits">
            <span className="mroute__track">
              {processDetails.map((step) => (
                <span key={step.id}>{step.index}</span>
              ))}
            </span>
          </span>
          <span className="mroute__of">/ {String(last).padStart(2, "0")}</span>
        </div>

        <ol className="mroute__stops">
          {processDetails.map((step, i) => {
            const next = processDetails[i + 1];
            return (
              <li key={step.id} className="mstop" style={{ "--i": i } as CSSProperties}>
                <span className="mstop__plank" aria-hidden="true" />
                <span className="mstop__num" aria-hidden="true">
                  <span>{step.index}</span>
                </span>
                <div className="mstop__card">
                  <p className="mstop__kicker">
                    Stop {step.index} <span>of {String(last).padStart(2, "0")}</span>
                  </p>
                  <h3 className="mstop__title">{step.title}</h3>
                  <p className="mstop__summary">{step.summary}</p>
                  <div className="mstop__cols">
                    <p className="mstop__detail">{step.detail}</p>
                    <div className="mstop__out">
                      <p className="mstop__label">What it produces</p>
                      <ul className="mstop__deliv">
                        {step.deliverables.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="mstop__next">
                    {next ? (
                      <>
                        Feeds <span aria-hidden="true">→</span> {next.index} {next.title}
                      </>
                    ) : (
                      <>
                        Loops back <span aria-hidden="true">↺</span> into the next round of improvements
                      </>
                    )}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mroute__dock">
          <div className="mroute__now" aria-hidden="true">
            <span className="mroute__now-label">Building</span>
            <span className="mroute__now-win">
              <span className="mroute__now-track">
                {processDetails.map((step) => (
                  <span key={step.id}>
                    <b>{step.index}</b> {step.title}
                  </span>
                ))}
              </span>
            </span>
            <span className="mroute__now-of">of {String(last).padStart(2, "0")}</span>
          </div>
          <MethodBridge />
        </div>
      </div>
    </div>
  );
}


/* ---- The bridge build, shared by both choreographies -------------------- */

type BridgeParts = {
  planks: SVGGElement[];
  shadows: SVGElement[];
  ripples: SVGElement[];
  piers: SVGElement[];
  signal: SVGGElement;
  deck: SVGPathElement;
};

function bridgeParts(el: HTMLElement): BridgeParts | null {
  const all = <T extends Element>(sel: string) => Array.from(el.querySelectorAll<T>(sel));
  const signal = el.querySelector<SVGGElement>(".mb__signal");
  const deck = el.querySelector<SVGPathElement>(".mb__deck");
  if (!signal || !deck) return null;
  return {
    planks: all<SVGGElement>(".mb__plank"),
    shadows: all<SVGElement>(".mb__shadow"),
    ripples: all<SVGElement>(".mb__ripple"),
    piers: all<SVGElement>(".mb__pier"),
    signal,
    deck,
  };
}

/** Take the bridge apart: only the dashed plan remains. */
function unbuild(b: BridgeParts) {
  gsap.set(b.planks, { y: -150, opacity: 0, rotation: (i) => (i % 2 ? 9 : -9), transformOrigin: "50% 50%" });
  gsap.set(b.shadows, { opacity: 0, scaleX: 0.35, transformOrigin: "50% 50%" });
  gsap.set(b.ripples, { opacity: 0, scale: 0.3, transformOrigin: "50% 50%" });
  gsap.set(b.piers, { drawSVG: "0% 0%" });
  gsap.set(b.deck, { drawSVG: "0% 0%" });
  gsap.set(b.signal, { motionPath: { path: b.deck, align: b.deck, alignOrigin: [0.5, 0.5], start: 0, end: 0 } });
}

/** Stop i at time t: plank drops, shadow firms, ripple, signal runs, pier goes in. */
function buildStep(tl: gsap.core.Timeline, b: BridgeParts, i: number, t: number) {
  const n = b.planks.length;
  tl.to(b.planks[i], { y: 0, opacity: 1, rotation: 0, duration: 0.5, ease: "back.out(1.5)" }, t + 0.06);
  tl.to(b.shadows[i], { opacity: 1, scaleX: 1, duration: 0.5 }, t + 0.06);
  tl.fromTo(
    b.ripples[i],
    { opacity: 0.9, scale: 0.3 },
    { opacity: 0, scale: 1.7, duration: 0.45, ease: "power1.out", immediateRender: false },
    t + 0.46,
  );
  tl.to(b.deck, { drawSVG: `0% ${((i + 1) / n) * 100}%`, duration: 0.5, ease: "power1.inOut" }, t + 0.16);
  tl.to(
    b.signal,
    {
      motionPath: { path: b.deck, align: b.deck, alignOrigin: [0.5, 0.5], start: i / n, end: (i + 1) / n },
      duration: 0.5,
      ease: "power1.inOut",
    },
    t + 0.16,
  );
  if (b.piers[i]) tl.to(b.piers[i], { drawSVG: "0% 100%", duration: 0.3, ease: "power1.in" }, t + 0.42);
}

/* ---- Desktop: pinned build sequence ------------------------------------- */

function pinned(el: HTMLElement) {
  const stage = el.querySelector<HTMLElement>(".mroute__stage");
  const track = el.querySelector<HTMLElement>(".mroute__track");
  const b = bridgeParts(el);
  if (!stage || !track || !b) return;
  el.classList.add("is-pinned");

  const cards = Array.from(el.querySelectorAll<HTMLElement>(".mstop"));
  const labels = Array.from(el.querySelectorAll<HTMLButtonElement>(".mb__stop"));
  const n = cards.length;

  const ctx = gsap.context(() => {
    gsap.set(cards, { autoAlpha: 0, y: 90, rotateX: -18, transformOrigin: "50% 100%" });
    gsap.set(cards[0], { autoAlpha: 1, y: 0, rotateX: 0 });
    unbuild(b);
    cards.slice(1).forEach((card) => gsap.set(card.querySelectorAll(".mstop__deliv li"), { autoAlpha: 0, x: -14 }));

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    for (let i = 0; i < n; i++) {
      const t = i;
      if (i > 0) {
        tl.to(cards[i - 1], { autoAlpha: 0, y: -60, rotateX: 14, scale: 0.96, duration: 0.34, ease: "power2.in" }, t);
        tl.fromTo(
          cards[i],
          { autoAlpha: 0, y: 90, rotateX: -18, scale: 1 },
          { autoAlpha: 1, y: 0, rotateX: 0, duration: 0.5, ease: "power3.out" },
          t + 0.2,
        );
        tl.to(track, { yPercent: (-100 / n) * i, duration: 0.5, ease: "power3.inOut" }, t + 0.08);
        tl.to(cards[i].querySelectorAll(".mstop__deliv li"), { autoAlpha: 1, x: 0, duration: 0.25, stagger: 0.07 }, t + 0.42);
      }
      buildStep(tl, b, i, t);
    }
    tl.to({}, { duration: SPAN - tl.duration() });

    let current = -1;
    const setActive = (idx: number) => {
      if (idx === current) return;
      current = idx;
      labels.forEach((label, i) => {
        label.classList.toggle("is-done", i < idx);
        label.classList.toggle("is-active", i === idx);
        if (i === idx) label.setAttribute("aria-current", "step");
        else label.removeAttribute("aria-current");
      });
      b.planks.forEach((plank, i) => plank.classList.toggle("is-active", i === idx));
      el.style.setProperty("--active", String(idx));
    };
    setActive(0);

    const holds = Array.from({ length: n }, (_, i) => (i + HOLD) / SPAN);
    const st = ScrollTrigger.create({
      trigger: stage,
      start: "top top",
      end: () => `+=${Math.round(window.innerHeight * 0.72 * n)}`,
      pin: true,
      scrub: 0.7,
      animation: tl,
      refreshPriority: -1,
      invalidateOnRefresh: true,
      snap: { snapTo: [0, ...holds, 1], duration: { min: 0.2, max: 0.6 }, delay: 0.12, ease: "power1.inOut" },
      onUpdate: (self) => setActive(Math.min(n - 1, Math.max(0, Math.floor(self.progress * SPAN - 0.1)))),
    });

    const onClick = (e: Event) => {
      const i = labels.indexOf(e.currentTarget as HTMLButtonElement);
      if (i < 0) return;
      const top = st.start + holds[i] * (st.end - st.start);
      window.scrollTo({ top, behavior: "smooth" });
    };
    labels.forEach((label) => label.addEventListener("click", onClick));
    return () => labels.forEach((label) => label.removeEventListener("click", onClick));
  }, el);

  return () => {
    ctx.revert();
    el.classList.remove("is-pinned");
    el.style.removeProperty("--active");
  };
}

/* ---- Touch and narrow: a sticky bridge, built by the cards passing it ---- */

function scrubbed(el: HTMLElement) {
  const list = el.querySelector<HTMLElement>(".mroute__stops");
  const b = bridgeParts(el);
  if (!list || !b) return;
  el.classList.add("is-scrub");
  const stops = Array.from(el.querySelectorAll<HTMLElement>(".mstop"));
  const n = stops.length;

  const ctx = gsap.context(() => {
    unbuild(b);
    const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
    for (let i = 0; i < n; i++) buildStep(tl, b, i, i);

    // Where each stop starts, measured on refresh rather than every frame.
    let listTop = 0;
    let tops: number[] = [];
    let spans: number[] = [];
    const measure = () => {
      const y = window.scrollY;
      listTop = list.getBoundingClientRect().top + y;
      tops = stops.map((s) => s.getBoundingClientRect().top + y - listTop);
      spans = stops.map((s) => Math.max(160, Math.min(s.offsetHeight * 0.55, window.innerHeight * 0.42)));
    };

    let current = -2;
    const update = () => {
      const probe = window.scrollY + window.innerHeight * 0.62 - listTop;
      let idx = -1;
      let time = 0;
      for (let i = 0; i < n; i++) {
        if (probe < tops[i]) break;
        idx = i;
        time = i + Math.min(1, (probe - tops[i]) / spans[i]);
      }
      gsap.to(tl, { time: Math.min(time, tl.duration()), duration: 0.55, ease: "power2.out", overwrite: true });
      list.style.setProperty("--route", String(Math.max(0, Math.min(1, probe / list.offsetHeight))));
      if (idx === current) return;
      current = idx;
      stops.forEach((s, i) => s.classList.toggle("is-lit", i <= idx));
      b.planks.forEach((plank, i) => plank.classList.toggle("is-active", i === idx));
      el.style.setProperty("--active", String(Math.max(0, idx)));
      el.classList.toggle("is-started", idx >= 0);
    };

    ScrollTrigger.create({
      trigger: list,
      start: "top bottom",
      end: "bottom top",
      refreshPriority: -1,
      onRefresh: () => {
        measure();
        update();
      },
      onUpdate: update,
    });
    measure();
    update();

    // Each card recedes a little as it slides up under the bridge.
    stops.forEach((stop) => {
      gsap.to(stop, {
        scale: 0.95,
        opacity: 0.35,
        transformOrigin: "50% 0%",
        ease: "none",
        scrollTrigger: { trigger: stop, start: "bottom 52%", end: "bottom 22%", scrub: true, refreshPriority: -1 },
      });
    });
  }, el);

  return () => {
    ctx.revert();
    el.classList.remove("is-scrub", "is-started");
    el.style.removeProperty("--active");
    list.style.removeProperty("--route");
    stops.forEach((s) => s.classList.remove("is-lit"));
  };
}
