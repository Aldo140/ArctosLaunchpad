import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Project } from "@/lib/content";

/**
 * The rail's last stop. The posters already travelled past gather into a
 * deck that fans open as the card reaches centre, under one plain promise:
 * there is more, and all of it is labelled honestly on /work.
 */
export function RailFinale({ projects, total }: { projects: Project[]; total: number }) {
  const shown = projects.length;
  const posters = projects
    .map((p) => ({ src: p.reel?.poster ?? p.featuredImage, accent: p.accent, slug: p.slug }))
    .filter((p): p is { src: string; accent: string | undefined; slug: string } => Boolean(p.src));
  const mid = (posters.length - 1) / 2;

  return (
    <Link href="/work" className="rf" data-cursor="Open index">
      <span className="rf__deck" aria-hidden="true">
        {posters.map((p, k) => (
          <span
            key={p.slug}
            className="rf__card"
            style={{ "--k": k - mid, "--plate": p.accent ?? "var(--ink-3)" } as CSSProperties}
          >
            <Image src={p.src} alt="" width={640} height={341} sizes="220px" />
          </span>
        ))}
      </span>
      <span className="rf__text">
        <span className="mono rf__kicker">
          {shown < total ? `${shown} of ${total} shown` : `${total} projects`}
        </span>
        <span className="rf__title">
          See all <em>{total} projects</em>
        </span>
        <span className="rf__note">Client sites, platforms and studio products — every one labelled for what it is.</span>
      </span>
      <span className="rf__go" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="26" height="26">
          <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </span>
    </Link>
  );
}
