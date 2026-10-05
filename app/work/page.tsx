import type { Metadata } from "next";
import { CTASection } from "@/components/CTASection";
import {
  CalgaryPlate,
  FreshPrepPlate,
  LeaseFlowPlate,
  RioPlate,
  StarlingsPlate,
  TnkPlate,
} from "@/components/work/Plates";
import { workOrder } from "@/components/work/order";
import {
  absoluteUrl,
  breadcrumbSchema,
  graph,
  jsonLd,
  pageMetadata,
  webPageSchema,
} from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Work",
  description:
    "Reporting for recurring events, a production website for a dental lab, and civic, hospitality and product builds from Arctos Launchpad.",
  path: "/work",
  eyebrow: "Selected work",
  cardTitle: "Built for the work you repeat.",
});

const schema = graph(
  webPageSchema({
    type: "CollectionPage",
    name: "Work",
    description:
      "Case files for platforms, internal tools, websites, and product concepts built by Arctos Launchpad.",
    path: "/work",
  }),
  breadcrumbSchema([{ name: "Work", path: "/work" }]),
  {
    "@type": "ItemList",
    name: "Arctos Launchpad case files",
    numberOfItems: workOrder.length,
    itemListElement: workOrder.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: project.title,
      url: absoluteUrl(project.route),
    })),
  },
);

const PLATES = {
  "fresh-prep-event-intelligence": FreshPrepPlate,
  "true-north-kromes": TnkPlate,
  "calgary-watch": CalgaryPlate,
  "rio-alto": RioPlate,
  "starlings-support-map": StarlingsPlate,
  leaseflow: LeaseFlowPlate,
} as const;

export default function WorkPage() {
  const total = workOrder.length;
  return (
    <>
      <section
        className="wrk-open"
        data-material="paper"
        data-station="Selected work"
      >
        <div className="shell wrk-open__inner">
          <p className="t-label wrk-open__eyebrow">Selected work</p>
          <h1 className="wrk-open__title">
            Built for the work <em>you repeat.</em>
          </h1>
          <div className="wrk-open__side">
            <p className="wrk-open__intro">
              Reporting for a recurring events client. A production website for
              a dental lab. Then civic, hospitality and product builds. Six case
              files, in the order we would show you.
            </p>
            <dl className="wrk-key">
              <div>
                <dt>Launched</dt>
                <dd>live in production</dd>
              </div>
              <div>
                <dt>Internal tool</dt>
                <dd>built for a client team</dd>
              </div>
              <div>
                <dt>Working demo</dt>
                <dd>functioning, not yet deployed</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {workOrder.map((project, i) => {
        const Plate = PLATES[project.slug as keyof typeof PLATES];
        return Plate ? (
          <Plate key={project.slug} project={project} n={i + 1} total={total} />
        ) : null;
      })}

      <CTASection />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(schema)}
      />
    </>
  );
}
