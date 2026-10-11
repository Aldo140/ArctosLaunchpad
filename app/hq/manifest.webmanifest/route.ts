/**
 * HQ as a home-screen app: opens straight to /hq, full screen, in HQ's own
 * colours. Only HQ links this manifest (app/hq/layout.tsx); the public site
 * stays a normal website.
 */
export const dynamic = "force-static";

export function GET() {
  return new Response(
    JSON.stringify({
      name: "Aldo's HQ",
      short_name: "HQ",
      description: "Money, decisions, the gym and the day, in one place.",
      id: "/hq",
      start_url: "/hq#today",
      scope: "/hq",
      display: "standalone",
      orientation: "portrait",
      background_color: "#0d1b1e",
      theme_color: "#0d1b1e",
      icons: [
        { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      ],
      shortcuts: [
        { name: "Decide", url: "/hq#decide" },
        { name: "Money", url: "/hq#money" },
        { name: "Life", url: "/hq#life" },
      ],
    }),
    { headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=3600" } },
  );
}
