import { getIslandForStage, projects, type IndustryPage, type Project, type ServicePage } from "@/lib/content";

/**
 * Real work tagged with this industry, primary-industry projects first.
 * Never broadened: an industry with no tagged project shows none.
 */
export function workIn(title: string): Project[] {
  return projects
    .filter((p) => p.industries.includes(title))
    .sort((a, b) => a.industries.indexOf(title) - b.industries.indexOf(title));
}

/**
 * Editorial routing from a named friction to the service that usually
 * addresses it first. Keys are the challenge text from the content file;
 * anything unmapped falls back to the service in the same position.
 */
const ROUTES: Record<string, string[]> = {
  "Outdated websites": ["web-design-development"],
  "Manual intake": ["business-automation", "crm-integrations"],
  "Disconnected customer information": ["crm-integrations"],
  "Repetitive administration": ["custom-software", "business-automation"],
  "Complex services": ["web-design-development"],
  "Manual quoting or intake": ["business-automation"],
  "Disconnected operational platforms": ["custom-software"],
  "Limited performance visibility": ["analytics-reporting"],
  "Information that is difficult to find": ["web-design-development"],
  "Manual programme administration": ["custom-software"],
  "Disconnected data": ["analytics-reporting"],
  "Limited internal capacity": ["business-automation"],
  "Inconsistent lead quality": ["paid-media-lead-generation", "web-design-development"],
  "Slow quote follow-up": ["crm-integrations"],
  "Email-based approvals": ["business-automation"],
  "Spreadsheet tracking": ["crm-integrations"],
  "Scattered listing enquiries": ["web-design-development", "crm-integrations"],
  "Manual follow-up": ["business-automation"],
  "Unorganized application information": ["custom-software"],
  "Disconnected property tools": ["crm-integrations"],
  "Generic positioning": ["branding-content"],
  "Low-quality enquiries": ["seo-ai-search", "web-design-development"],
  "Leads lost after contact": ["crm-integrations"],
  "Unclear product value": ["web-design-development"],
  "Disconnected acquisition data": ["paid-media-lead-generation", "analytics-reporting"],
  "Workflow gaps": ["custom-software"],
  "Manual reporting": ["analytics-reporting"],
  "Generic digital presence": ["branding-content"],
  "Weak local discovery": ["seo-ai-search"],
  "Difficult content updates": ["web-design-development"],
  "Disconnected booking paths": ["web-design-development"],
  "Scattered signup data": ["business-automation"],
  "Manual event reports": ["analytics-reporting"],
  "Limited customer context": ["paid-media-lead-generation", "analytics-reporting"],
  "Inconsistent team reporting": ["analytics-reporting", "business-automation"],
  "Complex service information": ["web-design-development"],
  "Disconnected records": ["crm-integrations"],
  "Repetitive follow-up": ["business-automation", "crm-integrations"],
};

export type Route = { challenge: string; targets: number[] };

export function routesFor(industry: IndustryPage, services: ServicePage[]): Route[] {
  return industry.challenges.map((challenge, i) => {
    const mapped = (ROUTES[challenge] ?? [])
      .map((slug) => services.findIndex((s) => s.slug === slug))
      .filter((k) => k >= 0);
    return { challenge, targets: mapped.length ? mapped : [i % services.length] };
  });
}

export function litIslands(services: ServicePage[]) {
  return [...new Set(services.map((s) => getIslandForStage(s.stage).id))];
}
