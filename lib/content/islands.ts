/* =========================================================================
   ARCTOS — the three islands
   -------------------------------------------------------------------------
   The public story groups the four growth stages into the three places a
   growing business actually lives: winning customers, running the work, and
   seeing the numbers. Arctos builds the bridge between them.

   Stages, services and claims still come from services.ts — this file only
   decides how they are grouped and introduced.
   ========================================================================= */

import type { GrowthStage } from "./types";

export type IslandId = "win" | "run" | "see";

export type Island = {
  id: IslandId;
  index: string;
  name: string;
  /** The headline line this island owns in the hero. */
  line: string;
  /** What the studio actually builds here, in plain words: the hero's island labels. */
  offer: string;
  stages: GrowthStage[];
  art: { src: string; width: number; height: number; alt: string };
  /** How an owner describes the problem, before they know the solution. */
  symptom: string;
  symptoms: string[];
  promise: string;
  builds: string[];
  /** `/contact?need=` value the form understands. */
  need: "website" | "automation" | "software" | "reporting";
  serviceSlugs: string[];
  proof: string[];
};

export const islands: Island[] = [
  {
    id: "win",
    index: "01",
    name: "Win the customer",
    line: "Win the customer.",
    offer: "Websites & lead generation",
    stages: ["attract", "convert"],
    art: {
      src: "/assets/art/island-win.webp",
      width: 440,
      height: 470,
      alt: "",
    },
    symptom: "“People find us, then nothing happens.”",
    symptoms: [
      "The site looks fine but enquiries are thin",
      "Ads send people to a page that doesn’t convert",
      "Leads arrive by email and wait",
    ],
    promise:
      "A website and search presence that says plainly what you do, with one clear path from the first visit to an enquiry your team can act on.",
    builds: [
      "Websites and landing pages",
      "SEO and AI search",
      "Paid media wired to a form",
      "Brand, copy and UX",
    ],
    need: "website",
    serviceSlugs: [
      "web-design-development",
      "seo-ai-search",
      "paid-media-lead-generation",
      "branding-content",
      "ui-ux-design",
      "product-strategy-consulting",
    ],
    proof: ["nicsdelite", "true-north-kromes", "rio-alto"],
  },
  {
    id: "run",
    index: "02",
    name: "Run the work",
    line: "Run the work.",
    offer: "Software & automation",
    stages: ["operate"],
    art: {
      src: "/assets/art/island-run.webp",
      width: 600,
      height: 840,
      alt: "",
    },
    symptom: "“My team spends the day copying things.”",
    symptoms: [
      "The same data is typed into three tools",
      "Approvals live in someone’s inbox",
      "The off-the-shelf tool almost fits",
    ],
    promise:
      "Automation, integrations and custom software shaped around how the business already works, so a task is entered once and moves itself to the next person.",
    builds: [
      "Workflow automation",
      "CRM and integrations",
      "Custom software and portals",
      "Web and mobile apps",
    ],
    need: "automation",
    serviceSlugs: [
      "business-automation",
      "custom-software",
      "crm-integrations",
      "app-software-development",
      "ai-product-development",
    ],
    proof: ["so-social-collective", "calgary-watch", "vow-motion"],
  },
  {
    id: "see",
    index: "03",
    name: "See the numbers",
    line: "See the numbers.",
    offer: "Dashboards & reporting",
    stages: ["scale"],
    art: {
      src: "/assets/art/island-see.webp",
      width: 356,
      height: 400,
      alt: "",
    },
    symptom: "“I can’t tell what’s working.”",
    symptoms: [
      "The report is rebuilt from exports every month",
      "Two people, two different numbers",
      "Marketing spend with no line to sales",
    ],
    promise:
      "Dashboards and reports that assemble themselves from the systems you already run, with the hosting and support to keep them trustworthy.",
    builds: [
      "Dashboards and BI",
      "Automated reporting",
      "Data consolidation",
      "Hosting, monitoring, support",
    ],
    need: "reporting",
    serviceSlugs: ["analytics-reporting", "cloud-devops"],
    proof: ["fresh-prep-event-intelligence", "calgary-watch"],
  },
];

export function getIsland(id: IslandId): Island {
  return islands.find((island) => island.id === id) ?? islands[0];
}

export function getIslandForStage(stage: GrowthStage): Island {
  return islands.find((island) => island.stages.includes(stage)) ?? islands[0];
}

/** The order the portfolio reads in: strongest live client work first. */
export const portfolioOrder = [
  "nicsdelite",
  "true-north-kromes",
  "calgary-watch",
  "rio-alto",
  "so-social-collective",
  "starlings-support-map",
  "vow-motion",
  "fresh-prep-event-intelligence",
  "leaseflow",
] as const;

/**
 * The `/contact?need=` preset for a project, read from its free-text service
 * list. The first service that clearly belongs to one island wins.
 */
export function needForServices(services: string[]): Island["need"] {
  for (const raw of services) {
    const s = raw.toLowerCase();
    if (/report|dashboard|analytic|intelligence/.test(s)) return "reporting";
    if (/automation|workflow|integration|crm|intake|operations/.test(s)) return "automation";
    if (/software|platform|product|mapping|moderation|app\b|tool/.test(s)) return "software";
    if (/website|web design|seo|brand|redesign|hosting|landing|content/.test(s)) return "website";
  }
  return "website";
}
