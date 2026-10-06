import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The long-form reference layout: ink cover with a metadata table, then a
 * contents rail beside numbered sections. Built on the same `policy` classes
 * as the accessibility statement, so guides read as part of the site rather
 * than a bolted-on blog.
 */
export function GuideLayout({
  path,
  crumb,
  eyebrow,
  title,
  intro,
  meta,
  contents,
  lead,
  children,
}: {
  path: string;
  crumb: string;
  eyebrow: string;
  title: ReactNode;
  intro: string;
  meta: [label: string, value: string][];
  contents: readonly (readonly [n: string, label: string, id: string])[];
  lead: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <section className="phero tone-ink policy-cover" data-tone="ink">
        <div className="wrap policy-cover__inner">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href={path}>{crumb}</Link>
              </li>
            </ol>
          </nav>

          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="h1 policy-cover__title">{title}</h1>
            <p className="lead policy-cover__intro">{intro}</p>
          </div>

          <dl className="policy-cover__meta">
            {meta.map(([label, value]) => (
              <div key={label}>
                <dt className="mono">{label}</dt>
                <dd className="index">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section tone-paper" data-tone="paper">
        <div className="wrap policy">
          <nav className="policy__contents" aria-label="On this page">
            <p className="mono">Contents</p>
            <ol>
              {contents.map(([n, label, id]) => (
                <li key={id}>
                  <a href={`#${id}`}>
                    <span className="index">{n}</span>
                    <span>{label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="policy__body">
            <p className="policy__lead">{lead}</p>
            {children}
          </article>
        </div>
      </section>
    </>
  );
}

export function GuideSection({
  n,
  id,
  title,
  children,
}: {
  n: string;
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="policy__section">
      <div className="policy__section-head">
        <span className="index policy__n">{n}</span>
        <h2 className="policy__h2">{title}</h2>
      </div>
      {children}
    </section>
  );
}

/** An outbound link to an official source, opened in a new tab. */
export function Source({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="link" href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span aria-hidden="true">↗</span>
    </a>
  );
}

/** Questions rendered as plain headed paragraphs; pair with `faqPageSchema`. */
export function GuideFaq({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <>
      {items.map((item) => (
        <div key={item.question}>
          <h3 className="policy__note-title">{item.question}</h3>
          <p>{item.answer}</p>
        </div>
      ))}
    </>
  );
}
