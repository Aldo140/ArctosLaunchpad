import type { Metadata } from "next";
import Image from "next/image";
import { CTASection } from "@/components/Shared";
import { ProcessRoute } from "@/components/pages/ProcessRoute";
import { SceneMotion } from "@/components/pages/SceneMotion";
import { processDetails } from "@/lib/content";
import {
  breadcrumbSchema,
  graph,
  jsonLd,
  pageMetadata,
  webPageSchema,
} from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Process",
  description:
    "How Arctos discovers, maps, designs, builds, launches, and improves connected digital systems.",
  path: "/process",
  eyebrow: "How the work moves",
  cardTitle: "Understand the work before building the system.",
});

const schema = graph(
  webPageSchema({
    name: "Process",
    description:
      "The six stops of an Arctos engagement: discover, map, design, build, launch, and improve.",
    path: "/process",
  }),
  breadcrumbSchema([{ name: "Process", path: "/process" }]),
  {
    "@type": "ItemList",
    name: "The Arctos engagement route",
    numberOfItems: processDetails.length,
    itemListElement: processDetails.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.title,
      description: step.summary,
    })),
  },
);

/** What each stop is actually for, in the studio's own shorthand. */
const notes = [
  "Begin with evidence",
  "Expose the friction",
  "Make decisions visible",
  "Test the connected system",
  "Move it into daily use",
  "Learn from real behaviour",
];

export default function ProcessPage() {
  return (
    <div className="interior-document" data-motion="staged">
      <SceneMotion />
      {/* The route opens on the Operate canvas — the stage this page's work
          actually lives in — held full-bleed with the six stops laid across
          the bottom of the panel that rises over it. */}
      <section
        className="scene scene--process reveal"
        data-material="paper"
        data-chapter="operate"
        data-station="Process"
      >
        <div className="scene__hold">
          <div className="scene__canvas">
            <Image
              src="/assets/chapters/operate.webp"
              alt=""
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
              <span>How the work moves</span>
            </p>
            <h1 className="scene__title scene__title--phrase">
              Understand the work.
            </h1>
            <p className="scene__lead">
              Six connected stops take a problem from lived reality to a system
              that keeps improving after launch.
            </p>
          </div>
        </div>

        <div className="scene__panel" data-material="instrument">
          <div className="shell">
            <ol className="process-legend" aria-label="The six stops">
              {processDetails.map((step, index) => (
                <li
                  key={step.id}
                  className="process-legend__stop"
                  style={{ "--i": index } as React.CSSProperties}
                >
                  <a href={`#${step.id}`}>
                    <span className="process-legend__n">{step.index}</span>
                    <span className="process-legend__name">{step.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section
        className="section process-route"
        data-material="instrument"
        data-station="The route"
      >
        <div className="shell process-route__layout">
          <aside className="process-route__rail">
            <p>The route</p>
            <h2>One decision creates the conditions for the next.</h2>
            <nav aria-label="Jump to a process stop">
              <ol>
                {processDetails.map((step) => (
                  <li key={step.id}>
                    <a href={`#${step.id}`}>
                      <span>{step.index}</span>
                      {step.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <div className="process-route__steps">
            {processDetails.map((step, index) => (
              <article key={step.id} id={step.id} className="process-stop">
                <div className="process-stop__head">
                  <p className="process-stop__number">{step.index}</p>
                  <p className="process-stop__note">{notes[index]}</p>
                </div>

                <h3>{step.title}</h3>
                <p className="process-stop__summary">{step.summary}</p>
                <p className="process-stop__detail">{step.detail}</p>

                <div className="process-stop__deliverables">
                  <p>Leaves this stop</p>
                  <ul>
                    {step.deliverables.map((deliverable) => (
                      <li key={deliverable}>{deliverable}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
        <ProcessRoute />
      </section>

      <section
        className="section process-loop reveal"
        data-material="paper"
        data-chapter="scale"
        data-station="Improve"
      >
        <div className="shell process-loop__inner">
          <p>After launch</p>
          <h2>Real behaviour becomes the next round of discovery.</h2>
          <figure className="process-loop__figure">
            <Image
              src="/assets/figures/bear-ascent.webp"
              alt="A bear moving upward along a measured path toward a star."
              width={1200}
              height={1200}
              sizes="(max-width: 760px) 100vw, 24vw"
            />
          </figure>
          <a className="process-loop__return" href="#discover">
            <span className="process-loop__bracket" aria-hidden="true" />
            Return to Discover <span aria-hidden="true">↑</span>
          </a>
        </div>
      </section>

      <CTASection
        title="Start with the part that hurts most."
        body="You do not need the whole system mapped before the first conversation. Bring the bottleneck and we will work outward."
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(schema)}
      />
    </div>
  );
}
