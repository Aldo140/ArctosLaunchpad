import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CTASection } from "@/components/CTASection";
import { ProjectReel } from "@/components/figures/ProjectReel";
import { ReportArtifact } from "@/components/figures/ReportArtifact";
import { FlowTrack } from "@/components/work/FlowTrack";
import { hostOf, isDemoStatus, pad, workOrder } from "@/components/work/order";
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

const OPENING = [
  ["Challenge", "What needed to change", "challenge"],
  ["Approach", "How the problem was framed", "approach"],
  ["Solution", "What took shape", "solution"],
] as const;

export default async function ProjectPage({ params }: Props) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  const index = workOrder.findIndex(({ slug }) => slug === project.slug);
  const next = workOrder[(index + 1) % workOrder.length];
  const caseNumber = pad(index + 1);
  const total = pad(workOrder.length);
  const host = hostOf(project.externalUrl);
  const demo = isDemoStatus(project);

  const media = project.showcaseMedia ?? [];
  const captures = media.filter((m) => (m.layout ?? "wide") === "wide");
  const photographs = media.filter((m) => m.layout === "portrait");

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
      ...(project.client
        ? { about: { "@type": "Organization", name: project.client } }
        : {}),
      ...(project.featuredImage
        ? { image: absoluteUrl(project.featuredImage) }
        : {}),
    },
  );

  const fifthLabel = demo ? "Status and what it proves" : "What changed";
  const fifthHeading = demo ? "What the demo proves" : "What changed";

  const register: [string, string[]][] = [
    ["Services", project.services],
    ["Industries", project.industries],
    ...(project.technologies?.length
      ? ([["Technology", project.technologies]] as [string, string[]][])
      : []),
  ];

  return (
    <>
      <section
        className="wrk-cf"
        data-material="instrument"
        data-station={project.title}
      >
        <div className="shell">
          <nav className="wrk-crumbs t-folio" aria-label="Breadcrumb">
            <Link href="/work">Work</Link>
            <span aria-hidden="true">/</span>
            <span>
              Case file {caseNumber} of {total}
            </span>
          </nav>

          <h1 className="wrk-cf__title">{project.title}</h1>

          <div className="wrk-cf__lede">
            <p className="wrk-cf__sum">{project.summary}</p>
            <div className="wrk-cf__aside">
              <p className="wrk-flag wrk-flag--lg">{project.statusLabel}</p>
              {project.externalUrl && host ? (
                <a
                  className="wrk-live"
                  href={project.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="t-folio">Live site</span>
                  <span className="wrk-live__host">
                    {host}
                    <span aria-hidden="true"> ↗</span>
                  </span>
                </a>
              ) : (
                <p className="wrk-live wrk-live--none t-folio">
                  {project.status === "working-demo"
                    ? "Working demo. Not publicly deployed."
                    : "Internal tool. Not public."}
                </p>
              )}
            </div>
          </div>

          <div className="wrk-cf__visual">
            {project.slug === "fresh-prep-event-intelligence" ? (
              <div className="wrk-cf__report">
                <ReportArtifact caption="Structure of a live Fresh Prep report. Figures withheld; the layout is the real one." />
              </div>
            ) : project.reel ? (
              <figure className="wrk-screen wrk-screen--hero">
                <div className="wrk-screen__frame">
                  <ProjectReel
                    src={project.reel.src}
                    poster={project.reel.poster}
                    title={project.title}
                  />
                </div>
                <figcaption className="wrk-cap t-folio">
                  Recorded from the live build{host ? `, ${host}` : ""}
                </figcaption>
              </figure>
            ) : project.status === "working-demo" ? (
              <FlowTrack />
            ) : null}
          </div>
        </div>
      </section>

      {captures.length || photographs.length ? (
        <section
          className="wrk-ev"
          data-material="instrument"
          data-station="Evidence"
        >
          <div className="shell">
            <header className="wrk-ev__head">
              <p className="t-label">Field evidence</p>
              <h2 className="wrk-ev__title">
                {project.proofTitle ?? "See the system in place."}
              </h2>
              {project.proofIntro ? (
                <p className="wrk-ev__intro">{project.proofIntro}</p>
              ) : null}
            </header>

            {captures.map((item, i) => (
              <figure key={item.src} className="wrk-ev__plate">
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={1600}
                  height={1000}
                  sizes="(max-width: 900px) 100vw, 1200px"
                />
                <figcaption className="wrk-cap t-folio">
                  <span>Plate {pad(i + 1)}</span>
                  <span>{item.caption}</span>
                </figcaption>
              </figure>
            ))}

            {photographs.length ? (
              <ul
                className="wrk-ev__photos"
                style={{ "--n": photographs.length } as React.CSSProperties}
              >
                {photographs.map((item, i) => (
                  <li key={item.src}>
                    <div className="wrk-still wrk-still--tall">
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        sizes="(max-width: 700px) 80vw, 30vw"
                        style={{ objectPosition: "78% 56%" }}
                      />
                    </div>
                    <p className="wrk-cap t-folio">
                      <span>{pad(i + 1)}</span>
                      <span>{item.caption}</span>
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ) : null}

      <section
        className="wrk-arg"
        data-material="paper"
        data-station="Reasoning"
      >
        <div className="shell">
          <p className="t-label wrk-arg__eyebrow">The argument, in order</p>
          <ol className="wrk-arg__list">
            {OPENING.map(([label, heading, key], i) => (
              <li key={key} className="wrk-arg__row">
                <span className="wrk-arg__n" aria-hidden="true">
                  {pad(i + 1)}
                </span>
                <div className="wrk-arg__label">
                  <p className="t-label">{label}</p>
                  <h2 className="wrk-arg__h">{heading}</h2>
                </div>
                <p className="wrk-arg__copy">{project[key]}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="wrk-pull wrk-pull--constraint"
        data-material="instrument"
        data-station="Constraint"
      >
        <div className="shell">
          <p className="wrk-pull__label t-label">
            <span aria-hidden="true">04</span> Constraint
          </p>
          <h2 className="wrk-pull__h">What made it hard</h2>
          <blockquote className="wrk-pull__q">{project.constraint}</blockquote>
        </div>
      </section>

      <section
        className="wrk-pull wrk-pull--changed"
        data-material="paper"
        data-station={fifthHeading}
      >
        <div className="shell">
          <p className="wrk-pull__label t-label">
            <span aria-hidden="true">05</span> {fifthLabel}
          </p>
          <h2 className="wrk-pull__h">{fifthHeading}</h2>
          <blockquote className="wrk-pull__q">{project.whatChanged}</blockquote>

          <dl className="wrk-reg">
            {register.map(([name, items]) => (
              <div key={name} className="wrk-reg__col">
                <dt className="t-label">{name}</dt>
                <dd>
                  <ul>
                    {items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        className="wrk-next"
        data-material="instrument"
        data-station="Next case file"
      >
        <div className="shell">
          <Link className="wrk-next__link" href={next.route}>
            <span className="t-label">
              Next case file · {pad(workOrder.indexOf(next) + 1)} of {total}
            </span>
            <span className="wrk-next__title">{next.title}</span>
            <span className="wrk-next__foot">
              <span className="t-folio">{next.statusLabel}</span>
              <span className="wrk-next__go" aria-hidden="true">
                →
              </span>
            </span>
          </Link>
          <Link className="wrk-next__all t-folio" href="/work">
            All case files
          </Link>
        </div>
      </section>

      <CTASection />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(schema)}
      />
    </>
  );
}
