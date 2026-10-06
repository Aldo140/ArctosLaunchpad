import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getIslandForStage,
  getServicePageBySlug,
  industryPages,
  type ServicePage,
} from "@/lib/content";
import { breadcrumbSchema, graph, pageMetadata, webPageSchema } from "@/lib/seo";
import { Crumbs, JsonLd, StartBand } from "@/components/site/Page";
import { ProjectPlate } from "@/components/site/ProjectPlate";
import { Lines, d } from "@/components/site/ui";
import { Nudge } from "@/components/site/Nudge";
import { DepthField } from "@/components/site/industries/DepthField";
import { NextIndustry } from "@/components/site/industries/NextIndustry";
import { ResolveMap } from "@/components/site/industries/ResolveMap";
import { TerrainSvg } from "@/components/site/industries/TerrainSvg";
import { TiltGroup } from "@/components/site/industries/TiltGroup";
import { litIslands, routesFor, workIn } from "@/components/site/industries/data";

type Props = { params: Promise<{ slug: string }> };

const find = (slug: string) => industryPages.find((i) => i.slug === slug);

export function generateStaticParams() {
  return industryPages.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const industry = find((await params).slug);
  if (!industry) return {};
  return pageMetadata({
    title: industry.seoTitle,
    absoluteTitle: true,
    // The widest market that still fits Google's snippet length.
    description: [" across Canada and the US.", " across Canada.", "."]
      .map((market) => `${industry.summary} From a Calgary studio working${market}`)
      .find((d) => d.length <= 160) ?? industry.summary,
    path: `/industries/${industry.slug}`,
    eyebrow: "Industries",
    cardTitle: industry.headline,
  });
}

export default async function IndustryPage({ params }: Props) {
  const industry = find((await params).slug);
  if (!industry) notFound();

  const path = `/industries/${industry.slug}`;
  const services = industry.relevantServices
    .map(getServicePageBySlug)
    .filter((s): s is ServicePage => Boolean(s));
  const routes = routesFor(industry, services);
  const work = workIn(industry.title).slice(0, 2);
  const index = industryPages.findIndex((i) => i.slug === industry.slug);
  const nextIndex = (index + 1) % industryPages.length;
  const next = industryPages[nextIndex];
  const total = industryPages.length;

  return (
    <>
      <section className="inx-hero tone-ink" data-tone="ink" aria-labelledby="inx-title">
        <DepthField className="inx-hero__terrain">
          <TerrainSvg seed={industry.slug} bridge lit={litIslands(services)} preserve="xMaxYMid slice" />
        </DepthField>
        <div className="inx-hero__scrim" aria-hidden="true" />
        <div className="wrap inx-hero__inner">
          <Crumbs
            trail={[
              { label: "Industries", href: "/industries" },
              { label: industry.title, href: path },
            ]}
          />
          <p className="eyebrow" data-reveal>
            Terrain {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} · {industry.title}
          </p>
          <Lines as="h1" id="inx-title" className="h1 inx-hero__title" lines={[industry.headline]} />
          <p className="lead inx-hero__lead" data-reveal style={d(2)}>
            {industry.summary}
          </p>
          <p className="inx-hero__legend mono" data-reveal style={d(3)}>
            <span className="inx-hero__key" aria-hidden="true" />
            Contours drawn from this industry’s name. The bridge is the same on every page.
          </p>
        </div>
      </section>

      <section className="section tone-paper inx-resolve" data-tone="paper" aria-labelledby="where">
        <div className="wrap">
          <div className="inx-resolve__head">
            <div>
              <p className="eyebrow" data-reveal>
                Where it usually breaks
              </p>
              <Lines as="h2" id="where" className="h2" lines={["From the friction", <em key="t">to the first fix.</em>]} />
            </div>
            <p className="body inx-resolve__note" data-reveal style={d(2)}>
              {industry.note}
            </p>
          </div>
          <ResolveMap
            challenges={industry.challenges}
            routes={routes.map((r) => r.targets)}
            services={services.map((s) => {
              const isle = getIslandForStage(s.stage);
              return {
                slug: s.slug,
                route: s.route,
                title: s.title,
                summary: s.summary,
                island: { id: isle.id, index: isle.index, name: isle.name },
              };
            })}
          />
          <Nudge
            ask="Is one of these slowing your team down?"
            label="Talk about where it breaks"
            href={`/contact?need=${services[0] ? getIslandForStage(services[0].stage).need : "website"}`}
            from="industry"
          />
        </div>
      </section>

      {work.length ? (
        <section className="section tone-ink inx-work" data-tone="ink" aria-labelledby="related-work">
          <div className="inx-work__ground" aria-hidden="true">
            <TerrainSvg seed={`${industry.slug}-work`} cols={44} rows={25} count={10} />
          </div>
          <div className="wrap">
            <p className="eyebrow" data-reveal>
              In this terrain
            </p>
            <Lines
              as="h2"
              id="related-work"
              className="h2"
              lines={["Real work", <em key="s">on this ground.</em>]}
            />
            <TiltGroup className={`plates-2 inx-work__plates${work.length === 1 ? " is-single" : ""}`}>
              {work.map((p) => (
                <div className="inx-tilt" key={p.slug} data-reveal>
                  <ProjectPlate project={p} sizes="(max-width: 900px) 92vw, 46vw" />
                </div>
              ))}
            </TiltGroup>
          </div>
        </section>
      ) : null}

      <nav className="section--tight section tone-paper inx-nextband" data-tone="paper" aria-label="Next industry">
        <div className="wrap">
          <NextIndustry
            href={`/industries/${next.slug}`}
            title={next.title}
            index={nextIndex}
            total={total}
            terrain={<TerrainSvg seed={next.slug} cols={44} rows={25} count={11} />}
          />
        </div>
      </nav>

      <StartBand title={["How does", <>your business <em key="r">run?</em></>]} size="h1" />
      <JsonLd
        data={graph(
          webPageSchema({ name: industry.title, path, description: industry.summary }),
          breadcrumbSchema([
            { name: "Industries", path: "/industries" },
            { name: industry.title, path },
          ]),
        )}
      />
    </>
  );
}
