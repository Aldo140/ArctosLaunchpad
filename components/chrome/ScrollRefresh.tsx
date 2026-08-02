"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Keeps ScrollTrigger's measurements honest.
 *
 * Triggers cache their start/end positions the moment they are created. On this
 * site several things move the page after that point:
 *
 *   - webfonts swap in and reflow every headline
 *   - collage canvases and project posters decode and settle
 *   - a client-side navigation replaces the whole document body
 *
 * Without a refresh the triggers keep firing against the old geometry, so a
 * section can scroll past its trigger point and never animate. Refreshing on
 * font load, on image load, and on route change fixes it at the source rather
 * than by loosening every start value.
 */
export function ScrollRefresh() {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      if (!cancelled) ScrollTrigger.refresh();
    };

    // A new route starts at its top. ScrollTrigger remembers the scroll
    // position of the page it measured, and `refresh()` restores it — so
    // following a nav link from halfway down a long route landed you halfway
    // down the next one. Clearing that memory and jumping to the top *before*
    // the refresh fixes it at the cause; without the clear, the refresh below
    // simply puts the old offset back.
    //
    // An in-page anchor is the one case where the position is deliberate, so
    // a hash is left alone.
    if (!window.location.hash) {
      ScrollTrigger.clearScrollMemory();

      // `scroll-behavior: smooth` on <html> applies to programmatic scrolls
      // too, including the router's own scroll-to-top. An animated jump can
      // still be in flight when the new route's images settle and reflow the
      // page, and the interrupted animation leaves the reader partway down the
      // new page at roughly the offset they left the old one — the "I click a
      // footer link and land halfway down" symptom. Suppressing the behaviour
      // for the duration of the jump makes the landing deterministic.
      const root = document.documentElement;
      const previous = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      window.scrollTo(0, 0);
      // Belt and braces: whichever element is actually scrolling, reset it.
      root.scrollTop = 0;
      document.body.scrollTop = 0;
      requestAnimationFrame(() => {
        root.style.scrollBehavior = previous;
      });
    }

    // After the new route has painted.
    const raf = requestAnimationFrame(() => requestAnimationFrame(refresh));

    // Webfonts reflow every heading on the page.
    void document.fonts?.ready.then(refresh);

    // Images that finish decoding after mount change section heights.
    const images = Array.from(document.images).filter((img) => !img.complete);
    for (const img of images) {
      img.addEventListener("load", refresh, { once: true });
      img.addEventListener("error", refresh, { once: true });
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      for (const img of images) {
        img.removeEventListener("load", refresh);
        img.removeEventListener("error", refresh);
      }
    };
  }, [pathname]);

  return null;
}
