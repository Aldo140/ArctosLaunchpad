import Image from "next/image";
import Link from "next/link";
import { ReportArtifact } from "@/components/figures/ReportArtifact";
import { ProjectReel } from "@/components/figures/ProjectReel";
import type { Project } from "@/lib/content";
import { FlowTrack } from "./FlowTrack";
import { hostOf, pad } from "./order";

/* One composition per project, chosen for the evidence that exists.
   The index is a rhythm of plates, not a list. */

function Head({
  project,
  n,
  total,
  size = "std",
  part = "all",
  className = "",
}: {
  project: Project;
  n: number;
  total: number;
  size?: "mega" | "std";
  part?: "all" | "top" | "body";
  className?: string;
}) {
  const host = hostOf(project.externalUrl);
  return (
    <header
      className={`wrk-head wrk-head--${size} ${className}`.trim()}
    >
      {part !== "body" ? (
        <>
          <p className="wrk-head__meta t-folio">
            <span>
              {pad(n)} / {pad(total)}
            </span>
            <span className="wrk-flag">{project.statusLabel}</span>
          </p>
          <h2 className="wrk-head__title">
            <Link href={project.route}>{project.title}</Link>
          </h2>
        </>
      ) : null}
      {part !== "top" ? (
        <>
          <p className="wrk-head__sum">{project.summary}</p>
          <p className="wrk-head__reg">{project.services.join(" · ")}</p>
          <p className="wrk-head__links">
            <Link className="wrk-open" href={project.route}>
              Open case file <span aria-hidden="true">→</span>
            </Link>
            {project.externalUrl && host ? (
              <a
                className="wrk-ext"
                href={project.externalUrl}
                target="_blank"
                rel="noreferrer"
              >
                {host}
                <span aria-hidden="true"> ↗</span>
              </a>
            ) : null}
          </p>
        </>
      ) : null}
    </header>
  );
}

function Screen({
  project,
  cap,
  className = "",
}: {
  project: Project;
  cap?: string;
  className?: string;
}) {
  if (!project.reel) return null;
  return (
    <figure className={`wrk-screen ${className}`.trim()}>
      <div className="wrk-screen__frame">
        <ProjectReel
          src={project.reel.src}
          poster={project.reel.poster}
          title={project.title}
        />
      </div>
      <figcaption className="wrk-cap t-folio">
        {cap ?? `Recorded from the live build, ${hostOf(project.externalUrl)}`}
      </figcaption>
    </figure>
  );
}

function Still({
  src,
  alt,
  className = "",
  pos,
  sizes,
}: {
  src: string;
  alt: string;
  className?: string;
  pos?: string;
  sizes: string;
}) {
  return (
    <div className={`wrk-still ${className}`.trim()}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        style={pos ? { objectPosition: pos } : undefined}
      />
    </div>
  );
}

type PlateProps = { project: Project; n: number; total: number };

export function FreshPrepPlate({ project, n, total }: PlateProps) {
  return (
    <section
      id={project.slug}
      className="wrk-plate wrk-plate--fp"
      data-material="instrument"
      data-chapter="operate"
      data-station={project.title}
    >
      <div className="shell wrk-fp">
        <Head project={project} n={n} total={total} size="mega" part="top" />
        <Head
          project={project}
          n={n}
          total={total}
          part="body"
          className="wrk-fp__body"
        />
        <div className="wrk-fp__art">
          <ReportArtifact caption="Structure of a live Fresh Prep report. Figures withheld; the layout is the real one." />
        </div>
      </div>
    </section>
  );
}

export function TnkPlate({ project, n, total }: PlateProps) {
  const [tray, , detail] = project.showcaseMedia ?? [];
  return (
    <section
      id={project.slug}
      className="wrk-plate wrk-plate--tnk"
      data-material="paper"
      data-station={project.title}
    >
      <div className="shell wrk-tnk">
        <Head project={project} n={n} total={total} size="mega" part="top" />
        <Screen project={project} className="wrk-tnk__screen" />
        <Head
          project={project}
          n={n}
          total={total}
          part="body"
          className="wrk-tnk__body"
        />
        <div className="wrk-tnk__macros">
          {tray ? (
            <Still
              className="wrk-tnk__tray"
              src={tray.src}
              alt={tray.alt}
              sizes="(max-width: 900px) 100vw, 34vw"
            />
          ) : null}
          {detail ? (
            <Still
              className="wrk-tnk__detail"
              src={detail.src}
              alt={detail.alt}
              pos="80% 58%"
              sizes="(max-width: 900px) 50vw, 22vw"
            />
          ) : null}
          <p className="wrk-cap t-folio wrk-tnk__cap">
            Source photography from the lab. The site is built from it.
          </p>
        </div>
      </div>
    </section>
  );
}

export function CalgaryPlate({ project, n, total }: PlateProps) {
  const map = project.showcaseMedia?.[0];
  return (
    <section
      id={project.slug}
      className="wrk-plate wrk-plate--cw"
      data-material="instrument"
      data-chapter="attract"
      data-station={project.title}
    >
      <div className="shell wrk-cw">
        <Screen project={project} className="wrk-cw__screen" />
        <Head project={project} n={n} total={total} />
        {map ? (
          <Still
            className="wrk-cw__map"
            src={map.src}
            alt={map.alt}
            sizes="(max-width: 900px) 80vw, 30vw"
          />
        ) : null}
        <div className="wrk-cw__brief">
          <p className="wrk-cap t-folio">The brief</p>
          <p className="wrk-brief__text">{project.challenge}</p>
        </div>
      </div>
    </section>
  );
}

export function RioPlate({ project, n, total }: PlateProps) {
  const food = project.showcaseMedia?.[0];
  return (
    <section
      id={project.slug}
      className="wrk-plate wrk-plate--rio"
      data-material="paper"
      data-chapter="convert"
      data-station={project.title}
    >
      <div className="shell wrk-rio">
        <Head project={project} n={n} total={total} />
        <div className="wrk-rio__stage">
          <Screen project={project} className="wrk-rio__screen" />
          {food ? (
            <Still
              className="wrk-rio__food"
              src={food.src}
              alt={food.alt}
              sizes="(max-width: 900px) 46vw, 24vw"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function StarlingsPlate({ project, n, total }: PlateProps) {
  const phone = project.showcaseMedia?.find((m) => m.layout === "portrait");
  return (
    <section
      id={project.slug}
      className="wrk-plate wrk-plate--st"
      data-material="instrument"
      data-chapter="scale"
      data-station={project.title}
    >
      <div className="shell wrk-st">
        {phone ? (
          <Still
            className="wrk-st__phone"
            src={phone.src}
            alt={phone.alt}
            sizes="(max-width: 900px) 100vw, 30vw"
          />
        ) : null}
        <Screen project={project} className="wrk-st__screen" />
        <Head project={project} n={n} total={total} />
      </div>
    </section>
  );
}

export function LeaseFlowPlate({ project, n, total }: PlateProps) {
  return (
    <section
      id={project.slug}
      className="wrk-plate wrk-plate--lf"
      data-material="paper"
      data-station={project.title}
    >
      <div className="shell wrk-lf">
        <Head project={project} n={n} total={total} />
        <FlowTrack className="wrk-lf__flow" />
      </div>
    </section>
  );
}
