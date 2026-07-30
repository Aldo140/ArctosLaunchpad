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
