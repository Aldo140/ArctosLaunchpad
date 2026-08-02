/* =========================================================================
   ARCTOS — the projects, and their lookups
   -------------------------------------------------------------------------
   Was part of one 1,900-line lib/content.ts. Split by subject so a content
   edit touches one reviewable file. Import from "@/lib/content" as before —
   index.ts re-exports everything, so no call site changed.
   ========================================================================= */

import type { Project, ServicePage } from "./types";

export const projects: Project[] = [
  {
    slug: "calgary-watch",
    route: "/work/calgary-watch",
    title: "Calgary Watch",
    client: "Calgary Watch",
    status: "launched",
    statusLabel: "Live civic platform",
    summary:
      "A real-time, community-powered incident map that helps Calgary and Edmonton residents understand what is happening around them.",
    challenge:
      "Turn live public alerts, community reports, and neighbourhood context into one fast experience that remains understandable during urgent moments.",
    approach:
      "Treat the city as a living information system, with a clear path from discovery to the live map, incident reporting, verification, and local context.",
    solution:
      "A responsive civic platform with live incident mapping, community reporting, official data layers, neighbourhood views, and mobile-first field controls.",
    services: [
      "Product strategy",
      "Custom software",
      "Interactive mapping",
      "UX and UI design",
    ],
    industries: ["Civic technology", "Nonprofits"],
    technologies: ["React", "TypeScript", "Firebase", "Leaflet"],
    featuredImage: "/assets/work/calgary-watch.webp",
    proofTitle: "A city becomes the interface.",
    proofIntro:
      "The live map, public reporting flow, and river-level signal system make Calgary itself the organizing canvas.",
    reel: {
      src: "/assets/work/calgary-watch-site.webm",
      poster: "/assets/work/posters/calgary-watch.webp",
    },
    showcaseMedia: [
      {
        src: "/assets/work/calgary-watch-map.webp",
        alt: "Calgary Watch live map showing active community and official reports across Calgary",
        caption: "The live map brings community reports and official data into one operating view.",
        layout: "wide",
      },
    ],
    mockupType: "map",
    externalUrl: "https://calgarywatch.ca",
    featured: true,
  },
  {
    slug: "starlings-support-map",
    route: "/work/starlings-support-map",
    title: "Starlings Support Map",
    client: "Starlings",
    status: "launched",
    statusLabel: "Launched",
    summary:
      "An anonymous, map-based support platform helping young people affected by a family member's substance use discover shared experiences and community resources.",
    challenge:
      "Make sensitive, community-submitted experiences and support resources easier to discover while preserving an anonymous experience.",
    approach:
      "Shape the experience around a map, resource discovery, and the operational need to moderate community content.",
    solution:
      "An interactive support map with anonymous participation, community resources, and a moderation system.",
    services: [
      "Custom software",
      "Interactive mapping",
      "Moderation system",
      "UX and UI design",
    ],
    industries: ["Nonprofits"],
    technologies: ["React", "TypeScript", "Google Apps Script", "Leaflet"],
    featuredImage: "/assets/work/starlings.webp",
    proofTitle: "Care, drawn as a living loop.",
    proofIntro:
      "Soft illustration, direct language, and a looping journey turn a complex support ecosystem into something people can enter without fear.",
    reel: {
      src: "/assets/work/starlings-site.webm",
      poster: "/assets/work/posters/starlings.webp",
    },
    showcaseMedia: [
      {
        src: "/assets/work/starlings-care-loop.webp",
        alt: "Starlings care-loop interaction explaining how a private note becomes useful community support",
        caption: "The sideways care loop explains moderation and publishing as a human process.",
        layout: "wide",
      },
      {
        src: "/assets/work/starlings-phone-in-hand.webp",
        alt: "A person holding a phone displaying the Starlings Support Map mobile homepage on a colourful studio desk",
        caption: "The mobile experience stays direct, welcoming, and usable in everyday life.",
        layout: "portrait",
      },
    ],
    mockupType: "map",
    externalUrl: "https://aldo140.github.io/Starlings/",
    featured: true,
  },
  {
    slug: "fresh-prep-event-intelligence",
    route: "/work/fresh-prep-event-intelligence",
    title: "Fresh Prep Event Intelligence",
    client: "Fresh Prep",
    status: "internal-tool",
    statusLabel: "Internal tool",
    summary:
      "A reporting system that turns signup-code data into conversion, customer-value, event, and team-performance insights.",
    challenge:
      "Turn event signup-code data into a useful view of conversion, customer value, event performance, and team performance.",
    approach:
      "Organize the reporting around the decisions event and marketing teams need to make rather than around raw exports.",
    solution:
      "An internal business intelligence and data automation tool for event performance reporting.",
    services: [
      "Business intelligence",
      "Automated reporting",
      "Data consolidation",
      "Internal dashboards",
    ],
    industries: ["Events and experiential marketing"],
    mockupType: "dashboard",
    featured: true,
  },
  {
    slug: "leaseflow",
    route: "/work/leaseflow",
    title: "LeaseFlow",
    status: "working-demo",
    statusLabel: "Product concept and working demo",
    summary:
      "A rental conversion platform that turns listing traffic into organized lease-package requests for independent landlords and property managers.",
    challenge:
      "Move rental interest from scattered listing enquiries into a more organized request and review workflow.",
    approach:
      "Connect the listing experience, lead conversion, and lease-package request flow around the needs of independent landlords and property managers.",
    solution:
      "A working product demo for listing management, rental lead conversion, and workflow organisation.",
    services: [
      "Product design",
      "Custom software",
      "Lead conversion",
      "Workflow design",
    ],
    industries: ["Real estate"],
    mockupType: "browser",
    featured: true,
  },
  {
    slug: "true-north-kromes",
    route: "/work/true-north-kromes",
    title: "True North Kromes",
    client: "True North Kromes",
    status: "launched",
    statusLabel: "Launched website",
    summary:
      "An image-led production website for a Canadian dental laboratory designing and 3D-printing cobalt-chrome frameworks.",
    challenge:
      "Explain a highly specialized production process clearly while giving dental laboratories a confident path to submit a case.",
    approach:
      "Build the visual system from the lab itself: hard-edged inspection frames, real process photography, precise progress states, and direct client actions.",
    solution:
      "A responsive production story spanning CAD design, laser printing, plasma polishing, finished work, technical content, and case intake.",
    services: [
      "Website design",
      "Digital operations",
      "Client experience",
      "UX and UI design",
    ],
    industries: ["Healthcare and dental", "Manufacturing"],
    technologies: ["Next.js", "TypeScript", "Motion", "Resend"],
    featuredImage: "/assets/work/true-north-kromes.webp",
    proofTitle: "Precision with the volume turned up.",
    proofIntro:
      "Hard-edged typography, registration marks, and real lab imagery translate custom framework production into an industrial digital identity.",
    reel: {
      src: "/assets/work/true-north-kromes-site.webm",
      poster: "/assets/work/posters/true-north-kromes.webp",
    },
    showcaseMedia: [
      {
        src: "/assets/work/true-north-kromes/framework-build-tray.webp",
        alt: "Multiple cobalt-chrome dental frameworks arranged on a production build tray",
        caption: "A full build tray shows repeatable in-house production, not a generic laboratory backdrop.",
        layout: "wide",
      },
      {
        src: "/assets/work/true-north-kromes/upper-framework-occlusal.webp",
        alt: "A polished upper cobalt-chrome framework seated on a dental model and held in a black glove",
        caption: "The polished upper framework makes fit, finish, and clasp detail immediately visible.",
        layout: "portrait",
      },
      {
        src: "/assets/work/true-north-kromes/upper-framework-palatal-detail.webp",
        alt: "Close detail of the palatal strap and clasp work on a finished upper cobalt-chrome framework",
        caption: "Palatal detail is where the tolerance argument is actually won.",
        layout: "portrait",
      },
      {
        src: "/assets/work/true-north-kromes/lower-framework-fit.webp",
        alt: "A complete polished lower cobalt-chrome framework fitted to a dental model",
        caption: "A second finished case proves the range and consistency of the framework work.",
        layout: "portrait",
      },
    ],
    mockupType: "browser",
    externalUrl: "https://www.tnkromes.ca/",
    featured: true,
  },
  {
    slug: "rio-alto",
    route: "/work/rio-alto",
    title: "Rio Alto",
    client: "Rio Alto",
    status: "launched",
    statusLabel: "Launched website",
    summary:
      "A warmer, more distinctive restaurant website experience built around the company's history and Mexican identity.",
    challenge:
      "Create a restaurant website direction with more warmth, character, and connection to the company's history and Mexican identity.",
    approach:
      "Use brand storytelling and a distinctive visual direction to shape a more memorable digital experience.",
    solution:
      "A hospitality website concept centred on history, identity, and a warmer customer experience.",
    services: ["Website design", "Brand storytelling", "UX and UI design"],
    industries: ["Hospitality"],
    technologies: ["Eleventy", "Nunjucks", "JavaScript", "CSS"],
    featuredImage: "/assets/work/rio-alto.webp",
    proofTitle: "The kitchen sets the pace.",
    proofIntro:
      "Cinematic service footage, a searchable menu, and warm editorial pacing bring the restaurant's energy forward before a guest arrives.",
    reel: {
      src: "/assets/work/rio-alto-site.webm",
      poster: "/assets/work/posters/rio-alto.webp",
    },
    showcaseMedia: [
      {
        src: "/assets/work/rio-alto/colorful-tortilla-flight.webp",
        alt: "Five colourful house-made tortillas plated with salsa and guacamole at Rio Alto",
        caption: "Real dish photography gives the visual system a colour language that belongs to the restaurant.",
        layout: "wide",
      },
      {
        src: "/assets/work/rio-alto/festive-sweet-bread.webp",
        alt: "Trays of sliced pink and green festive sweet bread from the Rio Alto bakery",
        caption: "The bakery's own colour language, used to set the palette instead of a stock swatch.",
        layout: "portrait",
      },
      {
        src: "/assets/work/rio-alto-menu.webp",
        alt: "Rio Alto desktop menu with dish photography, category navigation, and menu item cards",
        caption: "The menu turns a long restaurant catalogue into an inviting, searchable browsing experience.",
        layout: "wide",
      },
      {
        src: "/assets/work/rio-alto-story.webp",
        alt: "Rio Alto story section with a hacienda-shaped illustration and restaurant history",
        caption: "The visual language connects High River with the restaurant's Mexico City roots.",
        layout: "wide",
      },
    ],
    mockupType: "browser",
    externalUrl: "https://rioalto.ca/",
    featured: true,
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export const getProject = getProjectBySlug;

export function getFeaturedProjects(): Project[] {
  return projects.filter((project) => project.featured);
}

export function getRelatedProjects(service: ServicePage): Project[] {
  return service.relatedProjects
    .map(getProjectBySlug)
    .filter((project): project is Project => Boolean(project));
}
