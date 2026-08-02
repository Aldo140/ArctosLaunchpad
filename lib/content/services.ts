/* =========================================================================
   ARCTOS — the offer: stages, service pages, and their lookups
   -------------------------------------------------------------------------
   Was part of one 1,900-line lib/content.ts. Split by subject so a content
   edit touches one reviewable file. Import from "@/lib/content" as before —
   index.ts re-exports everything, so no call site changed.
   ========================================================================= */

import type {
  GrowthStage,
  Service,
  ServiceGroup,
  ServicePage,
} from "./types";

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
      "product-strategy-consulting",
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
    serviceSlugs: ["web-design-development", "branding-content", "ui-ux-design"],
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
      "app-software-development",
      "ai-product-development",
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
    slug: "product-strategy-consulting",
    route: "/services/product-strategy-consulting",
    title: "Product Strategy Consulting",
    shortTitle: "Product strategy",
    stage: "attract",
    eyebrow: "Product strategy consulting",
    headline: "Decide what to build before anyone builds it.",
    summary:
      "Arctos works through the audience, the problem, and the first release, so the budget goes to the version worth shipping.",
    problem:
      "The expensive decisions are made before any code exists. A roadmap built on assumption is difficult and slow to unwind once a team has built against it.",
    problems: [
      "Competing ideas with no way to choose between them",
      "A roadmap based on opinion",
      "Scope that grows faster than the budget",
      "No agreed definition of a first release",
      "Research that never reaches a decision",
    ],
    capabilities: [
      "Discovery workshops",
      "Customer and stakeholder interviews",
      "Problem and opportunity definition",
      "Competitive review",
      "Product roadmap",
      "Scope and release planning",
      "Prototype validation",
      "Success measures and reporting",
    ],
    process: [
      "Agree the decision the work has to inform",
      "Interview customers and the people who serve them",
      "Define the problem and who has it",
      "Shape a first release and what it must prove",
      "Set the measures that tell you it worked",
    ],
    outcomes: [
      "A defined audience and problem",
      "A first release the team agrees on",
      "Evidence behind the roadmap",
    ],
    reassurance:
      "This can run as a short standalone engagement. There is no obligation for Arctos to build what it recommends.",
    relatedProjects: ["fresh-prep-event-intelligence", "leaseflow"],
    relatedServices: [
      "ui-ux-design",
      "app-software-development",
      "analytics-reporting",
    ],
    faq: [
      {
        question: "How long does a strategy engagement take?",
        answer:
          "Most run between two and six weeks, depending on how many customers and internal stakeholders need to be spoken to.",
      },
      {
        question: "Do we have to build with Arctos afterwards?",
        answer:
          "No. The output is yours, and it is written so another team could pick it up and build from it.",
      },
      {
        question: "What if we already know what we want to build?",
        answer:
          "Then the work is shorter and focuses on validating the plan and defining the first release rather than exploring the problem.",
      },
    ],
    cta: "Test the plan before it becomes a build.",
    metaDescription:
      "Product strategy consulting: discovery, customer research, roadmap, and release planning for Calgary and Canadian organizations.",
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
    slug: "ui-ux-design",
    route: "/services/ui-ux-design",
    title: "UI and UX Design",
    shortTitle: "UI/UX design",
    stage: "convert",
    eyebrow: "UI and UX design",
    headline: "An interface that needs explaining is a cost you pay forever.",
    summary:
      "Arctos designs the flows, screens, and design system for products and applications, as a standalone engagement or alongside a build.",
    problem:
      "Software that is hard to use gets worked around, and every workaround becomes a support request, a training session, or a customer who leaves.",
    problems: [
      "Screens designed one at a time",
      "Users needing training for routine tasks",
      "Inconsistent patterns across an application",
      "Accessibility handled at the end, if at all",
      "Designs that cannot be built as drawn",
    ],
    capabilities: [
      "UX research and usability testing",
      "User flows and journey mapping",
      "Information architecture",
      "Wireframing and prototyping",
      "Interface design",
      "Design systems and component libraries",
      "Accessibility review to WCAG",
      "Design-to-development handoff",
    ],
    process: [
      "Learn the task the person is actually trying to finish",
      "Map the flow before drawing any screen",
      "Prototype the difficult parts first",
      "Design the system, not only the pages",
      "Hand off with the states and rules written down",
    ],
    outcomes: [
      "A clearer path through the product",
      "Consistent patterns that scale to new screens",
      "Fewer questions arriving as support",
    ],
    reassurance:
      "Design can be bought on its own. Arctos regularly hands finished work to an in-house or third-party development team.",
    relatedProjects: ["starlings-support-map", "leaseflow", "calgary-watch"],
    relatedServices: [
      "web-design-development",
      "app-software-development",
      "product-strategy-consulting",
    ],
    faq: [
      {
        question: "Is this different from your web design service?",
        answer:
          "Yes. Web design and development covers the marketing website. This covers the product or application people log into and use to do work.",
      },
      {
        question: "Can you work with our existing developers?",
        answer:
          "Yes. Handoff includes the component library, interaction states, and accessibility notes your team needs to build from.",
      },
      {
        question: "Do you test designs with real users?",
        answer:
          "Where the engagement allows it, yes. Even a small round of usability sessions changes what gets built.",
      },
    ],
    cta: "Make the product obvious to the person using it.",
    metaDescription:
      "UI and UX design: research, user flows, prototyping, interface design, design systems, and accessibility.",
  },
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
    slug: "ai-product-development",
    route: "/services/ai-product-development",
    title: "AI Product Development",
    shortTitle: "AI development",
    stage: "operate",
    eyebrow: "AI product development",
    headline: "Put intelligence where the manual work is.",
    summary:
      "Arctos builds AI into the parts of an operation that are decision-shaped — routing, summarising, classifying, drafting — and keeps a person in the loop where it matters.",
    problem:
      "A great deal of routine work is judgement applied to text: reading an enquiry and deciding where it goes, summarising a call, classifying a document. It is done by people because nothing else was ever wired up to do it.",
    problems: [
      "Staff reading and re-keying the same information",
      "Enquiries triaged by hand",
      "Documents summarised manually",
      "AI pilots that never reached production",
      "No way to tell whether the output can be trusted",
    ],
    capabilities: [
      "Use-case identification and feasibility review",
      "Retrieval over your own documents and data",
      "Document and enquiry classification",
      "Drafting and summarisation workflows",
      "AI-assisted task handling inside existing systems",
      "Human review and approval steps",
      "Evaluation, monitoring, and cost controls",
      "Data handling and privacy review",
    ],
    process: [
      "Find the work that is repetitive and decision-shaped",
      "Check the data and whether the task is a fair fit",
      "Build a narrow version and measure it against the current process",
      "Add review steps and the limits it must not exceed",
      "Release, monitor accuracy and cost, and extend",
    ],
    outcomes: [
      "Routine decisions handled automatically",
      "A measured view of accuracy and cost",
      "Capacity that does not scale with headcount",
    ],
    reassurance:
      "Arctos will say when a task is a poor fit for AI. A deterministic automation is often the better and cheaper answer, and that recommendation costs nothing.",
    relatedProjects: ["fresh-prep-event-intelligence", "leaseflow"],
    relatedServices: [
      "business-automation",
      "analytics-reporting",
      "app-software-development",
    ],
    faq: [
      {
        question: "Does our data get used to train someone else's model?",
        answer:
          "No. Providers and configurations are chosen so your data is not retained for training, and the data handling is documented as part of the work.",
      },
      {
        question: "What if the AI gets something wrong?",
        answer:
          "Anything with real consequences keeps a human approval step. The system is built to escalate cases it is not confident about rather than guess.",
      },
      {
        question: "Do we need AI at all?",
        answer:
          "Often not. If a rules-based automation solves the problem more reliably and for less money, that is what Arctos will recommend.",
      },
    ],
    cta: "Find the work that is worth automating with AI.",
    metaDescription:
      "AI product development: retrieval, classification, summarisation, and human-in-the-loop workflows built into your existing systems.",
  },
  {
    slug: "app-software-development",
    route: "/services/app-software-development",
    title: "App and Software Development",
    shortTitle: "App development",
    stage: "operate",
    eyebrow: "App and software development",
    headline: "Build the product the off-the-shelf tools cannot.",
    summary:
      "Arctos designs and builds web and mobile applications, from a first release through to the version that carries real users.",
    problem:
      "Off-the-shelf software covers the common case. The part that differentiates a business is usually the part no vendor sells.",
    problems: [
      "A product idea with no route to a first release",
      "A prototype that cannot carry real users",
      "Features bolted onto software never meant to hold them",
      "No clear owner for the application after launch",
      "Releases that are risky enough to avoid",
    ],
    capabilities: [
      "Web applications",
      "Progressive web applications",
      "Mobile applications",
      "APIs and back-end services",
      "Authentication and permissions",
      "Third-party integrations",
      "Automated testing",
      "Release and deployment pipelines",
    ],
    process: [
      "Agree the first release and what it must do",
      "Design the data model and the key journeys",
      "Build in slices that can be used and reviewed",
      "Test, instrument, and release",
      "Support, measure, and iterate",
    ],
    outcomes: [
      "An application shaped to how the work actually runs",
      "A release process the team can repeat safely",
      "A codebase another developer can pick up",
    ],
    reassurance:
      "The work is documented and the code is yours. Arctos can continue supporting it or hand it to your team.",
    relatedProjects: ["leaseflow", "fresh-prep-event-intelligence", "calgary-watch"],
    relatedServices: [
      "custom-software",
      "ui-ux-design",
      "cloud-devops",
    ],
    faq: [
      {
        question: "How is this different from custom software?",
        answer:
          "Custom software usually means internal tools and portals that support an existing operation. This is for a product application with its own users, releases, and roadmap.",
      },
      {
        question: "Can you take over an existing application?",
        answer:
          "Yes. That normally starts with a review of the codebase, the deployment setup, and the highest-risk parts.",
      },
      {
        question: "Do you build native mobile apps?",
        answer:
          "Arctos builds progressive web applications and cross-platform mobile applications, and will say when a fully native build is the better answer.",
      },
    ],
    cta: "Ship the first version, then the one that lasts.",
    metaDescription:
      "Web and mobile application development, APIs, integrations, testing, and release pipelines from a Calgary studio.",
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
  /* ---------------------------------------------------------------------
     Added offerings. These sit alongside the existing pages rather than
     replacing them, so each one is written against a distinct engagement:
     UI/UX Design is design bought on its own rather than as part of a site
     build, App and Software Development is a product application rather than
     an internal tool, and AI Product Development is the intelligence layer
     over work that is currently done by hand.
     ------------------------------------------------------------------- */
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

export function getRelatedServices(service: ServicePage): ServicePage[] {
  return service.relatedServices
    .map(getServicePageBySlug)
    .filter((related): related is ServicePage => Boolean(related));
}
