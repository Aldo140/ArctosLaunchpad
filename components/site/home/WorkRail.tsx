"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project } from "@/lib/content";
import { Lines, d } from "../ui";
import { RailCard } from "./rail/RailCard";
import { RailFinale } from "./rail/RailFinale";
import { setupRailMotion } from "./rail/motion";

gsap.registerPlugin(ScrollTrigger);

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Selected work as a cinematic rail.
 *
 * Wide screens with a fine pointer and motion welcome: the section pins and
 * travels sideways. The project at centre comes into focus while neighbours
 * recede, the ground washes to that project's own colour, its reel plays,
 * and the phone capture moves on a nearer plane than the recorded screen.
 *
 * Everywhere else it is a native swipe carousel with snap, a counter and
 * dots — no scroll hijacking. Reduced motion: a static list (grid on desktop),
 * no autoplay, nothing dimmed.
 */
export function WorkRail({ projects, total }: { projects: Project[]; total: number }) {
  const root = useRef<HTMLElement>(null);
  const n = projects.length;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    return setupRailMotion(el, projects.map((p) => p.accent ?? "#1c3438"));
  }, [projects]);

  const first = projects[0]?.accent ?? "#1c3438";

  return (
    <section
      ref={root}
      className="rail wr tone-ink"
      data-tone="ink"
      aria-labelledby="rail-title"
      style={{ "--wash": first } as CSSProperties}
    >
      <div className="wr__pin">
        <div className="wr__wash" aria-hidden="true" />

        <div className="wr__numeral" aria-hidden="true">
          <span className="wr__numeral-win">
            <span className="wr__numeral-roll">
              {projects.map((p, i) => (
                <span key={p.slug}>{pad(i + 1)}</span>
              ))}
            </span>
          </span>
        </div>

        <div className="wrap wr__head">
          <div className="wr__title">
            <p className="eyebrow" data-reveal>
              Selected work
            </p>
            <Lines as="h2" id="rail-title" className="h1" lines={["Proof,", <em key="p">not promises.</em>]} />
          </div>
          <p className="lead wr__lead" data-reveal style={d(2)}>
            Live client sites, platforms people use every day, and the studio’s own products. Each
            one is labelled for exactly what it is.
          </p>
        </div>

        <div className="wr__viewport" role="region" aria-label="Selected projects">
          <ol className="wr__track">
            {projects.map((project, i) => (
              <li key={project.slug} className="wr__item">
                <RailCard project={project} index={i} total={n} />
              </li>
            ))}
            <li className="wr__item wr__item--end">
              <RailFinale projects={projects} total={total} />
            </li>
          </ol>
        </div>

        <div className="wrap wr__foot">
          <p className="wr__count" aria-hidden="true">
            <span className="wr__count-win">
              <span className="wr__count-roll">
                {projects.map((p, i) => (
                  <span key={p.slug}>{pad(i + 1)}</span>
                ))}
              </span>
            </span>
            <span className="wr__count-of">/ {pad(n)}</span>
          </p>
          <div className="wr__dots" role="group" aria-label="Jump to a project">
            {projects.map((p, i) => (
              <button
                key={p.slug}
                type="button"
                className="wr__dot"
                data-dot={i}
                aria-label={`Show project ${i + 1}: ${p.title}`}
                aria-current={i === 0 ? "true" : undefined}
              >
                <i />
              </button>
            ))}
          </div>
          <div className="wr__progress" aria-hidden="true">
            <i />
          </div>
          <p className="mono wr__hint" aria-hidden="true">
            <span className="wr__hint-pin">Scroll to travel</span>
            <span className="wr__hint-swipe">Swipe</span>
          </p>
        </div>
      </div>

      <div className="wr__cursor" aria-hidden="true">
        <span className="wr__cursor-label">View case</span>
      </div>
    </section>
  );
}
