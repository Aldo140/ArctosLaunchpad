"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useMedia";

/**
 * A recorded scroll through the live site.
 *
 * Plays only while it is on screen and only when motion is welcome; otherwise
 * the poster frame stands in. Muted, looping, no chrome — this is evidence of
 * a shipped build, not a video player.
 */
export function ProjectReel({
  src,
  poster,
  title,
  playOnView = true,
}: {
  src: string;
  poster: string;
  title: string;
  playOnView?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !playOnView) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [playOnView, reduced]);

  if (reduced || !playOnView) {
    /* eslint-disable-next-line @next/next/no-img-element */
    return <img className="reel" src={poster} alt={`${title} homepage`} />;
  }

  return (
    <video
      ref={ref}
      className="reel"
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
