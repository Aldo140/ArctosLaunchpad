import Link from "next/link";
import { OfferMotion } from "@/components/home/v2/offer/OfferMotion";

const COLS = ["A", "B", "C", "D", "E", "F", "G", "H"];

const STEPS = [
  {
    n: "01",
    title: "You send it",
    body: "One recent export, or a few lines on how you reported your last campaign, event or production run.",
  },
  {
    n: "02",
    title: "We map where the hours go",
    body: "Who re-keys what, which sheet feeds which, and where the report gets stuck waiting on a person.",
  },
  {
    n: "03",
    title: "We show you the screen",
    body: "A one-screen mock of the report it should be, and the first three manual steps we would automate.",
  },
];

/**
 * Slot 4. The mid-page conversion moment, staged as an event: the headline is
 * set inside a drafted spreadsheet with one cell selected, a drawn track walks
 * through the three steps, and the action is a ticket. No form: the form lives
 * at /teardown.
 */
export function TeardownBand() {
  return (
    <section
      className="section ofr-td"
      data-material="paper"
      data-chapter="operate"
      data-station="Offer"
      data-ofr="teardown"
      aria-labelledby="ofr-td-title"
    >
      <OfferMotion scope="teardown" />
      <div className="shell">
        <div className="ofr-td__sheet reveal">
          <div className="ofr-td__colhead" aria-hidden="true">
            <span />
            {COLS.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
          <div className="ofr-td__rows" aria-hidden="true">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
          <div className="ofr-td__cells" aria-hidden="true">
            <i style={{ gridArea: "1 / 2 / 2 / 3" }}>Signups</i>
            <i style={{ gridArea: "1 / 5 / 2 / 6" }}>Channel</i>
            <i style={{ gridArea: "2 / 7 / 3 / 8" }}>#REF!</i>
            <i style={{ gridArea: "5 / 8 / 6 / 9" }}>FINAL (3)</i>
          </div>
          <p className="tick-label ofr-td__eyebrow">
            Free reporting teardown · 30 minutes
          </p>
          <h2 id="ofr-td-title" className="ofr-td__title">
            Send us the spreadsheet you{" "}
            <span className="ofr-td__cursor">dread.</span>
          </h2>
        </div>

        <div className="ofr-td__body">
          <p className="ofr-td__sub reveal">
            Bring one recent export, or just describe how you reported on your
            last campaign, event or production run. In 30 minutes we show you
            the one-screen version it should be, and the first three manual
            steps we would automate.
          </p>

          <div className="ofr-td__steps reveal">
            <span className="ofr-td__line" aria-hidden="true" />
            <ol className="ofr-td__list">
              {STEPS.map((s) => (
                <li key={s.n} className="ofr-td__step">
                  <span className="ofr-td__node" aria-hidden="true" />
                  <span className="ofr-td__n">{s.n}</span>
                  <h3 className="ofr-td__step-title">{s.title}</h3>
                  <p>{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="ofr-td__ticket reveal">
          <div className="ofr-td__stub" aria-hidden="true">
            <span className="t-label">Admit one</span>
            <strong>Free</strong>
            <span className="t-label">30 min</span>
          </div>
          <div className="ofr-td__ticket-main">
            <p className="ofr-td__ticket-line">
              With the people who would do the work.
            </p>
            <Link href="/teardown" className="btn ofr-td__cta">
              Get a free reporting teardown
              <span className="btn__arrow" aria-hidden="true">
                →
              </span>
            </Link>
            <p className="ofr-td__micro">
              30 minutes. No obligation. Reply within two business days.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
