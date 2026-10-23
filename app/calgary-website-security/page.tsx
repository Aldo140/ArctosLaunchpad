import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { LocalBrief } from "@/components/LocalBrief";

export const metadata: Metadata = pageMetadata({
  title: "Website Security Calgary | Hardening & Risk Reviews",
  absoluteTitle: true,
  description:
    "Website security help for Calgary organizations: exposure reviews, updates, access controls, backups, monitoring and practical incident readiness.",
  path: "/calgary-website-security",
  eyebrow: "Calgary website security",
  cardTitle: "Know what is exposed. Fix what matters first.",
});

const faq = [
  {
    question: "Can Arctos tell whether our website uses a vulnerable PHP version?",
    answer:
      "Yes. A review can identify the public technology footprint and, with hosting access, confirm the PHP runtime, framework, content-management system, plugins and dependencies actually in use. Version detection alone is not a complete security assessment, but it is the right first inventory step.",
  },
  {
    question: "What should we do when a critical web vulnerability is announced?",
    answer:
      "Identify the affected product and versions, compare them with your real inventory, preserve logs and backups, apply the vendor-supported update, test the site, and then look for signs the flaw was exploited before the patch. A backup does not prove a system is clean.",
  },
  {
    question: "Do you provide emergency incident response or a 24/7 SOC?",
    answer:
      "No. Arctos can harden and repair websites, improve monitoring and coordinate the technical website work. Active intrusions, malware forensics, ransomware, regulated-data breaches and around-the-clock monitoring should involve a qualified incident-response or managed-security provider.",
  },
  {
    question: "Does a website going offline mean data was stolen?",
    answer:
      "No. An organization may take a service offline as a precaution while it verifies exposure or patches it. Availability loss, confirmed exploitation and a confirmed data breach are different facts and should be reported separately.",
  },
  {
    question: "Do you work outside Calgary?",
    answer:
      "Yes. Arctos is based in Calgary and works with organizations across Canada and the United States.",
  },
];

export default function Page() {
  return (
    <LocalBrief
      canonical="/calgary-website-security"
      title="Know what is exposed. Fix what matters first."
      intro="Arctos helps Calgary organizations reduce website risk with a verified technology inventory, supported updates, safer access, tested recovery and monitoring that produces an actionable alert."
      thesis={{
        lead: "Most website incidents begin with an ordinary gap: an unsupported runtime, a forgotten plugin, a shared administrator account or a backup nobody has restored.",
        punch: "Security starts with knowing what you run and who can change it.",
      }}
      auditTitle="Where website risk tends to accumulate"
      audit={[
        "Nobody owns the update schedule for the runtime, CMS, plugins and dependencies.",
        "Administrator accounts are shared or do not use phishing-resistant multi-factor authentication.",
        "Backups exist, but a clean restore has never been tested.",
        "Logs are too short-lived or scattered to investigate an incident.",
        "Old forms, integrations, staging sites and DNS records remain publicly reachable.",
      ]}
      serviceSlug="web-design-development"
      proofSlug="starlings-support-map"
      ctaTitle="What would you need to recover tomorrow?"
      ctaBody="We will inventory the website, rank the practical risks and give you a remediation plan. If the situation needs specialist incident response, we will say so early."
      faq={faq}
    />
  );
}
