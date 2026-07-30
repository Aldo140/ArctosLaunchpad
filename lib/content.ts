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

export const growthStages: ServiceGroup[] = [
  {
    id: "attract",
    index: "01",
    title: "Attract",
    statement: "Reach the right people and generate qualified opportunities.",
    problem:
      "Inconsistent visibility and disconnected campaigns make it difficult for the right customers to find the business.",
    accent: "#6b7cff",
    includes: [
      "Search engine optimization",
      "GEO and AI search optimization",
      "Local SEO",
      "Paid search",
      "Paid social",
      "Content strategy",
      "Content creation",
      "Lead-generation campaigns",
      "Marketing analytics",
    ],
    outcomes: [
      "Clearer search visibility",
      "More qualified opportunities",
      "Campaigns tied to meaningful actions",
    ],
    serviceSlugs: [
      "seo-ai-search",
      "paid-media-lead-generation",
      "branding-content",
    ],
  },
  {
    id: "convert",
    index: "02",
    title: "Convert",
    statement: "Turn attention into enquiries, customers, and revenue.",
    problem:
      "An outdated or unclear digital experience can lose interest before a visitor becomes an enquiry.",
    accent: "#a45a72",
    includes: [
      "Website strategy",
      "Custom website design",
      "WordPress development",
      "Custom web development",
      "Landing pages",
      "E-commerce",
      "UX and UI design",
      "Branding",
      "Logo design",
      "Copywriting",
      "Conversion-rate optimization",
      "Accessibility improvements",
      "Loading-speed optimization",
    ],
    outcomes: [
      "A clearer customer journey",
      "More useful enquiries",
      "A faster and more accessible experience",
    ],
    serviceSlugs: ["web-design-development", "branding-content"],
  },
  {
    id: "operate",
    index: "03",
    title: "Operate",
    statement: "Remove the manual work behind your growth.",
    problem:
      "Leads, approvals, data, and customer tasks often move through inboxes, spreadsheets, and disconnected platforms.",
    accent: "#c76d3f",
    includes: [
      "Workflow automation",
      "CRM implementation",
      "CRM automation",
      "Lead routing",
      "Email and SMS follow-up",
      "Customer onboarding",
      "Internal approvals",
      "Forms and intake systems",
      "System integration",
      "API integration",
      "Odoo and ERP workflow support",
      "Custom software",
      "Customer portals",
      "Internal dashboards",
      "Web applications",
      "Progressive web applications",
      "Mobile applications",
      "AI-assisted task handling",
    ],
    outcomes: [
      "Less repetitive administration",
      "More consistent information",
      "A process that can handle growth",
    ],
    serviceSlugs: [
      "business-automation",
      "custom-software",
      "crm-integrations",
    ],
  },
  {
    id: "scale",
    index: "04",
    title: "Scale",
    statement: "Measure what is working and keep improving.",
    problem:
      "Manual reporting and fragmented data leave teams without a dependable view of performance.",
    accent: "#4b9b80",
    includes: [
      "Analytics dashboards",
      "Business intelligence",
      "Automated reporting",
      "Data consolidation",
      "Customer-lifetime-value reporting",
      "Campaign reporting",
      "Cloud development",
      "Application hosting",
      "DevOps",
      "Monitoring",
      "Backups",
      "Security and privacy improvements",
      "Performance optimization",
      "Ongoing support",
    ],
    outcomes: [
      "A shared view of performance",
      "Less time spent building reports",
      "Infrastructure ready for continued improvement",
    ],
    serviceSlugs: ["analytics-reporting", "cloud-devops"],
  },
];

export const servicePages: ServicePage[] = [
  {
    slug: "web-design-development",
    route: "/services/web-design-development",
    title: "Web Design and Development",
    shortTitle: "Web design",
    stage: "convert",
    eyebrow: "Web design and development",
    headline: "Your website should do more than look current.",
    summary:
      "Arctos plans, designs, and builds websites around the questions customers ask and the actions the business needs them to take.",
    problem:
      "An outdated site, unclear message, or slow path to contact can turn qualified attention into lost opportunity.",
    problems: [
      "Outdated design",
      "Unclear conversion paths",
      "Slow loading",
      "Difficult content updates",
      "Poor mobile usability",
    ],
    capabilities: [
      "Website strategy",
      "Custom website design",
      "WordPress development",
      "Custom web development",
      "Landing pages",
      "E-commerce",
      "UX and UI design",
      "Copywriting",
      "Accessibility improvements",
      "Loading-speed optimization",
    ],
    process: [
      "Clarify the audience and conversion goal",
      "Plan content and information architecture",
      "Design the key journeys",
      "Develop and connect the site",
      "Test, launch, and improve",
    ],
    outcomes: [
      "A credible and current digital presence",
      "Clearer paths from interest to enquiry",
      "A maintainable foundation for marketing",
    ],
    reassurance:
      "The right website is shaped around how customers decide and how your team works after they get in touch.",
    relatedProjects: ["starlings-support-map", "true-north-kromes", "rio-alto"],
    relatedServices: ["branding-content", "seo-ai-search", "crm-integrations"],
    faq: [
      {
        question: "Can Arctos improve an existing website?",
        answer:
          "Yes. The work can begin with an audit and targeted improvements when a full rebuild is not necessary.",
      },
      {
        question: "Do you build custom websites?",
        answer:
          "Yes. Arctos supports custom web development as well as WordPress projects, depending on the content, workflow, and maintenance needs.",
      },
      {
        question: "Can the website connect to our CRM?",
        answer:
          "Yes. Forms, lead routing, customer follow-up, and reporting can be connected as part of the wider system.",
      },
    ],
    cta: "Build a website that earns its place in the system.",
    metaDescription:
      "Conversion-focused website strategy, design, and development for Calgary and Canadian organizations.",
  },
  {
    slug: "seo-ai-search",
    route: "/services/seo-ai-search",
    title: "SEO and AI Search",
    shortTitle: "SEO and AI search",
    stage: "attract",
    eyebrow: "Search visibility",
    headline: "Be useful wherever customers search.",
    summary:
      "Arctos improves the structure, content, and local relevance that help customers and search systems understand a business.",
    problem:
      "Weak search visibility makes it harder for qualified customers to discover the business at the moment they need it.",
    problems: [
      "Low Google visibility",
      "Unclear service pages",
      "Weak local relevance",
      "Content without a search purpose",
      "Technical search issues",
    ],
    capabilities: [
      "Search engine optimization",
      "GEO and AI search optimization",
      "Local SEO",
      "Content strategy",
      "Technical foundations",
      "Search-focused service pages",
      "Marketing analytics",
    ],
    process: [
      "Review current visibility",
      "Map customer questions and search intent",
      "Improve technical and content foundations",
      "Publish useful pages",
      "Measure and refine",
    ],
    outcomes: [
      "Clearer visibility for relevant services",
      "Content that answers real customer questions",
      "A stronger foundation for local discovery",
    ],
    relatedProjects: ["rio-alto", "true-north-kromes"],
    relatedServices: [
      "web-design-development",
      "branding-content",
      "analytics-reporting",
    ],
    faq: [
      {
        question: "What is AI search optimization?",
        answer:
          "It is the work of making business information clear, structured, credible, and useful for search experiences that generate direct answers.",
      },
      {
        question: "Do you guarantee rankings?",
        answer:
          "No. Search performance depends on competition, demand, site quality, and other factors. Arctos focuses on sound foundations and useful, measurable work.",
      },
      {
        question: "Can you support local SEO?",
        answer:
          "Yes. Local relevance is part of the service for organizations serving Calgary or other defined markets.",
      },
    ],
    cta: "Make your expertise easier to find and understand.",
    metaDescription:
      "SEO, local search, and AI search optimization grounded in useful content and clear technical structure.",
  },
  {
    slug: "paid-media-lead-generation",
    route: "/services/paid-media-lead-generation",
    title: "Paid Media and Lead Generation",
    shortTitle: "Paid media",
    stage: "attract",
    eyebrow: "Demand generation",
    headline: "Build the path after the click.",
    summary:
      "Arctos connects paid campaigns to landing pages, forms, lead routing, follow-up, and reporting.",
    problem:
      "Campaigns underperform when the advertisement is treated separately from the experience and workflow that follow it.",
    problems: [
      "Inconsistent leads",
      "Low-quality enquiries",
      "Generic landing pages",
      "Delayed follow-up",
      "Campaign reporting without sales context",
    ],
    capabilities: [
      "Paid search",
      "Paid social",
      "Lead-generation campaigns",
      "Landing pages",
      "Forms and booking flows",
      "CRM lead routing",
      "Automated follow-up",
      "Campaign reporting",
    ],
    process: [
      "Define the audience and offer",
      "Design the campaign journey",
      "Build the conversion experience",
      "Connect lead handling",
      "Measure and improve",
    ],
    outcomes: [
      "A coherent path from advertisement to sales pipeline",
      "Faster and more consistent lead handling",
      "Reporting tied to useful business actions",
    ],
    relatedProjects: ["leaseflow", "fresh-prep-event-intelligence"],
    relatedServices: [
      "web-design-development",
      "crm-integrations",
      "analytics-reporting",
    ],
    faq: [
      {
        question: "Do you only manage advertisements?",
        answer:
          "No. Arctos can connect the campaign to the page, form, CRM, follow-up, and reporting.",
      },
      {
        question: "Can you improve our current lead flow?",
        answer:
          "Yes. The work can begin by finding where enquiries slow down, disappear, or lose context.",
      },
      {
        question: "How is campaign performance measured?",
        answer:
          "Measurement is planned around the useful actions available in the business, not impressions alone.",
      },
    ],
    cta: "Create demand, then give every opportunity somewhere to go.",
    metaDescription:
      "Paid search, paid social, landing pages, lead routing, and campaign reporting as one connected system.",
  },
  {
    slug: "branding-content",
    route: "/services/branding-content",
    title: "Branding and Content",
    shortTitle: "Brand and content",
    stage: "convert",
    eyebrow: "Clarity and identity",
    headline: "Make the business easier to recognize and choose.",
    summary:
      "Arctos shapes identity, copy, and content around the value customers need to understand.",
    problem:
      "A business can be capable and still appear unclear when its identity, language, and digital experience tell different stories.",
    problems: [
      "Inconsistent identity",
      "Generic messaging",
      "Unclear service value",
      "Content without direction",
      "A website that no longer fits the business",
    ],
    capabilities: [
      "Brand strategy",
      "Branding",
      "Logo design",
      "Copywriting",
      "Content strategy",
      "Content creation",
      "Website content",
      "Campaign content",
    ],
    process: [
      "Understand the business and audience",
      "Clarify positioning",
      "Define the verbal and visual direction",
      "Build the core assets",
      "Apply the system consistently",
    ],
    outcomes: [
      "A more recognizable presence",
      "Clearer language for customers",
      "A practical system for future content",
    ],
    relatedProjects: ["rio-alto", "true-north-kromes"],
    relatedServices: [
      "web-design-development",
      "seo-ai-search",
      "paid-media-lead-generation",
    ],
    faq: [
      {
        question: "Can you work with our existing brand?",
        answer:
          "Yes. The work can refine and extend a useful existing identity rather than replace it without reason.",
      },
      {
        question: "Does content include website copy?",
        answer:
          "Yes. Copywriting and content structure can be developed as part of a website or campaign project.",
      },
      {
        question: "Do you offer logo design on its own?",
        answer:
          "Logo design is available, though the strongest result usually comes from first clarifying the wider brand and business context.",
      },
    ],
    cta: "Give the business a clearer voice and a more useful identity.",
    metaDescription:
      "Brand strategy, identity, copywriting, and content for businesses that need to communicate with greater clarity.",
  },
  {
    slug: "business-automation",
    route: "/services/business-automation",
    title: "Business Automation",
    shortTitle: "Automation",
    stage: "operate",
    eyebrow: "Business automation",
    headline: "Eliminate the repetitive work slowing your team down.",
    summary:
      "Arctos reviews how work moves through the organisation, removes unnecessary manual steps, and connects the platforms already in use.",
    problem:
      "Email approvals, spreadsheet tracking, duplicate entry, and repetitive reporting consume time and make information harder to trust.",
    problems: [
      "Email-based approvals",
      "Spreadsheet tracking",
      "Duplicate entry",
      "Repetitive reporting",
      "Disconnected platforms",
      "Slow lead follow-up",
    ],
    capabilities: [
      "Sales and CRM workflows",
      "Customer onboarding",
      "Internal approvals",
      "Forms and intake",
      "Invoice workflows",
      "Reporting",
      "Notifications",
      "System integrations",
      "AI-assisted tasks",
    ],
    process: [
      "Process review",
      "Bottleneck identification",
      "Automation design",
      "Implementation",
      "Optimization",
    ],
    outcomes: [
      "Faster processing",
      "Fewer avoidable errors",
      "Better visibility",
      "Reduced administration",
      "More consistent data",
      "Operations that can scale",
    ],
    reassurance:
      "Automation should improve the systems you already use, not force your business to replace everything.",
    relatedProjects: ["fresh-prep-event-intelligence", "leaseflow"],
    relatedServices: [
      "crm-integrations",
      "custom-software",
      "analytics-reporting",
    ],
    faq: [
      {
        question: "Do we need to replace our current tools?",
        answer:
          "Not necessarily. Arctos begins with the current process and improves the existing technology stack where practical.",
      },
      {
        question: "What should we automate first?",
        answer:
          "Start with repeated work that follows clear rules, creates delays, or causes information to be entered more than once.",
      },
      {
        question: "Can AI be part of the workflow?",
        answer:
          "Yes, when an AI-assisted task has a clear role, useful review points, and appropriate handling of business information.",
      },
    ],
    cta: "Map the manual work and build a better flow.",
    metaDescription:
      "Business automation for Calgary organizations managing repetitive work, disconnected tools, and manual reporting.",
  },
  {
    slug: "custom-software",
    route: "/services/custom-software",
    title: "Custom Software",
    shortTitle: "Custom software",
    stage: "operate",
    eyebrow: "Software built around the work",
    headline: "Some businesses need more than an off-the-shelf tool.",
    summary:
      "Arctos designs and builds internal and customer-facing software around the way the business actually operates.",
    problem:
      "Generic software can create workarounds when a team has a specific customer journey, approval process, or information model.",
    problems: [
      "Software that does not fit the workflow",
      "Manual work between platforms",
      "Customer tasks handled by email",
      "No shared operational view",
      "Ideas without a practical build plan",
    ],
    capabilities: [
      "Custom software",
      "Customer portals",
      "Internal dashboards",
      "Web applications",
      "Progressive web applications",
      "Mobile applications",
      "Interactive maps",
      "Moderation systems",
      "Workflow design",
    ],
    process: [
      "Define the problem and users",
      "Map workflows and information",
      "Plan the technical architecture",
      "Design and build in testable stages",
      "Launch, observe, and improve",
    ],
    outcomes: [
      "A system matched to the real workflow",
      "A clearer customer or staff experience",
      "A maintainable foundation for future improvement",
    ],
    reassurance:
      "Features are planned after the problem, users, and operational constraints are understood.",
    relatedProjects: [
      "starlings-support-map",
      "leaseflow",
      "fresh-prep-event-intelligence",
    ],
    relatedServices: [
      "business-automation",
      "crm-integrations",
      "cloud-devops",
    ],
    faq: [
      {
        question: "How do you decide whether custom software is necessary?",
        answer:
          "Arctos first checks whether an existing platform or a focused integration can solve the problem well.",
      },
      {
        question: "Can you build an internal tool?",
        answer:
          "Yes. Internal dashboards, workflow applications, and reporting tools are part of the service.",
      },
      {
        question: "Can a project begin as a prototype?",
        answer:
          "Yes. A prototype can test the workflow and reduce uncertainty before a broader implementation.",
      },
    ],
    cta: "Build the system the workflow actually needs.",
    metaDescription:
      "Custom web applications, portals, internal tools, and workflow software for growing Canadian organizations.",
  },
  {
    slug: "crm-integrations",
    route: "/services/crm-integrations",
    title: "CRM and Integrations",
    shortTitle: "CRM and integrations",
    stage: "operate",
    eyebrow: "Connected customer operations",
    headline: "Keep opportunities out of inboxes and spreadsheets.",
    summary:
      "Arctos connects forms, CRM records, lead routing, follow-up, and operational platforms so information moves with the customer.",
    problem:
      "Leads get lost and teams repeat work when customer information lives in disconnected forms, inboxes, spreadsheets, and platforms.",
    problems: [
      "Leads lost after submission",
      "Manual lead assignment",
      "Duplicate customer records",
      "Delayed follow-up",
      "Disconnected accounting and operational tools",
    ],
    capabilities: [
      "CRM implementation",
      "CRM automation",
      "Lead routing",
      "Email and SMS follow-up",
      "Customer onboarding",
      "Forms and intake systems",
      "System integration",
      "API integration",
      "Odoo and ERP workflow support",
    ],
    process: [
      "Review the customer and data journey",
      "Define ownership and routing",
      "Design integrations and automation",
      "Configure and test",
      "Support adoption and improvement",
    ],
    outcomes: [
      "Faster lead handling",
      "More consistent customer records",
      "Clearer ownership",
      "Less duplicate entry",
    ],
    reassurance:
      "The CRM should support the sales and service process, not become another administrative burden.",
    relatedProjects: ["leaseflow", "fresh-prep-event-intelligence"],
    relatedServices: [
      "business-automation",
      "analytics-reporting",
      "paid-media-lead-generation",
    ],
    faq: [
      {
        question: "Can you work with our existing CRM?",
        answer:
          "Yes. Arctos can improve an existing setup and connect it to forms, follow-up, reporting, and other business platforms.",
      },
      {
        question: "Do you support ERP workflows?",
        answer:
          "Yes. Arctos can support Odoo and other ERP workflow integrations without claiming an official vendor partnership.",
      },
      {
        question: "Can leads be assigned automatically?",
        answer:
          "Yes. Routing rules can use information such as service need, location, availability, or team ownership when those rules fit the business.",
      },
    ],
    cta: "Connect the customer journey behind the form.",
    metaDescription:
      "CRM implementation, lead routing, follow-up automation, API integration, and connected customer workflows.",
  },
  {
    slug: "analytics-reporting",
    route: "/services/analytics-reporting",
    title: "Analytics and Reporting",
    shortTitle: "Analytics",
    stage: "scale",
    eyebrow: "Performance visibility",
    headline: "Turn scattered data into a useful view of the business.",
    summary:
      "Arctos consolidates marketing and operational information into dashboards and automated reports that teams can act on.",
    problem:
      "Manual reporting takes time, creates inconsistent answers, and separates marketing activity from customer and operational performance.",
    problems: [
      "Time-consuming manual reporting",
      "Data spread across platforms",
      "No shared performance view",
      "Campaign data without customer context",
      "Inconsistent definitions",
    ],
    capabilities: [
      "Analytics dashboards",
      "Business intelligence",
      "Automated reporting",
      "Data consolidation",
      "Customer-lifetime-value reporting",
      "Campaign reporting",
      "Internal dashboards",
    ],
    process: [
      "Define the decisions the report must support",
      "Identify and review data sources",
      "Create a consistent information model",
      "Build and validate the dashboard",
      "Automate delivery and refine",
    ],
    outcomes: [
      "Less reporting administration",
      "A clearer shared view",
      "More consistent performance information",
      "Better questions for continued improvement",
    ],
    relatedProjects: ["fresh-prep-event-intelligence"],
    relatedServices: [
      "crm-integrations",
      "business-automation",
      "cloud-devops",
    ],
    faq: [
      {
        question: "Can you combine data from several platforms?",
        answer:
          "Yes. Data consolidation is useful when the sources are accessible and their definitions can be aligned.",
      },
      {
        question: "Can reports be automated?",
        answer:
          "Yes. Dashboards and scheduled reporting can reduce repeated exports and spreadsheet preparation.",
      },
      {
        question: "Which metrics should we track?",
        answer:
          "The useful set depends on the decisions the team needs to make. Arctos starts there before designing the dashboard.",
      },
    ],
    cta: "Build a view that helps the team decide what to do next.",
    metaDescription:
      "Analytics dashboards, business intelligence, data consolidation, and automated reporting for clearer decisions.",
  },
  {
    slug: "cloud-devops",
    route: "/services/cloud-devops",
    title: "Cloud and DevOps",
    shortTitle: "Cloud and DevOps",
    stage: "scale",
    eyebrow: "Reliable digital operations",
    headline: "Give the system a dependable place to run.",
    summary:
      "Arctos supports the infrastructure, deployment, monitoring, and performance work behind websites and applications.",
    problem:
      "A useful digital product still needs reliable hosting, controlled deployment, monitoring, backups, and ongoing care.",
    problems: [
      "Fragile deployments",
      "Limited monitoring",
      "Unclear backup practices",
      "Performance issues",
      "Infrastructure that is difficult to maintain",
    ],
    capabilities: [
      "Cloud development",
      "Application hosting",
      "DevOps",
      "Monitoring",
      "Backups",
      "Security and privacy improvements",
      "Performance optimization",
      "Ongoing support",
    ],
    process: [
      "Review the application and risks",
      "Plan the environment",
      "Configure deployment and safeguards",
      "Monitor the live system",
      "Improve performance and reliability",
    ],
    outcomes: [
      "More dependable releases",
      "Better operational visibility",
      "A clearer maintenance path",
      "Infrastructure ready to support growth",
    ],
    relatedProjects: ["starlings-support-map", "leaseflow"],
    relatedServices: [
      "custom-software",
      "analytics-reporting",
      "web-design-development",
    ],
    faq: [
      {
        question: "Can you support an existing application?",
        answer:
          "Yes. The first step is a review of the application, environment, documentation, and current operational risks.",
      },
      {
        question: "Does this include monitoring and backups?",
        answer:
          "It can. Monitoring, backup practices, and recovery needs are planned according to the system and its importance to the business.",
      },
      {
        question: "Do you provide ongoing support?",
        answer:
          "Yes. Ongoing optimization and support can continue beyond the initial deployment.",
      },
    ],
    cta: "Make the system easier to deploy, observe, and improve.",
    metaDescription:
      "Cloud development, application hosting, DevOps, monitoring, backups, performance, and ongoing support.",
  },
];

export const services: Service[] = servicePages.map((service) => ({
  slug: service.slug,
  title: service.title,
  group: service.stage,
  headline: service.headline,
  summary: service.summary,
  problem: service.problems,
  capabilities: service.capabilities,
  process: service.process,
  outcomes: service.outcomes,
  faqs: service.faq.map(({ question, answer }) => ({ q: question, a: answer })),
  relatedWork: service.relatedProjects,
}));

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
      poster: "/assets/work/calgary-watch.webp",
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
      poster: "/assets/work/starlings.webp",
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
      poster: "/assets/work/true-north-kromes.webp",
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
      poster: "/assets/work/rio-alto.webp",
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

export const processDetails: ProcessDetail[] = [
  {
    id: "discover",
    index: "01",
    title: "Discover",
    summary:
      "Learn how the business attracts customers, delivers its services, and manages information.",
    detail:
      "The work begins with the current customer journey, team responsibilities, tools, constraints, and definition of success.",
    deliverables: [
      "Stakeholder context",
      "Current-state understanding",
      "Shared project goals",
    ],
  },
  {
    id: "map",
    index: "02",
    title: "Map",
    summary:
      "Identify customer friction, manual processes, bottlenecks, and disconnected systems.",
    detail:
      "Arctos makes the current flow visible so the team can distinguish a surface problem from its operational cause.",
    deliverables: [
      "Customer journey",
      "Workflow map",
      "Prioritized opportunities",
    ],
  },
  {
    id: "design",
    index: "03",
    title: "Design",
    summary:
      "Plan the customer experience, workflow, automation logic, content, and technical architecture.",
    detail:
      "The proposed system is defined before implementation, with clear responsibilities and testable decisions.",
    deliverables: [
      "Experience direction",
      "Content and workflow plan",
      "Technical approach",
    ],
  },
  {
    id: "build",
    index: "04",
    title: "Build",
    summary: "Design, develop, connect, and test the system.",
    detail:
      "The website, application, integration, or automation is built in practical stages and checked against the planned workflow.",
    deliverables: [
      "Working system",
      "Connected platforms",
      "Quality assurance",
    ],
  },
  {
    id: "launch",
    index: "05",
    title: "Launch",
    summary: "Deploy the system, configure analytics, and support adoption.",
    detail:
      "Launch includes the operational details needed to move from a tested build to day-to-day use.",
    deliverables: ["Deployment", "Analytics configuration", "Adoption support"],
  },
  {
    id: "improve",
    index: "06",
    title: "Improve",
    summary:
      "Use real-world behaviour and performance data to guide continued improvement.",
    detail:
      "Arctos reviews what people do, what the team learns, and where the system can become clearer or more effective.",
    deliverables: [
      "Performance review",
      "Prioritized refinements",
      "Ongoing support",
    ],
  },
];

export const processSteps: ProcessStep[] = processDetails.map((step) => ({
  title: step.title,
  body: step.summary,
}));

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

export function getServicePageBySlug(slug: string): ServicePage | undefined {
  return servicePages.find((service) => service.slug === slug);
}

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

export const getService = getServiceBySlug;

export function getServicesByStage(stage: GrowthStage): Service[] {
  return services.filter((service) => service.group === stage);
}

export function getServicePagesByStage(stage: GrowthStage): ServicePage[] {
  return servicePages.filter((service) => service.stage === stage);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export const getProject = getProjectBySlug;

export function getFeaturedProjects(): Project[] {
  return projects.filter((project) => project.featured);
}

export function getIndustryBySlug(slug: string): Industry | undefined {
  return industries.find((industry) => industry.slug === slug);
}

export const getIndustry = getIndustryBySlug;

export function getProcessStepById(id: string): ProcessStep | undefined {
  const index = processDetails.findIndex((step) => step.id === id);
  return index < 0 ? undefined : processSteps[index];
}

export function getRelatedServices(service: ServicePage): ServicePage[] {
  return service.relatedServices
    .map(getServicePageBySlug)
    .filter((related): related is ServicePage => Boolean(related));
}

export function getRelatedProjects(service: ServicePage): Project[] {
  return service.relatedProjects
    .map(getProjectBySlug)
    .filter((project): project is Project => Boolean(project));
}
