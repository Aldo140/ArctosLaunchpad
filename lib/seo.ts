import type { Metadata } from "next";
import { servicePages } from "./content";

/**
 * SEO plumbing — one source of truth for canonical URLs, share cards, and
 * structured data.
 *
 * Two rules govern everything in this file:
 *
 *   1. Nothing here may assert a fact the site cannot back up. No street
 *      address, no phone number, no ratings, no review counts, no founding
 *      date, no vendor partnerships, no service areas beyond the two the
 *      studio actually states (Calgary, and Canada generally).
 *   2. Every page gets its own title, description, canonical, and share card.
 *      Metadata in Next.js is shallow-merged, so a page that declares
 *      `openGraph` replaces the parent's `openGraph` outright — which is why
 *      pages build their whole card through `pageMetadata` rather than
 *      inheriting half of one from the root layout.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://arctoslaunchpad.com"
).replace(/\/$/, "");

export const SITE_NAME = "Arctos Launchpad";
export const SITE_LOCALE = "en_CA";

/** Stable node identifiers so the graph can be referenced, not repeated. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/* ==========================================================================
   Share cards
   ========================================================================== */

/**
 * The dynamic Open Graph card. `/og` renders the page's own title in the site's
 * typography, so a share never lands as a blank rectangle and never carries
 * another page's headline.
 */
export function ogImageUrl(title: string, eyebrow?: string) {
  const params = new URLSearchParams({ title });
  if (eyebrow) params.set("eyebrow", eyebrow);
  return `${SITE_URL}/og?${params.toString()}`;
}

type PageMetaInput = {
  /** Feeds `<title>`; the root template appends the studio name. */
  title: string;
  /** Under 160 characters, specific to this page. */
  description: string;
  /** Canonical path, e.g. `/services/custom-software`. */
  path: string;
  /** Small mono kicker on the share card. */
  eyebrow?: string;
  /** Card headline when the browser title would read too tersely. */
  cardTitle?: string;
  /** Card description when the meta description would read too tersely. */
  cardDescription?: string;
};

export function pageMetadata({
  title,
  description,
  path,
  eyebrow,
  cardTitle,
  cardDescription,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const headline = cardTitle ?? title;
  const blurb = cardDescription ?? description;
  const image = ogImageUrl(headline, eyebrow);

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: SITE_LOCALE,
      siteName: SITE_NAME,
      url,
      title: headline,
      description: blurb,
      images: [{ url: image, width: 1200, height: 630, alt: headline }],
    },
    twitter: {
      card: "summary_large_image",
      title: headline,
      description: blurb,
      images: [image],
    },
  };
}

/* ==========================================================================
   Structured data
   ========================================================================== */

/**
 * Serialises a schema object for a `<script type="application/ld+json">`.
 * Escaping `<` closes the `</script>` injection route that raw JSON.stringify
 * leaves open when any content field ever contains markup.
 */
export function jsonLd(schema: object): { __html: string } {
  return { __html: JSON.stringify(schema).replace(/</g, "\\u003c") };
}

/**
 * Calgary first, then Canada — the two areas the studio actually claims
 * ("Calgary, Alberta. Working with organizations anywhere in Canada.").
 */
const AREA_SERVED = [
  { "@type": "City", name: "Calgary", containedInPlace: { "@type": "AdministrativeArea", name: "Alberta" } },
  { "@type": "Country", name: "Canada" },
];

/**
 * Locality only. There is no public street address or phone number, so none is
 * invented here — see docs/SEO.md for what the owner must supply before this
 * can become a full LocalBusiness listing.
 */
const ADDRESS = {
  "@type": "PostalAddress",
  addressLocality: "Calgary",
  addressRegion: "AB",
  addressCountry: "CA",
};

export function organizationSchema() {
  return {
    "@type": ["Organization", "ProfessionalService"],
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "A Calgary digital growth and technology studio connecting marketing, websites, software, automation, and reporting into one system.",
    slogan: "The systems behind growing businesses.",
    address: ADDRESS,
    areaServed: AREA_SERVED,
    knowsAbout: servicePages.map((service) => service.title),
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: "en-CA",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/**
 * Mirrors the on-screen crumb trail, which always begins at Home. Pass the
 * trail exactly as the `PageHeader` renders it.
 */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...trail].map(
      (crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: absoluteUrl(crumb.path),
      }),
    ),
  };
}

export function serviceSchema({
  name,
  description,
  path,
  areaServed = AREA_SERVED,
}: {
  name: string;
  description: string;
  path: string;
  areaServed?: unknown;
}) {
  return {
    "@type": "Service",
    name,
    description,
    serviceType: name,
    url: absoluteUrl(path),
    provider: { "@id": ORGANIZATION_ID },
    areaServed,
  };
}

/** Only ever built from FAQs that are actually rendered on the page. */
export function faqPageSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function webPageSchema({
  type = "WebPage",
  name,
  description,
  path,
}: {
  type?: string;
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@type": type,
    "@id": `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name,
    description,
    inLanguage: "en-CA",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
  };
}

/** Wraps nodes in a single `@graph` so one script tag carries the whole page. */
export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
