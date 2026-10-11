"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { META_PIXEL_ID } from "@/lib/metaPixel";

type Fbq = (...args: unknown[]) => void;

/**
 * Reports a standard Meta event (e.g. "Lead") when the pixel is on.
 * A no-op when the pixel is off or blocked by the browser.
 */
export function metaTrack(event: string, params?: Record<string, string | number>) {
  try {
    const fbq = (window as unknown as { fbq?: Fbq }).fbq;
    if (META_PIXEL_ID && typeof fbq === "function") fbq("track", event, params ?? {});
  } catch {
    /* ad blockers can leave a broken stub; tracking is never worth an error */
  }
}

/**
 * Loads the pixel on marketing pages (never on /hq) and counts one PageView
 * per client-side navigation. The first PageView is sent by the loader itself.
 */
export function MetaPixel() {
  const pathname = usePathname();
  const first = useRef(true);
  const off = !META_PIXEL_ID || pathname?.startsWith("/hq");

  useEffect(() => {
    if (off) return;
    if (first.current) {
      first.current = false;
      return;
    }
    metaTrack("PageView");
  }, [pathname, off]);

  if (off) return null;

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(META_PIXEL_ID)});fbq('track','PageView');`}
    </Script>
  );
}
