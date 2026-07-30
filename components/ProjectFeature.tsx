"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Project } from "@/lib/content";
import { useReducedMotion } from "@/lib/useMedia";

/**
 * A project, shown as the thing itself.
 *
 * The screen recordings are the strongest proof in the archive and were sitting
 * unused, so they lead: the static capture is the poster, and the recording
 * starts when the frame is actually on screen and stops when it leaves. Muted,
 * looping, no controls, `playsInline` — it is evidence, not a video player.
 *
 * No fake browser chrome. A drawn window frame around a real screenshot adds a
 * layer of pretend to something that is already true.
 */
export function ProjectFeature({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = video.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const reel = project.reel;
  const poster = reel?.poster ?? project.featuredImage;

  return (
    <article className="feature reveal" data-flip={index % 2 === 1 || undefined}>
      <div className="feature__media">
        <Link href={project.route} className="feature__media-link">
          {reel && !reduced ? (
            <video
              ref={video}
              className="feature__video"
              src={reel.src}
              poster={poster}
              muted
              loop
              playsInline
              preload="none"
              aria-label={`Screen recording of ${project.title}`}
            />
          ) : poster ? (
            <Image
              src={poster}
              alt={`${project.title} interface`}
              fill
              sizes="(max-width: 900px) 100vw, 58vw"
            />
          ) : null}
        </Link>
        <span className="feature__index t-folio">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="feature__body">
        <p className="tick-label">{project.statusLabel}</p>
        <h3 className="feature__title t-title">
          <Link href={project.route}>{project.title}</Link>
        </h3>
        <p className="feature__summary t-body">{project.summary}</p>

        <ul className="feature__services">
          {project.services.slice(0, 4).map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>

        <Link className="link" href={project.route}>
          Read the case study
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
