/** Shared geometry for the /process survey route. Pure and deterministic, so server and client agree. */

export type Pt = readonly [number, number];

/** Smooth path through points (Catmull-Rom converted to cubic Béziers). */
export function smoothPath(points: readonly Pt[], tension = 0.5): string {
  const f = (n: number) => n.toFixed(1);
  let d = `M${f(points[0][0])},${f(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const k = tension / 3;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    d += ` C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return d;
}

/** Hero survey strip: viewBox 0 0 1440 300. Six stakes, one per stop. */
export const STRIP = { w: 1440, h: 300 } as const;
export const STAKES: readonly Pt[] = [
  [168, 214],
  [392, 150],
  [616, 196],
  [840, 128],
  [1064, 176],
  [1288, 112],
];
export const ROUTE_D = smoothPath([[-40, 250], ...STAKES, [1480, 96]]);
