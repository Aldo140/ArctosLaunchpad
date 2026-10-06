import type { Metadata } from "next";
import { getProjectBySlug, portfolioOrder, type Project } from "@/lib/content";
import { breadcrumbSchema, graph, pageMetadata, webPageSchema } from "@/lib/seo";
import { JsonLd, StartBand } from "@/components/site/Page";
import { WorkIndex } from "@/components/site/WorkIndex";
import { WorkHero } from "@/components/site/work/WorkHero";

export const metadata: Metadata = pageMetadata({
  title: "Work",
  description:
    "Client websites, civic and nonprofit platforms, an events operations system, an internal reporting tool and the studio's own products, each labelled for exactly what it is.",
  path: "/work",
  cardTitle: "Proof, not promises.",
});

export default function WorkPage() {
  const projects = portfolioOrder.map((slug) => getProjectBySlug(slug)).filter((p): p is Project => Boolean(p));

  return (
    <>
      <WorkHero projects={projects} />
      <section className="section work-index tone-ink" data-tone="ink" aria-label="All projects">
        <div className="wrap">
          <WorkIndex projects={projects} />
        </div>
      </section>
      <StartBand title={["What could we", <em key="b">build for you?</em>]} />
      <JsonLd
        data={graph(
          webPageSchema({ type: "CollectionPage", name: "Work", path: "/work", description: "Arctos project case files." }),
          breadcrumbSchema([{ name: "Work", path: "/work" }]),
        )}
      />
    </>
  );
}
