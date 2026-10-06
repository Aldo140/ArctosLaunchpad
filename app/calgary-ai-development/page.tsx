import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { LocalBrief } from "@/components/LocalBrief";

export const metadata: Metadata = pageMetadata({
  title: "AI Development Calgary | AI Automation and Consulting",
  description:
    "AI development and consulting in Calgary: enquiry routing, document classification, summarisation, and AI workflows with a person approving what matters.",
  path: "/calgary-ai-development",
  eyebrow: "Calgary AI development",
  cardTitle: "Put intelligence where the manual work is.",
});

const faq = [
  {
    question: "How can a small or mid-sized Calgary business use AI?",
    answer:
      "Common starting points are routing incoming enquiries, summarising calls and meetings, classifying documents, and drafting routine replies, always with a person approving anything consequential.",
  },
  {
    question: "Do we need AI, or would automation be enough?",
    answer:
      "Often a rules-based automation is the more reliable and cheaper answer. Arctos will say so instead of selling AI anyway.",
  },
  {
    question: "Is our data used to train someone else's model?",
    answer:
      "No. Providers and configurations are chosen so your data is not retained for training, and the data handling is documented as part of the work.",
  },
  {
    question: "What happens when the AI gets something wrong?",
    answer:
      "Anything with real consequences keeps a human approval step, and the system is built to escalate cases it is not confident about rather than guess.",
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
      canonical="/calgary-ai-development"
      title="Put AI where the manual work is."
      intro="Arctos helps Calgary organizations find the routine, text-heavy work worth handing to AI, then builds it into existing systems with human review where it counts."
      thesis={{
        lead: "A great deal of routine work is judgement applied to text.",
        punch: "Some of it is ready for AI. Some of it is not.",
      }}
      auditTitle="When AI is worth a serious look"
      audit={[
        "Staff read and re-key the same information every day.",
        "Enquiries are triaged by hand before anyone can act.",
        "Documents and calls are summarised manually.",
        "An AI pilot never made it into daily use.",
        "Nobody can say whether AI output can be trusted.",
      ]}
      serviceSlug="ai-product-development"
      proofSlug="fresh-prep-event-intelligence"
      ctaTitle="What work should AI take off your plate?"
      faq={faq}
      ctaBody="Describe the repetitive, text-heavy task your team would most like to stop doing by hand."
    />
  );
}
