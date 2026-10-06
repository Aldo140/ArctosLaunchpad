"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type { Project } from "@/lib/content";
import Link from "next/link";
import { statusTone } from "../ui";

gsap.registerPlugin(Flip, ScrollTrigger, SplitText);

type Tone = "live" | "internal" | "studio";

const LEGEND: [Tone, string, string][] = [
  ["live", "Live", "Launched and in use by the client or the public."],
  ["internal", "Internal", "In use inside a client business; figures withheld."],
  ["studio", "Studio / demo", "The studio’s own product or a working demo."],
];
const TONE_ORDER: Tone[] = ["live", "internal", "studio"];

/**
 * Where each real capture floats in the field. x/y/w are % of the field;
 * z is depth (0.3 far … 1.3 near): it sets brightness, blur and how far the
 * capture travels with the pointer and the scroll. Mobile uses m* values.
 */
type Spot = { x: number; y: number; w: number; z: number; mx: number; my: number; mw: number; phone?: boolean };
const SCREEN_SPOTS: Spot[] = [
  { x: 50, y: 13, w: 27, z: 1, mx: 4, my: 14, mw: 60 },
  { x: 77, y: 7, w: 20, z: 0.62, mx: 52, my: 2, mw: 46 },
  { x: 64, y: 46, w: 21, z: 0.82, mx: 40, my: 52, mw: 54 },
  { x: 86, y: 38, w: 14, z: 0.42, mx: 70, my: 34, mw: 34 },
  { x: 36, y: 4, w: 13, z: 0.3, mx: -6, my: 0, mw: 30 },
  { x: 86, y: 54, w: 14, z: 0.7, mx: 78, my: 70, mw: 30 },
  { x: 22, y: 12, w: 12, z: 0.3, mx: -10, my: 62, mw: 36 },
];
const PHONE_SPOTS: Spot[] = [
  { x: 72.5, y: 24, w: 6.6, z: 1.3, mx: 60, my: 20, mw: 17, phone: true },
  { x: 62, y: 6, w: 4.6, z: 1.12, mx: 29, my: 46, mw: 14, phone: true },
  { x: 93, y: 16, w: 4.8, z: 0.88, mx: 88, my: 8, mw: 12, phone: true },
  { x: 79, y: 45, w: 5, z: 1.2, mx: 86, my: 46, mw: 13, phone: true },
];

function spotStyle(s: Spot, accent?: string) {
  return {
    "--x": `${s.x}%`,
    "--y": `${s.y}%`,
    "--w": `${s.w}%`,
    "--mx": `${s.mx}%`,
    "--my": `${s.my}%`,
    "--mw": `${s.mw}%`,
    "--z": s.z,
    "--plate": accent ?? "var(--ink-3)",
  } as CSSProperties;
}

/**
 * The /work opening: every real capture in the portfolio floating at its own
 * depth, drifting with the pointer and parting with the scroll, under a
 * kinetic title. The ledger beneath counts the projects by honest status —
 * the nine cells arrive in portfolio order, then sort themselves into groups.
 */
export function WorkHero({ projects }: { projects: Project[] }) {
  const rootRef = useRef<HTMLElement>(null);

  const withReel = projects.filter((p) => p.reel?.poster);
  const withPhone = projects.filter((p) => p.phone);
  const tones = projects.map((p) => statusTone(p) as Tone);
  const counts = TONE_ORDER.map((t) => tones.filter((x) => x === t).length);
  // Grouped order (the resting, honest arrangement), stable within a group.
  const grouped = projects
    .map((p, i) => ({ p, i, t: statusTone(p) as Tone }))
    .sort((a, b) => TONE_ORDER.indexOf(a.t) - TONE_ORDER.indexOf(b.t) || a.i - b.i);
  const groupedIndex = new Map(grouped.map((g, k) => [g.p.slug, k]));

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

        const tiles = gsap.utils.toArray<HTMLElement>(".whero__tile", root);
        const inners = tiles.map((t) => t.querySelector<HTMLElement>(".whero__inner")!);
        const depth = (el: HTMLElement) => Number(getComputedStyle(el).getPropertyValue("--z")) || 0.5;
        const title = root.querySelector<HTMLElement>(".whero__title");
        const cells = gsap.utils.toArray<HTMLElement>(".whero__cell", root);
        const nums = gsap.utils.toArray<HTMLElement>(".whero__n", root);
        const countEl = root.querySelector<HTMLElement>(".whero__count");

        // 1. Captures fly in from deep space, far ones first.
        const order = [...inners].sort((a, b) => depth(a.parentElement!) - depth(b.parentElement!));
        const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
        intro.from(order, {
          opacity: 0,
          scale: 0.55,
          z: -400,
          y: 80,
          rotateX: 18,
          duration: 1.8,
          stagger: 0.07,
          transformPerspective: 900,
        });

        // 2. Kinetic title: words rise from masks; the count ticks to the real total.
        let split: SplitText | null = null;
        if (title) {
          split = SplitText.create(title.querySelectorAll(".whero__line"), { type: "words", mask: "words" });
          intro.from(split.words, { yPercent: 110, rotate: 4, duration: 1.3, stagger: 0.06 }, 0.15);
        }
        if (countEl) {
          const total = Number(countEl.dataset.total);
          const proxy = { n: 0 };
          intro.to(
            proxy,
            {
              n: total,
              duration: 1.4,
              ease: "power2.out",
              onUpdate: () => (countEl.textContent = String(Math.round(proxy.n))),
            },
            0.2,
          );
        }
        intro.from(root.querySelectorAll(".whero__fade"), { opacity: 0, y: 24, duration: 1.1, stagger: 0.1 }, 0.6);

        // 3. Ledger: cells arrive in portfolio order, then sort into status groups.
        if (cells.length) {
          cells.forEach((c) => (c.style.order = c.dataset.p ?? "0"));
          gsap.set(nums, { opacity: 0 });
          intro.from(cells, { scaleY: 0, transformOrigin: "50% 100%", duration: 0.7, stagger: 0.06, ease: "back.out(2)" }, 0.7);
          intro.add(() => {
            const state = Flip.getState(cells);
            cells.forEach((c) => (c.style.order = c.dataset.g ?? "0"));
            Flip.from(state, { duration: 1, ease: "power3.inOut", stagger: 0.03 });
            gsap.to(nums, { opacity: 1, duration: 0.6, delay: 0.7, stagger: 0.12 });
            root.classList.add("is-sorted");
          }, "+=0.35");
        }

        // 4. Scroll: planes part at their own speeds; the title sinks slower.
        tiles.forEach((tile) => {
          const z = depth(tile);
          gsap.to(tile, {
            y: -z * 260,
            ease: "none",
            scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
          });
        });
        gsap.to(root.querySelector(".whero__field"), {
          opacity: 0.25,
          ease: "none",
          scrollTrigger: { trigger: root, start: "30% top", end: "bottom top", scrub: true },
        });

        // 5. Pointer: near captures travel further than far ones.
        let off: (() => void) | undefined;
        if (fine) {
          const movers = inners.map((el) => {
            const z = depth(el.parentElement!);
            return {
              z,
              x: gsap.quickTo(el, "x", { duration: 1.1, ease: "power3.out" }),
              y: gsap.quickTo(el, "y", { duration: 1.1, ease: "power3.out" }),
              r: gsap.quickTo(el, "rotationY", { duration: 1.1, ease: "power3.out" }),
            };
          });
          const onMove = (e: PointerEvent) => {
            const px = e.clientX / window.innerWidth - 0.5;
            const py = e.clientY / window.innerHeight - 0.5;
            movers.forEach((m) => {
              m.x(px * m.z * -60);
              m.y(py * m.z * -40);
              m.r(px * m.z * 8);
            });
          };
          root.addEventListener("pointermove", onMove);
          off = () => root.removeEventListener("pointermove", onMove);
        }

        return () => {
          off?.();
          split?.revert();
          cells.forEach((c) => (c.style.order = c.dataset.g ?? "0"));
          root.classList.remove("is-sorted");
        };
      },
    );
    return () => mm.revert();
  }, []);

  return (
    <section className="whero tone-ink" data-tone="ink" ref={rootRef}>
      <div className="whero__field" aria-hidden="true">
        {withReel.slice(0, SCREEN_SPOTS.length).map((p, i) => (
          <div key={p.slug} className="whero__tile" style={spotStyle(SCREEN_SPOTS[i], p.accent)}>
            <div className="whero__inner">
              <Image src={p.reel!.poster} alt="" width={1280} height={682} sizes="(max-width: 900px) 60vw, 28vw" priority={i < 3} />
            </div>
          </div>
        ))}
        {withPhone.slice(0, PHONE_SPOTS.length).map((p, i) => (
          <div key={`${p.slug}-phone`} className="whero__tile whero__tile--phone" style={spotStyle(PHONE_SPOTS[i], p.accent)}>
            <div className="whero__inner phone">
              <Image src={p.phone!} alt="" width={390} height={844} sizes="120px" />
            </div>
          </div>
        ))}
      </div>

      <div className="wrap whero__grid">
        <div className="whero__top">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <span aria-current="page">Work</span>
              </li>
            </ol>
          </nav>
          <p className="eyebrow whero__fade">Selected work</p>
        </div>

        <h1 className="whero__title" aria-label={`${projects.length} projects. Labelled honestly.`}>
          <span className="whero__line" aria-hidden="true">
            <span className="whero__count" data-total={projects.length}>
              {projects.length}
            </span>{" "}
            projects.
          </span>
          <span className="whero__line" aria-hidden="true">
            <em>Labelled honestly.</em>
          </span>
        </h1>

        <div className="whero__foot">
          <p className="lead whero__lead whero__fade">
            Launched client websites, platforms people rely on, an internal reporting tool and the
            studio’s own products. Every recording and phone capture here is the real, live thing.
          </p>

          <div className="whero__ledger whero__fade">
            <ol className="whero__strip" aria-hidden="true">
              {projects.map((p, i) => (
                <li
                  key={p.slug}
                  className={`whero__cell whero__cell--${statusTone(p)}`}
                  data-p={i}
                  data-g={groupedIndex.get(p.slug)}
                  style={{ order: groupedIndex.get(p.slug) }}
                  title={p.title}
                />
              ))}
            </ol>
            <dl className="whero__legend">
              {LEGEND.map(([tone, term, def], i) => (
                <div key={tone} className={`whero__row whero__row--${tone}`}>
                  <dt>
                    <span className={`status status--${tone}`}>{term}</span>
                  </dt>
                  <dd>
                    <span className="whero__n">
                      {counts[i]}
                      <span className="visually-hidden"> {counts[i] === 1 ? "project" : "projects"}.</span>
                    </span>
                    <span className="whero__def">{def}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
