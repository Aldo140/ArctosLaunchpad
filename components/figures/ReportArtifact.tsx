/**
 * ReportArtifact — the structure of a real client reporting dashboard, with
 * every figure withheld.
 *
 * Why it exists: the best proof Arctos has is a repeat client (Fresh Prep) whose
 * deliverable is a report, and a report has no screenshot you are allowed to
 * publish. Showing the real *structure* — the same tiles, columns and ranking a
 * live report carries — with the values redacted is honest on both counts: it
 * invents no metric, and it discloses nothing the client has not agreed to.
 *
 * Rules for anyone touching this:
 *  - Never put a number in a redaction. Redactions are width only.
 *  - The caption must keep saying the figures are withheld.
 *  - It is a printed sheet, so it declares its own material (paper) and sits on
 *    an instrument (dark) section like the contact form does.
 */

type Redaction = { w: number };

const TILES: { label: string; note: string; w: number }[] = [
  { label: "Signups", note: "Top-of-funnel registrations", w: 46 },
  { label: "Paying customers", note: "Acquired, active buyers", w: 38 },
  { label: "Blended conversion", note: "Customers / signups", w: 54 },
  { label: "12-month value", note: "Customer lifetime value", w: 62 },
];

const COLUMNS = [
  "Code",
  "Channel",
  "Signups",
  "Paying",
  "Conv. %",
  "Avg value",
  "Grade",
];

/* Row shapes only — widths vary so the table reads as data, not a template. */
const ROWS: Redaction[][] = [
  [{ w: 88 }, { w: 44 }, { w: 52 }, { w: 40 }, { w: 58 }, { w: 64 }, { w: 30 }],
  [{ w: 76 }, { w: 44 }, { w: 40 }, { w: 34 }, { w: 50 }, { w: 56 }, { w: 30 }],
  [{ w: 92 }, { w: 44 }, { w: 46 }, { w: 30 }, { w: 44 }, { w: 60 }, { w: 30 }],
  [{ w: 70 }, { w: 44 }, { w: 34 }, { w: 28 }, { w: 54 }, { w: 48 }, { w: 30 }],
  [{ w: 82 }, { w: 44 }, { w: 30 }, { w: 22 }, { w: 40 }, { w: 52 }, { w: 30 }],
];

export function ReportArtifact({
  className = "",
  caption = "Structure of a live client report. Figures withheld.",
}: {
  className?: string;
  caption?: string;
}) {
  return (
    <figure
      className={`rpt ${className}`.trim()}
      data-material="paper"
      aria-label="Structure of a live client reporting dashboard, with all figures withheld"
    >
      <div className="rpt__sheet" aria-hidden="true">
        <header className="rpt__head">
          <span className="rpt__title">Executive summary</span>
          <span className="rpt__sub">Event code performance</span>
        </header>

        <div className="rpt__tiles">
          {TILES.map((tile) => (
            <div key={tile.label} className="rpt__tile">
              <span className="rpt__label">{tile.label}</span>
              <span
                className="rpt__redact rpt__redact--lg"
                style={{ "--w": `${tile.w}%` } as React.CSSProperties}
              />
              <span className="rpt__note">{tile.note}</span>
            </div>
          ))}
        </div>

        <div className="rpt__chart">
          <span className="rpt__label">Conversion by code</span>
          <svg viewBox="0 0 400 90" preserveAspectRatio="none" role="presentation">
            <path className="rpt__grid" d="M0 22H400M0 45H400M0 68H400" />
            <path
              className="rpt__line"
              d="M0 70 C 50 66, 90 58, 140 50 S 230 40, 280 26 S 360 14, 400 10"
            />
            <path
              className="rpt__line rpt__line--ghost"
              d="M0 74 C 80 72, 160 70, 240 66 S 340 62, 400 60"
            />
          </svg>
        </div>

        <table className="rpt__table">
          <thead>
            <tr>
              {COLUMNS.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={i} className={i === 0 ? "rpt__row--lead" : undefined}>
                {row.map((cell, j) => (
                  <td key={j}>
                    <span
                      className="rpt__redact"
                      style={{ "--w": `${cell.w}%` } as React.CSSProperties}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="rpt__caption t-folio">{caption}</figcaption>
    </figure>
  );
}
