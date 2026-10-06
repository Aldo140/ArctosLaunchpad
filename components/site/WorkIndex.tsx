"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project, ProjectCategory } from "@/lib/content";
import { ProjectPlate } from "./ProjectPlate";
import { categoryLabel } from "./ui";

gsap.registerPlugin(Flip, ScrollTrigger);

type Filter = "all" | ProjectCategory;

const FILTERS: [Filter, string][] = [
  ["all", "All work"],
  ["client-site", "Client websites"],
  ["platform", "Platforms and tools"],
  ["studio", "Studio products and demos"],
];

/**
 * Editorial rhythm for the visible cards, by position (not by project), so
 * the wall re-composes itself after every filter:
 *   lead  full width, the opening spread
 *   a/b   a wide card and a narrow one dropped lower
 *   c/d   a mid card pulled in from the margin, a wider one dropped lower
 *   e     a single wide card set right, a breath between pairs
 * A pair that would be left with one card becomes an `e` instead.
 */
const CYCLE = ["a", "b", "c", "d", "e"] as const;
type Slot = "lead" | (typeof CYCLE)[number];

function slotsFor(count: number): Slot[] {
  if (count === 0) return [];
  const rest: Slot[] = Array.from({ length: count - 1 }, (_, i) => CYCLE[i % CYCLE.length]);
  const last = rest.length - 1;
  if (last >= 0 && (rest[last] === "a" || rest[last] === "c")) rest[last] = "e";
  return ["lead", ...rest];
}

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * The full portfolio, filterable by what the work actually was. Filtering
 * hides cards with `hidden` rather than unmounting, so the reels' observers
 * stay attached; GSAP Flip carries every card from where it was to where it
 * now belongs. Cards tilt toward a fine pointer, their two real captures
 * separate onto their depth planes, and a "View case" cursor follows.
 */
export function WorkIndex({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const gridHeight = useRef(0);

  const count = (f: Filter) => (f === "all" ? projects.length : projects.filter((p) => p.category === f).length);
  const visible = projects.filter((p) => filter === "all" || p.category === filter);
  const slots = slotsFor(visible.length);

  const motionOK = () =>
    typeof window !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const choose = useCallback(
    (value: Filter) => {
      if (value === filter) return;
      const root = rootRef.current;
      if (root && motionOK()) {
        flipState.current = Flip.getState(root.querySelectorAll(".wgrid__item"), { props: "opacity" });
        gridHeight.current = root.querySelector<HTMLElement>(".wgrid")?.offsetHeight ?? 0;
      }
      setFilter(value);
    },
    [filter],
  );

  // Flip: animate from the recorded state into the new composition.
  useIsoLayoutEffect(() => {
    const state = flipState.current;
    const root = rootRef.current;
    flipState.current = null;
    if (!state || !root) return;
    // absolute:true lifts every card out of flow, so hold the wall's height
    // and ease it from the old composition to the new one.
    const grid = root.querySelector<HTMLElement>(".wgrid")!;
    const to = grid.offsetHeight;
    gsap.fromTo(grid, { height: gridHeight.current }, { height: to, duration: 0.85, ease: "power3.inOut", clearProps: "height" });
    const tl = Flip.from(state, {
      duration: 0.85,
      ease: "power3.inOut",
      absolute: true,
      nested: true,
      prune: true,
      stagger: 0.025,
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { opacity: 0, scale: 0.9, y: 60 },
          { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.2, stagger: 0.06 },
        ),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.9, duration: 0.4, ease: "power2.in" }),
      onComplete: () => {
        gsap.set(root.querySelectorAll(".wgrid__item"), { clearProps: "opacity,scale,y,transform" });
        ScrollTrigger.refresh();
      },
    });
    return () => {
      tl.progress(1).kill();
    };
  }, [filter]);

  // The active pill slides between filters.
  useIsoLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const ind = bar.querySelector<HTMLElement>(".wfilter__ind");
    const place = (animate: boolean) => {
      const on = bar.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (!on || !ind) return;
      const props = { x: on.offsetLeft, y: on.offsetTop, width: on.offsetWidth, height: on.offsetHeight };
      if (animate && motionOK()) gsap.to(ind, { ...props, duration: 0.6, ease: "power3.out" });
      else gsap.set(ind, props);
      // On phones the bar scrolls sideways: bring the chosen filter fully in.
      if (animate && bar.scrollWidth > bar.clientWidth) {
        bar.scrollTo({ left: Math.max(0, on.offsetLeft - 24), behavior: motionOK() ? "smooth" : "auto" });
      }
    };
    place(bar.dataset.ready === "1");
    bar.dataset.ready = "1";
    const ro = new ResizeObserver(() => place(false));
    ro.observe(bar);
    return () => ro.disconnect();
  }, [filter]);

  // Depth, tilt, cursor and entrances.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        fine: "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { motion, fine } = context.conditions as { motion: boolean; fine: boolean };
        if (!motion) return;
        const cleanups: (() => void)[] = [];

        // Entrances: each stage opens like a plate being uncovered. With a
        // fine pointer the phone also rises in; on touch, scroll owns depth.
        if (!fine) {
          root.classList.add("is-scroll");
          cleanups.push(() => root.classList.remove("is-scroll"));
        }
        root.querySelectorAll<HTMLElement>(".plate").forEach((plate) => {
          const stage = plate.querySelector<HTMLElement>(".stage");
          if (!stage) return;
          const phone = stage.querySelector(".stage__phone");
          const screen = stage.querySelector(".stage__screen, .fig-report__deck, .fig-flow ol");
          const stamp = stage.querySelector(".fig-report__stamp");
          const meta = plate.querySelectorAll(".plate__meta > *");
          const tl = gsap.timeline({
            scrollTrigger: { trigger: plate, start: "top 90%", once: true },
            defaults: { ease: "expo.out" },
          });
          tl.fromTo(stage, { clipPath: "inset(14% 10% 14% 10% round 10px)" }, { clipPath: "inset(0% 0% 0% 0% round 10px)", duration: 1.3, clearProps: "clipPath" })
            .from(meta, { y: 24, opacity: 0, duration: 1, stagger: 0.07 }, 0.25);
          if (fine) {
            tl.from(screen, { y: 50, scale: 0.96, duration: 1.3 }, 0.05).from(
              phone,
              { yPercent: 40, opacity: 0, rotate: 6, duration: 1.4 },
              0.2,
            );
            return;
          }
          // Touch: depth is scrubbed by the scroll. The stage leans back as it
          // enters and forward as it leaves; the screen drifts on the far
          // plane while the phone (or the withheld stamp) separates onto the
          // near plane and lifts past it.
          const depth = gsap.timeline({
            scrollTrigger: { trigger: stage, start: "top bottom", end: "bottom top", scrub: 0.5 },
            defaults: { ease: "none" },
          });
          depth.fromTo(stage, { rotationX: 9, transformPerspective: 900, transformOrigin: "50% 100%" }, { rotationX: -5 }, 0);
          if (screen) depth.fromTo(screen, { y: 22 }, { y: -16 }, 0);
          if (phone) depth.fromTo(phone, { y: 48, x: -12, rotation: -9 }, { y: -40, x: 8, rotation: 1 }, 0);
          if (stamp) depth.fromTo(stamp, { y: 36, rotation: -12 }, { y: -18, rotation: -5 }, 0);
        });

        if (!fine) return () => cleanups.forEach((c) => c());

        root.classList.add("is-tilt");
        cleanups.push(() => root.classList.remove("is-tilt"));

        // Tilt + depth separation per card.
        root.querySelectorAll<HTMLElement>(".plate__link").forEach((link) => {
          const stage = link.querySelector<HTMLElement>(".stage");
          if (!stage) return;
          const back = stage.querySelector<HTMLElement>(".stage__screen, .fig-report__sheet, .fig-flow ol");
          const near = stage.querySelector<HTMLElement>(".stage__phone, .fig-report__stamp");
          gsap.set(stage, { transformPerspective: 1300 });
          const rx = gsap.quickTo(stage, "rotationX", { duration: 0.7, ease: "power3.out" });
          const ry = gsap.quickTo(stage, "rotationY", { duration: 0.7, ease: "power3.out" });
          const bx = back && gsap.quickTo(back, "x", { duration: 0.8, ease: "power3.out" });
          const by = back && gsap.quickTo(back, "y", { duration: 0.8, ease: "power3.out" });
          const nx = near && gsap.quickTo(near, "x", { duration: 0.6, ease: "power3.out" });
          const ny = near && gsap.quickTo(near, "y", { duration: 0.6, ease: "power3.out" });

          const move = (e: PointerEvent) => {
            const r = stage.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            rx(py * -7);
            ry(px * 9);
            bx?.(px * -10);
            by?.(py * -8 - 6);
            nx?.(px * 26);
            ny?.(py * 18 - 22);
            stage.style.setProperty("--mx", `${(px + 0.5) * 100}%`);
            stage.style.setProperty("--my", `${(py + 0.5) * 100}%`);
          };
          const leave = () => {
            rx(0);
            ry(0);
            bx?.(0);
            by?.(0);
            nx?.(0);
            ny?.(0);
          };
          link.addEventListener("pointermove", move);
          link.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            link.removeEventListener("pointermove", move);
            link.removeEventListener("pointerleave", leave);
            gsap.set([stage, back, near].filter(Boolean), { clearProps: "transform" });
          });
        });

        // The "View case" cursor.
        const cursor = root.querySelector<HTMLElement>(".wx-cursor");
        if (cursor) {
          gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });
          const cx = gsap.quickTo(cursor, "x", { duration: 0.45, ease: "power3.out" });
          const cy = gsap.quickTo(cursor, "y", { duration: 0.45, ease: "power3.out" });
          let over = false;
          const onMove = (e: PointerEvent) => {
            cx(e.clientX);
            cy(e.clientY);
            const hit = (e.target as Element | null)?.closest?.("[data-cursor]");
            const inside = Boolean(hit && root.contains(hit));
            if (inside !== over) {
              over = inside;
              gsap.to(cursor, {
                scale: inside ? 1 : 0,
                opacity: inside ? 1 : 0,
                duration: inside ? 0.5 : 0.3,
                ease: inside ? "back.out(1.6)" : "power2.in",
              });
            }
          };
          const onScroll = () => {
            if (!over) return;
            over = false;
            gsap.to(cursor, { scale: 0, opacity: 0, duration: 0.25 });
          };
          window.addEventListener("pointermove", onMove, { passive: true });
          window.addEventListener("scroll", onScroll, { passive: true });
          cleanups.push(() => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("scroll", onScroll);
          });
        }

        return () => cleanups.forEach((c) => c());
      },
    );
    return () => mm.revert();
  }, []);

  return (
    <div className="wx" ref={rootRef}>
      <div className="wfilter" role="group" aria-label="Filter projects" ref={barRef}>
        <span className="wfilter__ind" aria-hidden="true" />
        {FILTERS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            className="wfilter__btn"
            aria-pressed={filter === value}
            onClick={() => choose(value)}
          >
            {label}
            <span className="wfilter__count">{count(value)}</span>
          </button>
        ))}
      </div>
      <p className="visually-hidden" aria-live="polite">
        Showing {visible.length} {visible.length === 1 ? "project" : "projects"}
        {filter === "all" ? "" : `: ${categoryLabel[filter]}`}
      </p>

      <ol className="wgrid">
        {projects.map((project, i) => {
          const shown = filter === "all" || project.category === filter;
          const order = visible.indexOf(project);
          const slot = shown ? slots[order] : undefined;
          return (
            <li
              key={project.slug}
              hidden={!shown}
              data-flip-id={project.slug}
              className={`wgrid__item${slot ? ` wgrid__item--${slot}` : ""}`}
            >
              <ProjectPlate
                project={project}
                index={i}
                sizes={
                  slot === "lead"
                    ? "(max-width: 900px) 92vw, 90vw"
                    : slot === "b"
                      ? "(max-width: 900px) 92vw, 34vw"
                      : "(max-width: 900px) 92vw, 60vw"
                }
              />
            </li>
          );
        })}
      </ol>
      <div className="wx-cursor" aria-hidden="true">
        <span>View case</span>
      </div>
    </div>
  );
}
