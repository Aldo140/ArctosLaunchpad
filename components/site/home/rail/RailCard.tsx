import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Project } from "@/lib/content";
import { Status } from "../../ui";

/**
 * One project on the rail, built as real artifacts on separate depth planes:
 * the recorded site on the back plane, a phone capture of the same live site
 * on the near plane. The rail's motion drives `.rc__depth` (focus), the
 * planes (parallax) and `.rc__tilt` (pointer). No drawn browser chrome.
 */
export function RailCard({ project, index, total }: { project: Project; index: number; total: number }) {
  const poster = project.reel?.poster ?? project.featuredImage;
  const style = { "--plate": project.accent ?? "var(--ink-3)" } as CSSProperties;
  const num = String(index + 1).padStart(2, "0");

  return (
    <article className="rc" style={style} aria-labelledby={`rc-${project.slug}`}>
      <div className="rc__depth">
        {/* Duplicate of the title link for pointer users; hidden from the tab order. */}
        <Link
          href={project.route}
          className="rc__media"
          tabIndex={-1}
          aria-hidden="true"
          data-cursor="View case"
        >
          <div className="rc__tilt">
            <div className="rc__screen" data-plane="back">
              {poster ? (
                <>
                  <Image
                    className="rc__poster"
                    src={poster}
                    alt=""
                    width={1280}
                    height={682}
                    sizes="(max-width: 1023px) 86vw, 50vw"
                  />
                  {project.reel ? (
                    <video data-rail-reel muted loop playsInline preload="none" tabIndex={-1}>
                      <source src={project.reel.src} type="video/webm" />
                    </video>
                  ) : null}
                </>
              ) : (
                <span className="rc__type">{project.title}</span>
              )}
              <span className="rc__shade" />
              <span className="rc__glare" />
            </div>
            {project.phone ? (
              <div className="rc__phone" data-plane="near">
                <div className="phone">
                  <Image src={project.phone} alt="" width={390} height={844} sizes="180px" />
                </div>
              </div>
            ) : null}
          </div>
        </Link>

        <div className="rc__meta">
          <div className="rc__row">
            <span className="index">
              {num}
              <span className="rc__of"> / {String(total).padStart(2, "0")}</span>
            </span>
            <Status project={project} />
          </div>
          <h3 className="h3 rc__title" id={`rc-${project.slug}`}>
            <Link href={project.route} data-cursor="View case">
              {project.title}
              <span className="visually-hidden"> — view case study</span>
            </Link>
          </h3>
          <p className="rc__summary">{project.summary}</p>
        </div>
      </div>
    </article>
  );
}
