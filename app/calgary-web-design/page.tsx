import type { Metadata } from "next";
import { LocalBrief } from "@/components/LocalBrief";

export const metadata: Metadata = {
  title: "Calgary Web Design and Development",
  description:
    "Conversion-focused website design and development for growing Calgary businesses, connected to lead capture, CRM workflows, analytics, and ongoing improvement.",
  alternates: { canonical: "/calgary-web-design" },
};

export default function Page() {
  return (
    <LocalBrief
      canonical="/calgary-web-design"
      title="A website built to carry the business forward."
      intro="Arctos designs and develops websites for Calgary organizations that need clearer positioning, stronger conversion, and a better system behind every enquiry."
      thesis={{
        lead: "Your website is often where search, advertising, referrals, reputation, and sales meet.",
        punch: "It should do more than look current.",
      }}
      auditTitle="When the website becomes the bottleneck"
      audit={[
        "Qualified visitors cannot quickly understand the offer.",
        "Pages are difficult for your team to update.",
        "Forms create manual follow-up instead of a clear workflow.",
        "Search visibility, speed, or accessibility has fallen behind.",
        "Analytics do not explain what visitors do next.",
      ]}
      serviceSlug="web-design-development"
      proofSlug="rio-alto"
      ctaTitle="What should your website do better?"
      ctaBody="Tell us where the current experience is costing attention, enquiries, time, or confidence."
    />
  );
}
