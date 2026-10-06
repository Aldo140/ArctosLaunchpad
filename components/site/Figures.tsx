import type { CSSProperties } from "react";

/**
 * Fresh Prep's deliverable is an internal report with no publishable
 * screenshot. This is its real structure — tiles, chart, ranked table — with
 * every value withheld. Redactions are widths only; never put a number in one.
 *
 * Motion (CSS only, keyed off the global `[data-reveal]` observer): the sheet
 * lands, each value is struck through by a redaction bar, the trend line is
 * drawn without an axis, and a "figures withheld" stamp lands on the near
 * plane. Under reduced motion, or without JS, it is simply the finished sheet.
 */
const TILES = [
  ["Signups", 46],
  ["Paying customers", 38],
  ["Blended conversion", 54],
  ["12-month value", 62],
] as const;

const ROWS = [
  [88, 52, 40, 58, 64],
  [76, 40, 34, 50, 56],
  [92, 46, 30, 44, 60],
  [70, 34, 28, 54, 48],
] as const;

const COLS = ["Event code", "Signups", "Paid", "Conv.", "Value"] as const;

const w = (n: number, i = 0) => ({ "--w": `${n}%`, "--i": i }) as CSSProperties;

export function ReportFigure() {
  return (
    <figure
      className="fig-report"
      data-reveal="fade"
      aria-label="Structure of a live internal reporting dashboard, with all figures withheld"
    >
      <div className="fig-report__deck" aria-hidden="true">
        <div className="fig-report__sheet">
          <div className="fig-report__head">
            <span>Executive summary</span>
            <span className="mono">Event code performance</span>
          </div>
          <div className="fig-report__tiles">
            {TILES.map(([label, width], i) => (
              <div key={label}>
                <span className="mono">{label}</span>
                <i style={w(width, i)} />
              </div>
            ))}
          </div>
          <svg className="fig-report__chart" viewBox="0 0 400 80" preserveAspectRatio="none">
            <path className="grid" d="M0 20H400M0 40H400M0 60H400" />
            <path className="ghost" d="M0 70 C 80 68, 160 66, 240 62 S 340 58, 400 56" />
            <path
              className="line"
              pathLength={1}
              d="M0 66 C 50 62, 90 54, 140 46 S 230 36, 280 24 S 360 12, 400 8"
            />
          </svg>
          <div className="fig-report__rows">
            <div className="fig-report__cols">
              {COLS.map((c) => (
                <span key={c} className="mono">
                  {c}
                </span>
              ))}
            </div>
            {ROWS.map((row, r) => (
              <div key={r}>
                {row.map((width, c) => (
                  <i key={c} style={w(width, 4 + r * 2 + c)} />
                ))}
              </div>
            ))}
          </div>
          <span className="fig-report__scan" />
        </div>
        <span className="fig-report__stamp mono">Figures withheld</span>
      </div>
      <figcaption className="mono">Structure of the internal report · figures withheld</figcaption>
    </figure>
  );
}

/**
 * LeaseFlow has no public recording, so it is shown as the flow the demo
 * connects: a rust signal (the brand's "path a customer takes") is drawn
 * through the three stops and travels them in a loop, lighting each in turn.
 */
const STOPS = [
  ["Listing traffic", "Listing management"],
  ["Lead conversion", "Rental lead conversion"],
  ["Lease-package request", "Workflow organisation"],
] as const;

export function FlowFigure() {
  return (
    <figure
      className="fig-flow"
      data-reveal="fade"
      aria-label="LeaseFlow: listing traffic becomes lead conversion, then an organized lease-package request"
    >
      <ol>
        {STOPS.map(([name, note], i) => (
          <li key={name} style={{ "--i": i } as CSSProperties}>
            <span className="index">{String(i + 1).padStart(2, "0")}</span>
            <span className="fig-flow__name">{name}</span>
            <span className="fig-flow__note">{note}</span>
          </li>
        ))}
      </ol>
      <figcaption className="mono">Working demo · the flow, not a screenshot</figcaption>
    </figure>
  );
}
