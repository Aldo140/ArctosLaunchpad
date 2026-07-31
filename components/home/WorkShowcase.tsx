"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Project } from "@/lib/content";
import { useMediaQuery, useReducedMotion } from "@/lib/useMedia";

/**
 * Selected work.
 *
 * The headline claims different problems deserve different systems. Four
 * identical alternating rows would contradict it on sight, so each project gets
 * a footprint and a treatment derived from what kind of thing it actually is:
 *
 *   Calgary Watch      live civic infrastructure   full-bleed, reel dominant
 *   Starlings          human-scale care platform   portrait, the phone in hand
 *   Rio Alto           hospitality                 reel plus a colour rail
 *   True North Kromes  manufacturing precision     reel plus chrome macros
 *
 * The recordings are the proof. They play only while on screen and only when
 * motion is welcome; otherwise the poster frame stands in and nothing is lost.
 */

type Shape = "banner" | "portrait" | "rail" | "macros";

type Layout = {
  slug: string;
  shape: Shape;
  chapter: "attract" | "convert" | "operate" | "scale";
  /** What this project is, in the studio's own shorthand. */
  kind: string;
  /** Extra plates shown alongside the reel, where the archive has them. */
  plates?: { src: string; alt: string }[];
  /** Overrides the reel with a single still, for the human-scale entry. */
  still?: { src: string; alt: string };
};

const LAYOUTS: Layout[] = [
  {
    slug: "calgary-watch",
    shape: "banner",
    chapter: "attract",
    kind: "Live civic infrastructure",
  },
  {
    slug: "starlings-support-map",
    shape: "portrait",
    chapter: "scale",
    kind: "Human-scale care platform",
    still: {
      src: "/assets/work/starlings-phone-in-hand.webp",
      alt: "A person holding a phone showing the Starlings Support Map homepage on a studio desk",
    },
    plates: [
      {
        src: "/assets/work/starlings-care-loop.webp",
        alt: "The Starlings care loop, explaining how a private note becomes community support",
      },
    ],
  },
  {
    slug: "rio-alto",
    shape: "rail",
    chapter: "convert",
    kind: "Hospitality, in its own colours",
    plates: [
      {
        src: "/assets/work/rio-alto/colorful-tortilla-flight.webp",
        alt: "Five colourful house-made tortillas plated with salsa and guacamole",
      },
      {
        src: "/assets/work/rio-alto/festive-sweet-bread.webp",
        alt: "Trays of sliced pink and green festive sweet bread",
      },
      {
        src: "/assets/work/rio-alto/fresh-bread.webp",
        alt: "A tray of freshly baked bread rolls from the Rio Alto bakery",
      },
    ],
  },
  {
    slug: "true-north-kromes",
    shape: "macros",
    chapter: "operate",
    kind: "Manufacturing precision",
    plates: [
      {
        src: "/assets/work/true-north-kromes/framework-build-tray.webp",
        alt: "Cobalt-chrome dental frameworks on a selective laser melting build tray",
      },
      {
        src: "/assets/work/true-north-kromes/upper-framework-occlusal.webp",
        alt: "A polished upper cobalt-chrome framework seated on a dental model",
      },
      {
        src: "/assets/work/true-north-kromes/lower-framework-fit.webp",
        alt: "A finished lower cobalt-chrome framework fitted to a dental model",
      },
    ],
  },
];

function Reel({
  src,
  poster,
  title,
  reduced,
}: {
  src?: string;
  poster?: string;
  title: string;
  reduced: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  if (!src || reduced) {
    return poster ? (
      <Image src={poster} alt={`${title} interface`} fill sizes="100vw" />
    ) : null;
  }

  return (
    <video
      ref={ref}
      className="showcase__video"
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={`Recorded scroll through the ${title} website`}
    />
  );
}

export function WorkShowcase({ projects }: { projects: Project[] }) {
  const reduced = useReducedMotion();
  const compact = useMediaQuery("(max-width: 700px)");

  const entries = LAYOUTS.map((layout) => ({
    layout,
    project: projects.find((p) => p.slug === layout.slug),
  })).filter((e): e is { layout: Layout; project: Project } =>
    Boolean(e.project),
  );

  return (
    <div className="showcase">
      {entries.map(({ layout, project }, i) => (
        <article
          key={project.slug}
          className={`showcase__item showcase__item--${layout.shape} reveal`}
          data-chapter={layout.chapter}
        >
          <header className="showcase__head">
            <span className="t-folio showcase__n">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="showcase__rule" aria-hidden="true" />
            <span className="t-folio showcase__kind">{layout.kind}</span>
            <span className="t-folio showcase__status">
              {project.statusLabel}
            </span>
          </header>

          <div className="showcase__media">
            <Link
              href={project.route}
              className="showcase__media-link"
              aria-label={`Open the ${project.title} case study`}
            >
              {layout.still ? (
                <Image
                  src={layout.still.src}
                  alt={layout.still.alt}
                  fill
                  sizes="(max-width: 900px) 100vw, 40vw"
                />
              ) : (
                <Reel
                  src={project.reel?.src}
                  poster={project.reel?.poster ?? project.featuredImage}
                  title={project.title}
                  reduced={reduced || compact}
                />
              )}
            </Link>
          </div>

          {layout.plates?.length ? (
            <ul
              className="showcase__plates"
              aria-label={`${project.title} detail`}
            >
              {layout.plates.map((plate) => (
                <li key={plate.src}>
                  <Image
                    src={plate.src}
                    alt={plate.alt}
                    fill
                    sizes="(max-width: 900px) 33vw, 18vw"
                  />
                </li>
              ))}
            </ul>
          ) : null}

          <div className="showcase__body">
            <h3 className="showcase__title">
              <Link href={project.route}>{project.title}</Link>
            </h3>
            <p className="showcase__summary">{project.summary}</p>
            <ul className="showcase__services">
              {project.services.slice(0, 4).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <Link className="link showcase__go" href={project.route}>
              Read the case study
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
