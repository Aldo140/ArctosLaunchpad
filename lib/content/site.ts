/* =========================================================================
   ARCTOS — copy blocks and the route register that are not tied to one entity
   -------------------------------------------------------------------------
   Was part of one 1,900-line lib/content.ts. Split by subject so a content
   edit touches one reviewable file. Import from "@/lib/content" as before —
   index.ts re-exports everything, so no call site changed.
   ========================================================================= */

import { industryPages } from "./industries";
import { servicePages } from "./services";
import { projects } from "./work";

export const automationProblems = [
  "Email-based approvals",
  "Spreadsheet tracking",
  "Manual data entry",
  "Repetitive reporting",
  "Disconnected software",
  "Delayed follow-up",
  "Lost leads",
  "Duplicate information",
] as const;

export const automationOutcomes = [
  "Faster processing",
  "Fewer errors",
  "Better visibility",
  "Reduced administration",
  "More consistent data",
  "Scalable operations",
] as const;

export const leadGenerationJourney = [
  "Search / Ads / Content",
  "Landing Page or Website",
  "Form / Booking / Quote",
  "CRM and Lead Routing",
  "Automated Follow-Up",
  "Sales Pipeline",
  "Dashboard and Reporting",
] as const;

export const whyArctos = [
  {
    title: "One connected partner",
    copy: "Marketing, design, development, automation, and reporting can work as one system.",
  },
  {
    title: "Strategy before software",
    copy: "We do not build features before understanding the actual problem.",
  },
  {
    title: "Calgary-based",
    copy: "Local context with the ability to support organizations anywhere.",
  },
  {
    title: "Built around existing operations",
    copy: "We improve the current technology stack where practical rather than forcing unnecessary replacement.",
  },
  {
    title: "Clear ownership",
    copy: "You should understand what is being built, why it matters, and what happens after launch.",
  },
  {
    title: "Ongoing improvement",
    copy: "Support can continue beyond the initial deployment.",
  },
] as const;

export const calgaryLandingPages = [
  {
    slug: "calgary-web-design",
    route: "/calgary-web-design" as const,
    title: "Calgary Web Design",
    headline: "Websites built to support how Calgary businesses grow.",
    serviceSlug: "web-design-development",
    summary:
      "Conversion-focused website strategy, design, development, and integration from a Calgary-based studio.",
  },
  {
    slug: "calgary-business-automation",
    route: "/calgary-business-automation" as const,
    title: "Calgary Business Automation",
    headline: "Less repetitive administration. A better connected operation.",
    serviceSlug: "business-automation",
    summary:
      "Workflow review, automation, forms, approvals, follow-up, and integrations for growing Calgary organizations.",
  },
  {
    slug: "calgary-custom-software",
    route: "/calgary-custom-software" as const,
    title: "Calgary Custom Software",
    headline: "Software shaped around how your business actually works.",
    serviceSlug: "custom-software",
    summary:
      "Custom applications, portals, internal tools, and workflow systems from a Calgary-based studio.",
  },
  {
    slug: "calgary-seo",
    route: "/calgary-seo" as const,
    title: "Calgary SEO",
    headline: "Be found when Calgary is already looking.",
    serviceSlug: "seo-ai-search",
    summary:
      "Local SEO, technical foundations, and service pages structured for Google and AI answers.",
  },
  {
    slug: "calgary-digital-marketing",
    route: "/calgary-digital-marketing" as const,
    title: "Calgary Digital Marketing",
    headline: "Campaigns that end in conversations, not just clicks.",
    serviceSlug: "paid-media-lead-generation",
    summary:
      "Google Ads, paid social, landing pages, lead routing, and reporting tied to real enquiries.",
  },
  {
    slug: "calgary-app-development",
    route: "/calgary-app-development" as const,
    title: "Calgary App Development",
    headline: "Build the app the off-the-shelf tools cannot.",
    serviceSlug: "app-software-development",
    summary:
      "Web apps, progressive web apps, and cross-platform mobile apps from first release onward.",
  },
  {
    slug: "calgary-ai-development",
    route: "/calgary-ai-development" as const,
    title: "Calgary AI Development",
    headline: "Put AI where the manual work is.",
    serviceSlug: "ai-product-development",
    summary:
      "Enquiry routing, document classification, summarisation, and AI workflows with human review.",
  },
] as const;

/**
 * Reference guides. Linked from the footer, never the main navigation; each
 * carries the date its facts were last checked, which the sitemap reports.
 */
export const guides = [
  {
    route: "/guides/alberta-digital-funding" as const,
    title: "Funding for software and AI in Calgary and Alberta (2026)",
    label: "Funding guide",
    summary: "BDC LIFT, Alberta Innovates, NRC IRAP, SR&ED, and what replaced the closed Canada Digital Adoption Program.",
    checked: "2026-10-06",
  },
  {
    route: "/guides/canadian-website-privacy" as const,
    title: "Website privacy rules in Canada (2026)",
    label: "Privacy guide",
    summary: "PIPEDA, Alberta and BC PIPA, Quebec Law 25, cookie consent, CASL, and Bill C-36.",
    checked: "2026-10-06",
  },
  {
    route: "/guides/ada-website-compliance" as const,
    title: "ADA website compliance (2026)",
    label: "ADA guide",
    summary: "Who gets sued, why courts use WCAG AA, DOJ Title II deadlines, why overlays fail, and a practical checklist.",
    checked: "2026-10-06",
  },
] as const;

export const siteRoutes = [
  "/",
  "/services",
  ...servicePages.map((service) => service.route),
  "/work",
  ...projects.map((project) => project.route),
  "/process",
  "/studio",
  "/contact",
  "/teardown",
  "/industries",
  ...industryPages.flatMap((industry) =>
    industry.route ? [industry.route] : [],
  ),
  ...calgaryLandingPages.map((page) => page.route),
] as const;
