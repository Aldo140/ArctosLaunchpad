import type { Metadata } from "next";
import Link from "next/link";
import { industryPages } from "@/lib/content";
import { breadcrumbSchema, graph, pageMetadata, webPageSchema } from "@/lib/seo";
import { Crumbs, JsonLd, StartBand } from "@/components/site/Page";
import { Lines, d } from "@/components/site/ui";
import { AtlasPanel, type AtlasItem } from "@/components/site/industries/AtlasPanel";
import { TerrainSvg } from "@/components/site/industries/TerrainSvg";
import { workIn } from "@/components/site/industries/data";

export const metadata: Metadata = pageMetadata({
  title: "Websites & Software by Industry | Arctos Launchpad",
  absoluteTitle: true,
  description:
    "Websites, software and automation shaped around how healthcare, manufacturing, nonprofits, trades, real estate, hospitality and events teams work.",
  path: "/industries",
  cardTitle: "Industries",
});

export default function IndustriesPage() {
  const items: AtlasItem[] = industryPages.map((industry) => {
    const work = workIn(industry.title);
    const lead = work[0];
    return {
      slug: industry.slug,
      title: industry.title,
      challenges: industry.challenges,
      count: work.length,
      work: lead
        ? {
            title: lead.title,
            status: lead.statusLabel,
            poster: lead.reel?.poster ?? lead.featuredImage,
            phone: lead.phone,
            accent: lead.accent,
          }
        : null,
    };
  });

  return (
    <>
      <section className="ind-atlas tone-ink" data-tone="ink" aria-labelledby="ind-title">
        <div className="wrap ind-atlas__grid">
          <header className="ind-atlas__head">
            <Crumbs trail={[{ label: "Industries", href: "/industries" }]} />
            <p className="eyebrow" data-reveal>
              Operating context · 10 terrains
            </p>
            <Lines
              as="h1"
              id="ind-title"
              className="display ind-atlas__title"
              lines={["Same bridge.", <em key="d">Different terrain.</em>]}
            />
            <p className="lead" data-reveal style={d(2)}>
              How customers choose, how a job is approved and how information moves all change with
              the business. We start from those realities, not from a template.
            </p>
          </header>

          <div className="ind-atlas__aside">
            <AtlasPanel items={items} />
          </div>

          <ol className="ind-atlas__list" aria-label="Industries">
            {industryPages.map((industry, i) => {
              const count = items[i].count;
              return (
                <li key={industry.slug} data-reveal style={d(i % 3)}>
                  <Link
                    href={`/industries/${industry.slug}`}
                    className="ind-atlas__row"
                    data-atlas-row={i}
                  >
                    <span className="index">{String(i + 1).padStart(2, "0")}</span>
                    <span className="ind-atlas__name">{industry.title}</span>
                    <span className="ind-atlas__summary">{industry.summary}</span>
                    <span className="ind-atlas__chips">
                      {industry.challenges.map((c) => (
                        <span key={c}>{c}</span>
                      ))}
                    </span>
                    <span className="ind-atlas__meta">
                      <span className="ind-atlas__sig" aria-hidden="true">
                        <TerrainSvg seed={industry.slug} w={240} h={84} cols={26} rows={10} count={7} />
                      </span>
                      <span className="ind-atlas__count">
                        {count ? `${count} related project${count > 1 ? "s" : ""}` : "No case study yet"}
                      </span>
                      <span className="ind-atlas__arrow" aria-hidden="true">
                        →
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
      <StartBand
        title={["Don’t see", <>your <em key="i">industry?</em></>]}
        body="The questions are usually the same: how customers find you, how the work moves and what you can see. Tell us how yours runs."
        size="h1"
      />
      <JsonLd
        data={graph(
          webPageSchema({ type: "CollectionPage", name: "Industries", path: "/industries", description: "Industries Arctos works with." }),
          breadcrumbSchema([{ name: "Industries", path: "/industries" }]),
        )}
      />
    </>
  );
}
