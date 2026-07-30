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

    const observe = () => {
      for (const el of document.querySelectorAll(".reveal:not(.is-in)")) {
        if (!staged(el)) continue;
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

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", rescueAtBottom);
      mo.disconnect();
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
