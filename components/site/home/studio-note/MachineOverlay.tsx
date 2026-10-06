/**
 * Authored layers drawn in the art's own coordinate space (1536 × 1024), laid
 * exactly over `the-work-moves.webp`:
 *
 *   - four gear/pulley hubs cut from the painting itself (feathered inside the
 *     rim, so only the spokes visibly turn) — rotated around their true centres
 *   - loose sheets in the linocut style: scrawled when they arrive, ruled and
 *     ticked once they've been through the machine
 *   - the extra layers that land on the painted stack
 *   - a rust thread: the path one task takes from the pile to the stack
 *
 * Everything here is decorative; the section is fully readable without it.
 */

export const GEARS = [
  { id: "a", src: "/assets/art/studio-note/gear-a.webp", cx: 840, cy: 567.4, r: 52 },
  { id: "b", src: "/assets/art/studio-note/gear-b.webp", cx: 891.4, cy: 650.4, r: 33 },
  { id: "c", src: "/assets/art/studio-note/pulley-a.webp", cx: 975.2, cy: 605.7, r: 22 },
  { id: "d", src: "/assets/art/studio-note/pulley-b.webp", cx: 1134.2, cy: 717.3, r: 22 },
] as const;

export const SHEET_COUNT = 7;
export const LAYER_STEP = 5.2;

/* Top face + front + side of one sheet on the painted stack (art coordinates). */
const TOP = "1283,607 1357,591 1458,597 1398,615";
const FRONT = "1283,607 1398,615 1398,620.5 1283,612.5";
const SIDE = "1398,615 1458,597 1458,602.5 1398,620.5";

function Sheet({ i }: { i: number }) {
  return (
    <g className="sn-sheet" data-sheet={i}>
      <g className="sn-sheet__body">
        <path className="sn-paper" d="M-46 -30 H36 L46 -20 V30 H-46 Z" />
        <path className="sn-ink sn-ink--thin" d="M36 -30 V-20 H46" />
        <g className="sn-sheet__messy">
          <path
            className="sn-ink"
            d="M-34 -16 q5 -5 10 0 t10 1 t9 -2 t11 2 M-36 -5 q4 3 9 -1 t8 2 t12 -1 M-30 6 l8 -3 l5 5 l9 -6 l6 4 M-34 17 q7 -5 13 1 t17 -2"
          />
        </g>
        <g className="sn-sheet__neat">
          <path className="sn-ink" d="M-34 -16 H22 M-34 -5 H30 M-34 6 H26 M-34 17 H8" />
          <path className="sn-tick" d="M18 15 l5 5 l10 -12" />
        </g>
      </g>
    </g>
  );
}

export function MachineOverlay() {
  return (
    <svg
      className="studio-note__overlay"
      viewBox="0 0 1536 1024"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <g className="sn-gears">
        {GEARS.map((g) => (
          <g key={g.id} className="sn-gear" data-gear={g.id}>
            <image
              href={g.src}
              x={g.cx - g.r}
              y={g.cy - g.r}
              width={g.r * 2}
              height={g.r * 2}
              preserveAspectRatio="none"
            />
          </g>
        ))}
      </g>

      <path
        className="sn-thread"
        d="M700 356 C 740 368, 770 380, 792 390 L 1196 664 C 1250 640, 1300 610, 1368 600"
      />

      <g className="sn-layers">
        {Array.from({ length: SHEET_COUNT }, (_, k) => (
          <g
            key={k}
            className="sn-layer"
            data-layer={k}
            transform={`translate(0 ${-(k + 1) * LAYER_STEP})`}
          >
            <polygon className="sn-layer__side" points={SIDE} />
            <polygon className="sn-layer__front" points={FRONT} />
            <polygon className="sn-paper" points={TOP} />
          </g>
        ))}
      </g>

      <g className="sn-sheets">
        {Array.from({ length: SHEET_COUNT }, (_, i) => (
          <Sheet key={i} i={i} />
        ))}
      </g>
    </svg>
  );
}
