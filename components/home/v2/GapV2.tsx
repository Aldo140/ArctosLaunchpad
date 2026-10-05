import { GapCurves } from "@/components/home/v2/proof/GapCurves";

/**
 * Slot 2: the gap. One screen, paper. The statement is the composition; the
 * curves under it are the argument. The old section spent a screen and a half
 * saying this, so everything here is cut to the one idea.
 */
export function GapV2() {
  return (
    <section
      id="position"
      className="prf-gap"
      data-material="paper"
      data-station="Position"
    >
      <div className="prf-gap__top shell">
        <p className="tick-label reveal">The gap we close</p>
        <h2 className="prf-gap__title">
          <span className="prf-gap__a">More leads</span>
          <span className="prf-gap__b">
            <span className="prf-gap__ne" aria-hidden="true">
              &ne;
            </span>
            <span className="visually-hidden"> should not mean </span>
            more admin work.
          </span>
        </h2>
      </div>

      <GapCurves>
        <p className="prf-gap__copy">
          Run events, campaigns or production runs and still report on them by
          hand? Every extra one adds another stretch of copy and paste. That is
          the part we take off you.
        </p>
      </GapCurves>
    </section>
  );
}
