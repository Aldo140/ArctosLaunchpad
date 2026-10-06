import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://arctoslaunchpad.com"
).replace(/\/$/, "");

/**
 * AI search and assistant crawlers, named explicitly so the welcome is on the
 * record: these are what let ChatGPT, Claude, Perplexity, Gemini and Copilot
 * read and cite the site when someone asks for a Calgary studio.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: "/api/" },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
