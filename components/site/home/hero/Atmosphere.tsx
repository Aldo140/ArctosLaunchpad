/**
 * Decorative depth planes behind and in front of the bridge. All aria-hidden.
 *
 *   far   .hero__sky      contour field + tonal light (slowest)
 *   mid   .hero__survey   survey crosshairs and the studio's real coordinates
 *   near  .hero__motes    rust signal particles drifting up
 *   front .hero__scraps   out-of-focus signal bokeh (fastest)
 */

const CROSS: [number, number][] = [];
for (let x = 120; x < 1440; x += 160) {
  for (let y = 120; y < 900; y += 160) {
    // Keep the copy column clean; marks gather around the art.
    if (x < 640 && y < 760) continue;
    CROSS.push([x, y]);
  }
}

/** [left %, top %, size px, depth 0–1] — fixed so SSR and client agree. */
const MOTES: [number, number, number, number][] = [
  [48, 62, 4, 0.4], [56, 38, 3, 0.7], [63, 70, 5, 0.9], [71, 30, 3, 0.5],
  [77, 58, 4, 0.8], [84, 44, 3, 0.6], [90, 66, 5, 1], [95, 36, 3, 0.4],
  [52, 84, 3, 0.6], [67, 88, 4, 0.9], [81, 80, 3, 0.5], [60, 22, 2, 0.3],
  [88, 18, 2, 0.35], [74, 74, 2, 0.45],
];

/** Out-of-focus foreground signal: [left %, top %, size px]. */
const BOKEH: [number, number, number][] = [
  [57, 14, 18],
  [97, 46, 26],
  [70, 94, 22],
  [44, 88, 14],
];

export function Atmosphere() {
  return (
    <>
      <div className="hero__sky" aria-hidden="true" />
      <svg
        className="hero__survey"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <g className="hero__cross">
          {CROSS.map(([x, y]) => (
            <path key={`${x}-${y}`} d={`M${x - 6} ${y}h12M${x} ${y - 6}v12`} />
          ))}
        </g>
        <ellipse className="hero__orbit" cx="1010" cy="560" rx="520" ry="300" />
        <ellipse className="hero__orbit hero__orbit--b" cx="1010" cy="560" rx="660" ry="390" />
        <g className="hero__coords">
          <text x="1180" y="236">51.0447° N</text>
          <text x="1180" y="254">114.0719° W</text>
          <text x="660" y="868">Calgary · AB</text>
        </g>
      </svg>
      <div className="hero__glow" aria-hidden="true" />
      <div className="hero__motes" aria-hidden="true">
        {MOTES.map(([x, y, s, z], i) => (
          <span
            key={i}
            className="hero__mote"
            data-depth={z}
            style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, opacity: 0.35 + z * 0.55 }}
          />
        ))}
      </div>
      <div className="hero__scraps" aria-hidden="true">
        {BOKEH.map(([x, y, s], i) => (
          <span key={i} className="hero__bokeh" style={{ left: `${x}%`, top: `${y}%`, width: s, height: s }} />
        ))}
      </div>
    </>
  );
}
