import type { Metadata } from "next";
import { LocalBrief } from "@/components/LocalBrief";

export const metadata: Metadata = {
  title: "Calgary Custom Software",
  description:
    "Custom applications, portals, internal tools, and workflow systems from a Calgary-based studio.",
  alternates: { canonical: "/calgary-custom-software" },
};

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
      ctaBody="Tell us which process the business depends on and what nothing currently supports."
    />
  );
}
