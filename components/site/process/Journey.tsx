"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { processDetails } from "@/lib/content";
import { StopPlan } from "./plans";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

const N = processDetails.length;
const PER = 6; // planks per stop
const STEP = 2; // timeline units per stop
const HOLD = 1.2; // how long a stop holds the stage before handing over
const MOVE = STEP - HOLD;
const TOTAL = (N - 1) * STEP + HOLD + 0.3;
const NOTE_TILT = [-4, 3, -2];
const PINNED_Q =
  "(min-width: 1024px) and (min-height: 660px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const BAND_W = 300; // band bridge width in its viewBox

/* Bridge geometry, viewBox 0 0 1200 120 */
const DECK_X = 60;
const SPAN = 180;
const PLANK = SPAN / PER;
const DECK_Y = 50;

const at = (i: number) => i * STEP;
const v = (o: Record<string, number | string>) => o as CSSProperties;

/**
 * The six stops as a journey. Desktop (wide, fine pointer, motion welcome):
 * the stage pins and each stop takes it in turn — an odometer numeral rolls,
 * the stop's plan, field card and notes arrive at different depths, and the
 * bridge underneath is laid plank by plank with the rust signal at its edge.
 * Everywhere else it is a vertical route that reads top to bottom.
 */
export function Journey() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const go = useRef<(i: number) => void>(() => {});

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Static route: mark stops as seen so their plans draw (CSS), and fill the rail.
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("is-seen")),
      { rootMargin: "0px 0px -18% 0px" },
    );
    el.querySelectorAll(".pj-stop").forEach((s) => io.observe(s));

    const mm = gsap.matchMedia(el);
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (el.classList.contains("is-pinned")) return;
      gsap.fromTo(
        ".pj-rail i",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: ".pj-stops", start: "top 70%", end: "bottom 70%", scrub: 0.4 },
        },
      );
    });

    mm.add(
      PINNED_Q,
      () => {
        el.classList.add("is-pinned");
        const stops = gsap.utils.toArray<HTMLElement>(".pj-stop", el);
        const planks = gsap.utils.toArray<SVGRectElement>(".pj-bridge__plank", el);
        const signal = el.querySelector<SVGGElement>(".pj-bridge__signal")!;
        const tl = gsap.timeline({ defaults: { ease: "none" }, paused: true });
        const intro = gsap.timeline({ paused: true });

        const parts = stops.map((stop) => ({
          num: stop.querySelector(".pj-stop__num-in")!,
          fill: stop.querySelector(".pj-stop__num-fill")!,
          text: Array.from(stop.querySelectorAll(".pj-stop__text > *")),
          plan: stop.querySelector(".pj-plan")!,
          draws: Array.from(stop.querySelectorAll<SVGElement>(".pj-plan .dr")),
          labels: Array.from(stop.querySelectorAll<SVGElement>(".pj-plan .lb, .pj-plan .dsh")),
          card: stop.querySelector(".pj-card")!,
          notes: Array.from(stop.querySelectorAll(".pj-note")),
          tag: stop.querySelector(".pj-notes__label")!,
        }));

        parts.forEach((p, i) => {
          const a = at(i);
          const first = i === 0;
          const inAt = first ? 0 : a - MOVE;
          const ease = "power3.out";
          // Arrive (the first stop is already on stage)
          if (!first) {
            tl.fromTo(p.num, { yPercent: 135 }, { yPercent: 0, duration: MOVE, ease }, inAt);
            p.text.forEach((t, k) =>
              tl.fromTo(t, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: MOVE * 0.9, ease }, inAt + 0.05 + k * 0.06),
            );
            tl.fromTo(p.tag, { opacity: 0 }, { opacity: 1, duration: MOVE * 0.6 }, inAt + 0.2);
            tl.fromTo(p.plan, { y: 140, z: 0, rotation: 5, opacity: 0 }, { y: 0, z: 0, rotation: -1.5, opacity: 1, duration: MOVE, ease }, inAt);
            tl.fromTo(p.card, { y: 240, z: 50, rotation: -7, opacity: 0 }, { y: 0, z: 50, rotation: 1.5, opacity: 1, duration: MOVE, ease }, inAt + 0.08);
            p.notes.forEach((n, k) =>
              tl.fromTo(
                n,
                { y: 340, rotation: NOTE_TILT[k] * 4, opacity: 0 },
                { y: 0, rotation: NOTE_TILT[k], opacity: 1, duration: MOVE, ease },
                inAt + 0.14 + k * 0.06,
              ),
            );
          } else {
            tl.set(p.plan, { z: 0, rotation: -1.5 }, 0);
            tl.set(p.card, { z: 50, rotation: 1.5 }, 0);
            p.notes.forEach((n, k) => tl.set(n, { rotation: NOTE_TILT[k] }, 0));
          }
          // The plan drafts itself while the stop is on stage (the first one as the stage arrives)
          const host = first ? intro : tl;
          p.draws.forEach((d) => {
            const s = Number(getComputedStyle(d).getPropertyValue("--s")) || 0;
            host.fromTo(d, { drawSVG: "0%" }, { drawSVG: "100%", duration: first ? 0.7 : 0.32, ease: first ? "power2.out" : "none" }, first ? s * 0.09 : inAt + 0.1 + s * 0.055);
          });
          p.labels.forEach((l) => {
            const s = Number(getComputedStyle(l).getPropertyValue("--s")) || 0;
            host.fromTo(l, { opacity: 0 }, { opacity: 1, duration: first ? 0.5 : 0.2 }, first ? 0.15 + s * 0.09 : inAt + 0.2 + s * 0.055);
          });
          // The numeral fills while you stay at the stop
          tl.fromTo(p.fill, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: HOLD + (first ? 0 : MOVE * 0.5) }, first ? 0 : a - MOVE * 0.5);
          // Planks for this stop, one per tween (scrub-safe)
          for (let k = 0; k < PER; k++) {
            const plank = planks[i * PER + k];
            const t = (first ? 0 : a - MOVE * 0.4) + (k / PER) * (HOLD + MOVE * 0.2);
            tl.fromTo(plank, { y: -26, rotation: -14, opacity: 0, transformOrigin: "50% 100%" }, { y: 0, rotation: 0, opacity: 1, duration: 0.22, ease: "back.out(2)" }, t);
          }
          tl.fromTo(
            signal,
            { x: DECK_X + i * SPAN },
            { x: DECK_X + (i + 1) * SPAN, duration: HOLD + MOVE * 0.4, immediateRender: first },
            first ? 0 : a - MOVE * 0.4,
          );
          // Leave
          if (i < N - 1) {
            const out = a + HOLD;
            tl.fromTo(p.num, { yPercent: 0 }, { yPercent: -135, duration: MOVE, ease: "power2.in", immediateRender: false }, out);
            p.text.forEach((t, k) =>
              tl.fromTo(t, { y: 0, opacity: 1 }, { y: -50, opacity: 0, duration: MOVE * 0.7, ease: "power2.in", immediateRender: false }, out + k * 0.04),
            );
            tl.fromTo(p.tag, { opacity: 1 }, { opacity: 0, duration: MOVE * 0.4, immediateRender: false }, out);
            tl.fromTo(p.plan, { y: 0, opacity: 1 }, { y: -90, opacity: 0, duration: MOVE * 0.8, ease: "power2.in", immediateRender: false }, out);
            tl.fromTo(p.card, { y: 0, opacity: 1 }, { y: -160, opacity: 0, duration: MOVE * 0.8, ease: "power2.in", immediateRender: false }, out);
            p.notes.forEach((n, k) =>
              tl.fromTo(
                n,
                { y: 0, opacity: 1, rotation: NOTE_TILT[k] },
                { y: -260, opacity: 0, rotation: NOTE_TILT[k] * -3, duration: MOVE * 0.8, ease: "power2.in", immediateRender: false },
                out + k * 0.03,
              ),
            );
          }
        });
        tl.to({}, { duration: 0.01 }, TOTAL);

        const st = ScrollTrigger.create({
          trigger: el.querySelector(".pj-stage")!,
          start: "top top",
          end: () => `+=${window.innerHeight * 5.2}`,
          pin: true,
          scrub: 0.7,
          animation: tl,
          invalidateOnRefresh: true,
          snap: {
            snapTo: Array.from({ length: N }, (_, i) => (at(i) + HOLD * 0.5) / TOTAL),
            duration: { min: 0.25, max: 0.7 },
            delay: 0.15,
            ease: "power2.inOut",
            inertia: false,
          },
        });

        ScrollTrigger.create({ trigger: el.querySelector(".pj-stage")!, start: "top 65%", once: true, onEnter: () => intro.play() });
        tl.eventCallback("onUpdate", () => {
          const t = tl.time();
          const i = Math.max(0, Math.min(N - 1, Math.floor((t - (HOLD + MOVE / 2)) / STEP) + 1));
          setActive((prev) => (prev === i ? prev : i));
        });

        go.current = (i: number) => {
          const y = st.start + ((at(i) + HOLD * 0.5) / TOTAL) * (st.end - st.start);
          window.scrollTo({ top: Math.round(y), behavior: "auto" });
        };

        // Hero stakes link to #stop ids; inside a pinned stage, translate them to scroll positions.
        const onClick = (e: MouseEvent) => {
          const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href^='#']");
          if (!a) return;
          const i = processDetails.findIndex((s) => `#${s.id}` === a.getAttribute("href"));
          if (i < 0) return;
          e.preventDefault();
          go.current(i);
          history.replaceState(null, "", a.getAttribute("href"));
        };
        document.addEventListener("click", onClick);

        // Pointer depth: the desk tilts toward the cursor.
        const stage = el.querySelector<HTMLElement>(".pj-stage")!;
        const rx = gsap.quickTo(stage, "--rx", { duration: 0.8, ease: "power3.out" });
        const ry = gsap.quickTo(stage, "--ry", { duration: 0.8, ease: "power3.out" });
        const onMove = (e: PointerEvent) => {
          const r = stage.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 7);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 5);
        };
        stage.addEventListener("pointermove", onMove);

        return () => {
          el.classList.remove("is-pinned");
          document.removeEventListener("click", onClick);
          stage.removeEventListener("pointermove", onMove);
          go.current = () => {};
          setActive(0);
        };
      },
    );


    // Touch / narrow: no pin. Each stop's desk assembles as it scrolls through,
    // and a sticky band above the stops lays the bridge plank by plank.
    mm.add(
      {
        pinned: PINNED_Q,
        reduce: "(prefers-reduced-motion: reduce)",
        any: "all",
      },
      (mctx) => {
        const { pinned, reduce: rm } = mctx.conditions as { pinned: boolean; reduce: boolean };
        if (pinned || rm) return;
        el.classList.add("is-touch");
        const stops = gsap.utils.toArray<HTMLElement>(".pj-stop", el);
        const bandPlanks = gsap.utils.toArray<SVGRectElement>(".pj-band__plank", el);
        const bandSignal = el.querySelector<SVGGElement>(".pj-band__signal")!;
        const nowI = el.querySelector<HTMLElement>(".pj-band__i")!;
        const nowT = el.querySelector<HTMLElement>(".pj-band__t")!;

        // The band's bridge: one tween per plank, scrubbed over the whole route.
        const band = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: ".pj-stops", start: "top 70%", end: "bottom 75%", scrub: 0.5 },
        });
        bandPlanks.forEach((pl, k) => {
          band.fromTo(pl, { opacity: 0.12, y: -6 }, { opacity: 1, y: 0, duration: 0.6, ease: "back.out(2)" }, k);
        });
        band.fromTo(bandSignal, { x: 0 }, { x: BAND_W, duration: bandPlanks.length }, 0);

        stops.forEach((stop, i) => {
          const step = processDetails[i];
          ScrollTrigger.create({
            trigger: stop,
            start: "top 55%",
            end: "bottom 55%",
            onToggle: (self) => {
              if (!self.isActive) return;
              nowI.textContent = step.index;
              nowT.textContent = step.title;
            },
          });

          const numIn = stop.querySelector(".pj-stop__num-in")!;
          const fill = stop.querySelector(".pj-stop__num-fill")!;
          const lead = stop.querySelector(".pj-stop__lead")!;
          gsap.fromTo(numIn, { yPercent: 70, rotation: 4 }, {
            yPercent: 0, rotation: 0, ease: "power2.out",
            scrollTrigger: { trigger: lead, start: "top 95%", end: "top 55%", scrub: 0.5 },
          });
          gsap.fromTo(fill, { clipPath: "inset(100% 0 0 0)" }, {
            clipPath: "inset(0% 0 0 0)", ease: "none",
            scrollTrigger: { trigger: lead, start: "top 75%", end: "bottom 45%", scrub: 0.5 },
          });

          const desk = stop.querySelector(".pj-desk")!;
          const plan = desk.querySelector(".pj-plan")!;
          const card = desk.querySelector(".pj-card")!;
          const tag = desk.querySelector(".pj-notes__label")!;
          const notes = Array.from(desk.querySelectorAll(".pj-note"));
          const tl = gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: { trigger: desk, start: "top 92%", end: "bottom 70%", scrub: 0.6 },
          });
          tl.fromTo(plan, { y: 90, rotation: 5, scale: 0.9, opacity: 0.15 }, { y: 0, rotation: -1.5, scale: 1, opacity: 1, duration: 1 }, 0);
          desk.querySelectorAll<SVGElement>(".pj-plan .dr").forEach((d) => {
            const s = Number(getComputedStyle(d).getPropertyValue("--s")) || 0;
            tl.fromTo(d, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.5, ease: "none" }, 0.35 + s * 0.09);
          });
          desk.querySelectorAll<SVGElement>(".pj-plan .lb, .pj-plan .dsh").forEach((l) => {
            const s = Number(getComputedStyle(l).getPropertyValue("--s")) || 0;
            tl.fromTo(l, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.45 + s * 0.09);
          });
          tl.fromTo(card, { x: -140, rotation: -9, opacity: 0 }, { x: 0, rotation: 1.5, opacity: 1, duration: 0.9 }, 1.1);
          tl.fromTo(tag, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 1.7);
          notes.forEach((n, k) => {
            const r = NOTE_TILT[k] ?? 0;
            tl.fromTo(
              n,
              { y: -90, x: 30, rotation: r * 6, scale: 1.25, opacity: 0 },
              { y: 0, x: 0, rotation: r, scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.6)" },
              1.8 + k * 0.35,
            );
          });
        });

        return () => el.classList.remove("is-touch");
      },
    );

    if (reduce) el.querySelectorAll(".pj-stop").forEach((s) => s.classList.add("is-seen"));

    return () => {
      io.disconnect();
      mm.revert();
    };
  }, []);

  return (
    <div ref={root} className="pj">
      <div className="pj-stage" style={v({ "--rx": 0, "--ry": 0 })}>
        <span className="pj-rail" aria-hidden="true">
          <i />
        </span>
        <div className="pj-band" aria-hidden="true">
          <p className="pj-band__now">
            <span className="pj-band__i">01</span>
            <span className="pj-band__t">Discover</span>
          </p>
          <svg viewBox={`-8 0 ${BAND_W + 16} 26`} focusable="false">
            <rect className="pj-band__plan" x="0" y="13" width={BAND_W} height="7" />
            {Array.from({ length: N * PER }, (_, k) => (
              <rect
                key={k}
                className="pj-band__plank"
                x={(k * BAND_W) / (N * PER) + 0.6}
                y="13"
                width={BAND_W / (N * PER) - 1.2}
                height="7"
                rx="1"
              />
            ))}
            {Array.from({ length: N + 1 }, (_, k) => (
              <line key={k} className="pj-band__pier" x1={(k * BAND_W) / N} x2={(k * BAND_W) / N} y1="20" y2="26" />
            ))}
            <g className="pj-band__signal">
              <circle cy="7" r="6" className="pj-band__halo" />
              <circle cy="7" r="3" />
            </g>
          </svg>
        </div>
        <ol className="pj-stops">
          {processDetails.map((step, i) => (
            <li key={step.id} id={step.id} className="pj-stop" style={v({ "--i": i })}>
              <div className="pj-stop__lead">
                <div className="pj-stop__num" aria-hidden="true">
                  <span className="pj-stop__num-in">
                    <span className="pj-stop__num-line">{step.index}</span>
                    <span className="pj-stop__num-fill">{step.index}</span>
                  </span>
                </div>
                <div className="pj-stop__text">
                  <p className="pj-stop__index">
                    Stop {step.index} <span aria-hidden="true">/</span> 06
                  </p>
                  <h3 className="pj-stop__title">{step.title}</h3>
                  <p className="pj-stop__summary">{step.summary}</p>
                </div>
                <span className="pj-stop__planks" aria-hidden="true">
                  {Array.from({ length: N }, (_, k) => (
                    <i key={k} className={k < i ? "is-built" : k === i ? "is-built is-here" : ""} style={v({ "--k": k })} />
                  ))}
                </span>
              </div>
              <div className="pj-desk">
                <StopPlan id={step.id} index={step.index} />
                <div className="pj-card">
                  <p className="pj-card__label">Field note</p>
                  <p className="pj-card__body">{step.detail}</p>
                </div>
                <div className="pj-notes">
                  <p className="pj-notes__label">You leave with</p>
                  <ul>
                    {step.deliverables.map((item, k) => (
                      <li key={item} className="pj-note" style={v({ "--r": `${NOTE_TILT[k] ?? 0}deg`, "--k": k })}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="pj-bridge">
          <svg viewBox="0 0 1200 120" aria-hidden="true" focusable="false">
            <path className="pj-bridge__bank" d="M0,50 H60 V64 L44,98 L18,110 L0,104 Z" />
            <path className="pj-bridge__bank" d="M1200,50 H1140 V64 L1156,98 L1182,110 L1200,104 Z" />
            <rect className="pj-bridge__plan" x={DECK_X} y={DECK_Y} width={SPAN * N} height="14" />
            {Array.from({ length: N }, (_, i) => (
              <path
                key={i}
                className="pj-bridge__arch"
                d={`M${DECK_X + i * SPAN},64 C${DECK_X + i * SPAN + 40},112 ${DECK_X + (i + 1) * SPAN - 40},112 ${DECK_X + (i + 1) * SPAN},64`}
              />
            ))}
            {Array.from({ length: N * PER }, (_, k) => (
              <rect
                key={k}
                className="pj-bridge__plank"
                x={DECK_X + k * PLANK + 1}
                y={DECK_Y}
                width={PLANK - 2}
                height="14"
                rx="1.5"
              />
            ))}
            <g className="pj-bridge__signal" transform={`translate(${DECK_X} 0)`}>
              <circle cy={DECK_Y - 12} r="13" className="pj-bridge__halo" />
              <circle cy={DECK_Y - 12} r="5.5" />
            </g>
          </svg>
          <ol className="pj-bridge__nav" aria-label="Jump to a stop">
            {processDetails.map((step, i) => (
              <li key={step.id} style={v({ "--x": `${((DECK_X + (i + 0.5) * SPAN) / 1200) * 100}%` })}>
                <button
                  type="button"
                  className={i === active ? "is-active" : i < active ? "is-done" : ""}
                  aria-current={i === active ? "step" : undefined}
                  onClick={() => go.current(i)}
                >
                  <span>{step.index}</span> {step.title}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
