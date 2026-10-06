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
  | "launch-preview"
  | "in-development";

/** How the work index groups projects. Honest about who the work was for. */
export type ProjectCategory = "client-site" | "platform" | "studio";

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
  wrongFit: string[];
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

/** Extra real media for a case study: the project's own photography or art. */
export type CaseMedia = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Honest caption: what it is and where it comes from. */
  caption: string;
  kind: "photo" | "illustration" | "poster" | "screen";
  /** Colours taken from the project's own data for this item (e.g. a theme palette). */
  palette?: string[];
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
  constraint: string;
  whatChanged: string;
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
  category: ProjectCategory;
  /** The client's own photography, shown as a strip on the case study. */
  specimens?: { src: string; alt: string; width: number; height: number }[];
  /** Extra real media for the case study (the project's own photography or art). */
  caseMedia?: CaseMedia[];
  /** Where caseMedia comes from, shown above the case-study filmstrip. */
  caseMediaCredit?: string;
  /** A real phone capture of the live product. */
  phone?: string;
  /** Ground colour sampled from the project's own identity, used behind its media. */
  accent?: string;
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
