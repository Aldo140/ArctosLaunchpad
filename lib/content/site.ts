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
  "/industries",
  ...industryPages.flatMap((industry) =>
    industry.route ? [industry.route] : [],
  ),
  ...calgaryLandingPages.map((page) => page.route),
] as const;
