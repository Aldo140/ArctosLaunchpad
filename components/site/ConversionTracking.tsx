"use client";

import { track } from "@vercel/analytics";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** sessionStorage keys read by the contact form to say where a lead came from. */
export const LANDING_KEY = "arctos:landing";
export const PREV_KEY = "arctos:prev";

function store(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* private mode or blocked storage: attribution is a nice-to-have */
  }
}

/**
 * Conversion plumbing, no UI:
 *  - remembers the landing page (and the referring site) and the previous
 *    page, so an enquiry can say which page sent it;
 *  - records every click into the form as a `cta_click` event, named by the
 *    link's `data-cta` or the section it sits in.
 * Events are aggregate and cookieless (Vercel Web Analytics).
 */
export function ConversionTracking() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(LANDING_KEY)) {
        let ref = "";
        try {
          const r = document.referrer ? new URL(document.referrer) : null;
          if (r && r.host !== location.host) ref = ` (from ${r.host})`;
        } catch {
          /* unparsable referrer */
        }
        store(LANDING_KEY, `${pathname}${location.search}${ref}`);
      }
    } catch {
      /* storage blocked */
    }
    if (last.current && last.current !== pathname) store(PREV_KEY, last.current);
    last.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      const toForm = href.startsWith("/contact");
      const toTeardown = href.startsWith("/teardown");
      if (!toForm && !toTeardown) return;
      const from =
        a.getAttribute("data-cta") ??
        a.closest("section")?.getAttribute("aria-label") ??
        a.closest("section, footer, header")?.className.split(" ")[0] ??
        "page";
      track("cta_click", { from, to: toForm ? "contact" : "teardown", page: location.pathname });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
