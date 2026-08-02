import Link from "next/link";

export { CTASection } from "./CTASection";

export function Arrow({ direction = "right" }: { direction?: "right" | "down" }) {
  return <span aria-hidden="true">{direction === "right" ? "→" : "↓"}</span>;
}

/**
 * Interior page masthead.
 *
 * Interior pages are documents, not landing pages, so they open like one: a
 * breadcrumb trail, a folio, the title, and the standfirst. The title also
 * feeds the survey rule in the left gutter.
 */
export function PageHeader({
  eyebrow,
  title,
  intro,
  folio,
  breadcrumbs,
  material = "instrument",
  chapter,
  aside,
  footer,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: string;
  folio?: string;
  breadcrumbs?: { label: string; href: string }[];
  material?: "instrument" | "paper";
  chapter?: "attract" | "convert" | "operate" | "scale";
  aside?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section
      className="masthead section"
      data-material={material}
      data-chapter={chapter}
      /* Only a chaptered masthead has a plate to hang, so only that one opts
         into the primitive — see the PLATE block in styles/base.css. */
      data-plate={chapter ? "" : undefined}
      data-station={title}
    >
      <div className="shell masthead__inner">
        {breadcrumbs?.length ? (
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              {breadcrumbs.map((c) => (
                <li key={c.href}>
                  <Link href={c.href}>{c.label}</Link>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <div className="masthead__body">
          <div>
            {eyebrow ? <p className="tick-label">{eyebrow}</p> : null}
            <h1 className="masthead__title t-display">{title}</h1>
            {intro ? <p className="masthead__intro t-lead">{intro}</p> : null}
          </div>
          {folio ? <p className="masthead__folio t-folio">{folio}</p> : null}
        </div>

        {aside ? <div className="masthead__aside">{aside}</div> : null}
        {footer ? <div className="masthead__footer">{footer}</div> : null}
      </div>
    </section>
  );
}

/** Long-form body copy with a real measure and sensible vertical rhythm. */
export function Prose({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`prose${className ? ` ${className}` : ""}`}>{children}</div>
  );
}

/** A labelled register — status, services, technology. */
export function Register({
  rows,
}: {
  rows: { term: string; detail: React.ReactNode }[];
}) {
  return (
    <dl className="register">
      {rows.map((row) => (
        <div key={row.term} className="register__row">
          <dt className="t-label">{row.term}</dt>
          <dd>{row.detail}</dd>
        </div>
      ))}
    </dl>
  );
}
