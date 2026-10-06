"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, type CSSProperties, type MouseEvent } from "react";
import { gsap } from "gsap";

/**
 * The next case study as the next page of the same book. Scrolling lifts the
 * page toward you; following the link turns it: a sheet in the next
 * project's colour sweeps up over this one before the route changes.
 */
export function NextProject({
  href,
  title,
  summary,
  status,
  accent,
  image,
}: {
  href: string;
  title: string;
  summary: string;
  status: string;
  accent: string;
  image?: string;
}) {
  const router = useRouter();
  const sheet = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  const turn = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = sheet.current;
    if (!el || busy.current) return;
    e.preventDefault();
    busy.current = true;
    router.prefetch(href);
    gsap
      .timeline({ onComplete: () => router.push(href) })
      .set(el, { visibility: "visible" })
      .fromTo(
        el,
        { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" },
        { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 0.75, ease: "power3.inOut" },
      )
      .fromTo(".cx-turn__title", { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, 0.35);
  };

  const style = { "--next": accent } as CSSProperties;

  return (
    <section className="cx-next tone-ink" data-tone="ink" aria-label="Next project" style={style}>
      <Link href={href} className="cx-next__link" onClick={turn}>
        <span className="cx-next__page">
          {image ? (
            <span className="cx-next__bg" aria-hidden="true">
              <Image src={image} alt="" width={1600} height={852} sizes="100vw" />
            </span>
          ) : null}
          <span className="wrap cx-next__inner">
            <span className="mono cx-next__eyebrow">
              <span>Next case study</span>
              <span>{status}</span>
            </span>
            <span className="display cx-next__title">{title}</span>
            <span className="cx-next__row">
              <span className="cx-next__summary">{summary}</span>
              <span className="cx-next__arrow" aria-hidden="true">
                →
              </span>
            </span>
          </span>
          <span className="cx-next__edge" aria-hidden="true" />
        </span>
      </Link>
      <div ref={sheet} className="cx-turn" aria-hidden="true" style={style}>
        <span className="display cx-turn__title">{title}</span>
      </div>
    </section>
  );
}
