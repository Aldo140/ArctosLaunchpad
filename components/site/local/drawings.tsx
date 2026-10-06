import type { CSSProperties, ReactNode } from "react";

/**
 * Original line drawings for the Calgary pages, one per service, in a shared
 * 640 × 760 sheet. Every stroke carries pathLength="1" so CSS can draw it on
 * without measuring; with no CSS motion the drawing is simply complete.
 * Stylised, not surveyed: each sheet says "not to scale".
 */

export type LocalVariant = "skyline" | "river" | "grid";

export const SHEET = { w: 640, h: 760 };

/** A drawable stroke. `i` staggers the draw-on. */
function S({ d, i, className = "ld-line", fill }: { d: string; i: number; className?: string; fill?: boolean }) {
  return (
    <path
      d={d}
      pathLength={1}
      className={`ld ${className}${fill ? " ld-fill" : ""}`}
      style={{ "--i": i } as CSSProperties}
    />
  );
}

/** HTML labels laid over the sheet in its own coordinates (percent). */
export type SheetLabel = { x: number; y: number; text: string; align?: "start" | "end" | "middle"; kind?: "quad" | "name" | "station" };

export type Drawing = {
  svg: ReactNode;
  /** Crosshair: downtown, in sheet units. */
  mark: { x: number; y: number };
  labels: SheetLabel[];
  caption: string;
  /** Island placement on the sheet (percent of sheet width / top). */
  island: { left: number; top: number; width: number };
};

/* ---------------------------------------------------------------- skyline */

const MOUNTAINS =
  "M0 470 L38 446 L64 458 L104 414 L130 436 L168 392 L204 432 L236 418 L270 448 L300 430 L338 452 L372 420 L410 446 L452 404 L494 440 L530 426 L570 452 L604 436 L640 450";

const TOWERS = [
  "M30 600 V540 H62 V600",
  "M68 600 V505 H96 V600",
  "M156 600 V420 C172 408 196 404 214 412 V600",
  "M222 600 V398 L250 386 V600",
  "M258 600 V452 H272 V438 H288 V600",
  "M296 600 V470 H330 V600",
  "M336 600 V448 H352 V436 H370 V600",
  "M378 600 V492 H414 V600",
  "M420 600 V466 H446 V600",
  "M452 600 V510 H492 V600",
  "M498 600 V480 H520 V470 H540 V600",
  "M546 600 V528 H584 V600",
  "M590 600 V548 H622 V600",
];

const skyline: Drawing = {
  mark: { x: 128, y: 392 },
  caption: "Downtown elevation · drawn for this page, not to scale",
  island: { left: 9, top: 1, width: 84 },
  labels: [
    { x: 24, y: 724, text: "Bow River", kind: "name" },
    { x: 616, y: 724, text: "Win the customer", align: "end", kind: "name" },
  ],
  svg: (
    <>
      <S d={MOUNTAINS} i={0} className="ld-faint" />
      {TOWERS.map((d, n) => (
        <S key={d} d={d} i={1 + n * 0.35} fill />
      ))}
      {/* the tower: legs, pod, cap, mast */}
      <S d="M114 600 L124 452 M142 600 L132 452" i={2} fill />
      <S d="M114 452 H142 L146 442 L142 430 H114 L110 442 Z" i={3} className="ld-strong" fill />
      <S d="M118 430 L121 422 H135 L138 430 M128 422 V392" i={3.6} className="ld-strong" />
      <S d="M185 600 V407 M300 490 H326 M300 510 H326 M300 530 H326 M300 550 H326 M382 512 H410 M382 532 H410" i={5} className="ld-faint" />
      <S d="M0 600 H640" i={1} className="ld-strong" />
      <S d="M0 640 C110 622 210 662 320 646 S530 624 640 642" i={5.5} className="ld-faint" />
      <S d="M0 690 C110 672 210 712 320 696 S530 674 640 692" i={5.8} className="ld-faint" />
      <S d="M112 620 H144 M118 630 H138 M160 618 H210 M172 628 H200 M224 616 H250 M300 622 H330" i={6.4} className="ld-faint" />
      <S d="M0 664 C110 646 210 686 320 670 S530 648 640 666" i={6} className="ld-signal" />
    </>
  ),
};

/* ------------------------------------------------------------------ river */

/** Bow River centreline, west to east; the signal travels it. */
export const BOW =
  "M-10 300 C80 290 140 340 200 380 C260 420 290 470 340 500 C400 536 470 520 530 560 C580 592 610 640 650 660";
const ELBOW = "M250 770 C260 700 300 640 300 590 C300 550 320 520 340 500";

/** Bridges, computed on the Bow curve: centre, deck ends, and the station each one stands for. */
export const BRIDGES = [
  { x: 116.3, y: 326.3, d: "M125.6 308.6 L106.9 344", label: "Intake", lx: 96, ly: 372 },
  { x: 267.3, y: 437.3, d: "M281.4 423.2 L253.2 451.5", label: "Approve", lx: 236, ly: 476 },
  { x: 367.6, y: 513.1, d: "M374.5 494.3 L360.8 531.8", label: "Assign", lx: 360, ly: 562 },
  { x: 483.4, y: 538.8, d: "M489.1 519.6 L477.8 558", label: "Invoice", lx: 476, ly: 590 },
  { x: 588.1, y: 608.9, d: "M602.1 594.7 L574.1 623.2", label: "Report", lx: 560, ly: 650 },
];

const CONTOURS = [
  "M-10 120 C70 96 150 150 230 128 S330 84 380 104",
  "M-10 160 C80 138 160 196 240 172 S320 132 360 150",
  "M-10 204 C90 182 170 236 250 214 S310 186 340 196",
  "M300 760 C360 730 420 744 480 712 S600 690 650 704",
  "M380 760 C430 740 480 752 540 730 S620 726 650 734",
];

const river: Drawing = {
  mark: { x: 340, y: 500 },
  caption: "The Bow and the Elbow, plan view · not to scale",
  island: { left: 3, top: -1, width: 94 },
  labels: [
    { x: 548, y: 540, text: "Bow River", kind: "name" },
    { x: 210, y: 742, text: "Elbow River", kind: "name" },
    ...BRIDGES.map((b) => ({ x: b.lx, y: b.ly, text: b.label, kind: "station" as const })),
  ],
  svg: (
    <>
      {CONTOURS.map((d, n) => (
        <S key={d} d={d} i={n * 0.4} className="ld-faint" />
      ))}
      <S d={BOW} i={1.5} className="ld-bank" />
      <S d={BOW} i={1.7} className="ld-water" />
      <S d={ELBOW} i={2.2} className="ld-bank ld-bank--narrow" />
      <S d={ELBOW} i={2.4} className="ld-water ld-water--narrow" />
      {BRIDGES.map((b, n) => (
        <path key={b.label} d={b.d} pathLength={1} className="ld ld-bridge" data-station={n} style={{ "--i": 3.2 + n * 0.3 } as CSSProperties} />
      ))}
      <S d={BOW} i={4.2} className="ld-signal ld-signal--thin" />
    </>
  ),
};

/* ------------------------------------------------------------------- grid */

const GRID_X = Array.from({ length: 13 }, (_, n) => 32 + n * 48);
const GRID_Y = Array.from({ length: 15 }, (_, n) => 40 + n * 48);
const GRID_RIVER = "M-10 476 C120 446 200 526 320 518 S520 476 650 550";

const grid: Drawing = {
  mark: { x: 320, y: 518 },
  caption: "The quadrant grid, and the river it bends around · not to scale",
  island: { left: 4, top: 2, width: 92 },
  labels: [
    { x: 40, y: 64, text: "NW", kind: "quad" },
    { x: 610, y: 64, text: "NE", align: "end", kind: "quad" },
    { x: 40, y: 600, text: "SW", kind: "quad" },
    { x: 610, y: 712, text: "SE", align: "end", kind: "quad" },
    { x: 330, y: 700, text: "Centre St", kind: "name" },
    { x: 26, y: 434, text: "Bow River", kind: "name" },
  ],
  svg: (
    <>
      {GRID_X.map((x, n) => (
        <S key={`x${x}`} d={`M${x} 0 V760`} i={n * 0.12} className={x === 320 ? "ld-strong" : "ld-faint"} />
      ))}
      {GRID_Y.map((y, n) => (
        <S key={`y${y}`} d={`M0 ${y} H640`} i={0.6 + n * 0.12} className="ld-faint" />
      ))}
      <S d={GRID_RIVER} i={2.4} className="ld-bank ld-bank--wide" />
      <S d={GRID_RIVER} i={2.6} className="ld-water ld-water--wide" />
      <S d="M80 736 V680 H176 V632 H272 V584 C300 566 312 520 336 490 S372 430 404 404" i={4} className="ld-signal" />
    </>
  ),
};

export const DRAWINGS: Record<LocalVariant, Drawing> = { skyline, river, grid };

/** End of the custom route in the grid sheet. */
export const ROUTE_END = { x: 404, y: 404 };
