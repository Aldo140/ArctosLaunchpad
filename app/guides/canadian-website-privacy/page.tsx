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
 * A national reference guide. Canadian owners search for cookie consent,
 * Quebec's Law 25, and what the new federal bill means for their website; this
 * answers those plainly, links every rule to its regulator, and says clearly
 * that it is not legal advice.
 */

const PATH = "/guides/canadian-website-privacy";
const CHECKED = "6 October 2026";
const CHECKED_ISO = "2026-10-06";

const TITLE = "Website Privacy Rules in Canada (2026): PIPEDA, Law 25, Cookies and Bill C-36";
const DESCRIPTION =
  "What Canadian privacy law means for your website in 2026: PIPEDA, Alberta and BC PIPA, Quebec Law 25, cookie consent, CASL email rules, and Bill C-36.";

export const metadata: Metadata = pageMetadata({
  title: "Canadian Website Privacy Rules (2026) | Arctos Launchpad",
  absoluteTitle: true,
  description: DESCRIPTION,
  path: PATH,
  eyebrow: "Guide",
  cardTitle: "Website privacy rules in Canada, 2026.",
});

const contents = [
  ["01", "The short answer", "short-answer"],
  ["02", "Which law applies", "which-law"],
  ["03", "Cookies and analytics", "cookies"],
  ["04", "Quebec's Law 25", "law-25"],
  ["05", "Bill C-36", "bill-c36"],
  ["06", "Email and CASL", "casl"],
  ["07", "A website checklist", "checklist"],
  ["08", "Questions", "faq"],
] as const;

const faq = [
  {
    question: "Do Canadian websites need a cookie consent banner?",
    answer:
      "If the site uses cookies or similar tracking for marketing or analytics, Canadian privacy regulators expect meaningful consent, and Quebec's Law 25 requires consent before non-essential cookies are activated for Quebec residents. A site that uses only essential cookies, or privacy-friendly analytics that do not track individuals, may not need a banner.",
  },
  {
    question: "Does Quebec's Law 25 apply to businesses outside Quebec?",
    answer:
      "It can. Law 25 applies to organizations that collect personal information about people in Quebec in the course of business, wherever the organization is based. A website that serves Quebec visitors and collects their information is within reach.",
  },
  {
    question: "Which privacy law applies to an Alberta business?",
    answer:
      "Alberta's Personal Information Protection Act (PIPA) governs private-sector organizations in Alberta. Federal PIPEDA still applies to federally regulated organizations and to personal information that crosses provincial or national borders in the course of commercial activity.",
  },
  {
    question: "Is Bill C-36 law yet?",
    answer:
      "No. Bill C-36, the proposed Protecting Privacy and Consumer Data Act, received first reading on 15 June 2026. It would replace the privacy part of PIPEDA and introduce larger penalties, but it must pass Parliament before it applies.",
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
      "PIPEDA",
      "Alberta Personal Information Protection Act",
      "Quebec Law 25",
      "Cookie consent Canada",
      "Bill C-36 Protecting Privacy and Consumer Data Act",
      "Canada's Anti-Spam Legislation",
    ],
  },
  faqPageSchema(faq),
  breadcrumbSchema([{ name: "Website privacy guide", path: PATH }]),
);

export default function PrivacyGuidePage() {
  return (
    <>
      <GuideLayout
        path={PATH}
        crumb="Website privacy guide"
        eyebrow="Guide · Canada"
        title={
          <>
            Website privacy rules <em>in Canada, 2026.</em>
          </>
        }
        intro="What Canadian privacy law asks of an ordinary business website: forms, cookies, analytics, and email sign-ups, province by province, and what the new federal bill would change."
        meta={[
          ["Document", "Reference guide"],
          ["Covers", "Federal, Alberta, BC and Quebec"],
          ["Last checked", CHECKED],
        ]}
        contents={contents}
        lead={
          <>
            Arctos builds websites, not legal opinions. This guide covers what usually comes up while building one, so
            the right questions reach your lawyer early.
          </>
        }
      >
        <GuideSection n="01" id="short-answer" title="The short answer">
          <ul className="policy__checklist">
            <li>Collect only what each form needs, and say why in a privacy policy that matches what the site does.</li>
            <li>Tracking cookies for marketing or analytics need meaningful consent; Quebec visitors need it first.</li>
            <li>Email sign-ups need consent and an unsubscribe link under CASL.</li>
            <li>Federal reform is coming again: Bill C-36 was introduced in June 2026 but is not law yet.</li>
          </ul>
        </GuideSection>

        <GuideSection n="02" id="which-law" title="Which law applies">
          <p>
            <strong>PIPEDA</strong> is the federal private-sector privacy law. It covers federally regulated
            organizations and commercial activity in provinces without their own substantially similar law.
          </p>
          <p>
            <strong>Alberta and British Columbia</strong> each have a Personal Information Protection Act (PIPA) for
            private-sector organizations in the province, and <strong>Quebec</strong> has its own private-sector law,
            updated by Law 25. Personal information that crosses provincial or national borders can still bring PIPEDA
            in.
          </p>
          <p className="policy__action">
            <Source href="https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/">
              PIPEDA, Office of the Privacy Commissioner
            </Source>{" "}
            <Source href="https://oipc.ab.ca">Alberta OIPC</Source>
          </p>
        </GuideSection>

        <GuideSection n="03" id="cookies" title="Cookies and analytics">
          <p>
            Canadian regulators treat cookies and similar technologies that track people for marketing or analytics as
            personal information collection, which needs meaningful consent. Essential cookies that make the site work,
            such as a session or a form token, are a different case.
          </p>
          <p>
            The simplest path is often to choose analytics that do not track individuals, and to load advertising pixels
            only after a visitor agrees.
          </p>
        </GuideSection>

        <GuideSection n="04" id="law-25" title="Quebec's Law 25">
          <p>
            Law 25 applies to organizations that collect personal information about people in Quebec, wherever the
            organization is based. For websites, the practical effect is express consent before non-essential cookies
            are activated, a published privacy policy, and a named person responsible for personal information.
          </p>
          <p>
            If your site serves Quebec, plan for this at the design stage. Retrofitting consent onto finished tracking
            is harder than building it in.
          </p>
          <p className="policy__action">
            <Source href="https://www.cai.gouv.qc.ca">Commission d&apos;accès à l&apos;information du Québec</Source>
          </p>
        </GuideSection>

        <GuideSection n="05" id="bill-c36" title="Bill C-36, the next federal law">
          <p>
            Bill C-27 died when Parliament was prorogued in January 2025. Its successor, Bill C-36, the proposed
            Protecting Privacy and Consumer Data Act, received first reading on 15 June 2026. It would replace the
            privacy part of PIPEDA, create a new commissioner within a Digital Safety and Data Protection Commission,
            and allow penalties of up to $10 million or 3 percent of global revenue, rising to $25 million or 5 percent
            for the most serious offences.
          </p>
          <p>It is a bill, not a law. Nothing changes for your website until it passes and comes into force.</p>
          <p className="policy__action">
            <Source href="https://www.canada.ca/en/innovation-science-economic-development/news/2026/06/government-of-canada-introduces-legislation-to-protect-canadians-privacy-in-the-digital-age.html">
              Government of Canada backgrounder
            </Source>
          </p>
        </GuideSection>

        <GuideSection n="06" id="casl" title="Email sign-ups and CASL">
          <p>
            Canada&apos;s Anti-Spam Legislation requires consent before sending commercial email, identification of the
            sender, and a working unsubscribe in every message. For a website, that means a newsletter box that does not
            pre-tick consent and a record of when and how each person agreed.
          </p>
          <p className="policy__action">
            <Source href="https://ised-isde.canada.ca/site/canada-anti-spam-legislation/en">
              Canada&apos;s Anti-Spam Legislation
            </Source>
          </p>
        </GuideSection>

        <GuideSection n="07" id="checklist" title="A website checklist">
          <ul className="policy__checklist">
            <li>A privacy policy that names what each form collects, why, and who to contact.</li>
            <li>Forms that ask only for what the next step needs.</li>
            <li>Tracking and advertising scripts that load only after consent.</li>
            <li>Knowing where form submissions and analytics data are stored, and by whom.</li>
            <li>Unticked email consent with a record of each sign-up.</li>
            <li>
              Accessible forms and pages, the other half of a trustworthy site.{" "}
              <Link className="link" href="/accessibility">
                How this site approaches it
              </Link>
              .
            </li>
          </ul>
          <aside className="policy__note">
            <p className="policy__note-title">Building or rebuilding a site?</p>
            <p>
              Consent, data storage and form design are far easier to get right at the start.{" "}
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
              This guide is general information, last checked on {CHECKED}. Privacy obligations depend on your
              organization and the data involved; confirm them with a privacy lawyer or the relevant regulator.
            </p>
          </aside>
        </GuideSection>
      </GuideLayout>
      <JsonLd data={schema} />
    </>
  );
}
