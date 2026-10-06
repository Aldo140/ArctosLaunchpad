import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { breadcrumbSchema, graph, pageMetadata, webPageSchema } from "@/lib/seo";
import { processDetails } from "@/lib/content";
import { Crumbs, JsonLd, StartBand } from "@/components/site/Page";
import { ProcessHero } from "@/components/site/process/ProcessHero";
import { Journey } from "@/components/site/process/Journey";
import { Shapes } from "@/components/site/process/Shapes";
import { Lines, TextLink, d } from "@/components/site/ui";
import { Nudge } from "@/components/site/Nudge";

export const metadata: Metadata = pageMetadata({
  title: "Our Website & Software Project Process | Arctos Launchpad",
  absoluteTitle: true,
  description:
    "Understand the business, map where the work gets stuck, design the right system, build and launch it, then improve it in daily use.",
  path: "/process",
  cardTitle: "One route, six stops.",
});

export default function ProcessPage() {
  return (
    <>
      <ProcessHero crumbs={<Crumbs trail={[{ label: "Process", href: "/process" }]} />} />

      <section className="pj-journey tone-paper" data-tone="paper" aria-labelledby="pj-route">
        <div className="wrap pj-journey__head">
          <p className="eyebrow" data-reveal>
            The route, stop by stop
          </p>
          <Lines as="h2" id="pj-route" className="h1" lines={["Six stops.", <em key="r">Laid plank by plank.</em>]} />
          <p className="body pj-journey__intro" data-reveal style={d(2)}>
            Each stop ends with something the team can see and check before the next one starts: a map,
            a plan, a working system, then what real use teaches.
          </p>
        </div>
        <Journey />
        <div className="wrap nudge-wrap">
          <Nudge
            ask="Not sure which stop your project starts at?"
            label="Describe it and we’ll tell you"
            from="process-route"
          />
        </div>
      </section>

      <section className="pjs-section section tone-ink" data-tone="ink" aria-labelledby="shapes">
        <div className="wrap">
          <div className="pjs-section__head">
            <p className="eyebrow" data-reveal>
              Same route, different shapes
            </p>
            <Lines as="h2" id="shapes" className="h2" lines={["Every project", <em key="d">weighs the stops differently.</em>]} />
          </div>
          <Shapes />
        </div>
      </section>

      <section className="pjo section--tight section tone-pine" data-tone="pine" aria-labelledby="pjo-title">
        <div className="wrap pjo__grid">
          <div>
            <p className="eyebrow" data-reveal>
              A smaller first step
            </p>
            <Lines as="h2" id="pjo-title" className="h2" lines={["Try the first two stops", <em key="f">for free.</em>]} />
          </div>
          <div className="pjo__side" data-reveal style={d(2)}>
            <ol className="pjo__route" aria-label="What the teardown covers">
              {processDetails.map((step, i) => (
                <li key={step.id} className={i < 2 ? "is-free" : ""} style={{ "--i": i } as CSSProperties}>
                  <span className="pjo__dot" aria-hidden="true" />
                  <span className="pjo__name">
                    {step.index} {step.title}
                  </span>
                  {i < 2 ? <span className="visually-hidden"> (included)</span> : null}
                </li>
              ))}
            </ol>
            <p className="body">
              The reporting teardown is Discover and Map on one spreadsheet: we show you the one-screen
              report it should be and the first three manual steps we would automate.
            </p>
            <TextLink href="/teardown">Get the free teardown</TextLink>
          </div>
        </div>
      </section>

      <StartBand title={["Tell us where", <>the work gets <em key="s">stuck.</em></>]} size="h1" />
      <JsonLd
        data={graph(
          webPageSchema({ name: "Process", path: "/process", description: "The Arctos engagement process." }),
          breadcrumbSchema([{ name: "Process", path: "/process" }]),
        )}
      />
    </>
  );
}
