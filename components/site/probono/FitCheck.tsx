"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { KEYSTONE, KEYSTONE_FIT } from "@/lib/content/probono";
import { Btn } from "../ui";

/**
 * "Is Keystone right for you?" Each statement that is true sets one stone of
 * an arch. With all six in place the keystone drops into the crown and the
 * arch holds. Real checkboxes underneath, so it works with a keyboard and a
 * screen reader, and the verdict is announced as it changes.
 */

const CX = 200;
const CY = 238;
const R_OUT = 166;
const R_IN = 108;
const STONES = 7;
const KEY = 3;
const STEP = 180 / STONES;
const GAP = 0.9;

const pt = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return `${(CX + r * Math.cos(a)).toFixed(2)} ${(CY - r * Math.sin(a)).toFixed(2)}`;
};

const stone = (i: number, lift = 0) => {
  const a0 = 180 - i * STEP - GAP;
  const a1 = 180 - (i + 1) * STEP + GAP;
  const ro = R_OUT + lift;
  return `M ${pt(ro, a0)} A ${ro} ${ro} 0 0 1 ${pt(ro, a1)} L ${pt(R_IN, a1)} A ${R_IN} ${R_IN} 0 0 0 ${pt(R_IN, a0)} Z`;
};

const mid = (i: number) => {
  const a = (((180 - (i + 0.5) * STEP) * Math.PI) / 180);
  const r = (R_OUT + R_IN) / 2;
  return { x: +(CX + r * Math.cos(a)).toFixed(2), y: +(CY - r * Math.sin(a)).toFixed(2) };
};

/** Statement n sets stone ORDER[n]: the arch rises evenly from both sides. */
const ORDER = [0, 6, 1, 5, 2, 4];

const VERDICTS = [
  { title: "Tick what’s true.", body: "Each statement that fits sets a stone in the arch." },
  { title: "A start.", body: "Keep going. Most organizations that apply tick more than they expect." },
  { title: "A start.", body: "Keep going. Most organizations that apply tick more than they expect." },
  { title: "Looks promising.", body: "Half the arch is standing. If the rest is close to true, we would like to hear from you." },
  { title: "A strong fit.", body: "Most of the arch is up. Apply, and tell us about the work." },
  { title: "A strong fit.", body: "One stone from the crown. Apply, and tell us about the work." },
  { title: "Keystone set.", body: "The arch holds. This is exactly who the program is for: apply now." },
];

export function FitCheck() {
  const [on, setOn] = useState<boolean[]>(() => KEYSTONE_FIT.map(() => false));
  const count = on.filter(Boolean).length;
  const complete = count === KEYSTONE_FIT.length;
  const verdict = VERDICTS[count];
  const setStone = new Set(on.flatMap((v, i) => (v ? [ORDER[i]] : [])));

  return (
    <div className={`kp-fit${complete ? " is-complete" : ""}`} style={{ "--count": count } as CSSProperties}>
      <div className="kp-fit__stage" aria-hidden="true">
        <div className="kp-fit__art">
          <Image
            className="kp-fit__bear"
            src="/assets/art/bear-peek.webp"
            alt=""
            width={420}
            height={280}
            sizes="(max-width: 900px) 30vw, 200px"
          />
          <svg className="kp-arch" viewBox="0 0 400 270">
            <path className="kp-arch__ground" d="M 4 262 H 396" />
            <path className="kp-arch__pier" d={`M ${CX - R_OUT - 4} ${CY} h ${R_OUT - R_IN + 8} v 24 h ${-(R_OUT - R_IN + 8)} Z`} />
            <path className="kp-arch__pier" d={`M ${CX + R_IN - 4} ${CY} h ${R_OUT - R_IN + 8} v 24 h ${-(R_OUT - R_IN + 8)} Z`} />
            {Array.from({ length: STONES }, (_, i) => {
              if (i === KEY) return null;
              const n = ORDER.indexOf(i);
              const m = mid(i);
              const set = setStone.has(i);
              return (
                <g key={i} className={`kp-stone${set ? " is-set" : ""}`} style={{ "--spin": `${i < KEY ? -18 : 18}deg` } as CSSProperties}>
                  <path className="kp-stone__ghost" d={stone(i)} />
                  <g className="kp-stone__solid">
                    <path d={stone(i)} />
                    <text x={m.x} y={m.y + 4} textAnchor="middle">
                      {String(n + 1).padStart(2, "0")}
                    </text>
                  </g>
                </g>
              );
            })}
            <g className="kp-key">
              <path className="kp-stone__ghost" d={stone(KEY, 14)} />
              <g className="kp-key__solid">
                <path d={stone(KEY, 14)} />
                <text x={mid(KEY).x} y={mid(KEY).y + 1} textAnchor="middle">
                  ✦
                </text>
              </g>
              <circle className="kp-key__flash" cx={mid(KEY).x} cy={mid(KEY).y - 4} r="34" />
            </g>
          </svg>
        </div>
        <p className="kp-fit__meter">
          <b>{count}</b> of {KEYSTONE_FIT.length} stones set
        </p>
      </div>

      <fieldset className="kp-fit__list">
        <legend className="visually-hidden">Which of these are true for your organization?</legend>
        {KEYSTONE_FIT.map((statement, i) => (
          <label key={statement} className={`kp-fit__item${on[i] ? " is-on" : ""}`}>
            <input
              type="checkbox"
              checked={on[i]}
              onChange={(e) => {
                const next = [...on];
                next[i] = e.target.checked;
                setOn(next);
              }}
            />
            <span className="kp-fit__box" aria-hidden="true">
              <svg viewBox="0 0 16 16">
                <path d="M3 8.5 6.5 12 13 4.5" />
              </svg>
            </span>
            <span className="kp-fit__n mono" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="kp-fit__text">{statement}</span>
          </label>
        ))}
      </fieldset>

      <div className="kp-fit__verdict">
        <div aria-live="polite">
          <p className="h3 kp-fit__title">{verdict.title}</p>
          <p className="kp-fit__body">{verdict.body}</p>
        </div>
        <Btn href={`/contact?need=${KEYSTONE.need}`} variant={count >= 3 ? "solid" : "ghost"}>
          Apply for Keystone
        </Btn>
      </div>
    </div>
  );
}
