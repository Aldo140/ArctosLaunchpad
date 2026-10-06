import Image from "next/image";
import Link from "next/link";
import { Fragment, type CSSProperties } from "react";
import {
  getIslandForStage,
  getProjectBySlug,
  getServicePageBySlug,
  projects,
} from "@/lib/content";
import { breadcrumbSchema, graph, serviceSchema, webPageSchema } from "@/lib/seo";
import { Crumbs, JsonLd, StartBand } from "@/components/site/Page";
import { ProjectPlate } from "@/components/site/ProjectPlate";
import { Btn, Lines, Status, TextLink, d } from "@/components/site/ui";
import { serviceArtwork } from "@/lib/brand-art";
import { DRAWINGS, ROUTE_END, SHEET, type LocalVariant } from "@/components/site/local/drawings";
import { LocalAudit } from "@/components/site/local/LocalAudit";
import { LocalMotion } from "@/components/site/local/LocalMotion";

/**
 * Shared template for the Calgary landing pages.
 *
 * These routes exist for local search, so each earns the visit with its own
 * drawing of the city, a self-check the visitor can actually use, and a real
 * proof project; everything else comes from the service record so the two
 * never drift apart.
 */

const VARIANTS: Record<string, { variant: LocalVariant; need: string; plate: string }> = {
  "web-design-development": { variant: "skyline", need: "website", plate: "Sheet 01 · Elevation" },
  "business-automation": { variant: "river", need: "automation", plate: "Sheet 02 · Plan" },
  "custom-software": { variant: "grid", need: "software", plate: "Sheet 03 · Grid" },
};

const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`;

export function LocalBrief({
  title,
  intro,
  thesis,
  auditTitle,
  audit,
  serviceSlug,
  proofSlug,
  canonical,
  ctaTitle,
  ctaBody,
}: {
  title: string;
  intro: string;
  thesis: { lead: string; punch: string };
  auditTitle: string;
  audit: string[];
  serviceSlug: string;
  proofSlug: string;
  canonical: string;
  ctaTitle: string;
  ctaBody: string;
}) {
  const service = getServicePageBySlug(serviceSlug);
  const proof = getProjectBySlug(proofSlug) ?? projects[0];
  const island = service ? getIslandForStage(service.stage) : undefined;
  const art = serviceArtwork(serviceSlug) ?? island?.art;
  const local = VARIANTS[serviceSlug] ?? { variant: "skyline", need: island?.need ?? "website", plate: "Sheet" };
  const drawing = DRAWINGS[local.variant];
  const need = local.need;
  const contact = `/contact?need=${need}`;
  const watch = proof.slug === "calgary-watch" ? undefined : getProjectBySlug("calgary-watch");
  const punchWords = thesis.punch.split(" ");

  return (
    <div className={`loc loc--${local.variant}`}>
      {/* ---------------------------------------------------------- hero */}
      <section className="loc-hero tone-bone" data-tone="bone">
        <div className="wrap loc-hero__grid">
          <div className="loc-hero__head">
            <Crumbs trail={[{ label: title, href: canonical }]} />
            <p className="eyebrow" data-reveal>
              Calgary, Alberta
            </p>
            <Lines as="h1" className="h1 loc-hero__title" lines={[title]} />
          </div>
          <div className="loc-hero__body">
            <p className="lead loc-hero__lead" data-reveal style={d(2)}>
              {intro}
            </p>
            <div className="actions" data-reveal style={d(3)}>
              <Btn href={contact}>Start a project</Btn>
              {service ? <TextLink href={service.route}>The full service</TextLink> : null}
            </div>
          </div>

          <div className="loc-sheet" aria-hidden="true">
            <div className="loc-sheet__map" data-depth="0.35">
              <svg className="loc-sheet__svg" viewBox={`0 0 ${SHEET.w} ${SHEET.h}`} preserveAspectRatio="xMidYMid meet">
                {drawing.svg}
                <g className="loc-mark" transform={`translate(${drawing.mark.x} ${drawing.mark.y})`}>
                  <circle r="16" className="loc-mark__ring" />
                  <path d="M-26 0 H-8 M8 0 H26 M0 -26 V-8 M0 8 V26" className="loc-mark__hair" />
                  <circle r="3.5" className="loc-mark__dot" />
                </g>
                {local.variant === "river" ? (
                  <g className="loc-signal">
                    <circle r="13" className="loc-signal__halo" />
                    <circle r="5.5" className="loc-signal__dot" />
                  </g>
                ) : null}
                {local.variant === "grid" ? (
                  <g className="loc-end" transform={`translate(${ROUTE_END.x} ${ROUTE_END.y})`}>
                    <circle r="14" className="loc-end__pulse" />
                    <circle r="6" className="loc-end__dot" />
                  </g>
                ) : null}
              </svg>
              {drawing.labels.map((l) => (
                <span
                  key={l.text}
                  className={`loc-label loc-label--${l.kind ?? "name"} loc-label--${l.align ?? "start"}`}
                  style={{ left: pct(l.x, SHEET.w), top: pct(l.y, SHEET.h) } as CSSProperties}
                  data-station-label={l.kind === "station" ? l.text : undefined}
                >
                  {l.text}
                </span>
              ))}
              <span className="loc-grat loc-grat--top">
                <span>114.09° W</span>
                <span>114.07° W</span>
                <span>114.05° W</span>
              </span>
              <span className="loc-grat loc-grat--side">
                <span>51.06°</span>
                <span>51.05°</span>
                <span>51.04°</span>
              </span>
              <span className="loc-crop loc-crop--tl" />
              <span className="loc-crop loc-crop--tr" />
              <span className="loc-crop loc-crop--bl" />
              <span className="loc-crop loc-crop--br" />
            </div>

            {art ? (
              <div
                className="loc-sheet__island"
                data-depth="1"
                style={
                  {
                    left: `${drawing.island.left}%`,
                    top: `${drawing.island.top}%`,
                    width: `${drawing.island.width}%`,
                  } as CSSProperties
                }
              >
                <span className="loc-sheet__shadow" />
                <div className="loc-sheet__float">
                  <Image
                    src={art.src}
                    alt=""
                    width={art.width}
                    height={art.height}
                    sizes="(max-width: 900px) 92vw, 40vw"
                    priority
                  />
                </div>
              </div>
            ) : null}

            <span
              className="loc-coord"
              data-depth="1.5"
              style={{ left: pct(drawing.mark.x, SHEET.w), top: pct(drawing.mark.y, SHEET.h) } as CSSProperties}
            >
              <b>51.05° N</b>
              <b>114.07° W</b>
            </span>
          </div>
        </div>
        <div className="wrap loc-hero__foot" aria-hidden="true">
          <span className="mono">{local.plate}</span>
          <span className="mono">{drawing.caption}</span>
        </div>
      </section>

      {/* -------------------------------------------------------- thesis */}
      <section className="loc-thesis section tone-pine" data-tone="pine" aria-label="Why it matters">
        <svg className="loc-thesis__topo" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" data-parallax="0.25">
          {Array.from({ length: 9 }, (_, n) => (
            <path
              key={n}
              d={`M-40 ${120 + n * 46} C240 ${60 + n * 50} 420 ${200 + n * 40} 720 ${140 + n * 46} S1180 ${60 + n * 52} 1480 ${150 + n * 44}`}
            />
          ))}
        </svg>
        <div className="wrap loc-thesis__inner">
          <p className="mono loc-thesis__meta" data-reveal>
            <span>51.05° N</span>
            <span aria-hidden="true">/</span>
            <span>114.07° W</span>
          </p>
          <p className="lead loc-thesis__lead" data-reveal>
            {thesis.lead}
          </p>
          <p className="loc-thesis__punch">
            {punchWords.map((w, i) => (
              <Fragment key={`${w}${i}`}>
                <span className="loc-w">{i === punchWords.length - 1 ? <em>{w}</em> : w}</span>
                {i < punchWords.length - 1 ? " " : null}
              </Fragment>
            ))}
          </p>
        </div>
      </section>

      {/* --------------------------------------------------------- audit */}
      <section className="loc-audit section tone-paper" data-tone="paper" aria-labelledby="audit">
        <LocalAudit title={auditTitle} items={audit} href={contact} />
      </section>

      {/* ---------------------------------------------------------- caps */}
      {service ? (
        <section className="loc-caps section tone-bone" data-tone="bone" aria-labelledby="included">
          <div className="wrap">
            <div className="loc-caps__head">
              <div>
                <p className="eyebrow" data-reveal>
                  {service.title}, from Calgary
                </p>
                <Lines as="h2" id="included" className="h1" lines={[service.headline]} />
              </div>
              <p className="body" data-reveal style={d(2)}>
                {service.summary}
              </p>
            </div>
            <ol className="loc-caps__grid">
              {service.capabilities.map((cap, i) => (
                <li key={cap} className="loc-cap">
                  <div className="loc-cap__face">
                    <span className="index">{String(i + 1).padStart(2, "0")}</span>
                    <span className="loc-cap__name">{cap}</span>
                    <span className="loc-cap__fold" aria-hidden="true" />
                  </div>
                </li>
              ))}
            </ol>
            <p className="loc-caps__more">
              <Link href={service.route} className="link">
                Process, fit and FAQs for {service.shortTitle.toLowerCase()}
                <span aria-hidden="true">→</span>
              </Link>
            </p>
          </div>
        </section>
      ) : null}

      {/* --------------------------------------------------------- proof */}
      <section className="loc-proof section tone-ink" data-tone="ink" aria-labelledby="local-proof">
        <div className="wrap loc-proof__grid">
          <div className="loc-proof__copy">
            <p className="eyebrow" data-reveal>
              Proof
            </p>
            <Lines as="h2" id="local-proof" className="h2" lines={["Built,", <em key="s">shipped, in use.</em>]} />
            <p className="body" data-reveal style={d(2)}>
              {proof.whatChanged}
            </p>
            <dl className="loc-proof__facts" data-reveal style={d(3)}>
              <div>
                <dt className="mono">Status</dt>
                <dd>
                  <Status project={proof} />
                </dd>
              </div>
              <div>
                <dt className="mono">The work</dt>
                <dd>{proof.services.join(" · ")}</dd>
              </div>
              {proof.technologies?.length ? (
                <div>
                  <dt className="mono">Built with</dt>
                  <dd>{proof.technologies.join(" · ")}</dd>
                </div>
              ) : null}
            </dl>
            <div className="loc-proof__links" data-reveal style={d(4)}>
              <TextLink href={proof.route}>Read the case study</TextLink>
              <TextLink href="/work">More work</TextLink>
            </div>
          </div>
          <div className="loc-proof__stage" data-reveal="fade" style={d(1)}>
            <div className="loc-proof__tilt">
              <ProjectPlate project={proof} sizes="(max-width: 900px) 92vw, 52vw" />
            </div>
          </div>
        </div>

        {watch ? (
          <div className="wrap">
            <Link href={watch.route} className="loc-home" data-reveal>
              <span className="loc-home__pin" aria-hidden="true">
                <span />
              </span>
              <span className="loc-home__text">
                <span className="mono loc-home__kicker">Closer to home</span>
                <span className="loc-home__title">
                  {watch.title}: {watch.summary.replace(/^A /, "a ")}
                </span>
              </span>
              <span className="loc-home__go" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        ) : null}
      </section>

      <StartBand title={[ctaTitle]} body={ctaBody} need={need} size="h1" />
      <LocalMotion variant={local.variant} />
      <JsonLd
        data={graph(
          webPageSchema({ name: title, description: intro, path: canonical }),
          ...(service ? [serviceSchema({ name: `${service.title} in Calgary`, description: intro, path: canonical })] : []),
          breadcrumbSchema([{ name: title, path: canonical }]),
        )}
      />
    </div>
  );
}
