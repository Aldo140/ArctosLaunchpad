import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContactDoors } from "@/components/ContactDoors";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://arctoslaunchpad.com"
).replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a project, ask a question first, or reach Arctos Launchpad about anything else. Most people start with the free reporting teardown.",
  alternates: { canonical: `${siteUrl}/contact` },
  openGraph: {
    title: "Talk to Arctos Launchpad",
    description:
      "Start a project, ask a question, or get in touch with a digital growth and technology studio in Calgary.",
    url: `${siteUrl}/contact`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | Arctos Launchpad",
    description:
      "Reporting, automation and software built around how your business actually works.",
  },
};

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
    <div className="ctc-page">
      {/* The page's one job: everything that is not the teardown. The
          teardown gets a single confident pointer; the bear carries the
          composition at scale. */}
      <section
        className="ctc-open"
        data-material="paper"
        data-station="Contact"
      >
        <div className="ctc-open__art" aria-hidden="true">
          {/* ASSET SLOT: "Handover" — two bears passing a folder (brief §6.4).
              Until it exists, the two bears carrying one beam stand in. */}
          <Image
            src="/assets/illustrations/connected-partnership.webp"
            alt=""
            width={1254}
            height={1254}
            priority
            sizes="(max-width: 760px) 120vw, 62vw"
          />
        </div>

        <div className="shell ctc-open__shell">
          <p className="ctc-open__eyebrow t-label">Contact</p>
          <h1 className="ctc-open__title">
            Talk to <em>us.</em>
          </h1>

          <Link className="ctc-pointer" href="/teardown">
            <span className="ctc-pointer__lead">Most people start here</span>
            <span className="ctc-pointer__act">
              The free reporting teardown
              <span className="ctc-pointer__arrow" aria-hidden="true">
                →
              </span>
            </span>
            <span className="ctc-pointer__micro">
              30 minutes. No obligation.
            </span>
          </Link>
        </div>
      </section>

      <section
        className="ctc-desk"
        data-material="instrument"
        data-station="Intake"
        id="discovery"
      >
        <div className="shell ctc-desk__shell">
          <ContactDoors />
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
