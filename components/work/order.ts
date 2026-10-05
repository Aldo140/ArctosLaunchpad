import { projects, type Project } from "@/lib/content";

/** The ICP order from the v2 brief: the two clients we want more of lead. */
const ORDER = [
  "fresh-prep-event-intelligence",
  "true-north-kromes",
  "calgary-watch",
  "rio-alto",
  "starlings-support-map",
  "leaseflow",
];

export const workOrder: Project[] = ORDER.map((slug) =>
  projects.find((p) => p.slug === slug),
).filter((p): p is Project => Boolean(p));

export const hostOf = (url?: string) =>
  url ? new URL(url).host.replace(/^www\./, "") : null;

export const pad = (n: number) => String(n).padStart(2, "0");

/** Label for the fifth beat. Existing logic, kept as it was. */
export const isDemoStatus = (p: Project) =>
  p.status === "internal-tool" || p.status === "working-demo";
