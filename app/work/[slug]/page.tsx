import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProjectBySlug, portfolioOrder, projects } from "@/lib/content";
import {
  ORGANIZATION_ID,
  absoluteUrl,
  breadcrumbSchema,
  graph,
  pageMetadata,
  webPageSchema,
} from "@/lib/seo";
import { Crumbs, JsonLd, StartBand } from "@/components/site/Page";
import { Nudge } from "@/components/site/Nudge";
import { needForServices } from "@/lib/content";
import { Lines, Status, TextLink, d } from "@/components/site/ui";
import { CaseMotion } from "@/components/site/case/CaseMotion";
import { Filmstrip } from "@/components/site/case/Filmstrip";
import { NextProject } from "@/components/site/case/NextProject";
import { LeaseFlowFigure, ReportFlowFigure } from "@/components/site/case/figures";
import { FrameMedia, chapterFrames, framesUsed, projectShots, reelCaption } from "@/components/site/case/frames";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProjectBySlug((await params).slug);
  if (!project) return {};
  return pageMetadata({
    title: project.title,
    description: project.summary,
    path: project.route,
    eyebrow: project.statusLabel,
    cardTitle: project.proofTitle ?? project.title,
  });
}

/** Words as separate spans so they can light up as they are read. */
function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(/\s+/).map((word, i) => (
        <span key={i} className="cx-w">
          {word}{" "}
        </span>
      ))}
    </>
  );
}

export default async function CaseStudy({ params }: Props) {
  const project = getProjectBySlug((await params).slug);
  if (!project) notFound();

  const order = portfolioOrder as readonly string[];
  const next = getProjectBySlug(order[(order.indexOf(project.slug) + 1) % order.length]);
  const demo = project.status !== "launched" && project.status !== "internal-tool";
  const need = needForServices(project.services);
  const accent = project.accent ?? "var(--ink-3)";

  const chapters = [
    ["The challenge", project.challenge],
    ["The constraint", project.constraint],
    ["The approach", project.approach],
    ["What we built", project.solution],
  ] as const;

  const frames = chapterFrames(project);
  const { photos, screens } = projectShots(project);
  const allShots = [...photos, ...screens];
  const used = framesUsed(frames);
  const unused = allShots.filter((s) => !used.has(s.src));
  const film = unused.length >= 3 ? unused : allShots;
  const filmCredit =
    project.caseMediaCredit ??
    (photos.length ? `From ${project.client ?? project.title}’s own photography` : `From the ${project.title} build`);
  const poster = project.reel?.poster ?? project.featuredImage;
  const figure = project.mockupType === "dashboard" ? "report" : "flow";

  const schema = graph(
    webPageSchema({ name: `${project.title} — case study`, description: project.summary, path: project.route }),
    breadcrumbSchema([
      { name: "Work", path: "/work" },
      { name: project.title, path: project.route },
    ]),
    {
      "@type": "CreativeWork",
      name: project.title,
      description: project.summary,
      abstract: project.challenge,
      creator: { "@id": ORGANIZATION_ID },
      url: project.externalUrl ?? absoluteUrl(project.route),
      mainEntityOfPage: absoluteUrl(project.route),
      keywords: [...project.services, ...project.industries].join(", "),
      inLanguage: "en-CA",
      ...(project.client ? { about: { "@type": "Organization", name: project.client } } : {}),
      ...(project.featuredImage ? { image: absoluteUrl(project.featuredImage) } : {}),
    },
  );

  return (
    <article key={project.slug} className="cx" style={{ "--plate": accent } as CSSProperties}>
      <CaseMotion key={project.slug} />

      {/* ---- Title card ------------------------------------------------ */}
      <section className="cx-hero tone-ink" data-tone="ink">
        <div className="wrap">
          <Crumbs
            trail={[
              { label: "Work", href: "/work" },
              { label: project.title, href: project.route },
            ]}
          />
          <div className="cx-hero__grid">
            <div className="cx-hero__main">
              <div className="cx-hero__status" data-reveal>
                <Status project={project} />
                <span className="mono cx-hero__no">
                  Case {String(order.indexOf(project.slug) + 1).padStart(2, "0")} / {String(order.length).padStart(2, "0")}
                </span>
              </div>
              <Lines as="h1" className="display cx-hero__title" lines={[project.title]} />
              {project.proofTitle ? (
                <p className="cx-hero__kicker" data-reveal style={d(2)}>
                  {project.proofTitle}
                </p>
              ) : null}
            </div>
            <div className="cx-hero__side">
              <p className="lead cx-hero__lead" data-reveal style={d(3)}>
                {project.summary}
              </p>
              <dl className="cx-facts" data-reveal="fade" style={d(4)}>
                {project.client ? (
                  <div>
                    <dt>Client</dt>
                    <dd>{project.client}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Status</dt>
                  <dd>{project.statusLabel}</dd>
                </div>
                <div>
                  <dt>What we did</dt>
                  <dd>{project.services.join(", ")}</dd>
                </div>
                {project.technologies?.length ? (
                  <div>
                    <dt>Built with</dt>
                    <dd>{project.technologies.join(" · ")}</dd>
                  </div>
                ) : null}
                {project.externalUrl ? (
                  <div>
                    <dt>See it live</dt>
                    <dd>
                      <TextLink href={project.externalUrl}>
                        {project.externalUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                      </TextLink>
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ---- The reel: framed stage → full bleed ----------------------- */}
      <section className="cx-reel tone-ink" data-tone="ink" aria-label={poster ? reelCaption(project) : "How it works"}>
        <div className="cx-reel__wash" aria-hidden="true" />
        <div className="cx-reel__stage" data-reveal="scale">
          <div className={`cx-reel__frame${poster ? "" : " cx-reel__frame--figure"}`}>
            <div className="cx-reel__inner">
              {poster ? (
                <>
                  <Image className="cx-reel__poster" src={poster} alt="" width={1280} height={682} sizes="100vw" priority />
                  {project.reel ? (
                    <video data-reel muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1}>
                      <source src={project.reel.src} type="video/webm" />
                    </video>
                  ) : null}
                </>
              ) : figure === "report" ? (
                <ReportFlowFigure step={3} caption={false} />
              ) : (
                <LeaseFlowFigure step={3} caption={false} />
              )}
            </div>
          </div>
          <div className="cx-reel__shade" aria-hidden="true" />
          {project.phone ? (
            <div className="cx-reel__phone phone" aria-hidden="true">
              <Image src={project.phone} alt="" width={390} height={844} sizes="260px" priority />
            </div>
          ) : null}
          <p className="mono cx-reel__cap">
            <span className="cx-reel__dot" aria-hidden="true" />
            {poster
              ? `${reelCaption(project)}${project.phone ? " · phone capture of the same build" : ""}`
              : figure === "report"
                ? "Diagram of the internal report’s structure · every figure withheld"
                : "Diagram of the working demo’s flow · not a screenshot"}
          </p>
        </div>
      </section>

      {/* ---- The story: four chapters, one sticky frame --------------- */}
      <section className="cx-story tone-paper" data-tone="paper" aria-labelledby="cx-story-title">
        <div className="wrap cx-story__grid">
          <h2 id="cx-story-title" className="visually-hidden">
            The story
          </h2>
          <div className="cx-story__media" data-active="0">
            <div className="cx-story__frames">
              {frames.map((f, i) => (
                <div key={i} className="cx-story__frame" data-i={i}>
                  <FrameMedia frame={f} sizes="(max-width: 1023px) 92vw, 52vw" />
                </div>
              ))}
            </div>
            <ol className="cx-story__ticks">
              {chapters.map(([label], i) => (
                <li key={label} data-i={i}>
                  <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="cx-story__text">
            <span className="cx-story__rail" aria-hidden="true">
              <span className="cx-story__fill" />
            </span>
            {chapters.map(([label, text], i) => (
              <div key={label} className="cx-ch">
                <div className="cx-ch__media">
                  <FrameMedia frame={frames[i]} sizes="92vw" />
                </div>
                <div className="cx-ch__card">
                  <span className="cx-ch__num display" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="cx-ch__label">
                    <span className="index">{String(i + 1).padStart(2, "0")}</span>
                    {label}
                  </p>
                  <p className="cx-ch__text cx-kinetic">
                    <Words text={text} />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- What changed ---------------------------------------------- */}
      <section className="cx-changed tone-pine" data-tone="pine" aria-labelledby="cx-changed-title">
        <span className="cx-changed__big display" aria-hidden="true">
          {demo ? "So far" : "After"}
        </span>
        <div className="wrap cx-changed__grid">
          <div className="cx-changed__head">
            <p className="eyebrow">
              <span className="index">05</span> {demo ? "Where it stands" : "What changed"}
            </p>
            <h2 id="cx-changed-title" className="visually-hidden">
              {demo ? "Where it stands" : "What changed"}
            </h2>
            <span className="cx-changed__rule" aria-hidden="true" />
          </div>
          <p className="cx-changed__text cx-kinetic">
            <Words text={project.whatChanged} />
          </p>
          <div className="cx-changed__foot" data-reveal>
            <Status project={project} />
            <ul className="tagcloud">
              {project.industries.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
            {project.externalUrl ? <TextLink href={project.externalUrl}>Visit the {demo ? "preview" : "live site"}</TextLink> : null}
          </div>
        </div>
        <div className="wrap">
          <Nudge
            ask="Is something like this slowing your business down?"
            label="Talk about your project"
            href={`/contact?need=${need}`}
            from="case-study"
          />
        </div>
      </section>

      {/* ---- The project's own media, on film -------------------------- */}
      {film.length >= 2 ? (
        <Filmstrip shots={film} credit={filmCredit} title={photos.length ? "The work, frame by frame" : "Frames from the build"} />
      ) : null}

      {next ? (
        <NextProject
          href={next.route}
          title={next.title}
          summary={next.summary}
          status={next.statusLabel}
          accent={next.accent ?? "#1c3438"}
          image={next.reel?.poster ?? next.featuredImage}
        />
      ) : null}

      <StartBand title={["Have something", <>like <em key="t">this</em> in mind?</>]} need={need} />
      <JsonLd data={schema} />
    </article>
  );
}
