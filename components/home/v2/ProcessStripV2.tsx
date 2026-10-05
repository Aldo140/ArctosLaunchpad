import Link from "next/link";
import { ProcessTrack } from "./trust/ProcessTrack";

/**
 * Slot 7 — how the first weeks go. One line, seven stops: the free teardown
 * first, then the six real steps with what each one leaves you holding.
 * No timelines, no prices: the content has neither.
 */
export function ProcessStripV2() {
  return (
    <section
      className="section trs-process"
      data-material="instrument"
      data-station="Process"
      aria-labelledby="trs-process-title"
    >
      <div className="shell">
        <header className="trs-process__head">
          <p className="tick-label">How it starts</p>
          <h2 id="trs-process-title" className="trs-process__title t-display">
            You start with a look.
            <span className="trs-process__title-2"> Six steps follow.</span>
          </h2>
        </header>
        <ProcessTrack />
        <p className="trs-process__more">
          <Link className="link" href="/process">
            How each step works
          </Link>
        </p>
      </div>
    </section>
  );
}
