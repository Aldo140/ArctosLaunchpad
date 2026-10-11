import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "HQ",
  description: "Private operations dashboard.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  // Added to a phone's home screen, HQ opens full screen like an app.
  manifest: "/hq/manifest.webmanifest",
  appleWebApp: { capable: true, title: "HQ", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0d1b1e",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function HqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
