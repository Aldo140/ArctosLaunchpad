"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { GOOGLE_ADS_ID, GOOGLE_ADS_LEAD_LABEL } from "@/lib/googleAds";

type Gtag = (...args: unknown[]) => void;

/** Reports a sent enquiry or teardown request to Google Ads. No-op when off. */
export function googleAdsLead() {
  try {
    const gtag = (window as unknown as { gtag?: Gtag }).gtag;
    if (GOOGLE_ADS_ID && GOOGLE_ADS_LEAD_LABEL && typeof gtag === "function") {
      gtag("event", "conversion", { send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_LEAD_LABEL}` });
    }
  } catch {
    /* blocked by the browser; never worth an error */
  }
}

/** Loads the Google Ads tag on marketing pages only (never /hq). */
export function GoogleAdsTag() {
  const pathname = usePathname();
  if (!GOOGLE_ADS_ID || pathname?.startsWith("/hq")) return null;
  return (
    <>
      <Script
        id="google-ads-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GOOGLE_ADS_ID)}`}
      />
      <Script id="google-ads" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config',${JSON.stringify(GOOGLE_ADS_ID)});`}
      </Script>
    </>
  );
}
