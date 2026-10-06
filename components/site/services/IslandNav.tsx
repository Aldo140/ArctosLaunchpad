"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import type { IslandId } from "@/lib/content";
import { goToIsland } from "./scrollTo";

type Item = { id: IslandId; index: string; name: string; art: string };

/**
 * The navigator: three islands on one deck, docked to the bottom of the
 * screen while the chapters are on screen. The rust fill is where you are on
 * the crossing — it reaches an island as that chapter's top passes mid-screen.
 */
export function IslandNav({ items }: { items: Item[] }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<IslandId>(items[0].id);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = root.current;
    const chapters = items
      .map((item) => document.getElementById(item.id))
      .filter((c): c is HTMLElement => Boolean(c));
    if (!el || chapters.length !== items.length) return;

    let raf = 0;
    let lastP = "";
    const update = () => {
      raf = 0;
      const mid = window.innerHeight * 0.5;
      const tops = chapters.map((c) => c.getBoundingClientRect().top);
      const last = chapters[chapters.length - 1].getBoundingClientRect();
      // Progress 0..1 across the crossing, piecewise between chapter tops.
      let p = 0;
      for (let i = 0; i < tops.length - 1; i++) {
        const span = tops[i + 1] - tops[i];
        const t = Math.min(1, Math.max(0, (mid - tops[i]) / span));
        p += t / (tops.length - 1);
      }
      const nextP = p.toFixed(4);
      if (nextP !== lastP) {
        lastP = nextP;
        el.style.setProperty("--p", nextP);
      }
      let current = 0;
      tops.forEach((top, i) => {
        if (top <= mid) current = i;
      });
      setActive(items[current].id);
      setShown(
        tops[0] < window.innerHeight * 0.6 &&
          last.bottom > window.innerHeight * 0.75,
      );
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  const go = (id: IslandId) => (e: MouseEvent) => {
    e.preventDefault();
    goToIsland(id);
  };

  return (
    <nav
      ref={root}
      className={`svx-nav${shown ? " is-shown" : ""} is-${active}`}
      aria-label="Islands on this page"
      style={{ "--p": 0 } as CSSProperties}
    >
      <div className="svx-nav__track" aria-hidden="true">
        <span className="svx-nav__fill" />
        <span className="svx-nav__signal" />
      </div>
      <ol className="svx-nav__list">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`svx-nav__item${active === item.id ? " is-on" : ""}`}
              aria-current={active === item.id ? "location" : undefined}
              onClick={go(item.id)}
              tabIndex={shown ? undefined : -1}
            >
              <span className="svx-nav__art" aria-hidden="true">
                <Image
                  src={item.art}
                  alt=""
                  width={64}
                  height={64}
                  sizes="44px"
                />
              </span>
              <span className="svx-nav__idx">{item.index}</span>
              <span className="svx-nav__name">{item.name}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
