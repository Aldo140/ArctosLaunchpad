"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { gsap } from "gsap";
import { ContactForm, islandFor, type ContactStatus, type IslandKey } from "@/components/ContactForm";

/** Deck of the bridge in bridge-900.webp coordinates (900 × 600). */
const DECK =
  "M58 372 C 120 352, 196 300, 262 280 L 410 272 L 430 304 L 532 300 L 548 286 L 700 290 C 752 322, 792 366, 838 394";

const ISLANDS: { id: IslandKey; name: string; index: string }[] = [
  { id: "win", name: "Win the customer", index: "01" },
  { id: "run", name: "Run the work", index: "02" },
  { id: "see", name: "See the numbers", index: "03" },
];

const signalTarget = (filled: number, status: ContactStatus) =>
  status === "success" ? 1 : status === "sending" ? 0.92 : (filled / 3) * 0.86;
const signalState = (filled: number, status: ContactStatus) =>
  status === "success" ? "delivered" : status === "sending" ? "sending" : filled === 3 ? "ready" : "open";
const signalCaption = (filled: number, state: string) =>
  state === "delivered"
    ? "Delivered to Arctos"
    : state === "sending"
      ? "Crossing the bridge…"
      : state === "ready"
        ? "Ready to cross"
        : `Signal ${filled} of 3`;

/**
 * Phones and tablets: the map scrolls away while you fill the form, so a
 * compact rail rides along at the top of the card and mirrors it.
 */
function SignalStrip({ island, filled, status }: { island: IslandKey | null; filled: number; status: ContactStatus }) {
  const state = signalState(filled, status);
  const p = signalTarget(filled, status);
  return (
    <div className="strip" data-island={island ?? "none"} data-state={state} aria-hidden="true" style={{ "--p": p } as CSSProperties}>
      <div className="strip__rail">
        <i className="strip__fill" />
        {ISLANDS.map((isle) => (
          <span key={isle.id} className={`strip__node${island === isle.id ? " is-on" : ""}`} data-node={isle.id}>
            <b />
            <em>{isle.name.replace("Win the customer", "Win").replace("Run the work", "Run").replace("See the numbers", "See")}</em>
          </span>
        ))}
        <i className="strip__dot" />
      </div>
      <span className="strip__cap mono">{signalCaption(filled, state)}</span>
    </div>
  );
}

/**
 * The bridge as the form's mirror: choosing what you need lights that island,
 * every required detail moves the signal further across the deck, and sending
 * carries it to the far side.
 */
function BridgeMap({ island, filled, status }: { island: IslandKey | null; filled: number; status: ContactStatus }) {
  const signal = useRef<SVGPathElement>(null);
  const dot = useRef<SVGGElement>(null);
  const proxy = useRef({ p: 0 });

  const target = signalTarget(filled, status);

  useEffect(() => {
    const path = signal.current;
    const mark = dot.current;
    if (!path || !mark) return;
    const len = path.getTotalLength();
    const draw = () => {
      const p = proxy.current.p;
      path.style.strokeDashoffset = String(1 - p);
      const pt = path.getPointAtLength(len * p);
      mark.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      proxy.current.p = target;
      draw();
      return;
    }
    const tween = gsap.to(proxy.current, {
      p: target,
      duration: status === "success" ? 1.6 : 0.9,
      ease: status === "success" ? "power2.inOut" : "power3.out",
      onUpdate: draw,
    });
    draw();
    return () => {
      tween.kill();
    };
  }, [target, status]);

  const state = signalState(filled, status);
  const caption = signalCaption(filled, state);

  return (
    <figure className="bmap" data-island={island ?? "none"} data-state={state} aria-hidden="true">
      <div className="bmap__art">
        <Image className="bmap__base" src="/assets/art/bridge-900.webp" alt="" width={900} height={600} sizes="(max-width: 960px) 92vw, 620px" priority />
        <Image className="bmap__lit" src="/assets/art/bridge-900.webp" alt="" width={900} height={600} sizes="(max-width: 960px) 92vw, 620px" priority />
        <svg className="bmap__svg" viewBox="0 0 900 600" fill="none">
          <path className="bmap__track" d={DECK} pathLength={1} />
          <path ref={signal} className="bmap__signal" d={DECK} pathLength={1} />
          <g className="bmap__rings">
            <ellipse data-ring="win" cx="112" cy="380" rx="112" ry="34" />
            <ellipse data-ring="run" cx="482" cy="432" rx="132" ry="36" />
            <ellipse data-ring="see" cx="804" cy="402" rx="94" ry="30" />
          </g>
          <g ref={dot} className="bmap__dot" transform="translate(58 372)">
            <circle r="18" className="bmap__halo" />
            <circle r="7" />
          </g>
        </svg>
        <span className="bmap__stamp mono">Delivered</span>
      </div>
      <ul className="bmap__tags">
        {ISLANDS.map((isle) => (
          <li key={isle.id} data-tag={isle.id} className={island === isle.id ? "is-on" : undefined}>
            <span className="bmap__idx">{isle.index}</span>
            {isle.name}
          </li>
        ))}
      </ul>
      <figcaption className="bmap__cap mono">
        <span className="bmap__led" />
        {caption}
      </figcaption>
    </figure>
  );
}

export function ContactExperience({ head, foot }: { head: ReactNode; foot: ReactNode }) {
  const [island, setIsland] = useState<IslandKey | null>(null);
  const [filled, setFilled] = useState(0);
  const [status, setStatus] = useState<ContactStatus>("idle");
  const grid = useRef<HTMLDivElement>(null);

  // Phones and tablets: depth from the scroll, not the pointer. The art eases
  // back as the paper card slides up over it, settling from a tilt.
  useEffect(() => {
    const root = grid.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(max-width: 960px)", () => {
      const art = root.querySelector(".bmap__art");
      const card = root.querySelector(".cx__card");
      gsap.fromTo(art, { scale: 1.08, y: 0 }, {
        scale: 0.92, y: -36, ease: "none",
        scrollTrigger: { trigger: art, start: "top 70%", end: "bottom top", scrub: true },
      });
      gsap.fromTo(card, { y: 64, rotateX: 9, transformPerspective: 1200, transformOrigin: "50% 0%" }, {
        y: 0, rotateX: 0, ease: "none",
        scrollTrigger: { trigger: card, start: "top bottom", end: "top 35%", scrub: 0.4 },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <div ref={grid} className="wrap cx__grid" data-status={status}>
      <div className="cx__head">{head}</div>
      <div className="cx__map">
        <BridgeMap island={island} filled={filled} status={status} />
      </div>
      <div className="cx__card tone-bone">
        <SignalStrip island={island} filled={filled} status={status} />
        <div className="cx__sheet">
          <ContactForm
            onTypeChange={(t) => setIsland(islandFor(t))}
            onProgress={setFilled}
            onStatusChange={(s) => {
              setStatus(s);
              if (s === "idle" && status === "success") setFilled(0);
            }}
          />
        </div>
      </div>
      <div className="cx__foot">{foot}</div>
    </div>
  );
}
