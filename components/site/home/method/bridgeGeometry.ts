/**
 * Geometry for the method bridge. The deck is one quadratic curve split into
 * six planks, one per stop, so the drawing and the content share an order.
 * Everything is computed once at module load; the SVG is static markup.
 */

export const VIEW = { w: 1200, h: 330 };
export const WATER_Y = 256;

const P0 = { x: 78, y: 170 };
const P1 = { x: 600, y: 74 };
const P2 = { x: 1122, y: 170 };

const HALF = 10; // half the plank thickness
const GAP = 0.0045; // gap between planks, in curve t

type Pt = { x: number; y: number };

function at(t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * P0.x + 2 * u * t * P1.x + t * t * P2.x,
    y: u * u * P0.y + 2 * u * t * P1.y + t * t * P2.y,
  };
}

/** Unit normal pointing up (away from the water). */
function up(t: number): Pt {
  const dx = 2 * (1 - t) * (P1.x - P0.x) + 2 * t * (P2.x - P1.x);
  const dy = 2 * (1 - t) * (P1.y - P0.y) + 2 * t * (P2.y - P1.y);
  const len = Math.hypot(dx, dy) || 1;
  return { x: dy / len, y: -dx / len };
}

function offset(t: number, d: number): Pt {
  const p = at(t);
  const n = up(t);
  return { x: p.x + n.x * d, y: p.y + n.y * d };
}

const f = (n: number) => Math.round(n * 10) / 10;
const pt = (p: Pt) => `${f(p.x)},${f(p.y)}`;

function samples(a: number, b: number, n: number, d: number) {
  return Array.from({ length: n + 1 }, (_, i) => offset(a + ((b - a) * i) / n, d));
}

export type Plank = {
  /** Polygon of the plank body. */
  body: string;
  /** Grain line along the plank. */
  grain: string;
  /** Nail heads at each end. */
  nails: Pt[];
  /** Mid point on the deck, for labels, ripples and shadows. */
  mid: Pt;
};

export const STOPS = 6;

export const planks: Plank[] = Array.from({ length: STOPS }, (_, i) => {
  const a = i / STOPS + GAP;
  const b = (i + 1) / STOPS - GAP;
  const top = samples(a, b, 10, HALF);
  const bottom = samples(a, b, 10, -HALF).reverse();
  const grain = samples(a + 0.012, b - 0.03, 8, 2.5);
  return {
    body: [...top, ...bottom].map(pt).join(" "),
    grain: "M" + grain.map(pt).join(" L"),
    nails: [offset(a + 0.007, 0), offset(b - 0.007, 0)].map((p) => ({ x: f(p.x), y: f(p.y) })),
    mid: (() => {
      const p = at((a + b) / 2);
      return { x: f(p.x), y: f(p.y) };
    })(),
  };
});

/** The signal's route: the top surface of the deck, bank to bank. */
export const signalPath = "M" + samples(0, 1, 72, HALF + 7).map(pt).join(" L");

/** The full deck outline, drawn dashed as the plan before anything is built. */
export const planPath =
  "M" + samples(0, 1, 48, HALF).map(pt).join(" L") + " L" + samples(0, 1, 48, -HALF).reverse().map(pt).join(" L") + " Z";

/** Piers at every joint between planks, from the deck's underside to the water. */
export const piers = Array.from({ length: STOPS - 1 }, (_, i) => {
  const p = offset((i + 1) / STOPS, -HALF);
  return { x: f(p.x), y1: f(p.y), y2: WATER_Y + 6 };
});

/** Banks: where the business is today, and where the work is in daily use. */
export const banks = {
  left: `M0,${WATER_Y + 4} L0,${P0.y + 4} C30,${P0.y - 2} 64,${P0.y - 4} ${P0.x + 14},${P0.y + 6} C${P0.x + 30},${P0.y + 30} ${P0.x + 18},${WATER_Y - 20} ${P0.x + 46},${WATER_Y + 4} Z`,
  right: `M1200,${WATER_Y + 4} L1200,${P2.y + 4} C1170,${P2.y - 2} 1136,${P2.y - 4} ${P2.x - 14},${P2.y + 6} C${P2.x - 30},${P2.y + 30} ${P2.x - 18},${WATER_Y - 20} ${P2.x - 46},${WATER_Y + 4} Z`,
};

/** Percent positions for HTML labels laid over the drawing. */
export const pct = (p: Pt) => ({ left: `${(p.x / VIEW.w) * 100}%`, top: `${(p.y / VIEW.h) * 100}%` });

/** Where the signal comes to rest when the bridge is shown complete. */
export const arrival = (() => {
  const p = offset(1, HALF + 7);
  return { x: f(p.x), y: f(p.y) };
})();
