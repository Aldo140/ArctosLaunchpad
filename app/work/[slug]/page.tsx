import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectReel } from "@/components/figures/ProjectReel";
import { SpecimenStrip } from "@/components/figures/SpecimenStrip";
import { CTASection, PageHeader } from "@/components/Shared";
import { getProject, projects } from "@/lib/content";
import {
  absoluteUrl,
  breadcrumbSchema,
  graph,
  jsonLd,
  ORGANIZATION_ID,
  pageMetadata,
  webPageSchema,
} from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};

  return pageMetadata({
    title: project.title,
    description: project.summary,
    path: project.route,
    eyebrow: project.statusLabel,
  });
}

const STORY = [
  ["Challenge", "What needed to change", "challenge"],
  ["Approach", "How the problem was framed", "approach"],
  ["Solution", "What took shape", "solution"],
] as const;

export default async function ProjectPage({ params }: Props) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  const index = projects.findIndex(({ slug }) => slug === project.slug);
  const next = projects[(index + 1) % projects.length];
  const caseNumber = String(index + 1).padStart(2, "0");

  const host = project.externalUrl
    ? new URL(project.externalUrl).host.replace(/^www\./, "")
    : null;

  /* The gallery mixes two kinds of evidence. Interface captures are documents:
     they want width and a caption set beside them. Photography is material:
     it belongs in a measured specimen strip, where a phone snapshot reads as a
     sample rather than as a low-resolution hero. They are never interleaved. */
  const media = project.showcaseMedia ?? [];
  const captures = media.filter((m) => (m.layout ?? "wide") === "wide");
  const photographs = media.filter((m) => m.layout === "portrait");

  /* The CreativeWork is the built thing, so `url` points at the live project
     where one exists and `mainEntityOfPage` at this case file. Only facts that
     are in lib/content.ts appear here — no dates, budgets, or metrics. */
  const schema = graph(
    webPageSchema({
      name: `${project.title} — case file`,
      description: project.summary,
      path: project.route,
    }),
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
      ...(project.featuredImage
        ? { image: absoluteUrl(project.featuredImage) }
        : {}),
    },
  );

  return (
    <>
      <PageHeader
        eyebrow={project.statusLabel}
        title={project.title}
        intro={project.summary}
        folio={`Case file ${caseNumber}`}
        breadcrumbs={[
          { label: "Work", href: "/work" },
          { label: project.title, href: project.route },
        ]}
      />

      {/* The live build leads. No drawn browser frame around a real capture. */}
      {Boolean(project.reel ?? project.featuredImage) ? (
        <section
          className="section section--flush"
          data-material="instrument"
          data-station={project.reel ? "Live build" : "Interface"}
        >
          <div className="shell">
            <figure className="wk-live reveal">
              <figcaption className="wk-live__head">
                <span className="t-label">
                  {project.reel ? "Live build" : "Interface capture"}
                </span>
                <span className="t-folio">
                  {host ? `Recorded at ${host}` : "Interface capture"}
                </span>
              </figcaption>

              {project.reel ? (
                <ProjectReel
                  src={project.reel.src}
                  poster={project.reel.poster}
                  title={project.title}
                />
              ) : project.featuredImage ? (
                <Image
                  src={project.featuredImage}
                  alt={`${project.title} interface`}
                  width={1600}
                  height={1000}
                  sizes="(max-width: 900px) 100vw, 84vw"
                />
              ) : null}
            </figure>
          </div>
        </section>
      ) : null}

      {/* The register is data. It is set as a parts list, not as prose. */}
      <section
        className="section section--tight"
        data-material="instrument"
        data-station="Record"
      >
        <div className="shell">
          <div className="wk-spec__head reveal">
            <p className="tick-label">Record</p>
            <p className="t-folio">
              Case file {caseNumber} / {String(projects.length).padStart(2, "0")}
            </p>
          </div>

          <dl className="wk-spec reveal">
            <div className="wk-spec__col">
              <dt className="t-label">Status</dt>
              <dd>
                <ul className="wk-spec__list">
                  <li className="wk-spec__flag">{project.statusLabel}</li>
                </ul>
              </dd>
            </div>

            <div className="wk-spec__col">
              <dt className="t-label">Services</dt>
              <dd>
                <ul className="wk-spec__list">
                  {project.services.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </dd>
            </div>

            <div className="wk-spec__col">
              <dt className="t-label">Industries</dt>
              <dd>
                <ul className="wk-spec__list">
                  {project.industries.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </dd>
            </div>

            {project.technologies?.length ? (
              <div className="wk-spec__col">
                <dt className="t-label">Technology</dt>
                <dd>
                  <ul className="wk-spec__list">
                    {project.technologies.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            ) : null}

            {project.externalUrl && host ? (
              <div className="wk-spec__col">
                <dt className="t-label">Live at</dt>
                <dd>
                  <ul className="wk-spec__list">
                    <li>
                      <a
                        className="link"
                        href={project.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {host}
                        <span aria-hidden="true">↗</span>
                      </a>
                    </li>
                  </ul>
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      </section>

      {/* The reasoning is narrative, so it changes material. Paper, one column,
          read top to bottom, numbered because the order is the argument. */}
      <section className="section" data-material="paper" data-station="Reasoning">
        <div className="shell doc__split">
          <div className="doc__head">
            <p className="tick-label">Reasoning</p>
            <h2 className="t-title doc__title">
              Three moves, <em>in order.</em>
            </h2>
            <p className="t-body">
              Every project here starts as somebody&rsquo;s stuck process. This
              is the path from that to the build above.
            </p>
          </div>

          <ol className="route wk-arc">
            {STORY.map(([label, heading, key], i) => (
              <li key={key} className="route__stop reveal">
                <div className="route__marker" aria-hidden="true">
                  <span className="t-folio">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="route__line" />
                </div>
                <div className="route__body">
                  <p className="t-label">{label}</p>
                  <h3 className="wk-arc__title">{heading}</h3>
                  <p className="t-body wk-arc__copy">{project[key]}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {media.length ? (
        <section
          className="section"
          data-material="instrument"
          data-station="Evidence"
        >
          <div className="shell">
            <div className="proof__head reveal">
              <p className="tick-label">Field evidence</p>
              <h2 className="t-title">
                {project.proofTitle ?? "See the system in place."}
              </h2>
              {project.proofIntro ? (
                <p className="t-lead">{project.proofIntro}</p>
              ) : null}
            </div>

            {captures.length ? (
              <div className="wk-plates">
                {captures.map((item, i) => (
                  <figure key={item.src} className="wk-plate reveal">
                    <div className="wk-plate__frame">
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        sizes="(max-width: 900px) 100vw, 62vw"
                      />
                    </div>
                    <figcaption className="wk-plate__caption">
                      <span className="t-folio">
                        Plate {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{item.caption}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : null}

            {photographs.length ? (
              <div className="wk-photos reveal">
                <SpecimenStrip
                  title="Source photography"
                  items={photographs.map((item) => ({
                    src: item.src,
                    alt: item.alt,
                    caption: item.caption,
                  }))}
                  columns={Math.min(Math.max(photographs.length, 2), 4)}
                />
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section
        className="section section--tight"
        data-material="instrument"
        data-station="Next"
      >
        <div className="shell case__nav">
          {project.externalUrl ? (
            <a
              className="btn btn--ghost"
              href={project.externalUrl}
              target="_blank"
              rel="noreferrer"
            >
              Visit the live project
              <span className="btn__arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          ) : (
            <Link className="btn btn--ghost" href="/work">
              All case files
            </Link>
          )}
          {next ? (
            <Link className="wk-next" href={next.route}>
              <span className="t-folio wk-next__label">Next case file</span>
              <span className="wk-next__title">{next.title}</span>
              <span className="t-folio wk-next__status">
                {next.statusLabel}
              </span>
              <span className="wk-next__go" aria-hidden="true">
                →
              </span>
            </Link>
          ) : null}
        </div>
      </section>

      <CTASection
        title="Have a system that needs rethinking?"
        body="Tell us how the work happens today, where it gets stuck, and what a better experience needs to make possible."
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(schema)}
      />
    </>
  );
}
