import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { LocalBrief } from "@/components/LocalBrief";

export const metadata: Metadata = pageMetadata({
  title: "Website Design for Calgary Contractors & Trades | Arctos Launchpad",
  absoluteTitle: true,
  description:
    "Websites for Calgary contractors, renovators, millwork and fabrication shops: show your work, get quote requests with the details you need, and stop chasing leads by phone.",
  path: "/calgary-contractor-websites",
  eyebrow: "Calgary contractors and trades",
  cardTitle: "A website that brings you real quote requests.",
});

const faq = [
  {
    question: "How much does a contractor website cost in Calgary?",
    answer:
      "It depends on how many services and project photos you want to show and whether the site needs a detailed quote form or a way to track jobs. Tell Arctos what you do and how quotes reach you today, and you will get an estimate based on that.",
  },
  {
    question: "Can customers send photos and measurements with a quote request?",
    answer:
      "Yes. The quote form can ask for the job type, address area, timeline, budget range, measurements and photos, so you can price or qualify the job before the first call.",
  },
  {
    question: "Will it help me show up on Google in Calgary?",
    answer:
      "The site is built with the groundwork Google looks for: a page per service, the areas you serve, fast loading and clear structure. Arctos does not promise rankings, because results depend on competition, but the foundations are done properly.",
  },
  {
    question: "I already have a website. Do I need a new one?",
    answer:
      "Not always. If the site looks fine but the phone does not ring, a better quote form and clearer service pages may be enough. A rebuild is only worth it when the current site is holding you back.",
  },
  {
    question: "Can it do more than a website later?",
    answer:
      "Yes. Once quotes come in through the site, they can flow into a simple job list, follow-up emails and a report of what is booked, so nothing depends on a notebook or a spreadsheet.",
  },
  {
    question: "Have you built intake forms for specialist work before?",
    answer:
      "Yes. Arctos built True North Kromes' website, where dental laboratories submit detailed production cases through a structured intake instead of email back-and-forth.",
  },
];

export default function Page() {
  return (
    <LocalBrief
      canonical="/calgary-contractor-websites"
      title="A website that brings you real quote requests."
      intro="Arctos designs websites for Calgary contractors and trades: renovators, millwork and cabinet shops, fabricators, landscapers and sign shops. Your work is shown properly, and every quote request arrives with the details you need to price it."
      thesis={{
        lead: "Most contractor sites show a few photos and a phone number, then the real work happens over twenty texts.",
        punch: "The website should do the first conversation for you.",
      }}
      auditTitle="When the website isn't pulling its weight"
      audit={[
        "Quote requests arrive with no photos, size or budget.",
        "You spend evenings calling back leads that were never a fit.",
        "Your best projects are not on the site, or are hard to find.",
        "People find you on Google but call a competitor instead.",
        "Booked jobs and follow-ups live in a notebook or spreadsheet.",
      ]}
      serviceSlug="web-design-development"
      proofSlug="true-north-kromes"
      ctaTitle="How do quote requests reach you today?"
      faq={faq}
      ctaBody="Tell us what you build and where good leads get lost. We will show you what your site and quote form should ask."
    />
  );
}
