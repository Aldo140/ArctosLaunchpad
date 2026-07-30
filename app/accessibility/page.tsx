import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Accessibility",
  description:
    "Arctos Launchpad accessibility commitment and a clear way to report barriers.",
  alternates: { canonical: "/accessibility" },
};

const contents = [
  ["01", "Our working standard", "standard"],
  ["02", "Built into this site", "features"],
  ["03", "Known limitations", "limitations"],
  ["04", "Report a barrier", "feedback"],
] as const;

const built = [
  "Semantic headings and landmark regions",
  "Keyboard-accessible navigation and controls",
  "Visible focus indicators",
  "Labels and clear errors for form fields",
  "Text and interface contrast intended to meet AA thresholds",
  "Layouts that adapt to zoom and smaller screens",
  "Reduced-motion support for visitors who request it",
  "Descriptive link language and alternative text where needed",
];

export default function AccessibilityPage() {
  return (
    <>
      <section
        className="masthead section policy-cover"
        data-material="instrument"
        data-station="Accessibility"
      >
        <div className="shell policy-cover__inner">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/accessibility">Accessibility</Link>
              </li>
            </ol>
          </nav>

          <div>
            <p className="tick-label">Practice note</p>
            <h1 className="t-display policy-cover__title">
              Access is part of <em>the work.</em>
            </h1>
            <p className="t-lead policy-cover__intro">
              We design and maintain this website so more people can understand
              it, navigate it, and use it with confidence.
            </p>
          </div>

          <dl className="policy-cover__meta">
            <div>
              <dt className="t-label">Document</dt>
              <dd className="t-folio">Accessibility statement</dd>
            </div>
            <div>
              <dt className="t-label">Target</dt>
              <dd className="t-folio">WCAG 2.2 Level AA</dd>
            </div>
            <div>
              <dt className="t-label">Last reviewed</dt>
              <dd className="t-folio">30 July 2026</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section" data-material="paper" data-station="Record">
        <div className="shell policy">
          <nav className="policy__contents" aria-label="On this page">
            <p className="t-label">Contents</p>
            <ol>
              {contents.map(([n, label, id]) => (
                <li key={id}>
                  <a href={`#${id}`}>
                    <span className="t-folio">{n}</span>
                    <span>{label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="policy__body">
            <p className="policy__lead">
              Arctos targets WCAG 2.2 Level AA. Accessibility is treated as an
              ongoing quality practice, not a one-time certification.
            </p>

            <section id="standard" className="policy__section">
              <div className="policy__section-head">
                <span className="t-folio policy__n">01</span>
                <h2 className="policy__h2">Our working standard</h2>
              </div>
              <p>
                The site is designed against the Web Content Accessibility
                Guidelines, version 2.2, at Level AA. This guides choices about
                structure, contrast, interaction, motion, forms, and responsive
                layouts.
              </p>
              <p>
                Standards are a foundation. Real experiences across devices and
                assistive technologies also inform improvements.
              </p>
            </section>

            <section id="features" className="policy__section">
              <div className="policy__section-head">
                <span className="t-folio policy__n">02</span>
                <h2 className="policy__h2">Built into this site</h2>
              </div>
              <ul className="policy__checklist">
                {built.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section id="limitations" className="policy__section">
              <div className="policy__section-head">
                <span className="t-folio policy__n">03</span>
                <h2 className="policy__h2">Known limitations</h2>
              </div>
              <p>
                No website is guaranteed to work perfectly for every combination
                of browser, device, and assistive technology. Content and
                components will continue to be reviewed as the site changes.
              </p>
              <aside className="policy__note">
                <p className="policy__note-title">
                  If something does not work
                </p>
                <p>
                  Your report is useful even if you do not know the technical
                  cause. The page and the action you were trying to complete are
                  enough to start.
                </p>
              </aside>
            </section>

            <section id="feedback" className="policy__section">
              <div className="policy__section-head">
                <span className="t-folio policy__n">04</span>
                <h2 className="policy__h2">Report a barrier</h2>
              </div>
              <p>
                If any part of this site prevents you from accessing information
                or completing an action, use the contact form. When possible,
                include the page, the problem, your browser or device, and any
                assistive technology involved.
              </p>
              <p>
                Arctos will review the issue and respond within two business
                days. An alternative way to access the information will be
                provided where practical.
              </p>
              <p className="policy__action">
                <Link className="btn btn--ghost btn--small" href="/contact">
                  Report an accessibility issue
                  <span className="btn__arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              </p>
            </section>
          </article>
        </div>
      </section>
    </>
  );
}
