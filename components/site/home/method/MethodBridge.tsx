import { processDetails } from "@/lib/content";
import { VIEW, WATER_Y, arrival, banks, pct, piers, planPath, planks, signalPath } from "./bridgeGeometry";

/**
 * The bridge the six stops build. Drawn complete by default (no JS, reduced
 * motion); MethodRoute takes it apart and builds it plank by plank on scroll.
 * The stop labels are only shown while the stage is pinned, where they jump
 * to their stop.
 */
export function MethodBridge() {
  const { w, h } = VIEW;
  return (
    <div className="mb">
      <svg className="mb__svg" viewBox={`0 0 ${w} ${h}`} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="mb-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--mb-water-top)" />
            <stop offset="1" stopColor="var(--mb-water-bottom)" />
          </linearGradient>
          <radialGradient id="mb-glow">
            <stop offset="0" stopColor="var(--rust)" stopOpacity="0.45" />
            <stop offset="1" stopColor="var(--rust)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <linearGradient id="mb-fade-g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.12" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.88" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="mb-fade" maskUnits="userSpaceOnUse" x="-60" y="0" width={w + 120} height={h}>
          <rect x="-60" y="0" width={w + 120} height={h} fill="url(#mb-fade-g)" />
        </mask>

        {/* water */}
        <g mask="url(#mb-fade)">
        <rect className="mb__water" x="-60" y={WATER_Y} width={w + 120} height={h - WATER_Y} fill="url(#mb-water)" />
        {[0, 1, 2, 3].map((r) => (
          <path
            key={r}
            className="mb__wave"
            d={`M${-40 + r * 23},${WATER_Y + 14 + r * 15} q 30,-5 60,0 t 60,0 t 60,0 t 60,0 t 60,0 t 60,0 t 60,0 t 60,0 t 60,0 t 60,0 t 60,0 t 60,0 t 60,0 t 60,0 t 60,0 t 60,0 t 60,0 t 60,0 t 60,0 t 60,0 t 60,0`}
            style={{ opacity: 0.75 - r * 0.15 }}
          />
        ))}
        </g>

        {/* plank shadows on the water: they firm up as each plank lands */}
        {planks.map((p, i) => (
          <ellipse key={i} className="mb__shadow" cx={p.mid.x} cy={WATER_Y + 10} rx="74" ry="5" />
        ))}

        {/* banks */}
        <path className="mb__bank" d={banks.left} />
        <path className="mb__bank" d={banks.right} />

        {/* the plan: dashed outline of the whole deck before anything is built */}
        <path className="mb__plan" d={planPath} />

        {/* piers */}
        {piers.map((p, i) => (
          <line key={i} className="mb__pier" x1={p.x} y1={p.y1} x2={p.x} y2={p.y2} />
        ))}

        {/* ripples where each plank lands */}
        {planks.map((p, i) => (
          <ellipse key={i} className="mb__ripple" cx={p.mid.x} cy={WATER_Y + 10} rx="58" ry="7" />
        ))}

        {/* the six planks */}
        {planks.map((p, i) => (
          <g key={i} className="mb__plank">
            <polygon className="mb__plank-body" points={p.body} />
            <path className="mb__plank-grain" d={p.grain} />
            {p.nails.map((nail, k) => (
              <circle key={k} className="mb__nail" cx={nail.x} cy={nail.y} r="2.2" />
            ))}
          </g>
        ))}

        {/* the signal's route along the deck, and the signal itself */}
        <path className="mb__deck" d={signalPath} />
        <g className="mb__arrive" transform={`translate(${arrival.x} ${arrival.y})`}>
          <circle r="22" fill="url(#mb-glow)" />
          <circle className="mb__signal-ring" r="9" />
          <circle className="mb__signal-dot" r="5" />
        </g>
        <g className="mb__signal">
          <circle r="22" fill="url(#mb-glow)" />
          <circle className="mb__signal-ring" r="9" />
          <circle className="mb__signal-dot" r="5" />
        </g>
      </svg>

      <p className="mb__bank-label mb__bank-label--from" aria-hidden="true">
        How it runs today
      </p>
      <p className="mb__bank-label mb__bank-label--to" aria-hidden="true">
        In daily use
      </p>

      <nav className="mb__stops" aria-label="Jump to a stop">
        {processDetails.map((step, i) => (
          <button
            key={step.id}
            type="button"
            className="mb__stop"
            style={pct({ x: planks[i].mid.x, y: planks[i].mid.y + 36 })}
          >
            <span className="mb__stop-index">{step.index}</span>
            <span className="mb__stop-title">{step.title}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
