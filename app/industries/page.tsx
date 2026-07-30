import type { Metadata } from "next";
import Link from "next/link";
import { CTASection, PageHeader } from "@/components/Shared";
import { industries, services } from "@/lib/content";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "Digital systems shaped around the operational realities of healthcare, manufacturing, construction, real estate, nonprofits, and professional services.",
  alternates: { canonical: "/industries" },
};

const STAGES = [
  { id: "attract", label: "Attract" },
  { id: "convert", label: "Convert" },
  { id: "operate", label: "Operate" },
  { id: "scale", label: "Scale" },
] as const;

/** Column codes for the coverage table. Short enough to keep the grid legible. */
const CODES: Record<string, string> = {
  "seo-ai-search": "SEO",
  "paid-media-lead-generation": "MEDIA",
  "web-design-development": "WEB",
  "branding-content": "BRAND",
  "business-automation": "AUTO",
  "custom-software": "SOFT",
  "crm-integrations": "CRM",
  "analytics-reporting": "DATA",
};

/**
 * The coverage table is built from the index itself: one column per capability
 * that actually appears in an industry's relevant-services list, ordered by the
 * growth stage it belongs to. Nothing here is asserted — it is the shape of
 * lib/content.ts, drawn.
 */
const columns = STAGES.flatMap((stage) =>
  services
    .filter((s) => s.group === stage.id && CODES[s.slug])
    .map((s) => ({
      slug: s.slug,
      title: s.title,
      code: CODES[s.slug] as string,
      stage: stage.id,
      count: industries.filter((i) => i.services.includes(s.slug)).length,
    })),
);

const groups = STAGES.map((stage) => ({
  ...stage,
  span: columns.filter((c) => c.stage === stage.id).length,
})).filter((g) => g.span > 0);

const recurring = [...columns].sort((a, b) => b.count - a.count)[0];

export default function IndustriesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Operating context"
        title="Systems shaped around the way your industry works."
        intro="A useful system starts with operating reality: how customers choose, how work is approved, what information must be protected, and where delays accumulate."
        folio={`${industries.length} contexts / ${columns.length} capabilities`}
        breadcrumbs={[{ label: "Industries", href: "/industries" }]}
      />

      {/* ---- the cross-reference, printed -------------------------------- */}
      <section className="section" data-material="paper" data-station="Coverage">
        <div className="shell">
          <div className="doc__head reveal">
            <p className="tick-label">Coverage</p>
            <h2 className="t-title">
              Ten contexts, and the capabilities that{" "}
              <em>recur across them.</em>
            </h2>
            <p className="t-body">
              Read across a row to see the usual starting points for a context.
              Read down a column to see how often a capability turns up.
            </p>
          </div>

          <div className="matrix reveal">
            <p className="matrix__hint t-label">Table scrolls sideways</p>
            <div className="matrix__scroll">
              <table className="matrix__table">
                <caption className="visually-hidden">
                  Capabilities most often relevant to each operating context.
                </caption>
                <thead>
                  <tr>
                    <td className="matrix__corner" />
                    {groups.map((g) => (
                      <th
                        key={g.id}
                        scope="colgroup"
                        colSpan={g.span}
                        data-chapter={g.id}
                        className="matrix__group"
                      >
                        {g.label}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    <td className="matrix__corner">
                      <span className="t-label">Context</span>
                    </td>
                    {columns.map((c) => (
                      <th
                        key={c.slug}
                        scope="col"
                        data-chapter={c.stage}
                        className="matrix__code"
                      >
                        <abbr title={c.title}>{c.code}</abbr>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {industries.map((industry, i) => (
                    <tr key={industry.slug} style={{ "--i": i } as React.CSSProperties}>
                      <th scope="row" className="matrix__context">
                        <Link href={`/industries/${industry.slug}`}>
                          <span className="t-folio matrix__n">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {industry.title}
                        </Link>
                      </th>
                      {columns.map((c) => {
                        const on = industry.services.includes(c.slug);
                        return (
                          <td
                            key={c.slug}
                            data-chapter={c.stage}
                            className={on ? "matrix__cell is-on" : "matrix__cell"}
                          >
                            <span className="visually-hidden">
                              {on ? `${c.title}: usual starting point` : `${c.title}: not typical`}
                            </span>
                            {on ? <i className="matrix__mark" aria-hidden="true" /> : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="matrix__foot">
              <p className="matrix__tally">
                {recurring.title} appears in {recurring.count} of the{" "}
                {industries.length} contexts listed here. That is a pattern in
                this index, not a recommendation for your organization.
              </p>
              <ul className="matrix__legend">
                {columns.map((c) => (
                  <li key={c.slug} data-chapter={c.stage}>
                    <span className="matrix__legend-code">{c.code}</span>
                    <Link className="link" href={`/services/${c.slug}`}>
                      {c.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---- the index proper -------------------------------------------- */}
      <section className="section" data-material="instrument" data-station="Index">
        <div className="shell">
          <div className="doc__head reveal">
            <p className="tick-label">Index</p>
            <h2 className="t-title">Different constraints. A connected method.</h2>
            <p className="t-body">
              These pages describe common operating conditions, not a claim that
              every organization faces the same problem.
            </p>
          </div>

          <div className="contexts__legend" aria-hidden="true">
            <span className="t-label">No.</span>
            <span className="t-label">Operating context</span>
            <span className="t-label">Recurring friction</span>
            <span />
          </div>

          <ol className="contexts">
            {industries.map((industry, i) => (
              <li
                key={industry.slug}
                className="contexts__row reveal"
                style={{ "--i": i } as React.CSSProperties}
              >
                <Link href={`/industries/${industry.slug}`}>
                  <span className="t-folio contexts__n">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="contexts__main">
                    <span className="contexts__name">{industry.title}</span>
                    <span className="contexts__summary">{industry.summary}</span>
                  </span>
                  <span className="contexts__friction">
                    {industry.challenges.map((c) => (
                      <span key={c}>{c}</span>
                    ))}
                  </span>
                  <span className="contexts__go" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="section"
        data-material="paper"
        data-chapter="scale"
        data-station="Margin note"
      >
        <div className="shell context-note reveal">
          <div className="context-note__head">
            <p className="tick-label">Margin note</p>
            <h2 className="t-paper context-note__title">
              Your industry matters. Your workflow matters more.
            </h2>
          </div>
          <div className="context-note__body">
            <p className="t-quote context-note__pull">
              Industry knowledge gives us a useful starting point. Discovery
              still follows the actual customer journey, team structure,
              software, compliance needs, and business model in front of us.
            </p>
            <p className="t-body">
              None of these ten pages assumes completed work in that category.
              They describe operating conditions we know how to read.
            </p>
            <Link className="link" href="/process">
              See how discovery works
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <CTASection
        title="Show us how the work really moves."
        body="Bring the process, constraints, and tools you have today. We will map where a better system can create leverage."
      />
    </>
  );
}
