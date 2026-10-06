import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { LocalBrief } from "@/components/LocalBrief";

export const metadata: Metadata = pageMetadata({
  title: "App Development Calgary: Web & Mobile | Arctos Launchpad",
  absoluteTitle: true,
  description:
    "App development in Calgary: web apps, progressive web apps, and cross-platform mobile apps, from first release to the version real users depend on.",
  path: "/calgary-app-development",
  eyebrow: "Calgary app development",
  cardTitle: "Ship the first version, then the one that lasts.",
});

const faq = [
  {
    question: "How much does app development cost in Calgary?",
    answer:
      "It depends on the number of features, the platforms, and the integrations the first release needs. Arctos scopes the first release with you so the budget goes to the version worth shipping.",
  },
  {
    question: "Do you build iOS and Android apps?",
    answer:
      "Arctos builds progressive web applications and cross-platform mobile applications that run on both iOS and Android, and will say when a fully native build is the better answer.",
  },
  {
    question: "Who owns the code?",
    answer:
      "The work is documented and the code is yours. Arctos can continue supporting the application or hand it over to your team.",
  },
  {
    question: "Can you take over an existing app?",
    answer:
      "Yes. That normally starts with a review of the codebase, the deployment setup, and the highest-risk parts.",
  },
  {
    question: "Do you work with startups and established businesses?",
    answer:
      "Yes, both. What matters is a clear first release and someone who owns the product after launch.",
  },
];

export default function Page() {
  return (
    <LocalBrief
      canonical="/calgary-app-development"
      title="Build the app the off-the-shelf tools cannot."
      intro="Arctos builds web and mobile applications for Calgary organizations with a product to launch or a process no existing tool covers, from the first release onward."
      thesis={{
        lead: "The part that sets a business apart is usually the part no vendor sells.",
        punch: "That part deserves its own product.",
      }}
      auditTitle="When it is time to build the app"
      audit={[
        "A product idea has no clear route to a first release.",
        "A prototype exists but cannot carry real users.",
        "Features are bolted onto software never meant to hold them.",
        "Nobody clearly owns the application after launch.",
        "Releases feel risky enough to avoid.",
      ]}
      serviceSlug="app-software-development"
      proofSlug="leaseflow"
      ctaTitle="What should the first release do?"
      faq={faq}
      ctaBody="Describe the app, who will use it, and what it must get right on day one."
    />
  );
}
