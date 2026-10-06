import type { CSSProperties } from "react";

/* -------------------------------------------------------------------------
   Pieces of the islands chapter that are pure drawing: the plank bridge that
   spans each gap, and the scraps of work drifting in the water between the
   islands. Everything here is decorative and hidden from assistive tech;
   the chapter's meaning lives in the island cards.
   ------------------------------------------------------------------------- */

/** Bridge geometry, in viewBox units (240 × 48). */
export const BRIDGE_W = 240;
const DECK_Y = 30;
const PLANKS = 17;
const PLANK_STEP = (BRIDGE_W - 8) / PLANKS;
const ropeY = (t: number) => 8 + 32 * t * (1 - t);

export function Bridge({ n }: { n: 1 | 2 }) {
  return (
    <div className={`isl-span isl-span--${n}`} aria-hidden="true">
      <svg className="isl-bridge" viewBox={`0 0 ${BRIDGE_W} 48`} focusable="false">
        {/* posts */}
        <rect className="isl-bridge__post" x="0" y="6" width="3.2" height="28" rx="1" />
        <rect className="isl-bridge__post" x={BRIDGE_W - 3.2} y="6" width="3.2" height="28" rx="1" />
        {/* hand rope + hangers */}
        <path className="isl-bridge__rope" d={`M1.6 8 Q${BRIDGE_W / 2} 24 ${BRIDGE_W - 1.6} 8`} />
        {[0.2, 0.4, 0.6, 0.8].map((t) => (
          <path
            key={t}
            className="isl-bridge__rope isl-bridge__hanger"
            d={`M${(BRIDGE_W * t).toFixed(1)} ${ropeY(t).toFixed(1)} V${DECK_Y - 3}`}
          />
        ))}
        {/* planks */}
        {Array.from({ length: PLANKS }, (_, i) => {
          const x = 4 + i * PLANK_STEP;
          return (
            <g className="isl-plank" key={i}>
              <rect className="isl-plank__top" x={x} y={DECK_Y - 3} width={PLANK_STEP - 2.6} height="5" rx="0.8" />
              <rect className="isl-plank__edge" x={x} y={DECK_Y + 2} width={PLANK_STEP - 2.6} height="2.4" />
            </g>
          );
        })}
        {/* the signal: scrubbed once, then (when connected) a quiet loop */}
        <g className="isl-bridge__signal">
          <circle cx="0" cy={DECK_Y - 0.5} r="8" className="isl-bridge__glow" />
          <circle cx="0" cy={DECK_Y - 0.5} r="3.4" className="isl-bridge__dot" />
        </g>
        <circle cx="0" cy={DECK_Y - 0.5} r="2.6" className="isl-bridge__pulse" />
      </svg>
    </div>
  );
}

type ScrapKind = "mail" | "sheet" | "note" | "form";
type ScrapDef = {
  kind: ScrapKind;
  text: string;
  gap: 1 | 2;
  /** position inside the art band, % of scene width / % of band height */
  x: number;
  y: number;
  /** static tilt and depth of the paper itself */
  r: number;
  s: number;
};

/** Illustrative only: the kind of work that goes missing between tools. */
const SCRAPS: ScrapDef[] = [
  { kind: "mail", text: "Re: Fwd: quote?", gap: 1, x: 27.5, y: 6, r: -8, s: 1 },
  { kind: "note", text: "call them back?", gap: 1, x: 35, y: 40, r: 6, s: 0.86 },
  { kind: "form", text: "New enquiry", gap: 1, x: 28.5, y: 70, r: -3, s: 0.78 },
  { kind: "sheet", text: "numbers_FINAL_v3.xlsx", gap: 2, x: 61.5, y: 4, r: 5, s: 0.92 },
  { kind: "mail", text: "Approve? see thread", gap: 2, x: 68, y: 44, r: -6, s: 1 },
  { kind: "note", text: "which total is right?", gap: 2, x: 60.5, y: 74, r: 4, s: 0.8 },
];

export function Scraps() {
  return (
    <div className="isles__scraps" aria-hidden="true">
      {SCRAPS.map((scrap, i) => (
        <div
          key={i}
          className={`isl-scrap isl-scrap--${scrap.kind}`}
          data-gap={scrap.gap}
          style={{ left: `${scrap.x}%`, top: `${scrap.y}%` } as CSSProperties}
        >
          <div className="isl-scrap__bob">
            <div className="isl-scrap__card" style={{ "--r": `${scrap.r}deg`, "--s": scrap.s } as CSSProperties}>
              {scrap.kind === "sheet" ? (
                <>
                  <span className="isl-scrap__file">{scrap.text}</span>
                  <span className="isl-scrap__grid" />
                </>
              ) : scrap.kind === "note" ? (
                <span className="isl-scrap__hand">{scrap.text}</span>
              ) : (
                <>
                  <span className="isl-scrap__subject">
                    {scrap.kind === "form" && <i className="isl-scrap__unread" />}
                    {scrap.text}
                  </span>
                  <span className="isl-scrap__lines" />
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Tick that replaces a symptom's dash once the bridge reaches it. */
export function Mark() {
  return (
    <svg className="isl__mark" viewBox="0 0 14 12" aria-hidden="true" focusable="false">
      <path className="isl__mark-dash" d="M1 6.5 H12" />
      <path className="isl__mark-tick" d="M1.2 6.4 L5 10 L12.6 1.8" />
    </svg>
  );
}
