/**
 * Keystone, the Arctos pro bono program. Everything the page promises lives
 * here so the commitments can be read and changed in one place.
 *
 * Nothing on the page claims past Keystone projects: the proof section shows
 * live community work the studio has shipped, and says so plainly.
 */

export const KEYSTONE = {
  name: "Keystone",
  route: "/pro-bono",
  need: "pro-bono",
  /** How often the studio takes a Keystone project. */
  cadence: "A few times a year",
} as const;

/** The illustrative statement of work in the hero. Hours, not dollars. */
export const KEYSTONE_STATEMENT = {
  /** Typed into "Prepared for", once through, ending on the visitor. */
  for: ["a youth shelter", "a food bank", "a community arts collective", "a family café starting over", "your organization"],
  lines: [
    { label: "Discovery and strategy", hours: 12 },
    { label: "Website design and build", hours: 64 },
    { label: "Automation and integrations", hours: 28 },
    { label: "Impact reporting dashboard", hours: 18 },
    { label: "Launch, training and handover", hours: 10 },
  ],
} as const;

export const KEYSTONE_PROMISES = [
  { big: "$0", label: "Invoiced for design and build. Not discounted: free." },
  { big: "1:1", label: "The same team and the same standards as paid work." },
  { big: "100%", label: "Yours at the end: the site, the code and every account." },
] as const;

export const KEYSTONE_FOR = [
  {
    id: "nonprofit",
    title: "Nonprofits and charities",
    body: "Registered or not. Organizations whose budget goes to the people they serve, not to their website.",
    eg: ["Food banks", "Shelters", "Youth programs", "Health and support"],
  },
  {
    id: "community",
    title: "Community groups",
    body: "The volunteer-run efforts a neighbourhood leans on, usually held together with a spreadsheet and goodwill.",
    eg: ["Community associations", "Arts collectives", "Sports clubs", "Mutual aid"],
  },
  {
    id: "social",
    title: "Social enterprises",
    body: "Businesses built around a mission, where the profit is the means and the community is the point.",
    eg: ["Employment programs", "Co-ops", "Local makers", "Reuse and repair"],
  },
  {
    id: "small",
    title: "Small businesses in a hard season",
    body: "A family business rebuilding after a setback, or a founder with a real need and no runway for a studio.",
    eg: ["After a disaster", "First-time founders", "Starting over", "Owner-run shops"],
  },
] as const;

export const KEYSTONE_GETS = [
  {
    island: "win",
    title: "A website that works for you",
    items: [
      "Designed and built from scratch, not a template",
      "Fast, accessible to WCAG AA, and easy to update",
      "Donations, sign-ups or bookings that actually arrive",
      "Search and AI-search basics done properly",
    ],
  },
  {
    island: "run",
    title: "Less admin, more mission",
    items: [
      "Volunteer, client or donor intake in one place",
      "Automatic follow-ups and confirmations",
      "Forms, spreadsheets and inboxes connected",
      "Hours handed back to the people doing the work",
    ],
  },
  {
    island: "see",
    title: "Impact you can show",
    items: [
      "A live dashboard of the numbers that matter",
      "Ready-made figures for funders and grant reports",
      "Board updates without the weekend spreadsheet",
      "A clear picture of what is working",
    ],
  },
] as const;

export const KEYSTONE_STEPS = [
  {
    title: "Apply",
    body: "About ten minutes. Who you serve, what is getting in the way, and what would change if it were fixed.",
  },
  {
    title: "A conversation",
    body: "If it looks like a fit, a short call with the people who would do the work. No pitch deck needed.",
  },
  {
    title: "Selection",
    body: "We choose the projects where our time makes the biggest difference, and every applicant hears back.",
  },
  {
    title: "The build",
    body: "The same process as paid work: discovery, design, build and testing, with progress you can see every week.",
  },
  {
    title: "Launch and handover",
    body: "You own everything. We train your team, and we stay reachable for questions after launch.",
  },
] as const;

/** The fit check. Each true statement sets a stone in the arch. */
export const KEYSTONE_FIT = [
  "We’re a nonprofit, community group, social enterprise, or a small business in a hard season.",
  "Our work makes a difference people can point to.",
  "Our website or tools are holding that work back.",
  "A studio build isn’t in our budget right now.",
  "Someone on our side can give a few hours a week during the project.",
  "We’re happy for Arctos to share the work and the story.",
] as const;

export const KEYSTONE_ASK = [
  {
    title: "Permission to show the work",
    body: "A case study on this site, written with you and approved by you before it goes live.",
  },
  {
    title: "An honest review",
    body: "If we earned it. If we didn’t, we would rather hear why.",
  },
  {
    title: "A small credit",
    body: "“Built with Arctos Keystone” in your footer. Optional, and yours to remove.",
  },
  {
    title: "A check-in after launch",
    body: "Thirty minutes, a few months in, so we learn what made a difference.",
  },
] as const;

export const KEYSTONE_FAQ = [
  {
    question: "Is Keystone really free?",
    answer:
      "Yes. Arctos does not invoice for the design, build or setup of a Keystone project. Third-party costs such as your domain, hosting or software subscriptions stay with you, and we help you find the nonprofit pricing many providers offer, often free.",
  },
  {
    question: "Do we have to be a registered charity?",
    answer:
      "No. Registered charities and nonprofits are welcome, and so are community groups, social enterprises and small businesses going through a hard season. What matters is the difference the work makes.",
  },
  {
    question: "How many Keystone projects do you take?",
    answer:
      "A small number each year, so each one gets the full studio rather than leftover time. If we can’t take your project now, we tell you, and we can keep your application for the next opening.",
  },
  {
    question: "Who owns the website and the code?",
    answer:
      "You do. The site, the code, the content and every account are set up in your name, so you are never locked in to Arctos.",
  },
  {
    question: "Why would a company do work for free?",
    answer:
      "Because it is good work worth doing, and because it is the clearest way to show what the studio can do. We ask to share the project as a case study, and that is the trade.",
  },
  {
    question: "Where do you work?",
    answer:
      "Arctos is based in Calgary, Alberta, and works with organizations across Canada and the United States, remotely or in person in Calgary.",
  },
] as const;
