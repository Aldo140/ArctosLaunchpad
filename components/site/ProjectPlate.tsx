import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Project } from "@/lib/content";
import { Status } from "./ui";
import { ReportFigure, FlowFigure } from "./Figures";

/**
 * A project as a stack of real artifacts on separate depth planes: the
 * recorded site on the back plane, a phone capture of the same live site on
 * the near plane. No drawn browser chrome — the captures are already true.
 * Projects without public media get a typeset figure that says so.
 */
export function PlateStage({
  project,
  sizes = "(max-width: 900px) 90vw, 50vw",
  priority,
}: {
  project: Project;
  sizes?: string;
  priority?: boolean;
}) {
  const style = { "--plate": project.accent ?? "var(--ink-3)" } as CSSProperties;
  const poster = project.reel?.poster ?? project.featuredImage;

  if (!poster) {
    return (
      <div className="stage stage--figure" style={style}>
        {project.mockupType === "dashboard" ? <ReportFigure /> : <FlowFigure />}
      </div>
    );
  }

  return (
    <div className="stage" style={style}>
      <div className="stage__screen" data-depth="back">
        {project.reel ? (
          <video
            data-reel
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            tabIndex={-1}
          >
            <source src={project.reel.src} type="video/webm" />
          </video>
        ) : null}
        <Image
          className="stage__poster"
          src={poster}
          alt=""
          width={1280}
          height={682}
          sizes={sizes}
          priority={priority}
        />
      </div>
      {project.phone ? (
        <div className="stage__phone phone" data-depth="near">
          <Image src={project.phone} alt="" width={390} height={844} sizes="200px" />
        </div>
      ) : null}
    </div>
  );
}

export function ProjectPlate({
  project,
  index,
  sizes,
}: {
  project: Project;
  index?: number;
  sizes?: string;
}) {
  return (
    <article
      className="plate"
      data-plate={project.slug}
      style={{ "--plate": project.accent ?? "var(--ink-3)" } as CSSProperties}
    >
      <Link
        href={project.route}
        className="plate__link"
        aria-label={`${project.title} — case study`}
        data-cursor="View case"
      >
        <PlateStage project={project} sizes={sizes} />
      </Link>
      <div className="plate__meta">
        <div className="plate__row">
          {index !== undefined ? (
            <span className="index">{String(index + 1).padStart(2, "0")}</span>
          ) : null}
          <Status project={project} />
        </div>
        <h3 className="h3 plate__title">
          <Link href={project.route}>{project.title}</Link>
        </h3>
        <p className="plate__summary">{project.summary}</p>
      </div>
    </article>
  );
}
