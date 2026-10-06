/* =========================================================================
   Industries — generated terrain
   -------------------------------------------------------------------------
   "Same bridge. Different terrain." Every industry gets a contour map seeded
   from its slug, so each page has its own ground while the rust bridge drawn
   over it never changes. Pure functions: the server renders the SVG, and the
   index's canvas morphs between the same fields on the client.
   Nothing here is data — it is illustration, and it is labelled as such.
   ========================================================================= */

export type Hill = { x: number; y: number; r: number; h: number };
export type Field = { hills: Hill[]; ox: number; oy: number };
export type Line = { pts: number[]; closed: boolean };

const HILLS = 7;

export function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A field is a handful of hills and hollows plus an offset into shared noise. */
export function makeField(key: string): Field {
  const r = rng(hashString(key));
  const hills: Hill[] = [];
  for (let i = 0; i < HILLS; i++) {
    hills.push({
      x: 0.06 + r() * 0.88,
      y: 0.08 + r() * 0.84,
      r: 0.13 + r() * 0.24,
      h: i < 2 ? 0.9 + r() * 0.5 : r() < 0.3 ? -(0.3 + r() * 0.4) : 0.35 + r() * 0.7,
    });
  }
  return { hills, ox: r() * 40, oy: r() * 40 };
}

export function lerpField(a: Field, b: Field, t: number): Field {
  const m = (p: number, q: number) => p + (q - p) * t;
  return {
    hills: a.hills.map((h, i) => {
      const k = b.hills[i];
      return { x: m(h.x, k.x), y: m(h.y, k.y), r: m(h.r, k.r), h: m(h.h, k.h) };
    }),
    ox: m(a.ox, b.ox),
    oy: m(a.oy, b.oy),
  };
}

/* ---- Shared value noise (one fixed lattice for every field) ------------ */

const PERM = (() => {
  const r = rng(0xa4c705);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  const vals = p.map(() => r() * 2 - 1);
  return { p: [...p, ...p], vals };
})();

const fade = (t: number) => t * t * (3 - 2 * t);

function lattice(ix: number, iy: number) {
  return PERM.vals[PERM.p[(PERM.p[ix & 255] + iy) & 255]];
}

function noise(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = fade(x - ix);
  const fy = fade(y - iy);
  const a = lattice(ix, iy);
  const b = lattice(ix + 1, iy);
  const c = lattice(ix, iy + 1);
  const d = lattice(ix + 1, iy + 1);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

/** Sample the field on a (cols × rows) lattice covering a w × h box. */
export function sample(field: Field, cols: number, rows: number, aspect: number) {
  const out = new Float32Array(cols * rows);
  for (let j = 0; j < rows; j++) {
    const v = j / (rows - 1);
    for (let i = 0; i < cols; i++) {
      const u = i / (cols - 1);
      let z = 0;
      for (const hl of field.hills) {
        const dx = (u - hl.x) * aspect;
        const dy = v - hl.y;
        z += hl.h * Math.exp(-(dx * dx + dy * dy) / (hl.r * hl.r));
      }
      const nx = u * aspect * 2.6 + field.ox;
      const ny = v * 2.6 + field.oy;
      z += 0.32 * noise(nx, ny) + 0.12 * noise(nx * 2.3 + 7, ny * 2.3 + 3);
      out[j * cols + i] = z;
    }
  }
  return out;
}

/* ---- Marching squares, chained into polylines -------------------------- */

// Edges: 0 top, 1 right, 2 bottom, 3 left.
const CASES: Record<number, number[][]> = {
  1: [[3, 2]],
  2: [[2, 1]],
  3: [[3, 1]],
  4: [[0, 1]],
  6: [[0, 2]],
  7: [[0, 3]],
  8: [[0, 3]],
  9: [[0, 2]],
  11: [[0, 1]],
  12: [[3, 1]],
  13: [[1, 2]],
  14: [[3, 2]],
};

/**
 * Contour lines for each level, in lattice units scaled to (w, h).
 * Endpoints are keyed by the lattice edge they sit on, so chaining is exact.
 */
export function contours(
  grid: Float32Array,
  cols: number,
  rows: number,
  levels: number[],
  w: number,
  h: number,
): Line[][] {
  const sx = w / (cols - 1);
  const sy = h / (rows - 1);
  const V = cols * rows; // vertical edge ids start here
  return levels.map((t) => {
    const pos = new Map<number, [number, number]>();
    const adj = new Map<number, number[]>();
    const link = (e1: number, e2: number) => {
      (adj.get(e1) ?? adj.set(e1, []).get(e1)!).push(e2);
      (adj.get(e2) ?? adj.set(e2, []).get(e2)!).push(e1);
    };
    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const a = grid[j * cols + i];
        const b = grid[j * cols + i + 1];
        const c = grid[(j + 1) * cols + i + 1];
        const d = grid[(j + 1) * cols + i];
        const idx = (a > t ? 8 : 0) | (b > t ? 4 : 0) | (c > t ? 2 : 0) | (d > t ? 1 : 0);
        if (idx === 0 || idx === 15) continue;
        let segs = CASES[idx];
        if (idx === 5 || idx === 10) {
          const centre = (a + b + c + d) / 4 > t;
          if (idx === 5) segs = centre ? [[0, 3], [1, 2]] : [[0, 1], [3, 2]];
          else segs = centre ? [[0, 1], [3, 2]] : [[0, 3], [1, 2]];
        }
        const edge = (k: number) => {
          let id: number, x: number, y: number;
          if (k === 0) {
            id = j * cols + i;
            x = i + (t - a) / (b - a);
            y = j;
          } else if (k === 2) {
            id = (j + 1) * cols + i;
            x = i + (t - d) / (c - d);
            y = j + 1;
          } else if (k === 3) {
            id = V + j * cols + i;
            x = i;
            y = j + (t - a) / (d - a);
          } else {
            id = V + j * cols + i + 1;
            x = i + 1;
            y = j + (t - b) / (c - b);
          }
          if (!pos.has(id)) pos.set(id, [x * sx, y * sy]);
          return id;
        };
        for (const [k1, k2] of segs) link(edge(k1), edge(k2));
      }
    }
    const seen = new Set<number>();
    const lines: Line[] = [];
    const walk = (start: number) => {
      const chain = [start];
      seen.add(start);
      let cur = start;
      for (;;) {
        const next = adj.get(cur)!.find((n) => !seen.has(n));
        if (next === undefined) break;
        seen.add(next);
        chain.push(next);
        cur = next;
      }
      const closed = chain.length > 2 && adj.get(cur)!.includes(start);
      const pts: number[] = [];
      for (const id of chain) pts.push(...pos.get(id)!);
      if (chain.length > 1) lines.push({ pts, closed });
    };
    for (const [id, n] of adj) if (n.length === 1 && !seen.has(id)) walk(id);
    for (const id of adj.keys()) if (!seen.has(id)) walk(id);
    return lines;
  });
}

export function levelsFor(grid: Float32Array, count: number) {
  let lo = Infinity;
  let hi = -Infinity;
  for (const z of grid) {
    if (z < lo) lo = z;
    if (z > hi) hi = z;
  }
  return Array.from({ length: count }, (_, k) => lo + ((k + 0.5) / count) * (hi - lo));
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Midpoint-smoothed path: reads as a drawn contour, not a polygon. */
export function linePath({ pts, closed }: Line) {
  const n = pts.length / 2;
  if (n < 2) return "";
  const P = (k: number) => [pts[2 * k], pts[2 * k + 1]];
  if (n === 2) return `M${r1(pts[0])} ${r1(pts[1])}L${r1(pts[2])} ${r1(pts[3])}`;
  let d = "";
  if (closed) {
    const [x0, y0] = P(0);
    const [x1, y1] = P(1);
    d = `M${r1((x0 + x1) / 2)} ${r1((y0 + y1) / 2)}`;
    for (let k = 1; k <= n; k++) {
      const [cx, cy] = P(k % n);
      const [nx, ny] = P((k + 1) % n);
      d += `Q${r1(cx)} ${r1(cy)} ${r1((cx + nx) / 2)} ${r1((cy + ny) / 2)}`;
    }
    return d + "Z";
  }
  d = `M${r1(pts[0])} ${r1(pts[1])}`;
  for (let k = 1; k < n - 1; k++) {
    const [cx, cy] = P(k);
    const [nx, ny] = P(k + 1);
    d += `Q${r1(cx)} ${r1(cy)} ${r1((cx + nx) / 2)} ${r1((cy + ny) / 2)}`;
  }
  const [lx, ly] = P(n - 1);
  return d + `L${r1(lx)} ${r1(ly)}`;
}

/** Contour paths for one industry, bucketed by elevation band (low → high). */
export function terrainPaths(
  key: string,
  { w, h, cols, rows, count = 14 }: { w: number; h: number; cols: number; rows: number; count?: number },
) {
  const grid = sample(makeField(key), cols, rows, w / h);
  const levels = levelsFor(grid, count);
  const all = contours(grid, cols, rows, levels, w, h);
  return all.map((lines, level) => ({
    level,
    major: level % 4 === 3,
    d: lines
      .filter((l) => l.pts.length >= 8)
      .map(linePath)
      .join(""),
  }));
}

/* ---- The bridge: identical on every terrain ----------------------------
   Drawn in a 1600 × 900 box. Three nodes: Win, Run, See. */

export const BRIDGE = {
  d: "M840 700C960 650 1000 520 1100 480S1320 430 1380 280",
  nodes: [
    { id: "win", x: 840, y: 700, label: "Win the customer" },
    { id: "run", x: 1100, y: 480, label: "Run the work" },
    { id: "see", x: 1380, y: 280, label: "See the numbers" },
  ],
} as const;
