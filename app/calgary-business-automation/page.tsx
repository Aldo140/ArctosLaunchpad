import type { Metadata } from "next";
import { LocalBrief } from "@/components/LocalBrief";

export const metadata: Metadata = {
  title: "Calgary Business Automation",
  description:
    "Workflow review, automation, forms, approvals, follow-up, and integrations for growing Calgary organizations.",
  alternates: { canonical: "/calgary-business-automation" },
};

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
      ctaBody="Describe the workflow that consumes the most time. We will map it and show you where automation is worth the effort."
    />
  );
}
