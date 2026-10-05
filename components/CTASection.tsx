import Link from "next/link";
import Image from "next/image";

/**
 * Closing call to action for every interior page.
 *
 * One idea: take the free reporting teardown. The title and body are
 * overridable so a page can speak in its own voice, but the action never
 * changes. The reply promise is said once, as the micro-line under the button.
 */
export function CTASection({
  title = "Send us the spreadsheet you dread.",
  body = "Free, 30 minutes, with the people who would do the work. You bring one recent export. We bring a one-screen mock of the report it should be, and the first three manual steps we would automate.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section
      className="chr-cta"
      data-material="instrument"
      data-station="Start"
    >
      {/* The roundel is cropped by the section, not placed in it: it bleeds
          off the right edge at a scale that makes it the picture, not a spot
          illustration. Its ground matches --plate-ground, so it has no seam. */}
      <Image
        className="chr-cta__art"
        src="/assets/illustrations/launch-star.webp"
        alt=""
        width={1254}
        height={1254}
        sizes="(max-width: 860px) 120vw, 62vw"
        aria-hidden="true"
      />

      <div className="shell chr-cta__inner">
        <p className="t-label chr-cta__eyebrow">Free reporting teardown</p>
        <h2 className="chr-cta__title">{title}</h2>
        <div className="chr-cta__side">
          <p className="chr-cta__body">{body}</p>
          <Link className="chr-cta__btn" href="/teardown">
            <span>Get a free reporting teardown</span>
            <span className="chr-cta__btn-arrow" aria-hidden="true">
              →
            </span>
          </Link>
          <p className="chr-cta__micro">
            30 minutes. No obligation. Reply within two business days.
          </p>
          <Link className="chr-cta__alt" href="/contact">
            or ask a question first
          </Link>
        </div>
      </div>
    </section>
  );
}
