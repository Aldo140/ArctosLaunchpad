import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { LocalBrief } from "@/components/LocalBrief";

export const metadata: Metadata = pageMetadata({
  title: "Calgary Digital Marketing & Google Ads | Arctos Launchpad",
  absoluteTitle: true,
  description:
    "Digital marketing and lead generation in Calgary: Google Ads, paid social, landing pages, CRM lead routing, and reporting tied to real enquiries.",
  path: "/calgary-digital-marketing",
  eyebrow: "Calgary digital marketing",
  cardTitle: "Build the path after the click.",
});

const faq = [
  {
    question: "Do you manage Google Ads for Calgary businesses?",
    answer:
      "Yes. Paid search and paid social are part of the service, connected to the landing page, form, CRM, follow-up, and reporting so spend can be traced to real enquiries.",
  },
  {
    question: "Do you only manage the ads?",
    answer:
      "No. The service is built around connecting the campaign to everything after the click. If you only want someone to manage ad spend, a different provider is a better fit.",
  },
  {
    question: "Can you improve our current lead flow without new ads?",
    answer:
      "Yes. The work can begin by finding where enquiries slow down, disappear, or lose context, which often improves results before any extra spend.",
  },
  {
    question: "How do you measure campaign performance?",
    answer:
      "Against the useful actions available in the business, such as qualified enquiries, booked calls, and sales, not impressions alone.",
  },
  {
    question: "Do you work with businesses outside Calgary?",
    answer:
      "Yes. Arctos is based in Calgary, Alberta, and works with organizations anywhere in Canada.",
  },
];

export default function Page() {
  return (
    <LocalBrief
      canonical="/calgary-digital-marketing"
      title="Campaigns that end in conversations, not just clicks."
      intro="Arctos runs lead-generation campaigns for Calgary organizations and builds what happens after the click: the landing page, the form, the follow-up, and the report."
      thesis={{
        lead: "Most campaigns do not fail at the ad. They fail after the click.",
        punch: "So the whole path gets built.",
      }}
      auditTitle="When marketing spend is hard to justify"
      audit={[
        "Leads arrive inconsistently, or not at all.",
        "Enquiries are low quality or poorly matched.",
        "Ads send traffic to a generic homepage.",
        "Follow-up is slow, so good leads go cold.",
        "Reports show clicks but not sales.",
      ]}
      serviceSlug="paid-media-lead-generation"
      proofSlug="leaseflow"
      ctaTitle="Where are your leads getting lost?"
      faq={faq}
      ctaBody="Tell us how enquiries arrive today and what happens to them next."
    />
  );
}
