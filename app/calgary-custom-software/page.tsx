import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { LocalBrief } from "@/components/LocalBrief";

export const metadata: Metadata = pageMetadata({
  title: "Custom Software Development Calgary | Apps and Portals",
  description:
    "Custom software development in Calgary: web apps, client portals, internal tools, and workflow systems built around how your business operates.",
  path: "/calgary-custom-software",
  eyebrow: "Calgary custom software",
  cardTitle: "Software built around how your business works.",
});

const faq = [
  {
    question: "When does a business need custom software instead of an off-the-shelf tool?",
    answer:
      "When the team is stitching several tools together with spreadsheets and manual steps, or when an off-the-shelf product forces a process that does not fit how the business works. Arctos first checks whether existing tools can be configured or connected before recommending a custom build.",
  },
  {
    question: "What kinds of custom software does Arctos build?",
    answer:
      "Web applications, client and staff portals, internal tools, dashboards, and workflow systems, including software that connects to the tools a business already uses.",
  },
  {
    question: "Can custom software integrate with our existing systems?",
    answer:
      "Yes. Connecting to existing CRMs, accounting tools, spreadsheets, and databases is a normal part of the work, so the new software improves the current setup rather than replacing everything.",
  },
  {
    question: "Who owns the software once it is built?",
    answer:
      "Ownership terms are set out in the project agreement before work begins, so you know exactly what you are getting.",
  },
  {
    question: "Do you work with organizations outside Calgary?",
    answer:
      "Yes. Arctos is based in Calgary, Alberta, and works with organizations anywhere in Canada.",
  },
];

export default function Page() {
  return (
    <LocalBrief
      canonical="/calgary-custom-software"
      title="Software shaped around how your business actually works."
      intro="When the off-the-shelf tool almost fits, the gap usually gets filled by spreadsheets and people. Arctos builds the part that is missing."
      thesis={{
        lead: "Most operations run on software that was designed for somebody else's process.",
        punch: "Build the exception, not the whole stack.",
      }}
      auditTitle="When custom becomes the cheaper option"
      audit={[
        "A spreadsheet has quietly become critical infrastructure.",
        "Staff maintain a workaround the vendor will never support.",
        "Licence costs scale with people rather than with value.",
        "Two systems disagree and someone reconciles them by hand.",
        "The process that differentiates the business is the one nothing supports.",
      ]}
      serviceSlug="custom-software"
      proofSlug="calgary-watch"
      ctaTitle="What is the spreadsheet holding together?"
      faq={faq}
      ctaBody="Tell us which process the business depends on and what nothing currently supports."
    />
  );
}
