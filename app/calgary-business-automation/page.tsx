import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { LocalBrief } from "@/components/LocalBrief";

export const metadata: Metadata = pageMetadata({
  title: "Business Automation Calgary | Arctos Launchpad",
  absoluteTitle: true,
  description:
    "Business process automation in Calgary: workflows, forms, approvals, follow-up, and integrations that remove manual admin and spreadsheet work.",
  path: "/calgary-business-automation",
  eyebrow: "Calgary business automation",
  cardTitle: "Less manual work. Fewer things falling through.",
});

const faq = [
  {
    question: "What business processes can be automated?",
    answer:
      "Common examples are email-based approvals, spreadsheet tracking, manual data entry, repetitive reporting, lead follow-up, and moving information between disconnected software.",
  },
  {
    question: "Do we need to replace our current software to automate?",
    answer:
      "Usually not. Arctos improves and connects the tools you already use where practical, and only recommends new software when the current setup cannot do the job.",
  },
  {
    question: "How does a business automation project start?",
    answer:
      "With a review of how the work happens today: who does what, where information is re-typed, and where things get delayed or lost. The automation plan comes from that review, not from a tool list.",
  },
  {
    question: "Can automation include AI?",
    answer:
      "Yes, where it genuinely helps, for example sorting incoming requests or drafting routine responses. Arctos uses AI only where it is reliable enough for the task and keeps people in control of decisions that matter.",
  },
  {
    question: "Do you work with organizations outside Calgary?",
    answer:
      "Yes. Arctos is based in Calgary, Alberta, and works with organizations across Canada and the United States.",
  },
];

export default function Page() {
  return (
    <LocalBrief
      canonical="/calgary-business-automation"
      title="Less repetitive administration. A better connected operation."
      intro="Arctos reviews how work moves through your organization, removes the unnecessary manual steps, and connects the platforms your team already uses."
      thesis={{
        lead: "Growth usually arrives as more admin before it arrives as more margin.",
        punch: "More leads should not mean more manual work.",
      }}
      auditTitle="Signs the process is carrying the team"
      audit={[
        "Approvals happen over email and stall when someone is away.",
        "The same information is entered into two or more systems.",
        "Reporting is rebuilt by hand every week or month.",
        "Follow-up depends on somebody remembering.",
        "Nobody can say where a given job actually is right now.",
      ]}
      serviceSlug="business-automation"
      proofSlug="fresh-prep-event-intelligence"
      ctaTitle="Which task should stop being manual first?"
      faq={faq}
      ctaBody="Describe the workflow that consumes the most time. We will map it and show you where automation is worth the effort."
    />
  );
}
