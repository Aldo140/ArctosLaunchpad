import Image from "next/image";
import Link from "next/link";
import connectedAutomation from "@/public/assets/illustrations/connected-automation.webp";
import { OfferMotion } from "@/components/home/v2/offer/OfferMotion";

/* The client's real pain, then the honest outcome. No numbers. */
const ROWS = [
  {
    pain: "Re-keying signup codes",
    outcome: "Signup codes recorded once, at the source.",
  },
  {
    pain: "The Monday report",
    outcome: "The report assembles itself from the platforms you already use.",
  },
  {
    pain: "Exports emailed around",
    outcome: "One live view, opened by everyone who needs it.",
  },
  {
    pain: "“Which campaign actually worked?”",
    outcome: "Every signup traced back to the campaign that brought it.",
  },
  {
    pain: "Report (1) (2) (3) FINAL",
    outcome: "One version, and it is the current one.",
  },
];

/**
 * Slot 6. The old idea at full size: manual steps struck out in a drawn line,
 * each resolving into its outcome, beside the connected-automation bear at
 * heroic scale, cropped by the section edge.
 */
export function AutomationV2() {
  return (
    <section
      className="section ofr-au"
      data-material="paper"
      data-chapter="operate"
      data-station="Automation"
      data-ofr="automation"
      aria-labelledby="ofr-au-title"
    >
      <OfferMotion scope="automation" />

      {/* ASSET SLOT: "The system" — bear feeding papers into one slot / conveyor.
          Until it exists, the connected-automation bear carries this section. */}
      <figure className="ofr-au__bear" aria-hidden="true">
        <Image
          className="ofr-au__bear-img"
          src={connectedAutomation}
          alt=""
          sizes="(max-width: 900px) 100vw, 62vw"
          placeholder="blur"
        />
      </figure>

      <div className="shell ofr-au__shell">
        <header className="ofr-au__head reveal">
          <p className="tick-label">Business automation</p>
          <h2 id="ofr-au-title" className="ofr-au__title">
            Strike the manual work off the list.
          </h2>
          <p className="ofr-au__sub">
            We review how work moves through your organisation, remove the
            unnecessary manual steps and connect the platforms you already use.
            Nothing is replaced for its own sake.
          </p>
        </header>

        <ul className="ofr-au__list">
          {ROWS.map((r, i) => (
            <li key={r.pain} className="ofr-au__row">
              <span className="ofr-au__i" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <del className="ofr-au__pain">
                <span className="ofr-au__pain-text">{r.pain}</span>
              </del>
              <span className="ofr-au__arrow" aria-hidden="true" />
              <ins className="ofr-au__outcome">{r.outcome}</ins>
            </li>
          ))}
        </ul>

        <Link href="/services/business-automation" className="link ofr-au__more">
          How business automation works
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
