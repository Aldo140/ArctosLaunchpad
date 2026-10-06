import type { Metadata } from "next";
import Link from "next/link";
import { getProjectBySlug, servicePages } from "@/lib/content";
import { JsonLd } from "@/components/site/Page";
import { GuideFaq, GuideLayout, GuideSection } from "@/components/site/guide/Guide";
import { breadcrumbSchema, faqPageSchema, graph, pageMetadata, serviceSchema, webPageSchema } from "@/lib/seo";

/**
 * The national page. The studio is in Calgary but works across Canada, and
 * Canadian buyers now ask questions a local page never answers: is the vendor
 * Canadian, where will our data live, which province's privacy law applies.
 * Calgary stays the home market; this page carries the rest of the country.
 */

const PATH = "/canada";
const TITLE = "Canadian Web Design and Software Studio";
const DESCRIPTION =
  "A Canadian studio in Calgary building websites, custom software, automation and AI for organizations across Canada, with Canadian privacy and hosting in mind.";

export const metadata: Metadata = pageMetadata({
  title: "Canadian Web Design & Software Studio | Arctos Launchpad",
  absoluteTitle: true,
  description: DESCRIPTION,
  path: PATH,
  eyebrow: "Across Canada",
  cardTitle: "A Canadian studio for Canadian organizations.",
});

const contents = [
  ["01", "What Arctos builds", "services"],
  ["02", "Working from anywhere in Canada", "working"],
  ["03", "Choosing a Canadian partner", "canadian"],
  ["04", "Work across cities", "work"],
  ["05", "Questions", "faq"],
] as const;

const faq = [
  {
    question: "Do you work with businesses outside Calgary?",
    answer:
      "Yes. Arctos is based in Calgary, Alberta, and works with organizations across Canada and the United States. Recent work spans Calgary, Edmonton and Toronto.",
  },
  {
    question: "Is Arctos Launchpad a Canadian company?",
    answer: "Yes. Arctos Launchpad is a digital growth and technology studio based in Calgary, Alberta.",
  },
  {
    question: "Can our website or application be hosted in Canada?",
    answer:
      "Usually, yes. The major cloud providers operate Canadian data centre regions, so a site or application can be hosted in Canada when a project needs it. Where data lives is settled while the project is scoped, not after launch.",
  },
  {
    question: "Which privacy law applies to our website?",
    answer:
      "It depends on your province and who your visitors are. PIPEDA applies federally, Alberta and British Columbia have their own private-sector laws, and Quebec's Law 25 reaches any organization collecting information about people in Quebec. Arctos keeps a plain-language guide to Canadian website privacy rules on this site.",
  },
  {
    question: "Does choosing a Canadian AI integrator help with BDC financing?",
    answer:
      "BDC's LIFT initiative, launched in April 2026, offers preferential terms to businesses that choose a Canadian AI solution or system integrator. Check the current terms with BDC directly.",
  },
];

const proof = ["so-social-collective", "calgary-watch", "nicsdelite"]
  .map((slug) => getProjectBySlug(slug))
  .filter((p) => p !== undefined);

const schema = graph(
  webPageSchema({ name: TITLE, description: DESCRIPTION, path: PATH }),
  serviceSchema({
    name: "Web design, software and automation across Canada",
    description: DESCRIPTION,
    path: PATH,
    areaServed: { "@type": "Country", name: "Canada" },
  }),
  faqPageSchema(faq),
  breadcrumbSchema([{ name: "Across Canada", path: PATH }]),
);

export default function CanadaPage() {
  return (
    <>
      <GuideLayout
        path={PATH}
        crumb="Across Canada"
        eyebrow="Calgary, Alberta · Across Canada"
        title={
          <>
            A Canadian studio for <em>Canadian organizations.</em>
          </>
        }
        intro="Arctos Launchpad builds websites, custom software, automation and AI for organizations across Canada, from a home base in Calgary."
        meta={[
          ["Based in", "Calgary, Alberta"],
          ["Works with", "Organizations across Canada"],
          ["Recent work", "Calgary, Edmonton, Toronto"],
        ]}
        contents={contents}
        lead={
          <>
            Calgary is home. The work travels: the same studio, process and standards for an organization in Halifax as
            for one down the street.
          </>
        }
      >
        <GuideSection n="01" id="services" title="What Arctos builds">
          <p>
            One studio for the connected pieces of a growing business: how it wins customers, runs its work, and sees
            its numbers.
          </p>
          <ul className="policy__checklist">
            {servicePages.map((service) => (
              <li key={service.slug}>
                <Link className="link" href={service.route}>
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </GuideSection>

        <GuideSection n="02" id="working" title="Working from anywhere in Canada">
          <p>
            Most of a project happens in shared documents, staged previews and scheduled calls, so it does not depend on
            being in the same city. Every engagement follows the same route, from understanding the business to
            improving the system in daily use.
          </p>
          <p className="policy__action">
            <Link className="link" href="/process">
              See the process<span aria-hidden="true">→</span>
            </Link>
          </p>
        </GuideSection>

        <GuideSection n="03" id="canadian" title="Choosing a Canadian partner">
          <p>
            More Canadian organizations now ask where a vendor is based, where their data will live, and which
            province&apos;s rules apply. Those questions shape a build from the start:
          </p>
          <ul className="policy__checklist">
            <li>Hosting location settled during scoping, including Canadian regions where a project needs them.</li>
            <li>Forms, cookies and analytics designed around PIPEDA, provincial law and Quebec&apos;s Law 25.</li>
            <li>Accessibility built to WCAG Level AA, the benchmark Canadian accessibility laws reference.</li>
            <li>Funding and financing options, such as BDC LIFT for AI, considered before the budget is set.</li>
          </ul>
          <aside className="policy__note">
            <p className="policy__note-title">Two plain-language guides</p>
            <p>
              <Link className="link" href="/guides/canadian-website-privacy">
                Website privacy rules in Canada
              </Link>{" "}
              and{" "}
              <Link className="link" href="/guides/alberta-digital-funding">
                funding for software and AI
              </Link>
              .
            </p>
          </aside>
        </GuideSection>

        <GuideSection n="04" id="work" title="Work across cities">
          <ul className="policy__checklist">
            {proof.map((project) => (
              <li key={project.slug}>
                <Link className="link" href={project.route}>
                  {project.title}
                </Link>
                : {project.summary}
              </li>
            ))}
          </ul>
          <p className="policy__action">
            <Link className="link" href="/work">
              All case studies<span aria-hidden="true">→</span>
            </Link>
          </p>
        </GuideSection>

        <GuideSection n="05" id="faq" title="Questions">
          <GuideFaq items={faq} />
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
