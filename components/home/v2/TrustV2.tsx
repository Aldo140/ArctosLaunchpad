import Link from "next/link";

/**
 * Slot 8 — terms of engagement. Every line here already exists elsewhere on
 * the site (ContactForm assurance, whyArctos in lib/content/site.ts, the
 * privacy note, the services reassurance). Nothing is new; it is gathered.
 */
const LEDGER = [
  {
    group: "When you write to us",
    clauses: [
      { term: "A reply within two business days.", gloss: "Either way." },
      {
        term: "Read by the people who would do the work.",
        gloss: "Not passed down a queue.",
      },
      {
        term: "No obligation. No sales sequence.",
        gloss:
          "A short engagement can stand alone. Arctos is under no obligation to build what it recommends.",
      },
      {
        term: "Your information is only used to respond.",
        gloss: "It is not added to a mailing list or shared with anyone.",
      },
    ],
  },
  {
    group: "How we work",
    clauses: [
      {
        term: "We start from the stack you already have.",
        gloss:
          "We improve the current technology where practical rather than forcing unnecessary replacement.",
      },
      {
        term: "You understand what is built, and why.",
        gloss: "Including what happens after launch.",
      },
      {
        term: "Calgary-based.",
        gloss:
          "Local context, with the ability to support organizations anywhere.",
      },
    ],
  },
  {
    group: "After launch",
    clauses: [
      {
        term: "Support can continue.",
        gloss: "Beyond the initial deployment, if you want it to.",
      },
    ],
  },
] as const;

// Clause numbers run across groups, so compute the offset per group once.
const OFFSETS = LEDGER.map((_, gi) =>
  LEDGER.slice(0, gi).reduce((n, g) => n + g.clauses.length, 0),
);

export function TrustV2() {
  return (
    <section
      className="section trs-trust"
      data-material="paper"
      data-station="Terms"
      aria-labelledby="trs-trust-title"
    >
      <div className="shell trs-trust__grid">
        <header className="trs-trust__head">
          <p className="tick-label">Terms of engagement</p>
          <h2 id="trs-trust-title" className="trs-trust__title t-display">
            What you can hold us to.
          </h2>
          <p className="trs-trust__frame t-lead">
            We would rather show you terms than quote you praise. These are the
            commitments already stated across this site, set down in one place.
          </p>
          <p className="trs-trust__social">
            <a
              className="link"
              href="https://www.instagram.com/arctoslaunchpad/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Follow the studio on Instagram
            </a>
            <span aria-hidden="true"> · </span>
            <Link className="link" href="/studio">
              About the studio
            </Link>
          </p>
        </header>

        <div className="trs-ledger">
          {LEDGER.map((g, gi) => (
            <section className="trs-ledger__group" key={g.group}>
              <h3 className="trs-ledger__label t-label">{g.group}</h3>
              <ol className="trs-ledger__rows">
                {g.clauses.map((c, ci) => (
                  <li className="trs-clause" key={c.term}>
                    <span className="trs-clause__n t-folio" aria-hidden="true">
                      {String(OFFSETS[gi] + ci + 1).padStart(2, "0")}
                    </span>
                    <p className="trs-clause__term">{c.term}</p>
                    <p className="trs-clause__gloss">{c.gloss}</p>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
