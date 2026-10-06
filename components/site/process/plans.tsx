import type { CSSProperties, ReactNode } from "react";

/**
 * One drafted "plan" per stop: line drawings on a dark sheet, drawn stroke by
 * stroke. Every drawable stroke has pathLength=1 so CSS and GSAP can draw it.
 * Labels are illustrative words, never numbers.
 */

const s = (i: number) => ({ "--s": i }) as CSSProperties;

function P({ d, i, c = "ln", dash }: { d: string; i: number; c?: string; dash?: boolean }) {
  return dash ? (
    <path d={d} className={`dsh ${c}`} style={s(i)} />
  ) : (
    <path d={d} pathLength={1} className={`dr ${c}`} style={s(i)} />
  );
}
function C({ x, y, r, i, c = "ln" }: { x: number; y: number; r: number; i: number; c?: string }) {
  return <circle cx={x} cy={y} r={r} pathLength={1} className={`dr ${c}`} style={s(i)} />;
}
function R({ x, y, w, h, i, c = "ln", rx = 3 }: { x: number; y: number; w: number; h: number; i: number; c?: string; rx?: number }) {
  return <rect x={x} y={y} width={w} height={h} rx={rx} pathLength={1} className={`dr ${c}`} style={s(i)} />;
}
function T({ x, y, children, i, a = "middle", c = "" }: { x: number; y: number; children: ReactNode; i: number; a?: "start" | "middle" | "end"; c?: string }) {
  return (
    <text x={x} y={y} textAnchor={a} className={`lb ${c}`} style={s(i)}>
      {children}
    </text>
  );
}

const PLANS: Record<string, { caption: string; art: ReactNode }> = {
  discover: {
    caption: "How it runs today",
    art: (
      <>
        <C x={86} y={150} r={24} i={0} />
        <C x={206} y={96} r={24} i={1} />
        <C x={322} y={156} r={24} i={2} />
        <P d="M108,140 C140,124 160,106 182,100" i={3} dash />
        <P d="M230,104 C262,114 282,134 300,148" i={4} dash />
        <P d="M108,162 C170,206 252,206 300,170" i={5} dash />
        <T x={86} y={196} i={6}>customers</T>
        <T x={206} y={142} i={6}>team</T>
        <T x={322} y={202} i={6}>tools</T>
        <T x={140} y={110} i={7} c="q">?</T>
        <T x={276} y={118} i={7} c="q">?</T>
        <T x={206} y={208} i={7} c="q">?</T>
        <C x={206} y={96} r={36} i={8} c="ac" />
        <P d="M232,122 L262,152" i={9} c="ac thick" />
        <P d="M316,74 V30 M316,30 H346 L338,38 L346,46 H316" i={10} c="ac" />
        <T x={331} y={90} i={11}>success</T>
      </>
    ),
  },
  map: {
    caption: "Where the work gets stuck",
    art: (
      <>
        <R x={22} y={56} w={70} h={34} i={0} />
        <R x={120} y={56} w={70} h={34} i={1} />
        <R x={218} y={56} w={70} h={34} i={2} />
        <R x={316} y={56} w={66} h={34} i={3} />
        <T x={57} y={77} i={4}>enquiry</T>
        <T x={155} y={77} i={4}>quote</T>
        <T x={253} y={77} i={4}>job</T>
        <T x={349} y={77} i={4}>invoice</T>
        <P d="M92,73 H116 M110,68 L116,73 L110,78" i={5} />
        <P d="M288,73 H312 M306,68 L312,73 L306,78" i={6} />
        <P d="M190,73 H214" i={6} c="ac" dash />
        <P d="M197,66 L207,80 M207,66 L197,80" i={7} c="ac thick" />
        <C x={202} y={73} r={20} i={8} c="ac" />
        <R x={110} y={164} w={190} h={40} i={9} />
        <T x={205} y={189} i={10}>spreadsheet</T>
        <P d="M155,90 C150,124 160,140 170,164" i={11} dash />
        <P d="M253,90 C258,124 248,140 240,164" i={11} dash />
        <T x={24} y={132} i={12} a="start">copied by hand</T>
        <T x={262} y={132} i={12} a="start" c="ac-t">the cause</T>
      </>
    ),
  },
  design: {
    caption: "Decide before building",
    art: (
      <>
        <P d="M28,30 H198 M28,24 V36 M198,24 V36" i={0} c="fa" />
        <R x={28} y={46} w={170} h={160} i={1} />
        <P d="M28,70 H198" i={2} />
        <R x={42} y={84} w={90} h={12} i={3} c="fa" rx={2} />
        <R x={42} y={104} w={142} h={44} i={4} c="fa" rx={2} />
        <R x={42} y={158} w={64} h={34} i={5} c="fa" rx={2} />
        <R x={120} y={158} w={64} h={34} i={5} c="ac" rx={2} />
        <P d="M206,126 H236 M230,120 L236,126 L230,132" i={6} />
        <P d="M286,84 L322,114 L286,144 L250,114 Z" i={7} />
        <T x={286} y={118} i={8}>new lead?</T>
        <P d="M322,114 H360 V150" i={9} c="ac" />
        <R x={330} y={150} w={60} h={30} i={10} />
        <T x={360} y={169} i={11}>notify</T>
        <P d="M286,144 V176" i={9} />
        <P d="M262,184 C262,176 310,176 310,184 V214 C310,222 262,222 262,214 Z M262,184 C262,192 310,192 310,184" i={10} />
        <T x={286} y={238} i={11}>records</T>
      </>
    ),
  },
  build: {
    caption: "In practical stages",
    art: (
      <>
        <P d="M10,196 H390" i={0} c="fa" />
        <P d="M70,196 V132 M90,196 V132 M200,196 V132 M220,196 V132 M330,196 V132 M310,196 V132" i={1} />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => (
          <R key={k} x={40 + k * 24} y={118} w={20} h={14} i={2 + k * 0.5} rx={1} c={k > 6 ? "fa" : "ln"} />
        ))}
        <P d="M262,118 h20 v14 h-20 z" i={7} c="fa" dash />
        <P d="M300,24 V60 M300,24 H180 M180,24 V40" i={8} c="fa" />
        <P d="M300,60 V84" i={9} c="ac" />
        <R x={288} y={84} w={24} h={14} i={10} c="ac" rx={1} />
        <P d="M58,98 l6,6 l12,-14" i={11} c="ac" />
        <P d="M150,98 l6,6 l12,-14" i={11.5} c="ac" />
        <T x={70} y={226} i={12}>stage one</T>
        <T x={160} y={226} i={12}>stage two</T>
        <T x={290} y={226} i={12}>stage three</T>
      </>
    ),
  },
  launch: {
    caption: "Into daily use",
    art: (
      <>
        <P d="M10,170 C30,150 60,146 80,150 L80,196 H10 Z" i={0} />
        <P d="M320,150 C340,146 370,150 390,170 V196 H320 Z" i={0} />
        <P d="M80,150 H320" i={1} />
        <P d="M80,150 C130,212 150,212 200,150 C250,212 270,212 320,150" i={2} />
        <P d="M44,138 C120,118 280,118 356,138" i={3} c="ac thick" />
        <P d="M346,130 L358,138 L346,146" i={4} c="ac" />
        <P d="M356,140 V74 M356,74 H386 L378,82 L386,90 H356" i={5} />
        <T x={371} y={108} i={6}>live</T>
        <R x={36} y={40} w={88} h={56} i={7} c="fa" />
        <P d="M48,84 V72 M62,84 V62 M76,84 V66 M90,84 V54 M104,84 V58" i={8} />
        <T x={80} y={30} i={9}>analytics on</T>
        <T x={200} y={238} i={9}>people using it</T>
      </>
    ),
  },
  improve: {
    caption: "Learn from real use",
    art: (
      <>
        <P d="M120,58 A70,70 0 1 1 64,170" i={0} c="ac thick" />
        <P d="M54,156 L64,172 L80,164" i={1} c="ac" />
        <T x={130} y={104} i={2}>use</T>
        <T x={164} y={138} i={3}>review</T>
        <T x={124} y={170} i={4}>refine</T>
        <P d="M236,200 H390 M236,200 V60" i={5} c="fa" />
        <P d="M240,180 C266,176 276,150 300,152 C324,154 330,118 352,112 C368,108 376,92 388,84" i={6} />
        <C x={300} y={152} r={5} i={7} c="ac" />
        <C x={352} y={112} r={5} i={8} c="ac" />
        <P d="M300,146 V100 H272" i={9} c="fa" dash />
        <T x={268} y={92} i={10} a="end">what people do</T>
        <T x={312} y={226} i={10}>what the team learns</T>
      </>
    ),
  },
};

export function StopPlan({ id, index }: { id: string; index: string }) {
  const plan = PLANS[id];
  if (!plan) return null;
  return (
    <figure className="pj-plan" aria-hidden="true">
      <div className="pj-plan__bar">
        <span>Plan {index}</span>
        <span>{plan.caption}</span>
      </div>
      <svg viewBox="0 0 400 250" focusable="false">
        {plan.art}
      </svg>
    </figure>
  );
}
