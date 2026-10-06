import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { LocalBrief } from "@/components/LocalBrief";

export const metadata: Metadata = pageMetadata({
  title: "SEO Calgary: Local SEO & AI Search | Arctos Launchpad",
  absoluteTitle: true,
  description:
    "SEO in Calgary for growing businesses: local SEO, technical foundations, and service pages structured for Google and AI answers like ChatGPT.",
  path: "/calgary-seo",
  eyebrow: "Calgary SEO",
  cardTitle: "Be the answer when Calgary searches.",
});

const faq = [
  {
    question: "How long does SEO take to work?",
    answer:
      "Search visibility builds over months, not weeks. Technical fixes and clearer service pages can be indexed quickly, but rankings depend on competition and demand, so Arctos measures progress against the searches that bring real enquiries.",
  },
  {
    question: "Do you guarantee first-page rankings?",
    answer:
      "No. No one can honestly guarantee a position on Google. Arctos focuses on the foundations that earn visibility: clear service pages, local relevance, technical health, and content that answers real customer questions.",
  },
  {
    question: "What is AI search optimization (GEO)?",
    answer:
      "It is making your business information clear, structured, and credible enough that AI assistants such as ChatGPT, Google AI Overviews, Perplexity, and Claude can understand it and cite it when someone asks for a recommendation.",
  },
  {
    question: "Can you help us show up in Google Maps for Calgary searches?",
    answer:
      "Yes. Local SEO is part of the service: consistent business details, location-relevant service pages, and the groundwork that supports your Google Business Profile.",
  },
  {
    question: "Do you work with businesses outside Calgary?",
    answer:
      "Yes. Arctos is based in Calgary, Alberta, and works with organizations across Canada and the United States.",
  },
];

export default function Page() {
  return (
    <LocalBrief
      canonical="/calgary-seo"
      title="Be found when Calgary is already looking."
      intro="Arctos helps Calgary organizations become easier to find and easier to understand, on Google, in Maps, and in the AI answers customers increasingly ask first."
      thesis={{
        lead: "Your next customer is typing a question into Google or ChatGPT right now.",
        punch: "Make sure the answer points to you.",
      }}
      auditTitle="When search is not pulling its weight"
      audit={[
        "The business does not appear for the services it actually sells.",
        "Service pages do not say plainly what you do and where.",
        "Competitors appear in AI answers and you do not.",
        "Pages load slowly or have technical search issues.",
        "There is no way to tell which searches bring enquiries.",
      ]}
      serviceSlug="seo-ai-search"
      proofSlug="rio-alto"
      ctaTitle="Where should customers be finding you?"
      faq={faq}
      ctaBody="Tell us which services matter most and where you would like to be found for them."
    />
  );
}
