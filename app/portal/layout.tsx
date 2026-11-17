import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Client portal",
  description: "Your private Arctos Launchpad workspace.",
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#091315" };

export default function PortalLayout({ children }: { children: React.ReactNode }) { return children; }
