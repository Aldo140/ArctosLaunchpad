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
    slug: "nicsdelite",
    route: "/work/nicsdelite",
    title: "Nics Delite",
    client: "Nicsdelite",
    status: "launched",
    statusLabel: "Live client site · redesign and migration",
    summary:
      "A couture-pâtisserie website and custom order builder for Nicole, a Calgary maker of one-of-one cakes and Filipino-inspired desserts.",
    challenge:
      "Take over a site delivered as a handoff archive, move its hosting and domain without breaking email, and give one maker's handmade work the presentation it deserves.",
    approach:
      "Trace every design element back to her craft: organza ribbon, piped scallops, pearls and cake layers become the site's motifs, while the order flow is rebuilt around how custom cakes are actually requested.",
    solution:
      "A redesigned home, category and flavour pages, a wedding chapter, policies, and an order builder that handles cake tiers and multiple desserts in one enquiry.",
    constraint:
      "The site arrived as a source archive with no Git history, a third-party hosting account and a domain that also carried the business's email. Migration had to preserve every non-verification DNS record while the redesign went live.",
    whatChanged:
      "Live at nicsdelite.ca, the site now runs on accounts the business controls, and customers can design a custom order — tiers, flavours, multiple desserts and inspiration photos — in one structured enquiry instead of a back-and-forth over messages.",
    services: [
      "Website redesign",
      "Hosting and domain migration",
      "Order intake",
      "Art direction",
    ],
    industries: ["Hospitality", "Small business"],
    technologies: ["Next.js", "TypeScript", "Vercel Blob", "Resend"],
    featuredImage: "/assets/work/nicsdelite.webp",
    proofTitle: "Couture, by hand.",
    proofIntro:
      "Ribbon, pearls and piped scallops traced from her actual cakes give one maker's work an atelier presentation.",
    reel: {
      src: "/assets/work/nicsdelite-site.webm",
      poster: "/assets/work/posters/nicsdelite.webp",
    },
    mockupType: "browser",
    category: "client-site",
    phone: "/assets/work/nicsdelite-phone.webp",
    caseMediaCredit: "From Nicsdelite’s own photography",
    caseMedia: [
      { src: "/assets/work/nicsdelite/pearl-bow-cake.webp", alt: "A blush first-birthday cake wrapped in organza with a satin bow and rows of pearls", width: 1200, height: 1600, caption: "Organza, pearls and a satin bow: the details the site’s motifs were traced from.", kind: "photo" },
      { src: "/assets/work/nicsdelite/green-heart-vintage.webp", alt: "A heart-shaped vintage cake piped in sage green with red cherries and scalloped borders", width: 1200, height: 1600, caption: "Piped scallops in her hand, later redrawn as the site’s borders.", kind: "photo" },
      { src: "/assets/work/nicsdelite/red-wedding-cake.webp", alt: "A three-tier red wedding cake with cascading white sugar roses in a reception hall", width: 1024, height: 1536, caption: "Wedding work earned its own chapter on the redesigned site.", kind: "photo" },
      { src: "/assets/work/nicsdelite/botanical-wreath.webp", alt: "A white cake piped with a botanical wreath of berries and leaves, lettered ‘one month’", width: 1200, height: 1600, caption: "One-of-one lettering and botanical piping.", kind: "photo" },
      { src: "/assets/work/nicsdelite/enchanted-forest.webp", alt: "A two-tier enchanted-forest cake with a moss base, bark texture, vines and sugar mushrooms", width: 881, height: 1322, caption: "Sculpted work that a template gallery would flatten.", kind: "photo" },
      { src: "/assets/work/nicsdelite/number-24-cakes.webp", alt: "Two number cakes forming 24, topped with sugar flowers, macarons and meringues", width: 1400, height: 1050, caption: "Multiple desserts in one order: the case the order builder was rebuilt for.", kind: "photo" },
      { src: "/assets/work/nicsdelite/blue-gold-wedding.webp", alt: "A three-tier white and gold wedding cake with navy and ivory flowers and an acrylic monogram", width: 1200, height: 1600, caption: "Tiers, flowers and a monogram: choices the enquiry now captures up front.", kind: "photo" },
      { src: "/assets/work/nicsdelite/butterfly-birthday.webp", alt: "A half-lavender, half-gold birthday cake with gold butterflies marking ‘bye 20s, hello 30s’", width: 1200, height: 1600, caption: "Celebration cakes, designed per customer.", kind: "photo" },
      { src: "/assets/work/nicsdelite/ube-roll.webp", alt: "A sliced purple ube roll cake with a swirl of cream on a wooden board", width: 1200, height: 1600, caption: "Filipino-inspired desserts sit alongside the couture cakes.", kind: "photo" },
      { src: "/assets/work/nicsdelite/valentine-heart.webp", alt: "A pink heart cake tied with a deep red ribbon and lettered ‘love you’ on red fabric", width: 1200, height: 1600, caption: "Ribbon work, the source of the site’s organza motif.", kind: "photo" },
      { src: "/assets/work/nicsdelite/rm-wedding-cake.webp", alt: "A two-tier ivory wedding cake with an R and M monogram and white flowers", width: 1024, height: 1536, caption: "A quieter wedding piece, photographed on white.", kind: "photo" },
      { src: "/assets/work/nicsdelite/grand-wedding-ae.webp", alt: "A tall white wedding cake under a vaulted wooden ceiling, dressed with white flowers and an A and E monogram", width: 1200, height: 1600, caption: "A grand wedding installation in the venue.", kind: "photo" },
    ],
    accent: "#5e1f2c",
    externalUrl: "https://www.nicsdelite.ca",
    featured: true,
  },
  {
    slug: "so-social-collective",
    route: "/work/so-social-collective",
    title: "So Social Collective",
    client: "So Social Collective",
    status: "launched",
    statusLabel: "Live platform · events, operations, matching",
    summary:
      "One application behind an events brand in Calgary and Toronto: the public site, a staff operations workspace, and consent-aware attendee matching.",
    challenge:
      "Turn social-media interest into attendance, and give a small team one dependable place to publish events, review enquiries and run matching rounds.",
    approach:
      "Build three connected surfaces on one content source: a poster-and-scrapbook public site, a role-based Ops workspace, and a matching flow staff review before anything is released.",
    solution:
      "A public site and event archive, an Ops workspace for events, media, partners, subscribers and staff, and an attendee matching quiz with reviewable proposals and release snapshots.",
    constraint:
      "Matching involves personal preferences, so consent, staff review and access control had to be part of the design rather than added later — and the public site had to make arriving alone feel normal.",
    whatChanged:
      "The public site, event archive, staff Ops workspace and matching flow run live from one Firestore-backed application, so publishing an event and running its matching round happen in the same system.",
    services: [
      "Custom software",
      "Website design",
      "Operations workspace",
      "UX and UI design",
    ],
    industries: ["Events and experiential marketing"],
    technologies: ["Next.js", "TypeScript", "Firebase", "Vercel"],
    featuredImage: "/assets/work/so-social-collective.webp",
    proofTitle: "Come solo. Leave with people.",
    proofIntro:
      "A poster-and-scrapbook public face, with the operations and matching tools a small team needs behind it.",
    reel: {
      src: "/assets/work/so-social-collective-site.webm",
      poster: "/assets/work/posters/so-social-collective.webp",
    },
    mockupType: "browser",
    category: "platform",
    phone: "/assets/work/so-social-collective-phone.webp",
    caseMediaCredit: "Event photography and posters published on the So Social site",
    caseMedia: [
      { src: "/assets/work/so-social-collective/yacht-skyline.webp", alt: "Guests in pyjamas crowded on a yacht deck with the Toronto skyline behind them at dusk", width: 1080, height: 720, caption: "Pyjamas by the Port, Toronto. The archive is built from photos like this one.", kind: "photo" },
      { src: "/assets/work/so-social-collective/poster-pyjamas-by-the-port.webp", alt: "Pyjamas By The Port event poster: a Toronto yacht party, with the skyline at dusk", width: 1080, height: 1350, caption: "Each event gets its poster, published from the Ops workspace.", kind: "poster" },
      { src: "/assets/work/so-social-collective/ice-cream-round.webp", alt: "A circle of hands holding cups of ice cream together over the table", width: 1080, height: 810, caption: "The April social at Parlour Ice Cream.", kind: "photo" },
      { src: "/assets/work/so-social-collective/neon-cone.webp", alt: "The dark shop at the end of the night, lit only by the neon cone", width: 1080, height: 1439, caption: "End of the night at Parlour.", kind: "photo" },
      { src: "/assets/work/so-social-collective/poster-fashion-for-heart.webp", alt: "Fashion for Heart — Sip, Shop & Socialize event poster", width: 1080, height: 1350, caption: "Fashion for Heart, the first event.", kind: "poster" },
      { src: "/assets/work/so-social-collective/fashion-for-heart-drinks.webp", alt: "Cocktails lined up along the bar at Fashion for Heart", width: 1280, height: 1600, caption: "Cocktails along the bar at Fashion for Heart.", kind: "photo" },
      { src: "/assets/work/so-social-collective/yacht-dj.webp", alt: "DJ playing on deck with speakers, open water and the skyline behind", width: 1080, height: 720, caption: "On deck at Pyjamas by the Port.", kind: "photo" },
      { src: "/assets/work/so-social-collective/poster-stampede-breakfast.webp", alt: "Cowboy Café Italiano Stampede Breakfast poster with So Social Collective and Amato", width: 1080, height: 1440, caption: "The Stampede Breakfast poster, Calgary.", kind: "poster" },
      { src: "/assets/work/so-social-collective/stampede-patio.webp", alt: "The Amato patio set for an Italian breakfast on Stampede weekend", width: 803, height: 537, caption: "The Amato patio on Stampede weekend.", kind: "photo" },
    ],
    accent: "#2c2a22",
    externalUrl: "https://so-social-collective-web.vercel.app",
    featured: true,
  },
  {
    slug: "vow-motion",
    route: "/work/vow-motion",
    title: "Vow Motion",
    status: "launch-preview",
    statusLabel: "Studio product · launch preview",
    summary:
      "A wedding planning application that connects one private guest list to invitations, RSVP, events, travel, seating and guest photos.",
    challenge:
      "Couples and planners juggle spreadsheets, invitation tools and RSVP forms that never agree with each other.",
    approach:
      "Make the guest list the single source of truth, then design every guest-facing artifact — invitation, reply, wedding pass — as one world that needs no guest account.",
    solution:
      "A Studio for couples and planners, personal household invitation links, per-event RSVP with meals and dietary details, seating, travel, messaging and private photo sharing.",
    constraint:
      "Personal invitation links act as credentials, so access control, revocation and privacy had to live on the server while the guest experience stayed effortless on a phone.",
    whatChanged:
      "Vow Motion runs as a hosted launch preview with a tested core flow: a couple can build a guest list, send household invitations, and collect RSVPs into the same record. External email, SMS and payment drills are still pending production credentials.",
    services: [
      "Product strategy",
      "Product design",
      "Custom software",
      "UX and UI design",
    ],
    industries: ["Events and experiential marketing"],
    technologies: ["Next.js", "TypeScript", "PostgreSQL", "Stripe"],
    featuredImage: "/assets/work/vow-motion.webp",
    proofTitle: "Your entire wedding. Beautifully shared.",
    proofIntro:
      "The invitation, the reply and the wedding pass belong to one world, with one guest list behind them.",
    reel: {
      src: "/assets/work/vow-motion-site.webm",
      poster: "/assets/work/posters/vow-motion.webp",
    },
    mockupType: "browser",
    category: "studio",
    phone: "/assets/work/vow-motion-phone.webp",
    caseMediaCredit: "Invitation-world imagery from the Vow Motion product",
    caseMedia: [
      { src: "/assets/work/vow-motion/riviera.webp", alt: "A lakeside villa among cypress trees above a mountain lake", width: 1400, height: 933, caption: "Riviera · Lake Como. One of six invitation worlds a couple can choose.", kind: "illustration", palette: ["#efe9d9", "#40617a", "#858a66"] },
      { src: "/assets/work/vow-motion/maison.webp", alt: "A pale stone manor with a fountain and white flowering gardens", width: 1067, height: 1600, caption: "Invitation world: Maison · Provence.", kind: "illustration", palette: ["#f3f0e9", "#282824", "#9c8c7e"] },
      { src: "/assets/work/vow-motion/notte.webp", alt: "A candlelit dining room in near darkness", width: 1065, height: 1600, caption: "Invitation world: Notte · New York.", kind: "illustration", palette: ["#1b1b1b", "#dfd0b6", "#6b343e"] },
      { src: "/assets/work/vow-motion/heritage.webp", alt: "Wrought-iron gates opening onto stone steps and an arched manor door", width: 1024, height: 1536, caption: "Invitation world: Heritage · Cotswolds.", kind: "illustration", palette: ["#ede8dc", "#514c36", "#a49a73"] },
      { src: "/assets/work/vow-motion/modernist.webp", alt: "A long white table in a concrete hall with tall windows and blue and orange accents", width: 1024, height: 1536, caption: "Invitation world: Modernist · Copenhagen.", kind: "illustration", palette: ["#e5e7e6", "#263fa0", "#df693b"] },
      { src: "/assets/work/vow-motion/garden.webp", alt: "A long dining table under olive trees in a gravel garden", width: 1024, height: 1536, caption: "Invitation world: Garden · Tuscany.", kind: "illustration", palette: ["#e6e9db", "#466044", "#aba58a"] },
      { src: "/assets/work/vow-motion/wedding-details.webp", alt: "A white rose bouquet resting on silk beside an envelope and two rings", width: 900, height: 1350, caption: "Detail imagery used across the product’s invitation pages.", kind: "illustration" },
      { src: "/assets/work/vow-motion/wedding-evening.webp", alt: "A candlelit wedding table beneath trees beside a lake at dusk", width: 1400, height: 933, caption: "Evening imagery from the product’s guest-facing pages.", kind: "illustration" },
    ],
    accent: "#1f3a33",
    externalUrl: "https://vowmotionweddings.com",
    featured: true,
  },
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
    constraint:
      "The information had to stay trustworthy and fast-moving at once: official alerts, unverified community reports, and neighbourhood context all needed to sit in one view without becoming confusing or misleading during an actual urgent moment.",
    whatChanged:
      "Live at calgarywatch.ca, the live map, public reporting flow, and official data layers now run as one operating view instead of separate alert sources a resident would have to piece together themselves.",
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
    category: "platform",
    phone: "/assets/work/calgary-watch-phone.webp",
    caseMediaCredit: "Illustration and collage art published on calgarywatch.ca",
    caseMedia: [
      { src: "/assets/work/calgary-watch/city-guide.webp", alt: "Illustrated Calgary skyline above the Bow River and Peace Bridge, framed by a coffee cup, a cyclist and a torn city map", width: 1200, height: 675, caption: "The city guide illustration: Calgary itself as the organizing canvas.", kind: "illustration" },
      { src: "/assets/work/calgary-watch/live-watch.webp", alt: "Night-time illustrated Calgary skyline with map pins and a glowing tower", width: 1376, height: 768, caption: "The live-watch illustration, the night-time counterpart.", kind: "illustration" },
      { src: "/assets/work/calgary-watch/quadrant-nw.webp", alt: "Torn-paper collage of northwest Calgary: the Peace Bridge, the river and the downtown towers at dusk", width: 1400, height: 933, caption: "Quadrant collage, NW: each part of the city gets its own view.", kind: "illustration" },
      { src: "/assets/work/calgary-watch/quadrant-se.webp", alt: "Torn-paper collage of southeast Calgary: the Saddledome, wet streets and brick buildings at night", width: 1400, height: 933, caption: "Quadrant collage, SE.", kind: "illustration" },
      { src: "/assets/work/calgary-watch/community.webp", alt: "Illustrated neighbourhood street with residents talking, sunflowers and the skyline behind", width: 1200, height: 800, caption: "Community illustration from the reporting pages.", kind: "illustration" },
      { src: "/assets/work/calgary-watch/farmers-market.webp", alt: "Illustrated farmers’ market with striped stalls, produce and the Calgary skyline", width: 1200, height: 896, caption: "Local context beyond alerts, from the site’s city pages.", kind: "illustration" },
      { src: "/assets/work/calgary-watch/weekend.webp", alt: "Illustrated festival weekend with food trucks, cyclists and the Calgary Tower", width: 1200, height: 896, caption: "Weekend guide illustration.", kind: "illustration" },
      { src: "/assets/work/calgary-watch/brief.webp", alt: "Illustrated envelope opening onto a miniature Calgary, beside a latte on a café table", width: 1280, height: 853, caption: "The community brief illustration, from the site’s email sign-up.", kind: "illustration" },
    ],
    accent: "#2b3f73",
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
    constraint:
      "The subject matter is sensitive and personal, so participation had to stay anonymous — which meant the platform also needed a moderation system to keep community-submitted content safe and appropriate without ever requiring anyone to identify themselves.",
    whatChanged:
      "The anonymous map and moderation system are live, so young people affected by a family member's substance use can discover shared experiences and support resources without surrendering their anonymity to do it.",
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
    category: "platform",
    phone: "/assets/work/starlings-mobile.webp",
    accent: "#5b4a78",
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
    constraint:
      "Event performance only existed as raw signup-code exports — useful as data, not as a decision. The reporting had to be organized around the conversion, customer-value, event, and team-performance questions the event and marketing teams actually needed answered, not just the shape the exports arrived in.",
    whatChanged:
      "Internally, the raw signup-code data now resolves automatically into the conversion, customer-value, event, and team-performance views the event and marketing teams use to make decisions, instead of someone working the exports by hand.",
    services: [
      "Business intelligence",
      "Automated reporting",
      "Data consolidation",
      "Internal dashboards",
    ],
    industries: ["Events and experiential marketing"],
    mockupType: "dashboard",
    category: "platform",
    accent: "#2f4a32",
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
    constraint:
      "Rental interest from independent landlords and property managers arrives as scattered listing enquiries with no connected path from first contact to an organized lease-package request — the demo had to tie the listing experience, lead conversion, and request workflow together as one system rather than three separate tools.",
    whatChanged:
      "The working demo shows listing traffic flowing into organized, reviewable lease-package requests end to end, proving the workflow holds together as one connected system rather than requiring a separate handoff at each step.",
    services: [
      "Product design",
      "Custom software",
      "Lead conversion",
      "Workflow design",
    ],
    industries: ["Real estate"],
    mockupType: "browser",
    category: "studio",
    accent: "#33424a",
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
    constraint:
      "Cobalt-chrome framework production is a specialized, multi-stage technical process that most dental laboratories have no reason to understand — the site had to make that process legible to an outside lab while still giving them a confident, direct way to submit a case, not just a description of the work.",
    whatChanged:
      "Live at tnkromes.ca, dental laboratories can now follow the CAD-to-finish production process and submit a case directly on the site, instead of the process only being explainable in person or over a call.",
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
      {
        src: "/assets/work/true-north-kromes/lower-framework-occlusal.webp",
        alt: "A polished lower cobalt-chrome framework on a dental model, held in a black glove",
        caption: "The lab’s own photography carries the site: real frameworks, not stock dentistry.",
        layout: "portrait",
      },
    ],
    mockupType: "browser",
    externalUrl: "https://www.tnkromes.ca/",
    category: "client-site",
    phone: "/assets/work/true-north-kromes-phone.webp",
    accent: "#34321a",
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
    constraint:
      "The restaurant's existing web presence carried none of the warmth, character, or connection to its history and Mexican identity that made the physical restaurant distinctive — the site had to be rebuilt around brand storytelling rather than a standard menu-and-hours template.",
    whatChanged:
      "Live at rioalto.ca, the restaurant's menu and story now run as one searchable, browsable experience built around its history and Mexican identity, instead of a generic restaurant web presence disconnected from the brand.",
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
    specimens: [
      { src: "/assets/work/rio-alto/chile-relleno.webp", alt: "A chile relleno in dark sauce with rice, salad and avocado", width: 1200, height: 900 },
      { src: "/assets/work/rio-alto/dessert-pastries.webp", alt: "A platter of Mexican pastries: a cream horn, sugared conchas and doughnuts", width: 900, height: 1200 },
      { src: "/assets/work/rio-alto/fresh-bread.webp", alt: "A tray of freshly baked round bread from the Rio Alto bakery", width: 1200, height: 900 },
      { src: "/assets/work/rio-alto/nopales-salad.webp", alt: "A green salad with strawberries, blackberries and crumbled cheese", width: 900, height: 1200 },
      { src: "/assets/work/rio-alto/plated-special.webp", alt: "A plated special in red sauce with refried beans, pico de gallo and green salsa", width: 1200, height: 900 },
    ],
    category: "client-site",
    phone: "/assets/work/rio-alto-phone.webp",
    accent: "#5a2a1c",
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
