import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/site/Page";
import { GuideFaq, GuideLayout, GuideSection as Section, Source } from "@/components/site/guide/Guide";
import {
  ORGANIZATION_ID,
  breadcrumbSchema,
  faqPageSchema,
  graph,
  pageMetadata,
  webPageSchema,
} from "@/lib/seo";

/**
 * A reference guide, deliberately kept out of the main navigation: it answers
 * a question Calgary owners search for often ("is there funding for this?")
 * without turning the studio into a grants site. Every program fact links to
 * its official source and carries the date it was last checked, because
 * program terms change between intakes.
 */

const PATH = "/guides/alberta-digital-funding";
const CHECKED = "6 October 2026";
const CHECKED_ISO = "2026-10-06";

const TITLE = "Funding for Websites, Software and AI in Calgary and Alberta (2026)";
const DESCRIPTION =
  "Grants and loans that help Calgary businesses pay for software, AI, and digital projects in 2026: BDC LIFT, Alberta Innovates, IRAP, SR&ED, and CDAP.";

export const metadata: Metadata = pageMetadata({
  title: "Alberta Funding for Software & AI (2026) | Arctos Launchpad",
  absoluteTitle: true,
  description: DESCRIPTION,
  path: PATH,
  eyebrow: "Guide",
  cardTitle: "Funding for software and AI in Alberta, 2026.",
});

const contents = [
  ["01", "The short answer", "short-answer"],
  ["02", "CDAP has closed", "cdap"],
  ["03", "BDC LIFT, for AI adoption", "bdc-lift"],
  ["04", "Alberta Innovates", "alberta-innovates"],
  ["05", "NRC IRAP", "irap"],
  ["06", "SR&ED tax credits", "sred"],
  ["07", "What funding rarely covers", "not-covered"],
  ["08", "Questions", "faq"],
] as const;

const faq = [
  {
    question: "Are there grants for small business websites in Calgary in 2026?",
    answer:
      "Rarely for a standard marketing website. The federal Canada Digital Adoption Program, which covered website and e-commerce work, closed in 2024 with no direct replacement. Alberta and federal innovation programs fund new technology development, not routine website rebuilds, so most website projects are paid for directly or financed.",
  },
  {
    question: "What replaced the Canada Digital Adoption Program (CDAP)?",
    answer:
      "No direct replacement has been announced. Businesses now look to BDC's LIFT initiative for AI adoption financing, Alberta Innovates programs for digital technology companies, NRC IRAP for technology innovation, and SR&ED tax credits for experimental software development.",
  },
  {
    question: "Is there funding for AI projects in Alberta?",
    answer:
      "Yes, mainly as financing rather than grants. BDC's LIFT initiative, launched in April 2026, pairs small and medium-sized businesses with advisors to find where AI fits and then offers loans to implement it. Alberta Innovates and NRC IRAP can also support AI work that involves developing new technology.",
  },
  {
    question: "Does custom software qualify for SR&ED?",
    answer:
      "Sometimes. SR&ED rewards experimental development that resolves a technological uncertainty existing knowledge cannot answer. Building custom software with established methods usually does not qualify; genuinely novel technical work can.",
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
      "Small business grants Calgary",
      "Alberta technology funding",
      "BDC LIFT AI financing",
      "Alberta Innovates Digital Traction Program",
      "NRC IRAP",
      "SR&ED tax credits",
      "Canada Digital Adoption Program",
    ],
  },
  faqPageSchema(faq),
  breadcrumbSchema([{ name: "Funding guide", path: PATH }]),
);



export default function FundingGuidePage() {
  return (
    <>
      <GuideLayout
        path={PATH}
        crumb="Funding guide"
        eyebrow="Guide · Calgary, Alberta"
        title={
          <>
            Funding for software and AI <em>in Alberta, 2026.</em>
          </>
        }
        intro="What can actually help a Calgary business pay for a software, AI, or digital project this year, what has closed, and what most programs will not cover."
        meta={[
          ["Document", "Reference guide"],
          ["Covers", "Alberta and federal programs"],
          ["Last checked", CHECKED],
        ]}
        contents={contents}
        lead={<>Arctos is a studio, not a funding agency or grant writer. This guide exists because clients ask the same
              question before almost every build, and the answers are scattered.</>}
      >

            <Section n="01" id="short-answer" title="The short answer">
              <ul className="policy__checklist">
                <li>A standard website rebuild is rarely grant-eligible in 2026. CDAP, which covered it, is closed.</li>
                <li>AI adoption has new federal financing: BDC&apos;s LIFT initiative, launched April 2026.</li>
                <li>Alberta digital technology companies can apply to Alberta Innovates programs.</li>
                <li>Novel technical work may earn SR&amp;ED tax credits or NRC IRAP support.</li>
              </ul>
            </Section>

            <Section n="02" id="cdap" title="The Canada Digital Adoption Program has closed">
              <p>
                CDAP was the program most small businesses used for websites, e-commerce, and digital plans. Its Boost
                Your Business Technology stream stopped taking applications in February 2024 and the Grow Your Business
                Online micro-grant closed in September 2024. No direct federal replacement has been announced, so
                anything still advertising a CDAP website grant is out of date.
              </p>
            </Section>

            <Section n="03" id="bdc-lift" title="BDC LIFT, for AI adoption">
              <p>
                The Business Development Bank of Canada launched LIFT (Lead with Innovation and Focus on Technology) in
                April 2026 with $500 million committed. It connects small and medium-sized businesses with advisors who
                identify where AI fits in the business, then offers financing, up to $5 million, to implement it, with
                preferential terms for choosing a Canadian AI solution or integrator.
              </p>
              <p>It is a loan, not a grant, so it suits a project with a clear business case.</p>
              <p className="policy__action">
                <Source href="https://www.bdc.ca">Business Development Bank of Canada</Source>
              </p>
            </Section>

            <Section n="04" id="alberta-innovates" title="Alberta Innovates">
              <p>
                <strong>Alberta Digital Traction Program.</strong> Up to $50,000 in non-dilutive funding, covering up to
                75 percent of a project, for Alberta digital technology companies with software at the core of their
                product. Applicants contribute at least 25 percent in cash and must have fewer than 50 full-time
                employees and under $1 million in annual recurring revenue. Intake is continuous.
              </p>
              <p>
                <strong>Micro Voucher Program.</strong> For Alberta small and medium-sized businesses developing a novel
                digital technology, with a minimum 25 percent cash contribution. Registration for the most recent intake
                closed on 29 May 2026, so watch for the next one.
              </p>
              <p className="policy__action">
                <Source href="https://albertainnovates.ca/funding/alberta-digital-traction-program/">
                  Digital Traction Program
                </Source>{" "}
                <Source href="https://albertainnovates.ca/funding/micro-voucher-program/">Micro Voucher Program</Source>
              </p>
            </Section>

            <Section n="05" id="irap" title="NRC IRAP">
              <p>
                The National Research Council&apos;s Industrial Research Assistance Program supports Canadian small and
                medium-sized businesses developing new technology, combining advisory help with funding. It starts with
                a conversation with an Industrial Technology Advisor rather than an open application form.
              </p>
              <p className="policy__action">
                <Source href="https://nrc.canada.ca/en/support-technology-innovation">NRC IRAP</Source>
              </p>
            </Section>

            <Section n="06" id="sred" title="SR&ED tax credits">
              <p>
                Scientific Research and Experimental Development tax credits reward work that resolves a technological
                uncertainty existing knowledge cannot answer. Custom software or AI work can qualify when it is
                genuinely experimental; building with established methods usually does not. Keep technical records as
                the work happens, because claims depend on them.
              </p>
              <p className="policy__action">
                <Source href="https://www.canada.ca/en/revenue-agency/services/scientific-research-experimental-development-tax-incentive-program.html">
                  SR&amp;ED program, Canada Revenue Agency
                </Source>
              </p>
            </Section>

            <Section n="07" id="not-covered" title="What funding rarely covers">
              <p>
                Innovation programs fund new technology, not routine improvements. A marketing website redesign, a
                CRM setup, or a standard automation built from existing tools is usually paid for directly. That is
                worth knowing before a project is delayed waiting on a grant that will not come.
              </p>
              <aside className="policy__note">
                <p className="policy__note-title">Before you apply anywhere</p>
                <p>
                  Most applications ask for a defined project: what will be built, what it should cost, and why it
                  matters. Scoping that is the first step of any Arctos project, so if you are weighing a funded build,{" "}
                  <Link className="link" href="/contact?need=software">
                    start with the scope
                  </Link>
                  .
                </p>
              </aside>
            </Section>

            <Section n="08" id="faq" title="Questions">
              <GuideFaq items={faq} />
              <aside className="policy__note">
                <p className="policy__note-title">Check before you rely on this</p>
                <p>
                  Program terms, intakes, and amounts change. This guide was last checked on {CHECKED} and is general
                  information, not financial advice. Confirm details on each program&apos;s official site.
                </p>
              </aside>
            </Section>
      </GuideLayout>
      <JsonLd data={schema} />
    </>
  );
}
