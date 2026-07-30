import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontClass } from "./fonts";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LoadingIntro, INTRO_BOOTSTRAP } from "@/components/LoadingIntro";
import { ChromeSync } from "@/components/ChromeSync";
import { ScrollRefresh } from "@/components/ScrollRefresh";
import { SurveyRule } from "@/components/SurveyRule";
import {
  SITE_NAME,
  SITE_URL,
  graph,
  jsonLd,
  ogImageUrl,
  organizationSchema,
  websiteSchema,
} from "@/lib/seo";

/**
 * The root metadata doubles as the homepage's own metadata: `/` has no separate
 * page-level export, so the title, description, canonical, and share card below
 * are the ones the homepage ships. Interior pages build a complete replacement
 * through `pageMetadata` — Next.js shallow-merges metadata, so a page that
 * declares `openGraph` replaces this one wholesale rather than extending it.
 */
const homeCardTitle = "The systems behind growing businesses.";
const homeCard = ogImageUrl(homeCardTitle, "Calgary, Alberta");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Arctos Launchpad | Digital Growth and Technology Studio",
    template: "%s | Arctos Launchpad",
  },
  description:
    "Calgary studio building conversion-focused websites, lead-generation systems, custom software, workflow automation, and reporting.",
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: homeCardTitle,
    description:
      "Marketing, websites, software, automation, and reporting connected around how your business works.",
    images: [
      { url: homeCard, width: 1200, height: 630, alt: homeCardTitle },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arctos Launchpad",
    description: homeCardTitle,
    images: [homeCard],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#081319",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  /**
   * The identity graph, carried on every page so the `@id` references used by
   * page-level Service, CreativeWork, and breadcrumb nodes always resolve.
   * Locality only — there is no public street address or phone number, and
   * neither is invented here.
   */
  const schema = graph(organizationSchema(), websiteSchema());

  return (
    // The bootstrap script stamps `js` and `data-intro` on <html> before React
    // hydrates, which React would otherwise report as a mismatch.
    <html lang="en-CA" className={fontClass} suppressHydrationWarning>
      <head>
        {/* Decides before first paint whether this session sees the loader. */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_BOOTSTRAP }} />
      </head>
      <body id="top" data-material="instrument">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <LoadingIntro />
        <SurveyRule />
        <SiteHeader />
        <ChromeSync />
        <ScrollRefresh />
        <main id="main">{children}</main>
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd(schema)}
        />
      </body>
    </html>
  );
}
