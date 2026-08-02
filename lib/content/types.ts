/* =========================================================================
   ARCTOS — the content vocabulary
   -------------------------------------------------------------------------
   Was part of one 1,900-line lib/content.ts. Split by subject so a content
   edit touches one reviewable file. Import from "@/lib/content" as before —
   index.ts re-exports everything, so no call site changed.
   ========================================================================= */

export type GrowthStage = "attract" | "convert" | "operate" | "scale";

export type ProjectStatus =
  | "launched"
  | "internal-tool"
  | "working-demo"
  | "prototype"
  | "in-development";

export type MockupType = "browser" | "dashboard" | "mobile" | "map";

export type ServicePage = {
  slug: string;
  route: `/services/${string}`;
  title: string;
  shortTitle: string;
  stage: GrowthStage;
  eyebrow: string;
  headline: string;
  summary: string;
  problem: string;
  problems: string[];
  capabilities: string[];
  process: string[];
  outcomes: string[];
  reassurance?: string;
  relatedProjects: string[];
  relatedServices: string[];
  faq: { question: string; answer: string }[];
  cta: string;
  metaDescription: string;
};

export type Service = {
  slug: string;
  title: string;
  group: GrowthStage;
  headline: string;
  summary: string;
  problem: string[];
  capabilities: string[];
  process: string[];
  outcomes: string[];
  faqs: { q: string; a: string }[];
  relatedWork: string[];
};

export type ServiceGroup = {
  id: GrowthStage;
  index: string;
  title: string;
  statement: string;
  problem: string;
  accent: string;
  includes: string[];
  outcomes: string[];
  serviceSlugs: string[];
};

export type Project = {
  slug: string;
  route: `/work/${string}`;
  title: string;
  client?: string;
  status: ProjectStatus;
  statusLabel: string;
  summary: string;
  challenge: string;
  approach: string;
  solution: string;
  services: string[];
  industries: string[];
  technologies?: string[];
  featuredImage?: string;
  proofTitle?: string;
  proofIntro?: string;
  reel?: {
    src: string;
    poster: string;
  };
  showcaseMedia?: {
    src: string;
    alt: string;
    caption: string;
    layout?: "wide" | "portrait";
  }[];
  mockupType?: MockupType;
  externalUrl?: string;
  featured: boolean;
};

export type IndustryPage = {
  slug: string;
  route?: `/industries/${string}`;
  title: string;
  headline: string;
  summary: string;
  challenges: string[];
  relevantServices: string[];
  note: string;
};

export type Industry = {
  slug: string;
  title: string;
  summary: string;
  challenges: string[];
  priorities: string[];
  services: string[];
};

export type ProcessDetail = {
  id: string;
  index: string;
  title: string;
  summary: string;
  detail: string;
  deliverables: string[];
};

export type ProcessStep = { title: string; body: string };
