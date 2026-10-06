"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { processDetails } from "@/lib/content";

gsap.registerPlugin(Flip);

type Weight = "light" | "steady" | "heavy";
const GROW: Record<Weight, number> = { light: 1, steady: 1.7, heavy: 2.8 };
const RISE: Record<Weight, number> = { light: 0.38, steady: 0.64, heavy: 1 };

/** Illustrative emphasis drawn from each description — qualitative, not a schedule. */
const SHAPES: { id: string; term: string; def: string; weights: Weight[]; lead: number }[] = [
  {
    id: "website",
    term: "A website",
    def: "Discovery is usually the shortest stop. Most of the effort goes into content, design and the path from a first visit to an enquiry.",
    weights: ["light", "steady", "heavy", "heavy", "steady", "steady"],
    lead: 2,
  },
  {
    id: "automation",
    term: "Automation or integrations",
    def: "Starts with a workflow map of how the work moves today. We change what is there before replacing anything.",
    weights: ["steady", "heavy", "steady", "steady", "steady", "steady"],
    lead: 1,
  },
  {
    id: "software",
    term: "Custom software",
    def: "Ships as a first release that proves the core workflow, then grows from real use rather than a long wishlist.",
    weights: ["steady", "steady", "steady", "heavy", "steady", "heavy"],
    lead: 3,
  },
  {
    id: "reporting",
    term: "Reporting",
    def: "Starts from the decisions the report should support, not the exports it happens to be built from.",
    weights: ["heavy", "steady", "heavy", "steady", "light", "steady"],
    lead: 0,
  },
];

/**
 * "Same route, different shapes": pick a kind of project and the six spans of
 * the bridge re-weight. The marker that says where the weight sits moves with
 * Flip to its new span.
 */
export function Shapes() {
  const [sel, setSel] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const flip = useRef<Flip.FlipState | null>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const choose = (i: number) => {
    if (i === sel) return;
    const el = root.current;
    if (el && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      flip.current = Flip.getState(el.querySelectorAll(".pjs-span, .pjs-lead"));
    }
    setSel(i);
  };

  useLayoutEffect(() => {
    const state = flip.current;
    if (!state) return;
    flip.current = null;
    Flip.from(state, {
      duration: 0.9,
      ease: "power3.inOut",
      scale: false,
      nested: true,
      targets: root.current!.querySelectorAll(".pjs-span, .pjs-lead"),
    });
  }, [sel]);

  // The spans rise into place the first time the diagram is seen.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("is-seen");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    io.observe(el.querySelector(".pjs__spans")!);
    return () => io.disconnect();
  }, []);

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const n = SHAPES.length;
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (sel + 1) % n;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (sel - 1 + n) % n;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    choose(next);
    tabs.current[next]?.focus();
  };

  const shape = SHAPES[sel];

  return (
    <div className="pjs" ref={root}>
      <div className="pjs__tabs" role="tablist" aria-label="Kind of project">
        {SHAPES.map((s, i) => (
          <button
            key={s.id}
            ref={(b) => {
              tabs.current[i] = b;
            }}
            type="button"
            role="tab"
            id={`pjs-tab-${s.id}`}
            aria-selected={i === sel}
            aria-controls="pjs-panel"
            tabIndex={i === sel ? 0 : -1}
            onClick={() => choose(i)}
            onKeyDown={onKey}
            className="pjs__tab"
          >
            <span className="pjs__tab-i" aria-hidden="true">
              {String.fromCharCode(65 + i)}
            </span>
            {s.term}
          </button>
        ))}
      </div>

      <div className="pjs__panel" role="tabpanel" id="pjs-panel" aria-labelledby={`pjs-tab-${shape.id}`}>
        <p className="pjs__def" key={shape.id}>
          {shape.def}
        </p>

        <ol className="pjs__spans" aria-label={`Illustrative weight of each stop for ${shape.term.toLowerCase()}`}>
          {processDetails.map((step, i) => {
            const w = shape.weights[i];
            return (
              <li
                key={step.id}
                className={`pjs-span pjs-span--${w}${i === shape.lead ? " is-lead" : ""}`}
                data-flip-id={`span-${step.id}`}
                style={{ "--g": GROW[w], "--h": RISE[w], "--i": i } as CSSProperties}
              >
                <span className="pjs-span__arch" aria-hidden="true">
                  {i === shape.lead ? (
                    <span className="pjs-lead" data-flip-id="lead">
                      Most weight
                    </span>
                  ) : null}
                  <i />
                </span>
                <span className="pjs-span__name">
                  <span className="pjs-span__i">{step.index}</span> {step.title}
                  {i === shape.lead ? <span className="visually-hidden"> (most weight)</span> : null}
                </span>
                <span className="pjs-span__w">
                  <span className="pjs-span__dots" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="visually-hidden">: </span>
                  {w}
                </span>
              </li>
            );
          })}
        </ol>
        <p className="pjs__note">Illustrative emphasis, not a schedule. Every project is scoped on its own.</p>
      </div>
    </div>
  );
}
