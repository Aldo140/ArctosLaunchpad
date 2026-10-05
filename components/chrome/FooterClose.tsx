"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * The footer's closing argument. It is the offer, so it only appears where the
 * page has not already made it: the homepage closes with its own final CTA,
 * `/teardown` and `/contact` are the destination, and interior pages carry
 * `CTASection` right above the footer (hidden in CSS by `:has(.chr-cta)`).
 * Everywhere else (policy pages, 404) it is the last word.
 */
const OWN_CLOSE = new Set(["/", "/teardown", "/contact"]);

export function FooterClose() {
  const pathname = usePathname();
  if (OWN_CLOSE.has(pathname)) return null;

  return (
    <div className="chr-foot__close">
      <p className="chr-foot__eyebrow t-label">Free reporting teardown</p>
      <p className="chr-foot__statement">
        Bring one spreadsheet. Leave with the report it should be.
      </p>
      <div className="chr-foot__act">
        <Link className="chr-foot__cta" href="/teardown">
          <span>Get a free reporting teardown</span>
          <span className="chr-foot__cta-arrow" aria-hidden="true">
            →
          </span>
        </Link>
        <p className="chr-foot__micro">
          30 minutes. No obligation. Reply within two business days.
        </p>
      </div>
    </div>
  );
}
