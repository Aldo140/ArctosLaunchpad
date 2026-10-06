import type { MetadataRoute } from "next";
import { calgaryLandingPages, industries, projects, services } from "@/lib/content";

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
  ["/guides/alberta-digital-funding", 0.5, "monthly"],
] as const satisfies ReadonlyArray<
  readonly [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]]
>;

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
    ...projects.map(({ slug }) => ({
      url: `${siteUrl}/work/${slug}`,
      priority: 0.7,
      changeFrequency: "monthly" as const,
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

  return [...staticEntries, ...contentEntries];
}
