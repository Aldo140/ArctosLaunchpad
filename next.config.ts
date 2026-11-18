import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repositoryBasePath = isGitHubPages ? "/ArctosLaunchpad" : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: isGitHubPages ? "export" : undefined,
  basePath: repositoryBasePath,
  assetPrefix: repositoryBasePath || undefined,
  trailingSlash: isGitHubPages,
  env: {
    NEXT_PUBLIC_STATIC_EXPORT: isGitHubPages ? "true" : "false",
  },
  images: {
    unoptimized: isGitHubPages,
    /* WebP only, and deliberately so. These illustrations carry a heavy paper
       grain, which is the one thing AVIF encodes badly: measured at the size
       they actually render, AVIF came out 2-3x LARGER than WebP for the same
       source (e.g. connected-automation at 640px: 18.7KB webp/q75 vs 63.2KB
       avif/q88, 41KB at avif/q80). Adding AVIF here would have made the page
       slower, so the format stays as it is. */
    formats: ["image/webp"],
  },
  turbopack: { root: process.cwd() },
  async headers() {
    if (isGitHubPages) return [];
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://checkout.stripe.com\")" },
        { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
        ...(process.env.NODE_ENV === "production" ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
      ],
    }];
  },
};

export default nextConfig;
