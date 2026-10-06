import Image from "next/image";
import Link from "next/link";
import { islands, type Island } from "@/lib/content";
import { Crumbs } from "@/components/site/Page";
import { Btn, Lines, TextLink, d } from "@/components/site/ui";
import { Signal } from "./Signals";

export type SceneArt = { src: string; width: number; height: number };

const CAPTION: Record<Island["id"], string> = {
  win: "Illustrative: one route from a search to an enquiry",
  run: "Illustrative: a task entered once, moving between tools",
  see: "Illustrative: scattered exports becoming one report",
};

export function ServiceHero({
  island,
  headline,
  summary,
  crumbs,
  hasProof,
  scene,
}: {
  island: Island;
  headline: string;
  summary: string;
  crumbs: { label: string; href: string }[];
  hasProof: boolean;
  /** Full illustration for the touch-screen stage (the island crop serves desktop). */
  scene?: SceneArt;
}) {
  return (
    <section className={`svx-hero tone-ink`} data-tone="ink">
      <div className="wrap svx-hero__grid">
        <div className="svx-hero__copy">
          <Crumbs trail={crumbs} />
          <p className="eyebrow" data-reveal>
            <Link href={`/services#${island.id}`} className="island-tag">
              Island {island.index} · {island.name}
            </Link>
          </p>
          <Lines
            as="h1"
            className={`h1 svx-hero__title${headline.length > 48 ? " svx-hero__title--long" : ""}`}
            lines={[headline]}
          />
          <p className="lead svx-hero__lead" data-reveal style={d(2)}>
            {summary}
          </p>
          <div className="actions" data-reveal style={d(3)}>
            <Btn href={`/contact?need=${island.need}`}>Start a project</Btn>
            {hasProof ? <TextLink href="#proof">See related work</TextLink> : null}
          </div>
        </div>

        <div className="svx-stage-track">
        <figure className={`svx-stage${scene ? " has-scene" : ""}`} aria-hidden="true">
          <div className="svx-stage__inner">
            <div className="svx-plane svx-plane--back">
              <svg className="svx-contours" viewBox="0 0 600 600" fill="none">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <ellipse key={i} cx="300" cy="380" rx={120 + i * 46} ry={40 + i * 17} />
                ))}
              </svg>
              <span className="svx-ghost">{island.index}</span>
            </div>
            <div className={`svx-plane svx-plane--art svx-art--${island.id}`}>
              <Image
                src={island.art.src}
                alt=""
                width={island.art.width}
                height={island.art.height}
                sizes="(max-width: 900px) 60vw, 30vw"
                priority
              />
            </div>
            <div className="svx-plane svx-plane--sig">
              <Signal island={island.id} />
            </div>
          </div>
          {scene ? (
            <div className={`svx-scene svx-scene--${island.id}`}>
              <Image src={scene.src} alt="" width={scene.width} height={scene.height} sizes="(max-width: 1023px) 150vw, 10px" />
            </div>
          ) : null}
          <figcaption className="mono svx-stage__cap">{CAPTION[island.id]}</figcaption>
        </figure>
        </div>
      </div>

      <nav className="wrap svx-isles" aria-label="Where this service sits">
        <span className="mono svx-isles__label">The bridge</span>
        <ol>
          {islands.map((it) => (
            <li key={it.id}>
              <Link
                href={`/services#${it.id}`}
                aria-current={it.id === island.id ? "true" : undefined}
                className={it.id === island.id ? "is-here" : undefined}
              >
                <span className="index">{it.index}</span> {it.name}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </section>
  );
}
