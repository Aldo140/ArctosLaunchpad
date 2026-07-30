import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CTASection } from "@/components/Shared";
import { growthStages, whyArctos } from "@/lib/content";
import {
  breadcrumbSchema,
  graph,
  jsonLd,
  ORGANIZATION_ID,
  pageMetadata,
  webPageSchema,
} from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Studio",
  description:
    "Arctos Launchpad is a Calgary digital growth and technology studio connecting customer acquisition with business operations.",
  path: "/studio",
  eyebrow: "The studio",
  cardTitle: "Close the gap between how a business grows and how it runs.",
});

const schema = graph(
  {
    ...webPageSchema({
      type: "AboutPage",
      name: "Studio",
      description:
        "Who Arctos Launchpad is, where it works from, and how the practice is organized.",
      path: "/studio",
    }),
    mainEntity: { "@id": ORGANIZATION_ID },
  },
  breadcrumbSchema([{ name: "Studio", path: "/studio" }]),
);

export default function StudioPage() {
  return (
    <div className="interior-document" data-motion="staged">
      {/* The workspace itself, held full-bleed. Cropped left onto the leaf
          shadows and the lettered card — centred, the frame pulled in the
          mountain print on the right wall, and a mountain used as decoration
          is exactly what the imagery rules rule out. */}
      <section
        className="scene scene--studio reveal"
        data-material="paper"
        data-station="Studio"
      >
        <div className="scene__hold">
          <div className="scene__canvas">
            <Image
              src="/assets/studio/arctos-wall-materials.webp"
              alt="A studio wall with tactile material samples and a card reading Systems, Clarity, Growth"
              fill
              priority
              sizes="100vw"
            />
          </div>
          <div className="scene__scrim" aria-hidden="true" />
        </div>

        <div className="shell scene__shell">
          <div className="scene__mark">
            <p className="scene__folio">
              <span>A Calgary digital growth and technology studio</span>
            </p>
            <h1 className="scene__title scene__title--phrase">
              Close the gap <em>between</em> growing and running.
            </h1>
          </div>
        </div>

        <div className="scene__panel" data-material="instrument">
          <div className="shell">
            <dl className="studio-open__identity">
              <div>
                <dt>Practice</dt>
                <dd>Digital growth and technology</dd>
              </div>
              <div>
                <dt>Based in</dt>
                <dd>Calgary, Alberta</dd>
              </div>
              <div>
                <dt>Working with</dt>
                <dd>Organizations across Canada</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section
        className="section studio-position reveal"
        data-material="instrument"
        data-station="Position"
      >
        <div className="shell">
          <p className="studio-position__lead">
            Most agencies stop at the lead. Most software teams start after the
            real customer journey has already been decided.
          </p>

          {/* The position, dimensioned: two witness lines and the span between
              them, annotated with where the studio actually works. */}
          <div className="studio-gap">
            <p className="studio-gap__end">
              <span>Marketing ends</span>
              Attention without operational follow-through
            </p>

            <div className="studio-gap__span">
              <div className="studio-gap__rule" aria-hidden="true" />
              <p className="studio-gap__measure">
                We work in the <em>space between.</em>
              </p>
            </div>

            <p className="studio-gap__end studio-gap__end--right">
              <span>Software begins</span>
              Systems without customer context
            </p>
          </div>
        </div>
      </section>

      <section
        className="section studio-system reveal"
        data-material="paper"
        data-station="The system"
      >
        <div className="shell">
          <div className="studio-system__header">
            <p>How the work connects</p>
            <h2>Four disciplines become one growth system.</h2>
          </div>

          <div className="studio-system__chapters">
            {growthStages.map((stage) => (
              <Link
                key={stage.id}
                className="studio-system__chapter"
                href={`/services#${stage.id}`}
                data-chapter={stage.id}
              >
                <Image
                  src={`/assets/chapters/${stage.id}.webp`}
                  alt=""
                  fill
                  sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 24vw"
                />
                <span className="studio-system__chapter-number">
                  {stage.index}
                </span>
                <span className="studio-system__chapter-title">
                  {stage.title}
                </span>
                <span className="studio-system__chapter-copy">
                  {stage.statement}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        className="section studio-principles reveal"
        data-material="instrument"
        data-station="Principles"
      >
        <div className="shell">
          <div className="studio-principles__header">
            <p>Working principles</p>
            <h2>What stays true when the deadline gets real.</h2>
          </div>

          <ol className="studio-principles__field">
            {whyArctos.map((item, index) => (
              <li key={item.title} className="studio-principle">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CTASection
        title="Tell us what needs to work better."
        body="Bring the problem in whatever shape it is currently in. Mapping it is the first part of the work."
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(schema)}
      />
    </div>
  );
}
