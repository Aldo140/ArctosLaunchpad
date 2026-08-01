import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CTASection, PageHeader } from "@/components/Shared";
import { getIndustry, industries, services } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

type Stage = "attract" | "convert" | "operate" | "scale";

const STAGES: { id: Stage; label: string; note: string }[] = [
  { id: "attract", label: "Attract", note: "Being found and understood" },
  { id: "convert", label: "Convert", note: "Turning interest into contact" },
  { id: "operate", label: "Operate", note: "Running the work afterwards" },
  { id: "scale", label: "Scale", note: "Seeing what is actually happening" },
];

const stageFigures = {
  attract: {
    src: "/assets/illustrations/branching-growth.webp",
    alt: "A bear tending a branching system of connected growth channels.",
  },
  convert: {
    src: "/assets/illustrations/route-compass.webp",
    alt: "A bear using a compass to choose a route through connected paths.",
  },
  operate: {
    src: "/assets/illustrations/modular-blocks.webp",
    alt: "A bear assembling modular blocks into a connected operating system.",
  },
  scale: {
    src: "/assets/illustrations/growth-curve.webp",
    alt: "A bear tracing measured progress along a growth curve.",
  },
} as const;

/**
 * The signature turn: the closing clause of the industry's own headline drops
 * into the paper voice. Split at the final comma where the tail can stand on
 * its own, otherwise on the last three words.
 */
function turn(sentence: string): [string, string] {
  const comma = sentence.lastIndexOf(", ");
  if (comma > 0) {
    const tail = sentence.slice(comma + 2);
    if (tail.split(/\s+/).length >= 2) {
      return [sentence.slice(0, comma + 2), tail];
    }
  }
  const words = sentence.split(" ");
  const tail = words.slice(-3).join(" ");
  return [sentence.slice(0, sentence.length - tail.length), tail];
}

export function generateStaticParams() {
  return industries.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const industry = getIndustry((await params).slug);
  return industry
    ? {
        title: industry.title,
        description: industry.summary,
        alternates: { canonical: `/industries/${industry.slug}` },
      }
    : {};
}

export default async function IndustryPage({ params }: Props) {
  const industry = getIndustry((await params).slug);
  if (!industry) notFound();

  const position = industries.findIndex((i) => i.slug === industry.slug);
  const previous = industries[(position - 1 + industries.length) % industries.length];
  const next = industries[(position + 1) % industries.length];

  const related = services.filter((s) => industry.services.includes(s.slug));

  // Where this context's usual starting points actually sit on the growth arc.
  // The heaviest stage tints the page, so two industries with different mixes
  // do not arrive looking like the same document.
  const plotted = STAGES.map((stage) => ({
    ...stage,
    items: related.filter((s) => s.group === stage.id),
  }));
  const focus = plotted.reduce((best, stage) =>
    stage.items.length > best.items.length ? stage : best,
  );
  const leaders = plotted.filter((s) => s.items.length === focus.items.length);
  const reading =
    leaders.length === 1
      ? `The usual mix here concentrates in the ${focus.label.toLowerCase()} stage.`
      : `The usual mix here spreads across ${leaders.length} of the four stages.`;

  const [headlineHead, headlineTurn] = turn(industry.priorities[0] ?? industry.summary);
  const note = industry.priorities[1];

  return (
    <>
      <PageHeader
        eyebrow="Operating context"
        title={industry.title}
        intro={industry.summary}
        folio={`Context ${String(position + 1).padStart(2, "0")} / ${String(
          industries.length,
        ).padStart(2, "0")}`}
        chapter={focus.id}
        breadcrumbs={[
          { label: "Industries", href: "/industries" },
          { label: industry.title, href: `/industries/${industry.slug}` },
        ]}
      />

      {/* ---- intent, then the four recurring conditions ------------------ */}
      <section
        className="section"
        data-material="paper"
        data-chapter={focus.id}
        data-station="Intent"
      >
        <div className="shell context-open">
          <div className="context-open__statement reveal">
            <p className="tick-label">Intent</p>
            <h2 className="t-display context-open__headline">
              {headlineHead}
              <em>{headlineTurn}</em>
            </h2>
          </div>

          <figure className="context-open__figure reveal">
            <Image
              src={stageFigures[focus.id].src}
              alt={stageFigures[focus.id].alt}
              width={1254}
              height={1254}
              sizes="(max-width: 760px) 100vw, 36vw"
            />
            <figcaption className="t-folio">
              Context {String(position + 1).padStart(2, "0")} / usual center of
              gravity: {focus.label}
            </figcaption>
          </figure>

          <div className="context-open__friction">
            <p className="t-label reveal">
              Observed friction — the conditions that recur here
            </p>
            <ul className="quadrant">
              {industry.challenges.map((challenge, i) => (
                <li
                  key={challenge}
                  className="quadrant__cell reveal"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <span className="t-folio quadrant__n">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="quadrant__term">{challenge}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---- where the connected work lands on the growth arc ------------ */}
      <section
        className="section"
        data-material="instrument"
        data-station="Capabilities"
      >
        <div className="shell">
          <div className="doc__head reveal">
            <p className="tick-label">Connected capabilities</p>
            <h2 className="t-title">
              Common starting points, plotted where they land.
            </h2>
            <p className="t-body">
              Four stages, one arc. {reading} The final mix depends on the
              business, not on the category.
            </p>
          </div>

          <ol className="stageplot">
            {plotted.map((stage, i) => (
              <li
                key={stage.id}
                data-chapter={stage.id}
                className={`stageplot__col${stage.items.length ? "" : " is-empty"} reveal`}
                style={{ "--i": i } as React.CSSProperties}
              >
                <div className="stageplot__head">
                  <span className="t-folio stageplot__n">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="stageplot__name">{stage.label}</h3>
                  <p className="stageplot__note">{stage.note}</p>
                </div>

                {stage.items.length ? (
                  <ul className="stageplot__items">
                    {stage.items.map((service) => (
                      <li key={service.slug}>
                        <Link
                          className="stageplot__item"
                          href={`/services/${service.slug}`}
                        >
                          <span className="stageplot__item-title">
                            {service.title}
                          </span>
                          <span className="stageplot__item-summary">
                            {service.summary}
                          </span>
                          <span className="stageplot__item-go" aria-hidden="true">
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="stageplot__empty">
                    Not part of the usual starting mix here.
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- the caveat this context carries, then the way out ----------- */}
      <section className="section" data-material="paper" data-station="Note">
        <div className="shell">
          <div className="context-note reveal">
            <div className="context-note__head">
              <p className="tick-label">Note</p>
              <h2 className="t-paper context-note__title">
                No industry template.
              </h2>
            </div>
            <div className="context-note__body">
              {note ? <p className="t-quote context-note__pull">{note}</p> : null}
              <p className="t-body">
                We build around your actual customers, approvals, team,
                software, and reporting needs.
              </p>
              <Link className="link" href="/process">
                See how discovery works
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <nav className="context-nav" aria-label="Other operating contexts">
            <Link className="context-nav__side" href={`/industries/${previous.slug}`}>
              <span className="t-label">Previous</span>
              <span className="context-nav__name">
                <span aria-hidden="true">← </span>
                {previous.title}
              </span>
            </Link>
            <Link className="context-nav__index t-folio" href="/industries">
              All {industries.length} contexts
            </Link>
            <Link
              className="context-nav__side context-nav__side--next"
              href={`/industries/${next.slug}`}
            >
              <span className="t-label">Next</span>
              <span className="context-nav__name">
                {next.title}
                <span aria-hidden="true"> →</span>
              </span>
            </Link>
          </nav>
        </div>
      </section>

      <CTASection
        title={`What needs to work better in your ${industry.title.toLowerCase()} organization?`}
        body="Tell us where customers, staff, information, or follow-up are getting stuck."
      />
    </>
  );
}
