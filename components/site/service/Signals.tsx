import type { IslandId } from "@/lib/content";

/**
 * One signature diagram per island, drawn in the hero's front depth plane.
 * Purely illustrative: no numbers, no product screenshots. The rest state of
 * every diagram is its finished state, so without JS (or with reduced motion)
 * the picture is complete; ServiceMotion only animates towards it.
 */

/* ---- Win the customer: search → page → enquiry ------------------------ */

export const WIN_ROUTE = "M 290 67 C 372 67 420 92 420 140 L 382 297 C 382 380 352 438 300 438";

function WinSignal() {
  return (
    <svg className="svx-sig svx-sig--win" viewBox="0 0 560 520" fill="none">
      <path className="svx-sig__track" d={WIN_ROUTE} />
      <path className="svx-sig__route" d={WIN_ROUTE} />
      <g className="svx-sig__dot" transform="translate(300 438)">
        <circle className="svx-sig__halo" r="16" />
        <circle r="6.5" />
      </g>

      <g className="svx-card" data-float="0">
        <text className="svx-sig__label" x="26" y="26">
          01 · Search
        </text>
        <rect className="svx-card__bg" x="20" y="40" width="270" height="54" rx="27" />
        <circle className="svx-card__ink-stroke" cx="52" cy="64" r="8.5" />
        <path className="svx-card__ink-stroke" d="M58 70l7 7" />
        <text className="svx-card__mono" x="76" y="71">
          your service + city
        </text>
        <rect className="svx-sig__caret" x="262" y="55" width="2" height="18" />
      </g>

      <g className="svx-card" data-float="1">
        <text className="svx-sig__label" x="312" y="126">
          02 · Page
        </text>
        <rect className="svx-card__bg" x="310" y="140" width="220" height="196" rx="12" />
        <rect className="svx-card__ink" x="332" y="166" width="150" height="13" rx="6.5" />
        <rect className="svx-card__ink" x="332" y="186" width="104" height="13" rx="6.5" />
        <rect className="svx-card__faint" x="332" y="216" width="172" height="6" rx="3" />
        <rect className="svx-card__faint" x="332" y="230" width="160" height="6" rx="3" />
        <rect className="svx-card__faint" x="332" y="244" width="118" height="6" rx="3" />
        <rect className="svx-card__rust" x="332" y="280" width="104" height="34" rx="17" />
        <text className="svx-card__btn" x="384" y="302" textAnchor="middle">
          Enquire
        </text>
      </g>

      <g className="svx-card" data-float="2">
        <text className="svx-sig__label" x="42" y="378">
          03 · Enquiry
        </text>
        <rect className="svx-card__bg" x="40" y="390" width="260" height="96" rx="12" />
        <rect className="svx-card__ink-stroke" x="62" y="420" width="40" height="30" rx="4" />
        <path className="svx-card__ink-stroke" d="M63 422l19 15 19-15" />
        <text className="svx-card__title" x="118" y="433">
          New enquiry
        </text>
        <text className="svx-card__mono svx-card__mono--faint" x="118" y="456">
          name · need
        </text>
        <circle className="svx-sig__ping" cx="276" cy="414" r="5" />
      </g>
    </svg>
  );
}

/* ---- Run the work: tasks circulating between tools -------------------- */

export const RUN_RING =
  "M 108 108 C 230 46 330 46 452 92 C 524 186 522 288 468 380 C 344 452 232 452 112 410 C 46 310 46 206 108 108 Z";

const RUN_NODES = [
  { x: 60, y: 60, label: "Form", glyph: "form" },
  { x: 404, y: 44, label: "CRM", glyph: "crm" },
  { x: 420, y: 332, label: "Accounts", glyph: "ledger" },
  { x: 64, y: 362, label: "Your team", glyph: "team" },
] as const;

function Glyph({ kind }: { kind: (typeof RUN_NODES)[number]["glyph"] }) {
  switch (kind) {
    case "form":
      return (
        <>
          <rect className="svx-card__faint" x="22" y="24" width="52" height="8" rx="4" />
          <rect className="svx-card__faint" x="22" y="40" width="52" height="8" rx="4" />
          <rect className="svx-card__rust" x="22" y="58" width="30" height="14" rx="7" />
        </>
      );
    case "crm":
      return (
        <>
          <circle className="svx-card__ink-stroke" cx="48" cy="38" r="10" />
          <path className="svx-card__ink-stroke" d="M28 72c2-12 10-18 20-18s18 6 20 18" />
          <circle className="svx-card__rust" cx="70" cy="28" r="5" />
        </>
      );
    case "ledger":
      return (
        <>
          <path className="svx-card__ink-stroke" d="M22 30h52M22 46h52M22 62h52M58 22v48" />
          <path className="svx-card__rust-stroke" d="M62 42l4 4 6-8" />
        </>
      );
    case "team":
      return (
        <>
          <circle className="svx-card__ink-stroke" cx="38" cy="40" r="8" />
          <circle className="svx-card__ink-stroke" cx="60" cy="40" r="8" />
          <path className="svx-card__ink-stroke" d="M24 70c2-9 7-14 14-14s12 5 14 14M46 70c2-9 7-14 14-14s12 5 14 14" />
        </>
      );
  }
}

const TOKEN_REST = ["translate(280 64)", "translate(505 235)", "translate(290 437)"];

function RunSignal() {
  return (
    <svg className="svx-sig svx-sig--run" viewBox="0 0 560 520" fill="none">
      <path className="svx-sig__track" d={RUN_RING} />
      <path className="svx-sig__route" d={RUN_RING} />
      {RUN_NODES.map((node, i) => (
        <g key={node.label} className="svx-card svx-node" data-float={i} transform={`translate(${node.x} ${node.y})`}>
          <rect className="svx-card__bg" width="96" height="96" rx="20" />
          <Glyph kind={node.glyph} />
          <text className="svx-sig__label" x="48" y="118" textAnchor="middle">
            {node.label}
          </text>
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i} className="svx-token" transform={TOKEN_REST[i]}>
          <rect className="svx-token__bg" x="-19" y="-12" width="38" height="24" rx="5" />
          <rect className="svx-card__rust" x="-19" y="-12" width="6" height="24" rx="2" />
          <rect className="svx-card__faint" x="-8" y="-5" width="20" height="4" rx="2" />
          <rect className="svx-card__faint" x="-8" y="2" width="13" height="4" rx="2" />
        </g>
      ))}
    </svg>
  );
}

/* ---- See the numbers: exports assembling into one report -------------- */

export const SEE_BARS = [52, 78, 66, 104, 90, 122, 112];

const SEE_SHEETS = [
  { label: "sales.csv", dx: -150, dy: -110, r: -14 },
  { label: "ads.xlsx", dx: 170, dy: -120, r: 11 },
  { label: "crm.csv", dx: -170, dy: 150, r: 9 },
  { label: "invoices.pdf", dx: 190, dy: 130, r: -10 },
  { label: "Re: numbers?", dx: 10, dy: 220, r: 5 },
];

function SeeSignal() {
  return (
    <svg className="svx-sig svx-sig--see" viewBox="0 0 560 520" fill="none">
      {SEE_SHEETS.map((sheet, i) => (
        <g
          key={sheet.label}
          className="svx-sheet"
          data-dx={sheet.dx}
          data-dy={sheet.dy}
          data-r={sheet.r}
          transform={`translate(${150 - i * 3} ${160 - i * 3})`}
        >
          <g className="svx-sheet__body">
            <rect className="svx-sheet__bg" width="128" height="84" rx="7" />
            <text className="svx-card__mono" x="12" y="26">
              {sheet.label}
            </text>
            <rect className="svx-card__faint" x="12" y="36" width="96" height="5" rx="2.5" />
            <rect className="svx-card__faint" x="12" y="48" width="80" height="5" rx="2.5" />
            <rect className="svx-card__faint" x="12" y="60" width="88" height="5" rx="2.5" />
          </g>
        </g>
      ))}

      <g className="svx-card svx-report">
        <rect className="svx-card__bg" x="140" y="150" width="300" height="236" rx="14" />
        <text className="svx-card__mono svx-card__mono--faint" x="164" y="180">
          One report
        </text>
        <circle className="svx-sig__ping" cx="414" cy="176" r="5" />
        <path className="svx-card__line" d="M164 352h252" />
        {SEE_BARS.map((h, i) => (
          <rect
            key={i}
            className={i === SEE_BARS.length - 1 ? "svx-bar svx-card__rust" : "svx-bar svx-card__pine"}
            x={168 + i * 35}
            y={352 - h}
            width="24"
            height={h}
            rx="3"
          />
        ))}
        <path
          className="svx-sig__trend"
          d="M180 284 L215 262 L250 272 L285 236 L320 246 L355 214 L390 222"
        />
      </g>
    </svg>
  );
}

export function Signal({ island }: { island: IslandId }) {
  if (island === "run") return <RunSignal />;
  if (island === "see") return <SeeSignal />;
  return <WinSignal />;
}
