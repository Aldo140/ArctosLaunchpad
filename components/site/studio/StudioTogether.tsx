"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Lines, d } from "../ui";

export type TogetherItem = {
  slug: string;
  route: string;
  title: string;
  statusLabel: string;
  tone: "live" | "internal" | "studio";
  image: string;
  asked: string;
  did: string[];
};

/**
 * Real projects, told plainly: what we were asked, and what we did.
 * A native scroll-snap rail (swipe on touch), with buttons for pointer users.
 */
export function StudioTogether({ items }: { items: TogetherItem[] }) {
  const rail = useRef<HTMLOListElement>(null);
  const [progress, setProgress] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = Array.from(el.querySelectorAll<HTMLElement>(".st-job"));
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = el.scrollWidth - el.clientWidth;
      const p = max > 0 ? el.scrollLeft / max : 1;
      setProgress(p);
      setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft > max - 8 });
      // Depth while swiping: the card in focus sits forward, its neighbours
      // ease back, and each screenshot slides a little inside its frame.
      const box = el.getBoundingClientRect();
      const focus = box.left + Math.min(box.width * 0.5, 260);
      let nearest = 0;
      let best = Infinity;
      cards.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        const dist = (r.left + r.width / 2 - focus) / r.width;
        if (Math.abs(dist) < best) {
          best = Math.abs(dist);
          nearest = i;
        }
        if (reduce) return;
        const k = Math.min(1, Math.abs(dist));
        c.style.setProperty("--k", k.toFixed(3));
        c.style.setProperty("--px", `${(-dist * 7).toFixed(2)}%`);
      });
      setCurrent(nearest);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const step = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".st-job");
    const amount = (card?.offsetWidth ?? 400) + 24;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * amount, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section className="st-together section tone-ink" data-tone="ink" aria-labelledby="st-together-title">
      <div className="wrap st-together__head">
        <div>
          <p className="eyebrow" data-reveal>
            How working together feels
          </p>
          <Lines
            as="h2"
            id="st-together-title"
            className="h1"
            lines={["Same people,", <em key="s">first call to launch.</em>]}
          />
        </div>
        <div className="st-together__aside" data-reveal style={d(2)}>
          <p className="lead">
            No account managers in between. Here is what that looked like on real projects: what we
            were asked to solve, and what we did about it.
          </p>
          <div className="st-together__nav">
            <button type="button" className="st-navbtn" onClick={() => step(-1)} disabled={edges.start} aria-label="Previous project">
              <span aria-hidden="true">←</span>
            </button>
            <button type="button" className="st-navbtn" onClick={() => step(1)} disabled={edges.end} aria-label="Next project">
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>

      <ol ref={rail} className="st-rail" aria-label="Projects">
        {items.map((p, i) => (
          <li key={p.slug} className="st-job" data-reveal style={d(i)}>
            <Link href={p.route} className="st-job__link">
              <span className="st-job__media">
                <Image src={p.image} alt="" width={960} height={600} sizes="(max-width: 700px) 84vw, 460px" />
              </span>
              <span className={`status status--${p.tone}`}>{p.statusLabel}</span>
              <span className="st-job__title h3">{p.title}</span>
              <span className="st-job__row">
                <span className="st-job__label mono">Asked</span>
                <span className="st-job__asked">{p.asked}</span>
              </span>
              <span className="st-job__row">
                <span className="st-job__label mono">We did</span>
                <span className="st-job__did">{p.did.join(" · ")}</span>
              </span>
              <span className="st-job__cta">
                Read the case study<span aria-hidden="true"> →</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <div className="wrap st-rail__foot" aria-hidden="true">
        <span className="st-rail__count mono">
          {String(current + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </span>
        <div className="st-rail__bar">
          <span style={{ transform: `scaleX(${Math.max(0.08, progress)})` }} />
        </div>
        <span className="st-rail__hint mono">Swipe</span>
      </div>
    </section>
  );
}
