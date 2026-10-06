import type { CSSProperties } from "react";
import { BRIDGE, terrainPaths } from "./terrain";

/**
 * A contour map seeded by `seed`. Paths are grouped into three elevation
 * bands so the hero can float them on separate depth planes. Decorative.
 */
export function TerrainSvg({
  seed,
  w = 1600,
  h = 900,
  cols = 60,
  rows = 34,
  count = 14,
  bridge = false,
  lit = [],
  className = "",
  preserve = "xMidYMid slice",
}: {
  seed: string;
  w?: number;
  h?: number;
  cols?: number;
  rows?: number;
  count?: number;
  bridge?: boolean;
  lit?: string[];
  className?: string;
  preserve?: string;
}) {
  const paths = terrainPaths(seed, { w, h, cols, rows, count });
  const bands = [0, 1, 2].map((b) =>
    paths.filter((p) => Math.min(2, Math.floor((p.level / count) * 3)) === b),
  );
  return (
    <svg
      className={`terrain ${className}`}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio={preserve}
      aria-hidden="true"
      focusable="false"
    >
      {bands.map((band, b) => (
        <g key={b} className="terrain__band" data-band={b}>
          {band.map((p) =>
            p.d ? (
              <path
                key={p.level}
                d={p.d}
                pathLength={1}
                className={p.major ? "terrain__major" : undefined}
                style={{ "--lv": p.level / count } as CSSProperties}
              />
            ) : null,
          )}
        </g>
      ))}
      {bridge ? (
        <g className="terrain__bridge">
          <path className="terrain__deck-shadow" d={BRIDGE.d} />
          <path className="terrain__deck" d={BRIDGE.d} pathLength={1} />
          {BRIDGE.nodes.map((n, i) => (
            <g
              key={n.id}
              className={`terrain__node${lit.includes(n.id) ? " is-lit" : ""}`}
              transform={`translate(${n.x} ${n.y})`}
              style={{ "--i": i } as CSSProperties}
            >
              <circle className="terrain__ring" r="22" />
              <circle className="terrain__dot" r="7" />
              <text x={i === 2 ? -34 : 34} y={i === 2 ? -30 : 6} textAnchor={i === 2 ? "end" : "start"}>
                {String(i + 1).padStart(2, "0")} {n.label}
              </text>
            </g>
          ))}
        </g>
      ) : null}
    </svg>
  );
}
