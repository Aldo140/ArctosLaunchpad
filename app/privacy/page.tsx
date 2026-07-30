import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How Arctos Launchpad handles project enquiry and website information.",
  alternates: { canonical: "/privacy" },
};

const contents = [
  ["01", "Information we collect", "information"],
  ["02", "How information is used", "use"],
  ["03", "Service providers", "providers"],
  ["04", "Retention and your choices", "retention"],
  ["05", "Questions or requests", "contact"],
] as const;

export default function PrivacyPage() {
  return (
    <>
      <section
        className="masthead section policy-cover"
        data-material="instrument"
        data-station="Privacy"
      >
        <div className="shell policy-cover__inner">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy</Link>
              </li>
            </ol>
          </nav>

          <div>
            <p className="tick-label">Policy record</p>
            <h1 className="t-display policy-cover__title">
              Privacy, in <em>plain language.</em>
            </h1>
            <p className="t-lead policy-cover__intro">
              What this website collects, why it is needed, and what you can ask
              us to do with it.
            </p>
          </div>

          <dl className="policy-cover__meta">
            <div>
              <dt className="t-label">Document</dt>
              <dd className="t-folio">Privacy notice</dd>
            </div>
            <div>
              <dt className="t-label">Scope</dt>
              <dd className="t-folio">This website and project enquiries</dd>
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
              Arctos Launchpad collects only the information needed to run this
              website, respond to project enquiries, and maintain a business
              relationship. Personal information is not sold.
            </p>

            <section id="information" className="policy__section">
              <div className="policy__section-head">
                <span className="t-folio policy__n">01</span>
                <h2 className="policy__h2">Information we collect</h2>
              </div>
              <p>
                When you submit the project enquiry form, you may provide your
                name, email address, company, website, project type, budget
                range, timeline, current challenge, desired outcome, and any
                additional context you choose to share.
              </p>
              <p>
                The website may also receive ordinary technical request
                information, such as browser type, device type, and IP address,
                through hosting and security infrastructure.
              </p>
              <aside className="policy__note">
                <p className="policy__note-title">One small browser detail</p>
                <p>
                  Session storage remembers whether the brief loading
                  introduction has already appeared. It clears when the browsing
                  session ends.
                </p>
              </aside>
            </section>

            <section id="use" className="policy__section">
              <div className="policy__section-head">
                <span className="t-folio policy__n">02</span>
                <h2 className="policy__h2">How information is used</h2>
              </div>
              <p>
                Enquiry information is used to understand your request, assess
                whether Arctos can help, reply with a useful next step, and keep
                a record of the resulting business conversation.
              </p>
              <p>
                Technical information may be used to keep the site reliable,
                prevent abuse, and diagnose errors. It is not used to make
                automated decisions about you.
              </p>
            </section>

            <section id="providers" className="policy__section">
              <div className="policy__section-head">
                <span className="t-folio policy__n">03</span>
                <h2 className="policy__h2">Service providers</h2>
              </div>
              <p>
                Information may pass through providers used to host the website
                and deliver project enquiries. These providers process
                information only as needed to provide those services or meet
                legal obligations.
              </p>
              <p>
                Arctos may also disclose information when required by law, to
                protect legal rights, or to address security and misuse.
              </p>
            </section>

            <section id="retention" className="policy__section">
              <div className="policy__section-head">
                <span className="t-folio policy__n">04</span>
                <h2 className="policy__h2">Retention and your choices</h2>
              </div>
              <p>
                Enquiry information is kept only for as long as it remains
                useful for the business relationship, record keeping, dispute
                resolution, security, or legal obligations.
              </p>
              <p>
                You can ask about the personal information Arctos holds about
                you, request a correction, or request deletion where applicable.
                Some information may need to be retained when the law or an
                active business relationship requires it.
              </p>
            </section>

            <section id="contact" className="policy__section">
              <div className="policy__section-head">
                <span className="t-folio policy__n">05</span>
                <h2 className="policy__h2">Questions or requests</h2>
              </div>
              <p>
                Use the project form and identify your message as a privacy
                request. Include enough detail for Arctos to understand and
                verify the request, but do not send sensitive information
                through the form.
              </p>
              <p className="policy__action">
                <Link className="btn btn--ghost btn--small" href="/contact">
                  Contact Arctos
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
