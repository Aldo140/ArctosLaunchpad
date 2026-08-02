/* =========================================================================
   ARCTOS — the process steps, and their lookup
   -------------------------------------------------------------------------
   Was part of one 1,900-line lib/content.ts. Split by subject so a content
   edit touches one reviewable file. Import from "@/lib/content" as before —
   index.ts re-exports everything, so no call site changed.
   ========================================================================= */

import type { ProcessDetail, ProcessStep } from "./types";

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

export function getProcessStepById(id: string): ProcessStep | undefined {
  const index = processDetails.findIndex((step) => step.id === id);
  return index < 0 ? undefined : processSteps[index];
}
