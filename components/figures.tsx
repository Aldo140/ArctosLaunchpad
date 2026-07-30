import { PlottedFigure } from "./PlottedFigure";

/**
 * One drawn figure per page.
 *
 * Each encodes the argument that page is actually making, so the drawing does
 * work the prose would otherwise have to do twice. They share the hero's
 * plotter language, which is what ties the pages together as one document.
 */

/**
 * Services — the four stages as a closed circuit.
 *
 * The point the page has to make is that these are not four separate offers:
 * Scale feeds back into Attract, and the diagonals are the cross-talk between
 * the front of the business and the back. Bare numbers would say none of that,
 * so the stations are named.
 */
export function ServicesFigure() {
  const r = 26;
  const cx = 70;
  const cy = 46;
  return (
    <PlottedFigure
      className="plot--circuit"
      viewBox="0 0 140 94"
      caption="One system, four stages"
      figure="01"
      sheet="01 / 01"
      description="A closed circuit connecting Attract, Convert, Operate, and Scale. Each stage feeds the next, and Scale returns to Attract. The diagonals mark the cross-talk between customer acquisition and operations."
      strokes={[
        { d: `M${cx} ${cy - r} A${r} ${r} 0 0 1 ${cx + r} ${cy}` },
        { d: `M${cx + r} ${cy} A${r} ${r} 0 0 1 ${cx} ${cy + r}` },
        { d: `M${cx} ${cy + r} A${r} ${r} 0 0 1 ${cx - r} ${cy}` },
        { d: `M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx} ${cy - r}` },
        // Cross-talk: the front of the business informs the back, and back.
        { d: `M${cx} ${cy - r} L${cx} ${cy + r}`, guide: true },
        { d: `M${cx - r} ${cy} L${cx + r} ${cy}`, guide: true },
      ]}
      nodes={[
        { id: "a", x: cx, y: cy - r, label: "01 Attract", dy: -6, key: true },
        {
          id: "c",
          x: cx + r,
          y: cy,
          label: "02 Convert",
          dy: 1.4,
          anchor: "start",
        },
        { id: "o", x: cx, y: cy + r, label: "03 Operate", dy: 8 },
        {
          id: "s",
          x: cx - r,
          y: cy,
          label: "04 Scale",
          dy: 1.4,
          anchor: "end",
        },
      ]}
    />
  );
}

/** Process — a survey traverse. Six stations, rising left to right. */
export function ProcessFigure() {
  const xs = [8, 24, 40, 56, 72, 90];
  const ys = [74, 66, 58, 44, 34, 20];
  let d = `M${xs[0]} ${ys[0]}`;
  for (let i = 1; i < xs.length; i += 1) {
    const mx = (xs[i - 1] + xs[i]) / 2;
    d += ` C${mx} ${ys[i - 1]} ${mx} ${ys[i]} ${xs[i]} ${ys[i]}`;
  }
  return (
    <PlottedFigure
      className="plot--traverse"
      viewBox="0 0 100 90"
      caption="Discovery to improvement"
      figure="01"
      sheet="01 / 01"
      description="A six-station traverse rising from Discover through Map, Design, Build, and Launch to Improve."
      strokes={[
        { d: "M8 82 L90 82", guide: true },
        { d: "M8 82 L8 12", guide: true },
        { d },
        // The return leg: improvement feeds the next discovery.
        { d: `M90 ${ys[5]} C96 40 96 78 12 80` },
      ]}
      nodes={xs.map((x, i) => ({
        id: `s${i}`,
        x,
        y: ys[i],
        label: String(i + 1).padStart(2, "0"),
        key: i === 0 || i === xs.length - 1,
      }))}
    />
  );
}

/** Studio — the gap the practice exists to close, drawn as a dimensioned gap. */
export function StudioFigure() {
  return (
    <PlottedFigure
      className="plot--gap"
      viewBox="0 0 100 60"
      caption="The space between"
      figure="01"
      sheet="01 / 01"
      description="Two arcs approach from opposite sides and stop short of each other. The measured gap between them is the space this studio works in: after marketing ends and before software begins."
      strokes={[
        { d: "M2 30 C16 30 26 14 38 14" },
        { d: "M98 30 C84 30 74 46 62 46" },
        // The dimension line across the gap, with end ticks.
        { d: "M38 30 L62 30", guide: true },
        { d: "M38 24 L38 36", guide: true },
        { d: "M62 24 L62 36", guide: true },
        { d: "M38 14 L38 24", guide: true },
        { d: "M62 36 L62 46", guide: true },
      ]}
      nodes={[
        { id: "l", x: 38, y: 14, label: "Marketing ends" },
        { id: "r", x: 62, y: 46, label: "Software begins" },
        // The measured middle: the thing the studio actually sells.
        { id: "m", x: 50, y: 30, key: true },
      ]}
    />
  );
}
