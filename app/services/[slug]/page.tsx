import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  calgaryLandingPages,
  getIslandForStage,
  getRelatedProjects,
  getRelatedServices,
  getServicePageBySlug,
  servicePages,
} from "@/lib/content";
import {
  breadcrumbSchema,
  faqPageSchema,
  graph,
  pageMetadata,
  serviceSchema,
  webPageSchema,
} from "@/lib/seo";
import { brandArt, serviceArtwork } from "@/lib/brand-art";
import { JsonLd } from "@/components/site/Page";
import { StartBand } from "@/components/site/StartBand";
import { ServiceHero } from "@/components/site/service/ServiceHero";
import { ServiceMotion } from "@/components/site/service/ServiceMotion";
import {
  BeforeAfter,
  Bridge,
  Capabilities,
  Faq,
  Proof,
  WrongFit,
} from "@/components/site/service/Sections";

type Props = { params: Promise<{ slug: string }> };

/** Names the market when a description has room and does not already say it. */
function withCountry(description: string) {
  if (/Canad/.test(description)) return description;
  const extended = `${description} For organizations across Canada.`;
  return extended.length <= 160 ? extended : description;
}

export function generateStaticParams() {
  return servicePages.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const sheet = getServicePageBySlug((await params).slug);
  if (!sheet) return {};
  // "Custom Software Services" matches how buyers search; a name that already
  // ends in a service noun ("... Consulting") is left as it is.
  const searchTitle = /Consulting$/.test(sheet.title) ? sheet.title : `${sheet.title} Services`;
  return pageMetadata({
    title: searchTitle,
    description: withCountry(sheet.metaDescription || sheet.summary),
    path: sheet.route,
    eyebrow: getIslandForStage(sheet.stage).name,
    cardTitle: sheet.headline,
    cardDescription: sheet.summary,
  });
}

export default async function ServicePage({ params }: Props) {
  const sheet = getServicePageBySlug((await params).slug);
  if (!sheet) notFound();

  const island = getIslandForStage(sheet.stage);
  // Projects with real media first; editorial order otherwise.
  const proof = getRelatedProjects(sheet)
    .map((p, i) => ({ p, i, media: p.reel || p.featuredImage ? 0 : 1 }))
    .sort((a, b) => a.media - b.media || a.i - b.i)
    .map(({ p }) => p)
    .slice(0, 2);
  const related = getRelatedServices(sheet);
  const scene =
    serviceArtwork(sheet.slug) ??
    (island.id === "see"
      ? { src: "/assets/art/reporting-observatory.webp", width: 1536, height: 1024 }
      : island.id === "run"
        ? brandArt.workflow
        : brandArt.gateway);

  const schema = graph(
    webPageSchema({ name: sheet.title, description: sheet.metaDescription || sheet.summary, path: sheet.route }),
    serviceSchema({ name: sheet.title, description: sheet.summary, path: sheet.route }),
    faqPageSchema(sheet.faq),
    breadcrumbSchema([
      { name: "Services", path: "/services" },
      { name: sheet.title, path: sheet.route },
    ]),
  );

  return (
    <ServiceMotion island={island.id}>
      <ServiceHero
        island={island}
        headline={sheet.headline}
        summary={sheet.summary}
        crumbs={[
          { label: "Services", href: "/services" },
          { label: sheet.shortTitle, href: sheet.route },
        ]}
        hasProof={proof.length > 0}
        scene={scene}
      />
      <BeforeAfter sheet={sheet} />
      <Capabilities sheet={sheet} />
      <Bridge sheet={sheet} />
      <WrongFit sheet={sheet} need={island.need} />
      {proof.length ? <Proof projects={proof} /> : null}
      <Faq
        sheet={sheet}
        related={related}
        local={calgaryLandingPages.find((page) => page.serviceSlug === sheet.slug)}
      />
      <StartBand title={[sheet.cta]} need={island.need} size="h1" />
      <JsonLd data={schema} />
    </ServiceMotion>
  );
}
