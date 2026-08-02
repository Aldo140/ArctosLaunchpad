"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Tracks the active chapter for the fixed chrome, and runs the `.reveal`
 * entrance observer.
 *
 * An earlier version also mirrored each section's *material* onto <body>, so
 * the header inverted from light to dark and back as you scrolled. With four
 * chapter stages and alternating interior sections that fired constantly, and
 * it read as flashing rather than as responsiveness. The header and survey rule
 * now hold one fixed identity and only the accent follows the page.
 *
 * The observer is keyed on `pathname`. That matters: this component mounts once
 * in the root layout and survives client-side navigation, so an effect with an
 * empty dependency array would observe the first page's elements and never look
 * again. Every subsequent route would render with its content stuck at
 * `opacity: 0` until a hard refresh — which is exactly the symptom it caused.
 */
export function ChromeSync() {
  const pathname = usePathname();

  useEffect(() => {
    const body = document.body;
    const sections = () =>
      Array.from(
        document.querySelectorAll<HTMLElement>("[data-material]"),
      ).filter((el) => el !== body && !el.closest(".menu, .intro"));

    let frame = 0;
    const sync = () => {
      frame = 0;
      // Probe just below the header bar.
      const probe = 56;
      let chapter = "";
      for (const el of sections()) {
        const r = el.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) {
          chapter = el.dataset.chapter ?? "";
        }
      }
      if ((body.dataset.chapter ?? "") !== chapter) {
        if (chapter) body.dataset.chapter = chapter;
        else delete body.dataset.chapter;
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      // A fixed inset, not a percentage. A percentage bottom margin creates a
      // dead band at the end of the document: anything inside the last 12%
      // cannot be scrolled past, so it never intersects and stays invisible.
      { rootMargin: "0px 0px -64px 0px", threshold: 0.01 },
    );

    // Document-shaped interiors (case studies, industry briefs) arrive complete
    // and are excluded. The four narrative routes opt back in with
    // `data-motion="staged"`, because on those pages the entrance carries the
    // argument rather than decorating it. `pages.css` cancels the hidden state
    // for the same set, so the two must agree on the attribute.
    const staged = (el: Element) =>
      (!el.closest(".interior-document") ||
        Boolean(el.closest('.interior-document[data-motion="staged"]'))) &&
      // The shared CTA is excluded on interiors, so it must not be observed
      // either — `pages.css` keeps it visible and the two have to agree.
      !(el.closest(".interior-document") && el.closest(".cta"));

    /**
     * Anything already above the viewport has missed its entrance for good.
     *
     * A reload restores the previous scroll position, so the document can mount
     * with half its sections already scrolled past. IntersectionObserver reports
     * those as not intersecting once and then stays silent — they can only
     * intersect again if the reader scrolls back up — so their images and copy
     * sat at `opacity: 0` until a hard refresh reset the scroll to the top.
     * That is the "some images do not appear until I hard refresh" symptom.
     * Anything already behind the reader is simply shown.
     */
    const showIfAlreadyPassed = (el: Element) => {
      const r = el.getBoundingClientRect();
      if (r.bottom > 0) return false;
      el.classList.add("is-in");
      return true;
    };

    const observe = () => {
      for (const el of document.querySelectorAll(".reveal:not(.is-in)")) {
        if (!staged(el)) continue;
        if (showIfAlreadyPassed(el)) continue;
        io.observe(el);
      }
    };
    observe();

    // Content can arrive after this effect — a Suspense boundary resolving, an
    // image settling and reflowing the page. Re-scan for anything new rather
    // than assuming the first pass caught everything.
    const mo = new MutationObserver(observe);
    mo.observe(document.body, { childList: true, subtree: true });

    // Safety net. Whatever the margins, content must never be permanently
    // invisible: once the reader is at the bottom of the document, anything
    // still waiting has run out of chances to intersect, so show it.
    const rescueAtBottom = () => {
      const doc = document.documentElement;
      const atBottom =
        window.scrollY + window.innerHeight >= doc.scrollHeight - 120;
      if (!atBottom) return;
      for (const el of document.querySelectorAll(".reveal:not(.is-in)")) {
        if (!staged(el)) continue;
        el.classList.add("is-in");
        io.unobserve(el);
      }
    };
    window.addEventListener("scroll", rescueAtBottom, { passive: true });

    /**
     * A link to the page you are already on takes you back to the top.
     *
     * Next's router treats navigating to the current route as a no-op, so
     * clicking "Work" while already on /work did nothing at all — from halfway
     * down the page it read as a broken link. Returning to the top is the
     * behaviour the click is asking for. Links carrying a hash are left alone;
     * those are deliberate in-page targets.
     *
     * Registered in the capture phase deliberately: Next's <Link> calls
     * preventDefault() on the way up, so a bubble-phase listener sees a click
     * that has already been handled and cannot tell it apart from one a
     * component meant to swallow.
     */
    const onSamePageLink = (event: MouseEvent) => {
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;

      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.hash) return;

      const same = (path: string) => path.replace(/\/+$/, "") || "/";
      if (same(url.pathname) !== same(window.location.pathname)) return;

      event.preventDefault();
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    };
    document.addEventListener("click", onSamePageLink, true);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", rescueAtBottom);
      document.removeEventListener("click", onSamePageLink, true);
      mo.disconnect();
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
