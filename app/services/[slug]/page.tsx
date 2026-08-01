import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CTASection, PageHeader } from "@/components/Shared";
import {
  getService,
  getServicePageBySlug,
  projects,
  services,
} from "@/lib/content";
import {
  breadcrumbSchema,
  faqPageSchema,
  graph,
  jsonLd,
  pageMetadata,
  serviceSchema,
  webPageSchema,
} from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

const seq = (i: number) => ({ "--i": i }) as CSSProperties;
const pad = (n: number) => String(n).padStart(2, "0");

const stageFigures = {
  attract: {
    src: "/assets/illustrations/branching-growth.webp",
    alt: "A bear tending a branching system of connected growth channels.",
  },
  convert: {
    src: "/assets/illustrations/interface-assembly.webp",
    alt: "A bear assembling the parts of a digital interface.",
  },
  operate: {
    src: "/assets/illustrations/connected-automation.webp",
    alt: "A bear connecting gears into one automated operating system.",
  },
  scale: {
    src: "/assets/illustrations/growth-curve.webp",
    alt: "A bear tracing measured progress along a growth curve.",
  },
} as const;

export function generateStaticParams() {
  return services.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const sheet = getServicePageBySlug((await params).slug);
  if (!sheet) return {};

  /* `metaDescription` is written for the search result; `summary` is written
     for the page. Prefer the former and keep the latter as the fallback. */
  return pageMetadata({
    title: sheet.title,
    description: sheet.metaDescription || sheet.summary,
    path: sheet.route,
    eyebrow: `${sheet.stage} service`,
    cardTitle: sheet.headline,
    cardDescription: sheet.summary,
  });
}

/**
 * A service sheet reads as a sequence of six different instruments, not six
 * printings of "heading, list":
 *
 *   Diagnostic  instrument   the fault list, hung to the right, marked minus
 *   Scope       paper        a ruled index with the capability count as a plate
 *   Method      instrument   a stair — each step steps in, sequence made visible
 *   Outcomes    paper        the diagnostic mirrored: left, light, marked plus
 *   Evidence    instrument   the archive, under a measured band
 *   Questions   paper        a centred column of notes
 *
 * Diagnostic and outcomes are deliberately the same grid run backwards: the
 * problem is dark and right-hung, the result is light and left-hung.
 */
export default async function ServiceDetailPage({ params }: Props) {
  const slug = (await params).slug;
  const service = getService(slug);
  const sheet = getServicePageBySlug(slug);
  if (!service || !sheet) notFound();

  const related = projects.filter((p) => service.relatedWork.includes(p.slug));
  const stage = service.group;
  const stageName = `${stage.charAt(0).toUpperCase()}${stage.slice(1)}`;
  const stageFigure = stageFigures[stage];

  /* Service, the FAQs that are actually rendered below, and the crumb trail
     exactly as `PageHeader` prints it. Nothing asserted that is not on-screen. */
  const schema = graph(
    webPageSchema({
      name: sheet.title,
      description: sheet.metaDescription || sheet.summary,
      path: sheet.route,
    }),
    serviceSchema({
      name: sheet.title,
      description: sheet.summary,
      path: sheet.route,
    }),
    faqPageSchema(sheet.faq),
    breadcrumbSchema([
      { name: "Services", path: "/services" },
      { name: sheet.title, path: sheet.route },
    ]),
  );

  return (
    <>
      <PageHeader
        eyebrow={`${stageName} service`}
        title={service.headline}
        intro={service.summary}
        chapter={stage}
        breadcrumbs={[
          { label: "Services", href: "/services" },
          { label: service.title, href: `/services/${service.slug}` },
        ]}
        aside={
          <dl className="svc-spec reveal">
            <div className="svc-spec__item">
              <dt className="t-label">Stage</dt>
              <dd>
                <Link className="link" href={`/services#${stage}`}>
                  {stageName}
                </Link>
              </dd>
            </div>
            <div className="svc-spec__item">
              <dt className="t-label">Capabilities</dt>
              <dd>{pad(service.capabilities.length)}</dd>
            </div>
            <div className="svc-spec__item">
              <dt className="t-label">Method</dt>
              <dd>{service.process.length} steps</dd>
            </div>
            <div className="svc-spec__item">
              <dt className="t-label">Related work</dt>
              <dd>{pad(related.length)}</dd>
            </div>
          </dl>
        }
      />

      {/* ── Diagnostic — the fault list ───────────────────────────────── */}
      <section
        className="section svc-balance svc-balance--fault"
        data-material="instrument"
        data-chapter={stage}
        data-station="Diagnostic"
      >
        <div className="shell svc-balance__inner">
          <div className="svc-balance__head reveal">
            <p className="tick-label">Diagnostic</p>
            <h2 className="t-title svc-balance__title">
              What this usually looks like <em>before we start.</em>
            </h2>
            <p className="t-body">{sheet.problem}</p>
          </div>

          <ul className="svc-balance__list svc-seq">
            {service.problem.map((item, i) => (
              <li key={item} className="reveal" style={seq(i)}>
                <span className="svc-balance__sign" aria-hidden="true" />
                <span className="svc-balance__text">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Scope — the ruled index ───────────────────────────────────── */}
      <section
        className="section svc-scope"
        data-material="paper"
        data-chapter={stage}
        data-station="Scope"
      >
        <div className="shell">
          <div className="svc-scope__head">
            <p className="svc-scope__count reveal" aria-hidden="true">
              {pad(service.capabilities.length)}
            </p>
            <div className="svc-scope__copy reveal">
              <p className="tick-label">Scope sheet</p>
              <h2 className="t-title">What we build</h2>
              <p className="t-body">
                Focused capabilities assembled around the way your team already
                works.
              </p>
            </div>
            <figure className="svc-scope__figure reveal">
              <Image
                src={stageFigure.src}
                alt={stageFigure.alt}
                width={1254}
                height={1254}
                sizes="(max-width: 760px) 100vw, 28vw"
              />
              <figcaption className="t-folio">
                {stageName} / working plate
              </figcaption>
            </figure>
          </div>

          <ol className="svc-scope__list svc-seq">
            {service.capabilities.map((item, i) => (
              <li key={item} className="reveal" style={seq(i)}>
                <span className="t-folio svc-scope__n">{pad(i + 1)}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Method — the stair ────────────────────────────────────────── */}
      <section
        className="section svc-method"
        data-material="instrument"
        data-chapter={stage}
        data-station="Method"
      >
        <div className="shell">
          <div className="svc-method__head reveal">
            <p className="tick-label">Method</p>
            <h2 className="t-title svc-method__title">
              A practical route from friction to <em>a working system.</em>
            </h2>
          </div>

          <ol className="svc-stair svc-seq">
            {service.process.map((step, i) => (
              <li key={step} className="svc-stair__step reveal" style={seq(i)}>
                <span className="t-folio svc-stair__n">{pad(i + 1)}</span>
                <span className="svc-stair__label">{step}</span>
                <span className="svc-stair__drop" aria-hidden="true" />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Outcomes — the diagnostic, mirrored ───────────────────────── */}
      <section
        className="section svc-balance svc-balance--gain"
        data-material="paper"
        data-chapter={stage}
        data-station="Outcomes"
      >
        <div className="shell svc-balance__inner">
          <div className="svc-balance__head reveal">
            <p className="tick-label">Outcomes</p>
            <h2 className="t-title svc-balance__title">
              And what it looks like <em>once it is working.</em>
            </h2>
            {sheet.reassurance ? (
              <p className="t-quote svc-balance__note">{sheet.reassurance}</p>
            ) : null}
          </div>

          <ul className="svc-balance__list svc-seq">
            {service.outcomes.map((item, i) => (
              <li key={item} className="reveal" style={seq(i)}>
                <span className="svc-balance__sign" aria-hidden="true" />
                <span className="svc-balance__text">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Evidence ──────────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section
          className="section svc-evidence"
          data-material="instrument"
          data-chapter={stage}
          data-station="Evidence"
        >
          <div className="shell">
            <div className="svc-band reveal">
              <p className="tick-label">Evidence</p>
              <h2 className="svc-band__title">Related work</h2>
              <p className="t-folio">
                {pad(related.length)} {related.length === 1 ? "file" : "files"}
              </p>
            </div>

            <ul className="archive archive--compact">
              {related.map((project, i) => (
                <li key={project.slug} className="archive__row reveal">
                  <Link href={project.route} className="archive__link">
                    <span className="t-folio archive__n">{pad(i + 1)}</span>
                    <span className="archive__text">
                      <span className="archive__title">{project.title}</span>
                      <span className="archive__summary">{project.summary}</span>
                    </span>
                    <span className="archive__status t-folio">
                      {project.statusLabel}
                    </span>
                    <span className="archive__go" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Questions — a centred column of notes ─────────────────────── */}
      <section
        className="section svc-notes"
        data-material="paper"
        data-chapter={stage}
        data-station="Questions"
      >
        <div className="shell svc-notes__inner">
          <div className="svc-notes__head reveal">
            <p className="tick-label">Notes and answers</p>
            <h2 className="t-paper svc-notes__title">Questions worth asking</h2>
          </div>

          <div className="faq svc-notes__list reveal">
            {service.faqs.map((faq, i) => (
              <details key={faq.q} className="faq__item">
                <summary>
                  <span className="t-folio svc-notes__q">Q{pad(i + 1)}</span>
                  <span className="svc-notes__ask">{faq.q}</span>
                  <span className="faq__sign" aria-hidden="true" />
                </summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Build the right system, not more busywork."
        body={`Tell us what is getting in the way. We will help determine whether ${service.title.toLowerCase()} is the right place to start.`}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(schema)}
      />
    </>
  );
}
