import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { PageHeader } from "@/components/Shared";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://arctoslaunchpad.com"
).replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Start a Project",
  description:
    "Tell Arctos Launchpad what needs to work better. Start a conversation about websites, marketing, software, automation, integrations, or reporting.",
  alternates: { canonical: `${siteUrl}/contact` },
  openGraph: {
    title: "Tell us what needs to work better | Arctos Launchpad",
    description:
      "Start a practical project conversation with Arctos Launchpad, a digital growth and technology studio in Calgary.",
    url: `${siteUrl}/contact`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Start a Project | Arctos Launchpad",
    description:
      "Websites, marketing, software, and automation built around how your business actually works.",
  },
};

/** What happens after the form is sent. Nothing here promises more than the
    intake register already states. */
const HANDOFF = [
  {
    n: "01",
    title: "We read the brief in full",
    body: "The detail you give is what the first reply is built from, so write it in your own words.",
  },
  {
    n: "02",
    title: "You get a reply with a useful next step",
    body: "Within two business days, whether or not this turns out to be work we should take on.",
  },
  {
    n: "03",
    title: "A focused conversation",
    body: "One conversation to test the problem and agree on the shape of the work.",
  },
] as const;

export default function ContactPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Arctos Launchpad",
    url: siteUrl,
    areaServed: { "@type": "City", name: "Calgary" },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Calgary",
      addressRegion: "AB",
      addressCountry: "CA",
    },
    description:
      "A Calgary digital growth and technology studio building websites, campaigns, software, automation, integrations, and reporting systems.",
  };

  return (
    <div className="intake-page">
      {/* Paper opening: the conversation starts warm, then the intake sheet
          below is the instrument you actually fill in. */}
      <PageHeader
        eyebrow="New project file"
        title="Tell us what needs to work better."
        intro="Start with the part that feels slow, unclear, disconnected, or overdue. You do not need to arrive with the solution."
        folio="Intake"
        breadcrumbs={[{ label: "Contact", href: "/contact" }]}
        material="paper"
        chapter="convert"
        aside={
          <dl className="index-strip">
            <div className="index-strip__cell">
              <dt className="t-label">The form</dt>
              <dd className="index-strip__detail">Three short sections</dd>
            </div>
            <div className="index-strip__cell">
              <dt className="t-label">Reply</dt>
              <dd className="index-strip__detail">Within two business days</dd>
            </div>
            <div className="index-strip__cell">
              <dt className="t-label">First step</dt>
              <dd className="index-strip__detail">A focused conversation</dd>
            </div>
          </dl>
        }
      />

      <section
        className="section"
        data-material="instrument"
        data-station="Intake"
        id="discovery"
      >
        <div className="shell intake">
          <aside className="intake__memo reveal">
            <p className="tick-label">Before you begin</p>
            <h2 className="t-title intake__memo-title">
              A rough brief is <em>enough.</em>
            </h2>
            <p className="t-body">
              Tell us what is happening now and what you want to change. We will
              help identify the right shape of work.
            </p>
            <figure className="intake__figure">
              <Image
                src="/assets/figures/bear-console.webp"
                alt="A bear working through a control panel of connected settings."
                width={1200}
                height={1200}
                sizes="(max-width: 760px) 100vw, 32vw"
              />
              <figcaption className="t-folio">
                Begin with the controls that are not working
              </figcaption>
            </figure>
            <dl className="register">
              <div className="register__row">
                <dt className="t-label">Good briefs</dt>
                <dd>Describe the friction before the feature</dd>
              </div>
              <div className="register__row">
                <dt className="t-label">Not needed</dt>
                <dd>A spec, a budget you are certain of, or a deadline</dd>
              </div>
              <div className="register__row">
                <dt className="t-label">Based in</dt>
                <dd>Calgary, Alberta</dd>
              </div>
            </dl>
            <p className="intake__note">
              Want more context before you write?{" "}
              <Link className="link" href="/process">
                See how we work
              </Link>
              .
            </p>
          </aside>

          <div className="intake__sheet">
            <ContactForm />
          </div>
        </div>
      </section>

      <section className="section" data-material="paper" data-station="Handoff">
        <div className="shell">
          <div className="chapter-head reveal">
            <div>
              <p className="tick-label">After you send</p>
              <h2 className="t-title chapter-head__title">
                A short path from brief to <em>conversation.</em>
              </h2>
            </div>
            <p className="t-folio chapter-head__note">Three steps</p>
          </div>

          <ol className="handoff">
            {HANDOFF.map((step) => (
              <li key={step.n} className="handoff__step reveal">
                <span className="t-folio handoff__n">{step.n}</span>
                <h3 className="handoff__title">{step.title}</h3>
                <p className="handoff__body">{step.body}</p>
              </li>
            ))}
          </ol>

          <p className="handoff__foot t-folio">
            Your information is only used to respond to this enquiry.{" "}
            <Link className="link" href="/privacy">
              Read the privacy notice
            </Link>
          </p>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
