import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CTASection } from "@/components/Shared";
import { SceneMotion } from "@/components/pages/SceneMotion";
import { StageGauge } from "@/components/pages/StageGauge";
import { growthStages, services } from "@/lib/content";
import type { GrowthStage } from "@/lib/content";
/* Static imports so Next reads the real dimensions at build time and generates
   a blur placeholder per file — same handling the homepage plates get. */
import routeMapping from "@/public/assets/illustrations/route-mapping.webp";
import interfaceAssembly from "@/public/assets/illustrations/interface-assembly.webp";
import connectedAutomation from "@/public/assets/illustrations/connected-automation.webp";
import growthCurve from "@/public/assets/illustrations/growth-curve.webp";
import {
  absoluteUrl,
  breadcrumbSchema,
  graph,
  jsonLd,
  pageMetadata,
  webPageSchema,
} from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Services",
  description:
    "Marketing, websites, software, automation, analytics, and cloud infrastructure connected as one system by a Calgary studio.",
  path: "/services",
  eyebrow: "Connected capabilities",
  cardTitle: "One partner across the entire digital system.",
});

const schema = graph(
  webPageSchema({
    type: "CollectionPage",
    name: "Services",
    description:
      "The four stages of the Arctos offer: attract, convert, operate, and scale.",
    path: "/services",
  }),
  breadcrumbSchema([{ name: "Services", path: "/services" }]),
  {
    "@type": "ItemList",
    name: "Arctos Launchpad services",
    numberOfItems: services.length,
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: service.title,
      url: absoluteUrl(`/services/${service.slug}`),
    })),
  },
);

/** The sentence that sits under each stage name on its canvas. */
const stageLine: Record<GrowthStage, string> = {
  attract: "Be found by the right people.",
  convert: "Turn attention into action.",
  operate: "Remove the work that slows growth.",
  scale: "Know what is working, and improve it.",
};

/**
 * One field-guide plate per stage.
 *
 * Chosen by what each drawing actually depicts, not by what is unused: the
 * stage names are abstract, and the plate is the only thing on the panel that
 * shows the work rather than naming it.
 *
 *   attract  — a single node picked out of a constellation. The stage is
 *              "reach the RIGHT people"; the drawing is selection, not volume.
 *   convert  — the interface being assembled panel by panel. This stage is
 *              literally website strategy, landing pages, and UX/UI.
 *   operate  — two gears meshed into one drive. This stage is workflow
 *              automation, CRM, and integration; the drawing is that sentence.
 *   scale    — a rising line plotted point by point against an axis. This
 *              stage is measurement and continuous improvement.
 *
 * The same four plates carry the same four ideas on the homepage. That is the
 * point — a reader arriving here from the homepage should recognise them.
 */
const stagePlate: Record<
  GrowthStage,
  { src: typeof routeMapping; alt: string }
> = {
  attract: {
    src: routeMapping,
    alt: "The Arctos bear picking one lit node out of a constellation of connected points.",
  },
  convert: {
    src: interfaceAssembly,
    alt: "The Arctos bear assembling an interface panel by panel.",
  },
  operate: {
    src: connectedAutomation,
    alt: "The Arctos bear meshing two gears into one automated drive.",
  },
  scale: {
    src: growthCurve,
    alt: "The Arctos bear plotting a rising curve point by point against an axis.",
  },
};

const byStage = (id: GrowthStage) =>
  services.filter((service) => service.group === id);

/**
 * Band widths are proportioned by how much of the offer each stage holds, so
 * the gauge reports the real shape of the practice rather than four equal
 * quarters. A floor of 1fr keeps the smallest band legible.
 */
const bandWidths = growthStages
  .map((stage) => `minmax(0, ${Math.max(byStage(stage.id).length, 1)}fr)`)
  .join(" ");

const stageIds = growthStages.map((stage) => stage.id);

export default function ServicesPage() {
  return (
    <div className="interior-document" data-motion="staged">
      <SceneMotion />
      <section
        className="section services-open reveal"
        data-material="instrument"
        data-station="Services"
      >
        <div className="shell services-open__inner">
          <div className="services-open__lede">
            <p className="route-open__overline">Connected capabilities</p>
            <h1 className="route-open__title services-open__title">
              One partner across the whole growth system.
            </h1>
            <p className="route-open__intro">
              Marketing creates demand. Digital experiences turn it into action.
              Software, automation, and reporting keep the operation moving.
            </p>
          </div>

          <nav className="stage-gauge" aria-label="Service stages">
            <div
              className="stage-gauge__scale"
              style={{ "--bands": bandWidths } as React.CSSProperties}
            >
              {growthStages.map((stage) => (
                <Link
                  key={stage.id}
                  className="stage-gauge__band"
                  href={`#${stage.id}`}
                  data-stage={stage.id}
                  data-chapter={stage.id}
                >
                  <span className="stage-gauge__n">{stage.index}</span>
                  <span>
                    <span className="stage-gauge__name">{stage.title}</span>
                    {/* The count alone said how many but never what. Naming the
                        services is what makes the gauge a summary of the offer
                        rather than a set of four labelled doors. */}
                    <span className="stage-gauge__summary">
                      {byStage(stage.id)
                        .map((service) => service.title)
                        .join(" · ")}
                    </span>
                    <span className="stage-gauge__count">
                      {byStage(stage.id).length} services
                    </span>
                  </span>
                </Link>
              ))}
            </div>
            <p className="stage-gauge__span">
              <span>First contact</span>
              <span>Continuous improvement</span>
            </p>
          </nav>
        </div>
        <StageGauge stages={stageIds} />
      </section>

      {/* Four held canvases. The collage holds full-viewport while the service
          ledger rises over it as an instrument panel — the two materials the
          brand is made of, staged rather than described. */}
      {growthStages.map((stage, index) => (
        <section
          key={stage.id}
          id={stage.id}
          className={`scene scene--${stage.id} reveal`}
          data-material="paper"
          data-chapter={stage.id}
          data-station={stage.title}
        >
          <div className="scene__hold">
            <div className="scene__canvas">
              <Image
                src={`/assets/chapters/${stage.id}.webp`}
                alt=""
                fill
                priority={index === 0}
                sizes="100vw"
              />
            </div>
            <div className="scene__scrim" aria-hidden="true" />
          </div>

          {/* A sibling of the hold, never a child: the mark pulls itself up
              over the held backdrop with a negative margin, and inside the
              hold that margin is clipped away by its `overflow: hidden`. */}
          <div className="shell scene__shell">
            <div className="scene__mark">
              <p className="scene__folio">
                <span>{stage.index}</span>
                <span>Stage {index + 1} of 4</span>
              </p>
              {/* The stage name carries the mega scale. One word set into the
                  collage's clear field is the chapter; a whole sentence at
                  that size just becomes a wall. */}
              <h2 className="scene__title">{stage.title}</h2>
              <p className="scene__lead">{stageLine[stage.id]}</p>
            </div>
          </div>

          <div className="scene__panel" data-material="instrument">
            <div className="shell">
              <div className="chapter-panel__head">
                <p>{stage.title} — what it covers</p>
                <p className="chapter-panel__problem">{stage.problem}</p>
                <figure
                  className="field-figure chapter-panel__plate"
                  data-wipe
                >
                  <Image
                    src={stagePlate[stage.id].src}
                    alt={stagePlate[stage.id].alt}
                    placeholder="blur"
                    sizes="(max-width: 900px) 40vw, 15vw"
                  />
                </figure>
              </div>

              <ol className="atlas-services">
                {byStage(stage.id).map((service, i) => (
                  <li
                    key={service.slug}
                    className="atlas-services__item"
                    style={{ "--i": i } as React.CSSProperties}
                  >
                    <Link
                      className="atlas-services__link"
                      href={`/services/${service.slug}`}
                    >
                      <span className="atlas-services__number">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="atlas-services__title">
                        {service.title}
                      </span>
                      <span className="atlas-services__summary">
                        {service.summary}
                      </span>
                      <span
                        className="atlas-services__arrow"
                        aria-hidden="true"
                      >
                        ↗
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>

              <div className="atlas-chapter__outcomes">
                <p>What changes</p>
                <div className="atlas-chapter__bracket" aria-hidden="true" />
                <ul>
                  {stage.outcomes.map((outcome) => (
                    <li key={outcome}>{outcome}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      ))}

      <CTASection
        title="Find the first useful move."
        body="We will map the customer and operational journey, then begin where the change can create momentum fastest."
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(schema)}
      />
    </div>
  );
}
