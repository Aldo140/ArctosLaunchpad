import Link from "next/link";
import { getServicePageBySlug, servicePages } from "@/lib/content/services";
import { OfferMotion } from "@/components/home/v2/offer/OfferMotion";

type Row = { slug: string; deliverable: string };

/* Titles and routes come from the service records so a renamed or removed
   service can never leave a dead link here. The deliverables are written in
   concrete nouns and stay inside what each record already claims. */
const REPORTING: Row[] = [
  {
    slug: "analytics-reporting",
    deliverable:
      "A dashboard fed by your platforms, and reports that assemble themselves.",
  },
  {
    slug: "crm-integrations",
    deliverable:
      "A sync that keeps forms, CRM records and follow-up telling the same story.",
  },
  {
    slug: "custom-software",
    deliverable:
      "A portal or internal tool for the part no off-the-shelf product covers.",
  },
];

const MANUAL: Row[] = [
  {
    slug: "business-automation",
    deliverable:
      "An intake form that writes to the CRM. Approvals that route themselves.",
  },
  {
    slug: "ai-product-development",
    deliverable:
      "Drafting, sorting and summarising handled by AI, with a person reviewing.",
  },
  {
    slug: "app-software-development",
    deliverable: "The web or mobile app, when nothing off the shelf fits.",
  },
];

const FRONT: Row[] = [
  {
    slug: "web-design-development",
    deliverable: "A site built around the one action you need taken.",
  },
  {
    slug: "seo-ai-search",
    deliverable: "Pages that search engines and AI answers can find and read.",
  },
  {
    slug: "paid-media-lead-generation",
    deliverable: "Campaigns tied to a landing page, a form and the report.",
  },
  {
    slug: "branding-content",
    deliverable: "An identity and copy that say it plainly.",
  },
];

function resolve(rows: Row[]) {
  return rows.flatMap((r) => {
    const s = getServicePageBySlug(r.slug);
    return s ? [{ ...r, title: s.title, route: s.route }] : [];
  });
}

const ArrowGlyph = () => (
  <span className="ofr-of__go" aria-hidden="true">
    →
  </span>
);

/**
 * Slot 5. What we build, reframed around what this client actually buys. Three
 * offers, three different compositions on purpose: a numeral and a ledger, a
 * printed plate, and a drawn diagram. Never three equal cards.
 */
export function OfferV2() {
  const reporting = resolve(REPORTING);
  const manual = resolve(MANUAL);
  const front = resolve(FRONT);

  return (
    <section
      className="section ofr-of"
      data-material="instrument"
      data-station="Services"
      data-ofr="offer"
      aria-labelledby="ofr-of-title"
    >
      <OfferMotion scope="offer" />
      <div className="shell">
        <header className="ofr-of__head reveal">
          <p className="tick-label">What we build</p>
          <h2 id="ofr-of-title" className="ofr-of__title">
            Three things we build.
          </h2>
          <p className="ofr-of__lede">
            Start with the one that hurts. They connect, so the next one costs
            less than the first.
          </p>
        </header>

        {/* 1 — numeral + ledger */}
        <article className="ofr-of__one reveal" aria-labelledby="ofr-of-1">
          <span className="ofr-of__numeral" aria-hidden="true">
            1
          </span>
          <div className="ofr-of__one-body">
            <h3 id="ofr-of-1" className="ofr-of__h">
              Reporting that runs itself
            </h3>
            <p className="ofr-of__pain">
              Every campaign ends with someone rebuilding the same report by
              hand.
            </p>
            <ul className="ofr-of__ledger">
              {reporting.map((r) => (
                <li key={r.slug}>
                  <Link href={r.route} className="ofr-of__row">
                    <span className="ofr-of__row-title">{r.title}</span>
                    <span className="ofr-of__row-text">{r.deliverable}</span>
                    <ArrowGlyph />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </div>

      {/* 2 — printed plate, full bleed */}
      <article
        className="ofr-of__plate reveal"
        aria-labelledby="ofr-of-2"
        data-material="paper"
        data-chapter="operate"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="ofr-of__plate-img"
          src="/assets/chapters/operate.webp"
          alt=""
          loading="lazy"
          decoding="async"
        />
        <div className="shell ofr-of__plate-shell">
          <div className="ofr-of__plate-copy">
            <span className="ofr-of__plate-no" aria-hidden="true">
              02
            </span>
            <h3 id="ofr-of-2" className="ofr-of__h">
              The manual steps, gone
            </h3>
            <p className="ofr-of__pain">
              Work moves by email, copy, paste and someone remembering.
            </p>
            <ul className="ofr-of__ledger">
              {manual.map((r) => (
                <li key={r.slug}>
                  <Link href={r.route} className="ofr-of__row">
                    <span className="ofr-of__row-title">{r.title}</span>
                    <span className="ofr-of__row-text">{r.deliverable}</span>
                    <ArrowGlyph />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>

      <div className="shell">
        {/* 3 — drawn diagram */}
        <article className="ofr-of__three reveal" aria-labelledby="ofr-of-3">
          <div className="ofr-of__three-head">
            <span className="ofr-of__numeral ofr-of__numeral--sm" aria-hidden="true">
              3
            </span>
            <div>
              <h3 id="ofr-of-3" className="ofr-of__h">
                A front door that feeds it
              </h3>
              <p className="ofr-of__pain">
                Leads arrive, and nobody can say which campaign they came from.
              </p>
            </div>
          </div>

          <div className="ofr-of__diagram">
            <ul className="ofr-of__sources">
              {front.map((r) => (
                <li key={r.slug}>
                  <Link href={r.route} className="ofr-of__src">
                    <span className="ofr-of__src-dot" aria-hidden="true" />
                    <span className="ofr-of__row-title">{r.title}</span>
                    <span className="ofr-of__row-text">{r.deliverable}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <svg
              className="ofr-of__routes"
              viewBox="0 0 144 440"
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
            >
              {[55, 165, 275, 385].map((y) => (
                <path
                  key={y}
                  className="ofr-of__route"
                  pathLength={1}
                  d={`M0 ${y} C 80 ${y}, 64 220, 144 220`}
                />
              ))}
            </svg>

            <div className="ofr-of__intake" aria-hidden="true">
              <span className="t-label">One intake</span>
              <ol>
                <li>Form</li>
                <li>CRM record</li>
                <li>The report</li>
              </ol>
            </div>
          </div>
        </article>

        <p className="ofr-of__all">
          <Link href="/services" className="link">
            All {servicePages.length} capabilities
            <span aria-hidden="true">→</span>
          </Link>
        </p>
      </div>
    </section>
  );
}
