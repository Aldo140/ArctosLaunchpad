import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import contourField from "@/public/assets/illustrations/contour-field.webp";
import { HeroMotion } from "./hero-a/HeroMotion";
import { COLS, FRAGMENTS, PROOF, ROWS, TILES, type Fragment, type Pt } from "./hero-a/data";

/**
 * Hero A — "the report writes itself."
 *
 * The first screen shows the whole argument: a scatter of the loose files a
 * recurring-work week produces, and the one clean report they resolve into.
 * The artifact is built in markup (no raster), carries no numbers (every value
 * is a redaction), and reads correctly with motion off: the final state is the
 * default state, HeroMotion only plays it in.
 *
 * Desktop and mobile are two compositions. Fragment positions, routes and the
 * plate rectangle are separate sets, all in percent of the stage so the drawn
 * routes always meet the cards and the plate.
 */

function segments(route: Pt[]) {
  const out: { x: number; y: number; w: number; h: number; axis: "h" | "v" }[] = [];
  for (let i = 1; i < route.length; i += 1) {
    const [x0, y0] = route[i - 1];
    const [x1, y1] = route[i];
    const horizontal = y0 === y1;
    out.push({
      x: Math.min(x0, x1),
      y: Math.min(y0, y1),
      w: horizontal ? Math.abs(x1 - x0) : 0,
      h: horizontal ? 0 : Math.abs(y1 - y0),
      axis: horizontal ? "h" : "v",
    });
  }
  return out;
}

function Routes({ layout }: { layout: "d" | "m" }) {
  return (
    <div className={`hva-routes hva-routes--${layout}`} aria-hidden="true">
      {FRAGMENTS.flatMap((f) =>
        segments(f[layout].route).map((s, i) => (
          <span
            key={`${f.id}-${i}`}
            className={`hva-seg hva-seg--${layout}`}
            data-route={`${f.id}-${layout}`}
            data-axis={s.axis}
            style={
              {
                left: `${s.x}%`,
                top: `${s.y}%`,
                ...(s.axis === "h" ? { width: `${s.w}%` } : { height: `${s.h}%` }),
              } as CSSProperties
            }
          />
        )),
      )}
    </div>
  );
}

function Frag({ f }: { f: Fragment }) {
  const style = {
    "--dx": `${f.d.x}%`,
    "--dy": `${f.d.y}%`,
    "--dr": `${f.d.r}deg`,
    "--dw": `${f.d.w}%`,
    "--mx": `${f.m.x}%`,
    "--my": `${f.m.y}%`,
    "--mr": `${f.m.r}deg`,
    "--mw": `${f.m.w}%`,
  } as CSSProperties;
  return (
    <div className="hva-frag" data-id={f.id} data-material="paper" style={style}>
      <div className="hva-frag__bar">
        <span className="hva-frag__ext">{f.kind}</span>
        <span className="hva-frag__name">{f.name}</span>
      </div>
      <div className="hva-frag__grid">
        {f.cells.map((n, row) => (
          <div key={row} className="hva-frag__row">
            {[0, 1, 2].map((c) => (
              <i key={c} className={c < n ? "is-on" : undefined} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Plate() {
  return (
    <div className="hva-plate" data-material="paper">
      <header className="hva-plate__head hva-set">
        <span className="hva-plate__title">Executive summary</span>
        <span className="hva-plate__sub">Event code performance</span>
      </header>

      <div className="hva-plate__tiles">
        {TILES.map((t) => (
          <div key={t.label} className="hva-plate__tile hva-set">
            <span className="hva-plate__label">{t.label}</span>
            <span
              className="hva-redact hva-redact--lg"
              style={{ "--w": `${t.w}%` } as CSSProperties}
            />
          </div>
        ))}
      </div>

      <div className="hva-plate__chart hva-set">
        <span className="hva-plate__label">Conversion by code</span>
        <svg viewBox="-4 -4 408 88" preserveAspectRatio="none" role="presentation">
          <path className="hva-chart-grid" d="M0 20H400M0 40H400M0 60H400" />
          <path
            className="hva-chart-ghost"
            d="M0 66 C 80 64, 160 62, 240 58 S 340 54, 400 52"
          />
          <path
            className="hva-chart-line"
            pathLength={1}
            d="M0 62 C 50 58, 90 50, 140 43 S 230 33, 280 21 S 360 10, 400 6"
          />
        </svg>
      </div>

      <table className="hva-plate__table hva-set">
        <thead>
          <tr>
            {COLS.map((c, i) => (
              <th key={c} className={i > 3 ? "hva-col-x" : undefined}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, i) => (
            <tr key={i} className={i === 0 ? "is-lead" : undefined}>
              {row.map((w, j) => (
                <td key={j} className={j > 3 ? "hva-col-x" : undefined}>
                  <span
                    className="hva-redact"
                    style={{ "--w": `${w}%` } as CSSProperties}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <p className="hva-plate__caption hva-set">
        Structure of a live client report. Figures withheld.
      </p>
    </div>
  );
}

export function HeroV2() {
  return (
    <section
      className="hva section"
      data-material="instrument"
      data-station="Cover"
      data-run="pending"
    >
      <Image
        className="hva-terrain"
        src={contourField}
        alt=""
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        aria-hidden="true"
      />
      <div className="hva-grid" aria-hidden="true" />

      <div className="shell hva__inner">
        <p className="tick-label hva-eyebrow hva-fade hva-fade--eyebrow is-in">
          <span className="hva-tick" aria-hidden="true" />
          Calgary · Reporting &amp; automation for recurring work
        </p>

        <h1 className="hva__title">
          <span className="hva-ln">Run the work.</span>
          <span className="hva-ln hva-ln--turn">
            <em>The report writes itself.</em>
          </span>
        </h1>

        <div className="hva__copy">
          <p className="hva__lead hva-fade hva-fade--lead">
            Arctos builds the reporting and automation behind events, campaigns and
            production runs — so the tenth one costs less than the first.
          </p>
          <div className="hva__cta hva-fade hva-fade--cta">
            <Link className="btn hva__btn" href="/teardown">
              Get a free reporting teardown
              <span className="btn__arrow" aria-hidden="true">
                →
              </span>
            </Link>
            <Link className="hva__quiet" href="/work">
              See the work
            </Link>
          </div>
          <p className="hva__note hva-fade hva-fade--cta">
            30 minutes. No obligation. Reply within two business days.
          </p>
        </div>

        <div
          className="hva__stage"
          role="img"
          aria-label="Loose spreadsheet and CSV files resolving into one clean report"
        >
          <Routes layout="d" />
          <Routes layout="m" />
          <div className="hva-frag-layer" aria-hidden="true">
            {FRAGMENTS.map((f) => (
              <Frag key={f.id} f={f} />
            ))}
          </div>
          <div className="hva-plate-wrap" aria-hidden="true">
            <Plate />
          </div>
        </div>
      </div>

      <nav className="shell hva__proof" aria-label="Live work">
        <span className="hva__proof-label hva-fade hva-fade--proof">Live work</span>
        <ul>
          {PROOF.map((p) => (
            <li key={p.href} className="hva-fade hva-fade--proof">
              <Link href={p.href}>
                {p.label}
                <span aria-hidden="true"> ↗</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <HeroMotion />
    </section>
  );
}
