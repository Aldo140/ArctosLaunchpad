/**
 * A static technical figure.
 *
 * Generalises the hero's plotter effect: strokes trace themselves on, in the
 * order given, then labelled nodes resolve. Every page that argues something
 * structural gets one, so the drawing is the site's way of explaining rather
 * than a decoration applied to one hero.
 *
 * Rules that keep it from becoming a gimmick:
 *   - the figure must encode real information, never fill space
 *   - labels are HTML, so they stay selectable and reflow on small screens
 *   - the whole figure is `aria-hidden`; a text equivalent sits beside it
 *   - the drawing is complete on first paint; it does not perform for attention
 */

export type PlotNode = {
  id: string;
  x: number;
  y: number;
  label?: string;
  /** Emphasised node — larger, accent-filled. */
  key?: boolean;
  /** Label offset from the node, in user units. Negative sits above. */
  dy?: number;
  /** Horizontal label offset, to clear the drawing it sits beside. */
  dx?: number;
  /** Label alignment, for labels that must sit clear of the drawing. */
  anchor?: "start" | "middle" | "end";
};

export type PlotStroke = {
  d: string;
  /** Draw order; strokes with the same order draw together. */
  order?: number;
  /** Hairline construction lines sit behind the drawn strokes. */
  guide?: boolean;
};

export function PlottedFigure({
  viewBox = "0 0 100 100",
  strokes,
  nodes = [],
  caption,
  figure = "01",
  sheet = "01 / 01",
  description,
  className,
}: {
  viewBox?: string;
  strokes: PlotStroke[];
  nodes?: PlotNode[];
  /** What the drawing is of. Goes in the title block. */
  caption?: string;
  /** Figure number for the title block. */
  figure?: string;
  /** Sheet count for the title block, e.g. "01 / 04". */
  sheet?: string;
  /** Required text equivalent — the figure itself is hidden from AT. */
  description: string;
  className?: string;
}) {
  return (
    <figure className={`plot${className ? ` ${className}` : ""}`}>
      {/* The sheet. A drawing floating in whitespace reads as clip art; a
          drawing on a bordered sheet with a title block reads as a document,
          which is what the rest of the site is. The frame is also what stops
          the figure from looking like it is hanging with nothing under it. */}
      <div className="plot__sheet">
        <span className="plot__corner plot__corner--tl" aria-hidden="true" />
        <span className="plot__corner plot__corner--tr" aria-hidden="true" />
        <span className="plot__corner plot__corner--bl" aria-hidden="true" />
        <span className="plot__corner plot__corner--br" aria-hidden="true" />

        <svg className="plot__svg" viewBox={viewBox} aria-hidden="true">
          {strokes
            .filter((s) => s.guide)
            .map((s, i) => (
              <path key={`g${i}`} className="plot__guide" d={s.d} />
            ))}
          {strokes
            .filter((s) => !s.guide)
            .map((s, i) => (
              <path key={`s${i}`} className="plot__stroke" d={s.d} />
            ))}
          {nodes.map((n) => (
            <circle
              key={n.id}
              className={`plot__node${n.key ? " is-key" : ""}`}
              cx={n.x}
              cy={n.y}
              r={n.key ? 2.6 : 1.7}
            />
          ))}
          {nodes
            .filter((n) => n.label)
            .map((n) => (
              <text
                key={`t${n.id}`}
                className="plot__label"
                x={n.x}
                y={n.y - 4.5}
                textAnchor="middle"
              >
                {n.label}
              </text>
            ))}
        </svg>
      </div>

      {/* Title block. Every real drawing sheet has one, and it is what carries
          the figure number, the subject, and the sheet count. */}
      <figcaption className="plot__block">
        <span className="plot__block-cell">
          <span className="t-folio plot__block-key">Fig.</span>
          <span className="plot__block-val">{figure}</span>
        </span>
        <span className="plot__block-cell plot__block-cell--wide">
          <span className="t-folio plot__block-key">Subject</span>
          <span className="plot__block-val">{caption}</span>
        </span>
        <span className="plot__block-cell">
          <span className="t-folio plot__block-key">Sheet</span>
          <span className="plot__block-val">{sheet}</span>
        </span>
        <span className="visually-hidden">{description}</span>
      </figcaption>
    </figure>
  );
}
