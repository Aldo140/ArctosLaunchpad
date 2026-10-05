import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CTASection } from "@/components/Shared";
import { StageGauge } from "@/components/pages/StageGauge";
import { ServiceMotion } from "@/components/services/ServiceMotion";
import { OFFERS, resolveRows } from "@/components/services/offers";
import { growthStages, services } from "@/lib/content";
import type { GrowthStage } from "@/lib/content";
/* Static imports so Next reads the real dimensions at build time and generates
   a blur placeholder per file. */
import partnership from "@/public/assets/illustrations/connected-partnership.webp";
import growthCurve from "@/public/assets/illustrations/growth-curve.webp";
import connectedAutomation from "@/public/assets/illustrations/connected-automation.webp";
import interfaceAssembly from "@/public/assets/illustrations/interface-assembly.webp";
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
    "Reporting that runs itself, the manual steps gone, and a front door that feeds it: what a Calgary studio builds for businesses that run events, campaigns and production on repeat.",
  path: "/services",
  eyebrow: "What we build",
  cardTitle: "Most clients start with one of three.",
});

const schema = graph(
  webPageSchema({
    type: "CollectionPage",
    name: "Services",
    description:
      "Three places most clients start, and the four stages of the Arctos offer: attract, convert, operate, and scale.",
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

const idx = (i: number) => ({ "--i": i }) as CSSProperties;

const byStage = (id: GrowthStage) =>
  services.filter((service) => service.group === id);

const bandWidths = growthStages
  .map((stage) => `minmax(0, ${Math.max(byStage(stage.id).length, 1)}fr)`)
  .join(" ");
const stageIds = growthStages.map((stage) => stage.id);

const offers = OFFERS.map((offer) => ({
  ...offer,
  resolved: resolveRows(offer.rows),
}));

const plates = {
  reporting: {
    src: growthCurve,
    alt: "The Arctos bear plotting a rising curve point by point against an axis.",
  },
  manual: {
    src: connectedAutomation,
    alt: "The Arctos bear meshing two gears into one automated drive.",
  },
  front: {
    src: interfaceAssembly,
    alt: "The Arctos bear assembling an interface panel by panel.",
  },
} as const;

/** Where the clear paper field sits in each collage, so the type lands on it. */
const canvasX: Record<GrowthStage, string> = {
  attract: "62%",
  convert: "40%",
  operate: "56%",
  scale: "36%",
};

export default function ServicesPage() {
  return (
    <div className="interior-document" data-motion="staged">
      <ServiceMotion />

      {/* ── Open: who this is for, and the three doors ─────────────────── */}
      <section
        className="svc-hero"
        data-material="instrument"
        data-station="Services"
      >
        <Image
          className="svc-hero__art"
          src={partnership}
          alt=""
          priority
          sizes="(max-width: 860px) 130vw, 64vw"
          aria-hidden="true"
        />
        <div className="shell svc-hero__inner">
          <p className="tick-label">Services</p>
          <h1 className="svc-hero__title">
            Most clients start with <em>one of three.</em>
          </h1>
          <p className="svc-hero__lede">
            For businesses that run events, campaigns or production on repeat
            and still report on them by hand. Start with the one that hurts.
            The others connect to it, so the next costs less than the first.
          </p>
          <ol className="svc-hero__index">
            {offers.map((offer) => (
              <li key={offer.id}>
                <a href={`#offer-${offer.id}`} className="svc-hero__jump">
                  <span className="svc-hero__jump-n">{offer.n}</span>
                  <span className="svc-hero__jump-name">{offer.name}</span>
                  <span aria-hidden="true" className="svc-hero__jump-go">
                    ↓
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 1 · Reporting that runs itself — paper, numeral and ledger ──── */}
      {offers.map((offer, i) => {
        const plate = plates[offer.id];
        const material = i === 1 ? "instrument" : "paper";
        return (
          <section
            key={offer.id}
            id={`offer-${offer.id}`}
            className={`svc-offer svc-offer--${offer.id}`}
            data-material={material}
            data-chapter={offer.stage}
            data-station={offer.name}
          >
            <div className="shell svc-offer__inner">
              <div className="svc-offer__head">
                <p className="svc-offer__kicker">
                  <span className="svc-offer__n" aria-hidden="true">
                    {offer.n}
                  </span>
                  <span className="t-label">
                    {i === 0 ? "Most clients start here" : `Offer ${offer.n} of 3`}
                  </span>
                </p>
                <h2 className="svc-offer__title">{offer.name}</h2>
                <p className="svc-offer__pain">{offer.pain}</p>

                <p className="svc-offer__today-label t-label">
                  {offer.id === "manual" ? "Struck from the list" : "Sounds familiar"}
                </p>
                <ul
                  className="svc-offer__today"
                  data-svc-route={offer.id === "manual" ? "" : undefined}
                >
                  {offer.today.map((item) => (
                    <li key={item}>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <figure className="svc-offer__plate">
                <Image
                  src={plate.src}
                  alt={plate.alt}
                  placeholder="blur"
                  sizes="(max-width: 860px) 90vw, 36vw"
                  data-svc-drift=""
                />
              </figure>

              <ol
                className="svc-offer__rows"
                data-svc-route={offer.id === "front" ? "" : undefined}
              >
                {offer.resolved.map((row, r) => (
                  <li key={row.slug} style={idx(r)}>
                    <Link href={row.route} className="svc-offer__row">
                      <span className="svc-offer__row-n t-folio">
                        {String(r + 1).padStart(2, "0")}
                      </span>
                      <span className="svc-offer__row-title">{row.title}</span>
                      <span className="svc-offer__row-text">
                        {row.deliverable}
                      </span>
                      <span className="svc-offer__row-go" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>

              <p className="svc-offer__start">
                {offer.id === "reporting" ? (
                  <Link className="svc-offer__cta" href="/teardown">
                    Get a free reporting teardown
                    <span aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <Link
                    className="svc-offer__cta"
                    href={`/services/${offer.lead}`}
                  >
                    Start with {offer.resolved[0]?.title.toLowerCase()}
                    <span aria-hidden="true">→</span>
                  </Link>
                )}
              </p>
            </div>
          </section>
        );
      })}

      {/* ── Depth: the four stages, held shorter ───────────────────────── */}
      <section
        className="svc-atlas"
        data-material="instrument"
        data-station="All four stages"
      >
        <div className="shell svc-atlas__inner">
          <div className="svc-atlas__head">
            <p className="tick-label">Everything else, in order</p>
            <h2 className="svc-atlas__title">
              Thirteen services. One path from first visit to the report.
            </h2>
          </div>

          <nav className="stage-gauge" aria-label="Service stages">
            <div
              className="stage-gauge__scale"
              style={{ "--bands": bandWidths } as CSSProperties}
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
                    <span className="stage-gauge__summary">
                      {byStage(stage.id)
                        .map((service) => service.title)
                        .join(" · ")}
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

      {growthStages.map((stage, index) => (
        <section
          key={stage.id}
          id={stage.id}
          className={`svc-stage svc-stage--${stage.id}`}
          data-material="paper"
          data-chapter={stage.id}
          data-station={stage.title}
        >
          <div className="svc-stage__canvas" aria-hidden="true">
            <Image
              src={`/assets/chapters/${stage.id}.webp`}
              alt=""
              fill
              sizes="100vw"
              data-svc-drift=""
              style={{ "--cx": canvasX[stage.id] } as CSSProperties}
            />
          </div>
          <div className="shell svc-stage__inner">
            <div className="svc-stage__mark">
              <p className="svc-stage__folio">
                <span>{stage.index}</span>
                <span>Stage {index + 1} of 4</span>
              </p>
              <h2 className="svc-stage__title" data-svc-wipe="">
                {stage.title}
              </h2>
              <p className="svc-stage__statement">{stage.statement}</p>
              <p className="svc-stage__problem">{stage.problem}</p>
            </div>

            <div className="svc-stage__panel">
              <ol className="svc-stage__list">
                {byStage(stage.id).map((service, i) => (
                  <li key={service.slug} style={idx(i)}>
                    <Link
                      className="svc-stage__link"
                      href={`/services/${service.slug}`}
                    >
                      <span className="svc-stage__link-title">
                        {service.title}
                      </span>
                      <span className="svc-stage__link-text">
                        {service.summary}
                      </span>
                      <span className="svc-stage__link-go" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
              <ul className="svc-stage__changes" aria-label="What changes">
                {stage.outcomes.map((outcome) => (
                  <li key={outcome}>{outcome}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ))}

      <CTASection title="Not sure which one hurts most?" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(schema)}
      />
    </div>
  );
}
