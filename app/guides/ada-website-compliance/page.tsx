import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/site/Page";
import { GuideFaq, GuideLayout, GuideSection, Source } from "@/components/site/guide/Guide";
import {
  ORGANIZATION_ID,
  breadcrumbSchema,
  faqPageSchema,
  graph,
  pageMetadata,
  webPageSchema,
} from "@/lib/seo";

/**
 * The US accessibility guide. "ADA website compliance" is one of the most
 * searched website questions in the United States, and most answers online are
 * written to sell an overlay. This one says what the law and the courts
 * actually look at, what does not work, and what a sound build involves.
 */

const PATH = "/guides/ada-website-compliance";
const CHECKED = "6 October 2026";
const CHECKED_ISO = "2026-10-06";

const TITLE = "ADA Website Compliance in 2026: What the Law Expects and What Actually Works";
const DESCRIPTION =
  "ADA website compliance in 2026: who gets sued, why courts use WCAG 2.1 and 2.2 AA, the DOJ Title II deadlines, why overlays fail, and a practical checklist.";

export const metadata: Metadata = pageMetadata({
  title: "ADA Website Compliance Guide (2026) | Arctos Launchpad",
  absoluteTitle: true,
  description: DESCRIPTION,
  path: PATH,
  eyebrow: "Guide",
  cardTitle: "ADA website compliance, 2026.",
});

const contents = [
  ["01", "The short answer", "short-answer"],
  ["02", "Who gets sued", "lawsuits"],
  ["03", "The standard: WCAG", "wcag"],
  ["04", "Title II deadlines", "title-ii"],
  ["05", "Why overlays fail", "overlays"],
  ["06", "Selling in Europe or Canada", "beyond-us"],
  ["07", "A practical checklist", "checklist"],
  ["08", "Questions", "faq"],
] as const;

const faq = [
  {
    question: "Does the ADA apply to websites?",
    answer:
      "US courts have widely applied Title III of the ADA to business websites, especially those connected to goods and services the public buys. There is no federal regulation naming a technical standard for private businesses, so courts look to WCAG Level AA.",
  },
  {
    question: "Are small businesses exempt from ADA website lawsuits?",
    answer:
      "No. Title III, which covers public accommodations, has no small-business exemption. The 15-employee threshold people mention applies to Title I employment rules, not to websites.",
  },
  {
    question: "Will an accessibility overlay or widget make my site ADA compliant?",
    answer:
      "No tool can make a site compliant automatically. In 2025 the Federal Trade Commission fined overlay vendor accessiBe $1 million over claims that its plug-in made websites compliant, and sites using overlays continue to be sued.",
  },
  {
    question: "Should we build to WCAG 2.1 or 2.2?",
    answer:
      "WCAG 2.1 Level AA is the benchmark most courts and the DOJ's Title II rule reference. WCAG 2.2 adds nine success criteria, mostly for mobile, low vision and cognitive needs, and meeting 2.2 AA also meets 2.1 AA, so it is the safer target for a new build.",
  },
];

const schema = graph(
  {
    ...webPageSchema({ type: "Article", name: TITLE, description: DESCRIPTION, path: PATH }),
    headline: TITLE,
    dateModified: CHECKED_ISO,
    author: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    about: [
      "ADA website compliance",
      "Americans with Disabilities Act Title III",
      "WCAG 2.1 Level AA",
      "WCAG 2.2",
      "DOJ Title II web accessibility rule",
      "Accessibility overlays",
    ],
  },
  faqPageSchema(faq),
  breadcrumbSchema([{ name: "ADA website compliance", path: PATH }]),
);

export default function AdaGuidePage() {
  return (
    <>
      <GuideLayout
        path={PATH}
        crumb="ADA website compliance"
        eyebrow="Guide · United States"
        title={
          <>
            ADA website compliance, <em>2026.</em>
          </>
        }
        intro="What US law and the courts expect from a business website, who is being sued, why plug-in widgets do not solve it, and what a sound build involves."
        meta={[
          ["Document", "Reference guide"],
          ["Covers", "ADA Titles II and III, WCAG"],
          ["Last checked", CHECKED],
        ]}
        contents={contents}
        lead={
          <>
            Arctos builds websites to WCAG Level AA. This guide explains why that standard matters and where the common
            shortcuts go wrong. It is not legal advice.
          </>
        }
      >
        <GuideSection n="01" id="short-answer" title="The short answer">
          <ul className="policy__checklist">
            <li>Courts apply the ADA to business websites, and there is no small-business exemption.</li>
            <li>The working standard is WCAG Level AA: 2.1 is the usual benchmark, 2.2 is the safer target.</li>
            <li>Overlays and widgets do not make a site compliant; the FTC fined one vendor $1 million.</li>
            <li>Accessibility built in from the first design costs far less than a retrofit after a demand letter.</li>
          </ul>
        </GuideSection>

        <GuideSection n="02" id="lawsuits" title="Who gets sued">
          <p>
            More than 5,000 digital accessibility lawsuits were filed in US federal and state courts in 2025. E-commerce
            and restaurant websites are the most frequent targets, and most suits are filed in New York, California and
            Florida, though filings are spreading to other states.
          </p>
          <p>
            Many cases start with a demand letter rather than a lawsuit, and many settle. Small and mid-sized businesses
            are sued often, because their sites are less likely to have been built or audited with accessibility in
            mind.
          </p>
          <p className="policy__action">
            <Source href="https://www.adatitleiii.com/">Seyfarth Shaw ADA Title III blog</Source>
          </p>
        </GuideSection>

        <GuideSection n="03" id="wcag" title="The standard: WCAG Level AA">
          <p>
            The Web Content Accessibility Guidelines, published by the W3C, are the technical standard courts, the
            Department of Justice and most accessibility laws point to. Level AA is the expected conformance level.
          </p>
          <p>
            WCAG 2.1 AA is the benchmark most often cited. WCAG 2.2, published in October 2023, adds nine success
            criteria covering things like minimum target sizes, visible focus, and not forcing people to re-enter
            information. Meeting 2.2 AA also meets 2.1 AA, which is why this site targets 2.2.
          </p>
          <p className="policy__action">
            <Source href="https://www.w3.org/WAI/standards-guidelines/wcag/">WCAG overview, W3C</Source>
          </p>
        </GuideSection>

        <GuideSection n="04" id="title-ii" title="Title II deadlines for public entities">
          <p>
            The Department of Justice&apos;s 2024 rule requires state and local government websites and apps to meet
            WCAG 2.1 AA. In April 2026 the DOJ extended the compliance dates by a year: April 2027 for larger entities
            and April 2028 for smaller ones and special districts. Vendors that build for public entities inherit
            these expectations.
          </p>
          <p className="policy__action">
            <Source href="https://www.ada.gov/resources/web-guidance/">ADA.gov web accessibility guidance</Source>
          </p>
        </GuideSection>

        <GuideSection n="05" id="overlays" title="Why overlays fail">
          <p>
            Accessibility overlays are scripts that add a toolbar or try to repair a page automatically. They cannot fix
            the structure underneath: unlabeled form fields, inaccessible menus, missing image descriptions, or a
            checkout that cannot be completed with a keyboard.
          </p>
          <p>
            In 2025 the Federal Trade Commission fined accessiBe $1 million over claims that its plug-in could make any
            website compliant, and sites using overlays continue to be named in lawsuits.
          </p>
          <p className="policy__action">
            <Source href="https://www.adatitleiii.com/2025/05/federal-trade-commission-orders-accessibe-to-pay-1m-for-misleading-claims-relating-to-automated-website-accessibility-remediation-tool/">
              FTC order against accessiBe
            </Source>
          </p>
        </GuideSection>

        <GuideSection n="06" id="beyond-us" title="Selling in Europe or Canada">
          <p>
            The European Accessibility Act has applied since 28 June 2025 to many digital products and services sold
            in the EU, including e-commerce, using a standard that incorporates WCAG 2.1 AA. In Canada, Ontario&apos;s
            AODA and the federal Accessible Canada Act reference WCAG as well. One build to WCAG 2.2 AA serves all of
            them.
          </p>
          <p className="policy__action">
            <Link className="link" href="/accessibility">
              How this site approaches accessibility<span aria-hidden="true">→</span>
            </Link>
          </p>
        </GuideSection>

        <GuideSection n="07" id="checklist" title="A practical checklist">
          <ul className="policy__checklist">
            <li>Every image that carries meaning has a text description; decorative images are hidden from readers.</li>
            <li>Every form field has a visible label, and errors say what went wrong and how to fix it.</li>
            <li>The whole site works with a keyboard alone, with a visible focus indicator.</li>
            <li>Text and controls meet AA contrast, and pages hold up when zoomed to 200 percent.</li>
            <li>Headings and landmarks describe the page structure for screen readers.</li>
            <li>Video has captions; motion can be reduced for people who ask for it.</li>
            <li>Checkout, booking and contact flows are tested end to end with a screen reader.</li>
            <li>A published accessibility statement with a way to report problems.</li>
          </ul>
          <aside className="policy__note">
            <p className="policy__note-title">Building or rebuilding?</p>
            <p>
              Accessibility is cheapest when it is part of the design, not an audit at the end.{" "}
              <Link className="link" href="/contact?need=website">
                Talk to Arctos about the build
              </Link>
              .
            </p>
          </aside>
        </GuideSection>

        <GuideSection n="08" id="faq" title="Questions">
          <GuideFaq items={faq} />
          <aside className="policy__note">
            <p className="policy__note-title">Not legal advice</p>
            <p>
              This guide is general information, last checked on {CHECKED}. If you have received a demand letter or
              complaint, speak with US counsel.
            </p>
          </aside>
        </GuideSection>
      </GuideLayout>
      <JsonLd data={schema} />
    </>
  );
}
