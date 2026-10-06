import Image from "next/image";
import type { CSSProperties } from "react";
import { islands } from "@/lib/content";

/* -------------------------------------------------------------------------
   Phone/tablet stage (< 1024px). A CSS-sticky portrait scene: three islands
   in a zigzag, scraps of lost work in the water, and a plank bridge that the
   motion hook lays between them as the reader scrolls. Purely visual — the
   cards below carry the content — so it is hidden from assistive tech and
   only shown when the motion hook is running (`.is-live-m`).
   ------------------------------------------------------------------------- */

const SCRAPS = [
  { kind: "mail", text: "Re: Fwd: quote?", seg: 1, x: 2, y: 52, r: -7 },
  { kind: "note", text: "call them back?", seg: 1, x: 55, y: 21, r: 5 },
  { kind: "sheet", text: "numbers_FINAL_v3", seg: 2, x: 38, y: 55, r: 4 },
  { kind: "note", text: "which total is right?", seg: 2, x: 56, y: 90, r: -4 },
] as const;

export function MobileStage() {
  return (
    <div className="ism" aria-hidden="true">
      <div className="ism__stage">
        <div className="ism__meter">
          <span className="ism__step">
            <b>01</b> Adrift
          </span>
          <span className="ism__track">
            <i />
          </span>
          <span className="ism__step">
            <b>02</b> Bridging
          </span>
          <span className="ism__track">
            <i />
          </span>
          <span className="ism__step">
            <b>03</b> Connected
          </span>
        </div>

        <div className="ism__scene">
          <svg className="ism__deck" />
          {SCRAPS.map((s, i) => (
            <div
              key={i}
              className={`ism__scrap isl-scrap--${s.kind}`}
              data-seg={s.seg}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
            >
              <div className="ism__scrap-bob">
                <div
                  className="isl-scrap__card"
                  style={{ "--r": `${s.r}deg`, "--s": 1 } as CSSProperties}
                >
                  {s.kind === "note" ? (
                    <span className="isl-scrap__hand">{s.text}</span>
                  ) : s.kind === "sheet" ? (
                    <>
                      <span className="isl-scrap__file">{s.text}</span>
                      <span className="isl-scrap__grid" />
                    </>
                  ) : (
                    <>
                      <span className="isl-scrap__subject">{s.text}</span>
                      <span className="isl-scrap__lines" />
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          {islands.map((island) => (
            <div key={island.id} className={`ism__isl ism__isl--${island.id}`}>
              <div className="ism__float">
                <div className="ism__bob">
                  <Image
                    src={island.art.src}
                    alt=""
                    width={island.art.width}
                    height={island.art.height}
                    sizes="(max-width: 1023px) 46vw, 1px"
                  />
                </div>
              </div>
            </div>
          ))}
          {islands.map((island) => (
            <p
              key={island.id}
              className={`ism__label ism__label--${island.id}`}
            >
              <span className="ism__tag">
                <i className="ism__dot" />
                <span className="index">{island.index}</span> {island.name}
              </span>
              <span className="ism__quote">{island.symptom}</span>
            </p>
          ))}
        </div>

        <p className="ism__caption">
          <span className="ism__cap ism__cap--a">
            The work gets lost in the water between them.
          </span>
          <span className="ism__cap ism__cap--b">
            We build the bridge: <em>one path across all three.</em>
          </span>
        </p>
      </div>
    </div>
  );
}
