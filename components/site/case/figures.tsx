import type { CSSProperties } from "react";

/**
 * Honest figures for the two projects with no publishable screens.
 * Each takes a `step` (0–3) that follows the story chapters:
 *   0 the challenge · 1 the constraint · 2 the approach · 3 what we built
 * CSS moves between the states. No numbers appear anywhere: every value is
 * a width-only redaction, and every caption says the figure is a diagram.
 */

const w = (n: number) => ({ "--w": `${n}%` }) as CSSProperties;
const v = (n: number) => ({ "--i": n }) as CSSProperties;

/* ---- Fresh Prep: raw signup-code exports resolve into four views ------- */

const RAW = [
  [62, 30, 44, 18],
  [48, 36, 28, 22],
  [70, 24, 40, 16],
  [54, 32, 36, 20],
  [66, 28, 46, 14],
  [44, 38, 30, 24],
  [58, 26, 42, 18],
] as const;

const VIEWS = [
  ["Conversion", "Did the event turn signups into customers?"],
  ["Customer value", "What is a customer from it worth?"],
  ["Events", "Which events are worth repeating?"],
  ["Team", "Which team approaches are working?"],
] as const;

export function ReportFlowFigure({ step = 3, caption = true }: { step?: number; caption?: boolean }) {
  return (
    <figure className="cxf cxf--report" data-step={step}>
      <div className="cxf__sheet" aria-hidden="true">
        <div className="cxf-r__raw">
          <span className="cxf__label mono">Signup-code export</span>
          <ol>
            {RAW.map((row, r) => (
              <li key={r} style={v(r)}>
                {row.map((n, c) => (
                  <i key={c} style={w(n)} />
                ))}
              </li>
            ))}
          </ol>
        </div>
        <svg className="cxf-r__pipe" viewBox="0 0 100 200" preserveAspectRatio="none">
          {[30, 75, 125, 170].map((y, i) => (
            <path key={y} d={`M0 100 C 50 100, 50 ${y}, 100 ${y}`} style={v(i)} pathLength={1} />
          ))}
        </svg>
        <div className="cxf-r__views">
          {VIEWS.map(([name, q], i) => (
            <div key={name} className="cxf-r__view" style={v(i)}>
              <span className="cxf-r__name">{name}</span>
              <span className="cxf-r__q">{q}</span>
              <span className="cxf-r__bars">
                <i style={w(72 - i * 9)} />
                <i style={w(48 + i * 7)} />
                <i style={w(60 - i * 4)} />
              </span>
              {i === 0 ? (
                <svg className="cxf-r__spark" viewBox="0 0 120 30" preserveAspectRatio="none">
                  <path d="M0 26 C 20 24, 34 18, 50 17 S 82 9, 120 4" pathLength={1} />
                </svg>
              ) : null}
            </div>
          ))}
        </div>
      </div>
      {caption ? (
        <figcaption className="mono cxf__cap">
          Diagram of the internal report’s structure · every figure withheld
        </figcaption>
      ) : null}
      <span className="visually-hidden">
        Diagram: raw signup-code export rows resolve into four reporting views — conversion, customer value,
        events and team performance. All values are withheld.
      </span>
    </figure>
  );
}

/* ---- LeaseFlow: scattered enquiries become one lease-package request ---- */

const ENQUIRIES = [
  [8, 14, -6],
  [22, 64, 5],
  [4, 46, -3],
  [30, 30, 8],
  [14, 80, -9],
] as const;

const PACKAGE = ["Applicant details", "Documents", "Listing reference", "Ready for review"] as const;

export function LeaseFlowFigure({ step = 3, caption = true }: { step?: number; caption?: boolean }) {
  return (
    <figure className="cxf cxf--lease" data-step={step}>
      <div className="cxf__sheet" aria-hidden="true">
        <div className="cxf-l__node cxf-l__listing">
          <span className="cxf__label mono">01 · Listing</span>
          <span className="cxf-l__photo" />
          <i style={w(70)} />
          <i style={w(46)} />
        </div>
        <div className="cxf-l__field">
          <span className="cxf__label mono">02 · Enquiries</span>
          {ENQUIRIES.map(([x, y, r], i) => (
            <span
              key={i}
              className="cxf-l__chip"
              style={{ "--x": `${x}%`, "--y": `${y}%`, "--r": `${r}deg`, "--i": i } as CSSProperties}
            >
              <i style={w(64 - i * 6)} />
            </span>
          ))}
        </div>
        <div className="cxf-l__node cxf-l__package">
          <span className="cxf__label mono">03 · Lease package</span>
          <ul>
            {PACKAGE.map((p, i) => (
              <li key={p} style={v(i)}>
                <b />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <svg className="cxf-l__path" viewBox="0 0 300 100" preserveAspectRatio="none">
          <path className="cxf-l__track" d="M40 50 C 90 50, 100 50, 150 50 S 210 50, 260 50" />
          <path className="cxf-l__signal" d="M40 50 C 90 50, 100 50, 150 50 S 210 50, 260 50" pathLength={1} />
        </svg>
      </div>
      {caption ? (
        <figcaption className="mono cxf__cap">Diagram of the working demo’s flow · not a screenshot</figcaption>
      ) : null}
      <span className="visually-hidden">
        Diagram: a listing collects scattered enquiries, which the demo converts into one organized
        lease-package request ready for review.
      </span>
    </figure>
  );
}
