import Link from "next/link";
import { FinalArt } from "./trust/FinalArt";

/**
 * Slot 9 — the page's closing statement (the footer's own CTA is hidden on /).
 * The bear-ascent roundel at heroic scale, bleeding off the right edge: the
 * climb past the last stop.
 * ASSET SLOT: a 3:1 panorama ("the work you repeat", brief §6.6) would lift
 * this; until then bear-ascent carries it.
 */
export function FinalCtaV2() {
  return (
    <section
      className="section trs-final"
      data-material="instrument"
      data-station="Start"
      aria-labelledby="trs-final-title"
    >
      <FinalArt />
      <div className="shell trs-final__inner">
        <p className="tick-label trs-final__eyebrow">Free reporting teardown</p>
        <h2 id="trs-final-title" className="trs-final__title">
          What happens after the campaign ends?
        </h2>
        <p className="trs-final__answer t-lead">
          Someone rebuilds the report by hand. Bring us one spreadsheet and
          leave with the report it should be.
        </p>
        <div className="trs-final__act">
          <Link className="trs-final__cta" href="/teardown">
            <span>Get a free reporting teardown</span>
            <span className="trs-final__arrow" aria-hidden="true">
              →
            </span>
          </Link>
          <p className="trs-final__micro">
            30 minutes. No obligation. Reply within two business days.
          </p>
          <Link className="link trs-final__ask" href="/contact">
            or ask a question first
          </Link>
        </div>
      </div>
    </section>
  );
}
