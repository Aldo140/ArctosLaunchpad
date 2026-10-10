import type { Metadata } from "next";
import { projects } from "@/lib/content";
import { breadcrumbSchema, graph, ORGANIZATION_ID, SITE_DESCRIPTION, pageMetadata, webPageSchema } from "@/lib/seo";
import { Crumbs, JsonLd, StartBand } from "@/components/site/Page";
import { statusTone } from "@/components/site/ui";
import { StudioHero } from "@/components/site/studio/StudioHero";
import { StudioPractice } from "@/components/site/studio/StudioPractice";
import { StudioWall } from "@/components/site/studio/StudioWall";
import { StudioPrinciples } from "@/components/site/studio/StudioPrinciples";
import { StudioTogether, type TogetherItem } from "@/components/site/studio/StudioTogether";

export const metadata: Metadata = pageMetadata({
  title: "About Arctos Launchpad | Calgary Marketing & Software Agency",
  absoluteTitle: true,
  description: SITE_DESCRIPTION,
  path: "/studio",
  cardTitle: "Busywork in. A working system out.",
});

/** Real projects for the "working together" strip, in the order they're shown. */
const TOGETHER = ["nicsdelite", "so-social-collective", "calgary-watch", "starlings-support-map", "rio-alto"];

export default function StudioPage() {
  const together: TogetherItem[] = TOGETHER.flatMap((slug) => {
    const p = projects.find((x) => x.slug === slug);
    if (!p || !p.featuredImage) return [];
    return [
      {
        slug: p.slug,
        route: p.route,
        title: p.title,
        statusLabel: p.statusLabel,
        tone: statusTone(p),
        image: p.featuredImage,
        asked: p.challenge,
        did: p.services.slice(0, 3),
      },
    ];
  });

  return (
    <div className="st-page">
      <StudioHero crumbs={<Crumbs trail={[{ label: "Studio", href: "/studio" }]} />} />
      <StudioPractice />
      <StudioWall />
      <StudioPrinciples />
      <StudioTogether items={together} />

      <StartBand title={["What would make", <>the business <em key="w">work better?</em></>]} size="h1" />
      <JsonLd
        data={graph(
          { ...webPageSchema({ type: "AboutPage", name: "About Arctos Launchpad", path: "/studio", description: SITE_DESCRIPTION }), mainEntity: { "@id": ORGANIZATION_ID } },
          breadcrumbSchema([{ name: "Studio", path: "/studio" }]),
        )}
      />
    </div>
  );
}
