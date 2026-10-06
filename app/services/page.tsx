import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  getProjectBySlug,
  getServicePageBySlug,
  growthStages,
  islands,
  type Project,
  type ServicePage,
} from "@/lib/content";
import {
  breadcrumbSchema,
  graph,
  pageMetadata,
  webPageSchema,
} from "@/lib/seo";
import { JsonLd, StartBand } from "@/components/site/Page";
import {
  Btn,
  Lines,
  Status,
  TextLink,
  d,
  statusTone,
} from "@/components/site/ui";
import {
  ServicesMap,
  type MapIsland,
} from "@/components/site/services/ServicesMap";
import { IslandNav } from "@/components/site/services/IslandNav";
import {
  ServiceExplorer,
  type ExplorerService,
} from "@/components/site/services/ServiceExplorer";
import { ServicesFx } from "@/components/site/services/ServicesFx";

export const metadata: Metadata = pageMetadata({
  title: "Web Design, Software & Automation Services | Arctos Launchpad",
  absoluteTitle: true,
  description:
    "Websites, search and paid media to win customers; automation, integrations and custom software to run the work; dashboards and reporting to see the numbers.",
  path: "/services",
  cardTitle: "Three islands. One bridge.",
});

const TONES = ["bone", "ink", "pine"] as const;

/** Stage names, for the chapter eyebrow ("Attract + Convert"). */
const stageTitle = (id: string) =>
  growthStages.find((s) => s.id === id)?.title ?? id;

/** The bridge deck between chapters, in a 1440×300 box. Win → Run crosses left to right, Run → See back. */
/** The chapter scenes, from the approved illustration family. */
const CHAPTER_ART = {
  win: "/assets/art/growth-gateway.webp",
  run: "/assets/art/workflow-loop.webp",
  see: "/assets/art/reporting-observatory.webp",
} as const;

/** The same decks redrawn for a portrait screen (390×170), so they stay thick on phones. */
const SPANS_NARROW = [
  "M -20 28 C 90 28 160 50 195 85 S 300 142 410 138",
  "M 410 28 C 300 28 230 50 195 85 S 90 142 -20 138",
];

const SPANS = [
  "M -40 40 C 300 40 520 80 720 150 S 1160 270 1480 262",
  "M 1480 40 C 1140 40 920 80 720 150 S 280 270 -40 262",
];

function servicesFor(slugs: string[]) {
  return slugs
    .map(getServicePageBySlug)
    .filter((s): s is ServicePage => Boolean(s));
}

function explorerData(service: ServicePage): ExplorerService {
  const related = service.relatedProjects
    .map(getProjectBySlug)
    .filter((p): p is Project => Boolean(p));
  const project = related.find((p) => p.featuredImage) ?? related[0];
  return {
    slug: service.slug,
    route: service.route,
    title: service.title,
    summary: service.summary,
    capabilities: service.capabilities,
    project: project
      ? {
          title: project.title,
          image: project.featuredImage,
          statusLabel: project.statusLabel,
          tone: statusTone(project),
          accent: project.accent,
        }
      : undefined,
  };
}

export default function ServicesPage() {
  const mapIslands: MapIsland[] = islands.map((island) => ({
    id: island.id,
    index: island.index,
    name: island.name,
    symptom: island.symptom,
    promise: island.promise,
    services: servicesFor(island.serviceSlugs).map((s) => s.shortTitle),
  }));

  return (
    <div className="svx">
      <ServicesMap islands={mapIslands} />

      <div className="svx-chapters">
        {islands.map((island, i) => {
          const tone = TONES[i];
          const services = servicesFor(island.serviceSlugs);
          const stages = growthStages.filter((stage) =>
            island.stages.includes(stage.id),
          );
          const includes = stages.flatMap((stage) => stage.includes);
          const outcomes = stages.flatMap((stage) => stage.outcomes);
          const proof = island.proof
            .map(getProjectBySlug)
            .filter((p): p is Project => Boolean(p));

          return (
            <section
              key={island.id}
              id={island.id}
              className={`svx-ch svx-ch--${island.id} section tone-${tone}`}
              data-tone={tone}
              data-island={island.id}
              aria-labelledby={`${island.id}-title`}
            >
              <div className="svx-atmos" aria-hidden="true">
                <span className="svx-atmos__glow" />
                <span className="svx-atmos__num">
                  {island.index}
                </span>
                <svg
                  className="svx-atmos__lines"
                  viewBox="0 0 1440 900"
                  preserveAspectRatio="none"
                >
                  {island.id === "run"
                    ? [140, 260, 380, 500, 620, 740].map((y, n) => (
                        <path
                          key={y}
                          d={`M -20 ${y} C 360 ${y - 40} 1080 ${y + 40} 1460 ${y}`}
                          style={{ "--n": n } as CSSProperties}
                        />
                      ))
                    : island.id === "see"
                      ? [
                          ...[150, 300, 450, 600, 750].map((y) => (
                            <path key={`h${y}`} d={`M 0 ${y} H 1440`} />
                          )),
                          ...[180, 420, 660, 900, 1140].map((x) => (
                            <path key={`v${x}`} d={`M ${x} 0 V 900`} />
                          )),
                        ]
                      : [180, 300, 420].map((r) => (
                          <circle key={r} cx="1180" cy="120" r={r} />
                        ))}
                </svg>
              </div>

              <div className="wrap svx-ch__head">
                <div className="svx-art" data-svx-tilt aria-hidden="true">
                  <svg className="svx-art__ripples" viewBox="0 0 400 120">
                    <ellipse cx="200" cy="60" rx="190" ry="44" />
                    <ellipse cx="200" cy="60" rx="140" ry="32" />
                    <ellipse cx="200" cy="60" rx="90" ry="20" />
                  </svg>
                  <span className="svx-art__shadow" />
                  <div className="svx-art__float">
                    <Image
                      src={CHAPTER_ART[island.id]}
                      alt=""
                      width={1536}
                      height={1024}
                      sizes="(max-width: 900px) 120vw, 50vw"
                    />
                  </div>
                </div>

                <div className="svx-ch__intro">
                  <p className="eyebrow" data-reveal>
                    Island {island.index} ·{" "}
                    {island.stages.map(stageTitle).join(" + ")}
                  </p>
                  <h2
                    id={`${island.id}-title`}
                    className="h1 lines svx-ch__title"
                    data-reveal
                    tabIndex={-1}
                  >
                    <span className="ln">
                      <span>
                        <em>{island.name}.</em>
                      </span>
                    </span>
                  </h2>
                  <p className="svx-ch__symptom" data-reveal style={d(1)}>
                    {island.symptom}
                  </p>
                  <p className="lead svx-ch__promise" data-reveal style={d(2)}>
                    {island.promise}
                  </p>
                  <ul
                    className="svx-ch__symptoms"
                    data-reveal
                    style={d(3)}
                    aria-label="Sounds familiar"
                  >
                    {island.symptoms.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="wrap svx-ch__body">
                <div className="svx-ch__bar" data-reveal>
                  <p className="mono svx-label">
                    {services.length} services on this island
                  </p>
                  <p className="mono svx-ch__hint" aria-hidden="true">
                    Hover or focus a service to preview it
                  </p>
                </div>
                <ServiceExplorer
                  island={island.id}
                  services={services.map(explorerData)}
                />
              </div>

              <div className="wrap svx-ch__lower">
                <div data-reveal>
                  <p className="mono svx-label">What changes</p>
                  <ul className="svx-outcomes">
                    {outcomes.map((o) => (
                      <li key={o}>{o}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mono svx-label" data-reveal>
                    Everything on this island
                  </p>
                  <ul className="svx-tags" data-svx-tags>
                    {includes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {proof.length ? (
                <div className="wrap svx-proof">
                  <p className="mono svx-label" data-reveal>
                    Built on this island
                  </p>
                  <ul>
                    {proof.map((p, n) => (
                      <li key={p.slug} data-reveal style={d(n)}>
                        <Link href={p.route} className="svx-card">
                          <span
                            className={`svx-card__img${p.featuredImage ? "" : " svx-card__img--type"}`}
                            style={
                              {
                                "--plate": p.accent ?? "var(--ink-3)",
                              } as CSSProperties
                            }
                          >
                            {p.featuredImage ? (
                              <Image
                                src={p.featuredImage}
                                alt=""
                                width={1600}
                                height={852}
                                sizes="(max-width: 900px) 90vw, 28vw"
                              />
                            ) : (
                              <span
                                className="svx-card__type"
                                aria-hidden="true"
                              >
                                <span className="mono">{p.statusLabel}</span>
                                <span>No public screenshots</span>
                              </span>
                            )}
                          </span>
                          <span className="svx-card__text">
                            <span className="svx-card__title">{p.title}</span>
                            <Status project={p} />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <span className="svx-proof__bar" aria-hidden="true">
                    <i />
                  </span>
                </div>
              ) : null}

              <div className="wrap svx-ch__cta" data-reveal>
                <Btn href={`/contact?need=${island.need}`}>
                  Talk about {island.name.toLowerCase()}
                </Btn>
              </div>

              {i < islands.length - 1 ? (
                <div className={`svx-span svx-span--${i}`} aria-hidden="true">
                  <svg className="svx-span__wide" viewBox="0 0 1440 300" preserveAspectRatio="none">
                    <path className="svx-span__under" d={SPANS[i]} />
                    <path className="svx-span__deck" d={SPANS[i]} />
                    <path className="svx-span__edge" d={SPANS[i]} />
                    <circle className="svx-span__signal" r="9" cx="720" cy="150" />
                  </svg>
                  <svg className="svx-span__narrow" viewBox="0 0 390 170" preserveAspectRatio="none">
                    <path className="svx-span__under" d={SPANS_NARROW[i]} />
                    <path className="svx-span__deck" d={SPANS_NARROW[i]} />
                    <path className="svx-span__edge" d={SPANS_NARROW[i]} />
                    <circle className="svx-span__signal" r="7" cx="195" cy="85" />
                  </svg>
                  <span className="svx-span__label mono">
                    {island.index} → {islands[i + 1].index}
                  </span>
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      <IslandNav
        items={islands.map((island) => ({
          id: island.id,
          index: island.index,
          name: island.name,
          art: island.art.src,
        }))}
      />

      <section
        className="offer section--tight section tone-paper svx-offer"
        data-tone="paper"
      >
        <div className="wrap offer__grid">
          <div>
            <p className="eyebrow" data-reveal>
              A smaller first step
            </p>
            <Lines
              as="h2"
              className="h2"
              lines={["Send us the spreadsheet", <em key="d">you dread.</em>]}
            />
          </div>
          <div className="offer__side" data-reveal style={d(2)}>
            <p className="body">
              A free reporting teardown: one export, screenshot or description
              of how you report by hand. You get a one-screen mock of the report
              it should be and the first three steps we’d automate.
            </p>
            <TextLink href="/teardown">Get the free teardown</TextLink>
          </div>
        </div>
      </section>

      <StartBand
        title={["Not sure which", <em key="i">island?</em>]}
        body="Most projects touch more than one. Describe the problem in a sentence or two and we’ll work out where to start."
      />

      <ServicesFx />

      <JsonLd
        data={graph(
          webPageSchema({
            type: "CollectionPage",
            name: "Services",
            path: "/services",
            description: "Websites, software, automation and reporting.",
          }),
          breadcrumbSchema([{ name: "Services", path: "/services" }]),
        )}
      />
    </div>
  );
}
