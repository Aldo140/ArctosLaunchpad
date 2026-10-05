import { getServicePageBySlug } from "@/lib/content/services";
import type { GrowthStage } from "@/lib/content";

/**
 * The three things most clients start with. Same names and grouping as the
 * homepage OfferV2 section; this file is the deeper version of it, so the
 * wording of each row is shared in spirit. Titles and routes are resolved from
 * the service records so a renamed or removed service cannot leave a dead link.
 */
export type OfferId = "reporting" | "manual" | "front";

export type OfferRow = { slug: string; deliverable: string };

export type Offer = {
  id: OfferId;
  n: string;
  name: string;
  /** The problem, in the client's language. */
  pain: string;
  /** What it feels like today: short, plain, recognisable. */
  today: string[];
  rows: OfferRow[];
  stage: GrowthStage;
  lead: string;
};

export const OFFERS: Offer[] = [
  {
    id: "reporting",
    n: "1",
    name: "Reporting that runs itself",
    pain: "Every campaign ends with someone rebuilding the same report by hand.",
    today: [
      "Time-consuming manual reporting",
      "Data spread across platforms",
      "No shared performance view",
    ],
    rows: [
      {
        slug: "analytics-reporting",
        deliverable:
          "A dashboard fed by your platforms, and reports that assemble themselves.",
      },
      {
        slug: "crm-integrations",
        deliverable:
          "A sync that keeps forms, CRM records and follow-up telling the same story.",
      },
      {
        slug: "custom-software",
        deliverable:
          "A portal or internal tool for the part no off-the-shelf product covers.",
      },
    ],
    stage: "scale",
    lead: "analytics-reporting",
  },
  {
    id: "manual",
    n: "2",
    name: "The manual steps, gone",
    pain: "The same data keyed twice, approvals chased by email, a tracker only one person understands.",
    today: [
      "Email-based approvals",
      "Spreadsheet tracking",
      "Duplicate entry",
      "Slow lead follow-up",
    ],
    rows: [
      {
        slug: "business-automation",
        deliverable:
          "An intake form that writes to the CRM. Approvals that route themselves.",
      },
      {
        slug: "ai-product-development",
        deliverable:
          "Drafting, sorting and summarising handled by AI, with a person reviewing.",
      },
      {
        slug: "app-software-development",
        deliverable: "The web or mobile app, when nothing off the shelf fits.",
      },
    ],
    stage: "operate",
    lead: "business-automation",
  },
  {
    id: "front",
    n: "3",
    name: "A front door that feeds it",
    pain: "Campaigns and a website that bring in people, and then a system that can use them.",
    today: [
      "Generic landing pages",
      "Low-quality enquiries",
      "Campaign reporting without sales context",
    ],
    rows: [
      {
        slug: "web-design-development",
        deliverable: "A site built around the one action you need taken.",
      },
      {
        slug: "seo-ai-search",
        deliverable:
          "Pages that search engines and AI answers can find and read.",
      },
      {
        slug: "paid-media-lead-generation",
        deliverable: "Campaigns tied to a landing page, a form and the report.",
      },
      {
        slug: "branding-content",
        deliverable: "An identity and copy that say it plainly.",
      },
    ],
    stage: "convert",
    lead: "web-design-development",
  },
];

export function resolveRows(rows: OfferRow[]) {
  return rows.flatMap((r) => {
    const s = getServicePageBySlug(r.slug);
    return s ? [{ ...r, title: s.title, route: s.route }] : [];
  });
}

export function offerForSlug(slug: string): Offer | undefined {
  return OFFERS.find((o) => o.rows.some((r) => r.slug === slug));
}
