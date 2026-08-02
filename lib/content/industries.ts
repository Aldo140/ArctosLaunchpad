/* =========================================================================
   ARCTOS — the industries, and their lookups
   -------------------------------------------------------------------------
   Was part of one 1,900-line lib/content.ts. Split by subject so a content
   edit touches one reviewable file. Import from "@/lib/content" as before —
   index.ts re-exports everything, so no call site changed.
   ========================================================================= */

import type { Industry, IndustryPage } from "./types";

export const industryPages: IndustryPage[] = [
  {
    slug: "healthcare-dental",
    route: "/industries/healthcare-dental",
    title: "Healthcare and dental",
    headline:
      "Clearer patient and client journeys, with better systems behind them.",
    summary:
      "Digital experiences and operational workflows can be shaped around enquiries, intake, communication, and specialized service delivery.",
    challenges: [
      "Outdated websites",
      "Manual intake",
      "Disconnected customer information",
      "Repetitive administration",
    ],
    relevantServices: [
      "web-design-development",
      "business-automation",
      "crm-integrations",
      "custom-software",
    ],
    note: "Arctos does not assume every healthcare organisation has the same workflow. Discovery includes the privacy and operational context of the work.",
  },
  {
    slug: "manufacturing",
    route: "/industries/manufacturing",
    title: "Manufacturing",
    headline:
      "Connect a specialized offering to the workflow that delivers it.",
    summary:
      "Websites, portals, integrations, and reporting can make complex offerings easier to understand and operational information easier to manage.",
    challenges: [
      "Complex services",
      "Manual quoting or intake",
      "Disconnected operational platforms",
      "Limited performance visibility",
    ],
    relevantServices: [
      "web-design-development",
      "business-automation",
      "custom-software",
      "analytics-reporting",
    ],
    note: "The system is designed around the manufacturer's actual customer and operational process.",
  },
  {
    slug: "nonprofits",
    route: "/industries/nonprofits",
    title: "Nonprofits",
    headline:
      "Useful digital services for the people and communities you support.",
    summary:
      "Arctos can help nonprofits improve resource discovery, public experiences, internal workflows, and reporting.",
    challenges: [
      "Information that is difficult to find",
      "Manual programme administration",
      "Disconnected data",
      "Limited internal capacity",
    ],
    relevantServices: [
      "web-design-development",
      "custom-software",
      "business-automation",
      "analytics-reporting",
    ],
    note: "Starlings Support Map is a launched nonprofit platform in the Arctos project portfolio.",
  },
  {
    slug: "construction-trades",
    route: "/industries/construction-trades",
    title: "Construction and trades",
    headline:
      "Move enquiries, quotes, approvals, and project information with less friction.",
    summary:
      "A connected website and workflow can help a busy team respond consistently without adding more spreadsheet and inbox work.",
    challenges: [
      "Inconsistent lead quality",
      "Slow quote follow-up",
      "Email-based approvals",
      "Spreadsheet tracking",
    ],
    relevantServices: [
      "paid-media-lead-generation",
      "web-design-development",
      "crm-integrations",
      "business-automation",
    ],
    note: "The right starting point depends on how the business wins work and manages it after the enquiry.",
  },
  {
    slug: "real-estate",
    route: "/industries/real-estate",
    title: "Real estate",
    headline: "Turn property interest into an organized customer workflow.",
    summary:
      "Arctos connects listing traffic, enquiry experiences, lead handling, and operational information.",
    challenges: [
      "Scattered listing enquiries",
      "Manual follow-up",
      "Unorganized application information",
      "Disconnected property tools",
    ],
    relevantServices: [
      "web-design-development",
      "crm-integrations",
      "custom-software",
      "business-automation",
    ],
    note: "LeaseFlow is an Arctos product concept and working demo for independent landlords and property managers.",
  },
  {
    slug: "professional-services",
    route: "/industries/professional-services",
    title: "Professional services",
    headline: "Make expertise easier to find, understand, and engage.",
    summary:
      "A clear digital presence and connected intake process can move qualified prospects from research to a useful first conversation.",
    challenges: [
      "Generic positioning",
      "Low-quality enquiries",
      "Manual intake",
      "Leads lost after contact",
    ],
    relevantServices: [
      "seo-ai-search",
      "branding-content",
      "web-design-development",
      "crm-integrations",
    ],
    note: "Arctos maps the marketing and delivery process before recommending the system.",
  },
  {
    slug: "saas",
    title: "SaaS",
    headline:
      "Connect product communication, acquisition, and operating insight.",
    summary:
      "Arctos supports product experiences, lead journeys, internal tools, and the reporting behind continued improvement.",
    challenges: [
      "Unclear product value",
      "Disconnected acquisition data",
      "Workflow gaps",
      "Manual reporting",
    ],
    relevantServices: [
      "web-design-development",
      "paid-media-lead-generation",
      "custom-software",
      "analytics-reporting",
    ],
    note: "Industry relevance does not imply a completed client engagement in every SaaS category.",
  },
  {
    slug: "hospitality",
    title: "Hospitality",
    headline:
      "Create a digital experience with enough character to be remembered.",
    summary:
      "Brand storytelling, website design, local discovery, and conversion paths can work together before a guest arrives.",
    challenges: [
      "Generic digital presence",
      "Weak local discovery",
      "Difficult content updates",
      "Disconnected booking paths",
    ],
    relevantServices: [
      "branding-content",
      "web-design-development",
      "seo-ai-search",
    ],
    note: "Rio Alto is a website concept in the Arctos project portfolio.",
  },
  {
    slug: "events-experiential-marketing",
    title: "Events and experiential marketing",
    headline: "See what happens after the event interaction.",
    summary:
      "Connected campaign data and reporting can provide a clearer view of signups, customer value, event performance, and team performance.",
    challenges: [
      "Scattered signup data",
      "Manual event reports",
      "Limited customer context",
      "Inconsistent team reporting",
    ],
    relevantServices: [
      "paid-media-lead-generation",
      "analytics-reporting",
      "business-automation",
    ],
    note: "Fresh Prep Event Intelligence is an internal reporting tool in the Arctos project portfolio.",
  },
  {
    slug: "financial-insurance-services",
    title: "Financial and insurance services",
    headline: "Make complex services and customer workflows clearer.",
    summary:
      "Web experiences, structured intake, CRM workflows, and reporting can reduce friction across the customer journey.",
    challenges: [
      "Complex service information",
      "Manual intake",
      "Disconnected records",
      "Repetitive follow-up",
    ],
    relevantServices: [
      "web-design-development",
      "crm-integrations",
      "business-automation",
      "analytics-reporting",
    ],
    note: "Industry relevance does not imply completed work or a specific regulatory capability. Requirements are reviewed during discovery.",
  },
];

export const industries: Industry[] = industryPages.map((industry) => ({
  slug: industry.slug,
  title: industry.title,
  summary: industry.summary,
  challenges: industry.challenges,
  priorities: [industry.headline, industry.note],
  services: industry.relevantServices,
}));

export function getIndustryBySlug(slug: string): Industry | undefined {
  return industries.find((industry) => industry.slug === slug);
}

export const getIndustry = getIndustryBySlug;
