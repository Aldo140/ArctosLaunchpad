import Link from "next/link";
import Image from "next/image";
import { CTASection, PageHeader } from "@/components/Shared";
import { getService, projects, type Project } from "@/lib/content";

/**
 * Shared template for the Calgary landing pages.
 *
 * These three routes exist for local search, so they have to earn the visit
 * with real substance rather than a keyword-stuffed variant of the service
 * page. Each gets its own audit list and its own proof project; everything else
 * comes from the service record so the two never drift apart.
 */
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
  const service = getService(serviceSlug);
  const proof: Project | undefined =
    projects.find((p) => p.slug === proofSlug) ?? projects[0];

  return (
    <>
      <PageHeader
        eyebrow="Calgary, Alberta"
        title={title}
        intro={intro}
        breadcrumbs={[{ label: title, href: canonical }]}
      />

      <section className="section" data-material="instrument" data-station="Thesis">
        <div className="shell doc__aside reveal">
          <p className="t-body">{thesis.lead}</p>
          <h2 className="t-display doc__aside-title">{thesis.punch}</h2>
        </div>
      </section>

      <section className="section" data-material="paper" data-chapter="convert" data-station="Audit">
        <div className="shell doc__split">
          <div className="doc__head reveal">
            <p className="tick-label">Audit sheet</p>
            <h2 className="t-title">{auditTitle}</h2>
            <p className="t-body">
              The work is useful when it solves a specific commercial or
              operational problem — not because the current one looks dated.
            </p>
          </div>
          <ol className="numbered reveal">
            {audit.map((item, i) => (
              <li key={item}>
                <span className="t-folio">{String(i + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {service && (
        <section className="section" data-material="instrument" data-station="Scope">
          <div className="shell">
            <div className="doc__head reveal">
              <p className="tick-label">Connected scope</p>
              <h2 className="t-title">
                Strategy, experience, and the system behind it.
              </h2>
            </div>
            <ul className="chips chips--large reveal">
              {service.capabilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="reveal doc__outcomes">
              <Link className="link" href={`/services/${service.slug}`}>
                Explore {service.title.toLowerCase()}
                <span aria-hidden="true">→</span>
              </Link>
            </p>
          </div>
        </section>
      )}

      {proof && (
        <section className="section" data-material="instrument" data-station="Proof">
          <div className="shell local__proof">
            <div className="reveal">
              <p className="tick-label">A different shape for every brief</p>
              <h2 className="t-title">{proof.title}</h2>
              <p className="t-body">{proof.summary}</p>
              <Link className="link" href={proof.route}>
                View project
                <span aria-hidden="true">→</span>
              </Link>
            </div>
            {proof.featuredImage && (
              <div className="local__proof-media reveal">
                <Image
                  src={proof.featuredImage}
                  alt={`${proof.title} interface`}
                  width={1400}
                  height={880}
                  sizes="(max-width: 900px) 100vw, 50vw"
                />
              </div>
            )}
          </div>
        </section>
      )}

      <section className="section" data-material="instrument" data-station="Local">
        <div className="shell doc__split">
          <div className="doc__head reveal">
            <p className="tick-label">Working locally</p>
            <h2 className="t-title">Calgary context without the agency theatre.</h2>
          </div>
          <div className="doc__cols reveal">
            <p className="t-body">
              Work directly with a studio that can connect the public website to
              lead routing, automation, reporting, and the software your team
              already uses.
            </p>
            <p className="t-body">
              In-person collaboration is available when the work benefits from
              it. Remote delivery keeps the process efficient when it does not.
            </p>
          </div>
        </div>
      </section>

      <CTASection title={ctaTitle} body={ctaBody} />
    </>
  );
}
