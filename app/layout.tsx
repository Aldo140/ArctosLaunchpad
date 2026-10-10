import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontClass } from "./fonts";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SiteChrome } from "@/components/site/SiteChrome";
import { ConversionTracking } from "@/components/site/ConversionTracking";
import { Analytics } from "@vercel/analytics/next";
import { Motion } from "@/components/site/Motion";
import {
  SITE_NAME,
  SITE_DESCRIPTION,
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
const homeCardTitle = "Arctos Launchpad | Calgary Marketing & Software Agency";
const homeCard = ogImageUrl(homeCardTitle, "Calgary, Alberta");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Arctos Launchpad | Calgary Marketing & Software Agency",
    template: "%s | Arctos Launchpad",
  },
  description: SITE_DESCRIPTION,
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
    description: SITE_DESCRIPTION,
    images: [
      { url: homeCard, width: 1200, height: 630, alt: homeCardTitle },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arctos Launchpad",
    description: SITE_DESCRIPTION,
    images: [homeCard],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d1b1e",
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
    <html lang="en-CA" className={fontClass} suppressHydrationWarning>
      <head>
        {/* Reveal states are only armed when motion is welcome, before first paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('js-motion')}catch(e){}",
          }}
        />
      </head>
      <body id="top">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteChrome>
          <Header />
        </SiteChrome>
        <main id="main">
          <Motion />
          {children}
        </main>
        <SiteChrome>
          <Footer />
        </SiteChrome>
        <ConversionTracking />
        {/* Only Vercel serves the analytics endpoint; elsewhere it would 404. */}
        {process.env.VERCEL ? <Analytics /> : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd(schema)}
        />
      </body>
    </html>
  );
}
