import type { Metadata } from "next";
import Link from "next/link";
import { servicePages } from "@/lib/content";
import { JsonLd } from "@/components/site/Page";
import { GuideFaq, GuideLayout, GuideSection, Source } from "@/components/site/guide/Guide";
import { breadcrumbSchema, faqPageSchema, graph, pageMetadata, serviceSchema, webPageSchema } from "@/lib/seo";

/**
 * The US page. A Canadian studio wins American work on overlap, not on being
 * cheapest: the same working hours, the same language, and a short trip. It
 * also answers the two website rules US owners search about most, ADA
 * accessibility suits and state privacy laws, without pretending to be a
 * US law firm.
 */

const PATH = "/united-states";
const CHECKED = "6 October 2026";
const TITLE = "Nearshore Web Design and Software Studio for US Companies";
const DESCRIPTION =
  "A Canadian nearshore studio building websites, custom software, automation and AI for US companies, on Mountain Time with full overlap of the US workday.";

export const metadata: Metadata = pageMetadata({
  title: "Nearshore Web & Software Studio for US Companies | Arctos",
  absoluteTitle: true,
  description: DESCRIPTION,
  path: PATH,
  eyebrow: "United States",
  cardTitle: "Your hours. Your language. One border away.",
});

const contents = [
  ["01", "Why a Canadian studio", "why"],
  ["02", "What Arctos builds", "services"],
  ["03", "ADA and accessibility", "ada"],
  ["04", "State privacy laws", "privacy"],
  ["05", "Questions", "faq"],
] as const;

const faq = [
  {
    question: "Do you work with companies in the United States?",
    answer:
      "Yes. Arctos is based in Calgary, Alberta, and works with organizations across Canada and the United States.",
  },
  {
    question: "What time zone does Arctos work in?",
    answer:
      "Mountain Time, the same as Denver and Phoenix. That is one hour ahead of the West Coast and two hours behind New York, so the working day overlaps fully with every continental US time zone.",
  },
  {
    question: "What is nearshore software development?",
    answer:
      "Working with a team in a neighbouring country that shares, or nearly shares, your time zone. Compared with offshore teams, it keeps real-time collaboration: same-day answers, live reviews, and meetings inside normal hours.",
  },
  {
    question: "Can you build a website that meets ADA accessibility expectations?",
    answer:
      "Arctos builds to WCAG Level AA, the standard US courts and the Department of Justice use as the practical benchmark for website accessibility. No one can promise a site will never be sued, but building to the standard from the start is the strongest position.",
  },
  {
    question: "Do US state privacy laws affect our website?",
    answer:
      "They can. Twenty states have comprehensive privacy laws in effect, and many require honouring opt-out signals such as Global Privacy Control. Which apply depends on where your customers live and your size; confirm the details with your counsel.",
  },
];

const schema = graph(
  webPageSchema({ name: TITLE, description: DESCRIPTION, path: PATH }),
  serviceSchema({
    name: "Nearshore web design, software and automation for US companies",
    description: DESCRIPTION,
    path: PATH,
    areaServed: { "@type": "Country", name: "United States" },
  }),
  faqPageSchema(faq),
  breadcrumbSchema([{ name: "United States", path: PATH }]),
);

export default function UnitedStatesPage() {
  return (
    <>
      <GuideLayout
        path={PATH}
        crumb="United States"
        eyebrow="Calgary, Alberta · For US companies"
        title={
          <>
            Your hours. Your language. <em>One border away.</em>
          </>
        }
        intro="Arctos Launchpad is a Canadian studio building websites, custom software, automation and AI for US companies, on Mountain Time, with the whole US workday in reach."
        meta={[
          ["Based in", "Calgary, Alberta, Canada"],
          ["Time zone", "Mountain Time (Denver)"],
          ["Last checked", CHECKED],
        ]}
        contents={contents}
        lead={
          <>
            Offshore teams can be cheaper on paper and slower in practice. A nearshore studio keeps the work in your
            hours, so questions are answered the same day and reviews happen live.
          </>
        }
      >
        <GuideSection n="01" id="why" title="Why a Canadian studio">
          <ul className="policy__checklist">
            <li>
              <strong>Same working day.</strong> Mountain Time sits between both coasts: one hour ahead of San
              Francisco, two behind New York.
            </li>
            <li>
              <strong>Same language and business culture.</strong> Plain English, familiar contracts, and expectations
              that do not need translating.
            </li>
            <li>
              <strong>Currency.</strong> The US dollar has bought roughly 1.35 to 1.42 Canadian dollars through 2026,
              so work priced in Canadian dollars goes further from a US budget.
            </li>
            <li>
              <strong>One connected partner.</strong> Website, software, automation and reporting from one studio
              instead of four vendors in four time zones.
            </li>
          </ul>
        </GuideSection>

        <GuideSection n="02" id="services" title="What Arctos builds">
          <ul className="policy__checklist">
            {servicePages.map((service) => (
              <li key={service.slug}>
                <Link className="link" href={service.route}>
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
          <p className="policy__action">
            <Link className="link" href="/work">
              See the work<span aria-hidden="true">→</span>
            </Link>
          </p>
        </GuideSection>

        <GuideSection n="03" id="ada" title="ADA and website accessibility">
          <p>
            Website accessibility suits under the Americans with Disabilities Act keep rising: roughly 8,700 were filed
            in 2025, and Title III has no small-business exemption. There is no federal rule naming a standard for
            private businesses, but courts consistently treat WCAG 2.1 Level AA as the benchmark.
          </p>
          <p>
            For public entities, the Department of Justice&apos;s Title II rule sets WCAG 2.1 AA, with deadlines
            extended in April 2026 to April 2027 for larger entities and April 2028 for smaller ones.
          </p>
          <p>
            Arctos builds to WCAG Level AA from the first design, which is far cheaper than an audit and retrofit after
            a demand letter.{" "}
            <Link className="link" href="/accessibility">
              How this site approaches it
            </Link>
            .
          </p>
          <p className="policy__action">
            <Source href="https://www.ada.gov/resources/web-guidance/">ADA.gov web accessibility guidance</Source>
          </p>
        </GuideSection>

        <GuideSection n="04" id="privacy" title="State privacy laws">
          <p>
            The US has no single federal privacy law for websites. Instead, twenty states have comprehensive consumer
            privacy laws in effect, each with its own thresholds and rights, and a growing number require sites to
            honour Global Privacy Control, the browser signal that says &ldquo;do not sell or share my data.&rdquo;
          </p>
          <p>
            In practice that means knowing which tracking tools run on the site, loading them only when allowed, and
            respecting opt-out signals automatically. These decisions are cheapest at the design stage.
          </p>
          <aside className="policy__note">
            <p className="policy__note-title">Selling into Canada too?</p>
            <p>
              Canadian rules differ, especially Quebec&apos;s.{" "}
              <Link className="link" href="/guides/canadian-website-privacy">
                Website privacy rules in Canada
              </Link>
              .
            </p>
          </aside>
        </GuideSection>

        <GuideSection n="05" id="faq" title="Questions">
          <GuideFaq items={faq} />
          <aside className="policy__note">
            <p className="policy__note-title">Not legal advice</p>
            <p>
              The ADA and privacy sections are general information, last checked on {CHECKED}. Confirm your obligations
              with US counsel.
            </p>
          </aside>
          <p className="policy__action">
            <Link className="link" href="/contact">
              Start a project<span aria-hidden="true">→</span>
            </Link>
          </p>
        </GuideSection>
      </GuideLayout>
      <JsonLd data={schema} />
    </>
  );
}
