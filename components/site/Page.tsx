import Link from "next/link";
import type { ReactNode } from "react";
import { jsonLd } from "@/lib/seo";
import { Lines, d } from "./ui";

type Tone = "ink" | "paper" | "bone" | "pine";

export function Crumbs({ trail }: { trail: { label: string; href: string }[] }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <ol>
        <li>
          <Link href="/">Home</Link>
        </li>
        {trail.map((c, i) => (
          <li key={c.href}>
            {i === trail.length - 1 ? (
              <span aria-current="page">{c.label}</span>
            ) : (
              <Link href={c.href}>{c.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Interior opening. `layout` changes the composition, not just the colour:
 *   split   title left, aside right (art, facts, a form)
 *   stack   one wide column, aside below — for long headlines
 *   center  short statement pages (legal, 404)
 */
export function PageHero({
  tone = "ink",
  layout = "split",
  eyebrow,
  title,
  lead,
  crumbs,
  aside,
  actions,
  className = "",
}: {
  tone?: Tone;
  layout?: "split" | "stack" | "center";
  eyebrow?: ReactNode;
  title: ReactNode[];
  lead?: ReactNode;
  crumbs?: { label: string; href: string }[];
  aside?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`phero phero--${layout} tone-${tone} ${className}`} data-tone={tone}>
      <div className="wrap phero__grid">
        <div className="phero__main">
          {crumbs ? <Crumbs trail={crumbs} /> : null}
          {eyebrow ? (
            <p className="eyebrow" data-reveal>
              {eyebrow}
            </p>
          ) : null}
          <Lines as="h1" className="h1 phero__title" lines={title} />
          {lead ? (
            <div className="lead phero__lead" data-reveal style={d(2)}>
              {lead}
            </div>
          ) : null}
          {actions ? (
            <div className="actions" data-reveal style={d(3)}>
              {actions}
            </div>
          ) : null}
        </div>
        {aside ? (
          <div className="phero__aside" data-reveal="fade" style={d(2)}>
            {aside}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export { StartBand } from "./StartBand";

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(data)} />;
}
