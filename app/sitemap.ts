import type { MetadataRoute } from "next";
import { calgaryLandingPages, industries, projects, services, type Project } from "@/lib/content";

export const dynamic = "force-static";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://arctoslaunchpad.com"
).replace(/\/$/, "");

const routes = [
  ["", 1, "weekly"],
  ["/services", 0.9, "monthly"],
  ["/work", 0.8, "monthly"],
  ["/process", 0.8, "monthly"],
  ["/studio", 0.8, "monthly"],
  ["/contact", 0.9, "monthly"],
  ["/industries", 0.8, "monthly"],
  ["/privacy", 0.3, "yearly"],
  ["/accessibility", 0.3, "yearly"],
] as const satisfies ReadonlyArray<
  readonly [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]]
>;

/**
 * Every real image a case study shows, so Google Images can index the work
 * with the alt text already written for it. De-duplicated, absolute URLs.
 */
function caseStudyImages(project: Project): string[] {
  const srcs = [
    project.featuredImage,
    project.phone,
    ...(project.showcaseMedia ?? []).map((m) => m.src),
    ...(project.caseMedia ?? []).map((m) => m.src),
    ...(project.specimens ?? []).map((m) => m.src),
  ].filter((src): src is string => Boolean(src) && !/\.(mp4|webm)$/i.test(src!));
  return [...new Set(srcs)].map((src) => `${siteUrl}${src}`);
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = routes.map(
    ([path, priority, changeFrequency]) => ({
      url: `${siteUrl}${path}`,
      priority,
      changeFrequency,
    }),
  );

  const contentEntries: MetadataRoute.Sitemap = [
    ...services.map(({ slug }) => ({
      url: `${siteUrl}/services/${slug}`,
      priority: 0.8,
      changeFrequency: "monthly" as const,
    })),
    ...projects.map((project) => ({
      url: `${siteUrl}/work/${project.slug}`,
      priority: 0.7,
      changeFrequency: "monthly" as const,
      images: caseStudyImages(project),
    })),
    ...calgaryLandingPages.map(({ route }) => ({
      url: `${siteUrl}${route}`,
      priority: 0.85,
      changeFrequency: "monthly" as const,
    })),
    ...industries.map(({ slug }) => ({
      url: `${siteUrl}/industries/${slug}`,
      priority: 0.7,
      changeFrequency: "monthly" as const,
    })),
  ];

  // The guide carries a real "last checked" date, so it can report one honestly.
  const guides: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/guides/alberta-digital-funding`,
      lastModified: "2026-10-06",
      priority: 0.5,
      changeFrequency: "monthly",
    },
  ];

  return [...staticEntries, ...contentEntries, ...guides];
}
